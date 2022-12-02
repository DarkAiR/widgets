import widgetStyles from "./productionPlan.less";
import {settings as widgetSettings} from "./settings";

import {
    IChartData,
    IWidgetVariables,
    IEventOrgUnits, DataSetTemplate, ISettings, DataSet, SingleDataSource, JoinDataSetTemplate, TimeSeriesDataSetShort, DimensionFilter
} from "../../interfaces";
import {
    forEach as _forEach
} from 'lodash';
import {AddVarFunc, Chart} from "../../models/Chart";
import {ColorHelper, OrgUnitsHelper, SettingsHelper, TypeGuardsHelper} from "../../helpers";
import {IWidgetSettings} from "../../widgetSettings";
import {WidgetConfigInner} from "../..";
import {WidgetOptions} from "../../models/widgetOptions";
import * as echarts from "echarts";

type VarNames = 'org units' | 'kpi' | 'start date' | 'finish date' | 'selected' | 'title';

/**
 * События hover обрабатываются в самом виджете (при вкл enableEvents)
 * Событие click не обрабатывается, чтобы не делать слушателя на входной click для эмуляции нажатия и не отправлять click наружу
 * Флаг selected реализован через Variables
 */
export class ProductionPlan extends Chart {
    private hovered: boolean = false;
    private selected: boolean = false;
    private title: string = null;               // Храним title переменной, чтобы выставить его в момент рендера

    constructor(config: WidgetConfigInner, options: WidgetOptions) {
        super(config, options);
        // Инициализация в конструкторе, чтобы можно было вызвать инициализацию переменных до первого рендера
        this.onEventBus = this.onEventBusFunc.bind(this);
    }

    getVariables(): IWidgetVariables {
        const res: IWidgetVariables = {};
        const addVar: AddVarFunc<VarNames> = this.addVar(res);

        addVar(0, 'title', 'Заголовок', '');

        _forEach(this.config.template.dataSets, (v: DataSet, idx: number) => {
            if (TypeGuardsHelper.isDataSetTemplate(v)) {
                const nameStr: string = v.dataSource1.type === 'SINGLE' ? '(' + (<SingleDataSource>v.dataSource1).name + ')' : '';
                addVar(idx, 'org units', 'OrgUnits', 'Выбирается в отдельном виджете');
                addVar(idx, 'kpi', 'KPIs', 'Массив KPI');
                addVar(idx, 'start date', 'Начало выборки', `${nameStr}: YYYY-mm-dd`);
                addVar(idx, 'finish date', 'Окончание выборки', `${nameStr}: YYYY-mm-dd`);
            }
        });
        addVar(0, 'selected', 'Элемент выбран', 'Доступно только при включенной настройке enableEvents');
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
            const title: string = SettingsHelper.getWidgetSetting(this.widgetSettings.settings, this.chartData.settings, 'title.name');

            const formatValueFunc: Function = SettingsHelper.formatSingleValue(this.getDataSetSettings(0, 'value'));
            const formatPlanFunc: Function = SettingsHelper.formatSingleValue(this.getDataSetSettings(1, 'value'));

            let colorFact: string = this.getDataSetSettings(0, 'color');
            if (!colorFact) {
                colorFact = ColorHelper.getCssColor('--color-primary-light');
            }
            const colorPlan: string = this.getDataSetSettings(1, 'color');
            const colorPlanData: {color?: Array<[number, string]>} = colorPlan
                ? {color: [[1, colorPlan]]}
                : {};

            const volume: number = data.data[0]?.[0]?.value ?? 0;
            const plan: number = data.data[1]?.[0]?.value ?? 0;

            this.config.element.innerHTML = this.renderTemplate({
                title: this.title || title,     // Внешний title или дефолтный
                backgroundStyle: SettingsHelper.getBackgroundStyle(this.getWidgetSetting('background.color')),
                paddingStyle: SettingsHelper.getPaddingStyle(this.getWidgetSetting('paddings')),
                volume: formatValueFunc({value: volume}),
                plan: formatPlanFunc({value: plan})
            });

            const percent: number =  plan ? Math.min(Math.round(volume / plan * 100), 100) : 0;
            const options = {
                series: [{
                    type: 'gauge',
                    startAngle: -360,
                    endAngle: 0,
                    clockwise: false,
                    radius: '100%',
                    pointer: {
                        show: false
                    },
                    progress: {
                        show: true,
                        overlap: false,
                        roundCap: false,
                        clip: false,
                        itemStyle: {
                            borderWidth: 0,
                            color: `${colorFact}`
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            width: 8,
                            ...colorPlanData
                        }
                    },
                    splitLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        show: false,
                    },
                    data: [{
                        value: percent,
                        title: {
                            show: false
                        },
                        detail: {
                            offsetCenter: [0, 1],
                            fontSize: "1rem",
                            lineHeight: "1",
                            formatter: "{value}%",
                            color: 'auto',
                        }
                    }]
                }]
            };

            if (this.options?.logs?.render ?? true) {
                console.groupCollapsed('Production plan eChart options');
                console.log(options);
                console.log(JSON.stringify(options));
                console.groupEnd();
            }

            const el: HTMLElement = this.config.element.getElementsByClassName(widgetStyles['progress'])[0] as HTMLElement;
            const myChart = echarts.init(el);
            myChart.setOption(options);

            this.addEventListeners();

            this.onResize = (width: number, height: number): void => {
                myChart.resize();
            };

