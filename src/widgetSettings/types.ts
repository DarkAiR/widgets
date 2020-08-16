// Тип данных для функции, возвращающей настройку

// Тип функции, возвращающей описание настройки
import {
    ArraySetting,
    BooleanSetting,
    ColorSetting,
    GradientSetting,
    IconSetting,
    ListSetting,
    NumberSetting,
    SettingsGroupSetting,
    StringSetting,
    PasswordSetting
} from "./controls";
import {ResourceGroupsSetting} from "./controls/ResourceGroupsSetting";

export type SettingFunc = (...args: any) => WidgetSettingsItem;     // tslint:disable-line:no-any

// Типы настроек
export type WidgetSettingsTypes = 'string' | 'number' | 'boolean' | 'list' | 'color' | 'gradient' | 'icon'
    | 'settingsGroup' | 'array' | 'password' | 'resourceGroups';

// Тип для hint SettingsGroupSetting
export type SettingsGroupType = 'string' | 'widgetPaddings' | 'chartPaddings';

// Обобщенная структура данных всех настроек
// tslint:disable:no-any
export type WidgetSettingsItem =
    StringSetting |
    NumberSetting |
    BooleanSetting |
    ListSetting<any> |
    ColorSetting |
    IconSetting |
    GradientSetting |
    SettingsGroupSetting |
    ArraySetting |
    PasswordSetting |
    ResourceGroupsSetting;
// tslint:enable:no-any

export type WidgetSettingsArray = WidgetSettingsItem[];
