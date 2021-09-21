import widgetStyles from './static.less';
import {settings as widgetSettings} from "./settings";

import * as echarts from 'echarts';
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
import {AddVarFunc, Chart} from '../../models/Chart';
import {IWidgetSettings} from "../../widgetSettings";
import {ColorHelper, MathHelper, OrgUnitsHelper, SettingsHelper, TypeGuardsHelper} from "../../helpers";
import {WidgetConfigInner} from "../..";
import {WidgetOptions} from "../../models/widgetOptions";

type VarNames = 'org units';

export class Static extends Chart {
    constructor(config: WidgetConfigInner, options: WidgetOptions) {
        super(config, options);
        // Инициализация в конструкторе, чтобы можно было вызвать инициализацию переменных до первого рендера
        this.onEventBus = this.onEventBusFunc.bind(this);
    }

    getVariables(): IWidgetVariables {
        const res: IWidgetVariables = {};
        const addVar: AddVarFunc<VarNames> = this.addVar(res);

        addVar(0, 'org units', 'OrgUnits', 'Выбирается в отдельном виджете');

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

            if (this.options?.logs?.render ?? true) {
                console.groupCollapsed('Static eChart options');
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
                const points: Point[] = pointsData[idx];

                const colorSetting: string = this.getDataSetSettings(idx, 'color');
                const color: IColor = colorSetting ? ColorHelper.hexToColor(colorSetting) : null;

                const label: ISettings = SettingsHelper.getLabelSettings(this.widgetSettings.dataSet.settings, dataSetSettings);
                label.label.position = 'top';
                label.label.formatter = SettingsHelper.formatScatterValue(this.getDataSetSettings(idx, 'label'));

                series.push({
                    type: "scatter",
                    name: this.getDataSetSettings(idx, 'name.name') || ' ',     // Чтобы чтото отобразилось, нужно хотя бы пробел
                    ...(!color ? {} : {
                        color: color.hex                // Основной цвет
                    }),
                    ...(!color ? {} : {
                        itemStyle: {
                            opacity: color.opacity      // Прозрачность влияет на все подписи + метки
                        }
                    }),
                    emphasis: label,
                    symbolSize: this.getDataSetSettings(idx, 'symbolSize'),
                    data: _sortBy(points.map((obj: Point) => [obj.xValue, obj.yValue]), 0)
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
            maxValueLength: this.getWidgetSetting('axisX.maxValueLength'),
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
    private async onEventBusFunc(varName: VarNames, value: any, dataSourceId: number): Promise<boolean> {
        if (this.options?.logs?.eventBus ?? true) {
            console.groupCollapsed('Static EventBus data');
            console.log(varName, '=', value);
            console.log('dataSourceId =', dataSourceId);
            console.groupEnd();
        }

        // const dataSet: DataSetTemplate = this.config.template.dataSets[dataSourceId] as DataSetTemplate;
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
