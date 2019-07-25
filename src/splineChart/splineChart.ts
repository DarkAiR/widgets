import s from "../styles/_all.less";
import w from "./splineChart.less";
import echarts from "echarts";

import {IChart, IChartData} from "../interfaces";
import {SplineConfig} from "./splineConfig";
import {get as _get} from "lodash";
import {Chart} from "../models/Chart";

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

        const el = config.element.getElementsByClassName(w['chart'])[0];
        const myChart = echarts.init(el);
        const option = {
            grid: {
                top: '10px',
                right: '10px',
                bottom: '20px',
                left: '30px'
            },
            xAxis: {
                type: 'category',
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                data: [10, 90, 20, 50, 80, 133, 132],
                type: 'line',
                smooth: true,
                smoothMonotone: 'x',
                lineStyle: {
                    color: '#E4B01E'
                }
            }]
        };
        myChart.setOption(option);

        this.resize(config.element, (width, height) => {
            myChart.resize();
        });
    }
}
