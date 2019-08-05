import s from "../styles/_all.less";
import w from "./solidGaugeChart.less";

import {IChart, IChartData} from "../interfaces";
import {SolidGaugeConfig} from "./solidGaugeConfig";
import {get as _get, first as _first} from "lodash";
import {Chart} from "../models/Chart";

export class SolidGaugeChart extends Chart implements IChart {
    private static X_TO_Y_RATION= 2;

    run(config: SolidGaugeConfig, data: IChartData): void {
        const currValue = _get(data, 'data[0].values[0].value', 0);
        const maxValue = _get(data, 'data[0].values[1].value', 0);

        // const maxValue = 450;
        // const currValue = 50;
        const percent = currValue / maxValue * 100;
        const magicLengthOfSvgPath = 503.3096923828125;
        const percentToLength = magicLengthOfSvgPath * (percent / 100);
        const sdo = magicLengthOfSvgPath - percentToLength > 0 ? magicLengthOfSvgPath - percentToLength : 0;
        const str = `
            <div class='${s["widget"]} ${w['widget']}'>
                <div class="${w['info']}">
                    <div class="${w['current-value']}">${currValue}</div>
                    <div class="${w['title']}">${data.title}</div>
                </div>
                <div class="${w['chart']}">
                    <span class="${config.icon} ${w['icon']} ${s['size-20']} ${s['color-yellow']}"></span>
                    <svg width="336" height="176" viewBox="0 0 336 176" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 168C8.00001 79.6344 79.6345 7.99998 168 7.99999C256.366 7.99999 328 79.6344 328 168" 
                            stroke="black" stroke-opacity="0.15" stroke-width="16"
                            stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M8 168C8.00001 79.6344 79.6345 7.99998 168 7.99999C256.366 7.99999 328 79.6344 328 168" 
                            stroke="#E4B01E" stroke-width="16"
                            stroke-linecap="round" stroke-linejoin="round"
                            stroke-dasharray=${magicLengthOfSvgPath} stroke-dashoffset=${sdo} />
                    </svg>

                    <div class="${w['value']} ${w['minValue']}">0</div>
                    <div class="${w['value']} ${w['maxValue']}">${maxValue}</div>
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
