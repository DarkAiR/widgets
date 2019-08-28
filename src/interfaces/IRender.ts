/**
 * Interface for chart
 */
import {IWidgetConfig} from ".";

export interface IRender {
    init(config: IWidgetConfig, styles): IRender;
    render(): void;
    clear(): IRender;
    setData(data: Object): IRender;
}
