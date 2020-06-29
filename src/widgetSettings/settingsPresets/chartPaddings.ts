/**
 * Настройки для внутренних отступов графика echarts
 */

import {
    makeNumber,
    makeSettingsGroup,
} from "../controls";
import {SettingFunc} from "../types";

export const chartPaddings: SettingFunc[] = [
    makeSettingsGroup('chartPaddings', 'Отступы графика', [
        [
            makeNumber('top', 'Сверху', 20),
            makeNumber('bottom', 'Снизу', 0)
        ], [
            makeNumber('left', 'Слева', 0),
            makeNumber('right', 'Справа', 0)
        ]
    ], {collapse: true, hint: {type: 'chartPaddings'}}),
];
