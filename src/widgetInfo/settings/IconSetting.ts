import {SettingFunc} from "../types";
import {StringSetting} from "./StringSetting";

export interface IconSetting extends StringSetting {
}

export function makeIcon(name: string, def: string): SettingFunc {
    return (): IconSetting => ({
        name,
        type: 'icon',
        default: def
    });
}
