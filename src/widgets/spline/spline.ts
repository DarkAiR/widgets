import s from '../../styles/_all.less';
import w from './spline.less';
import {settings as widgetSettings} from "./settings";

import echarts from 'echarts';
import {
    DataSet,
    IChartData, IColor, IGradient, ISettings,
    IWidgetVariables,
    SingleDataSource,
} from '../../interfaces';
import * as _get from 'lodash/get';
import * as _set from 'lodash/set';
import * as _map from 'lodash/map';
import * as _forEach from 'lodash/forEach';
import * as _fromPairs from 'lodash/fromPairs';
import * as _findKey from 'lodash/findKey';
import * as _merge from 'lodash/merge';
import * as _flow from 'lodash/flow';
import * as _min from 'lodash/min';
import * as _max from 'lodash/max';
import * as _isEmpty from 'lodash/isEmpty';
import {Chart} from '../../models/Chart';
import {ColorHelper, TimeSeriesData, TimeSeriesHelper} from '../../helpers';
import {ChartType, YAxisTypes} from "../../models/types";
import {TSPoint} from "../../interfaces/graphQL";
import {TypeGuardsHelper} from "../../helpers";
import {IWidgetSettings} from "../../widgetSettings";
import {WidgetSettingsItem} from "../../widgetSettings/types";

interface AxesData {
    name: string;
    color: IColor;
    position: YAxisTypes;
    show: boolean;
    max: number;
    min: number;
    axesToIndex: number[];
}

export class Spline extends Chart {
    getVariables(): IWidgetVariables {
        const res: IWidgetVariables = {};
        const addVar = this.addVar(res);
        _forEach(this.config.template.dataSets, (v: DataSet, idx: number) => {
            if (TypeGuardsHelper.isDataSetTemplate(v)) {
                const nameStr: string = v.dataSource1.type === 'SINGLE' ? '(' + (<SingleDataSource>v.dataSource1).name + ')' : '';
                addVar(idx, 'period', 'Период', `${nameStr}: формат см. документацию по template-api`);
                addVar(idx, 'start date', 'Начало выборки', `${nameStr}: YYYY-mm-dd`);
                addVar(idx, 'finish date', 'Окончание выборки', `${nameStr}: YYYY-mm-dd`);
                addVar(idx, 'view type', 'Тип отображения', `${nameStr}: LINE | HISTOGRAM`);
                addVar(idx, 'frequency', 'Частота конечной агрегации', `${nameStr}: YEAR | MONTH | WEEK | DAY | HOUR | ALL`);
                addVar(idx, 'pre frequency', 'Частота выборки для которой выполняется операция, указанная в operation', `${nameStr}: YEAR | MONTH | WEEK | DAY | HOUR | ALL`);
                addVar(idx, 'operation', 'операция, которую необходимо выполнить при агрегации из preFrequency во frequency', `${nameStr}: SUM | AVG | MIN | MAX | DIVIDE`);
            }
        });
        return res;
    }

    getSettings(): IWidgetSettings {
        return widgetSettings;
    }

    run(): void {
        const data: IChartData = this.chartData;

        if (TypeGuardsHelper.dataSetsIsDataSetTemplate(data.dataSets)) {
            // FIXME: Внешние стили нельзя использовать
            const globalCardSets = _get(data.dataSets[0].settings, 'globalCardSettings', '');

            const timeSeriesData: TimeSeriesData = TimeSeriesHelper.convertTimeSeriesToData(data.data as TSPoint[][]);

            const axesData = this.getAxes(timeSeriesData);

            // Вычисляем количество левых и правых осей
            const leftAmount: number = axesData.axes.filter((v: Object) => (v['position'] as YAxisTypes) === 'left').length;
            const rightAmount: number = axesData.axes.filter((v: Object) => (v['position'] as YAxisTypes) === 'right').length;

            const classicSeries: Object[] = this.getClassicSeries(timeSeriesData, axesData.axesToIndex);
            const comparedSeries: Object[] = this.getComparedSeries(timeSeriesData, axesData.axesToIndex);
            const series = classicSeries.concat(comparedSeries);
            const containLabel: boolean = leftAmount <= 1 && rightAmount <= 1;    // Только для одиночных осей

            const axisYDistance: number = this.getWidgetSetting('axisYDistance');

            // NOTE: при containLabel=true ECharts правильно считает ширину отступа для нескольких осей,
            //       но не умеет располагать оси рядом, поэтому, при более чем одной оси, высчитываем отступы вручную
            const options = {
                grid: {
                    top: +this.getWidgetSetting('paddings.top'),
                    bottom: +this.getWidgetSetting('paddings.bottom'),
                    right: +this.getWidgetSetting('paddings.right') + (containLabel ? 0 : (rightAmount * axisYDistance)),
                    left: +this.getWidgetSetting('paddings.left') + (containLabel ? 0 : (leftAmount * axisYDistance)),
                    containLabel: containLabel
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: this.hasHistogram(),
                    // Цифры
                    axisLabel: {
                        formatter: (value: string) => {
                            const date: Date = new Date(value);
                            return ['0' + date.getDate(), '0' + (date.getMonth() + 1)].map((v: string) => v.slice(-2)).join('.');
                        },
                        color: '#b4b4b4',
                        fontSize: 12
                    },
                    // Сетка
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: '#e9e9e9',
                            width: 1,
                            type: 'dashes'
                        }
                    },
                    data: timeSeriesData.dates
                },
                yAxis: axesData.axes,
                tooltip: {
                    axisPointer: {
                        show: true,
                        type: 'line',
                    },
                    formatter: '{c0}'
                },
                series: series
            };

