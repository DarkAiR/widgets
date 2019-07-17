import { WidgetConfig } from "../models/widgetConfig";
import { IChartData } from ".";
export interface IChart {
    run(config: WidgetConfig, data: IChartData): void;
}
