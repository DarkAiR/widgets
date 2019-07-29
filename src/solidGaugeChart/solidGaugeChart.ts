import s from "../styles/_all.less";
import w from "./solidGaugeChart.less";

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
            <div class='${s["widget"]} ${w['widget']}'>
                <div class="${w['info']}">
                    <div class="${w['current-value']}">378</div>
                    <div class="${w['title']}">План/Факт топливо, тыс. л</div>
                </div>
                <div class="${w['chart']}">
                    <span class="icon-gas-station ${w['icon-gas-station']} ${s['size-20']} ${s['color-yellow']}"></span>
                    <svg width="336" height="176" viewBox="0 0 336 176" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M328 168C328 79.6344 256.366 8 168 8C79.6344 8 8 79.6344 8 168" stroke="black" stroke-opacity="0.15" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M8 168C8 79.6344 79.6226 8 167.973 8C204.91 8 238.922 20.52 266 41.5484" stroke="#E4B01E" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <div class="${w['value']} ${w['minValue']}">0</div>
                    <div class="${w['value']} ${w['maxValue']}">450</div>
                </div>
            </div>
        `;
        config.element.innerHTML = str;

        const lineYellow: HTMLElement = _first(config.element.getElementsByClassName(w['lineYellow']));
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
