import s from "../styles/_all.less";
import w from "./solidGaugeChart.less";

import {IChart, IChartData} from "../interfaces";
import {SolidGaugeConfig} from "./solidGaugeConfig";
import {get as _get} from "lodash";

export class SolidGaugeChart implements IChart {
    run(config: SolidGaugeConfig, data: IChartData): void {
        const str = `
            <div class='${s["widget"]}'>
                <div class="${w.qwe}">test</div>
                TITLE: ${config.title}<br/>
                ICON: ${config.icon}
            </div>
        `;
        config.element.innerHTML = str;
    }
}
