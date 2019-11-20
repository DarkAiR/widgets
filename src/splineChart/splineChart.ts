import s from '../styles/_all.less';
import w from './splineChart.less';
import echarts from 'echarts';
import {EventBusEvent} from 'goodteditor-event-bus';

import {
    DataSetTemplate,
    IChartData,
    INameValue,
    IWidgetVariables,
    SingleDataSource
} from '../interfaces';
import {SplineSettings} from './splineSettings';
import {
    get as _get, set as _set,
    flow as _flow,
    map as _map,
    max as _max, min as _min,
    forEach as _forEach,
    defaultTo as _defaultTo
} from 'lodash';
import {Chart} from '../models/Chart';
import {TimeSeriesData, TimeSeriesHelper} from '../helpers/TimeSeries.helper';
import {YAxisTypes} from "../models/types";

export class SplineChart extends Chart {
    getVariables(): IWidgetVariables {
        const res: IWidgetVariables = {};
        let sortIndex = 0;
        const addVar = (idx: number, name: string, description: string, hint: string) => {
            res[name + (idx === 0 ? '' : ' ' + idx)] = {
                description,
                hint,
                sortIndex: sortIndex++,
            };
        };
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
        const settings = <SplineSettings>data.settings;

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

        const timeSeriesData: TimeSeriesData = TimeSeriesHelper.convertTimeSeriesToData(data.data);

        // Конвертируем из строковых дат в дни месяца
        const axisData = _map(timeSeriesData.dates, v => new Date(v).getDate());
        // Вычисляем количество левых и правых осей
        const axisOffsets = this.calcAxisOffsets(data);

        const series: Object[] = this.getSeries(data, timeSeriesData);
        const yaxis: Object[] = this.getYAxis(data, timeSeriesData, axisOffsets.offsets);

        const options = {
            grid: {
                top: '10px',
                bottom: '20px',
                right: axisOffsets.rightAxisAmount ? (axisOffsets.rightAxisAmount * 50) + 'px' : '10px',
                left: axisOffsets.leftAxisAmount ? (axisOffsets.leftAxisAmount * 50) + 'px' : '10px',
            },
            xAxis: {
                type: 'category',
                boundaryGap: this.hasHistogram(data),
                // Цифры
                axisLabel: {
                    color: '#b4b4b4',
                    fontSize: 12
                },
                // Сетка
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: '#e9e9e9',
                        width: 1,
                        type: 'dashes'
                    }
                },
                data: axisData
            },
            yAxis: yaxis,
            tooltip: {
                axisPointer: {
                    show: true,
                    type: 'line',
                },
                formatter: '{c0}'
            },
            series: series
        };

        const el = this.config.element.getElementsByClassName(w['chart'])[0];
        const myChart = echarts.init(el);
        myChart.setOption(options);

        this.resize(this.config.element, (width, height) => {
            myChart.resize();
        });
    }

    /**
     * Вычисляем смещения левых и правых осей
     */
    private calcAxisOffsets(data: IChartData): {
        offsets: Array<{ left: number, right: number }>,
        leftAxisAmount: number,
        rightAxisAmount: number
    } {
        const axisArray: Array<{left: number, right: number}> = [];
        let leftAxis = 0;
        let rightAxis = 0;
        for (let idx = 0; idx < data.data.length; idx++) {
            const axisPos: YAxisTypes = _get(data.dataSets[idx].settings, 'yAxis', 'left');
            switch (axisPos) {
                case "left":
                    axisArray[idx] = {left: (leftAxis * 50), right: 0};
                    leftAxis++;
                    break;
                case "right":
                    axisArray[idx] = {left: 0, right: (rightAxis * 50)};
                    rightAxis++;
                    break;
            }
        }
        return {offsets: axisArray, leftAxisAmount: leftAxis, rightAxisAmount: rightAxis};
    }

    /**
     * Получить данные для серий
     */
    private getSeries(data: IChartData, timeSeriesData: TimeSeriesData): Object[] {
        const series: Object[] = [];

        for (let idx = 0; idx < data.data.length; idx++) {
            const currColor = this.getColor(data.dataSets[idx].settings, 'color-yellow');
            let seriesData = {};
            switch (data.dataSets[idx].chartType) {
                case "LINE":
                    seriesData = this.getLineSeries(idx, currColor.color);
                    break;
                case "HISTOGRAM":
                    seriesData = this.getHistogramSeries(idx, currColor.color);
                    break;
            }

            series.push({
                data: timeSeriesData.values[idx],
                yAxisIndex: idx,
                ...seriesData
            });
        }
        return series;
    }

    /**
     * Получить данные для осей
     */
    private getYAxis(
        data: IChartData,
        timeSeriesData: TimeSeriesData,
        axisOffsets: Array<{left: number, right: number}>
    ): Object[] {
        const yaxis: Object[] = [];

        for (let idx = 0; idx < data.data.length; idx++) {
            const currColor = this.getColor(data.dataSets[idx].settings, 'color-grey');
            const maxY: number = _max(timeSeriesData.values[idx]);
            const minY: number = _flow(
                _min,
                v => v > 0 ? 0 : v
            )(timeSeriesData.values[idx]);

            const pos: YAxisTypes = _get(data.dataSets[idx].settings, 'yAxis', 'left');
            const rotate: number = (maxY < 10000)
                ? 0
                : (maxY < 100000 ? 30 : 90);
            let offset = 0;
            switch (pos) {
                case "left":
                    offset = axisOffsets[idx].left;
                    break;
                case "right":
                    offset = axisOffsets[idx].right;
                    break;
            }
            yaxis.push({
                type: 'value',
                position: pos,
                min: minY,
                max: maxY,
                offset: offset,
                // Цифры
                axisLabel: {
                    color: currColor.color,
                    fontSize: 12,
                    rotate: rotate
                },
                // Настройки оси
                axisLine: {
                    lineStyle: {
                        color: currColor.color
                    }
                },
                // Сетка
                splitLine: {
                    lineStyle: {
                        color: '#e9e9e9',
                        width: 1,
                        type: 'solid'
                    }
                },
            });
        }
        return yaxis;
    }

    /**
     * Проверяем, есть ли среди графиков гистограммы
     * Для них необходимо изменить вид графика
     */
    private hasHistogram(data: IChartData): boolean {
        for (let idx = 0; idx < data.data.length; idx++) {
            if (data.dataSets[idx].chartType === 'HISTOGRAM') {
                return true;
            }
        }
        return false;
    }

    private getLineSeries(idx: number, color: string): Object {
        return {
            type: 'line',
            smooth: true,
            smoothMonotone: 'x',
            lineStyle: {
                color,
                width: 2,
            },
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
                color,
                borderColor: '#fff',
                borderWidth: 2
            }
        };
    }

    private getHistogramSeries(idx: number, color: string): Object {
        return {
            type: 'bar',
            itemStyle: {
                color,
            }
        };
    }

    private onEventBus(ev: EventBusEvent, eventData: INameValue): void {
        console.log('SplineChart listenVariableChange:', ev, eventData);
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
