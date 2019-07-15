import {IChart, IChartData} from "../interfaces";
import {AverageNumberConfig} from "./averageNumberConfig";
import s from "../styles/_all.less";
// import st from "./averageNumberChart.less";

export class AverageNumberChart implements IChart {
    run(config: AverageNumberConfig, data: IChartData): void {
        const str = `
            <div class='${s["widget"]}'>
                <div class='${s["row"]}'>
                    <div class='${s["col"]} ${s["col-100"]} ${s["color-yellow"]}'>
                        ${data.title}
                    </div>
                </div>
                
                <div class='${s["row"]}'>
                    <div class='${s["col"]} ${s["s-w-12-24"]}  ${s["text-left"]}'>
                        hello
                    </div>
                    <div class='${s["col"]} ${s["s-w-12-24"]}  ${s["text-right"]}'>
                        world
                    </div>
                </div>
            </div>
        `;
        config.element.innerHTML = str;
    }
}
