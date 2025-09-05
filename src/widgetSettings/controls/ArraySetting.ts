import {BaseSetting} from "./BaseSetting";
import {ISettings} from "../../interfaces";
import {SettingFunc, WidgetSettingsArray} from "../types";

type DefaultType = ISettings[];

export interface ArraySetting extends BaseSetting<DefaultType> {
    settings: WidgetSettingsArray[];
    collapse: boolean;      // Свернуто или развернуто по-умолчанию
}

export function makeArray(
    name: string,
    label: string,
    settings: Array<SettingFunc[]>,
    data: {
        collapse: boolean;          // Сворачивание при инициализации
    } = null
): SettingFunc {
    return (): ArraySetting => ({
        name,
        label,
        type: 'array',
        default: [],
        // settings - это массив из строк
        settings: settings.map((row: SettingFunc[]) => row.map((v: SettingFunc) => v())),
        collapse: data?.collapse ?? false,
        condition: '',
        required: false
    });
}
