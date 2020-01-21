import {get as _get} from 'lodash';
import {IGqlRequest} from "./IGqlRequest";
import {Frequency, Operation, ServerType} from "../models/types";
import {
    DataSetTemplate,
    IChartData,
    SingleDataSource,
    WidgetTemplate,
    TSPoint,
    ReportPoint,
    Point,
    ProfilePoint,
    AggregationDataSource, TableRow, DimensionFilter
} from "../interfaces";
import {serializers} from '.';
import * as stringifyObject from 'stringify-object';

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

    private getPeriod(dataSet: DataSetTemplate): string {
        let period = '';
        if (dataSet.period) {
            period = `period: "${dataSet.period}"`;
        } else {
            period = `from: "${dataSet.from}"
                      to: "${dataSet.to}"`;
        }
        return period;
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
            from: template.dataSets[0].from,
            to: template.dataSets[0].to,
            frequency: template.dataSets[0].frequency,
            preFrequency: template.dataSets[0].preFrequency,
            dataSets: template.dataSets,
            data: [],
            settings: _get(template, 'settings', {})
        };
        // Заполняем обязательные поля, если они пустые или их нет
        console.log("TEMPALTETITLE", template.title);
        const title = _get(template, 'settings.title', '') || template.title;
        if (!_get(data.settings, 'title')) {
            data.settings.title = title;
        }

        // NOTE: idx - Сохраняем порядок dataSet
        const promises = template.dataSets.map(async (item, idx) => {
            switch (item.viewType) {
                case "DYNAMIC":
                    data.data[idx] = await this.loadDynamicData(item, template.server);
                    break;
                case "REPORT":
                    data.data[idx] = await this.loadReportData(item, template.server);
                    break;
                case "STATIC":
                    data.data[idx] = await this.loadStaticData(item, template.server);
                    break;
                case 'TABLE':
                    data.data[idx] = await this.loadTableData(item, template.server);
                    break;
                case "PROFILE":
                    data.data[idx] = await this.loadProfileData(item, template.server);
                    break;
                case "DISTRIBUTION":
                    data.data[idx] = await this.loadDistribution(item, template.server);
                    break;
            }
        });
        // Асинхронно загружаем все данные
        await Promise.all(promises);

        console.log('Load template data', data.data);
        return data;
    }

    /**
     * Загрузка данных для шаблона
     */
    private async loadDynamicData(dataSet: DataSetTemplate, server: ServerType): Promise<TSPoint[]> {
        return await axios.post(this.gqlLink, this.serializeDynamicGQL(dataSet, server))
            .then(
                response => _get(response.data, 'data.getSingleTimeSeries', []),
                error => { throw error; }
            );
    }

    private async loadTableData(dataSet: DataSetTemplate, server: ServerType): Promise<TableRow[]> {
        return await axios.post(this.gqlLink, this.serializeTableGQL(dataSet, server))
            .then(
                response => _get(response.data, 'data.getTableData', []),
                error => { throw error; }
            );
    }

    private async loadReportData(dataSet: DataSetTemplate, server: ServerType): Promise<ReportPoint> {
        return await axios.post(this.gqlLink, this.serializeReportGQL(dataSet, server))
            .then(
                response => _get(response.data, 'data.getReport', []),
                error => { throw error; }
            );
    }

    private async loadStaticData(dataSet: DataSetTemplate, server: ServerType): Promise<Point[]> {
        return await axios.post(this.gqlLink, this.serializeStaticGQL(dataSet, server))
            .then(
                response => _get(response.data, 'data.getStatic', []),
                error => { throw error; }
            );
    }

    private async loadProfileData(dataSet: DataSetTemplate, server: ServerType): Promise<ProfilePoint[]> {
        return await axios.post(this.gqlLink, this.serializeProfileGQL(dataSet, server))
            .then(
                response => _get(response.data, 'data.getProfile', []),
                error => { throw error; }
            );
    }

    private async loadDistribution(dataSet: DataSetTemplate, server: ServerType): Promise<ProfilePoint[]> {
        return await axios.post(this.gqlLink, this.serializeDistributionGQL(dataSet, server))
            .then(
                response => _get(response.data, 'data.getDistribution', []),
                error => { throw error; }
            );
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

    private serializeTableGQL(dataSet: DataSetTemplate, server: ServerType): IGqlRequest | null {
        let dataSource = '{}';
        let dimensions: DimensionFilter[] = [];
        switch (dataSet.dataSource1.type) {
            case "SINGLE":
                const singleDataSource: SingleDataSource = dataSet.dataSource1 as SingleDataSource;
                dataSource = (new serializers.TableDataSourceSerializer()).serialize(
                    singleDataSource
                );
                dimensions = singleDataSource.dimensions;
                break;

            case "AGGREGATION":
                dataSource = (new serializers.AggregationDataSourceSerializer()).serialize(
                    dataSet.dataSource1 as AggregationDataSource
                );
                break;
        }

        const dimensionsJson: string = stringifyObject(dimensions, {
            indent: ' ',
            singleQuotes: false
        }).replace(/\n/g, '');

        // FIXME тестовые данные, надо убрать
        const dataSetTemplates: string = `[{
            preFrequency: HOUR,
            operation: SUM,
            dataSource1: {
                type: SINGLE,
                name: "kpi-traffic",
                metric: {
                    name: "value"
                }
            }
        }, {
            preFrequency: DAY,
            operation: SUM,
            dataSource1: {
                type: SINGLE,
                name: "kpi-traffic",
                metric: {
                    name: "value_2",
                    expression: "value / count"
                }
            }
        }, {
            preFrequency: HOUR,
            operation: SUM,
            dataSource1: {
                type: SINGLE,
                name: "kpi-traffic",
                metric: {
                    name: "value_3",
                    expression: "count / value"
                }
            }
        }]`;

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
}
