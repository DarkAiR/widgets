import {DiagramChartData, WidgetConfig} from "..";

export interface IChart {
    run(config: WidgetConfig, data: DiagramChartData): void;
}
