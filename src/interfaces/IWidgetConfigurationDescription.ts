/**
 * Конфигурация виджета
 * Settings + общие настройки виджета
 */

import {WidgetSettingsTypes} from "../models/types";

export interface IWidgetConfigurationDescriptionItem {
    name: string;
    type: WidgetSettingsTypes;
    default: any | null;                    // tslint:disable-line:no-any
}

export interface IWidgetConfigurationDescription {
    settings: IWidgetConfigurationDescriptionItem[];
    dataSet: {
        initAmount: number,                 // Количество dataSet при инициализации виджета
        canAdd: boolean,                    // Возвожность добавления/удаления dataSet
        settings: IWidgetConfigurationDescriptionItem[];
    };
}
