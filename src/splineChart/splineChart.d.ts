import { IChart, IChartData } from "../interfaces";
import { SplineConfig } from "./splineConfig";
import { Chart } from "../models/Chart";
export declare class SplineChart extends Chart implements IChart {
    run(config: SplineConfig, data: IChartData): void;
}
