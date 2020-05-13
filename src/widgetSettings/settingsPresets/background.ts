/**
 * Настройки для заливки
 */

import {makeBoolean, makeGradient, makeSettingsGroup} from "../controls";
import {SettingFunc} from "../types";

export const background: SettingFunc[] = [
    makeGradient('backgroundColor', 'Цвет заливки background'),
];
