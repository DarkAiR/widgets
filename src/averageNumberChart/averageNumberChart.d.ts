import { IChart, IChartData } from "../interfaces";
import { AverageNumberConfig } from "./averageNumberConfig";
import { Chart } from "../models/Chart";
export declare class AverageNumberChart extends Chart implements IChart {
    run(config: AverageNumberConfig, data: IChartData): void;
}
