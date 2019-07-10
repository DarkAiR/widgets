import {WidgetConfig} from "..";
import {WidgetTemplate} from "../interfaces";
import {get as _get} from 'lodash';
// import {HRDate} from "../../../svc_analytics/front/src/app/hr-date";
// import * as moment from "../../../svc_analytics/front/src/app/charts/charts.component";
// import {Resource} from "../../../svc_analytics/front/src/app/resource";

const axios = require('axios');

export class DataProvider {
    private get templatesLink(): string {
        return 'http://34.83.209.150:8080/api/v1/templates';
    }

    getData(config: WidgetConfig) {
        this.getTemplate(config.templateId).then((template: WidgetTemplate) => {
            console.log(template);
            this.parseTemplate(template);
        });
    }

    private async getTemplate(templateId: string): Promise<WidgetTemplate> {
        try {
            const response = await axios.get(this.templatesLink + '/' + templateId);
            return response.data;
        } catch (error) {
            console.error(_get(error, 'response.data.message'));
        }
    }

    private parseTemplate(template: WidgetTemplate): void {
/*            if (!template) {
                return this;
            }

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
}
