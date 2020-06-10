import s from '../../styles/_all.less';
import w from './static.less';
import {settings as widgetSettings} from "./settings";

import echarts from 'echarts';
import {max as _max, min as _min, get as _get, map as _map, findKey as _findKey, fromPairs as _fromPairs, merge as _merge, isEmpty as _isEmpty} from 'lodash';
import {
    DataSetTemplate,
    IChartData, IColor, IEventOrgUnits, ISettings,
    IWidgetVariables, AxisData, Point, XAxisData, YAxisData
} from '../../interfaces';
import {Chart} from '../../models/Chart';
import {IWidgetSettings} from "../../widgetSettings";
import {MathHelper, OrgUnitsHelper, SettingsHelper, TypeGuardsHelper} from "../../helpers";
import {WidgetSettingsItem} from "../../widgetSettings/types";
import {XAxisPos, YAxisPos} from "../../models/types";

export class Static extends Chart {
    getVariables(): IWidgetVariables {
        const res: IWidgetVariables = {};
        const addVar = this.addVar(res);

        addVar(0, 'org units', 'OrgUnits', 'Выбирается в отдельном виджете');

        return res;
    }

    getSettings(): IWidgetSettings {
        return widgetSettings;
    }

    run(): void {
        const data: IChartData = this.chartData;

        if (TypeGuardsHelper.everyIsDataSetTemplate(data.dataSets)) {
            const points: Point[][] = data.data as Point[][];

            const axisYDistance: number = this.getWidgetSetting('axisYDistance');
            const axisXDistance: number = 0;    // this.getWidgetSetting('axisXDistance');

            const xAxesData = this.getXAxes(points);
            const yAxesData = this.getYAxes(points);

            // Вычисляем количество осей
            const leftAmount: number = yAxesData.axes.filter((v: Object) => (v['position'] as YAxisPos) === 'left').length;
            const rightAmount: number = yAxesData.axes.filter((v: Object) => (v['position'] as YAxisPos) === 'right').length;
            const topAmount: number = xAxesData.axes.filter((v: Object) => (v['position'] as XAxisPos) === 'top').length;
            const bottomAmount: number = xAxesData.axes.filter((v: Object) => (v['position'] as XAxisPos) === 'bottom').length;

            // Только для одиночных осей
            const containLabel: boolean = leftAmount <= 1 && rightAmount <= 1 && topAmount <= 1 && bottomAmount <= 1;

            const legend: Object = SettingsHelper.getLegendSettings(this.widgetSettings.settings, this.chartData.settings);
            const series: Object[] = this.getSeries(points, yAxesData.axesToIndex, xAxesData.axesToIndex);

            const chartBackgroundSettings: ISettings = SettingsHelper.getGradientSettings(this.getWidgetSetting('chartBackground.color'));
            const chartBackground: Object = _isEmpty(chartBackgroundSettings) ? {} : { backgroundColor: chartBackgroundSettings };

            const options = {
                grid: {
                    show: true,
                    ...chartBackground,
                    top: +this.getWidgetSetting('chartPaddings.top') + (containLabel ? 0 : topAmount * axisXDistance),
                    bottom: +this.getWidgetSetting('chartPaddings.bottom') + (containLabel ? 0 : bottomAmount * axisXDistance),
                    right: +this.getWidgetSetting('chartPaddings.right') + (containLabel ? 0 : (rightAmount * axisYDistance)),
                    left: +this.getWidgetSetting('chartPaddings.left') + (containLabel ? 0 : (leftAmount * axisYDistance)),
                    containLabel: containLabel
                },
                legend: legend,
                xAxis: xAxesData.axes,
                yAxis: yAxesData.axes,
                series: series
            };

            console.groupCollapsed('Static eChart options');
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

            this.onResize = (width: number, height: number) => {
                myChart.resize();
            };
            this.onEventBus = this.onEventBusFunc.bind(this);
        }
    }

