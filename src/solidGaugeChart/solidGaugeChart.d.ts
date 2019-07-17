import { IChart, IChartData } from "../interfaces";
import { SolidGaugeConfig } from "./solidGaugeConfig";
export declare class SolidGaugeChart implements IChart {
    run(config: SolidGaugeConfig, data: IChartData): void;
}
