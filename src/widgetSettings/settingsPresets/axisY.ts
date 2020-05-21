/**
 * Настройки для одной оси Y
 */

import {
    makeBoolean,
    makeColor, makeList,
    makeNumber, makeSettingsGroup,
    makeString
} from "../controls";
import {SettingFunc} from "../types";
import {YAxisPos, YAxisPosValues} from "../../models/types";

export const axisY: SettingFunc[] = [
    makeSettingsGroup('axisY', 'Ось Y', [
        [
            makeBoolean('show', 'Отображать', true),
            makeColor('color', 'Цвет'),
        ], [
            makeList<YAxisPos>('position', 'Положение оси', 'left', YAxisPosValues),
        ], [
            makeString('name', 'Подпись'),
        ], [
            makeColor('nameColor', 'Цвет подписи'),
            makeNumber('nameGap', 'Отступ подписи', '')
        ], [
            makeBoolean('showTick', 'Отображать насечки', true)
        ]
    ], {collapse: true}),
];

