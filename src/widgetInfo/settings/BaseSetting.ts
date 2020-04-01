import {WidgetSettingsTypes} from "../types";

export interface BaseSetting<T> {
    name: string;
    type: WidgetSettingsTypes;
    default: T | null;
}
