import {BaseSetting} from "./BaseSetting";
import {SettingFunc} from "../types";

export interface BooleanSetting extends BaseSetting<boolean> {
}

export function makeBoolean(name: string, def: boolean): SettingFunc {
    return (): BooleanSetting => ({
        name,
        type: 'boolean',
        default: def
    });
}
