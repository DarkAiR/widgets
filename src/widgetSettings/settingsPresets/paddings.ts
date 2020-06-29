/**
 * Настройки для отступов виджета
 */

import {
    makeNumber,
    makeSettingsGroup,
} from "../controls";
import {SettingFunc} from "../types";

export const paddings: SettingFunc[] = [
    makeSettingsGroup('paddings', 'Отступы виджета', [
        [
            makeNumber('top', 'Сверху', 10),
            makeNumber('bottom', 'Снизу', 10)
        ], [
            makeNumber('left', 'Слева', 10),
            makeNumber('right', 'Справа', 10)
        ]
    ], {collapse: true, hint: {type: 'widgetPaddings'}}),
];
