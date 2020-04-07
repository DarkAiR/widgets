/**
 * Значение = значение из фиксированного массива
 */

import {BaseSetting} from "./BaseSetting";
import {SettingFunc} from "../types";
import {INameValue} from "../../interfaces";
import {YAxisTypes, YAxisTypesValues} from "../../models/types";

export interface ListSetting<T> extends BaseSetting<T> {
    list: INameValue<T>[];
}

// NOTE: Condition type нужен для обязательного вызова через указание типа,
//       чтобы в качестве значения def указывать только допустимые, а не просто строку
export function makeList<T = void, U extends T = T>(
    name: string,
    label: string,
    def: U,
    listValuesArray: ArrayLike<U>  // Константный массив, использованный для создания типа <U>
): SettingFunc {
    // Делаем из константного массива обычный
    const listValues: U[] = Object.values(listValuesArray);
    // Конвертим обычный массив в данные для списка
    const list: INameValue<U>[] = listValues.map(
        (v: U): INameValue<typeof v> => ({name: v + '', value: v})
    );
    return (): ListSetting<U> => ({
        name,
        label,
        type: 'list',
        default: def,
        list
    });
}
