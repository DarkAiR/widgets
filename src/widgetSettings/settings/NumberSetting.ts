import {BaseSetting} from "./BaseSetting";
import {SettingFunc} from "../types";

type DefaultType = number | '';

export interface NumberSetting extends BaseSetting<DefaultType> {
    min: number;
    max: number;
}

export function makeNumber(name: string, label: string, def: DefaultType, data: {min: number, max: number} = null): SettingFunc {
    return (): NumberSetting => ({
        name,
        label,
        type: 'number',
        default: def,
        min: data?.min ?? null,
        max: data?.max ?? null
    });
}
