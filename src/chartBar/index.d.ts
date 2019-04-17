import { DiagramChartData } from "../render/diagram-chart";
import { Config } from "../models/config";
import { IChart } from "../interfaces/IChart";
export declare class ChartBar {
    chart: IChart;
    run(config: Config, data: DiagramChartData): string;
    private init;
    private resizeObserve;
}
