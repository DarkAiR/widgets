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
        console.log('%cProfileOrDistribution run', 'color: #ab0d05');
        const settings = <ProfileAndDistributionSettings>data.settings;

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
            xAxis: {data: optionsData.xAxisValues},
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

    private getData(data: ProfilePoint[][]) {
        const series: Object[] = [];
        const xAxisValues: Array<number> = [];

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
