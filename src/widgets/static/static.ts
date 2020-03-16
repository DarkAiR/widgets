import s from '../../styles/_all.less';
import w from './static.less';
import echarts from 'echarts';
import {EventBusEvent} from 'goodteditor-event-bus';

import {
    IChartData,
    IWidgetVariables,
} from '../../interfaces';
import {StaticSettings} from './staticSettings';
import {Chart} from '../../models/Chart';
import {Point} from '../../interfaces';

export class Static extends Chart {
    getVariables(): IWidgetVariables {
        return {};
    }

    run(data: IChartData): void {
        const settings = <StaticSettings>data.settings;
        console.log('Static settings: ', settings);

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

        this.onResize = (width: number, height: number) => {
            myChart.resize();
        };
    }

    private getSeries(data: Point[][]): Object[] {
        const series: Object[] = [];
        data.forEach((item: Point[], index: number) => {
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
}
