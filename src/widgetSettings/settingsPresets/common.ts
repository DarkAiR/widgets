/**
 * Базовые настройки, одинаковые для всех виджетов
 */

import {makeString} from "../controls";
import {SettingFunc} from "../types";

export const commonSettings: SettingFunc[] = [
    makeString('title', 'Заголовок')
];
