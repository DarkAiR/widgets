/**
 * Стиль линии
 */

import {
    makeList,
    makeNumber, makeSettingsGroup,
} from "../controls";
import {SettingFunc} from "../types";
import {LineType, LineTypeValues} from "../../types/types";

export const lineStyle: SettingFunc[] = [
    makeSettingsGroup('lineStyle', 'Стиль линии', [
        [
            makeList<LineType>('type', 'Тип', 'solid', LineTypeValues),
            makeNumber('width', 'Ширина, px', 2)
        ],
    ], {
        condition: '${chartType} === "LINE"'
    }),
];

