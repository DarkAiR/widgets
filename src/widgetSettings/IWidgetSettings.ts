/**
 * Конфигурация виджета (информация о внутреннем устройстве)
 * Settings + общие настройки виджета
 */
import {WidgetSettingsArray} from "./types";

// Конфигурация всего виджета
// По-умолчанию настройки в виде функций, после преобразования в виде правильных объектов
export interface IWidgetSettings<T = void> {
    settings: T extends void ? WidgetSettingsArray : T;          // Основные настройки виджета

    dataSet: {
        initAmount: number,                 // Количество dataSet при инициализации виджета
        canAdd: boolean,                    // Возвожность добавления/удаления dataSet
        settings: T extends void ? WidgetSettingsArray: T;      // Настройки датасетов
    };
}
