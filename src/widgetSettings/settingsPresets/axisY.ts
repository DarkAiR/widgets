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

function axisYFunc(enablePosition: boolean = true): SettingFunc[] {
    return [
        makeSettingsGroup('axisY', 'Ось Y', [
            [
                makeBoolean('show', 'Отображать', true),
                makeColor('color', 'Цвет'),
            ],
            !enablePosition ? [] : [
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
}

const axisY: SettingFunc[] = axisYFunc();

export {axisY, axisYFunc};

