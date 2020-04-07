import {BaseSetting} from "./BaseSetting";
import {SettingFunc, WidgetSettingsArray, WidgetSettingsItem} from "../types";
import {ISettings} from "../../interfaces";

type DefaultType = ISettings;

export interface SettingsArraySetting extends BaseSetting<DefaultType> {
    settings: WidgetSettingsArray;
}

export function makeSettingsArray(name: string, label: string, settings: SettingFunc[]): SettingFunc {
    const defSettings: DefaultType = {};
    settings.forEach((v: SettingFunc) => {
        const setting: WidgetSettingsItem = v();
        defSettings[setting.name] = setting.default;
    });

    return (): SettingsArraySetting => ({
        name,
        label,
        type: 'settingsArray',
        default: defSettings,
        settings: settings.map((v: SettingFunc) => v())
    });
}
