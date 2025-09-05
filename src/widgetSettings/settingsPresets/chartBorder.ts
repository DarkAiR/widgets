/**
 * Настройки для заголовка виджета
 */

import {
    makeBoolean,
    makeColor,
    makeSettingsGroup
} from "../controls";
import {SettingFunc} from "../types";

export const chartBorder: SettingFunc[] = [
    makeSettingsGroup('chartBorder', 'Рамка', [
        [
            makeBoolean('show', 'Отображать', true),
            makeColor('color', 'Цвет', '#ccc')
        ]
    ], {collapse: true}),
];

