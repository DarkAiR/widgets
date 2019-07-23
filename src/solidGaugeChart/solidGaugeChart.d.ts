import { IChart, IChartData } from "../interfaces";
import { SolidGaugeConfig } from "./solidGaugeConfig";
import { Chart } from "../models/Chart";
export declare class SolidGaugeChart extends Chart implements IChart {
    private static X_TO_Y_RATION;
    run(config: SolidGaugeConfig, data: IChartData): void;
}
