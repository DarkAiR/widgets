import w from "./solidGauge.less";
import {settings as widgetSettings} from "./settings";

import {IChartData, IWidgetVariables} from "../../interfaces";
import {get as _get} from "lodash";
import {Chart} from "../../models/Chart";
import {SettingsHelper, TypeGuardsHelper} from "../../helpers";
import {IWidgetSettings} from "../../widgetSettings";

export class SolidGauge extends Chart {
    getVariables(): IWidgetVariables {
        return {};
    }

    getSettings(): IWidgetSettings {
        return widgetSettings;
    }

    run(): void {
        const data: IChartData = this.chartData;

        if (TypeGuardsHelper.everyIsDataSetTemplate(data.dataSets)) {
            const maxValue = _get(data, 'data[1][0].value', 0);
            const currValue = _get(data, 'data[0][0].value', 0);

            const percent = currValue / maxValue * 100;
            const magicLengthOfSvgPath = 503.3096923828125;
            const percentToLength = magicLengthOfSvgPath * (percent / 100);
            const sdo = Math.max(magicLengthOfSvgPath - percentToLength, 0);

            const output = this.renderTemplate({
                backgroundStyle: SettingsHelper.getBackgroundStyle(this.getWidgetSetting('background.color')),
                title: this.getWidgetSetting('title'),
                icon: this.getWidgetSetting('icon'),
                minColor: this.getDataSetSettings(data.dataSets[0].settings, 'color'),
                maxColor: this.getDataSetSettings(data.dataSets[1].settings, 'color'),
                magicLengthOfSvgPath,
                sdo,
                minValue: 0,
                maxValue,
                currValue,
            });
            this.config.element.innerHTML = output;

            this.onResize = (width: number, height: number) => {
                const widgetInner = this.config.element.querySelector(`.${w['widget']} > div`);
                const chart = this.config.element.querySelector(`.${w['chart']}`);
                let maxWidth = getComputedStyle(chart)["max-width"];
                if (maxWidth === undefined) {
                    maxWidth = '1px';
                }
                const fontScale = chart.clientWidth / parseInt(maxWidth, 10) * 100; // Это значение не может быть больше 1
                widgetInner.setAttribute('style', `font-size: ${fontScale}%`);      // Это значение не может быть больше 100%
            };
        }
    }

    getTemplate(): string {
        return `
            <div class="${w['widget']}" style="{{backgroundStyle}}">
                <div do-not-remove>
                    <div class="${w['info']}">
                        <div class="${w['current-value']}">{{currValue}}</div>
                        <div class="${w['title']}">{{title}}</div>
                    </div>
                    <div class="${w['chart']}">
                        <span class="${w['icon']}">
                            <span class="${w['inner']}">
                                <span class="mdi {{icon}}"></span>
                            </span>
                        </span>

                        <svg width="100%" height="100%" viewBox="0 0 336 176" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 168C8.00001 79.6344 79.6345 7.99998 168 7.99999C256.366 7.99999 328 79.6344 328 168"
                                stroke="{{maxColor}}" stroke-width="16"
                                stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M8 168C8.00001 79.6344 79.6345 7.99998 168 7.99999C256.366 7.99999 328 79.6344 328 168"
                                stroke="{{minColor}}" stroke-width="16"
                                stroke-linecap="round" stroke-linejoin="round"
                                stroke-dasharray={{magicLengthOfSvgPath}} stroke-dashoffset={{sdo}} />
                        </svg>

                        <div class="${w['value']} ${w['minValue']}">{{minValue}}</div>
                        <div class="${w['value']} ${w['maxValue']}">{{maxValue}}</div>
                    </div>
                </div>
            </div>
        `;
    }
}
