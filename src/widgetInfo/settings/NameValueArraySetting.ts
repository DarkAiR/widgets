/**
 * Значение = массив INameValue[]
 */

import {BaseSetting} from "./BaseSetting";
import {SettingFunc} from "../types";

export interface NameValueArraySetting extends BaseSetting<[]> {
}

export function makeNameValueArray(name: string, def: []): SettingFunc {
    return (): NameValueArraySetting => ({
        name,
        type: 'nameValueArray',
        default: def
    });
}
