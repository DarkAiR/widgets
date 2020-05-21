/**
 * Настройки для одной оси X
 */

import {
    makeBoolean,
    makeColor, makeList,
    makeNumber, makeSettingsGroup,
    makeString
} from "../controls";
import {SettingFunc} from "../types";
import {XAxisPos, XAxisPosValues} from "../../models/types";

export const axisX: SettingFunc[] = [
    makeSettingsGroup('axisX', 'Ось X', [
        [
            makeBoolean('show', 'Отображать', true),
            makeColor('color', 'Цвет')
        ], [
            makeList<XAxisPos>('position', 'Положение оси', 'bottom', XAxisPosValues),
        ], [
            makeString('name', 'Подпись'),
        ], [
            makeColor('nameColor', 'Цвет подписи'),
            makeNumber('nameGap', 'Отступ подписи', '')
        ], [
            makeBoolean('showTick', 'Отображать насечки', true)
        ]
    ], {collapse: true})
];

