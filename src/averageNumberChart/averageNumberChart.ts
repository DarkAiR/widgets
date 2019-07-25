import s from "../styles/_all.less";
import w from "./averageNumberChart.less";

import {IChart, IChartData} from "../interfaces";
import {AverageNumberConfig} from "./averageNumberConfig";
import {get as _get} from "lodash";
import {Chart} from "../models/Chart";

export class AverageNumberChart extends Chart implements IChart {
    run(config: AverageNumberConfig, data: IChartData): void {
        const str = `
            <div class='${s["widget"]}'>
                <div class='${s["row"]}'>
                    <div class='${s["col"]} ${s["col-100"]}'>
                        <div class="${w['title']}">
                            ${data.title}
                        </div>
                    </div>
                </div>
                <div class='${s["row"]}'>
                    <div class='${w['curr']} ${w['num']}  ${s["col"]} ${s["s-w-12-24"]} ${s["col-vmid"]}'>
                        ${_get(data, 'data[0][0].value', 0)}
                    </div>
                    <div class='${w['prev']} ${w['num']}  ${s["col"]} ${s["s-w-12-24"]} ${s["col-vmid"]}'>
                        ${_get(data, 'data[0][1].value', 0)}
                    </div>
                </div>
                <div class='${s["row"]}'>
                    <div class='${w['curr']} ${w['text']}  ${s["col"]} ${s["s-w-12-24"]}'>
                        Текущие
                    </div>
                    <div class='${w['prev']} ${w['text']}  ${s["col"]} ${s["s-w-12-24"]}'>
                        Предыдущие
                    </div>
                </div>
            </div>
        `;
        config.element.innerHTML = str;
    }
}
