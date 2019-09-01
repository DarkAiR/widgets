import s from "../styles/_all.less";
import w from "./solidGaugeChart.less";

import {IChart, IChartData} from "../interfaces";
import {SolidGaugeSettings} from "./solidGaugeSettings";
import {get as _get} from "lodash";
import {Chart} from "../models/Chart";
import {WidgetConfig} from "../models/widgetConfig";

export class SolidGaugeChart extends Chart implements IChart {
    run(config: WidgetConfig, data: IChartData): void {
        const settings = <SolidGaugeSettings>data.settings;
        console.log('SolidGaugeChart settings: ', settings);
        console.log('SolidGaugeChart data: ', data);

        const maxValue = _get(data, 'data[1][0].value', 0);
        const currValue = _get(data, 'data[1][1].value', 0);
        const color = _get(data, 'dataSets[0].settings.color', 0);

        const percent = currValue / maxValue * 100;
        const magicLengthOfSvgPath = 503.3096923828125;
        const percentToLength = magicLengthOfSvgPath * (percent / 100);
        const sdo = magicLengthOfSvgPath - percentToLength > 0 ? magicLengthOfSvgPath - percentToLength : 0;
        const getCurrentValueFZ = (currValue)=> {
            const length = currValue.toString().length;
            switch (length) {
                case 9:
                    return '46';
                case 10:
                    return '40';
                case 11:
                    return '36';
                case 12:
                    return '34';
                default:
                    return '56';
            }
        };

        const str = `
            <div class='${s["widget"]} ${w['widget']}'>
                <div class="${w['info']}">
                    <div class="${w['current-value']}" style="font-size: ${getCurrentValueFZ(currValue)}px">${currValue}</div>
                    <div class="${w['title']}">${settings.title}</div>
                </div>
                <div class="${w['chart']}">
                    <span class="mdi ${settings.icon} ${w['icon']} ${s['size-24']} ${s['color-yellow']}"></span>
                    <svg width="100%" height="100%" viewBox="0 0 336 176" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 168C8.00001 79.6344 79.6345 7.99998 168 7.99999C256.366 7.99999 328 79.6344 328 168" 
                            stroke="black" stroke-opacity="0.15" stroke-width="16"
                            stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M8 168C8.00001 79.6344 79.6345 7.99998 168 7.99999C256.366 7.99999 328 79.6344 328 168" 
                            stroke="${color}" stroke-width="16"
                            stroke-linecap="round" stroke-linejoin="round"
                            stroke-dasharray=${magicLengthOfSvgPath} stroke-dashoffset=${sdo} />
                    </svg>

                    <div class="${w['value']} ${w['minValue']}">0</div>
                    <div class="${w['value']} ${w['maxValue']}">${maxValue}</div>
                </div>
            </div>
        `;

        config.element.innerHTML = str;

        this.resize(config.element, (width, height) => {
        });
    }
}
