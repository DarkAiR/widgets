/**
 * Настройки для подписи значений на графике
 */

import {
    makeBoolean,
    makeColor,
    makeNumber,
    makeSettingsGroup,
    makeString
} from "../controls";
import {SettingFunc} from "../types";

export const labelFields: Array<SettingFunc[]> = [
    [
        makeBoolean('show', 'Показывать значение', false)
    ], [
        makeColor('color', 'Цвет'),
        makeNumber('fontSize', 'Размер шрифта, px', 12)
    ], [
        makeString('delimiter', 'Разделитель', '.'),
        makeNumber('precision', 'Точность в знаках', 2)
    ], [
        makeString('measure', 'Единица измерения значения'),
        makeBoolean('showMeasure', 'Показывать единицу изменения', false)
    ]
];

export const label: SettingFunc[] = [
    makeSettingsGroup('label', 'Формат вывода значений', labelFields)
];
