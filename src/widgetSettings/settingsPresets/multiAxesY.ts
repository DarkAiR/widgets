/**
 * Настройки для нескольких осей Y
 */

import {
    makeArray,
    makeBoolean,
    makeColor, makeList,
    makeNumber,
    makeString
} from "../controls";
import {SettingFunc} from "../types";
import {YAxisPos, YAxisPosValues} from "../../types";

export const multiAxesY: SettingFunc[] = [
    makeNumber('axisYDistance', 'Расстояние между осями Y', 50),
    makeArray('axesY', 'Оси Y', [
        [
            makeBoolean('show', 'Отображать', true),
            makeColor('color', 'Цвет'),
        ], [
            makeNumber('index', 'Номер оси', 1),            // Используется в getAxisSetting
            makeList<YAxisPos>('position', 'Положение оси', 'left', YAxisPosValues),
        ], [
            makeString('name', 'Подпись'),
        ], [
            makeColor('nameColor', 'Цвет подписи'),
            makeNumber('nameGap', 'Отступ подписи', '')
        ], [
            makeBoolean('showLine', 'Линия оси', true),
            makeBoolean('showTick', 'Насечки', true)
        ]
    ], {collapse: true}),
];

