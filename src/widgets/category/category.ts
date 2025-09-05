import widgetStyles from './category.less';
import {settings as widgetSettings} from "./settings";

import * as echarts from 'echarts';
import {
    DataSet,
    DataSetTemplate, DataSourceInfo, DimensionInfo,
    IChartData, IColor, IEventOrgUnits, INameValue, ISettings,
    IWidgetVariables, SingleDataSource, TSPoint,
    XAxisData, YAxisData,
} from '../../interfaces';
import {
    map as _map,
    flow as _flow,
    min as _min, max as _max, isEmpty as _isEmpty,
    flatten as _flatten,
    forEach as _forEach
} from 'lodash';
import {AddVarFunc, Chart} from '../../models/Chart';
import {
    CategoryDataHelper, ColorHelper,
    MathHelper, OrgUnitsHelper,
    SettingsHelper
} from '../../helpers';
import {TypeGuardsHelper} from "../../helpers";
import {IWidgetSettings} from "../../widgetSettings";
import {WidgetConfigInner} from "../..";
import {WidgetOptions} from "../../models/widgetOptions";

type VarNames = 'org units' | 'period' | 'start date' | 'finish date' | 'frequency' | 'pre frequency' | 'operation' | 'version filter';

export class Category extends Chart {
    constructor(config: WidgetConfigInner, options: WidgetOptions) {
        super(config, options);
        // Инициализация в конструкторе, чтобы можно было вызвать инициализацию переменных до первого рендера
        this.onEventBus = this.onEventBusFunc.bind(this);
    }

    getVariables(): IWidgetVariables {
        const res: IWidgetVariables = {};
        const addVar: AddVarFunc<VarNames> = this.addVar(res);

        addVar(0, 'org units', 'OrgUnits', 'Выбирается в отдельном виджете');

        _forEach(this.config.template.dataSets, (v: DataSet, idx: number) => {
            if (TypeGuardsHelper.isDataSetTemplate(v)) {
                const nameStr: string = v.dataSource1.type === 'SINGLE' ? '(' + (<SingleDataSource>v.dataSource1).name + ')' : '';
                addVar(idx, 'period', 'Период', `${nameStr}: формат см. документацию по template-api`);
                addVar(idx, 'start date', 'Начало выборки', `${nameStr}: YYYY-mm-dd`);
                addVar(idx, 'finish date', 'Окончание выборки', `${nameStr}: YYYY-mm-dd`);
                addVar(idx, 'frequency', 'Частота конечной агрегации', `${nameStr}: YEAR | MONTH | WEEK | DAY | HOUR | ALL`);
                addVar(idx, 'pre frequency', 'Частота выборки для которой выполняется operation', `${nameStr}: YEAR | MONTH | WEEK | DAY | HOUR | ALL`);
                addVar(idx, 'operation', 'Операция для агрегации из preFrequency во frequency', `${nameStr}: SUM | AVG | MIN | MAX | DIVIDE`);
                addVar(idx, 'version filter', 'Версия', 'Версия');
            }
        });
        return res;
    }

    getSettings(): IWidgetSettings {
        return widgetSettings;
    }

    getStyles(): ISettings {
        return widgetStyles;
    }

