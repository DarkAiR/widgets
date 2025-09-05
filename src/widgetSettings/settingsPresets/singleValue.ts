/**
 * Настройки для одиночного значения типа KPI или REPORT
 */

import {
    makeBoolean,
    makeColor,
    makeNumber,
    makeSettingsGroup,
    makeString,
    makeList
} from "../controls";
import {SettingFunc} from "../types";

export const singleValue: SettingFunc[] = [
    makeSettingsGroup('value', 'Значение', [
        [
            makeColor('color', 'Цвет', '#2c2c2c'),
        ], [
            makeNumber('size', 'Размер шрифта, px', 14),
            makeList<string>('align', 'Выравнивание', 'left', ['left', 'center', 'right'])
        ], [
            makeString('delimiter', 'Разделитель', '.'),
            makeNumber('precision', 'Точность в знаках', 2)
        ], [
            makeString('measure', 'Единица измерения значения'),
            makeBoolean('showMeasure', 'Показывать единицу изменения', false)
        ]
    ])
];
