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

        const maxValue = _get(data, 'data[1][0].value', 0);
        const currValue = _get(data, 'data[0][0].value', 0);
        const color = _get(data, 'dataSets[0].settings.color', 0);

        const percent = currValue / maxValue * 100;
        const magicLengthOfSvgPath = 503.3096923828125;
        const percentToLength = magicLengthOfSvgPath * (percent / 100);
        const sdo = magicLengthOfSvgPath - percentToLength > 0 ? magicLengthOfSvgPath - percentToLength : 0;
        const getCurrentValueFZ = (currValue, isSmall) => {
            const length = currValue.toString().length;
            if (!isSmall) {
                switch (length) {
                    case 9:
                        return '46';
                    case 10:
                        return '40';
                    case 11:
                        return '36';
                    case 12:
                        return '30';
                    default:
                        return '54';
                }
            } else {
                switch (length) {
                    case 9:
                        return '18';
                    case 10:
                        return '16';
                    case 11:
                        return '14';
                    case 12:
                        return '12';
                    default:
                        return '20';
                }
            }
        };
        const currentValueFZ = getCurrentValueFZ(currValue, false);

        const str = `
            <div class='${s["widget"]} ${w['widget']}'>
                <div class="${w['info']}">
                    <div class="${w['current-value']}" style="font-size: ${currentValueFZ}px">${currValue}</div>
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
            const widgets = document.getElementsByClassName('solidGaugeChart-widget');
            const currentValues = document.getElementsByClassName('solidGaugeChart-current-value');

            if (width < 300) {
                const currentValueFZ = getCurrentValueFZ(currValue, true);
                [].forEach.call(currentValues, cv => cv.setAttribute('style', `font-size: ${currentValueFZ}px`));
                [].forEach.call(widgets, w => w.classList.add('solidGaugeChart-widget__small'));
            } else {
                const currentValueFZ = getCurrentValueFZ(currValue, false);
                [].forEach.call(currentValues, cv => cv.setAttribute('style', `font-size: ${currentValueFZ}px`));
                [].forEach.call(widgets, w => w.classList.remove('solidGaugeChart-widget__small'));
            }
        });
    }
}
