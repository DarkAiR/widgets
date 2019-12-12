import s from "../../styles/_all.less";
import w from "./averageNumber.less";

import {IChartData, IWidgetVariables} from "../../interfaces";
import {AverageNumberSettings} from "./averageNumberSettings";
import {get as _get} from "lodash";
import {Chart} from "../../models/Chart";

export class AverageNumber extends Chart {
    getVariables(): IWidgetVariables {
        return {};
    }

    run(data: IChartData): void {
        const settings = <AverageNumberSettings>data.settings;
        console.log('AverageNumber settings: ', settings);

        const currValue = _get(data.data[0], '[0].value', 0);
        const prevValue = _get(data.data[1], '[0].value', 0);

        const currColor = this.getColor(data.dataSets[0].settings, 'color-yellow');
        const prevColor = this.getColor(data.dataSets[1].settings, 'color-grey');

        const str = `
            <div class='${s["widget"]}'>
                <div class='${s["row"]}'>
                    <div class='${s["col"]} ${s["col-100"]}'>
                        <div class="${w['title']}">
                            ${settings.title}
                        </div>
                    </div>
                </div>
                <div class='${s["row"]}'>
                    <div class='${w['curr']} ${w['num']} ${w[currColor.className]}  ${s["col"]} ${s["s-w-12-24"]} ${s["col-vmid"]}'
                         style='${currColor.colorStyle}'
                    >
                        ${currValue}
                    </div>
                    <div class='${w['prev']} ${w['num']} ${w[prevColor.className]}  ${s["col"]} ${s["s-w-12-24"]} ${s["col-vmid"]}'
                         style='${prevColor.colorStyle}'
                    >
                        ${prevValue}
                    </div>
                </div>
                <div class='${s["row"]}'>
                    <div class='${w['curr']} ${w['text']} ${w[currColor.className]}  ${s["col"]} ${s["s-w-12-24"]}'
                         style='${currColor.colorStyle}'
                    >
                        Текущие
                    </div>
                    <div class='${w['prev']} ${w['text']} ${w[prevColor.className]}  ${s["col"]} ${s["s-w-12-24"]}'
                         style='${prevColor.colorStyle}'
                    >
                        Предыдущие
                    </div>
                </div>
            </div>
        `;
        this.config.element.innerHTML = str;

        const currElement: HTMLElement = this.config.element.querySelector(`.${w['curr']}`);
        const prevElement: HTMLElement = this.config.element.querySelector(`.${w['prev']}`);
        if (currElement) {
            currElement.addEventListener('click', () => {
                this.config.eventBus.trigger('EVENT_W2_TO_W1', {value: currValue});
            });
            prevElement.addEventListener('click', () => {
                this.config.eventBus.trigger('EVENT_W1_TO_W2', {value: prevValue});
            });
        }
    }
}
