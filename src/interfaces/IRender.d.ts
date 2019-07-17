/**
 * Interface for chart
 */
import { WidgetConfig } from "../models/widgetConfig";
export interface IRender {
    init(config: WidgetConfig, styles: any): IRender;
    render(): void;
    clear(): IRender;
    setData(data: Object): IRender;
}
