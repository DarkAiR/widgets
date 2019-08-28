import {IChartData} from ".";
import {WidgetConfig} from "../models/widgetConfig";

export interface IChart {
    run(config: WidgetConfig, data: IChartData): void;
}
