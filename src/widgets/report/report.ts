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
import {Chart} from "../../models/Chart";
import {OrgUnitsHelper, SettingsHelper, TypeGuardsHelper} from "../../helpers";
import {IWidgetSettings} from "../../widgetSettings";

export class Report extends Chart {
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

            this.onEventBus = this.onEventBusFunc.bind(this);
        }
    }

    /**
     * Обработка событий
     * NOTE: все данные меняются в this.config.template
     */
    // tslint:disable-next-line:no-any
    private onEventBusFunc(varName: string, value: any, dataSourceId: number): boolean {
        console.groupCollapsed('Report EventBus data');
        console.log(varName, '=', value);
        console.log('dataSourceId =', dataSourceId);
        console.groupEnd();

        // NOTE: Делаем через switch, т.к. в общем случае каждая обработка может содержать дополнительную логику

        let needReload = false;
        switch (varName) {
            case 'org units':
                if (TypeGuardsHelper.everyIsDataSetTemplate(this.config.template.dataSets)) {
                    this.config.template.dataSets.forEach((v: DataSetTemplate) => {
                        if (OrgUnitsHelper.setOrgUnits(v.dataSource1, value as IEventOrgUnits)) {
                            needReload = true;
                        }
                        if (OrgUnitsHelper.setOrgUnits(v.dataSource2, value as IEventOrgUnits)) {
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
