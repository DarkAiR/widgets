/**
 * Базовые настройки, одинаковые для всех виджетов
 */

import {makeString} from "../widgetSettings/settings";
import {SettingFunc} from "../widgetSettings/types";

export const commonSettings: SettingFunc[] = [
    makeString('title', 'Заголовок')
];
