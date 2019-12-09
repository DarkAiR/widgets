import {DataSetTemplate, IChartData, SingleDataSource, WidgetTemplate} from "../interfaces";
import {get as _get, forEach as _forEach} from 'lodash';
import {IGqlRequest} from "./IGqlRequest";
import {SingleTimeSeriesValue} from "../interfaces/template/singleTimeSeriesValue";
import {SingleDataSourceSerializer} from "./dataSourceSerializers/singleDataSourceSerializer";
import {AggregationDataSourceSerializer} from "./dataSourceSerializers/aggregationDataSourceSerializer";
import {ServerType} from "../models/types";

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
            from: template.dataSets[0].from,
            to: template.dataSets[0].from,
            frequency: template.dataSets[0].frequency,
            preFrequency: template.dataSets[0].preFrequency,
            dataSets: template.dataSets,
            data: [],
            settings: _get(template, 'settings', {})
        };
        // Заполняем обязательные поля, если они пустые или их нет
        const title = _get(template, 'settings.title', '') || template.title;
        if (!_get(data.settings, 'title')) {
            data.settings.title = title;
        }

        switch (template.viewType) {
            case "DYNAMIC":
                // Асинхронно загружаем все данные
                const promises = template.dataSets.map(async (item, idx) => {
                    // Сохраняем порядок dataSet
                    data.data[idx] = await this.loadData(item, template.server);
                });
                await Promise.all(promises);
                break;
            case "REPORT":
                const reportPromises = template.dataSets.map(async (item, idx) => {
                    // Сохраняем порядок dataSet
                    data.data[idx] = await this.loadReportData(item, template.server);
                });
                await Promise.all(reportPromises);
                break;
            case "STATIC":
                const staticPromises = template.dataSets.map(async (item, idx) => {
                    // Сохраняем порядок dataSet
                    data.data[idx] = await this.loadStaticData(item, template.server);
                });
                await Promise.all(staticPromises);
                break;
        }

        console.log('Load template data', data.data);
        return data;
    }

    /**
     * Загрузка данных для шаблона
     */
    private async loadData(dataSet: DataSetTemplate, server: ServerType): Promise<SingleTimeSeriesValue[]> {
        return await axios.post(this.gqlLink, this.serializeGQL(dataSet, server))
            .then(
                (response) => {
                    let data = response.data;
                    // todo hot fix
                    if (dataSet.viewType === 'DISTRIBUTION') {
                        data = _get(data, 'frequencyValues');
                    }
                    return _get(data, 'data.getSingleTimeSeries', []);
                },
                (error) => {
                    throw error;
                }
            );
    }
    private async loadReportData(dataSet: DataSetTemplate, server: ServerType): Promise<SingleTimeSeriesValue[]> {
        return await axios.post(this.gqlLink, this.serializeReportGQL(dataSet, server))
            .then(
                (response) => {
                    const data = response.data;
                    return _get(data, 'data.getReport', []);
                },
                (error) => {
                    throw error;
                }
            );
    }

    private async loadStaticData(dataSet: DataSetTemplate, server: ServerType): Promise<SingleTimeSeriesValue[]> {
        return await axios.post(this.gqlLink, this.serializeStaticGQL(dataSet, server))
            .then(
                (response) => {
                   const data = response.data;
                   return _get(data, 'data.getStatic', []);
                },
                (error) => {
                    throw error;
                }
            );
    }

    private serializeGQL(dataSet: DataSetTemplate, server: ServerType): IGqlRequest | null {
        let dataSource = '{}';
        switch (dataSet.dataSource1.type) {
            case "SINGLE":
                dataSource = (new SingleDataSourceSerializer()).serialize(dataSet);
                break;

            case "AGGREGATION":
                dataSource = (new AggregationDataSourceSerializer()).serialize(dataSet);
                break;
        }
        let period = '';
        if (dataSet.period) {
            period = `period: "${dataSet.period}"`;
        } else {
            period = `from: "${dataSet.from}"
                      to: "${dataSet.to}"`;
        }
        return {
            operationName: null,
            variables: {},
            query: `
                {getSingleTimeSeries(
                    server: "${server}"
                    dataSet: {
                        ${period}
                        frequency: ${dataSet.frequency}
                        preFrequency: ${dataSet.preFrequency}
                        operation: ${dataSet.operation}
                        dataSource1: ${dataSource}
                    }
                ){
                    orgUnits { name }
                    value
                    localDateTime
                }}`
        };
    }

    private serializeReportGQL(dataSet: DataSetTemplate, server: ServerType): IGqlRequest | null {
        const dataSource1 = (new SingleDataSourceSerializer()).serializeReport(dataSet.dataSource1 as SingleDataSource);
        const dataSource2 = (new SingleDataSourceSerializer()).serializeReport(dataSet.dataSource2 as SingleDataSource);
        return {
            operationName: null,
            variables: {},
            query: `
                {getReport(
                    server: "${server}"
                    dataSet: {
                        from: "${dataSet.from}"
                        to: "${dataSet.to}"
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
        const dataSource1 = (new SingleDataSourceSerializer()).serializeStatic(dataSet.dataSource1 as SingleDataSource);
        const dataSource2 = (new SingleDataSourceSerializer()).serializeStatic(dataSet.dataSource2 as SingleDataSource);
        return {
            operationName: null,
            variables: {},
            query: `
                {getStatic(
                    server: "${server}",
                    dataSet: {
                        from: "${dataSet.from}"
                        to: "${dataSet.to}"
                        frequency: ${dataSet.frequency}
                        preFrequency: ${dataSet.preFrequency}
                        operation: ${dataSet.operation}
                        dataSource1: ${dataSource1}
                        dataSource2: ${dataSource2}
                    }
                ){
                    orgUnits{outerId, name}
                    xValue
                    yValue
                }}`
        };
    }
}
