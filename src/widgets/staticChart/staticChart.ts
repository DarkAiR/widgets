import s from '../../styles/_all.less';
import w from './staticChart.less';
import echarts from 'echarts';
import {EventBusEvent} from 'goodteditor-event-bus';

import {
    DataSetTemplate,
    IChartData,
    INameValue,
    IWidgetVariables,
    SingleDataSource
} from '../../interfaces';
import {StaticSettings} from './staticSettings';
import {
    get as _get, set as _set,
    forEach as _forEach,
    defaultTo as _defaultTo
} from 'lodash';
import {Chart} from '../../models/Chart';
import { Point } from '../../interfaces/template/Point';

export class StaticChart extends Chart {
    getVariables(): IWidgetVariables {
        const res: IWidgetVariables = {};
        const addVar = this.addVar(res);
        _forEach(this.config.template.dataSets, (v: DataSetTemplate, idx: number) => {
            const nameStr: string = v.dataSource1.type === 'SINGLE'  ? '(' + (<SingleDataSource>v.dataSource1).name + ')' : '';
            addVar(idx, 'period', 'Период', `${nameStr}: формат см. документацию по template-api`);
            addVar(idx, 'start date', 'Начало выборки', `${nameStr}: YYYY-mm-dd`);
            addVar(idx, 'finish date', 'Окончание выборки', `${nameStr}: YYYY-mm-dd`);
            addVar(idx, 'view type', 'Тип отображения', `${nameStr}: LINE | HISTOGRAM`);
            addVar(idx, 'frequency', 'Частота конечной агрегации', `${nameStr}: YEAR | MONTH | WEEK | DAY | HOUR | ALL`);
            addVar(idx, 'pre frequency', 'Частота выборки для которой выполняется операция, указанная в operation', `${nameStr}: YEAR | MONTH | WEEK | DAY | HOUR | ALL`);
            addVar(idx, 'operation', 'операция, которую необходимо выполнить при агрегации из preFrequency во frequency', `${nameStr}: SUM | AVG | MIN | MAX | DIVIDE`);
        });
        return res;
    }

    run(data: IChartData): void {
        console.log('%cStaticChart run', 'color: #ab0d05');
        const settings = <StaticSettings>data.settings;

        this.listen(this.onEventBus.bind(this));

        const str = `
            <div class='${s['widget']}  ${w['widget']}'>
                <div class='${w['row']}'>
                    <div class="${w['title']}">
                        ${settings.title}
                    </div>
                </div>
                <div class='${w['row']} ${w['chart']}'>
                </div>
            </div>
        `;
        this.config.element.innerHTML = str;

        const series: Object[] = this.getSeries(data.data as Point[][]);

        const options = {
            xAxis: {},
            yAxis: {},
            series: series
        };

        const el = this.config.element.getElementsByClassName(w['chart'])[0];
        const myChart = echarts.init(el);
        myChart.setOption(options);

        this.resize(this.config.element, (width, height) => {
            myChart.resize();
        });
    }

    private getSeries(data: Point[][]): Object[] {
        const series: Object[] = [];
        data.forEach((item: Point[], index) => {
            const seriesData = {
                symbolSize: 20,
                data: [],
                type: "scatter"
            };

            item.forEach((obj: Point) => {
                const pair = [obj.xValue, obj.yValue];
                seriesData.data.push(pair);
            });

            series.push(seriesData);
        });

        return series;
    }

    private onEventBus(ev: EventBusEvent, eventData: INameValue): void {
        console.log('StaticChart listenVariableChange:', ev, eventData);
        const res = /(.*?)(?: (\d*))?$/.exec(eventData.name);
        const varName: string = _defaultTo(_get(res, '1'), '');
        const varId: number = _defaultTo(_get(res, '2'), 0);

        const setVar = (id, prop, val) => {
            _set(this.config.template.dataSets[varId], prop, val);
            this.reload();
        };
        switch (varName) {
            case 'start date':
                setVar(varId, 'from', eventData.value);
                break;
            case 'finish date':
                setVar(varId, 'to', eventData.value);
                break;
            case 'period':
                setVar(varId, 'period', eventData.value);
                break;
            case 'view type':
                setVar(varId, 'chartType', eventData.value);
                break;
            case 'frequency':
                setVar(varId, 'frequency', eventData.value);
                break;
            case 'pre frequency':
                setVar(varId, 'preFrequency', eventData.value);
                break;
            case 'operation':
                setVar(varId, 'operation', eventData.value);
                break;
        }
    }
}
