import s from "../../styles/_all.less";
import w from "./KPI.less";
import {settings as widgetSettings} from "./settings";
import {isEmpty as _isEmpty} from 'lodash';
import {
    DataSetTemplate, DimensionFilter,
    IChartData,
    IEventOrgUnits,
    INameValue,
    ISettings,
    IWidgetVariables,
    ReportItem, SingleDataSource,
    TSPoint
} from "../../interfaces";
import {Chart} from "../../models/Chart";
import {OrgUnitsHelper, SettingsHelper, TypeGuardsHelper} from "../../helpers";
import {IWidgetSettings} from "../../widgetSettings";

export class KPI extends Chart {
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
        const points: TSPoint[][] = data.data as TSPoint[][];

        if (TypeGuardsHelper.everyIsDataSetTemplate(data.dataSets)) {
            const dataSetSettings: ISettings = data.dataSets[0].settings;
            const value: number = points[0][0].value || 0;

            const titleSettings = SettingsHelper.getTitleSettings(this.widgetSettings.settings, this.chartData.settings);

            const valueStyle = [];
            valueStyle.push(`color: ${this.getWidgetSetting('value.color')}`);
            if (!_isEmpty(this.getWidgetSetting('value.size'))) {
                valueStyle.push(`font-size: ${this.getWidgetSetting('value.size')}px`);
            }
            valueStyle.push(`text-align: ${this.getWidgetSetting('value.align')}`);

            this.config.element.innerHTML = this.renderTemplate({
                backgroundStyle: this.getBackgroundStyle(this.getWidgetSetting('backgroundColor')),
                showTitle: titleSettings.show,
                title: titleSettings.name,
                titleStyle: titleSettings.style,
                value: value, // (value * 100).toFixed(2) + '%',
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
        console.groupCollapsed('KPI EventBus data');
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
                    });
                }
                break;
        }
        return needReload;
    }

    getTemplate(): string {
        return `
            <div class='${s["widget"]}' style="{{backgroundStyle}}">
                {{#showTitle}}
                <div class='${w['row']}'>
                    <div style="{{titleStyle}}">
                        {{title}}
                    </div>
                </div>
                {{/showTitle}}
                <div style='{{valueStyle}}'>{{value}}</div>
            </div>
        `;
    }
}
