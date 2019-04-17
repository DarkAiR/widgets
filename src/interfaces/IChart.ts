/**
 * Interface for chart
 */
import {Config} from "../models/config";

export interface IChart {
    init(config: Config, styles): IChart;
    render(): void;
    clear(): IChart;
    setData(data: Object): IChart;
}
