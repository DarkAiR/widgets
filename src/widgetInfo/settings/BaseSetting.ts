import {WidgetSettingsTypes} from "../types";

export interface BaseSetting<T> {
    name: string;                   // Название переменной
    label: string;                  // Заголовок переменной (для checkbox label != name)
    type: WidgetSettingsTypes;      // Тип настройки
    default: T | null;              // Значение по-умолчанию
}
