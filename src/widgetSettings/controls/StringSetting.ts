import {BaseSetting} from "./BaseSetting";
import {SettingFunc} from "../types";

type DefaultType = string;

export interface StringSetting extends BaseSetting<DefaultType> {
    readonly: boolean;              // Только для чтения
}

export function makeString(
    name: string,
    label: string,
    def: DefaultType = null,
    data: {
        readonly?: boolean;
        required?: boolean;
    } = null
): SettingFunc {
    return (): StringSetting => ({
        name,
        label: label,
        type: 'string',
        default: def ?? '',
        condition: '',
        readonly: data?.readonly ?? false,
        required: data?.required ?? false
    });
}
