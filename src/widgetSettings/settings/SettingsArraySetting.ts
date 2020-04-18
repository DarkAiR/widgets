import {BaseSetting} from "./BaseSetting";
import {SettingFunc, WidgetSettingsArray, WidgetSettingsItem} from "../types";
import {ISettings} from "../../interfaces";

type DefaultType = ISettings;

export interface SettingsArraySetting extends BaseSetting<DefaultType> {
    settings: WidgetSettingsArray[];
    collapse: boolean;      // Свернуто или развернуто по-умолчанию
}

export function makeSettingsArray(name: string, label: string, settings: Array<SettingFunc[]>, collapse: boolean = false): SettingFunc {
    const defSettings: DefaultType = {};
    settings.forEach((row: SettingFunc[]) => {
        row.forEach((v: SettingFunc) => {
            const setting: WidgetSettingsItem = v();
            defSettings[setting.name] = setting.default;
        });
    });
    return (): SettingsArraySetting => ({
        name,
        label,
        type: 'settingsArray',
        // default - обычный flat-объект
        default: defSettings,
        // settings - это массив из строк
        settings: settings.map((row: SettingFunc[]) => row.map((v: SettingFunc) => v())),
        collapse
    });
}
