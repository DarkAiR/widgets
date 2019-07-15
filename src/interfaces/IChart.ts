import {WidgetConfig} from "..";
import {IChartData} from ".";

export interface IChart {
    run(config: WidgetConfig, data: IChartData): void;
}
