import {BaseSetting} from "./BaseSetting";
import {SettingFunc} from "../types";

type DefaultType = string;

export interface ColorSetting extends BaseSetting<DefaultType> {
}

export function makeColor(name: string, label: string, def: DefaultType = null): SettingFunc {
    return (): ColorSetting => ({
        name,
        label,
        type: 'color',
        default: def ?? null
    });
}
