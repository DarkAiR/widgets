/**
 * Настройки для заливки
 */

import {makeGradient, makeSettingsGroup} from "../controls";
import {SettingFunc} from "../types";

export const background: SettingFunc[] = [
    makeSettingsGroup('background', 'Заливка виджета', [
        [makeGradient('color', 'Цвет')]
    ], {
        collapse: true
    })
];
