import {BaseSetting} from "./BaseSetting";
import {SettingFunc, WidgetSettingsArray, WidgetSettingsItem} from "../types";
import {ISettings, INameValue} from "../../interfaces";

type DefaultType = ISettings;

export interface SettingsGroupSetting extends BaseSetting<DefaultType> {
    settings: WidgetSettingsArray[];
    collapse: boolean;      // Свернуто или развернуто по-умолчанию
    oneLineRows: boolean;   // Группа, в которой все элементы это отдельный строка
}

export function makeSettingsGroup(
    name: string,
    label: string,
    settings: Array<SettingFunc[]>,
    data: {
        collapse?: boolean;         // Сворачивание при инициализации,
        oneLineRows?: boolean;      // Группа, в которой все элементы это отдельный строка,
        condition?: string;         // Условия на JS в формате "${var1} === 'foo' && ${var2} > 2"
    } = null
): SettingFunc {
    const defSettings: DefaultType = {};
    settings.forEach((row: SettingFunc[]) => {
        row.forEach((v: SettingFunc) => {
            const setting: WidgetSettingsItem = v();
            defSettings[setting.name] = setting.default;
        });
    });
    return (): SettingsGroupSetting => ({
        name,
        label,
        type: 'settingsGroup',
        // default - обычный flat-объект
        default: defSettings,
        // settings - это массив из строк
        settings: settings.map((row: SettingFunc[]) => row.map((v: SettingFunc) => v())),
        collapse: data?.collapse ?? false,
        oneLineRows: data?.oneLineRows ?? false,
        condition: data?.condition ?? ''
    });
}
