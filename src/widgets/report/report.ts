import s from "../../styles/_all.less";
import w from "./report.less";
import {settings as widgetSettings} from "./settings";

import {IChartData, INameValue, IWidgetVariables, ReportPoint, ReportItem} from "../../interfaces";
import {get as _get} from "lodash";
import {Chart} from "../../models/Chart";
import {TypeGuardsHelper} from "../../helpers";
import {IWidgetSettings} from "../../widgetSettings";

export class Report extends Chart {
    getVariables(): IWidgetVariables {
        return {};
    }

    getSettings(): IWidgetSettings {
        return widgetSettings;
    }

    run(): void {
        const data: IChartData = this.chartData;
        const reportPoints: ReportPoint[] = data.data as ReportPoint[];

        if (TypeGuardsHelper.dataSetsIsDataSetTemplate(data.dataSets)) {
            const value = _get(data, 'data[0].items[0].value', 0);
            const point: ReportPoint = reportPoints[0];
            const currColor = this.getColor(data.dataSets[0].settings, 'color-yellow');

            const rows: INameValue[] = point.items.map((v: ReportItem) => ({name: v.key, value: v.value + ''}));

            this.config.element.innerHTML = this.renderTemplate({
                title: this.getWidgetSetting('title'),
                rows,
                colorClass: w[currColor.className],
                colorStyle: currColor.style
            });
        }
    }

    getTemplate(): string {
        return `
            <div class='${s["widget"]} ${w["widget"]}'>
                <h4>{{title}}</h4>
                <table class="${s['table']} ${s['w-100']} ${w['table']}">
                <tbody>
                    {{#rows}}
                    <tr>
                        <td>{{name}}</td>
                        <td {{colorClass}} style='{{colorStyle}}'>{{value}}</td>
                    </tr>
                    {{/rows}}
                </tbody>
                </table>
            </div>
        `;
    }
}
