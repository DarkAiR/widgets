import {WidgetConfig} from "../models/widgetConfig";
import {DataSetTemplate, SingleDataSource, WidgetTemplate} from "../interfaces";
import {get as _get, forEach as _forEach} from 'lodash';
import {IGqlRequest} from "./IGqlRequest";
import {IChartData} from "../interfaces/IChartData";
import * as stringifyObject from 'stringify-object';
import {SingleTimeSeriesValue} from "../interfaces/template/singleTimeSeriesValue";

const axios = require('axios');

export class DataProvider {
    private get gqlLink(): string {
        return 'http://34.83.209.150:8080/graphql';
    }

    private get templatesLink(): string {
        return 'http://34.83.209.150:8080/api/v1/templates';
    }

    async getData(config: WidgetConfig): Promise<IChartData> {
        const template: WidgetTemplate = await this.getTemplate(config.templateId);
        console.log('Load template', template);
        return await this.parseTemplate(template);
    }

    private async getTemplate(templateId: string): Promise<WidgetTemplate> {
        try {
            const response = await axios.get(this.templatesLink + '/' + templateId);
            return response.data;
        } catch (error) {
            console.error(_get(error, 'response.data.message'));
        }
    }

    private async parseTemplate(template: WidgetTemplate): Promise<IChartData | null> {
        if (_get(template, 'dataSets', null) === null  ||  !template.dataSets.length) {
            return null;
        }
        const data: IChartData = {
            title: template.title,
            from: template.dataSets[0].from,
            to: template.dataSets[0].from,
            frequency: template.dataSets[0].frequency,
            preFrequency: template.dataSets[0].preFrequency,
            data: []
        };

        switch (template.viewType) {
            case "DYNAMIC":
                // Асинхронно загружаем все данные
                const promises = template.dataSets.map(async (item, idx) => {
                    // Сохраняем порядок dataSet
                    data.data[idx] = {
                        style: {
                            color: item.style.color
                        },
                        values: await this.loadData(item)
                    };
                });
                await Promise.all(promises);
                break;
        }

        console.log('Load template data', data.data);
        return data;
/*
            this.selectedTemplate = template;
            this.period           = HRDate.getPeriod(_.get(template, 'dataSets[0].from'), _.get(template, 'dataSets[0].to'));
            this.selectedDate     = moment(_.get(template, 'dataSets[0].from'));
            this.selectedTime     = HRDate.time(this.period, this.selectedDate);
            this.isCurrentDate    = this.selectedDate.isSame(this.currentDate, this.period);
            this.viewType         = _.get(template, 'dataSets[0].viewType');

            if (this.viewType === 'STATIC') {
                this.KPIx = _.get(template, 'dataSets[0].dataSource1.name');
                this.KPIy = _.get(template, 'dataSets[0].dataSource2.name');
            }

            this.timeInterval.controls['startDate'].setValue(moment(_.get(template, 'dataSets[0].from')));
            this.timeInterval.controls['endDate'].setValue(moment(_.get(template, 'dataSets[0].to')));

            this.syncView().setDates();

            this.resources    = [];
            this.frequency    = _.get(template, 'dataSets[0].frequency').toLowerCase();
            this.preFrequency = _.get(template, 'dataSets[0].preFrequency').toLowerCase();

            _.forEach(_.get(template, 'dataSets'), e => {
                const resource = Resource.create();

                resource.controls['startDate'].setValue(moment(e['from']));
                resource.controls['endDate'].setValue(moment(e['to']));
                resource.controls['frequency'].setValue(e['frequency'].toLowerCase());
                resource.controls['preFrequency'].setValue(e['preFrequency'].toLowerCase());
                resource.controls['method'].setValue(e['operation']);
                resource.controls['color'].setValue(this.getColorByHex(_.get(e, 'style.color', null)));
                resource.controls['months'].setValue(e['months']);
                resource.controls['weekdays'].setValue(e['weekdays']);
                resource.controls['hours'].setValue(e['hours']);
                resource.controls['drawingType'].setValue(e['chartType']);
                resource.controls['numberOfBeans'].setValue(e['numberOfBeans']);

                let o, dimensions, _embedded, name, values;

                switch (this.viewType) {
                    case 'DYNAMIC':
                    case 'PROFILE':
                    case 'DISTRIBUTION':
                        const dataSource = _.find(this.dataSources, ['value', _.get(e, 'dataSource1.name')]);

                        name       = _.get(e, 'dataSource1.name');
                        values     = _.get(e, `dataSource1.dimensions`);
                        dimensions = dataSource.dimensions;
                        _embedded  = dataSource._embedded;
                        break;

                    case 'STATIC':
                        const x = _.find(this.dataSources, ['value', this.KPIx]),
                            y = _.find(this.dataSources, ['value', this.KPIy]);

                        name       = 'ANY';
                        values     = _.assign(_.get(e, `dataSource1.dimensions`), _.get(e, `dataSource2.dimensions`));
                        dimensions = _.uniq(_.concat(x.dimensions, y.dimensions));
                        _embedded  = _.assign(x._embedded, y._embedded);
                        break;

                    case 'MAP':
                        break;
                }

                o = {
                    value     : new FormControl(name, Validators.required),
                    dimensions: new FormControl(dimensions),
                    _embedded : new FormControl(_embedded)
                };

                const valuesArr = [];
                values.map(v => {
                    valuesArr[v.name] = v.values;
                });
                _.forEach(dimensions, dimension => {
                    o[dimension] = new FormControl(
                        valuesArr[dimension],
                        [Validators.required, Validators.minLength(1)]
                    );
                });

                resource.controls['dataSource'].setValue(new FormGroup(o));

                this.resources.push(resource);
            });

            return this.inflate();
*/
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
        // Пока только SINGLE
        if (dataSet.dataSource1.type !== 'SINGLE') {
            return null;
        }

        const dataSource1 = <SingleDataSource>dataSet.dataSource1;
        let dimensionsJson: string = '{}';
        switch (dataSet.viewType) {
            case 'DYNAMIC':
            case 'DISTRIBUTION':
            case 'PROFILE':
                dimensionsJson = stringifyObject(dataSource1.dimensions, {
                    indent: ' ',
                    singleQuotes: false
                }).replace(/\n/g, '');
                break;
            case "REPORT":
            case "STATIC":
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
    dataSource1: {
        type      : SINGLE,
        name      : "${dataSource1.name}",
        dimensions: ${dimensionsJson}
    }
}){
    orgUnits { name }
    value
    localDateTime
}}`
        };
    }
}