            // FIXME: Глобальные стили не надо
            // globalSettings
            // background: transparent; border-radius: 5px; padding: 10px; box-shadow: 0 1px 2px 0.5px rgba(0,0,0,.25);
            const globalSettings = _get(data.dataSets[0].settings, 'globalSettings', {});
            for (const k in globalSettings) {
                if (globalSettings.hasOwnProperty(k)) {
                    if (globalSettings[k] !== undefined) {
                        options[k] = globalSettings[k];
                    }
                }
            }

            // FIXME: Нельзя открывать прямой доступ к внутренним настройкам визуализатора виджета, т.к. способ рендера может поменяться
            //        Необходимо переделать на мепинг из настроек xAxisSettings в eCharts
            //        Правильным решением будет сделать универсальные настройки для изменения цвета/толщины линии/и т.п.
            // axisLine: {show: false}
            // axisTick: {show: false}
            // axisLabel: {formatter: "{value}.04.2019", color: "rgba(50,50,50,.6)"}
            // splitLine: {show: false}
            const xAxisSettings = _get(data.dataSets[0].settings, 'xAxisSettings', {});
            for (const k in xAxisSettings) {
                if (xAxisSettings.hasOwnProperty(k)) {
                    if (xAxisSettings[k] !== undefined) {
                        options.xAxis[k] = xAxisSettings[k];
                    }
                }
            }

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
                globalCardSets
            });

            const el = this.config.element.getElementsByClassName(w['chart'])[0];
            const myChart = echarts.init(el);
            myChart.setOption(options);

            this.onResize = (width: number, height: number): void => {
                myChart.resize();
            };
            this.onEventBus = this.onEventBusFunc.bind(this);
        }
    }

    /**
     * Получить данные для серий
     */
    private getClassicSeries(timeSeriesData: TimeSeriesData, axesToIndex: {[key: number]: number}): Object[] {
        const data: IChartData = this.chartData;
        const series: Object[] = [];

        if (TypeGuardsHelper.dataSetsIsDataSetTemplate(data.dataSets)) {
            for (let idx = 0; idx < data.data.length; idx++) {
                const dataSetSettings: ISettings = data.dataSets[idx].settings;

                const currColor = this.getColor(dataSetSettings, 'color-yellow');
                let seriesData = {};
                switch (this.getDataSetSettings<ChartType>(dataSetSettings, 'chartType')) {
                    case "LINE":
                        seriesData = this.getLineSeries(idx, currColor);
                        break;
                    case "HISTOGRAM":
                        seriesData = this.getHistogramSeries(idx, currColor);
                        break;
                    default:
                        continue;
                }

                // FIXME: Та же проблема, как в FIXME выше, мы разрешаем кому-то снаружи лезть напрямую в наш рендер
                // symbolSize: 8
                // name: "Эффективность"
                // tooltip: {formatter: "{a}<br>{b}.04.2019: {c}%"}
                // + label: {show: true, formatter: "{c}%", color: "rgba(255,255,255,.6)"}
                // + color: "rgba(255,255,255,.3)"
                // + lineStyle: {type: "dotted", color: "rgba(255,255,255,.3)"}
                // + areaStyle: {color: {type: "linear", x: 0, y: 0, x2: 0, y2: 1,…}}
                // z: 0
                const seriesSettings = _get(dataSetSettings, 'seriesSettings', {});
                for (const k in seriesSettings) {
                    if (seriesSettings.hasOwnProperty(k)) {
                        if (seriesSettings[k] !== undefined) {
                            seriesData[k] = seriesSettings[k];
                        }
                    }
                }

                series.push({
                    data: timeSeriesData.values[idx],
                    yAxisIndex: axesToIndex[idx],
                    ...seriesData
                });
            }
        }
        return series;
    }

    // FIXME Переписать, убрать все кастомные стили и классы
    private getComparedSeries(timeSeriesData: TimeSeriesData, axesToIndex: {[key: number]: number}): Object[] {
        const data: IChartData = this.chartData;
        const series: Object[] = [];

        if (TypeGuardsHelper.dataSetsIsDataSetTemplate(data.dataSets)) {
            let factData = [];
            let factProps = {};
            let factOpts = {};

            let planData = [];
            let planProps = {};
            let planOpts = {};

            // const overData = [];
            let overProps = {};
            let overOpts = {};
            let overColor = '';

            let underProps = {};
            let underOpts = {};
            let underColor = '';

            let mainColor = '';

            let comparedFlag = false;

            for (let idx = 0; idx < data.data.length; idx++) {
                const dataSetSettings: ISettings = data.dataSets[idx].settings;

                const currColor = this.getColor(dataSetSettings, 'color-yellow');
                switch (this.getDataSetSettings<ChartType>(dataSetSettings, 'chartType')) {
                    case "COMPARED_PLAN":
                        planData = timeSeriesData.values[idx];
                        planProps = _get(dataSetSettings, 'seriesSettings', {});
                        planOpts = this.getComparedHistogramSeries(idx, currColor);
                        _merge(planOpts, {
                            yAxisIndex: axesToIndex[idx]
                        });

                        overProps = _get(dataSetSettings, 'overSettings', {});
                        overColor = _get(dataSetSettings, 'overColor', {});
                        overOpts = this.getComparedHistogramSeries(idx, currColor);
                        _merge(overOpts, {
                            yAxisIndex: axesToIndex[idx]
                        });

                        underProps = _get(dataSetSettings, 'underSettings', {});
                        underColor = _get(dataSetSettings, 'underColor', {});
                        underOpts = this.getComparedHistogramSeries(0, currColor);
                        _merge(underOpts, {
                            yAxisIndex: axesToIndex[idx]
                        });

                        mainColor = _get(dataSetSettings, 'mainColor', {});

                        comparedFlag = true;
                        break;
                    case "COMPARED_FACT":
                        factData = timeSeriesData.values[idx];
                        factProps = _get(dataSetSettings, 'seriesSettings', {});
                        factOpts = this.getComparedHistogramSeries(0, currColor);
                        _merge(factOpts, {
                            yAxisIndex: axesToIndex[idx]
                        });

                        comparedFlag = true;
                        break;
                }
            }

            if (!comparedFlag) {
                return series;
            }

            for (const a in factProps) {
                if (factProps[a] !== undefined) {
                    factOpts[a] = factProps[a];
                }
            }

            for (const b in planProps) {
                if (planProps[b] !== undefined) {
                    planOpts[b] = planProps[b];
                }
            }

            for (const c in overProps) {
                if (overProps[c] !== undefined) {
                    overOpts[c] = overProps[c];
                }
            }

            for (const c in underProps) {
                if (underProps[c] !== undefined) {
                    underOpts[c] = underProps[c];
                }
            }

            const dates = _map(timeSeriesData.dates, (v: string) => new Date(v).getDate());

            for (let i = 0; i < timeSeriesData.dates.length; i++) {
                const overValue = factData[i] - planData[i];
                const underValue = planData[i] - factData[i];
                const currTime = dates[i];
                if (overValue > 0) {
                    // удаляем бар факта
                    factOpts['data'].push({
                        value: [currTime, 0],
                        name: currTime,
                        itemStyle: {
                            barBorderRadius: [500, 500, 0, 0]
                        }
                    });

                    planOpts['data'].push({
                        value: [currTime, planData[i]],
                        name: currTime,
                        itemStyle: {
                            barBorderRadius: [0, 0, 0, 0]
                        }
                    });

                    // добавляем over
                    overOpts['data'].push({
                        value: [currTime, overValue],
                        name: currTime,
                        itemStyle: {
                            barBorderRadius: [500, 500, 0, 0],
                            color: overColor
                        }
                    });
                } else {
                    // логика при недостатке
                    // fact
                    factOpts['data'].push({
                        value: [currTime, factData[i]],
                        name: currTime,
                        itemStyle: {
                            barBorderRadius: [500, 500, 0, 0]
                        }
                    });

                    // plan
                    planOpts['data'].push({
                        value: [currTime, 0],
                        name: currTime,
                        itemStyle: {
                            barBorderRadius: [0, 0, 0, 0]
                        }
                    });

                    // over
                    underOpts['data'].push({
                        value: [currTime, underValue],
                        name: currTime,
                        itemStyle: {
                            barBorderRadius: [500, 500, 0, 0],
                            color: underColor
                        }
                    });
                }
            }

            series.push(factOpts, planOpts, overOpts, underOpts);
        }
        return series;
    }

    /**
     * Получить настройку конкретной оси
     */
    private getAxisSetting<T>(axisName: string, varName: string, axisNumber: number): T {        // unknown, чтобы обязательно указывать тип
        const axesData = this.getWidgetSetting<Object[]>(axisName);
        const item: WidgetSettingsItem = this.getWidgetSettingByPath(this.widgetSettings.settings, [axisName, varName]);
        const dataObj = axesData.find((v: Object) => +_get(v, 'index') === axisNumber);
        if (dataObj !== undefined) {
            return _get(dataObj, varName, item.default);
        }
        return item.default;
    }

    /**
     * Получить данные для осей
     */
    private getAxes(timeSeriesData: TimeSeriesData): {
        axes: Object[],
        axesToIndex: {[key: number]: number}
    } {
        const data: IChartData = this.chartData;
        const axesData: {[key: number]: AxesData} = {};

        if (TypeGuardsHelper.dataSetsIsDataSetTemplate(data.dataSets)) {
            const axesY = this.getWidgetSetting<unknown[]>('axesY');
            for (let idx = 0; idx < data.data.length; idx++) {
                const dataSetSettings: ISettings = data.dataSets[idx].settings;

                const axisNumber: number = +this.getDataSetSettings(dataSetSettings, 'axis');

                const max: number = _max(timeSeriesData.values[idx]);
                const min: number = _flow(
                    _min,
                    (v: number) => v > 0 ? 0 : v
                )(timeSeriesData.values[idx]);

                if (axesData[axisNumber] !== undefined) {
                    axesData[axisNumber].min = _min([axesData[axisNumber].min, min]);
                    axesData[axisNumber].max = _max([axesData[axisNumber].max, max]);
                    axesData[axisNumber].axesToIndex.push(idx);
                } else {
                    const color: string = this.getAxisSetting('axesY', 'color', axisNumber) as string;
                    axesData[axisNumber] = {
                        name: this.getAxisSetting('axesY', 'name', axisNumber),
                        color: ColorHelper.hexToColor(!color ? '#000000' : color, 'color-yellow'),
                        position: this.getAxisSetting('axesY', 'position', axisNumber),
                        show: this.getAxisSetting('axesY', 'show', axisNumber),
                        max: max,
                        min: min,
                        axesToIndex: [idx]
                    };
                }
            }
        }

        const axisYDistance: number = this.getWidgetSetting('axisYDistance');
        let leftAxis = 0;
        let rightAxis = 0;

        const axes: Object[] = _map(axesData, (v: AxesData, k: number): Object => {
            let offset = 0;
            switch (v.position) {
                case 'left':
                    offset = leftAxis * axisYDistance;
                    leftAxis++;
                    break;
                case 'right':
                    offset = rightAxis * axisYDistance;
                    rightAxis++;
                    break;
            }
            return {
                id: k,                                  // Записываем в id реальный индекс оси
                type: 'value',
                position: v.position,
                min: v.min,
                max: v.max,
                offset: offset,
                splitNumber: 3,                         // На сколько делить ось
                // minInterval: maxY / 3,                  // Минимальный размер интервала
                // maxInterval: maxY / 3,                  // Максимальный размер интервала
                // Цифры
                axisLabel: {
                    color: v.color.hex,
                    fontSize: 12
                },
                // Настройки оси
                axisLine: {
                    lineStyle: {
                        color: v.color.hex
                    }
                },
                // Сетка
                splitLine: {
                    lineStyle: {
                        color: '#e9e9e9',
                        width: 1,
                        type: 'solid'
                    }
                }
            };
        });

        // {1: {axesToIndex: [11,22]}, 2: {axesToIndex: [33]} => {11:0, 22:0, 33:1}
        const axesToIndex: {[key: number]: number} = _merge(
            ..._map(axesData, (v: AxesData, axisNumber: number) =>
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

    /**
     * Проверяем, есть ли среди графиков гистограммы
     * Для них необходимо изменить вид графика
     */
    private hasHistogram(): boolean {
        const data: IChartData = this.chartData;
        if (TypeGuardsHelper.dataSetsIsDataSetTemplate(data.dataSets)) {
            for (let idx = 0; idx < data.data.length; idx++) {
                if (this.getDataSetSettings<ChartType>(data.dataSets[idx].settings, 'chartType') === 'HISTOGRAM') {
                    return true;
                }
            }
        }
        return false;
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
            name: 'bar ' + idx,
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

    private getComparedHistogramSeries(idx: number, color: IColor): Object {
        return this.applySettings(idx, 'HISTOGRAM', {
            type: 'bar',
            xAxisIndex: 0,
            seriesLayoutBy: 'column',
            stack: 'stackCompared',

            color: color.hex,                   // Основной цвет
            itemStyle: {
                opacity: color.opacity          // Прозрачность влияет на весь подписи + метки
            },
            label: {
                show: false,
                color: color.hexWithAlpha,
                position: 'inside',
                distance: 0,
                rotate: 0,
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
            data: []
        });
    }

    private applySettings(idx: number, chartType: ChartType, seriesData: Object): Object {
        const getSetting = <T = void>(path: string): T => this.getDataSetSettings<T>(this.chartData.dataSets[idx].settings, path);

        // См. https://echarts.apache.org/en/option.html#series-line.label.formatter
        if (getSetting<boolean>('label.show')) {
            const delimiter: string = getSetting('label.delimiter') || '.';
            const precision: number = getSetting('label.precision') || 0;
            const measure = getSetting<boolean>('label.showMeasure')
                ? getSetting<string>('label.measure')
                : '';

            const formatter = (params: Object | []): string => {
                let value: string = params['value'] + '';
                const v: number = parseFloat(value);
                const integer: string = v !== NaN ? ((v + '').split('.')[0] ?? '') : '';
                const fraction: string = v !== NaN ? ((v + '').split('.')[1] ?? '') : '';
                value = integer + (+precision === 0 ? '' : (delimiter + fraction.padEnd(precision, '0')));
                return value + measure;
            };
            _merge(seriesData, {
                label: {
                    show: true,
                    formatter,
                    fontSize: getSetting<number>('label.fontSize'),
                    color: getSetting<string>('label.color')
                }
            });
        } else {
            _merge(seriesData, {
                label: {
                    show: false
                }
            });
        }

        if (getSetting<boolean>('fill.show')) {
            const gradient: IGradient = getSetting('fill.color');
            let angle: number = gradient.rotate % 360;
            if (angle < 0) {
                angle = 360 + angle;
            }
            // Переводим угол в координаты градиента
            const sin: number = Math.sin(angle / 180 * Math.PI) / 2;
            const cos: number = Math.cos(angle / 180 * Math.PI) / 2;
            let coords = [0.5 - cos, 0.5 - sin, 0.5 + cos, 0.5 + sin];
            coords = coords.map((v: number) => +v.toFixed(2));
            let colorsStart: number = 0;
            const colorsOffs: number = gradient.colors.length <= 1 ? 1 : 1 / (gradient.colors.length - 1);
            const colors: Object[] = gradient.colors.map((c: string) => {
                const res: Object = {
                    offset: colorsStart,
                    color: c
                };
                colorsStart += colorsOffs;
                return res;
            });
            const color = {
                type: 'linear',
                x: coords[0],
                y: coords[1],
                x2: coords[2],
                y2: coords[3],
                colorStops: colors
            };

            switch (chartType) {
                case 'LINE':
                    _merge(seriesData, {
                        areaStyle: {
                            color
                        }
                    });
                    break;
                case 'HISTOGRAM':
                    _merge(seriesData, {
                        itemStyle: {
                            color
                        }
                    });
                    break;
            }
        }
        return seriesData;
    }

    private onEventBusFunc(varName: string, value: string, dataSourceId: number): boolean {
        console.log('Spline listenStateChange:', varName, value, dataSourceId);

        // NOTE: Делаем через switch, т.к. в общем случае каждая обработка может содержать дополнительную логику

        let needReload = false;
        const setVar = (prop: string, v: string) => {
            _set(this.config.template.dataSets[dataSourceId], prop, v);
            needReload = true;
        };
        switch (varName) {
            case 'start date':
                setVar('from', value);
                break;
            case 'finish date':
                setVar('to', value);
                break;
            case 'period':
                setVar('period', value);
                break;
            case 'frequency':
                setVar('frequency', value);
                break;
            case 'pre frequency':
                setVar('preFrequency', value);
                break;
            case 'operation':
                setVar('operation', value);
                break;
        }
        return needReload;
    }

    getTemplate(): string {
        return `
                <div class='${s['widget']}  ${w['widget']}' style="{{globalCardSets}}">
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
