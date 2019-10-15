import s from "../styles/_all.less";
import w from "./reportChart.less";

import {IChart, IChartData, IWidgetVariables} from "../interfaces";
import {ReportChartSettings} from "./reportChartSettings";
import {get as _get} from "lodash";
import {Chart} from "../models/Chart";

export class ReportChart extends Chart implements IChart {
    getVariables(): IWidgetVariables {
        return {};
    }

    run(data: IChartData): void {
        const settings = <ReportChartSettings>data.settings;
        console.log('ReportChart settings: ', settings);

        const value = _get(data, 'data[0].items[0].value', 0);
        const currColor = this.getColor(data.dataSets[0].settings, 'color-yellow');

        const str = `
            <div class='${s["widget"]} ${w["widget"]}'>
                <div class='${w["title"]}'>${settings.title}</div>
                <div class='${w["value"]} ${w[currColor.className]}' style='${currColor.colorStyle}'>${value}</div>
            </div>
        `;
        this.config.element.innerHTML = str;

        this.resize(this.config.element, (width, height) => {
        });
    }
}
