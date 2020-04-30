/**
 * Настройки для заливки
 */

import {makeBoolean, makeGradient, makeSettingsGroup} from "../widgetSettings/settings";
import {SettingFunc} from "../widgetSettings/types";

export const fillSettings: SettingFunc[] = [
    makeSettingsGroup('fill', 'Стиль заливки', [
        [
            makeGradient('color', 'Цвет заливки'),
            makeBoolean('show', 'Показывать', false)
        ]
    ])
];
