/**
 * Настройки для заголовка виджета
 */

import {
    makeBoolean,
    makeColor, makeList,
    makeNumber,
    makeSettingsGroup,
    makeString
} from "../controls";
import {SettingFunc} from "../types";

export const titleSettings: SettingFunc[] = [
    makeSettingsGroup('title', 'Заголовок', [
        [
            makeBoolean('show', 'Отображать', true),
            makeColor('color', 'Цвет', '#2c2c2c')
        ], [
            makeString('name', 'Заголовок')
        ], [
            makeNumber('size', 'Размер шрифта', 14),
            makeList<string>('align', 'Выравнивание', 'left', ['left', 'center', 'right'])
        ]
    ]),
];
