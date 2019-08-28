/**
 * Interface for chart
 */
import {WidgetConfig} from "../models/widgetConfig";

export interface IRender {
    init(config: WidgetConfig, styles): IRender;
    render(): void;
    clear(): IRender;
    setData(data: Object): IRender;
}