            // Вызываем дополнительно здесь, т.к. иногда прелоадер не успевает удалиться до прихода события selected
            this.setClasses();
        }
    }

    destroy(): void {
        super.destroy();
        this.removeEventListeners();
    }

    private addEventListeners(): void {
        if (this.isEnableEvents) {
            this.onEnter = this.onEnter.bind(this);
            this.onLeave = this.onLeave.bind(this);
            this.config.element.addEventListener("mouseenter", this.onEnter);
            this.config.element.addEventListener("mouseleave", this.onLeave);
        }
    }

    private removeEventListeners(): void {
        if (this.isEnableEvents) {
            this.config.element.removeEventListener("mouseenter", this.onEnter);
            this.config.element.removeEventListener("mouseleave", this.onLeave);
        }
    }

    private onEnter(): void {
        this.hovered = true;
        this.setClasses();
    }

    private onLeave(): void {
        this.hovered = false;
        this.setClasses();
    }

    private setClasses(): void {
        if (!this.isEnableEvents) {
            return;
        }
        const titleElement: HTMLElement = this.config.element.getElementsByClassName(widgetStyles['js-title'])[0] as HTMLElement;
        const planElement: HTMLElement = this.config.element.getElementsByClassName(widgetStyles['js-plan'])[0] as HTMLElement;
        const volumeElement: HTMLElement = this.config.element.getElementsByClassName(widgetStyles['js-volume'])[0] as HTMLElement;
        const backgroundElement: HTMLElement = this.config.element.getElementsByClassName(widgetStyles['js-background'])[0] as HTMLElement;

        // NOTE: Не всегда успевает удалиться прелоадер и selected может прийти раньше run()
        if (!titleElement || !planElement || !volumeElement || !backgroundElement) {
            return;
        }

        if (this.selected || this.hovered) {
            titleElement.classList.remove(widgetStyles['color-grey']);
            titleElement.classList.add(widgetStyles['color-white']);
            planElement.classList.remove(widgetStyles['color-grey']);
            planElement.classList.add(widgetStyles['color-white']);
            volumeElement.classList.add(widgetStyles['color-white']);
            backgroundElement.classList.add(widgetStyles['inverted-bg']);
        } else {
            titleElement.classList.add(widgetStyles['color-grey']);
            titleElement.classList.remove(widgetStyles['color-white']);
            planElement.classList.add(widgetStyles['color-grey']);
            planElement.classList.remove(widgetStyles['color-white']);
            volumeElement.classList.remove(widgetStyles['color-white']);
            backgroundElement.classList.remove(widgetStyles['inverted-bg']);
        }
        backgroundElement.classList.add(widgetStyles['cursor-pointer']);
    }

    private get isEnableEvents(): boolean {
        return this.getWidgetSetting<boolean>('enableEvents');
    }

    /**
     * Обработка событий
     * NOTE: все данные меняются в this.config.template
     */
    // tslint:disable-next-line:no-any
    private async onEventBusFunc(varName: VarNames, value: any, dataSourceId: number): Promise<boolean> {
        if (this.options?.logs?.eventBus ?? true) {
            console.groupCollapsed('Report EventBus data', this.uniqId);
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
            'kpi': () => { needReload = this.processKpi((value as string[]) ?? []); },
            'start date': () => { dataSet.from = value; needReload = true; },
            'finish date': () => { dataSet.to = value; needReload = true; },
            'selected': () => { this.selected = Boolean(value); this.setClasses(); },
            'title': () => { this.title = String(value); }
        };
        await switchArr[varName]();

        return needReload;
    }

    private processKpi(kpi: string[]): boolean {
        let needReload = false;
        const dataSets: DataSet[] = this.config.template.dataSets;
        const dimName: string = 'operation';     // FIXME: здесь требуется конкретный dimension

        if (TypeGuardsHelper.everyIsDataSetTemplate(this.config.template.dataSets)) {
            dataSets.forEach((v: DataSetTemplate) => {
                if (TypeGuardsHelper.isSingleDataSource(v.dataSource1)) {
                    // Ищем нужный фильтр в списке уже установленных
                    const dimIndex: number = v.dataSource1.dimensions.findIndex((d: DimensionFilter) => d.name === dimName);
                    if (dimIndex !== -1) {
                        v.dataSource1.dimensions[dimIndex].values = kpi;
                    } else {
                        // Фильтра еще нет
                        v.dataSource1.dimensions.push({
                            name: dimName,
                            values: kpi,
                            expression: '',
                            groupBy: false,
                        });
                    }
                    needReload = true;
                }
            });
        }
        return needReload;
    }

    getTemplate(): string {
        return `
            <div class="widget js-background" style="{{backgroundStyle}} {{paddingStyle}}">
                <div class="d-flex">
                    <div class="progress mar-right-5"></div>
                    
                    <div class="flex-grow d-flex flex-h-space-between flex-v-end scroll-hide">
                        <div class="d-flex flex-h-end flex-col text-left">
                            <div class="d-grid">
                                <div class="text-xsmall text-truncate pad-bot-3 js-title">
                                    {{title}}
                                </div>
                                <div class="text-h2 js-volume">
                                    {{volume}}
                                </div>
                            </div>
                        </div>

                        <div class="flex-grow d-flex flex-col flex-h-end text-xsmall js-plan">
                            <div class="text-right">
                                План
                            </div>
                            <div class="text-right">
                                {{plan}}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
