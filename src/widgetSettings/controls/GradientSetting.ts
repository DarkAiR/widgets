import {BaseSetting} from "./BaseSetting";
import {SettingFunc} from "../types";
import {IGradient} from "../../interfaces";

type DefaultType = IGradient;

export interface GradientSetting extends BaseSetting<DefaultType> {
}

export function makeGradient(name: string, label: string, def: DefaultType = null): SettingFunc {
    return (): GradientSetting => ({
        name,
        label,
        type: 'gradient',
        default: def ?? {colors: [], rotate: 0},
        condition: ''
    });
}
