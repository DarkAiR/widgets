import widgetStyles from "./productionPlan.less";
import {settings as widgetSettings} from "./settings";

import {
    IChartData,
    IWidgetVariables,
    IEventOrgUnits, DataSetTemplate, ISettings, DataSet, SingleDataSource
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

type VarNames = 'org units' | 'start date' | 'finish date';

export class ProductionPlan extends Chart {
    constructor(config: WidgetConfigInner, options: WidgetOptions) {
        super(config, options);
        // Инициализация в конструкторе, чтобы можно было вызвать инициализацию переменных до первого рендера
        this.onEventBus = this.onEventBusFunc.bind(this);
    }

    getVariables(): IWidgetVariables {
        const res: IWidgetVariables = {};
        const addVar: AddVarFunc<VarNames> = this.addVar(res);

        _forEach(this.config.template.dataSets, (v: DataSet, idx: number) => {
            if (TypeGuardsHelper.isDataSetTemplate(v)) {
                const nameStr: string = v.dataSource1.type === 'SINGLE' ? '(' + (<SingleDataSource>v.dataSource1).name + ')' : '';
                addVar(idx, 'org units', 'OrgUnits', 'Выбирается в отдельном виджете');
                addVar(idx, 'start date', 'Начало выборки', `${nameStr}: YYYY-mm-dd`);
                addVar(idx, 'finish date', 'Окончание выборки', `${nameStr}: YYYY-mm-dd`);
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
            const title: string = SettingsHelper.getWidgetSetting(this.widgetSettings.settings, this.chartData.settings, 'title.name');

            let color: string = this.getDataSetSettings(0, 'color');
            if (!color) {
                color = ColorHelper.getCssColor('--color-primary-light');
            }

            const volume: number = data.data[0]?.[0]?.value ?? 0;
            const plan: number = data.data[1]?.[0]?.value ?? 0;

            this.config.element.innerHTML = this.renderTemplate({
                title,
                backgroundStyle: SettingsHelper.getBackgroundStyle(this.getWidgetSetting('background.color')),
                paddingStyle: SettingsHelper.getPaddingStyle(this.getWidgetSetting('paddings')),
                volume,
                plan
            });

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
                            color: `${color}`
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            width: 8
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
                        value: Math.min(Math.round(volume / plan * 100), 100),
                        title: {
                            show: false
                        },
                        detail: {
                            show: false,
                        }
                    }],
                }]
            };

            const el: HTMLElement = this.config.element.getElementsByClassName(widgetStyles['progress'])[0] as HTMLElement;
            const myChart = echarts.init(el);
            myChart.setOption(options);

            this.onResize = (width: number, height: number): void => {
                myChart.resize();
            };
        }
    }

    /**
     * Обработка событий
     * NOTE: все данные меняются в this.config.template
     */
    // tslint:disable-next-line:no-any
    private async onEventBusFunc(varName: VarNames, value: any, dataSourceId: number): Promise<boolean> {
        if (this.options?.logs?.eventBus ?? true) {
            console.groupCollapsed('Report EventBus data');
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
            'start date': () => { dataSet.from = value; needReload = true; },
            'finish date': () => { dataSet.to = value; needReload = true; },
        };
        await switchArr[varName]();

        return needReload;
    }

    getTemplate(): string {
        return `
            <div class="widget" style="{{backgroundStyle}} {{paddingStyle}}">
                <div class="d-flex">
                    <div class="progress mar-right-5"></div>
                    
                    <div class="flex-grow d-flex flex-h-space-between flex-v-end scroll-hide">
                        <div class="d-flex flex-h-end flex-col text-left">
                            <div class="d-grid">
                                <div class="text-xsmall text-truncate color-grey pad-bot-3">
                                    {{title}}
                                </div>
                                <div class="text-h2">
                                    {{volume}}
                                </div>
                            </div>
                        </div>

                        <div class="flex-grow d-flex flex-col flex-h-end color-grey text-xsmall">
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
