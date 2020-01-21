import s from '../../styles/_all.less';
import w from './profileAndDistribution.less';
import echarts from 'echarts';
import {EventBusEvent} from 'goodteditor-event-bus';

import {
    DataSetTemplate,
    IChartData,
    INameValue,
    IWidgetVariables,
    SingleDataSource
} from '../../interfaces';
import {ProfileAndDistributionSettings} from './profileAndDistributionSettings';
import {Chart} from '../../models/Chart';
import {ProfilePoint} from '../../interfaces';

export class ProfileAndDistribution extends Chart {
    getVariables(): IWidgetVariables {
        return {};
    }

    run(data: IChartData): void {
        console.log('%cProfile run', 'color: #ab0d05');
        const settings = <ProfileAndDistributionSettings>data.settings;
        console.log("DATAAAAA", data);
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

        const optionsData = this.getData(data.data as ProfilePoint[][]);

        const options = {
            xAxis: {
                max: optionsData.xAxisMaxValue
            },
            yAxis: {},
            series: optionsData.series
        };

        const el = this.config.element.getElementsByClassName(w['chart'])[0];
        const myChart = echarts.init(el);
        myChart.setOption(options);

        this.onResize = (width, height) => {
            myChart.resize();
        };
    }

    private getMaxValue(first: number, second: number): number {
        if (first > second) {
            return first;
        } else if (second > first) {
            return second;
        }
    }

    private getData(data: ProfilePoint[][]) {
        const series: Object[] = [];
        let xAxisMaxValue: number = 0;
        data.forEach((item: ProfilePoint[]) => {
            const seriesData = {
                symbolSize: 20,
                data: [],
                type: "bar"
            };

            item.forEach((obj: ProfilePoint) => {
                xAxisMaxValue = this.getMaxValue(xAxisMaxValue, obj.xposition);
                seriesData.data.push([obj.xposition, obj.value]);
            });

            series.push(seriesData);
        });

        return {
            series: series,
            xAxisMaxValue: xAxisMaxValue + 1
        };
    }
}
