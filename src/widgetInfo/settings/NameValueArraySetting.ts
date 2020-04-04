/**
 * Значение = массив INameValue[]
 */

import {BaseSetting} from "./BaseSetting";
import {SettingFunc} from "../types";
import {INameValue} from "../../interfaces";

type DefaultType = INameValue[];

export interface NameValueArraySetting extends BaseSetting<DefaultType> {
}

export function makeNameValueArray(name: string, def: DefaultType): SettingFunc {
    return (): NameValueArraySetting => ({
        name,
        type: 'nameValueArray',
        default: def
    });
}
