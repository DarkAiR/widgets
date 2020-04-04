import {BaseSetting} from "./BaseSetting";
import {SettingFunc} from "../types";

type DefaultType = string;

export interface ColorSetting extends BaseSetting<DefaultType> {
}

export function makeColor(name: string, def: DefaultType): SettingFunc {
    return (): ColorSetting => ({
        name,
        type: 'color',
        default: def
    });
}
