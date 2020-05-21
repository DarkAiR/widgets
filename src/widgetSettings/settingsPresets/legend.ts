/**
 * Настройки для легенды
 */

import {
    makeBoolean, makeColor,
    makeList,
    makeNumber, makeSettingsGroup,
} from "../controls";
import {SettingFunc} from "../types";
import {LegendPos, LegendPosValues} from "../../models/types";

export const legend: SettingFunc[] = [
    makeSettingsGroup('legend', 'Легенда', [
        [
            makeBoolean('show', 'Отображать', false),
            makeColor('color', 'Цвет', '#2c2c2c')
        ], [
            makeList<LegendPos>('position', 'Расположение', 'bottom', LegendPosValues),
            makeNumber('gap', 'Отступ', 0)
        ]
    ], {collapse: true})
];

