/**
 * Настройки для заливки
 */

import {makeGradient} from "../controls";
import {SettingFunc} from "../types";

export const background: SettingFunc[] = [
    makeGradient('backgroundColor', 'Цвет заливки background'),
];
