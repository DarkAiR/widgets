import {DiagramChartData, WidgetConfig} from "..";
import {IChart} from "../interfaces";

export class AverageNumberChart implements IChart {
    run(config: WidgetConfig, data: DiagramChartData): void {
        const str = 'You see the AverageNumberChart';
        config.element.innerHTML = str;
    }
}
