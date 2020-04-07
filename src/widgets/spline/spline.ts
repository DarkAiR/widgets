import s from '../../styles/_all.less';
import w from './spline.less';
import {settings as widgetSettings} from "./settings";

import echarts from 'echarts';
import {
    DataSet,
    IChartData, IColor, ISettings,
    IWidgetVariables,
    SingleDataSource,
} from '../../interfaces';
import * as _get from 'lodash/get';
import * as _set from 'lodash/set';
import * as _map from 'lodash/map';
import * as _forEach from 'lodash/forEach';
import {Chart} from '../../models/Chart';
import {TimeSeriesData, TimeSeriesHelper} from '../../helpers';
import {YAxisTypes} from "../../models/types";
import {TSPoint} from "../../interfaces/graphQL";
import {TypeGuardsHelper} from "../../helpers";
import {IWidgetSettings} from "../../widgetSettings";

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
            const titleSets = _get(data.dataSets[0].settings, 'titleSettings', '');

            const timeSeriesData: TimeSeriesData = TimeSeriesHelper.convertTimeSeriesToData(data.data as TSPoint[][]);

            // Вычисляем количество левых и правых осей
            const axisOffsets = this.calcAxisOffsets();

            const classicSeries: Object[] = this.getClassicSeries(timeSeriesData);
            const comparedSeries: Object[] = this.getComparedSeries(timeSeriesData);
            const series = classicSeries.concat(comparedSeries);
            const yaxis: Object[] = this.getYAxis(timeSeriesData, axisOffsets.offsets);

            const options = {
                grid: {
                    top: '10px',
                    bottom: '20px',
                    // right: axisOffsets.rightAxisAmount ? (axisOffsets.rightAxisAmount * 50) + 'px' : '10px',
                    // left: axisOffsets.leftAxisAmount ? (axisOffsets.leftAxisAmount * 50) + 'px' : '10px',
                    right: axisOffsets.rightAxisAmount ? (axisOffsets.rightAxisAmount * 10) : 0,
                    left: axisOffsets.leftAxisAmount ? (axisOffsets.leftAxisAmount * 10) : 0,
                    containLabel: true
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
                yAxis: yaxis,
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

            this.config.element.innerHTML = this.renderTemplate({
                title: this.getWidgetSetting(data.settings, 'title'),
                titleSets,
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
     * Вычисляем смещения левых и правых осей
     */
    private calcAxisOffsets(): {
        offsets: Array<{ left: number, right: number }>,
        leftAxisAmount: number,
        rightAxisAmount: number
    } {
        if (TypeGuardsHelper.dataSetsIsDataSetTemplate(this.chartData.dataSets)) {
            const axisArray: Array<{ left: number, right: number }> = [];
            let leftAxis = 0;
            let rightAxis = 0;
            for (let idx = 0; idx < this.chartData.data.length; idx++) {
                const axisPos: YAxisTypes = this.getDataSetSettings(this.chartData.dataSets[idx].settings, 'yAxis');
                switch (axisPos) {
                    case "left":
                        axisArray[idx] = {left: (leftAxis * 50), right: 0};
                        leftAxis++;
                        break;
                    case "right":
                        axisArray[idx] = {left: 0, right: (rightAxis * 50)};
                        rightAxis++;
                        break;
                }
            }
            return {offsets: axisArray, leftAxisAmount: leftAxis, rightAxisAmount: rightAxis};
        }
    }

    /**
     * Получить данные для серий
     */
    private getClassicSeries(timeSeriesData: TimeSeriesData): Object[] {
        const data: IChartData = this.chartData;
        const series: Object[] = [];

        if (TypeGuardsHelper.dataSetsIsDataSetTemplate(data.dataSets)) {
            for (let idx = 0; idx < data.data.length; idx++) {
                const dataSetSettings: ISettings = data.dataSets[idx].settings;

                const currColor = this.getColor(dataSetSettings, 'color-yellow');
                let seriesData = {};
                switch (data.dataSets[idx].chartType) {
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
                // areaStyle: {color: {type: "linear", x: 0, y: 0, x2: 0, y2: 1,…}}
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
                    yAxisIndex: idx,
                    ...seriesData
                });
            }
        }
        return series;
    }

    // FIXME Переписать, убрать все кастомные стили и классы
    private getComparedSeries(timeSeriesData: TimeSeriesData): Object[] {
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

                const currColor = this.getColor(data.dataSets[idx].settings, 'color-yellow');
                switch (data.dataSets[idx].chartType) {
                    case "COMPARED_PLAN":
                        planData = timeSeriesData.values[idx];
                        planProps = _get(dataSetSettings, 'seriesSettings', {});
                        planOpts = this.getComparedHistogramSeries(0, currColor);
                        overProps = _get(dataSetSettings, 'overSettings', {});
                        overOpts = this.getComparedHistogramSeries(0, currColor);
                        overColor = _get(dataSetSettings, 'overColor', {});

                        underProps = _get(dataSetSettings, 'underSettings', {});
                        underOpts = this.getComparedHistogramSeries(0, currColor);
                        underColor = _get(dataSetSettings, 'underColor', {});

                        mainColor = _get(dataSetSettings, 'mainColor', {});

                        comparedFlag = true;
                        break;
                    case "COMPARED_FACT":
                        factData = timeSeriesData.values[idx];
                        factProps = _get(dataSetSettings, 'seriesSettings', {});
                        factOpts = this.getComparedHistogramSeries(0, currColor);
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
     * Получить данные для осей
     */
    private getYAxis(
        timeSeriesData: TimeSeriesData,
        axisOffsets: Array<{left: number, right: number}>
    ): Object[] {
        const data: IChartData = this.chartData;
        const yaxis: Object[] = [];

        if (TypeGuardsHelper.dataSetsIsDataSetTemplate(data.dataSets)) {
            for (let idx = 0; idx < data.data.length; idx++) {
                const dataSetSettings: ISettings = data.dataSets[idx].settings;

                if (!_get(dataSetSettings, 'createYAxis', true)) {
                    continue;
                }
                let count = 0;
                const valueArray: number[] = [];
                if (dataSetSettings.yAxisInds !== undefined && dataSetSettings.yAxisInds.length > 0) {
                    for (const v of dataSetSettings.yAxisInds) {
                        timeSeriesData.values[v].forEach((item: number) => {
                            if (item !== undefined) {
                                valueArray.push(item);
                            }
                        });
                        count += timeSeriesData.values[v].length;
                    }
                } else {
                    timeSeriesData.values[idx].forEach((item: number) => {
                        if (item !== undefined) {
                            valueArray.push(item);
                        }
                    });
                    count += timeSeriesData.values[idx].length;
                }

                const negativeMirror = dataSetSettings.negativeMirror || false;

                valueArray.forEach((v: number, i: number, arr: number[]) => arr[i] = Math.abs(v));

                const maxDataValue: string = Math.max(...valueArray) + '';
                const higherBorder: string = this.roundHB(maxDataValue);
                const finalHB = this.magicRound(higherBorder) < Math.ceil(+maxDataValue)
                    ? this.magicRound(this.roundHB(String(Math.ceil(+maxDataValue))))
                    : this.magicRound(higherBorder);


                // Часть логики из сплайна
                const pos: YAxisTypes = this.getDataSetSettings(dataSetSettings, 'yAxis');
                const currColor = this.getColor(dataSetSettings, 'color-grey');

                let offset = 0;
                switch (pos) {
                    case "left":
                        offset = axisOffsets[idx].left;
                        break;
                    case "right":
                        offset = axisOffsets[idx].right;
                        break;
                }

                // const rotate: number = (finalHB < 10000)
                //     ? 0
                //     : (finalHB < 100000 ? 30 : 90);

                const yAxisTemplate = {
                    type: 'value',
                    position: pos,
                    min: negativeMirror ? (0 - finalHB) + '' : '0',
                    max: finalHB + '',
                    offset: offset,
                    splitNumber: negativeMirror ? 6 : 3,
                    minInterval: finalHB / 3 + '',
                    maxInterval: finalHB / 3 + '',
                    // Цифры
                    axisLabel: {
                        color: currColor.hex,
                        fontSize: 12/*,
                        rotate: rotate*/
                    },
                    // Настройки оси
                    axisLine: {
                        lineStyle: {
                            color: currColor.hex
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

                // FIXME: Внешние настройки не должны напрямую менять внутренние настройки конкретного рендера, только через мепинг
                const yAxisSettings = _get(dataSetSettings, 'yAxisSettings', {});
                for (const k in yAxisSettings) {
                    if (yAxisSettings.hasOwnProperty(k)) {
                        if (yAxisSettings[k] !== undefined) {
                            yAxisTemplate[k] = yAxisSettings[k];
                        }
                    }
                }
                yaxis.push(yAxisTemplate);
            }
        }
        return yaxis;
    }

    private roundHB(possibleHB: string): string {
        possibleHB = possibleHB.split('.')[0];
        const isLong = possibleHB.length > 2;
        const nulls = isLong ? 2 : possibleHB.length - 1;
        let nullsStr = '';
        for (let i = 0; i < nulls; i++) {
            nullsStr += '0';
        }
        let firstSigns = '';
        if (isLong) {
            for (let i = 0; i < (possibleHB.length - 2); i++) {
                firstSigns += possibleHB[i];
            }
            firstSigns = (Number(firstSigns) + 1) + '';
        } else {
            firstSigns = (Number(possibleHB[0]) + 1) + '';
        }
        return (possibleHB[0] + nullsStr) === possibleHB
            ? possibleHB
            : firstSigns + nullsStr;
    }

    private checkNums(num: string, lastMeaningDigitInd: number): string {
        if (num[lastMeaningDigitInd] !== '10' || lastMeaningDigitInd === 0) {
            return num;
        }
        if (lastMeaningDigitInd !== 0 && num[lastMeaningDigitInd] === '10') {
            num = this.replaceAt(num, lastMeaningDigitInd, '0');
            num = this.replaceAt(num, lastMeaningDigitInd - 1, String(Number(num[lastMeaningDigitInd - 1]) + 1));
            return this.checkNums(num, lastMeaningDigitInd - 1);
        }
        return num;
    }

    // FIXME: Что за magicRound, называйте, пожалуйста, методы осмысленными названиями, типизируйте, пишете в стиле TS
    private magicRound(v: string): number {
        const num = Number(v);
        if (isNaN(num)) {
            return 0;
        }
        if (num % 3 === 0) {
            return num;
        }

        const lastMeaningDigitInd = v.length > 2
            ? v.length - 3
            : v.length - 1;

        v = this.replaceAt(v, lastMeaningDigitInd, String(Number(v[lastMeaningDigitInd]) + 1));
        v = this.checkNums(v, lastMeaningDigitInd);
        return this.magicRound(v);
    }

    private replaceAt(str: string, index: number, replacement: string): string {
        return str.substr(0, index) + replacement + str.substr(index + replacement.length);
    }

    /**
     * Проверяем, есть ли среди графиков гистограммы
     * Для них необходимо изменить вид графика
     */
    private hasHistogram(): boolean {
        const data: IChartData = this.chartData;
        if (TypeGuardsHelper.dataSetsIsDataSetTemplate(data.dataSets)) {
            for (let idx = 0; idx < data.data.length; idx++) {
                if (data.dataSets[idx].chartType === 'HISTOGRAM') {
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
        areaLabel: {
            opacity: (заливка)
            color: (заливка)
        }
     */
    private getLineSeries(idx: number, color: IColor): Object {
        return this.applySettings(idx, {
            type: 'line',
            smooth: true,
            forComparing: 0,
            xAxisIndex: 0,
            yAxisIndex: idx,
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
        return this.applySettings(idx, {
            name: 'bar ' + idx,
            type: 'bar',
            xAxisIndex: 0,
            yAxisIndex: idx,
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
        return this.applySettings(idx, {
            type: 'bar',
            xAxisIndex: 0,
            yAxisIndex: idx,
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

    private applySettings(idx: number, seriesData: Object): Object {
        const getSetting = <T>(path: string): T => this.getDataSetSettings<T>(this.chartData.dataSets[idx].settings, path);

        // См. https://echarts.apache.org/en/option.html#series-line.label.formatter
        const showLabelFormat = getSetting<boolean>("labelFormat.show");
        const delimiter = getSetting<string>('labelFormat.delimiter') || '.';
        const precision = getSetting<number>('labelFormat.precision') || 0;

        const formatter = (params: Object | []): string => {
            let value: string = params['value'] + '';
            if (showLabelFormat) {
                const v: number = parseFloat(value);
                const integer: string = v !== NaN ? ((v + '').split('.')[0] ?? '') : '';
                const fraction: string = v !== NaN ? ((v + '').split('.')[1] ?? '') : '';
                value = integer + (precision === 0 ? '' : delimiter + fraction.padEnd(precision, '0'));
            }
            return value + (getSetting<boolean>('labelFormat.showMeasure')
                ? getSetting<string>('labelFormat.measure')
                : '');
        };

        Object.assign(seriesData['label'], {
            show: showLabelFormat,
            formatter
        });
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
            case 'view type':
                setVar('chartType', value);
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
                    <div class='${w['row']}'>
                        <div class="${w['title']}" style="{{titleSets}}">
                            {{title}}
                        </div>
                    </div>
                    <div class='${w['row']} ${w['chart']}'>
                    </div>
                </div>
            `;
    }
}
