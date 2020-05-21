/**
 * Настройки для нескольких осей X
 */

import {
    makeArray,
    makeBoolean,
    makeColor, makeList,
    makeNumber,
    makeString
} from "../controls";
import {SettingFunc} from "../types";
import {XAxisPos, XAxisPosValues} from "../../models/types";

export const multiAxesX: SettingFunc[] = [
    makeNumber('axisXDistance', 'Расстояние между осями X', 20),
    makeArray('axesX', 'Оси X', [
        [
            makeBoolean('show', 'Отображать', true),
            makeColor('color', 'Цвет'),
        ], [
            makeNumber('index', 'Номер оси', 1),        // Используется в getAxisSetting
            makeList<XAxisPos>('position', 'Положение оси', 'bottom', XAxisPosValues),
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

