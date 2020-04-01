import {BaseSetting} from "./BaseSetting";
import {SettingFunc} from "../types";

export interface ColorSetting extends BaseSetting<string> {
}

export function makeColor(name: string, def: string): SettingFunc {
    return (): ColorSetting => ({
        name,
        type: 'color',
        default: def
    });
}
