import {BaseSetting} from "./BaseSetting";
import {SettingFunc} from "../types";

type DefaultType = string;

export interface StringSetting extends BaseSetting<DefaultType> {
}

export function makeString(name: string, def: DefaultType): SettingFunc {
    return (): StringSetting => ({
        name,
        type: 'string',
        default: def
    });
}
