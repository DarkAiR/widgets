import {BaseSetting} from "./BaseSetting";
import {SettingFunc} from "../types";

export interface NumberSetting extends BaseSetting<number> {
    min: number;
    max: number;
}

export function makeNumber(name: string, def: number, data: {min: number, max: number} = null): SettingFunc {
    return (): NumberSetting => ({
        name,
        type: 'number',
        default: def,
        min: data?.min ?? null,
        max: data?.max ?? null
    });
}
