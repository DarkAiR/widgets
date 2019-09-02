import s from "../styles/_all.less";
import w from "./splineChart.less";
import echarts from "echarts";

import {IChart, IChartData} from "../interfaces";
import {SplineSettings} from "./splineSettings";
import {get as _get, keys as _keys, map as _map, forEach as _forEach} from "lodash";
import {Chart} from "../models/Chart";
import {TimeSeriesHelper} from "../helpers/TimeSeries.helper";
import {WidgetConfig} from "../models/widgetConfig";

export class SplineChart extends Chart implements IChart {
    run(config: WidgetConfig, data: IChartData): void {
        const settings = <SplineSettings>data.settings;
        console.log('SplineChats settings: ', settings);

        const str = `
            <div class='${s["widget"]}  ${w['widget']}'>
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
        for (let idx = 0; idx < data.data.length; idx++) {
            series.push({
                data: timeSeriesData.values[idx],
                type: 'line',
                smooth: true,
                smoothMonotone: 'x',
                lineStyle: {
                    color: _get(data.dataSets[idx].settings, 'color', '#E4B01E'),
                    width: 2,
                },
                symbol: 'circle',
                symbolSize: 8,
                itemStyle: {
                    color: _get(data.dataSets[idx].settings, 'color', '#E4B01E'),
                    borderColor: '#fff',
                    borderWidth: 2

                },
            });
        }

        const el = config.element.getElementsByClassName(w['chart'])[0];
        const myChart = echarts.init(el);
        const yAxisPosition = settings.yAxis || 'LEFT';

        const option = {
            grid: {
                top: '10px',
                right: yAxisPosition === 'LEFT'? '10px' : '50px',
                bottom: '20px',
                left: yAxisPosition === 'LEFT'? '50px' : '10px'
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
            yAxis: {
                type: 'value',
                position: yAxisPosition.toLowerCase(),
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
            },
            tooltip: {
                axisPointer: {
                    show: true,
                    type: 'line',
                },
                formatter: '{c0}'
            },
            series: series
        };
        myChart.setOption(option);

        this.resize(config.element, (width, height) => {
            myChart.resize();
        });
    }
}
