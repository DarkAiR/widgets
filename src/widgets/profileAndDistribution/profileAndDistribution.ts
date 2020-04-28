import s from '../../styles/_all.less';
import w from './profileAndDistribution.less';
import {settings as widgetSettings} from "./settings";

import echarts from 'echarts';
import {
    IChartData,
    IWidgetVariables
} from '../../interfaces';
import {
   isEmpty as _isEmpty
} from 'lodash';
import {Chart} from '../../models/Chart';
import {ProfilePoint} from '../../interfaces';
import {IWidgetSettings} from "../../widgetSettings";

export class ProfileAndDistribution extends Chart {
    getVariables(): IWidgetVariables {
        return {};
    }

    getSettings(): IWidgetSettings {
        return widgetSettings;
    }

    run(): void {
        const data: IChartData = this.chartData;

        const optionsData = this.getData(data.data as ProfilePoint[][]);

        const options = {
            grid: {
                top: 20,
                bottom: 0,
                right: 0,
                left: 0,
                containLabel: true
            },
            xAxis: {data: optionsData.xAxisValues},
            yAxis: {},
            series: optionsData.series
        };

        console.groupCollapsed('ProfileAndDistribution eChart options');
        console.log(options);
        console.log(JSON.stringify(options));
        console.groupEnd();

        const titleStyle = [];
        titleStyle.push(`color: ${this.getWidgetSetting('title.color')}`);
        if (!_isEmpty(this.getWidgetSetting('title.size'))) {
            titleStyle.push(`font-size: ${this.getWidgetSetting('title.size')}px`);
        }
        titleStyle.push(`text-align: ${this.getWidgetSetting('title.align')}`);

        this.config.element.innerHTML = this.renderTemplate({
            showTitle: this.getWidgetSetting('title.show'),
            title: this.getWidgetSetting('title.name'),
            titleStyle: titleStyle.join(';'),
        });

        const el = this.config.element.getElementsByClassName(w['chart'])[0];
        const myChart = echarts.init(el);
        myChart.setOption(options);

        this.onResize = (width: number, height: number): void => {
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

    getTemplate(): string {
        return `
                <div class='${s['widget']}  ${w['widget']}'>
                    {{#showTitle}}
                    <div class='${w['row']}'>
                        <div class="${w['title']}" style="{{titleStyle}}">
                            {{title}}
                        </div>
                    </div>
                    {{/showTitle}}

                    <div class='${w['row']} ${w['chart']}'>
                    </div>
                </div>
            `;
    }
}
