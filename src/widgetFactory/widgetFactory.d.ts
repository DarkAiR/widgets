import { WidgetConfig } from "../models/widgetConfig";
import { DataProvider } from "..";
export declare class WidgetFactory {
    dataProvider: DataProvider;
    run(config: WidgetConfig): void;
    private chartBar;
    private averageNumberChart;
    private solidGaugeChart;
}