    run(): void {
        const data: IChartData = this.chartData;

        (async () => {
            if (TypeGuardsHelper.everyIsDataSetTemplate(data.dataSets)) {
                const dimInfos: DimensionInfo[] = await CategoryDataHelper.getDimensionInfos(this.config.dataProvider, data.dataSets);

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
                        extraCssText: "",
                        axisPointer: {
                            show: true,
                            type: 'line',
                        },
                        position: (point: [number, number], params: Object, dom: HTMLElement, rect: Object, size: ISettings) => {
                            const x = point[0] < size.viewSize[0] / 2
                                ? point[0] - dom.offsetWidth / 2
                                : point[0] - dom.offsetWidth;
                            return [x, point[1] - dom.offsetHeight];
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

                if (this.options?.logs?.render ?? true) {
                    console.groupCollapsed('Category eChart options');
                    console.log(options);
                    console.log(JSON.stringify(options));
                    console.groupEnd();
                }
                const titleSettings = SettingsHelper.getTitleSettings(this.widgetSettings.settings, this.chartData.settings);

                this.config.element.innerHTML = this.renderTemplate({
                    showTitle: titleSettings.show && titleSettings.name.trim().length,
                    title: titleSettings.name,
                    titleStyle: titleSettings.style,
                    backgroundStyle: SettingsHelper.getBackgroundStyle(this.getWidgetSetting('background.color')),
                    paddingStyle: SettingsHelper.getPaddingStyle(this.getWidgetSetting('paddings'))
                });

                const el: HTMLElement = this.config.element.getElementsByClassName(widgetStyles['chart'])[0] as HTMLElement;
                const myChart = echarts.init(el);
                myChart.setOption(options);

                this.onResize = (width: number, height: number): void => {
                    myChart.resize();
                };
            }
        })();
    }

    private getData(data: TSPoint[][], dimInfos: DimensionInfo[]): {
        xAxisValues: string[],
        series: ISettings[]
    } {
        const res = CategoryDataHelper.createCategoryData(data, dimInfos);

        const series: ISettings[] = [];
        data.forEach((pointsValues: TSPoint[], idx: number) => {
            series[idx] = this.getHistogramSeries(idx);
            series[idx].data = res.data[idx];
        });
        return {
            xAxisValues: res.labels,
            series
        };
    }

    private getHistogramSeries(idx: number): ISettings {
        const dataSetSettings: ISettings = this.chartData.dataSets[idx].settings;

        const colorSetting: string = this.getDataSetSettings(idx, 'color');
        const color: IColor = colorSetting ? ColorHelper.hexToColor(colorSetting) : null;

        return {
            type: 'bar',
            name: this.getDataSetSettings(idx, 'name.name') || ' ',    // Чтобы чтото отобразилось, нужно хотя бы пробел
            xAxisIndex: 0,
            seriesLayoutBy: 'column',
            ...(!color ? {} : {
                color: color.hex                // Основной цвет
            }),
            ...(!color ? {} : {
                itemStyle: {
                    opacity: color.opacity      // Прозрачность влияет на все подписи + метки
                }
            }),

            label: {
                show: false,
                position: 'inside',
                distance: 0,
                rotate: 90,
                backgroundColor: '',
                borderColor: '',
                borderWidth: 1,
                padding: [3, 5, 3, 5],
                borderRadius: [1, 1, 1, 1],
                ...SettingsHelper.getLabelSettings(this.widgetSettings.dataSet.settings, dataSetSettings).label,
            },
            animation: true,
            animationDelay: 0,
            animationDelayUpdate: 0,
            showSymbol: true,
            barGap: this.getWidgetSetting('histogram.barGap') + '%',
            barCategoryGap: this.getWidgetSetting('histogram.barCategoryGap') + '%',
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
            maxValueLength: this.getWidgetSetting('axisX.maxValueLength'),
            color: this.getWidgetSetting('axisX.color'),
            position: this.getWidgetSetting('axisX.position'),
            axesToIndex: [],
            showLine: this.getWidgetSetting('axisX.showLine'),
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
        let color: string = this.getWidgetSetting('axisY.color');
        if (!color) {
            // Получаем цвет из цвета графика
            color = this.getDataSetSettings(0, 'color');
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
            showLine: this.getWidgetSetting('axisY.showLine'),
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

    /**
     * Обработка событий
     * NOTE: все данные меняются в this.config.template
     */
    // tslint:disable-next-line:no-any
    private async onEventBusFunc(varName: VarNames, value: any, dataSourceId: number): Promise<boolean> {
        if (this.options?.logs?.eventBus ?? true) {
            console.groupCollapsed('Category EventBus data');
            console.log(varName, '=', value);
            console.log('dataSourceId =', dataSourceId);
            console.groupEnd();
        }
        // NOTE: Делаем через switch, т.к. в общем случае каждая обработка может содержать дополнительную логику

        const dataSet: DataSetTemplate = this.config.template.dataSets[dataSourceId] as DataSetTemplate;
        let needReload = false;

        // Типизированный обязательный switch
        const switchArr: Record<VarNames, Function> = {
            'org units': () => {
                if (TypeGuardsHelper.everyIsDataSetTemplate(this.config.template.dataSets)) {
                    this.config.template.dataSets.forEach((v: DataSetTemplate) => {
                        const event: IEventOrgUnits = value as IEventOrgUnits;
                        if (OrgUnitsHelper.setOrgUnits(v.dataSource1, event)) {
                            needReload = true;
                        }
                    });
                }
            },
            'start date':       () => { dataSet.from = value; needReload = true; },
            'finish date':      () => { dataSet.to = value; needReload = true; },
            'period':           () => { dataSet.period = value; needReload = true; },
            'frequency':        () => { dataSet.frequency = value; needReload = true; },
            'pre frequency':    () => { dataSet.preFrequency = value; needReload = true; },
            'operation':        () => { dataSet.operation = value; needReload = true; },
            'version filter':   async () => {
                const dataSource: SingleDataSource = dataSet.dataSource1 as SingleDataSource;
                const dsInfo: DataSourceInfo = await this.config.dataProvider.getDataSourceInfo(dataSource.name);
                if (dsInfo.version && !dsInfo.version.hidden) {
                    dataSource.versionFilter = {
                        name: dsInfo.version.name,
                        upperTime: value + ''       // versionFilter (number -> string)
                    };
                    needReload = true;
                }
            }
        };
        await switchArr[varName]();

        return needReload;
    }

    getTemplate(): string {
        return `
            <div class="widget" style="{{backgroundStyle}} {{paddingStyle}}">
                {{#showTitle}}
                <div class="title" style="{{titleStyle}}">
                    {{title}}
                </div>
                {{/showTitle}}

                <div class="chart">
                </div>
            </div>
        `;
    }
}
