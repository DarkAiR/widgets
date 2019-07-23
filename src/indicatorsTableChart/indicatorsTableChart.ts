import s from "../styles/_all.less";
import w from "./indicatorsTableChart.less";

import {IChart, IChartData} from "../interfaces";
import {IndicatorsTableConfig} from "./indicatorsTableConfig";
import {get as _get} from "lodash";
import {Chart} from "../models/Chart";

export class IndicatorsTableChart extends Chart implements IChart {
    run(config: IndicatorsTableConfig, data: IChartData): void {
        const str = `
            <div class='${s["widget"]}'>
                Indicators table
            </div>
        `;
        config.element.innerHTML = str;
    }
}
