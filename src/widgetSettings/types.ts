// Тип данных для функции, возвращающей настройку

// Тип функции, возвращающей описание настройки
import {
    ArraySetting,
    BooleanSetting,
    ColorSetting,
    GradientSetting,
    IconSetting,
    ListSetting,
    NameValueArraySetting,
    NumberSetting,
    SettingsGroupSetting,
    StringSetting
} from "./settings";

export type SettingFunc = (...args: any) => WidgetSettingsItem;     // tslint:disable-line:no-any

// Типы настроек
export type WidgetSettingsTypes = 'string' | 'number' | 'boolean' | 'list' | 'color' | 'gradient' | 'icon'
    | 'nameValueArray' | 'settingsGroup' | 'array';

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
    GradientSetting |
    SettingsGroupSetting |
    ArraySetting;
// tslint:enable:no-any

export type WidgetSettingsArray = WidgetSettingsItem[];
