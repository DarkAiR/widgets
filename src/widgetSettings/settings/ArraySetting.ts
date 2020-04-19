import {BaseSetting} from "./BaseSetting";
import {SettingFunc, WidgetSettingsArray, WidgetSettingsItem} from "../types";
import {ISettings} from "../../interfaces";

type DefaultType = ISettings[];

export interface ArraySetting extends BaseSetting<DefaultType> {
    settings: WidgetSettingsArray[];
    collapse: boolean;      // Свернуто или развернуто по-умолчанию
}

export function makeArray(name: string, label: string, settings: Array<SettingFunc[]>, collapse: boolean = false): SettingFunc {
    const defSettings: DefaultType = [{}];
    settings.forEach((row: SettingFunc[]) => {
        row.forEach((v: SettingFunc) => {
            const setting: WidgetSettingsItem = v();
            defSettings[0][setting.name] = setting.default;
        });
    });
    return (): ArraySetting => ({
        name,
        label,
        type: 'array',
        // default - обычный flat-объект
        default: defSettings,
        // settings - это массив из строк
        settings: settings.map((row: SettingFunc[]) => row.map((v: SettingFunc) => v())),
        collapse
    });
}
