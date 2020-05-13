/**
 * Настройки для отступов виджета
 */

import {
    makeNumber,
    makeSettingsGroup,
} from "../controls";
import {SettingFunc} from "../types";

export const paddings: SettingFunc[] = [
    makeSettingsGroup('paddings', 'Отступы графика', [
        [
            makeNumber('top', 'Сверху', 20),
            makeNumber('bottom', 'Снизу', 0)
        ], [
            makeNumber('left', 'Слева', 0),
            makeNumber('right', 'Справа', 0)
        ]
    ], {collapse: true}),
];
