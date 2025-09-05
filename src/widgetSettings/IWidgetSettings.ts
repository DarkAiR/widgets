/**
 * Конфигурация виджета (информация о внутреннем устройстве)
 * Settings + общие настройки виджета
 */
import {WidgetSettingsArray} from "./types";
import {InitDataSets} from "./InitDataSets";

// Конфигурация всего виджета
// По-умолчанию настройки в виде функций, после преобразования в виде правильных объектов
export interface IWidgetSettings<T = void> {
    settings: T extends void ? WidgetSettingsArray : T;          // Основные настройки виджета

    dataSet: {
        initDataSets: InitDataSets;                         // Массив dataSet для инициализации виджета
        canAdd: boolean,                                    // Возможность добавления/удаления dataSet
        settings: T extends void ? WidgetSettingsArray: T;  // Настройки датасетов
    };
}
