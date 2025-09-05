import widgetStyles from './pie.less';
import {settings as widgetSettings} from "./settings";

import * as echarts from 'echarts';
import {
    DataSet,
    DataSetTemplate, DataSourceInfo, DimensionInfo,
    IChartData, IEventOrgUnits, INameValue, ISettings,
    IWidgetVariables, SingleDataSource, TSPoint,
} from '../../interfaces';
import {forEach as _forEach} from 'lodash';
import {AddVarFunc, Chart} from '../../models/Chart';
import {
    CategoryDataHelper,
    OrgUnitsHelper,
    SettingsHelper
} from '../../helpers';
import {TypeGuardsHelper} from "../../helpers";
import {IWidgetSettings} from "../../widgetSettings";
import {WidgetConfigInner} from "../..";
import {WidgetOptions} from "../../models/widgetOptions";
import {PieLabelAlign} from "../../types";

type VarNames = 'org units' | 'period' | 'start date' | 'finish date' | 'frequency' | 'pre frequency' | 'operation' | 'version filter';

export class Pie extends Chart {
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
                const options = {
                    tooltip: {
                        trigger: 'item',
                        formatter: (p: ISettings) => {
                            // p.data.value[0]: INameValue[]
                            const content: string = `
                                <tr>
                                    <td style='text-align: right'>${p.marker}</td>
                                    <td>&nbsp;:&nbsp;</td>
                                    <td>${p.data.value}</td>
                                </tr>` +
                                p.data.myValue.map((v: INameValue) => {
                                    // Поддерживается как версия с "Dimension : Value", так и просто с Value
                                    return v.name
                                        ? ` <tr>
                                                <td style='text-align: right'>${v.name}</td>
                                                <td>&nbsp;:&nbsp;</td>
                                                <td>${v.value}</td>
                                            </tr>`
                                        : ` <tr>
                                                <td colspan="3">${v.value}</td>
                                            </tr>`;
                                }).join('');
                            return `<table width="100%" style='padding: 0; margin: 0; border: 0'>${content}</table>`;
                        }
                    },
                    legend: SettingsHelper.getLegendSettings(this.widgetSettings.settings, this.chartData.settings),
                    series: seriesData.series
                };

                if (this.options?.logs?.render ?? true) {
                    console.groupCollapsed('Pie eChart options');
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

    /**
     * @param data Массив всех точек всех датасорсов
     * @param dimInfos Массив всех дименшинов
     */
    private getData(data: TSPoint[][], dimInfos: DimensionInfo[]): {
        xAxisValues: string[],
        series: ISettings[]
    } {
        const res = CategoryDataHelper.createCategoryData(data, dimInfos);

        const series: ISettings[] = [];
        data.forEach((pointsValues: TSPoint[], idx: number) => {
            // Получаем палитру цветов для категорий
            const palette: Array<{color: string}> = this.getDataSetSettings(idx, 'palette');

            series[idx] = {
                type: 'pie',
                name: this.getDataSetSettings(idx, 'name.name') || ' ',    // Чтобы чтото отобразилось, нужно хотя бы пробел
                radius: [`${this.getDataSetSettings<number>(idx, 'radius.radius1') || 0}%`, `${this.getDataSetSettings<number>(idx, 'radius.radius2') || 75}%`],
                center: ['50%', '50%'],
                top: +this.getWidgetSetting('chartPaddings.top'),
                bottom: +this.getWidgetSetting('chartPaddings.bottom'),
                right: +this.getWidgetSetting('chartPaddings.right'),
                left: +this.getWidgetSetting('chartPaddings.left'),
                selectedMode: 'none',       // Убираем анимацию при нажатии
                label: {
                    distanceToLabelLine: +this.getDataSetSettings<number>(idx, 'label.distanceToLabelLine'),
                    alignTo: this.getDataSetSettings<PieLabelAlign>(idx, 'label.alignTo'),
                    ...SettingsHelper.getLabelSettings(this.widgetSettings.dataSet.settings, this.chartData.dataSets[idx].settings).label,
                },
                data: res.data[idx].map(
                    (v: { value: [string, number, INameValue[]] }, categoryIdx: number) => {
                        const itemStyle: ISettings = palette[categoryIdx]?.color
                            ? {itemStyle: {color: palette[categoryIdx].color}}
                            : {};
                        return {
                            value: v.value[1],
                            name: v.value[0],
                            myValue: v.value[2],
                            ...itemStyle,
                        };
                    }
                )
            };
        });

        return {
            xAxisValues: res.labels,
            series
        };
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
