import {get as _get} from 'lodash';
import {IGqlRequest} from "./IGqlRequest";
import {ServerType, ViewType} from "../models/types";
import {
    IChartData,
    SingleDataSource,
    WidgetTemplate,
    AggregationDataSource,
    DataSet,
    DataSetTemplate,
    JoinDataSetTemplate,
    TimeSeriesDataSetShort
} from "../interfaces";
import {serializers} from '.';
import * as stringifyObject from 'stringify-object';
import {IObject} from "../interfaces/IObject";

const axios = require('axios');

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
        try {
            const response = await axios.get(this.templatesLink + '/' + templateId);
            console.log('Load template', response.data);
            return response.data;
        } catch (error) {
            console.error(_get(error, 'response.data.message'));
        }
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
        // Заполняем обязательные поля, если они пустые или их нет
        const title = _get(template, 'settings.title', '') || template.title;
        if (!_get(data.settings, 'title')) {
            data.settings.title = title;
        }

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
            data.data[idx] = await axios.post(
                this.gqlLink,
                loadData[item.viewType].serializeFunc.call(this, item, template.server)     // Выбор типа item автоматически в фции сериализации
            ).then(
                    (response: IObject) => _get(response.data, loadData[item.viewType].resultProp, []),
                    (error: Error) => { throw error; }
                );
        });
        // Асинхронно загружаем все данные
        await Promise.all(promises);

        return data;
    }

    private serializeDynamicGQL(dataSet: DataSetTemplate, server: ServerType): IGqlRequest | null {
        let dataSource = '{}';
        switch (dataSet.dataSource1.type) {
            case "SINGLE":
                dataSource = (new serializers.SingleDataSourceSerializer()).serialize(
                    dataSet.dataSource1 as SingleDataSource
                );
                break;

            case "AGGREGATION":
                dataSource = (new serializers.AggregationDataSourceSerializer()).serialize(
                    dataSet.dataSource1 as AggregationDataSource
                );
                break;
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
            switch (v.dataSource1.type) {
                case "SINGLE":
                    dataSource = (new serializers.TableDataSourceSerializer()).serialize(
                        v.dataSource1 as SingleDataSource
                    );
                    break;

                case "AGGREGATION":
                    dataSource = (new serializers.AggregationDataSourceSerializer()).serialize(
                        v.dataSource1 as AggregationDataSource
                    );
                    break;
            }
            // viewType = DYNAMIC, нужен для правильной работы серверной части
            dataSetArr.push(`{
                viewType: 'DYNAMIC',
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

        // FIXME тестовые данные, надо убрать
        // const dataSetTemplates: string = `[{
        //     preFrequency: HOUR,
        //     operation: SUM,
        //     dataSource1: {
        //         type: SINGLE,
        //         name: "kpi-traffic",
        //         metric: {
        //             name: "value"
        //         }
        //     }
        // }, {
        //     preFrequency: DAY,
        //     operation: SUM,
        //     dataSource1: {
        //         type: SINGLE,
        //         name: "kpi-traffic",
        //         metric: {
        //             name: "value_2",
        //             expression: "value / count"
        //         }
        //     }
        // }, {
        //     preFrequency: HOUR,
        //     operation: SUM,
        //     dataSource1: {
        //         type: SINGLE,
        //         name: "kpi-traffic",
        //         metric: {
        //             name: "value_3",
        //             expression: "count / value"
        //         }
        //     }
        // }]`;

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
                        methods: ["${dataSet.methods}"]
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
        let period = '';
        if (dataSet.period) {
            period = `period: "${dataSet.period}"`;
        } else {
            period = `from: "${dataSet.from}"
                      to: "${dataSet.to}"`;
        }
        return period;
    }
}
