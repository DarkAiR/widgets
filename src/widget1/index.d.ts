import { DiagramChartData, DiagramChart } from "../models/diagram-chart";
import { Config } from "../models/config";
export declare class Widget1 {
    chart: DiagramChart;
    run(config: Config, data: DiagramChartData): string;
    private init;
}
