import s from "../styles/_all.less";
import w from "./averageNumberChart.less";

import {IChart, IChartData} from "../interfaces";
import {AverageNumberSettings} from "./averageNumberSettings";
import {get as _get} from "lodash";
import {Chart} from "../models/Chart";
import {WidgetConfig} from "../models/widgetConfig";
import {SingleTimeSeriesValue} from "../interfaces/template/singleTimeSeriesValue";

export class AverageNumberChart extends Chart implements IChart {
    run(config: WidgetConfig, data: IChartData): void {
        const settings = <AverageNumberSettings>data.settings;
        console.log('AverageNumberChart settings: ', settings);

        const timeSeries: SingleTimeSeriesValue[] = data.data[0];
        const currValue = _get(timeSeries, '[0].value', 0);
        const prevValue = _get(timeSeries, '[1].value', 1);
        const currColor = _get(data.dataSets[0].settings, 'color', '#E4B01E');

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
                    <div class='${w['curr']} ${w['num']}  ${s["col"]} ${s["s-w-12-24"]} ${s["col-vmid"]}' style='color: ${currColor}'>
                        ${currValue}
                    </div>
                    <div class='${w['prev']} ${w['num']}  ${s["col"]} ${s["s-w-12-24"]} ${s["col-vmid"]}'>
                        ${prevValue}
                    </div>
                </div>
                <div class='${s["row"]}'>
                    <div class='${w['curr']} ${w['text']}  ${s["col"]} ${s["s-w-12-24"]}' style='color: ${currColor}'>
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
