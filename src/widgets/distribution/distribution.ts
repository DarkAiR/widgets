import s from '../../styles/_all.less';
import w from './distribution.less';
import {settings as widgetSettings} from "./settings";

import echarts from 'echarts';
import {
    IChartData, IColor, ISettings,
    IWidgetVariables, XAxisData, YAxisData
} from '../../interfaces';
import {
    merge as _merge,
    min as _min,
    max as _max,
    flow as _flow,
    isEmpty as _isEmpty
} from 'lodash';
import {Chart} from '../../models/Chart';
import {ProfilePoint} from '../../interfaces';
import {IWidgetSettings} from "../../widgetSettings";
import {ChartType, XAxisPos, YAxisPos} from "../../models/types";
import {MathHelper, SettingsHelper} from "../../helpers";

export class Distribution extends Chart {
    getVariables(): IWidgetVariables {
        return {};
    }

    getSettings(): IWidgetSettings {
        return widgetSettings;
    }

    run(): void {
        const data: IChartData = this.chartData;

        const optionsData = this.getData(data.data as ProfilePoint[][]);

        const xAxisData = this.getXAxis(optionsData.xAxisValues);
        const yAxisData = this.getYAxis(optionsData.series[0].data);

        const legend: Object = SettingsHelper.getLegendSettings(this.widgetSettings.settings, this.chartData.settings);

        const chartBackgroundSettings: ISettings = SettingsHelper.getGradientSettings(this.getWidgetSetting('chartBackground.color'));
        const chartBackground: Object = _isEmpty(chartBackgroundSettings) ? {} : { backgroundColor: chartBackgroundSettings };

        const options = {
            grid: {
                show: true,
                ...chartBackground,
                top: +this.getWidgetSetting('chartPaddings.top'),
                bottom: +this.getWidgetSetting('chartPaddings.bottom'),
                right: +this.getWidgetSetting('chartPaddings.right'),
                left: +this.getWidgetSetting('chartPaddings.left'),
                containLabel: true
            },
            tooltip: {
                axisPointer: {
                    show: true,
                    type: 'line',
                },
                formatter: '{c0}'
            },
            legend: legend,
            xAxis: xAxisData,
            yAxis: yAxisData,
            series: optionsData.series
        };

        console.groupCollapsed('Distribution eChart options');
        console.log(options);
        console.log(JSON.stringify(options));
        console.groupEnd();

        const titleSettings = SettingsHelper.getTitleSettings(this.widgetSettings.settings, this.chartData.settings);

        this.config.element.innerHTML = this.renderTemplate({
            showTitle: titleSettings.show,
            title: titleSettings.name,
            titleStyle: titleSettings.style,
            backgroundStyle: SettingsHelper.getBackgroundStyle(this.getWidgetSetting('background.color')),
            paddingStyle: SettingsHelper.getPaddingStyle(this.getWidgetSetting('paddings'))
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
        series: ISettings[]
    } {
        const series: ISettings[] = [];
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
                width: this.getDataSetSettings(this.chartData.dataSets[idx].settings, 'lineStyle.width'),
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
        const dataSetSettings: ISettings = this.chartData.dataSets[0].settings;
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
            showSymbol: true,
            barCategoryGap: this.getDataSetSettings(dataSetSettings, 'histogram.barCategoryGap') + '%',
        });
    }

    /**
     * Получить данные для осей
     */
    private getXAxis(xAxisValues: number[]): Object {
        const axisData: XAxisData = {
            show: this.getWidgetSetting('axisX.show'),
            name: this.getWidgetSetting('axisX.name'),
            nameGap: this.getWidgetSetting('axisX.nameGap'),
            nameColor: this.getWidgetSetting('axisX.nameColor'),
            color: this.getWidgetSetting('axisX.color'),
            position: this.getWidgetSetting('axisX.position'),
            axesToIndex: [],
            showTick: this.getWidgetSetting('axisX.showTick'),
        };

        const res = SettingsHelper.getXAxisSettings(
            axisData,
            0,
            'category',
            null,
            0,
            this.hasHistogram(),
            false
        );
        res.data = xAxisValues;
        return res;
    }

    /**
     * Получить данные для осей
     */
    private getYAxis(seriesData: number): Object {
        const dataSetSettings: ISettings = this.chartData.dataSets[0].settings;
        let color: string = this.getWidgetSetting('axisY.color');
        if (!color) {
            // Получаем цвет из цвета графика
            color = this.getDataSetSettings(dataSetSettings, 'color');
        }

        let max: number = _max(seriesData);
        let min: number = _flow(
            _min,
            (v: number) => v > 0 ? 0 : v
        )(seriesData);
        [max, min] = MathHelper.roundInterval(max, min);

        const axisData: YAxisData = {
            show: this.getWidgetSetting('axisY.show'),
            name: this.getWidgetSetting('axisY.name'),
            nameGap: this.getWidgetSetting('axisY.nameGap'),
            nameColor: this.getWidgetSetting('axisY.nameColor'),
            color: color,
            position: this.getWidgetSetting('axisY.position'),
            max: max,
            min: min,
            axesToIndex: [],
            showTick: this.getWidgetSetting('axisY.showTick')
        };

        let nameRotate = 0;
        switch (axisData.position) {
            case 'left':
                nameRotate = 90;
                break;
            case 'right':
                nameRotate = 270;
                break;
        }

        return SettingsHelper.getYAxisSettings(
            axisData,
            0,
            0,
            nameRotate
        );
    }

    /**
     * Добавляем стандартные настройки для каждого dataSet
     */
    private applySettings(idx: number, chartType: ChartType, seriesData: Object): Object {
        const getSetting = <T = void>(path: string): T => this.getDataSetSettings<T>(this.chartData.dataSets[idx].settings, path);

        seriesData['name'] = getSetting('name') || ' ';     // Чтобы чтото отобразилось, нужно хотя бы пробел

        _merge(seriesData, SettingsHelper.getLabelSettings(this.widgetSettings.dataSet.settings, this.chartData.dataSets[idx].settings));
        _merge(seriesData, SettingsHelper.getFillSettings(this.widgetSettings.dataSet.settings, this.chartData.dataSets[idx].settings, chartType));

        return seriesData;
    }

    getTemplate(): string {
        return `
            <div class='${s['widget']} ${w['widget']}' style="{{backgroundStyle}} {{paddingStyle}}">
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
