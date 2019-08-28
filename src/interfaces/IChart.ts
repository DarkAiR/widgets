import {IChartData, IWidgetConfig} from ".";

export interface IChart {
    run(config: IWidgetConfig, data: IChartData): void;
}
