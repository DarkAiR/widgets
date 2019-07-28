import s from "../styles/_all.less";
import w from "./splineChart.less";
import echarts from "echarts";

import {IChart, IChartData} from "../interfaces";
import {SplineConfig} from "./splineConfig";
import {get as _get, keys as _keys, map as _map, forEach as _forEach} from "lodash";
import {Chart} from "../models/Chart";
import {SingleTimeSeriesValue} from "../interfaces/template/singleTimeSeriesValue";

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

        const valuesArr: Array<Array<number>> = [];
        _forEach(data.data, (dataValue, idx) => {
            _forEach(dataValue.values, (v: SingleTimeSeriesValue) => {
                if (valuesArr[v.localDateTime] === undefined) {
                    valuesArr[v.localDateTime] = [];
                }
                valuesArr[v.localDateTime][idx] = v.value;
            });
        });
        // Конвертируем из строковых дат в дни месяца
        const axisData = _map(_keys(valuesArr), v => new Date(v).getDate());
        console.log('  axisData', axisData);
        console.log('  valuesArr', valuesArr);

        const series: Array<Object> = [];
        for (let idx = 0; idx < data.data.length; idx++) {
            const arr: Array<number> = [];
            // Вот такой странный обход массива, т.к. это по факту объект
            for (let v in valuesArr) {
                arr.push(valuesArr[v][idx]);
            };
            series.push({
                data: arr,
                type: 'line',
                smooth: true,
                smoothMonotone: 'x',
                lineStyle: {
                    color: _get(data.data[idx], 'style.color', '#E4B01E')
                },
                symbol: 'circle',
                itemStyle: {
                    color: _get(data.data[idx], 'style.color', '#E4B01E')
                },
            });
        }
        console.log('  series', series);

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
            series: series
        };
        myChart.setOption(option);

        this.resize(config.element, (width, height) => {
            myChart.resize();
        });
    }
}
