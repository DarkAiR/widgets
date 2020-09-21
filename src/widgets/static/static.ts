import w from './static.less';
import {settings as widgetSettings} from "./settings";

import echarts from 'echarts';
import {
    max as _max, min as _min,
    isEmpty as _isEmpty,
    sortBy as _sortBy
} from 'lodash';
import {
    DataSetTemplate,
    IChartData, IColor, IEventOrgUnits, ISettings,
    IWidgetVariables, Point, XAxisData, YAxisData
} from '../../interfaces';
import {Chart} from '../../models/Chart';
import {IWidgetSettings} from "../../widgetSettings";
import {MathHelper, OrgUnitsHelper, SettingsHelper, TypeGuardsHelper} from "../../helpers";
import {WidgetConfigInner} from "../..";

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

    constructor(config: WidgetConfigInner) {
        super(config);
        // Инициализация в конструкторе, чтобы можно было вызвать инициализацию переменных до первого рендера
        this.onEventBus = this.onEventBusFunc.bind(this);
    }

    run(): void {
        const data: IChartData = this.chartData;

        if (TypeGuardsHelper.everyIsDataSetTemplate(data.dataSets)) {
            const points: Point[][] = data.data as Point[][];

            const xAxisData = this.getXAxis(points);
            const yAxisData = this.getYAxis(points);

            const legend: Object = SettingsHelper.getLegendSettings(this.widgetSettings.settings, this.chartData.settings);
            const series: Object[] = this.getSeries(points);

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
                legend: legend,
                xAxis: xAxisData,
                yAxis: yAxisData,
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
        }
    }

    private getSeries(pointsData: Point[][]): ISettings[] {
        const data: IChartData = this.chartData;
        const series: ISettings[] = [];

        if (TypeGuardsHelper.everyIsDataSetTemplate(data.dataSets)) {
            for (let idx = 0; idx < data.data.length; idx++) {
                const dataSetSettings: ISettings = data.dataSets[idx].settings;
                const color: IColor = this.getColor(dataSetSettings);
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
                    data: _sortBy(points.map((obj: Point) => [obj.xValue, obj.yValue]), 0),
                    type: "scatter"
                });
            }
        }
        return series;
    }

    /**
     * Получить данные для осей
     */
    private getXAxis(pointsData: Point[][]): Object {
        let max: number = _max(pointsData.map((points: Point[]) => _max(points.map((point: Point) => point.xValue))));
        let min: number = _min(pointsData.map((points: Point[]) => _min(points.map((point: Point) => point.xValue))));
        [max, min] = MathHelper.roundInterval(max, min);

        const axisData: XAxisData = {
            show: this.getWidgetSetting('axisX.show'),
            name: this.getWidgetSetting('axisX.name'),
            nameGap: this.getWidgetSetting('axisX.nameGap'),
            nameColor: this.getWidgetSetting('axisX.nameColor'),
            color: this.getWidgetSetting('axisX.color'),
            position: this.getWidgetSetting('axisX.position'),
            max: max,
            min: min,
            axesToIndex: [],
            showLine: this.getWidgetSetting('axisX.showLine'),
            showTick: this.getWidgetSetting('axisX.showTick'),
        };

        return SettingsHelper.getXAxisSettings(
            axisData,
            0,
            'value',
            null,
            0,
            false,
            false
        );
    }

    /**
     * Получить данные для осей
     */
    private getYAxis(pointsData: Point[][]): Object {
        let max: number = _max(pointsData.map((points: Point[]) => _max(points.map((point: Point) => point.yValue))));
        let min: number = _min(pointsData.map((points: Point[]) => _min(points.map((point: Point) => point.yValue))));
        [max, min] = MathHelper.roundInterval(max, min);

        const axisData: YAxisData = {
            show: this.getWidgetSetting('axisY.show'),
            name: this.getWidgetSetting('axisY.name'),
            nameGap: this.getWidgetSetting('axisY.nameGap'),
            nameColor: this.getWidgetSetting('axisY.nameColor'),
            color: this.getWidgetSetting('axisY.color'),
            position: 'left',   // disable changing position
            max: max,
            min: min,
            axesToIndex: [],
            showLine: this.getWidgetSetting('axisY.showLine'),
            showTick: this.getWidgetSetting('axisY.showTick')
        };

        return SettingsHelper.getYAxisSettings(
            axisData,
            0,
            'value',
            0,
            90
        );
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
                        // Отключаем группировку
                        const event: IEventOrgUnits = value as IEventOrgUnits;
                        event.orgUnitsGroupBy = [];

                        if (OrgUnitsHelper.setOrgUnits(v.dataSource1, event)) {
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
