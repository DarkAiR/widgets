import {BaseSetting} from "./BaseSetting";
import {SettingFunc} from "../types";

type DefaultType = string;

export interface StringSetting extends BaseSetting<DefaultType> {
}

export function makeString(name: string, label: string, def: DefaultType = null): SettingFunc {
    return (): StringSetting => ({
        name,
        label: label,
        type: 'string',
        default: def ?? ''
    });
}
