import { IChart, IChartData } from "../interfaces";
import { AverageNumberConfig } from "./averageNumberConfig";
export declare class AverageNumberChart implements IChart {
    run(config: AverageNumberConfig, data: IChartData): void;
}
