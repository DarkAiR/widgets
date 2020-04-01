/**
 * Конфигурация виджета (информация о внутреннем устройстве)
 * Settings + общие настройки виджета
 */
import {WidgetInfoSettings} from "./types";

// Конфигурация всего виджета
// По-умолчанию настройки в виде функций, после преобразования в виде правильных объектов
export interface IWidgetInfo<T = void> {
    settings: T extends void ? WidgetInfoSettings : T;          // Основные настройки виджета

    dataSet: {
        initAmount: number,                 // Количество dataSet при инициализации виджета
        canAdd: boolean,                    // Возвожность добавления/удаления dataSet
        settings: T extends void ? WidgetInfoSettings: T;      // Настройки датасетов
    };
}

const c: IWidgetInfo = {
    settings: null,
    dataSet: {
        initAmount: 0,
        canAdd: true,
        settings: null
    }
};
