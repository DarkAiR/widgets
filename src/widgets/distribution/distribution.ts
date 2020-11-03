import w from './distribution.less';
import {settings as widgetSettings} from "./settings";

import echarts from 'echarts';
import {
    DataSet, DataSetTemplate, DataSourceInfo,
    IChartData, IColor, IEventOrgUnits, ISettings,
    IWidgetVariables, SingleDataSource, XAxisData, YAxisData
} from '../../interfaces';
import {
    merge as _merge,
    min as _min,
    max as _max,
    flow as _flow,
    isEmpty as _isEmpty,
    forEach as _forEach
} from 'lodash';
import {AddVarFunc, Chart} from '../../models/Chart';
import {ProfilePoint} from '../../interfaces';
import {IWidgetSettings} from "../../widgetSettings";
import {ChartType} from "../../models/types";
import {MathHelper, OrgUnitsHelper, SettingsHelper, TypeGuardsHelper} from "../../helpers";
import {WidgetConfigInner} from "../..";
import {WidgetOptions} from "../../models/widgetOptions";

type VarNames = 'org units' | 'period' | 'start date' | 'finish date' | 'frequency' | 'pre frequency' | 'operation' | 'version filter';

export class Distribution extends Chart {
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

    constructor(config: WidgetConfigInner, options: WidgetOptions) {
        super(config, options);
        // Инициализация в конструкторе, чтобы можно было вызвать инициализацию переменных до первого рендера
        this.onEventBus = this.onEventBusFunc.bind(this);
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
                formatter: '{c0}'
            },
            legend: legend,
            xAxis: xAxisData,
            yAxis: yAxisData,
            series: optionsData.series
        };

        if (this.options?.logs?.render ?? true) {
            console.groupCollapsed('Distribution eChart options');
            console.log(options);
            console.log(JSON.stringify(options));
            console.groupEnd();
        }
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
        const currColor: IColor = this.getColor(dataSetSettings);

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
     * Добавляем стандартные настройки для каждого dataSet
     */
    private applySettings(idx: number, chartType: ChartType, seriesData: Object): Object {
        const getSetting = <T = void>(path: string): T => this.getDataSetSettings<T>(this.chartData.dataSets[idx].settings, path);

        seriesData['name'] = getSetting('name.name') || ' ';     // Чтобы чтото отобразилось, нужно хотя бы пробел

        _merge(seriesData, SettingsHelper.getLabelSettings(this.widgetSettings.dataSet.settings, this.chartData.dataSets[idx].settings));
        _merge(seriesData, SettingsHelper.getFillSettings(this.widgetSettings.dataSet.settings, this.chartData.dataSets[idx].settings, chartType));

        return seriesData;
    }

    /**
     * Обработка событий
     * NOTE: все данные меняются в this.config.template
     */
    // tslint:disable-next-line:no-any
    private async onEventBusFunc(varName: VarNames, value: any, dataSourceId: number): Promise<boolean> {
        if (this.options?.logs?.eventBus ?? true) {
            console.groupCollapsed('Distribution EventBus data');
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
                        // Отключаем группировку
                        const event: IEventOrgUnits = value as IEventOrgUnits;
                        event.orgUnitsGroupBy = [];

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
