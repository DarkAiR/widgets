import {BaseSetting} from "./BaseSetting";
import {SettingFunc, WidgetInfoSettings, WidgetInfoSettingsItem} from "../types";
import {ISettings} from "../../interfaces";

type DefaultType = ISettings;

export interface SettingsArraySetting extends BaseSetting<DefaultType> {
    settings: WidgetInfoSettings;
}

export function makeSettingsArray(name: string, label: string, settings: SettingFunc[]): SettingFunc {
    const defSettings: DefaultType = {};
    settings.forEach((v: SettingFunc) => {
        const setting: WidgetInfoSettingsItem = v();
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
