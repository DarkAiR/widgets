import s from "../styles/_all.less";
import w from "./splineChart.less";
import echarts from "echarts";

import {IChart, IChartData} from "../interfaces";
import {SplineConfig} from "./splineConfig";
import {get as _get, keys as _keys, map as _map, forEach as _forEach} from "lodash";
import {Chart} from "../models/Chart";
import {SingleTimeSeriesValue} from "../interfaces/template/singleTimeSeriesValue";
import {TimeSeriesHelper} from "../helpers/TimeSeries.helper";

export class SplineChart extends Chart implements IChart {
    run(config: SplineConfig, data: IChartData): void {
        const str = `
            <div class='${s["widget"]}  ${w['widget']}'>
                <div class='${w['row']}'>
                    <div class="${w['title']}">
                        ${data.title}
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

        const series: Array<Object> = [];
        for (let idx = 0; idx < data.data.length; idx++) {
            series.push({
                data: timeSeriesData.values[idx],
                type: 'line',
                smooth: true,
                smoothMonotone: 'x',
                lineStyle: {
                    color: _get(data.data[idx], 'style.color', '#E4B01E'),
                    width: 2,
                },
                symbol: 'circle',
                symbolSize: 8,
                itemStyle: {
                    color: _get(data.data[idx], 'style.color', '#E4B01E'),
                    borderColor: '#fff',
                    borderWidth: 2

                },
            });
        }

        const el = config.element.getElementsByClassName(w['chart'])[0];
        const myChart = echarts.init(el);
        const option = {
            grid: {
                top: '10px',
                right: '10px',
                bottom: '20px',
                left: '50px'
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
