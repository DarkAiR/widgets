/**
 * Значение = значение из фиксированного массива
 */

import {BaseSetting} from "./BaseSetting";
import {SettingFunc} from "../types";
import {INameValue} from "../../interfaces";

export interface ListSetting<T> extends BaseSetting<T> {
    list: INameValue<T>[];
}

// NOTE: Condition type нужен для обязательного вызова через указание типа,
//       чтобы в качестве значения def указывать только допустимые, а не просто строку
export function makeList<T = void, U extends T = T>(name: string, def: U, list: INameValue<U>[]): SettingFunc {
    return (): ListSetting<U> => ({
        name,
        type: 'list',
        default: def,
        list
    });
}
