import 'whatwg-fetch';
import {get as _get, defaultTo as _defaultTo, cloneDeep as _cloneDeep} from 'lodash';
import {IGqlRequest} from "./IGqlRequest";
import {ServerType, ViewType, WidgetType} from "../models/types";
import {
    IChartData,
    WidgetTemplate,
    DataSet,
    DataSetTemplate,
    JoinDataSetTemplate,
    TimeSeriesDataSetShort, DataSource
} from "../interfaces";
import {serializers} from '.';
import * as stringifyObject from 'stringify-object';
import {IObject} from "../interfaces/IObject";
import {TypeGuardsHelper} from "../helpers";

type SerializeFunc = (dataSet: DataSet, server: ServerType, widgetType: WidgetType, hasEntity: boolean) => IGqlRequest | null;

export class DataProvider {
    private apiUrl: string;

    private get gqlLink(): string {
        return (this.apiUrl || 'http://localhost') + '/graphql';
    }

    private get templatesLink(): string {
        return (this.apiUrl || 'http://localhost') + '/api/v1/templates';
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

    public async parseTemplate(template: WidgetTemplate, hasEntity: boolean = false): Promise<IChartData | null> {
        if (_get(template, 'dataSets', null) === null  ||  !template.dataSets.length) {
            return null;
        }
        const data: IChartData = {
            dataSets: template.dataSets,        // Копируется ссылка, поэтому можно менять dataSets и ничего не потеряется
            data: [],
            settings: _defaultTo(_get(template, 'settings'), {})
        };

        const loadData: Record<ViewType, {
            serializeFunc: SerializeFunc,
            resultProp: string,
            hasEntity?: boolean
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
                resultProp: 'data.getTableData',
                hasEntity: true
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
                    // Выбор типа item автоматически в фции сериализации
                    loadData[item.viewType].serializeFunc.call(this, item, template.server, template.widgetType, loadData[item.viewType].hasEntity ?? hasEntity)
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
                .then((resp: IObject) => _defaultTo(_get(resp, loadData[item.viewType].resultProp), []))
                .catch((error: Error) => { throw error; });
        });
        // Асинхронно загружаем все данные
        await Promise.all(promises);

        return data;
    }

    private serializeDataSource(dataSource: DataSource): string {
        if (TypeGuardsHelper.isSingleDataSource(dataSource)) {
            return serializers.SingleDataSourceSerializer.serialize(dataSource);
        }
        if (TypeGuardsHelper.isAggregationDataSource(dataSource)) {
            return serializers.AggregationDataSourceSerializer.serialize(dataSource);
        }
        return '{}';
    }

    private serializeDynamicGQL(dataSet: DataSetTemplate, server: ServerType, widgetType: WidgetType, hasEntity: boolean): IGqlRequest | null {
        const dataSource = this.serializeDataSource(dataSet.dataSource1);

        // NOTE: Типизировать возвращаемые данные не получится, т.к. не все поля являются строками
        //       Нр, frequency: HOUR, а значит, что не получится их сохранять в объекте и сериализовать
        //       потому что не получится отличить поле, которое должно быть обернуто в кавычки от других
        let dimensions: string = '';
        switch (widgetType) {
            case 'CATEGORY':
                dimensions = `dimensions { name value ${hasEntity ? 'entity {name, outerId}' : ''}}`;
                break;
            default:
                dimensions = hasEntity ? 'dimensions { entity {name, outerId} }' : '';
                break;
        }
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
                    ${dimensions}
                }}`
        };
    }

    private serializeTableGQL(dataSet: JoinDataSetTemplate, server: ServerType, widgetType: WidgetType, hasEntity: boolean): IGqlRequest | null {
        const dataSetArr: string[] = [];

        dataSet.dataSetTemplates.forEach((v: TimeSeriesDataSetShort) => {
            const dataSource = this.serializeDataSource(v.dataSource1);

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
                    dimensions { name value ${hasEntity ? 'entity {name, outerId}' : ''}}
                    metrics { name value }
                }}`
        };
    }

    private serializeReportGQL(dataSet: DataSetTemplate, server: ServerType, widgetType: WidgetType, hasEntity: boolean): IGqlRequest | null {
        const dataSource1 = this.serializeDataSource(dataSet.dataSource1);
        const dataSource2 = this.serializeDataSource(dataSet.dataSource2);

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
                    ${hasEntity ? 'dimensions { entity {name, outerId} }' : ''}
                }}`
        };
    }

    private serializeStaticGQL(dataSet: DataSetTemplate, server: ServerType, widgetType: WidgetType, hasEntity: boolean): IGqlRequest | null {
        const dataSource1 = this.serializeDataSource(dataSet.dataSource1);
        const dataSource2 = this.serializeDataSource(dataSet.dataSource2);

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
                    ${hasEntity ? 'dimensions { entity {name, outerId} }' : ''}
                }}`
        };
    }

    private serializeProfileGQL(dataSet: DataSetTemplate, server: ServerType, widgetType: WidgetType, hasEntity: boolean): IGqlRequest | null {
        const dataSource1 = this.serializeDataSource(dataSet.dataSource1);

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
                    ${hasEntity ? 'dimensions { entity {name, outerId} }' : ''}
                }}`
        };
    }

    private serializeDistributionGQL(dataSet: DataSetTemplate, server: ServerType, widgetType: WidgetType, hasEntity: boolean): IGqlRequest | null {
        const dataSource1 = this.serializeDataSource(dataSet.dataSource1);

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
                    ${hasEntity ? 'dimensions { entity {name, outerId} }' : ''}
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
