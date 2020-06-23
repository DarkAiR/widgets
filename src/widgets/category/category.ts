import s from '../../styles/_all.less';
import w from './category.less';
import {settings as widgetSettings} from "./settings";

import echarts from 'echarts';
import {
    DimensionUnit,
    IChartData, IColor, INameValue, ISettings,
    IWidgetVariables, TSPoint,
    XAxisData, YAxisData,
} from '../../interfaces';
import {
    get as _get, set as _set, map as _map, forEach as _forEach,
    fromPairs as _fromPairs, findKey as _findKey, merge as _merge, flow as _flow,
    min as _min, max as _max, cloneDeep as _cloneDeep, isEmpty as _isEmpty,
    omit as _omit, flatten as _flatten
} from 'lodash';
import {Chart} from '../../models/Chart';
import {
    MathHelper,
    SettingsHelper
} from '../../helpers';
import {TypeGuardsHelper} from "../../helpers";
import {IWidgetSettings} from "../../widgetSettings";

export class Category extends Chart {
    getVariables(): IWidgetVariables {
        return {};
    }

    getSettings(): IWidgetSettings {
        return widgetSettings;
    }

    run(): void {
        const data: IChartData = this.chartData;

        if (TypeGuardsHelper.everyIsDataSetTemplate(data.dataSets)) {
            const seriesData = this.getData(data.data as TSPoint[][]);

            const xAxisData = this.getXAxis(seriesData.xAxisValues);
            const yAxisData = this.getYAxis(seriesData.series);

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
                    formatter: (p: ISettings) => {
                        return `
                            <div style='text-align: left'>${p.marker} ${(p.data.value[0] + '').replace(/\n/gi, ' / ')}</div>
                            <div>${p.data.value[1]}</div>`;
                    }
                },
                legend: legend,
                xAxis: xAxisData,
                yAxis: yAxisData,
                series: seriesData.series
            };

            console.groupCollapsed('Category eChart options');
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
    }

    private getData(data: TSPoint[][]): {
        xAxisValues: string[],
        series: ISettings[]
    } {
        const series: ISettings[] = [];
        const xAxisValues: string[] = [];

        data.forEach((pointsValues: TSPoint[], idx: number) => {
            const tmp: INameValue<number>[] = pointsValues.map((v: TSPoint) => ({
                name: v.dimensions.map((d: DimensionUnit) => d.value).join("\n"),
                value: v.value
            }));
            _map(tmp, 'name').forEach((v: string) => {
                if (!xAxisValues.includes(v)) {
                    xAxisValues.push(v);
                }
            });
            series[idx] = this.getHistogramSeries(idx, this.getColor(this.chartData.dataSets[idx].settings, 'color-yellow'));
            series[idx].data = _map(tmp, (v: INameValue<number>) => ({value: [v.name, v.value]}));
        });
        return {
            xAxisValues,
            series
        };
    }

    private getHistogramSeries(idx: number, color: IColor): ISettings {
        const dataSetSettings: ISettings = this.chartData.dataSets[idx].settings;
        return {
            type: 'bar',
            name: this.getDataSetSettings<string>(dataSetSettings, 'name') || ' ',    // Чтобы чтото отобразилось, нужно хотя бы пробел
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
            barGap: this.getWidgetSetting('histogram.barGap') + '%',
            barCategoryGap: this.getWidgetSetting('histogram.barCategoryGap') + '%',
            ...SettingsHelper.getLabelSettings(this.widgetSettings.dataSet.settings, dataSetSettings),
            ...SettingsHelper.getFillSettings(this.widgetSettings.dataSet.settings, dataSetSettings, 'HISTOGRAM'),
        };
    }

    /**
     * Получить данные для осей
     */
    private getXAxis(xAxisValues: string[]): ISettings {
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
            true,
            false
        );
        res.data = xAxisValues;
        return res;
    }

    /**
     * Получить данные для осей
     */
    private getYAxis(seriesData: ISettings[]): ISettings {
        const dataSetSettings: ISettings = this.chartData.dataSets[0].settings;
        let color: string = this.getWidgetSetting('axisY.color');
        if (!color) {
            // Получаем цвет из цвета графика
            color = this.getDataSetSettings(dataSetSettings, 'color');
        }

        const values: number[] = _flatten(
            _map(seriesData, (series: ISettings): number[] =>
                series.data.map((v: {value: [string, number]}): number => v.value[1])
            )
        );

        let max: number = _max(values);
        let min: number = _flow(
            _min,
            (v: number) => v > 0 ? 0 : v
        )(values);
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
            'value',
            0,
            nameRotate
        );
    }

    getTemplate(): string {
        return `
            <div class='${s['widget']}  ${w['widget']}' style="{{backgroundStyle}} {{paddingStyle}}">
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
