import s from "../styles/_all.less";
import w from "./reportChart.less";

import {IChart, IChartData} from "../interfaces";
import {ReportChartSettings} from "./reportChartSettings";
import {get as _get} from "lodash";
import {Chart} from "../models/Chart";
import {WidgetConfig} from "../models/widgetConfig";

export class ReportChart extends Chart implements IChart {
    run(config: WidgetConfig, data: IChartData): void {
        const settings = <ReportChartSettings>data.settings;
        console.log('ReportChart settings: ', settings);

        const data1 = {
            "getReport": {
                "items": [
                    {
                        "key": "coverage",
                        "value": 0.9649603229761247
                    }
                ]
            }
        };

        const title = _get(data1, 'data.getReport.items[0].key', 'coverage');
        const value = _get(data1, 'data.getReport.items[0].value', 0.9649603229761247);
        const color = '#E4B01E';

        const str = `
            <div class='${s["widget"]} ${w["widget"]}'>
                <div class='${w["title"]}'>${title}</div>
                <div class='${w["value"]}' style='color: ${color}'>${value}</div>
            </div>
        `;
        config.element.innerHTML = str;

        this.resize(config.element, (width, height) => {
        });
    }
}
