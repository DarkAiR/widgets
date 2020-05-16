import s from '../../styles/_all.less';
import w from './spline.less';
import {settings as widgetSettings} from "./settings";

import echarts from 'echarts';
import {
    DataSet,
    IChartData, IColor, ISettings,
    IWidgetVariables,
    SingleDataSource,
    DataSetTemplate, IEventOrgUnits, IGradient,
} from '../../interfaces';
import {
    get as _get, set as _set, map as _map, forEach as _forEach,
    fromPairs as _fromPairs, findKey as _findKey, merge as _merge, flow as _flow,
    min as _min, max as _max
} from 'lodash';
import {Chart} from '../../models/Chart';
import {SettingsHelper, TimeSeriesData, TimeSeriesHelper} from '../../helpers';
import {ChartType, LegendPos, XAxisPos, YAxisPos} from "../../models/types";
import {TSPoint, DimensionFilter} from "../../interfaces/graphQL";
import {TypeGuardsHelper} from "../../helpers";
import {IWidgetSettings} from "../../widgetSettings";
import {WidgetSettingsItem} from "../../widgetSettings/types";
import {pochtaDataSources} from "../../models/pochtaDataSources";

interface XAxesData {
    name: string;
    nameGap: number;
    nameColor: string;
    color: string;
    position: XAxisPos;
    show: boolean;
    axesToIndex: number[];
    showTick: boolean;
}

interface YAxesData {
    name: string;
    nameGap: number;
    nameColor: string;
    color: string;
    position: YAxisPos;
    show: boolean;
    max: number;
    min: number;
    axesToIndex: number[];
    showTick: boolean;
}

