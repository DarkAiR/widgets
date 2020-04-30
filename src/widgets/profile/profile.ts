import s from '../../styles/_all.less';
import w from './profileAndDistribution.less';
import {settings as widgetSettings} from "./settings";

import echarts from 'echarts';
import {
    IChartData, IColor, ISettings,
    IWidgetVariables
} from '../../interfaces';
import {
    merge as _merge, isEmpty as _isEmpty
} from 'lodash';
import {Chart} from '../../models/Chart';
import {ProfilePoint} from '../../interfaces';
import {IWidgetSettings} from "../../widgetSettings";
import {ChartType} from "../../models/types";
import {SettingsHelper} from "../../helpers";

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
                top: +this.getWidgetSetting('paddings.top'),
                bottom: +this.getWidgetSetting('paddings.bottom'),
                right: +this.getWidgetSetting('paddings.right'),
                left: +this.getWidgetSetting('paddings.left'),
                containLabel: true
            },
            tooltip: {
                axisPointer: {
                    show: true,
                    type: 'line',
                },
                formatter: '{c0}'
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
        const dataSetSettings: ISettings = this.chartData.dataSets[0].settings;
        const currColor = this.getColor(dataSetSettings, 'color-yellow');

        data.forEach((item: ProfilePoint[]) => {
            let seriesData: ISettings = {};
            switch (this.getDataSetSettings<ChartType>(dataSetSettings, 'chartType')) {
                case "LINE":
                    seriesData = this.getLineSeries(0, currColor);
                    break;
                case "HISTOGRAM":
                    seriesData = this.getHistogramSeries(0, currColor);
                    break;
            }

            seriesData.data = [];
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

    private getLineSeries(idx: number, color: IColor): Object {
        return this.applySettings(idx, 'LINE', {
            type: 'line',
            smooth: true,
            forComparing: 0,
            xAxisIndex: 0,
            stack: null,
            seriesLayoutBy: 'column',
            showSymbol: true,
            symbolSize: 4,

            color: color.hex,                   // Основной цвет
            itemStyle: {
                opacity: color.opacity          // Прозрачность влияет на весь подписи + метки
            },
            lineStyle: {
                shadowBlur: 2,
                shadowColor: 'rgba(0, 0, 0, 0.3)',
                type: this.getDataSetSettings(this.chartData.dataSets[idx].settings, 'lineStyle.type'),
                width: 2,
                opacity: color.opacity,         // Прозрачность линии
            },
            label: {
                show: false,
                position: 'top',
                distance: 0,
                rotate: 0,
                backgroundColor: '',
                borderColor: '',
                borderWidth: 1,
                padding: [3, 5, 3, 5],
                borderRadius: [1, 1, 1, 1]
            },
            animation: true,
            animationEasing: 'cubicOut',
            animationEasingUpdate: 'cubicOut',
            animationDuration: 1000,
            animationDurationUpdate: 1000,
            animationDelay: 0,
            animationDelayUpdate: 0,
            connectNulls: true
        });
    }

    private getHistogramSeries(idx: number, color: IColor): Object {
        return this.applySettings(idx, 'HISTOGRAM', {
            type: 'bar',
            xAxisIndex: 0,
            seriesLayoutBy: 'column',

            color: color.hex,                   // Основной цвет
            itemStyle: {
                opacity: color.opacity          // Прозрачность влияет на весь подписи + метки
            },
            label: {
                show: false,
                position: 'inside',
                distance: 0,
                rotate: 90,
                backgroundColor: '',
                borderColor: '',
                borderWidth: 1,
                padding: [3, 5, 3, 5],
                borderRadius: [1, 1, 1, 1]
            },
            animation: true,
            animationDelay: 0,
            animationDelayUpdate: 0,
            showSymbol: true
        });
    }

    /**
     * Добавляем стандартные настройки для каждого dataSet
     */
    private applySettings(idx: number, chartType: ChartType, seriesData: Object): Object {
        _merge(seriesData, SettingsHelper.getLabelSettings(this.widgetSettings.dataSet.settings, this.chartData.dataSets[idx].settings));
        _merge(seriesData, SettingsHelper.getFillSettings(this.widgetSettings.dataSet.settings, this.chartData.dataSets[idx].settings, chartType));

        return seriesData;
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
