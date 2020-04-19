/**
 * Значение = массив INameValue[]
 */

import {BaseSetting} from "./BaseSetting";
import {SettingFunc} from "../types";
import {INameValue} from "../../interfaces";

type DefaultType = INameValue[];

export interface NameValueArraySetting extends BaseSetting<DefaultType> {
}

export function makeNameValueArray(name: string, label: string): SettingFunc {
    return (): NameValueArraySetting => ({
        name,
        label,
        type: 'nameValueArray',
        default: []
    });
}
