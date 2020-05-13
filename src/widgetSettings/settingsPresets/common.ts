/**
 * Базовые настройки, одинаковые для всех виджетов
 */

import {makeString} from "../controls";
import {SettingFunc} from "../types";

export const common: SettingFunc[] = [
    makeString('title', 'Заголовок')
];
