import s from '../styles/_all.less';
import w from './splineChart.less';
import echarts from 'echarts';

import {IChart, IChartData} from '../interfaces';
import {SplineSettings} from './splineSettings';
import {get as _get, flow as _flow, map as _map, max as _max, min as _min} from 'lodash';
import {Chart} from '../models/Chart';
import {TimeSeriesHelper} from '../helpers/TimeSeries.helper';
import {WidgetConfig} from '../models/widgetConfig';


type YAxisTypesExtended  = 'left' | 'right' | 'multi';

interface YaxisData {
    type: string;
    position: YAxisTypesExtended;
    axisLabel: Object;
    splitLine: Object;
    min?: number;
    max?: number;
}

export class SplineChart extends Chart implements IChart {
    run(config: WidgetConfig, data: IChartData): void {
        const settings = <SplineSettings>data.settings;
        console.log('SplineChats settings: ', settings);
        console.log('SplineChats data: ', data.dataSets);

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
        config.element.innerHTML = str;

        const timeSeriesData = TimeSeriesHelper.convertTimeSeriesToData(data.data);

        // Конвертируем из строковых дат в дни месяца
        const axisData = _map(timeSeriesData.dates, v => new Date(v).getDate());
        const series: Object[] = [];
        const yaxis: YaxisData[] = [];
        for (let idx = 0; idx < data.data.length; idx++) {
            const currColor = this.getColor(data.dataSets[idx].settings, 'color-yellow');
            const maxY: number = _max(timeSeriesData.values[idx]);
            const minY: number = _flow(
                _min,
                v => v > 0 ? 0 : v
            )(timeSeriesData.values[idx]);

            series.push({
                data: timeSeriesData.values[idx],
                type: 'line',
                smooth: true,
                smoothMonotone: 'x',
                lineStyle: {
                    color: currColor.color,
                    width: 2,
                },
                symbol: 'circle',
                symbolSize: 8,
                itemStyle: {
                    color: currColor.color,
                    borderColor: '#fff',
                    borderWidth: 2

                },
            });
            yaxis.push({
                type: 'value',
                position: _get(data.dataSets[idx].settings, 'yAxis', 'left'),
                min: minY,
                max: maxY,
                // Цифры
                axisLabel: {
                    color: '#b4b4b4',
                    fontSize: 12
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
        const onlyOneSide = (v) => {
            const firstPosition = v[0].position;
            let result = true;
            v.forEach(x => {
                if (x.position !== firstPosition) {
                    result = false;
                }
            });
            return result;
        };

        const el = config.element.getElementsByClassName(w['chart'])[0];
        const myChart = echarts.init(el);
        let yAxisPosition: YAxisTypesExtended;
        if (yaxis.length === 1 || onlyOneSide(yaxis)) {
            yAxisPosition = yaxis[0].position;
        } else {
            yAxisPosition = 'multi';
        }

        const options = {
            grid: {
                top: '10px',
                right: yAxisPosition === 'left' ? '10px' : '50px',
                bottom: '20px',
                left: yAxisPosition === 'left' || yAxisPosition === 'multi' ? '50px' : '10px'
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
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
        console.log('splineChart: options:', options);
        console.log('splineChart: myChart:', myChart);
        myChart.setOption(options);

        this.resize(config.element, (width, height) => {
            console.log('splineChart: resize:', width, height);
            myChart.resize();
        });
    }
}
