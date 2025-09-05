import {BaseSetting} from "./BaseSetting";
import {SettingFunc} from "../types";

type DefaultType = boolean;

export interface BooleanSetting extends BaseSetting<DefaultType> {
}

export function makeBoolean(
    name: string,
    label: string,
    def: DefaultType,
    data: {
        required?: boolean;
    } = null
): SettingFunc {
    return (): BooleanSetting => ({
        name,
        label,
        type: 'boolean',
        default: def,
        condition: '',
        required: data?.required ?? false
    });
}
