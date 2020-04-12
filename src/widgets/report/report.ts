import s from "../../styles/_all.less";
import w from "./report.less";
import {settings as widgetSettings} from "./settings";

import {IChartData, IWidgetVariables} from "../../interfaces";
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

        if (TypeGuardsHelper.dataSetsIsDataSetTemplate(data.dataSets)) {
            const value = _get(data, 'data[0].items[0].value', 0);
            const currColor = this.getColor(data.dataSets[0].settings, 'color-yellow');

            const str = `
                <div class='${s["widget"]} ${w["widget"]}'>
                    <div class='${w["title"]}'>${this.getWidgetSetting('title')}</div>
                    <div class='${w["value"]} ${w[currColor.className]}' style='${currColor.style}'>${value}</div>
                </div>
            `;
            this.config.element.innerHTML = str;
        }
    }
}