    private getSeries(pointsData: Point[][], yAxesToIndex: {[dataSetIdx: number]: number}, xAxesToIndex: {[dataSetIdx: number]: number}): ISettings[] {
        const data: IChartData = this.chartData;
        const series: ISettings[] = [];

        if (TypeGuardsHelper.everyIsDataSetTemplate(data.dataSets)) {
            for (let idx = 0; idx < data.data.length; idx++) {
                const dataSetSettings: ISettings = data.dataSets[idx].settings;
                const color: IColor = this.getColor(dataSetSettings, 'color-yellow');
                const points: Point[] = pointsData[idx];

                const label: ISettings = SettingsHelper.getLabelSettings(this.widgetSettings.dataSet.settings, dataSetSettings);
                label.label.position = 'top';
                label.label.formatter = SettingsHelper.formatScatterValue(this.getDataSetSettings(dataSetSettings, 'label'));

                series.push({
                    name: this.getDataSetSettings<string>(dataSetSettings, 'name') || ' ',     // Чтобы чтото отобразилось, нужно хотя бы пробел
                    color: color.hex,                   // Основной цвет
                    itemStyle: {
                        opacity: color.opacity          // Прозрачность влияет на весь подписи + метки
                    },
                    emphasis: label,
                    symbolSize: this.getDataSetSettings(dataSetSettings, 'symbolSize'),
                    data: points.map((obj: Point) => [obj.xValue, obj.yValue]),
                    type: "scatter",
                    yAxisIndex: yAxesToIndex[idx],
                    xAxisIndex: xAxesToIndex[idx],
                });
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
        const dataObj = axesData.find((v: Object) => +_get(v, 'index') === axisNumber);
        if (dataObj !== undefined) {
            return _get(dataObj, varName, item.default);
        }
        return item.default;
    }

    /**
     * Получить данные для осей
     */
    private getXAxes(pointsData: Point[][]): {
        axes: Object[],
        axesToIndex: {[key: number]: number}
    } {
        const axesData: {[key: number]: XAxisData} = this.getAxes<XAxisPos>(pointsData, false);

        // Готовим данные для echarts
        const axisXDistance: number = this.getWidgetSetting('axisXDistance');
        let topAxis = 0;
        let bottomAxis = 0;

        const axes: Object[] = _map(axesData, (axisData: XAxisData, k: number): Object => {
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

            return SettingsHelper.getXAxisSettings(
                axisData,
                k,
                'value',
                null,
                offset,
                false,
                false
            );
        });

        // {1: {axesToIndex: [11,22]}, 2: {axesToIndex: [33]} => {11:0, 22:0, 33:1}
        // {[dataSetIdx: number] : axisIndex}
        const axesToIndex: {[key: number]: number} = _merge(
            ..._map(axesData, (v: XAxisData, axisNumber: number) =>
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
    private getYAxes(pointsData: Point[][]): {
        axes: Object[],
        axesToIndex: {[key: number]: number}
    } {
        const axesData: {[key: number]: YAxisData} = this.getAxes<YAxisPos>(pointsData, true);

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

    private getAxes<T>(pointsData: Point[][], isYAxis: boolean): {[key: number]: AxisData<T>} {
        const data: IChartData = this.chartData;
        const axesData: { [key: number]: AxisData<T> } = {};

        // Готовим данные для осей
        if (TypeGuardsHelper.everyIsDataSetTemplate(data.dataSets)) {
            for (let idx = 0; idx < data.data.length; idx++) {
                const dataSetSettings: ISettings = data.dataSets[idx].settings;
                const axisNumber: number = +this.getDataSetSettings(dataSetSettings, isYAxis ? 'axisY' : 'axisX');
                const points: Point[] = pointsData[idx];

                const values: number[] = points.map((obj: Point) => isYAxis ? obj.yValue : obj.xValue);
                let max: number = _max(values);
                let min: number = _min(values);
                [max, min] = MathHelper.roundInterval(max, min);

                if (axesData[axisNumber] !== undefined) {
                    axesData[axisNumber].min = _min([axesData[axisNumber].min, min]);
                    axesData[axisNumber].max = _max([axesData[axisNumber].max, max]);
                    axesData[axisNumber].axesToIndex.push(idx);
                } else {
                    const axisSett: string = isYAxis ? 'axesY' : 'axesX';
                    let color: string = this.getAxisSetting(axisSett, 'color', axisNumber) as string;
                    if (!color) {
                        // Получаем цвет из цвета графика
                        color = this.getDataSetSettings(dataSetSettings, 'color');
                    }
                    axesData[axisNumber] = {
                        show: this.getAxisSetting(axisSett, 'show', axisNumber),
                        name: this.getAxisSetting(axisSett, 'name', axisNumber),
                        nameGap: this.getAxisSetting(axisSett, 'nameGap', axisNumber),
                        nameColor: this.getAxisSetting(axisSett, 'nameColor', axisNumber),
                        color: color,
                        position: this.getAxisSetting(axisSett, 'position', axisNumber),
                        max: max,
                        min: min,
                        axesToIndex: [idx],
                        showTick: this.getAxisSetting(axisSett, 'showTick', axisNumber),
                    };
                }
            }
        }
        return axesData;
    }

    /**
     * Обработка событий
     * NOTE: все данные меняются в this.config.template
     */
    // tslint:disable-next-line:no-any
    private onEventBusFunc(varName: string, value: any, dataSourceId: number): boolean {
        console.groupCollapsed('Static EventBus data');
        console.log(varName, '=', value);
        console.log('dataSourceId =', dataSourceId);
        console.groupEnd();

        let needReload = false;
        switch (varName) {
            case 'org units':
                if (TypeGuardsHelper.everyIsDataSetTemplate(this.config.template.dataSets)) {
                    this.config.template.dataSets.forEach((v: DataSetTemplate) => {
                        if (OrgUnitsHelper.setOrgUnits(v.dataSource1, value as IEventOrgUnits)) {
                            needReload = true;
                        }
                    });
                }
                break;
        }
        return needReload;
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
