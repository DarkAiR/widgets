import w from './category.less';
import {settings as widgetSettings} from "./settings";

import echarts from 'echarts';
import {
    DataSetTemplate, DimensionFilter, DimensionInfo,
    DimensionUnit,
    IChartData, IColor, INameValue, ISettings,
    IWidgetVariables, TSPoint,
    XAxisData, YAxisData,
} from '../../interfaces';
import {
    map as _map,
    flow as _flow,
    min as _min, max as _max, cloneDeep as _cloneDeep, isEmpty as _isEmpty,
    flatten as _flatten,
    sortBy as _sortBy, values as _values,
    isEqual as _isEqual
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

        (async () => {
            if (TypeGuardsHelper.everyIsDataSetTemplate(data.dataSets)) {
                const dimInfos: DimensionInfo[] = await this.getDimensionInfos(data.dataSets);

                const seriesData = this.getData(data.data as TSPoint[][], dimInfos);

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
                            // p.data.value[0]: INameValue[]
                            const content: string = `
                                <tr>
                                    <td style='text-align: right'>${p.marker}</td>
                                    <td>&nbsp;:&nbsp;</td>
                                    <td>${p.data.value[1]}</td>
                                </tr>` + p.data.value[2].map((v: INameValue) => `
                                 <tr>
                                    <td style='text-align: right'>${v.name}</td>
                                    <td>&nbsp;:&nbsp;</td>
                                    <td>${v.value}</td>
                                </tr>
                            `).join('');
                            return `<table width="100%" style='padding: 0; margin: 0; border: 0'>${content}</table>`;
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
        })();
    }

    private async getDimensionInfos(dataSets: DataSetTemplate[]): Promise<DimensionInfo[]> {
        const dimInfos: DimensionInfo[] = [];
        const cmp = (a: DimensionInfo, b: DimensionInfo) => a.name === b.name;

        let dataSet: DataSetTemplate;
        for (dataSet of dataSets) {
            if (TypeGuardsHelper.isSingleDataSource(dataSet.dataSource1)) {
                const res: DimensionInfo[] = await this.config.dataProvider.getDimensionsInfo(
                    dataSet.dataSource1.name,
                    dataSet.dataSource1.dimensions
                        .filter((d: DimensionFilter) => d.groupBy)
                        .map((d: DimensionFilter) => d.name)
                );
                const tmpArr: DimensionInfo[] = _cloneDeep(dimInfos);
                res.forEach((v1: DimensionInfo) => tmpArr.some((v2: DimensionInfo) => cmp(v1, v2)) ? false : dimInfos.push(v1));
            } else {
                throw new Error('AggregationDataSource not supported');
            }
        }
        return dimInfos;
    }

    private getData(data: TSPoint[][], dimInfos: DimensionInfo[]): {
        xAxisValues: string[],
        series: ISettings[]
    } {
        const getDimensionInfo = (name: string): string => dimInfos.find((v: DimensionInfo) => v.name === name).caption ?? name;
        const getDimensionKey = (v: TSPoint): INameValue[] => {
            return _sortBy(v.dimensions.map((d: DimensionUnit): INameValue => (
                { name: getDimensionInfo(d.name), value: d?.entity?.name ?? d.value }
            )), _values);
        };
        const keyExist = (arr: INameValue[][], v1: INameValue[]): boolean => {
            return arr.some((v2: INameValue[]) => _isEqual(v1, v2));
        };

        const dimArr: INameValue[][] = [];
        data.forEach((pointsValues: TSPoint[]) => {
            pointsValues.forEach((v: TSPoint) => {
                const key: INameValue[] = getDimensionKey(v);
                if (!keyExist(dimArr, key)) {
                    dimArr.push(key);
                }
            });
        });

        /*
        idx1  v1  v2  -
        idx2  -   v4  v3
              d1  d2  d3
         */
        const res: [INameValue[], number][][] = [...new Array(data.length)].map(
            () => dimArr.map((v: INameValue[]) => [v, 0])
        );

        // Проходим по все исходным точкам
        data.forEach((pointsValues: TSPoint[], idx: number) => {
            pointsValues.forEach((v: TSPoint) => {
                // В массиве res[idx] находим нужный dimension и заполняем его данными
                const v1: INameValue[] = getDimensionKey(v);
                res[idx].some((v2: [INameValue[], number]) => {
                    if (_isEqual(v1, v2[0])) {
                        v2[1] = v.value;
                        return true;
                    }
                    return false;
                });
            });
        });

        const createKey = (v: INameValue[]): string => v.map((v2: INameValue): string => `${v2.value}`).join("\n");
        const xAxisValues: string[] = dimArr.map((v: INameValue[]): string => createKey(v));

        const series: ISettings[] = [];
        data.forEach((pointsValues: TSPoint[], idx: number) => {
            series[idx] = this.getHistogramSeries(idx, this.getColor(this.chartData.dataSets[idx].settings));
            series[idx].data = res[idx].map((v: [INameValue[], number]) => ({value: [createKey(v[0]), v[1], v[0]]}));
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
            <div class="${w['widget']}" style="{{backgroundStyle}} {{paddingStyle}}">
                {{#showTitle}}
                <div class="${w['title']}" style="{{titleStyle}}">
                    {{title}}
                </div>
                {{/showTitle}}

                <div class="${w['chart']}">
                </div>
            </div>
        `;
    }
}
