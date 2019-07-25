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
                <div>
                    <span class='${w["icon-12"]} ${w["gas-station"]} ${s["color-yellow"]}'></span>
                    <span class='${w["icon-16"]} ${w["gas-station"]} ${s["color-yellow"]}'></span>
                    <span class='${w["icon-20"]} ${w["gas-station"]} ${s["color-yellow"]}'></span>
                    <span class='${w["icon-24"]} ${w["gas-station"]} ${s["color-yellow"]}'></span>
                    <span class='${w["icon-28"]} ${w["gas-station"]} ${s["color-yellow"]}'></span>
                    <span class='${w["icon-32"]} ${w["gas-station"]} ${s["color-yellow"]}'></span>
                </div>
                <div>
                    <span class='${w["icon-12"]} ${w["cash-register"]} ${s["color-yellow"]}'></span>
                    <span class='${w["icon-16"]} ${w["cash-register"]} ${s["color-yellow"]}'></span>
                    <span class='${w["icon-20"]} ${w["cash-register"]} ${s["color-yellow"]}'></span>
                    <span class='${w["icon-24"]} ${w["cash-register"]} ${s["color-yellow"]}'></span>
                    <span class='${w["icon-28"]} ${w["cash-register"]} ${s["color-yellow"]}'></span>
                    <span class='${w["icon-32"]} ${w["cash-register"]} ${s["color-yellow"]}'></span>
                </div>
                <div>
                    <span class='${w["icon-12"]} ${w["clock-alert-outline"]} ${s["color-yellow"]}'></span>
                    <span class='${w["icon-16"]} ${w["clock-alert-outline"]} ${s["color-yellow"]}'></span>
                    <span class='${w["icon-20"]} ${w["clock-alert-outline"]} ${s["color-yellow"]}'></span>
                    <span class='${w["icon-24"]} ${w["clock-alert-outline"]} ${s["color-yellow"]}'></span>
                    <span class='${w["icon-28"]} ${w["clock-alert-outline"]} ${s["color-yellow"]}'></span>
                    <span class='${w["icon-32"]} ${w["clock-alert-outline"]} ${s["color-yellow"]}'></span>
                </div>
                <div>
                    <span class='${w["icon-12"]} ${w["run-fast"]} ${s["color-blue"]}'></span>
                    <span class='${w["icon-16"]} ${w["run-fast"]} ${s["color-blue"]}'></span>
                    <span class='${w["icon-20"]} ${w["run-fast"]} ${s["color-blue"]}'></span>
                    <span class='${w["icon-24"]} ${w["run-fast"]} ${s["color-blue"]}'></span>
                    <span class='${w["icon-28"]} ${w["run-fast"]} ${s["color-blue"]}'></span>
                    <span class='${w["icon-32"]} ${w["run-fast"]} ${s["color-blue"]}'></span>
                </div>
                <div>
                    <span class='${w["icon-12"]} ${w["account-plus"]} ${s["color-green"]}'></span>
                    <span class='${w["icon-16"]} ${w["account-plus"]} ${s["color-green"]}'></span>
                    <span class='${w["icon-20"]} ${w["account-plus"]} ${s["color-green"]}'></span>
                    <span class='${w["icon-24"]} ${w["account-plus"]} ${s["color-green"]}'></span>
                    <span class='${w["icon-28"]} ${w["account-plus"]} ${s["color-green"]}'></span>
                    <span class='${w["icon-32"]} ${w["account-plus"]} ${s["color-green"]}'></span>
                </div>
                <div>
                    <span class='${w["icon-12"]} ${w["account-remove"]} ${s["color-red"]}'></span>
                    <span class='${w["icon-16"]} ${w["account-remove"]} ${s["color-red"]}'></span>
                    <span class='${w["icon-20"]} ${w["account-remove"]} ${s["color-red"]}'></span>
                    <span class='${w["icon-24"]} ${w["account-remove"]} ${s["color-red"]}'></span>
                    <span class='${w["icon-28"]} ${w["account-remove"]} ${s["color-red"]}'></span>
                    <span class='${w["icon-32"]} ${w["account-remove"]} ${s["color-red"]}'></span>
                </div>
            </div>
        `;
        config.element.innerHTML = str;
    }
}
