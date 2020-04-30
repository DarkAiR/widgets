import 'whatwg-fetch';
import {get as _get} from 'lodash';
import {IGqlRequest} from "./IGqlRequest";
import {ServerType, ViewType} from "../models/types";
import {
    IChartData,
    SingleDataSource,
    WidgetTemplate,
    DataSet,
    DataSetTemplate,
    JoinDataSetTemplate,
    TimeSeriesDataSetShort
} from "../interfaces";
import {serializers} from '.';
import * as stringifyObject from 'stringify-object';
import {IObject} from "../interfaces/IObject";
import {TypeGuardsHelper} from "../helpers";

export class DataProvider {
    private apiUrl: string;

    private get gqlLink(): string {
        return this.apiUrl || 'http://34.83.209.150:8080/graphql';
    }

    private get templatesLink(): string {
        return 'http://34.83.209.150:8080/api/v1/templates';
    }

    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;
    }

    public async getTemplate(templateId: string): Promise<WidgetTemplate> {
        const response = await fetch(this.templatesLink + '/' + templateId)
            .then((resp: Response) => {
                if (!resp.ok) {
                    throw new Error(resp.statusText);
                }
                return resp.json();
            })
            .catch((error: Error) => console.error(error.message));
        console.log('Load template', response);
        return response;
    }

    public async parseTemplate(template: WidgetTemplate): Promise<IChartData | null> {
        if (_get(template, 'dataSets', null) === null  ||  !template.dataSets.length) {
            return null;
        }
        const data: IChartData = {
            dataSets: template.dataSets,
            data: [],
            settings: _get(template, 'settings', {})
        };

        const loadData: Record<ViewType, {
            serializeFunc: Function,
            resultProp: string,
        }> = {
            'DYNAMIC': {
                serializeFunc: this.serializeDynamicGQL,
                resultProp: 'data.getSingleTimeSeries'
            },
            'STATIC': {
                serializeFunc: this.serializeStaticGQL,
                resultProp: 'data.getStatic'
            },
            'REPORT': {
                serializeFunc: this.serializeReportGQL,
                resultProp: 'data.getReport'
            },
            'TABLE': {
                serializeFunc: this.serializeTableGQL,
                resultProp: 'data.getTableData'
            },
            'DISTRIBUTION': {
                serializeFunc: this.serializeDistributionGQL,
                resultProp: 'data.getDistribution'
            },
            'PROFILE': {
                serializeFunc: this.serializeProfileGQL,
                resultProp: 'data.getProfile'
            }
        };

        // NOTE: idx - Сохраняем порядок dataSet
        const promises = template.dataSets.map(async (item: DataSet, idx: number) => {
            data.data[idx] = await fetch(this.gqlLink, {
                method: 'post',
                body: JSON.stringify(
                    loadData[item.viewType].serializeFunc.call(this, item, template.server)     // Выбор типа item автоматически в фции сериализации
                ),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then((resp: Response) => {
                    if (!resp.ok) {
                        throw new Error(resp.statusText);
                    }
                    return resp.json();
                })
                .then((resp: IObject) => _get(resp, loadData[item.viewType].resultProp, []))
                .catch((error: Error) => { throw error; });
        });
        // Асинхронно загружаем все данные
        await Promise.all(promises);

        return data;
    }

    private serializeDynamicGQL(dataSet: DataSetTemplate, server: ServerType): IGqlRequest | null {
        let dataSource = '{}';
        if (TypeGuardsHelper.isSingleDataSource(dataSet.dataSource1)) {
            dataSource = (new serializers.SingleDataSourceSerializer()).serialize(dataSet.dataSource1);
        }
        if (TypeGuardsHelper.isAggregationDataSource(dataSet.dataSource1)) {
            dataSource = (new serializers.AggregationDataSourceSerializer()).serialize(dataSet.dataSource1);
        }

        // NOTE: Типизировать возвращаемые данные не получится, т.к. не все поля являются строками
        //       Нр, frequency: HOUR, а значит, что не получится их сохранять в объекте и сериализовать
        //       потому что не получится отличить поле, которое должно быть обернуто в кавычки от других
        return {
            operationName: null,
            variables: {},
            query: `
                {getSingleTimeSeries(
                    server: "${server}"
                    dataSet: {
                        ${this.getPeriod(dataSet)}
                        frequency: ${dataSet.frequency}
                        preFrequency: ${dataSet.preFrequency}
                        operation: ${dataSet.operation}
                        dataSource1: ${dataSource}
                    }
                ){
                    value
                    localDateTime
                }}`
        };
    }

    private serializeTableGQL(dataSet: JoinDataSetTemplate, server: ServerType): IGqlRequest | null {
        const dataSetArr: string[] = [];

        dataSet.dataSetTemplates.forEach((v: TimeSeriesDataSetShort) => {
            let dataSource = '{}';
            if (TypeGuardsHelper.isSingleDataSource(v.dataSource1)) {
                dataSource = (new serializers.TableDataSourceSerializer()).serialize(v.dataSource1);
            }
            if (TypeGuardsHelper.isAggregationDataSource(v.dataSource1)) {
                dataSource = (new serializers.AggregationDataSourceSerializer()).serialize(v.dataSource1);
            }

            dataSetArr.push(`{
                preFrequency: ${v.preFrequency},
                operation: ${v.operation},
                dataSource1: ${dataSource}
            }`);
        });

        const dimensionsJson: string = stringifyObject(dataSet.dimensions, {
            indent: ' ',
            singleQuotes: false
        }).replace(/\n/g, '');

        const dataSetTemplates: string = `[${dataSetArr.join(',')}]`;

        return {
            operationName: null,
            variables: {},
            query: `
                {getTableData(
                    server: "${server}"
                    dataSet: {
                        ${this.getPeriod(dataSet)}
                        frequency: ${dataSet.frequency}
                        dimensions: ${dimensionsJson}
                        dataSetTemplates: ${dataSetTemplates}
                    }
                ){
                    localDateTime
                    dimensions { name, value }
                    metrics { name, value }
                }}`
        };
    }

    private serializeReportGQL(dataSet: DataSetTemplate, server: ServerType): IGqlRequest | null {
        const serializer = new serializers.ReportDataSourceSerializer();
        const dataSource1 = serializer.serialize(dataSet.dataSource1 as SingleDataSource);
        const dataSource2 = serializer.serialize(dataSet.dataSource2 as SingleDataSource);
        return {
            operationName: null,
            variables: {},
            query: `
                {getReport(
                    server: "${server}"
                    dataSet: {
                        ${this.getPeriod(dataSet)},
                        frequency: ${dataSet.frequency}
                        preFrequency: ${dataSet.preFrequency}
                        operation: ${dataSet.operation}
                        methods: ["${dataSet.methods.join('", "')}"]
                        dataSource1: ${dataSource1}
                        dataSource2: ${dataSource2}
                    }
                ){
                    items {
                        key
                        value
                    }
                }}`
        };
    }

    private serializeStaticGQL(dataSet: DataSetTemplate, server: ServerType): IGqlRequest | null {
        const serializer = new serializers.StaticDataSourceSerializer();
        const dataSource1 = serializer.serialize(dataSet.dataSource1 as SingleDataSource);
        const dataSource2 = serializer.serialize(dataSet.dataSource2 as SingleDataSource);
        return {
            operationName: null,
            variables: {},
            query: `
                {getStatic(
                    server: "${server}",
                    dataSet: {
                        ${this.getPeriod(dataSet)}
                        frequency: ${dataSet.frequency}
                        preFrequency: ${dataSet.preFrequency}
                        operation: ${dataSet.operation}
                        dataSource1: ${dataSource1}
                        dataSource2: ${dataSource2}
                    }
                ){
                    xValue
                    yValue
                }}`
        };
    }

    private serializeProfileGQL(dataSet: DataSetTemplate, server: ServerType): IGqlRequest | null {
        const serializer = new serializers.ProfileDataSourceSerializer();
        const dataSource1 = serializer.serialize(dataSet.dataSource1 as SingleDataSource);
        return {
            operationName: null,
            variables: {},
            query: `
                {getProfile(
                    server: "${server}",
                    dataSet: {
                        ${this.getPeriod(dataSet)}
                        frequency: ${dataSet.frequency}
                        preFrequency: ${dataSet.preFrequency}
                        operation: ${dataSet.operation}
                        dataSource1: ${dataSource1}
                    }
                ){
                    value
                    xposition
                }}`
        };
    }

    private serializeDistributionGQL(dataSet: DataSetTemplate, server: ServerType): IGqlRequest | null {
        const serializer = new serializers.DistributionDataSourceSerializer();
        const dataSource1 = serializer.serialize(dataSet.dataSource1 as SingleDataSource);
        return {
            operationName: null,
            variables: {},
            query: `
                {getDistribution(
                    server: "${server}",
                    dataSet: {
                        ${this.getPeriod(dataSet)}
                        frequency: ${dataSet.frequency}
                        preFrequency: ${dataSet.preFrequency}
                        operation: ${dataSet.operation}
                        dataSource1: ${dataSource1}
                        numberOfBeans: ${dataSet.numberOfBeans}
                    }
                ){
                    value
                    xposition
                }}`
        };
    }

    private getPeriod(dataSet: DataSet): string {
        return dataSet.period
            ? `period: "${dataSet.period}"`
            : `from: "${dataSet.from}"
               to: "${dataSet.to}"`;
    }
}
