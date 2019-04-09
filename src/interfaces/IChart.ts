/**
 * Interface for chart
 */
import {Config} from "../models/config";

export interface IChart {
    init(config: Config): IChart;
    render(): void;
    clear(): IChart;
    setData(data: Object): IChart;
    // getDomain(axis);
    // getWidth();
    // getHeight();
    // getIndicators();
}
