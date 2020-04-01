import {BaseSetting} from "./BaseSetting";
import {SettingFunc} from "../types";

export interface StringSetting extends BaseSetting<string> {
}

export function makeString(name: string, def: string): SettingFunc {
    return (): StringSetting => ({
        name,
        type: 'string',
        default: def
    });
}
