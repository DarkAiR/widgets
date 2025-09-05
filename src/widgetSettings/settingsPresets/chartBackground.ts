/**
 * Настройки для заливки
 */

import {makeGradient, makeSettingsGroup} from "../controls";
import {SettingFunc} from "../types";

export const chartBackground: SettingFunc[] = [
    makeSettingsGroup('chartBackground', 'Заливка графика', [
        [makeGradient('color', 'Цвет')]
    ], {
        collapse: true
    })
];