export class Spline extends Chart {
    getVariables(): IWidgetVariables {
        const res: IWidgetVariables = {};
        const addVar = this.addVar(res);

        addVar(0, 'org units', 'OrgUnits', 'Выбирается в отдельном виджете');

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

        if (TypeGuardsHelper.everyIsDataSetTemplate(data.dataSets)) {
            // FIXME: Внешние стили нельзя использовать
            const globalCardSets = _get(data.dataSets[0].settings, 'globalCardSettings', '');

            const timeSeriesData: TimeSeriesData = TimeSeriesHelper.convertTimeSeriesToData(data.data as TSPoint[][]);

            const xAxesData = this.getXAxes(timeSeriesData);
            const yAxesData = this.getYAxes(timeSeriesData);

            // Вычисляем количество осей
            const leftAmount: number    = yAxesData.axes.filter((v: Object) => (v['position'] as YAxisPos) === 'left').length;
            const rightAmount: number   = yAxesData.axes.filter((v: Object) => (v['position'] as YAxisPos) === 'right').length;
            const topAmount: number     = xAxesData.axes.filter((v: Object) => (v['position'] as XAxisPos) === 'top').length;
            const bottomAmount: number  = xAxesData.axes.filter((v: Object) => (v['position'] as XAxisPos) === 'bottom').length;

            const classicSeries: Object[] = this.getClassicSeries(timeSeriesData, yAxesData.axesToIndex);
            const comparedSeries: Object[] = this.getComparedSeries(timeSeriesData, yAxesData.axesToIndex);
            const series = classicSeries.concat(comparedSeries);

            // Только для одиночных осей
            const containLabel: boolean = leftAmount <= 1 && rightAmount <= 1 && topAmount <= 1 && bottomAmount <= 1;

            const axisYDistance: number = this.getWidgetSetting('axisYDistance');
            const axisXDistance: number = this.getWidgetSetting('axisXDistance');

            const legend: Object = this.getLegend();

            const backgroundColor: IGradient = this.getWidgetSetting('backgroundColor');
            const background: ISettings = backgroundColor.colors.length
                ? { backgroundColor: SettingsHelper.getGradientSettings(backgroundColor) }
                : {};

            // NOTE: при containLabel=true ECharts правильно считает ширину отступа для нескольких осей,
            //       но не умеет располагать оси рядом, поэтому, при более чем одной оси, высчитываем отступы вручную
            const options = {
                ...background,
                grid: {
                    top: +this.getWidgetSetting('paddings.top') + (containLabel ? 0 : topAmount * axisXDistance),
                    bottom: +this.getWidgetSetting('paddings.bottom') + (containLabel ? 0 : bottomAmount * axisXDistance),
                    right: +this.getWidgetSetting('paddings.right') + (containLabel ? 0 : (rightAmount * axisYDistance)),
                    left: +this.getWidgetSetting('paddings.left') + (containLabel ? 0 : (leftAmount * axisYDistance)),
                    containLabel: containLabel
                },
                tooltip: {
                    axisPointer: {
                        show: true,
                        type: 'line',
                    },
                    formatter: '{c0}'
                },
                legend: legend,
                xAxis: xAxesData.axes,
                yAxis: yAxesData.axes,
                series: series
            };

            console.groupCollapsed('Spline eChart options');
            console.log(options);
            console.log(JSON.stringify(options));
            console.groupEnd();

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

            const titleSettings = SettingsHelper.getTitleSettings(this.widgetSettings.settings, this.chartData.settings);

            this.config.element.innerHTML = this.renderTemplate({
                showTitle: titleSettings.show,
                title: titleSettings.name,
                titleStyle: titleSettings.style,
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

        if (TypeGuardsHelper.everyIsDataSetTemplate(data.dataSets)) {
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
                // + name: "Эффективность"
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

        if (TypeGuardsHelper.everyIsDataSetTemplate(data.dataSets)) {
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
        const item: WidgetSettingsItem = SettingsHelper.getWidgetSettingByPath(this.widgetSettings.settings, [axisName, varName]);
        const dataObj = axesData.find((v: Object) => +_get(v, 'index') === axisNumber);
        if (dataObj !== undefined) {
            return _get(dataObj, varName, item.default);
        }
        return item.default;
    }

    /**
     * Получить данные для осей
     */
    private getXAxes(timeSeriesData: TimeSeriesData): {
        axes: Object[],
        axesToIndex: {[key: number]: number}
    } {
        const data: IChartData = this.chartData;
        const axesData: {[key: number]: XAxesData} = {};
        const timeSeriesArr = [timeSeriesData.dates];

        /*
            Готовим данные для осей
         */
        if (TypeGuardsHelper.everyIsDataSetTemplate(data.dataSets)) {
            // const axesX = this.getWidgetSetting<unknown[]>('axesX');

            for (let idx = 0; idx < timeSeriesArr.length; idx++) {
                const axisNumber: number = 1;   // +this.getDataSetSettings(dataSetSettings, 'axisX');

                if (axesData[axisNumber] !== undefined) {
                    axesData[axisNumber].axesToIndex.push(idx);
                } else {
                    const color: string = this.getAxisSetting('axesX', 'color', axisNumber) as string;
                    axesData[axisNumber] = {
                        show: this.getAxisSetting('axesX', 'show', axisNumber),
                        name: this.getAxisSetting('axesX', 'name', axisNumber),
                        nameGap: this.getAxisSetting('axesX', 'nameGap', axisNumber),
                        nameColor: this.getAxisSetting('axesX', 'nameColor', axisNumber),
                        color: color,
                        position: this.getAxisSetting('axesX', 'position', axisNumber),
                        axesToIndex: [idx],
                        showTick: this.getAxisSetting('axesX', 'showTick', axisNumber),
                    };
                }
            }
        }

        /*
            Готовим данные для echarts
         */
        const axisXDistance: number = this.getWidgetSetting('axisXDistance');
        let topAxis = 0;
        let bottomAxis = 0;

        const axes: Object[] = _map(axesData, (axisData: XAxesData, k: number): Object => {
            const nameObj = {};
            if (axisData.name) {
                nameObj['name'] = axisData.name;
                nameObj['nameLocation'] = 'middle';
            }
            if (axisData.nameGap) {
                nameObj['nameGap'] = axisData.nameGap;
            }
            if (axisData.nameColor) {
                nameObj['nameTextStyle'] = {
                    color: axisData.nameColor
                };
            }

            let offset = 0;
            switch (axisData.position) {
                case 'top':
                    offset = topAxis * axisXDistance;
                    topAxis++;
                    break;
                case 'bottom':
                    offset = bottomAxis * axisXDistance;
                    bottomAxis++;
                    break;
            }

            // Цифры
            const axisLabel: ISettings = {
                formatter: (value: string) => {
                    const date: Date = new Date(value);
                    return ['0' + date.getDate(), '0' + (date.getMonth() + 1)].map((vv: string) => vv.slice(-2)).join('.');
                },
                fontSize: 12
            };
            // Настройки оси
            const axisLine: ISettings = {
                lineStyle: {}
            };
            if (!!axisData.color) {
                axisLabel.color = axisData.color;
                axisLine.lineStyle.color = axisData.color;
            }

            const res = {
                id: k,                                  // Записываем в id реальный индекс оси
                type: 'category',
                show: axisData.show,
                position: axisData.position,
                boundaryGap: this.hasHistogram(),
                offset: offset,
                axisLabel,
                axisLine,
                // Насечки на оси
                axisTick: {
                    show: axisData.showTick
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
                data: timeSeriesArr[axisData.axesToIndex[0]]       // FIXME: собирать данные со всех осей
            };
            _merge(res, nameObj);
            return res;
        });

        // {1: {axesToIndex: [11,22]}, 2: {axesToIndex: [33]} => {11:0, 22:0, 33:1}
        const axesToIndex: {[key: number]: number} = _merge(
            ..._map(axesData, (v: XAxesData, axisNumber: number) =>
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
     * Получить данные для осей
     */
    private getYAxes(timeSeriesData: TimeSeriesData): {
        axes: Object[],
        axesToIndex: {[key: number]: number}
    } {
        const data: IChartData = this.chartData;
        const axesData: {[key: number]: YAxesData} = {};

        /*
            Готовим данные для осей
         */
        if (TypeGuardsHelper.everyIsDataSetTemplate(data.dataSets)) {
            for (let idx = 0; idx < data.data.length; idx++) {
                const dataSetSettings: ISettings = data.dataSets[idx].settings;

                const axisNumber: number = +this.getDataSetSettings(dataSetSettings, 'axisY');

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
                    let color: string = this.getAxisSetting('axesY', 'color', axisNumber) as string;
                    if (!color) {
                        // Получаем цвет из цвета графика
                        color = this.getDataSetSettings(dataSetSettings, 'color');
                    }
                    axesData[axisNumber] = {
                        show: this.getAxisSetting('axesY', 'show', axisNumber),
                        name: this.getAxisSetting('axesY', 'name', axisNumber),
                        nameGap: this.getAxisSetting('axesY', 'nameGap', axisNumber),
                        nameColor: this.getAxisSetting('axesY', 'nameColor', axisNumber),
                        color: color,
                        position: this.getAxisSetting('axesY', 'position', axisNumber),
                        max: max,
                        min: min,
                        axesToIndex: [idx],
                        showTick: this.getAxisSetting('axesY', 'showTick', axisNumber),
                    };
                }
            }
        }

        /*
            Готовим данные для echarts
         */
        const axisYDistance: number = this.getWidgetSetting('axisYDistance');
        let leftAxis = 0;
        let rightAxis = 0;

        const axes: Object[] = _map(axesData, (axisData: YAxesData, k: number): Object => {
            const nameObj = {};
            if (axisData.name) {
                nameObj['name'] = axisData.name;
                nameObj['nameLocation'] = 'middle';
            }
            if (axisData.nameGap) {
                nameObj['nameGap'] = axisData.nameGap;
            }
            if (axisData.nameColor) {
                nameObj['nameTextStyle'] = {
                    color: axisData.nameColor
                };
            }

            let offset = 0;
            switch (axisData.position) {
                case 'left':
                    nameObj['nameRotate'] = 90;
                    offset = leftAxis * axisYDistance;
                    leftAxis++;
                    break;
                case 'right':
                    nameObj['nameRotate'] = 270;
                    offset = rightAxis * axisYDistance;
                    rightAxis++;
                    break;
            }

            // Цифры
            const axisLabel: ISettings = {
                fontSize: 12
            };

            // Настройки оси
            const axisLine: ISettings = {
                lineStyle: {}
            };

            if (!!axisData.color) {
                axisLabel.color = axisData.color;
                axisLine.lineStyle.color = axisData.color;
            }

            const res = {
                id: k,                                  // Записываем в id реальный индекс оси
                type: 'value',
                show: axisData.show,
                position: axisData.position,
                min: axisData.min,
                max: axisData.max,
                offset: offset,
                splitNumber: 3,                         // На сколько делить ось
                // minInterval: maxY / 3,                  // Минимальный размер интервала
                // maxInterval: maxY / 3,                  // Максимальный размер интервала
                axisLabel,
                axisLine,
                // Насечки на оси
                axisTick: {
                    show: axisData.showTick
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
            _merge(res, nameObj);
            return res;
        });

        // {1: {axesToIndex: [11,22]}, 2: {axesToIndex: [33]} => {11:0, 22:0, 33:1}
        const axesToIndex: {[key: number]: number} = _merge(
            ..._map(axesData, (v: YAxesData, axisNumber: number) =>
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
        if (TypeGuardsHelper.everyIsDataSetTemplate(data.dataSets)) {
            for (let idx = 0; idx < data.data.length; idx++) {
                if (this.getDataSetSettings<ChartType>(data.dataSets[idx].settings, 'chartType') === 'HISTOGRAM') {
                    return true;
                }
            }
        }
        return false;
    }

    private getLegend(): Object {
        const align: LegendPos = this.getWidgetSetting('legend.position');
        const gap: number = +this.getWidgetSetting('legend.gap');
        let obj: ISettings = {};
        switch (align) {
            case "top":
                obj = {
                    orient: 'horizontal',
                    top: gap,
                };
                break;
            case "right":
                obj = {
                    orient: 'vertical',
                    right: gap,
                    top: 'middle'
                };
                break;
            case "bottom":
                obj = {
                    orient: 'horizontal',
                    bottom: gap,
                };
                break;
            case "left":
                obj = {
                    orient: 'vertical',
                    left: gap,
                    top: 'middle'
                };
                break;
        }
        _merge(obj, {
            show: this.getWidgetSetting('legend.show'),
            type: 'plain',
            align: 'left'
        });
        return obj;
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

    // tslint:disable-next-line:no-any
    private onEventBusFunc(varName: string, value: any, dataSourceId: number): boolean {
        console.groupCollapsed('Spline EventBus data');
        console.log(varName, '=', value);
        console.log('dataSourceId =', dataSourceId);
        console.groupEnd();

        // NOTE: Делаем через switch, т.к. в общем случае каждая обработка может содержать дополнительную логику

        let needReload = false;
        const setVar = (prop: string, v: string) => {
            _set(this.config.template.dataSets[dataSourceId], prop, v);
            needReload = true;
        };

        switch (varName) {
            case 'org units':
                needReload = this.processingOrgUnits(value as IEventOrgUnits);
                break;
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

    private processingOrgUnits(event: IEventOrgUnits): boolean {
        let needReload = false;
        if (TypeGuardsHelper.everyIsDataSetTemplate(this.chartData.dataSets)) {
            this.chartData.dataSets.forEach((v: DataSetTemplate) => {
                if (TypeGuardsHelper.isSingleDataSource(v.dataSource1)) {
                    // Ищем dataSource для почты
                    if (pochtaDataSources.includes(v.dataSource1.name)) {
                        for (const dimName in event) {
                            if (!event.hasOwnProperty(dimName)) {
                                continue;
                            }
                            // NOTE: Нельзя проверять на event[dimName].length, т.к. тогда остануться данные с прошлого раза
                            const dim: DimensionFilter = v.dataSource1.dimensions.find((d: DimensionFilter) => d.name === dimName);
                            if (dim) {
                                dim.values = event[dimName];
                            } else {
                                // Пустые данные не приходят в виджет, поэтому dimension может и не быть
                                const newFilter: DimensionFilter = {
                                    name: dimName,
                                    values: event[dimName],
                                    expression: '',
                                    groupBy: false
                                };
                                v.dataSource1.dimensions.push(newFilter);
                            }
                            needReload = true;
                        }
                    }
                }
            });
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
