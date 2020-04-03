/**
 * Значение = массив INameValue[]
 */

import {BaseSetting} from "./BaseSetting";
import {SettingFunc} from "../types";
import {INameValue} from "../../interfaces";

export interface NameValueArraySetting extends BaseSetting<INameValue[]> {
}

export function makeNameValueArray(name: string, def: INameValue[]): SettingFunc {
    return (): NameValueArraySetting => ({
        name,
        type: 'nameValueArray',
        default: def
    });
}
