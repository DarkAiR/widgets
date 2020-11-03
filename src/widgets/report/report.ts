import w from "./report.less";
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

export class Report extends Chart {
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
        await (({
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
        } as { [P in VarNames]: Function })[varName])();

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
                <table class="${w['table']}">
                <tbody>
                    {{#rows}}
                    <tr>
                        <td style="display: none">{{name}}</td>
                        <td style='{{valueStyle}}'>{{value}}</td>
                    </tr>
                    {{/rows}}
                </tbody>
                </table>
            </div>
        `;
    }
}
