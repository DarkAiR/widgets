// Тип данных для функции, возвращающей настройку
import {StringSetting} from "./settings/StringSetting";
import {NumberSetting} from "./settings/NumberSetting";
import {BooleanSetting} from "./settings/BooleanSetting";
import {ListSetting} from "./settings/ListSetting";
import {ColorSetting} from "./settings/ColorSetting";
import {NameValueArraySetting} from "./settings/NameValueArraySetting";
import {IconSetting} from "./settings/IconSetting";
import {SettingsArraySetting} from "./settings/SettingsArraySetting";

// Тип функции, возвращающей описание настройки
export type SettingFunc = (...args: any) => WidgetInfoSettingsItem;     // tslint:disable-line:no-any

// Тип настроек, экспортируемых пользователю
export type WidgetInfoSettings = WidgetInfoSettingsItem[];

// Типы настроек
export type WidgetSettingsTypes = 'string' | 'number' | 'boolean' | 'list' | 'color' | 'nameValueArray' | 'icon' | 'settingsArray';

// Обобщенная структура данных всех настроек
// tslint:disable:no-any
export type WidgetInfoSettingsItem =
    StringSetting |
    NumberSetting |
    BooleanSetting |
    ListSetting<any> |
    ColorSetting |
    NameValueArraySetting |
    IconSetting |
    SettingsArraySetting;
// tslint:enable:no-any
