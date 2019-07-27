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
                ICONS:<br>
                <div>
                    <span class='icon-gas-station ${s['size-8']} ${s["color-yellow"]}'></span>
                    <span class='icon-gas-station ${s['size-12']} ${s["color-yellow"]}'></span>
                    <span class='icon-gas-station ${s['size-16']} ${s["color-yellow"]}'></span>
                    <span class='icon-gas-station ${s['size-20']} ${s["color-yellow"]}'></span>
                    <span class='icon-gas-station ${s['size-24']} ${s["color-yellow"]}'></span>
                    <span class='icon-gas-station ${s['size-28']} ${s["color-yellow"]}'></span>
                </div>
                <div>
                    <span class='icon-cash-register ${s['size-8']} ${s["color-yellow"]}'></span>
                    <span class='icon-cash-register ${s['size-12']} ${s["color-yellow"]}'></span>
                    <span class='icon-cash-register ${s['size-16']} ${s["color-yellow"]}'></span>
                    <span class='icon-cash-register ${s['size-20']} ${s["color-yellow"]}'></span>
                    <span class='icon-cash-register ${s['size-24']} ${s["color-yellow"]}'></span>
                    <span class='icon-cash-register ${s['size-28']} ${s["color-yellow"]}'></span>
                </div>
                <div>
                    <span class='icon-clock-alert-outline ${s['size-8']} ${s["color-yellow"]}'></span>
                    <span class='icon-clock-alert-outline ${s['size-12']} ${s["color-yellow"]}'></span>
                    <span class='icon-clock-alert-outline ${s['size-16']} ${s["color-yellow"]}'></span>
                    <span class='icon-clock-alert-outline ${s['size-20']} ${s["color-yellow"]}'></span>
                    <span class='icon-clock-alert-outline ${s['size-24']} ${s["color-yellow"]}'></span>
                    <span class='icon-clock-alert-outline ${s['size-28']} ${s["color-yellow"]}'></span>
                </div>
                <div>
                    <span class='icon-run-fast ${s['size-8']} ${s["color-blue"]}'></span>
                    <span class='icon-run-fast ${s['size-12']} ${s["color-blue"]}'></span>
                    <span class='icon-run-fast ${s['size-16']} ${s["color-blue"]}'></span>
                    <span class='icon-run-fast ${s['size-20']} ${s["color-blue"]}'></span>
                    <span class='icon-run-fast ${s['size-24']} ${s["color-blue"]}'></span>
                    <span class='icon-run-fast ${s['size-28']} ${s["color-blue"]}'></span>
                </div>
                <div>
                    <span class='icon-account-plus ${s['size-8']} ${s["color-green"]}'></span>
                    <span class='icon-account-plus ${s['size-12']} ${s["color-green"]}'></span>
                    <span class='icon-account-plus ${s['size-16']} ${s["color-green"]}'></span>
                    <span class='icon-account-plus ${s['size-20']} ${s["color-green"]}'></span>
                    <span class='icon-account-plus ${s['size-24']} ${s["color-green"]}'></span>
                    <span class='icon-account-plus ${s['size-28']} ${s["color-green"]}'></span>
                </div>
                <div>
                    <span class='icon-account-remove ${s['size-8']} ${s["color-red"]}'></span>
                    <span class='icon-account-remove ${s['size-12']} ${s["color-red"]}'></span>
                    <span class='icon-account-remove ${s['size-16']} ${s["color-red"]}'></span>
                    <span class='icon-account-remove ${s['size-20']} ${s["color-red"]}'></span>
                    <span class='icon-account-remove ${s['size-24']} ${s["color-red"]}'></span>
                    <span class='icon-account-remove ${s['size-28']} ${s["color-red"]}'></span>
                </div>
            </div>
        `;
        config.element.innerHTML = str;
    }
}
