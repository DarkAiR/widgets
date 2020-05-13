/**
 * Настройки для заливки
 */

import {makeBoolean, makeGradient, makeSettingsGroup} from "../controls";
import {SettingFunc} from "../types";

export const fillSettings: SettingFunc[] = [
    makeSettingsGroup('fill', 'Стиль заливки', [
        [
            makeGradient('color', 'Цвет заливки'),
            makeBoolean('show', 'Показывать', false)
        ]
    ])
];
