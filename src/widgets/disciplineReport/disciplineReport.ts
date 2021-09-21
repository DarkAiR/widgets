import widgetStyles from "./disciplineReport.less";
import {settings as widgetSettings} from "./settings";

import {
    IChartData,
    IWidgetVariables,
    ReportPoint,
    IEventOrgUnits, DataSetTemplate, ISettings
} from "../../interfaces";
import {AddVarFunc, Chart} from "../../models/Chart";
import {ColorHelper, OrgUnitsHelper, SettingsHelper, TypeGuardsHelper} from "../../helpers";
import {IWidgetSettings} from "../../widgetSettings";
import {WidgetConfigInner} from "../..";
import {WidgetOptions} from "../../models/widgetOptions";
import * as echarts from "echarts";

type VarNames = 'org units';

export class DisciplineReport extends Chart {
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
        const reportPoints: ReportPoint[] = data.data as ReportPoint[];

        if (TypeGuardsHelper.everyIsDataSetTemplate(data.dataSets)) {
            const point: ReportPoint = reportPoints[0];

            const titleSettings = SettingsHelper.getTitleSettings(this.widgetSettings.settings, this.chartData.settings);

            let color: string = this.getDataSetSettings(0, 'color');
            if (!color) {
                color = ColorHelper.getCssColor('--color-primary-light');
            }

            this.config.element.innerHTML = this.renderTemplate({
                showTitle: titleSettings.show && titleSettings.name.trim().length,
                title: titleSettings.name,
                titleStyle: titleSettings.style,
                backgroundStyle: SettingsHelper.getBackgroundStyle(this.getWidgetSetting('background.color')),
                paddingStyle: SettingsHelper.getPaddingStyle(this.getWidgetSetting('paddings'))
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
                        value: 20,
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
                        if (OrgUnitsHelper.setOrgUnits(v.dataSource2, event)) {
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
                
                <div class="d-flex flex-h-space-between">
                    <div class="d-flex">
                        <div class="progress mar-right-4"></div>
                        
                        <div class="d-flex flex-h-end flex-col text-left">
                            <div class="text-xsmall color-grey">
                                Обьем производства
                            </div>
                            <div class="text-h2">
                                1234
                            </div>
                        </div>
                    </div>
    
                    <div class="flex-grow d-flex flex-col flex-h-end color-grey text-xsmall">
                        <div class="text-right">
                            План
                        </div>
                        <div class="text-right">
                            10 000
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
