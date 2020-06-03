import s from "../../styles/_all.less";
import w from "./report.less";
import {settings as widgetSettings} from "./settings";

import {
    IChartData,
    INameValue,
    IWidgetVariables,
    ReportPoint,
    ReportItem,
    IColor,
    IEventOrgUnits, DimensionFilter, DataSetTemplate, SingleDataSource
} from "../../interfaces";
import {isEmpty as _isEmpty} from "lodash";
import {Chart} from "../../models/Chart";
import {SettingsHelper, TypeGuardsHelper} from "../../helpers";
import {IWidgetSettings} from "../../widgetSettings";
import {pochtaDataSources} from "../../models/pochtaDataSources";

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
            const value = point?.items[0]?.value || 0;

            const titleSettings = SettingsHelper.getTitleSettings(this.widgetSettings.settings, this.chartData.settings);

            const valueStyle = [];
            valueStyle.push(`color: ${this.getWidgetSetting('value.color')}`);
            if (!_isEmpty(this.getWidgetSetting('value.size'))) {
                valueStyle.push(`font-size: ${this.getWidgetSetting('value.size')}px`);
            }
            valueStyle.push(`text-align: ${this.getWidgetSetting('value.align')}`);

            const rows: INameValue[] = point.items.map((v: ReportItem) => ({
                name: v.key,
                value: (v.value * 100).toFixed(2) + '%'
            }));

            this.config.element.innerHTML = this.renderTemplate({
                backgroundStyle: this.getBackgroundStyle(this.getWidgetSetting('backgroundColor')),
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
                needReload = this.processingOrgUnits(value as IEventOrgUnits);
                break;
        }
        return needReload;
    }

    private processingOrgUnits(event: IEventOrgUnits): boolean {
        let needReload = false;
        if (TypeGuardsHelper.everyIsDataSetTemplate(this.config.template.dataSets)) {
            this.config.template.dataSets.forEach((v: DataSetTemplate) => {
                if (TypeGuardsHelper.isSingleDataSource(v.dataSource1) && TypeGuardsHelper.isSingleDataSource(v.dataSource2)) {
                    // Ищем dataSource для почты
                    // if (pochtaDataSources.includes(v.dataSource1.name)) {
                        for (const dimName in event) {
                            if (!event.hasOwnProperty(dimName)) {
                                continue;
                            }
                            // NOTE: Нельзя проверять на event[dimName].length, т.к. тогда остануться данные с прошлого раза
                            [v.dataSource1, v.dataSource2].forEach((dataSource: SingleDataSource) => {
                                const dim: DimensionFilter = dataSource.dimensions.find((d: DimensionFilter) => d.name === dimName);
                                if (dim) {
                                    dim.values = event[dimName];
                                } else {
                                    // Пустые данные не приходят в виджет, поэтому dimension может и не быть
                                    const newFilter: DimensionFilter = {
                                        name: dimName,
                                        values: event[dimName],
                                        expression: '',
                                        groupBy: false
                                    };
                                    dataSource.dimensions.push(newFilter);
                                }
                                needReload = true;
                            });
                        }
                    // }
                }
            });
        }
        return needReload;
    }

    getTemplate(): string {
        return `
            <div class='${s["widget"]} ${w["widget"]}' style="{{backgroundStyle}}">
                {{#showTitle}}
                <div class='${w['row']}'>
                    <div class="${w['title']}" style="{{titleStyle}}">
                        {{title}}
                    </div>
                </div>
                {{/showTitle}}
                <table class="${s['table']} ${s['w-100']} ${w['table']}">
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
