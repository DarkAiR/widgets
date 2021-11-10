import widgetStyles from './spline.less';
import {settings as widgetSettings} from "./settings";

import * as echarts from 'echarts';
import {
    DataSet,
    IChartData, IColor, ISettings,
    IWidgetVariables,
    SingleDataSource,
    DataSetTemplate, IEventOrgUnits, XAxisData, YAxisData, TSPoint, DataSourceInfo, AxisEventData
} from '../../interfaces';
import {
    get as _get, map as _map, forEach as _forEach,
    fromPairs as _fromPairs, findKey as _findKey, find as _find, merge as _merge, flow as _flow,
    min as _min, max as _max, cloneDeep as _cloneDeep, isEmpty as _isEmpty
} from 'lodash';
import {AddVarFunc, Chart} from '../../models/Chart';
import {
    ColorHelper,
    DateHelper,
    MathHelper,
    OrgUnitsHelper,
    SettingsHelper,
    StatesHelper,
    TimeSeriesData,
    TimeSeriesHelper
} from '../../helpers';
import {ChartType, Frequency, HistogramType, XAxisPos, YAxisPos} from "../../types/types";
import {TypeGuardsHelper} from "../../helpers";
import {IWidgetSettings} from "../../widgetSettings";
import {WidgetSettingsItem} from "../../widgetSettings/types";
import {WidgetConfigInner} from "../..";
import {WidgetOptions} from "../../models/widgetOptions";
import {ECEventData} from "echarts/types/src/util/types";
import dayjs from 'dayjs';

interface Interval {
    currInterval: Frequency;        // Текущий отображаемый интервал
    cutFrom: string;
    cutTo: string;
}

interface DataByAxis {
    dataSets: DataSet[];                    // Источники данных, пришедшие в шаблоне
    data: TSPoint[][];                      // набор данных, каждый item описывает один набор данных, для одного графика/отчета
    indexes: number[];                      // Индексы Timeseries
    timeSeriesData: TimeSeriesData;
    axisData: XAxisData;
}

// Типы переменных
type VarNames = 'org units' | 'period' | 'start date' | 'finish date' | 'frequency' | 'pre frequency' | 'operation' | 'version filter';

export class Spline extends Chart {
    private interval: Interval = {
        currInterval: null,
        cutFrom: null,
        cutTo: null
    };
    private enableInterval: boolean = true;         // Включение работы с интервалами, если одна ось Х
    private clickTimeoutId: number = null;

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

