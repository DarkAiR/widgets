import w from "./disciplineReport.less";
import {settings as widgetSettings} from "./settings";

import {
    IChartData,
    INameValue,
    IWidgetVariables,
    ReportPoint,
    ReportItem,
    IEventOrgUnits, DataSetTemplate
} from "../../interfaces";
import {isEmpty as _isEmpty} from "lodash";
import {AddVarFunc, Chart} from "../../models/Chart";
import {OrgUnitsHelper, SettingsHelper, TypeGuardsHelper} from "../../helpers";
import {IWidgetSettings} from "../../widgetSettings";
import {WidgetConfigInner} from "../..";
import {WidgetOptions} from "../../models/widgetOptions";

type VarNames = 'org units';

export class DisciplineReport extends Chart {
    getVariables(): IWidgetVariables {
        const res: IWidgetVariables = {};
        const addVar: AddVarFunc<VarNames> = this.addVar(res);

        addVar(0, 'org units', 'OrgUnits', 'Выбирается в отдельном виджете');

        return res;
    }

    getSettings(): IWidgetSettings {
        return widgetSettings;
    }

    constructor(config: WidgetConfigInner, options: WidgetOptions) {
        super(config, options);
        // Инициализация в конструкторе, чтобы можно было вызвать инициализацию переменных до первого рендера
        this.onEventBus = this.onEventBusFunc.bind(this);
    }

    run(): void {
        const data: IChartData = this.chartData;
        const reportPoints: ReportPoint[] = data.data as ReportPoint[];

        if (TypeGuardsHelper.everyIsDataSetTemplate(data.dataSets)) {
            const point: ReportPoint = reportPoints[0];

            const titleSettings = SettingsHelper.getTitleSettings(this.widgetSettings.settings, this.chartData.settings);

            const valueStyle = [
                `color: ${this.getWidgetSetting('value.color')}`,
                !_isEmpty(this.getWidgetSetting('value.size'))
                    ? `font-size: ${this.getWidgetSetting('value.size')}px`
                    : '',
                `text-align: ${this.getWidgetSetting('value.align')}`
            ];

            const rows: INameValue[] = point.items.map((v: ReportItem) => ({
                name: v.key,
                value: (v.value * 100).toFixed(2) + '%'
            }));

            this.config.element.innerHTML = this.renderTemplate({
                backgroundStyle: SettingsHelper.getBackgroundStyle(this.getWidgetSetting('background.color')),
                showTitle: titleSettings.show,
                title: titleSettings.name,
                titleStyle: titleSettings.style,
                rows,
                valueStyle: valueStyle.join(';'),
            });
        }

        const options = `
            series: [{
                type: 'gauge',
                startAngle: -360,
                endAngle: 0,
                clockwise: false,
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
                        borderColor: '#464646'
                    }
                },
                axisLine: {
                    lineStyle: {
                        width: 16
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
        `;
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
            <div class="${w['widget']}" style="{{backgroundStyle}}">
                {{#showTitle}}
                <div class="${w['title']}" style="{{titleStyle}}">
                    {{title}}
                </div>
                {{/showTitle}}
                
                <div class="d-flex flex-h-space-between">
                    <div class="d-flex">
                        <div class="progress mar-right-4"></div>
                        <div class="d-flex flex-h-end flex-col text-left">
                            <div class="text-xsmall color-grey-light">
                                Обьем производства
                            </div>
                            <div class="text-h2">
                                1234
                            </div>
                        </div>
                    </div>
    
                    <div class="flex-grow d-flex flex-col flex-h-end color-grey-light text-xsmall">
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
