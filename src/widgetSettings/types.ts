// Тип данных для функции, возвращающей настройку

// Тип функции, возвращающей описание настройки
import {
    BooleanSetting,
    ColorSetting,
    IconSetting,
    ListSetting,
    NameValueArraySetting,
    NumberSetting,
    SettingsArraySetting,
    StringSetting
} from "./settings";

export type SettingFunc = (...args: any) => WidgetSettingsItem;     // tslint:disable-line:no-any

// Типы настроек
export type WidgetSettingsTypes = 'string' | 'number' | 'boolean' | 'list' | 'color' | 'nameValueArray' | 'icon' | 'settingsArray';

// Обобщенная структура данных всех настроек
// tslint:disable:no-any
export type WidgetSettingsItem =
    StringSetting |
    NumberSetting |
    BooleanSetting |
    ListSetting<any> |
    ColorSetting |
    NameValueArraySetting |
    IconSetting |
    SettingsArraySetting;
// tslint:enable:no-any

export type WidgetSettingsArray = WidgetSettingsItem[];