        if (TypeGuardsHelper.everyIsDataSetTemplate(data.dataSets)) {
            const enableZoom: boolean = this.getWidgetSetting('enableZoom');
            const axisYDistance: number = this.getWidgetSetting('axisYDistance');
            const axisXDistance: number = this.getWidgetSetting('axisXDistance');

            // Разделяем данные по осям
            const dataByAxes: {
                [axisNumber: number]: DataByAxis
            } = [];
            for (let idx = 0; idx < data.data.length; idx++) {
                const axisNumber: number = +this.getDataSetSettings(idx, 'axisX');
                if (dataByAxes[axisNumber] === undefined) {
                    dataByAxes[axisNumber] = {
                        data: [],
                        dataSets: [],
                        indexes: [],
                        timeSeriesData: null,
                        axisData: null
                    };
                }
                dataByAxes[axisNumber].data.push(data.data[idx] as TSPoint[]);
                dataByAxes[axisNumber].dataSets.push(data.dataSets[idx]);
                dataByAxes[axisNumber].indexes.push(idx);
            }

            const dataByAxesKeys: number[] = Object.keys(dataByAxes).map((v: string) => +v);

            // Считаем отдельно TimeSeries по осям
            _forEach(dataByAxesKeys, (axisNumber: number) => {
                dataByAxes[axisNumber].timeSeriesData = TimeSeriesHelper.convertTimeSeriesToData(
                    dataByAxes[axisNumber].data,
                    dataByAxes[axisNumber].dataSets,
                    this.interval.cutFrom,
                    this.interval.cutTo
                );
            });

            // Отключаем интервалы
            this.enableInterval = dataByAxesKeys.length === 1;
            if (this.enableInterval) {
                this.interval.currInterval = TimeSeriesHelper.calcInterval(dataByAxes[dataByAxesKeys[0]].timeSeriesData.dates);
            }

            const xAxesData = this.getXAxes(dataByAxes);
            const yAxesData = this.getYAxes();

            // Вычисляем количество осей
            const leftAmount: number    = yAxesData.axes.filter((v: Object) => (v['position'] as YAxisPos) === 'left').length;
            const rightAmount: number   = yAxesData.axes.filter((v: Object) => (v['position'] as YAxisPos) === 'right').length;
            const topAmount: number     = xAxesData.axes.filter((v: Object) => (v['position'] as XAxisPos) === 'top').length;
            const bottomAmount: number  = xAxesData.axes.filter((v: Object) => (v['position'] as XAxisPos) === 'bottom').length;

            // Только для одиночных осей
            const containLabel: boolean = leftAmount <= 1 && rightAmount <= 1 && topAmount <= 1 && bottomAmount <= 1;

            const legend: Object = SettingsHelper.getLegendSettings(this.widgetSettings.settings, this.chartData.settings);
            const series: Object[] = this.getSeries(dataByAxes, xAxesData.axesToIndex, yAxesData.axesToIndex);

            const chartBackgroundSettings: ISettings = SettingsHelper.getGradientSettings(this.getWidgetSetting('chartBackground.color'));
            const chartBackground: Object = _isEmpty(chartBackgroundSettings) ? {} : { backgroundColor: chartBackgroundSettings };
            const chartBorderColor: Object = SettingsHelper.getBorderSettings(this.widgetSettings.settings, this.chartData.settings);

            // NOTE: при containLabel=true ECharts правильно считает ширину отступа для нескольких осей,
            //       но не умеет располагать оси рядом, поэтому, при более чем одной оси, высчитываем отступы вручную
            const options = {
                grid: {
                    show: true,
                    ...chartBackground,
                    ...chartBorderColor,
                    top: +this.getWidgetSetting('chartPaddings.top') + (containLabel ? 0 : topAmount * axisXDistance),
                    bottom: +this.getWidgetSetting('chartPaddings.bottom') + (containLabel ? 0 : bottomAmount * axisXDistance),
                    right: +this.getWidgetSetting('chartPaddings.right') + (containLabel ? 0 : (rightAmount * axisYDistance)),
                    left: +this.getWidgetSetting('chartPaddings.left') + (containLabel ? 0 : (leftAmount * axisYDistance)),
                    containLabel: containLabel
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
                xAxis: xAxesData.axes,
                yAxis: yAxesData.axes,
                series: series
            };

            if (this.options?.logs?.render ?? true) {
                console.groupCollapsed('Spline eChart options');
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
                paddingStyle: SettingsHelper.getPaddingStyle(this.getWidgetSetting('paddings')),
                enableZoom: enableZoom && this.enableInterval,
                disableBtn: StatesHelper.isEmpty('interval')
            });

            const el: HTMLElement = this.config.element.getElementsByClassName(widgetStyles['chart'])[0] as HTMLElement;
            const myChart = echarts.init(el);
            myChart.setOption(options);

            if (enableZoom && this.enableInterval) {
                if (this.interval.currInterval !== 'DAY') {
                    myChart.on('click', 'xAxis.category', (param: ECEventData) => this.onClickAxisX((param as AxisEventData).value as string));
                }
                const buttons: HTMLCollectionOf<HTMLElement> = this.config.element.getElementsByClassName(widgetStyles['toolbtn']) as HTMLCollectionOf<HTMLElement>;
                buttons[0].addEventListener("click", this.leftInterval.bind(this));
                buttons[1].addEventListener("click", this.revertInterval.bind(this));
                buttons[2].addEventListener("click", this.rightInterval.bind(this));
            }

            this.onResize = (width: number, height: number): void => {
                myChart.resize();
            };
        }
    }

    /**
     * Получить данные для серий
     */
    private getSeries(
        dataByAxes: { [axisNumber: number]: DataByAxis },
        xAxesToIndex: {[dataSetIdx: number]: number},
        yAxesToIndex: {[dataSetIdx: number]: number}
    ): Object[] {
        const data: IChartData = this.chartData;
        const series: Object[] = [];
        const dataByAxesKeys: number[] = Object.keys(dataByAxes).map((v: string) => +v);

        if (TypeGuardsHelper.everyIsDataSetTemplate(data.dataSets)) {
            for (let idx = 0; idx < data.data.length; idx++) {
                let seriesData = {};
                switch (this.getDataSetSettings<ChartType>(idx, 'chartType')) {
                    case "LINE":
                        seriesData = this.getLineSeries(idx);
                        break;
                    case "HISTOGRAM":
                        seriesData = this.getHistogramSeries(idx);
                        break;
                    default:
                        continue;
                }

                const xAxisNumber: number = _find(dataByAxesKeys, (v: number) => {
                    const axisData: DataByAxis = dataByAxes[v];
                    return axisData.indexes.includes(idx);
                });
                if (xAxisNumber !== undefined) {
                    // Ищем индекс в values для конкретного dataSet
                    const valuesIndex: number = dataByAxes[xAxisNumber].indexes.indexOf(idx);
                    // dataByAxes[xAxisNumber].axisData.
                    series.push({
                        data: dataByAxes[xAxisNumber].timeSeriesData.values[valuesIndex],
                        xAxisIndex: xAxesToIndex[idx],
                        yAxisIndex: yAxesToIndex[idx],
                        ...seriesData
                    });
                }
            }
        }
        return series;
    }

    /**
     * Получить настройку конкретной оси
     */
    private getAxisSetting<T>(axisName: string, varName: string, axisNumber: number): T {        // unknown, чтобы обязательно указывать тип
        const axesData = this.getWidgetSetting<Object[]>(axisName);
        const item: WidgetSettingsItem = SettingsHelper.getWidgetSettingByPath(this.widgetSettings.settings, [axisName, varName]);
        const dataObj = axesData.find((v: Object) => +_get(v, 'index') === +axisNumber);
        if (dataObj !== undefined) {
            return _get(dataObj, varName, item.default);
        }
        return item.default;
    }

    /**
     * Получить данные для осей
     */
    private getXAxes(dataByAxes: { [axisNumber: number]: DataByAxis }): {
        axes: Object[],
        axesToIndex: {[dataSetIdx: number]: number}
    } {
        const data: IChartData = this.chartData;
        const dataByAxesKeys: number[] = Object.keys(dataByAxes).map((v: string) => +v);

        // Готовим данные для осей
        _forEach(dataByAxesKeys, (axisNumber: number) => {
            const axisData: DataByAxis = dataByAxes[axisNumber];
            // NOTE: Цвет не берем из графика, т.к. оси могут быть обьединены
            const color: string = this.getAxisSetting('axesX', 'color', axisNumber) as string;
            axisData.axisData = {
                show: this.getAxisSetting('axesX', 'show', axisNumber),
                name: this.getAxisSetting('axesX', 'name', axisNumber),
                nameGap: this.getAxisSetting('axesX', 'nameGap', axisNumber),
                nameColor: this.getAxisSetting('axesX', 'nameColor', axisNumber),
                maxValueLength: this.getAxisSetting('axesX', 'maxValueLength', axisNumber),
                color: color,
                position: this.getAxisSetting('axesX', 'position', axisNumber),
                axesToIndex: axisData.indexes,
                showLine: this.getAxisSetting('axesX', 'showLine', axisNumber),
                showTick: this.getAxisSetting('axesX', 'showTick', axisNumber),
            };
        });

        // Готовим данные для echarts
        const axisXDistance: number = this.getWidgetSetting('axisXDistance');
        let topAxis = 0;
        let bottomAxis = 0;

        const axes: Object[] = _map(dataByAxesKeys, (axisNumber: number): Object => {
            const axData: DataByAxis = dataByAxes[axisNumber];
            let offset = 0;
            switch (axData.axisData.position) {
                case 'top':
                    offset = topAxis * axisXDistance;
                    topAxis++;
                    break;
                case 'bottom':
                    offset = bottomAxis * axisXDistance;
                    bottomAxis++;
                    break;
            }

            const enableZoom: boolean = this.getWidgetSetting('enableZoom');
            const res = SettingsHelper.getXAxisSettings(
                axData.axisData,
                axisNumber,
                'category',
                (value: string) => {
                    const date: Date = new Date(value);

                    // Самая короткая частота. Нужна для формирования подписей
                    // shortestFrequency определяет размерность оси X
                    let shortestFrequency: Frequency = null;
                    [, shortestFrequency] = TimeSeriesHelper.getShortestInterval(data.data as TSPoint[][], data.dataSets);

                    switch (shortestFrequency) {
                        case 'YEAR':
                            return date.getFullYear();
                        case 'MONTH':
                            return DateHelper.getMonthsAbbr()[date.getMonth()];
                        case 'HOUR':
                            if (this.interval.currInterval === 'DAY') {
                                return ('0' + date.getHours()).slice(-2) + ':00';
                            }
                            break;
                    }
                    return ['0' + date.getDate(), '0' + (date.getMonth() + 1)].map((vv: string) => vv.slice(-2)).join('.');
                },
                offset,
                this.hasHistogram(),
                enableZoom && this.interval.currInterval !== 'DAY'
            );
            res.data = axData.timeSeriesData.dates;
            return res;
        });

        const axesToIndex: {[key: number]: number} = _merge(
            ..._map(dataByAxesKeys, (axisNumber: number): Object => {
                const axData: DataByAxis = dataByAxes[axisNumber];
                return _fromPairs(
                    axData.indexes.map((dataSetIdx: number) =>
                        [dataSetIdx, _findKey(axes, (axesObj: Object) => axesObj['id'] === axisNumber) ?? 0]
                    )
                );
            })
        );

        return {
            axesToIndex,
            axes
        };
    }

    /**
     * Получить данные для осей
     */
    private getYAxes(): {
        axes: Object[],
        axesToIndex: {[key: number]: number}
    } {
        const data: IChartData = this.chartData;
        const axesData: {[key: number]: YAxisData} = {};
        const timeSeriesData: TimeSeriesData = TimeSeriesHelper.convertTimeSeriesToData(data.data as TSPoint[][], data.dataSets, this.interval.cutFrom, this.interval.cutTo);

        // Готовим данные для осей
        if (TypeGuardsHelper.everyIsDataSetTemplate(data.dataSets)) {
            // Отдельно суммируем высоту стеков
            const stackMax: {[key: number]: number} = {};
            const histType: HistogramType = this.getWidgetSetting('histogram.type');

            for (let idx = 0; idx < data.data.length; idx++) {
                const axisNumber: number = +this.getDataSetSettings(idx, 'axisY');
                const chartType: ChartType = this.getDataSetSettings(idx, 'chartType');

                let max: number = _max(timeSeriesData.values[idx]);
                let min: number = _flow(
                    _min,
                    (v: number) => v > 0 ? 0 : v
                )(timeSeriesData.values[idx]);
                [max, min] = MathHelper.roundInterval(max, min);

                if (axesData[axisNumber] !== undefined) {
                    axesData[axisNumber].min = _min([axesData[axisNumber].min, min]);
                    if (histType === 'stack' && chartType === 'HISTOGRAM') {
                        stackMax[axisNumber] += max;
                    } else {
                        axesData[axisNumber].max = _max([axesData[axisNumber].max, max]);
                    }
                    axesData[axisNumber].axesToIndex.push(idx);
                } else {
                    let color: string = this.getAxisSetting('axesY', 'color', axisNumber) as string;
                    if (!color) {
                        // Получаем цвет из цвета графика
                        color = this.getDataSetSettings(idx, 'color');
                    }
                    axesData[axisNumber] = {
                        show: this.getAxisSetting('axesY', 'show', axisNumber),
                        name: this.getAxisSetting('axesY', 'name', axisNumber),
                        nameGap: this.getAxisSetting('axesY', 'nameGap', axisNumber),
                        nameColor: this.getAxisSetting('axesY', 'nameColor', axisNumber),
                        color: color,
                        position: this.getAxisSetting('axesY', 'position', axisNumber),
                        max: 0,
                        min: min,
                        axesToIndex: [idx],
                        showLine: this.getAxisSetting('axesY', 'showLine', axisNumber),
                        showTick: this.getAxisSetting('axesY', 'showTick', axisNumber),
                    };
                    if (histType === 'stack' && chartType === 'HISTOGRAM') {
                        stackMax[axisNumber] = max;
                    } else {
                        axesData[axisNumber].max = max;
                    }
                }
            }

            for (const axisNumber in axesData) {
                if (axesData.hasOwnProperty(axisNumber)) {
                    axesData[axisNumber].max = _max([axesData[axisNumber].max, stackMax[axisNumber]]);
                }
            }
        }

        // Готовим данные для echarts
        const axisYDistance: number = this.getWidgetSetting('axisYDistance');
        let leftAxis = 0;
        let rightAxis = 0;

        const axes: Object[] = _map(axesData, (axisData: YAxisData, k: number): Object => {
            let offset = 0;
            let nameRotate = 0;
            switch (axisData.position) {
                case 'left':
                    nameRotate = 90;
                    offset = leftAxis * axisYDistance;
                    leftAxis++;
                    break;
                case 'right':
                    nameRotate = 270;
                    offset = rightAxis * axisYDistance;
                    rightAxis++;
                    break;
            }

            return SettingsHelper.getYAxisSettings(
                axisData,
                k,
                'value',
                offset,
                nameRotate
            );
        });

        // {1: {axesToIndex: [11,22]}, 2: {axesToIndex: [33]} => {11:0, 22:0, 33:1}
        // {[dataSetIdx: number] : axisIndex}
        const axesToIndex: {[key: number]: number} = _merge(
            ..._map(axesData, (v: YAxisData, axisNumber: number) =>
                _fromPairs( v.axesToIndex.map((dataSetIdx: number) => {
                    return [dataSetIdx, _findKey(axes, (axesObj: Object) => axesObj['id'] === axisNumber) ?? 0];
                }))
            )
        );

        return {
            axesToIndex,
            axes
        };
    }

    /*
     * Порядок определения цветов
        color - главный
        itemStyle: {
            color: '#ff0000' (заливка, маркеры, линия, подписи)
            opacity: (маркеры и подписи)
        }
        lineStyle: {
            opacity: (линия)
            color: (линия)
        },
        label: {
            color: (подписи)
        },
        areaStyle: {
            opacity: (заливка)
            color: (заливка)
        }
     */
    private getLineSeries(idx: number): Object {
        const colorSetting: string = this.getDataSetSettings(idx, 'color');
        const color: IColor = colorSetting ? ColorHelper.hexToColor(colorSetting) : null;

        return this.applySettings(idx, 'LINE', {
            type: 'line',
            smooth: true,
            forComparing: 0,
            seriesLayoutBy: 'column',
            showSymbol: true,
            symbolSize: 4,

            ...(!color ? {} : {
                color: color.hex                // Основной цвет
            }),
            ...(!color ? {} : {
                itemStyle: {
                    opacity: color.opacity      // Прозрачность влияет на все подписи + метки
                }
            }),
            lineStyle: {
                shadowBlur: 2,
                shadowColor: 'rgba(0, 0, 0, 0.3)',
                type: this.getDataSetSettings(idx, 'lineStyle.type'),
                width: this.getDataSetSettings(idx, 'lineStyle.width'),
                ...(!color ? {} : {
                    opacity: color.opacity,         // Прозрачность линии
                })
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

    private getHistogramSeries(idx: number): Object {
        const axisNumber: number = +this.getDataSetSettings(idx, 'axisY');
        const colorSetting: string = this.getDataSetSettings(idx, 'color');
        const color: IColor = colorSetting ? ColorHelper.hexToColor(colorSetting) : null;

        let histogramType: ISettings = {};
        switch (this.getWidgetSetting<HistogramType>('histogram.type')) {
            case "stack":
                histogramType = {
                    stack: `stackHistogram_${axisNumber}`
                };
                break;
            case "overlap":
                histogramType = {
                    barGap: '-100%',
                };
                break;
        }

        return this.applySettings(idx, 'HISTOGRAM', {
            type: 'bar',
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
                borderRadius: [1, 1, 1, 1]
            },
            animation: true,
            animationDelay: 0,
            animationDelayUpdate: 0,
            showSymbol: true,

            barGap: this.getWidgetSetting('histogram.barGap') + '%',
            barCategoryGap: this.getWidgetSetting('histogram.barCategoryGap') + '%',
            ...histogramType        // Обязательно после barGap и barCategoryGap
        });
    }

    /**
     * Добавляем стандартные настройки для каждого dataSet
     */
    private applySettings(idx: number, chartType: ChartType, seriesData: Object): Object {
        seriesData['name'] = this.getDataSetSettings(idx, 'name.name') || ' ';     // Чтобы чтото отобразилось, нужно хотя бы пробел

        _merge(seriesData, SettingsHelper.getLabelSettings(this.widgetSettings.dataSet.settings, this.chartData.dataSets[idx].settings));
        _merge(seriesData, SettingsHelper.getFillSettings(this.widgetSettings.dataSet.settings, this.chartData.dataSets[idx].settings, chartType));

        return seriesData;
    }

    /**
     * Переместиться влево по интервалам
     * NOTE: Если интервалы недоступны, то этот метод не вызовется
     */
    private leftInterval(): void {
        let newDate: Date = null;
        switch (this.interval.currInterval) {
            case 'YEAR':
                newDate = DateHelper.addDate(new Date(this.interval.cutFrom), -1, 0, 0);
                break;
            case 'MONTH':
                newDate = DateHelper.addDate(new Date(this.interval.cutFrom), 0, -1, 0);
                break;
            case 'DAY':
                newDate = DateHelper.addDate(new Date(this.interval.cutFrom), 0, 0, -1);
                break;
        }
        if (newDate !== null) {
            [this.interval.cutFrom, this.interval.cutTo] = this.calcCutInterval(this.interval.currInterval, newDate);
        }

        // Выставляем новые интервалы
        this.chartData.dataSets.forEach((dataSet: DataSetTemplate, idx: number) => {
            dataSet.period = null;
            dataSet.from = DateHelper.yyyymmdd(dayjs(this.interval.cutFrom));
            dataSet.to = DateHelper.yyyymmdd(dayjs(this.interval.cutTo));
        });

        this.redraw().then();
    }

    /**
     * Переместиться вправо по интервалам
     * NOTE: Если интервалы недоступны, то этот метод не вызовется
     */
    private rightInterval(): void {
        let newDate: Date = null;
        switch (this.interval.currInterval) {
            case 'YEAR':
                newDate = DateHelper.addDate(new Date(this.interval.cutFrom), 1, 0, 0);
                break;
            case 'MONTH':
                newDate = DateHelper.addDate(new Date(this.interval.cutFrom), 0, 1, 0);
                break;
            case 'DAY':
                newDate = DateHelper.addDate(new Date(this.interval.cutFrom), 0, 0, 1);
                break;
        }
        if (newDate !== null) {
            [this.interval.cutFrom, this.interval.cutTo] = this.calcCutInterval(this.interval.currInterval, newDate);
        }

        // Выставляем новые интервалы
        this.chartData.dataSets.forEach((dataSet: DataSetTemplate, idx: number) => {
            dataSet.period = null;
            dataSet.from = DateHelper.yyyymmdd(dayjs(this.interval.cutFrom));
            dataSet.to = DateHelper.yyyymmdd(dayjs(this.interval.cutTo));
        });

        this.redraw().then();
    }

    /**
     * Вернуться на верхний интервал
     * NOTE: Если интервалы недоступны, то этот метод не вызовется
     */
    private revertInterval(): void {
        let changed: boolean = false;
        this.chartData.dataSets.forEach((dataSet: DataSetTemplate, idx: number) => {
            if (!StatesHelper.isEmpty(idx)) {
                const obj: ISettings = StatesHelper.getLastChanges(idx);
                _merge(dataSet, obj);
                changed = true;
            }
        });
        if (changed) {
            this.interval = StatesHelper.getLastChanges<Interval>('interval');
            this.redraw().then();
        }
    }

    /**
     * Обработка нажатия на оси X
     * NOTE: Если интервалы недоступны, то этот метод не вызовется
     */
    private onClickAxisX(paramDate: string): void {
        if (this.clickTimeoutId !== null) {
            // Double click detected
            return;
        }
        this.clickTimeoutId = window.setTimeout(() => {
            window.clearTimeout(this.clickTimeoutId);
            this.clickTimeoutId = null;
        }, 300);

        // Проваливаемся на след. интервал
        if (this.interval.currInterval === 'DAY') {
            return;
        }
        StatesHelper.push(_cloneDeep(this.interval), 'interval');

        const newInterval: Frequency = TimeSeriesHelper.decreaseFrequency(this.interval.currInterval, 'DAY');

        // paramDate может в общем случае быть чем угодно, поэтому проверяем
        const date: Date = new Date(paramDate);
        if (!isNaN(date.getTime())) {
            [this.interval.cutFrom, this.interval.cutTo] = this.calcCutInterval(newInterval, date);
        }

        // Считаем новый массив Frequency, проверяем, что он может уменьшаться
        this.chartData.dataSets.forEach((dataSet: DataSetTemplate, idx: number) => {
            StatesHelper.push({
                frequency: dataSet.frequency,
                preFrequency: dataSet.preFrequency,
                from: dataSet.from,
                to: dataSet.to,
                period: dataSet.period
            }, idx);

            // Frequency не может быть больше newInterval, синхронно уменьшаем частоты
            while (TimeSeriesHelper.compareFrequency(dataSet.frequency, newInterval) !== -1) {
                dataSet.frequency = TimeSeriesHelper.decreaseFrequency(dataSet.frequency, 'HOUR');
                dataSet.preFrequency = TimeSeriesHelper.decreaseFrequency(dataSet.preFrequency, 'HOUR');
            }
            dataSet.period = null;
            dataSet.from = DateHelper.yyyymmdd(dayjs(this.interval.cutFrom));
            dataSet.to = DateHelper.yyyymmdd(dayjs(this.interval.cutTo));
        });

        // Refresh widget
        this.redraw().then();
    }

    /**
     * Рассчитать интервал обрезки
     */
    private calcCutInterval(newInterval: Frequency, date: Date): [string, string] {
        let cutFrom: string = null;
        let cutTo: string = null;
        switch (newInterval) {
            // Отображаем месяцы в году
            case 'YEAR':
                cutFrom = DateHelper.toISOString(new Date(date.getFullYear(), 0, 1, 0, 0));
                cutTo = DateHelper.toISOString(new Date(date.getFullYear(), 11, 31, 23, 59));
                break;
            // Отображаем дни в месяце
            case 'MONTH':
                cutFrom = DateHelper.toISOString(new Date(date.getFullYear(), date.getMonth(), 1, 0, 0));
                cutTo = DateHelper.toISOString(new Date(date.getFullYear(), date.getMonth(), DateHelper.getDaysInMonth(date), 23, 59));
                break;
            // Отображаем часы в дне
            case 'DAY':
                cutFrom = DateHelper.toISOString(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0));
                cutTo = DateHelper.toISOString(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59));
                break;
            default:
                throw new Error('Invalid interval: ' + newInterval);
        }
        return [cutFrom, cutTo];
    }

    /**
     * Обработка событий
     * NOTE: все данные меняются прямо в this.config.template
     */
    // tslint:disable-next-line:no-any
    private async onEventBusFunc(varName: VarNames, value: any, dataSourceId: number): Promise<boolean> {
        if (this.options?.logs?.eventBus ?? true) {
            console.groupCollapsed('Spline EventBus data');
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
            <div class="widget" style="{{backgroundStyle}} {{paddingStyle}}">
                {{#showTitle}}
                <div class="header">
                    <div class="title" style="{{titleStyle}}">
                        {{title}}
                    </div>
                    {{#enableZoom}}
                        <div class="toolbox">
                            <div class="btn btn-icon toolbtn" {{#disableBtn}}disabled="disabled"{{/disableBtn}}>
                                <i class="mdi mdi-arrow-left"></i>
                            </div>
                            <div class="btn btn-icon toolbtn" {{#disableBtn}}disabled="disabled"{{/disableBtn}}>
                                <i class="mdi mdi-arrow-up"></i>
                            </div>
                            <div class="btn btn-icon toolbtn" {{#disableBtn}}disabled="disabled"{{/disableBtn}}>
                                <i class="mdi mdi-arrow-right"></i>
                            </div>
                        </div>
                    {{/enableZoom}}
                </div>
                {{/showTitle}}

                <div class="chart">
                </div>
            </div>
        `;
    }
}
