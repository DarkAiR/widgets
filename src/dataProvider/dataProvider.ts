import {DataSetTemplate, IChartData, WidgetTemplate} from "../interfaces";
import {get as _get, forEach as _forEach} from 'lodash';
import {IGqlRequest} from "./IGqlRequest";
import {SingleTimeSeriesValue} from "../interfaces/template/singleTimeSeriesValue";
import {SingleDataSourceSerializer} from "./dataSourceSerializers/singleDataSourceSerializer";
import {AggregationDataSourceSerializer} from "./dataSourceSerializers/aggregationDataSourceSerializer";
import {WidgetConfig} from "../models/widgetConfig";

const axios = require('axios');

interface zxc {
    [propName: string]: any;
}
interface qwe extends zxc{
    a: string;
    b: string;
}

export class DataProvider {
    private get gqlLink(): string {
        return 'http://34.83.209.150:8080/graphql';
    }

    private get templatesLink(): string {
        return 'http://34.83.209.150:8080/api/v1/templates';
    }

    public async getTemplate(templateId: string): Promise<WidgetTemplate> {
        let v1: qwe;
        v1 = {a: 'zxc', b:'zxc', c:'asdasd'};
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
        let title = _get(template, 'settings.title', '');
        if (!title) {
            title = template.title;
        }
        const data: IChartData = {
            title: title,
            from: template.dataSets[0].from,
            to: template.dataSets[0].from,
            frequency: template.dataSets[0].frequency,
            preFrequency: template.dataSets[0].preFrequency,
            settings: _get(template, 'settings', {}),
            data: []
        };

        switch (template.viewType) {
            case "DYNAMIC":
                // Асинхронно загружаем все данные
                const promises = template.dataSets.map(async (item, idx) => {
                    // Сохраняем порядок dataSet
                    data.data[idx] = {
                        values: await this.loadData(item)
                    };
                    Object.assign(data.data[idx], _get(item, 'settings', {}));
                });
                await Promise.all(promises);
                break;
        }

        console.log('Load template data', data.data);
        return data;
    }

    /**
     * Загрузка данных для шаблона
     */
    private async loadData(dataSet: DataSetTemplate): Promise<Array<SingleTimeSeriesValue>> {
        return await axios.post(this.gqlLink, this.serializeGQL(dataSet))
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

    private serializeGQL(dataSet: DataSetTemplate): IGqlRequest | null {
        let dataSource = '{}';
        switch (dataSet.dataSource1.type) {
            case "SINGLE":
                dataSource = (new SingleDataSourceSerializer()).serialize(dataSet);
                break;
            case "AGGREGATION":
                dataSource = (new AggregationDataSourceSerializer()).serialize(dataSet);
                break;
        }

        return {
            operationName: null,
            variables: {},
            query: `
{getSingleTimeSeries(dataSet: {
    from: "${dataSet.from}"
    to: "${dataSet.to}"
    frequency: ${dataSet.frequency}
    preFrequency: ${dataSet.preFrequency}
    operation: ${dataSet.operation}
    dataSource1: ${dataSource}
}){
    orgUnits { name }
    value
    localDateTime
}}`
        };
    }
}
