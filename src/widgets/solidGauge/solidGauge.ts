import s from "../../styles/_all.less";
import w from "./solidGauge.less";

import {IChartData, IWidgetVariables} from "../../interfaces";
import {SolidGaugeSettings} from "./solidGaugeSettings";
import {get as _get} from "lodash";
import {Chart} from "../../models/Chart";

export class SolidGauge extends Chart {
    getVariables(): IWidgetVariables {
        return {};
    }

    run(data: IChartData): void {
        const settings = <SolidGaugeSettings>data.settings;
        console.log('SolidGauge settings: ', settings);

        const maxValue = _get(data, 'data[1][0].value', 0);
        const currValue = _get(data, 'data[0][0].value', 0);

        const color = this.getColor(data.dataSets[0].settings, 'color-yellow');
        const maxColor = this.getColor(data.dataSets[1].settings, 'color-grey');

        const percent = currValue / maxValue * 100;
        const magicLengthOfSvgPath = 503.3096923828125;
        const percentToLength = magicLengthOfSvgPath * (percent / 100);
        const sdo = magicLengthOfSvgPath - percentToLength > 0 ? magicLengthOfSvgPath - percentToLength : 0;
        const fontSize = this.getFontSize(currValue);

        const output = this.renderTemplate({
            fontSize,
            currValue,
            title: settings.title,
            icon: settings.icon,
            maxColor: maxColor.color,
            color: color.color,
            magicLengthOfSvgPath,
            sdo,
            maxValue
        });
        this.config.element.innerHTML = output;

        this.onResize = (width: number, height: number) => {
            const widgetInner = this.config.element.querySelector('.solidGauge-widget-inner');
            const chart = this.config.element.querySelector('.solidGauge-chart');
            let maxWidth = getComputedStyle(chart)["max-width"];
            if (maxWidth === undefined) {
                maxWidth = '1px';
            }
            const fontScale = chart.clientWidth / parseInt(maxWidth, 10) * 100;
            widgetInner.setAttribute('style', `font-size: ${fontScale}%`);
        };
    }

    getFontSize(v: number): string {
        const length = v.toString().length;
        return (6 * (8 - length) + 52) + 'px';      // length from 8 to 12
    }

    getTemplate(): string {
        return `
            <div class='${s["widget"]} ${w['widget']}'>
                <div class="${w['widget-inner']}">
                    <div class="${w['info']}">
                        <div class="${w['current-value']}" style="font-size: {{baseFontSize}}">{{currValue}}</div>
                        <div class="${w['title']}">{{title}}</div>
                    </div>
                    <div class="${w['chart']}">
                        <span class="mdi {{icon}} ${w['icon']} ${s['color-yellow']}"></span>
                        <svg width="100%" height="100%" viewBox="0 0 336 176" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 168C8.00001 79.6344 79.6345 7.99998 168 7.99999C256.366 7.99999 328 79.6344 328 168"
                                stroke="{{maxColor}}" stroke-width="16"
                                stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M8 168C8.00001 79.6344 79.6345 7.99998 168 7.99999C256.366 7.99999 328 79.6344 328 168"
                                stroke="{{color}}" stroke-width="16"
                                stroke-linecap="round" stroke-linejoin="round"
                                stroke-dasharray={{magicLengthOfSvgPath}} stroke-dashoffset={{sdo}} />
                        </svg>

                        <div class="${w['value']} ${w['minValue']}">0</div>
                        <div class="${w['value']} ${w['maxValue']}">{{maxValue}}</div>
                    </div>
                </div>
            </div>
        `;
    }
}
