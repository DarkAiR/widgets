import s from "../styles/_all.less";
import w from "./splineChart.less";
import echarts from "echarts";

import {IChart, IChartData} from "../interfaces";
import {SplineConfig} from "./splineConfig";
import {get as _get} from "lodash";
import {Chart} from "../models/Chart";

export class SplineChart extends Chart implements IChart {
    run(config: SplineConfig, data: IChartData): void {
      const myChart = echarts.init(config.element);
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
        return;

        const str = `
            <div class='${s["widget"]}'>
                SPLINE
            </div>
        `;
        config.element.innerHTML = str;
    }
}
