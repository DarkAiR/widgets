import s from "../styles/_all.less";
import w, {minValue} from "./solidGaugeChart.less";

import {IChart, IChartData} from "../interfaces";
import {SolidGaugeConfig} from "./solidGaugeConfig";
import {get as _get, first as _first} from "lodash";
import {Chart} from "../models/Chart";

export class SolidGaugeChart extends Chart implements IChart {
    private static X_TO_Y_RATION= 2;

    run(config: SolidGaugeConfig, data: IChartData): void {
        const currValue = _get(data, 'data[0][0].value', 0);
        const maxValue = _get(data, 'data[0][1].value', 0);

        const str = `
            <div class='${s["widget"]} ${w.widget}'>
                <div class="${w.chart}">
                    <div class="${w.lineGrey}"></div>
                    <div class="${w.lineYellow}"></div>
                    <div class="${w.value} ${w.minValue}">0</div>
                    <div class="${w.value} ${w.maxValue}">${maxValue}</div>                
                </div>
                <div class="${w.info}">
                    INFO                
                </div>
            </div>
        `;
        config.element.innerHTML = str;

        const lineYellow: HTMLElement = _first(config.element.getElementsByClassName(w.lineYellow));
        const deg = 180 * (1 - currValue / maxValue);
        lineYellow.style.transform = `rotate(-${deg}deg)`;

        this.resize(config.element, (width, height) => {
            console.log(width, height);
            let newW = 0;
            let newH = 0;
            if (width / height > SolidGaugeChart.X_TO_Y_RATION) {
                // Calculate by H
                newW = height * SolidGaugeChart.X_TO_Y_RATION;
                newH = height;
            } else {
                // Calculate by W
                newW = width;
                newH = width / SolidGaugeChart.X_TO_Y_RATION;
            }
            const innerElement: HTMLElement = _first(config.element.getElementsByClassName(s["widget"]));
            if (innerElement) {
                innerElement.style.width = newW + 'px';
                innerElement.style.height = newH + 'px';
                innerElement.style.marginLeft = -newW / 2 + 'px';
            }
        });
    }
}
