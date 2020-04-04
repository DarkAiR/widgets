import s from "../../styles/_all.less";
import w from "./report.less";
import {config as widgetConfig} from "./config";

import {IChartData, IWidgetVariables} from "../../interfaces";
import {get as _get} from "lodash";
import {Chart} from "../../models/Chart";
import {TypeGuardsHelper} from "../../helpers";

export class Report extends Chart {
    getVariables(): IWidgetVariables {
        return {};
    }

    run(data: IChartData): void {
        if (TypeGuardsHelper.dataSetsIsDataSetTemplate(data.dataSets)) {
            const value = _get(data, 'data[0].items[0].value', 0);
            const currColor = this.getColor(widgetConfig, data.dataSets[0].settings, 'color-yellow');

            const str = `
                <div class='${s["widget"]} ${w["widget"]}'>
                    <div class='${w["title"]}'>${this.getWidgetSetting(widgetConfig, data.settings, 'title')}</div>
                    <div class='${w["value"]} ${w[currColor.className]}' style='${currColor.colorStyle}'>${value}</div>
                </div>
            `;
            this.config.element.innerHTML = str;
        }
    }
}
