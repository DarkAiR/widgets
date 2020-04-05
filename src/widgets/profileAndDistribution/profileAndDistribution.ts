import s from '../../styles/_all.less';
import w from './profileAndDistribution.less';
import {settings as widgetSettings} from "./settings";

import echarts from 'echarts';
import {
    IChartData, IWidgetSettings,
    IWidgetVariables
} from '../../interfaces';
import {Chart} from '../../models/Chart';
import {ProfilePoint} from '../../interfaces';

export class ProfileAndDistribution extends Chart {
    getVariables(): IWidgetVariables {
        return {};
    }

    getSettings(): IWidgetSettings {
        return widgetSettings;
    }

    run(): void {
        const data: IChartData = this.chartData;

        const str = `
            <div class='${s['widget']}  ${w['widget']}'>
                <div class='${w['row']}'>
                    <div class="${w['title']}">
                        ${this.getWidgetSetting(data.settings, 'title')}
                    </div>
                </div>
                <div class='${w['row']} ${w['chart']}'>
                </div>
            </div>
        `;

        this.config.element.innerHTML = str;

        const optionsData = this.getData(data.data as ProfilePoint[][]);

        const options = {
            xAxis: {data: optionsData.xAxisValues},
            yAxis: {},
            series: optionsData.series
        };

        const el = this.config.element.getElementsByClassName(w['chart'])[0];
        const myChart = echarts.init(el);
        myChart.setOption(options);

        this.onResize = (width: number, height: number) => {
            myChart.resize();
        };
    }

    private getData(data: ProfilePoint[][]): {
        xAxisValues: number[],
        series: Object[]
    } {
        const series: Object[] = [];
        const xAxisValues: number[] = [];

        data.forEach((item: ProfilePoint[]) => {
            const seriesData = {
                symbolSize: 20,
                data: [],
                type: "bar"
            };

            item.forEach((obj: ProfilePoint) => {
                xAxisValues.push(obj.xposition);
                seriesData.data.push(obj.value);
            });

            series.push(seriesData);
        });

        return {
            xAxisValues: xAxisValues,
            series: series
        };
    }
}
