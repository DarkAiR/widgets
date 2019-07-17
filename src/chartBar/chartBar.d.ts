import { DiagramChartData } from "../render/diagram-chart";
import { WidgetConfig } from "../models/widgetConfig";
import { IRender } from "../interfaces";
export declare class ChartBar {
    chart: IRender;
    run(config: WidgetConfig, data: DiagramChartData): string;
    private init;
    private resizeObserve;
}
