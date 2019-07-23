import { IChart, IChartData } from "../interfaces";
import { IndicatorsTableConfig } from "./indicatorsTableConfig";
import { Chart } from "../models/Chart";
export declare class IndicatorsTableChart extends Chart implements IChart {
    run(config: IndicatorsTableConfig, data: IChartData): void;
}
