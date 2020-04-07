import s from "../../styles/_all.less";
import w from "./averageNumber.less";
import {settings as widgetSettings} from "./settings";

import {IChartData, IWidgetVariables} from "../../interfaces";
import {get as _get} from "lodash";
import {Chart} from "../../models/Chart";
import {TypeGuardsHelper} from "../../helpers";
import {IWidgetSettings} from "../../widgetSettings";

export class AverageNumber extends Chart {
    getVariables(): IWidgetVariables {
        return {};
    }

    getSettings(): IWidgetSettings {
        return widgetSettings;
    }

    run(): void {
        const data: IChartData = this.chartData;

        if (TypeGuardsHelper.dataSetsIsDataSetTemplate(data.dataSets)) {
            const currValue = _get(data.data[0], '[0].value', 0);
            const prevValue = _get(data.data[1], '[0].value', 0);

            const currColor = this.getColor(data.dataSets[0].settings, 'color-yellow');
            const prevColor = this.getColor(data.dataSets[1].settings, 'color-grey');

            const str = `
                <div class='${s["widget"]}'>
                    <div class='${s["row"]}'>
                        <div class='${s["col"]} ${s["col-100"]}'>
                            <div class="${w['title']}">
                                ${this.getWidgetSetting(data.settings, 'title')}
                            </div>
                        </div>
                    </div>
                    <div class='${s["row"]}'>
                        <div class='${w['curr']} ${w['num']} ${w[currColor.className]}  ${s["col"]} ${s["s-w-12-24"]} ${s["col-vmid"]}'
                             style='${currColor.style}'
                        >
                            ${currValue}
                        </div>
                        <div class='${w['prev']} ${w['num']} ${w[prevColor.className]}  ${s["col"]} ${s["s-w-12-24"]} ${s["col-vmid"]}'
                             style='${prevColor.style}'
                        >
                            ${prevValue}
                        </div>
                    </div>
                    <div class='${s["row"]}'>
                        <div class='${w['curr']} ${w['text']} ${w[currColor.className]}  ${s["col"]} ${s["s-w-12-24"]}'
                             style='${currColor.style}'
                        >
                            Текущие
                        </div>
                        <div class='${w['prev']} ${w['text']} ${w[prevColor.className]}  ${s["col"]} ${s["s-w-12-24"]}'
                             style='${prevColor.style}'
                        >
                            Предыдущие
                        </div>
                    </div>
                </div>
            `;
            this.config.element.innerHTML = str;
        }
    }
}
