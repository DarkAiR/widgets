import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import {
    ChartType,
    ChartTypeValues,
    LineType,
    LineTypeValues,
    XAxisPos,
    XAxisPosValues,
    YAxisPos,
    YAxisPosValues,
    LegendPos,
    LegendPosValues
} from "../../models/types";
import {
    makeArray,
    makeBoolean,
    makeColor,
    makeList,
    makeNumber,
    makeSettingsGroup,
    makeString
} from "../../widgetSettings/controls";
import settingsPresets from "../../widgetSettings/settingsPresets";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        ...settingsPresets.title,
        ...settingsPresets.paddings,
        ...settingsPresets.background,
        makeNumber('axisYDistance', 'Расстояние между осями Y', 50),
        makeArray('axesY', 'Оси Y', [
            [
                makeBoolean('show', 'Отображать', true),
                makeColor('color', 'Цвет'),
            ], [
                makeNumber('index', 'Номер оси', 1),
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
        makeNumber('axisXDistance', 'Расстояние между осями X', 20),
        makeArray('axesX', 'Оси X', [
            [
                makeBoolean('show', 'Отображать', true),
                makeColor('color', 'Цвет'),
            ], [
                makeNumber('index', 'Номер оси', 1),
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
        makeSettingsGroup('legend', 'Легенда', [
            [
                makeBoolean('show', 'Отображать', false)
            ], [
                makeList<LegendPos>('position', 'Расположение', 'bottom', LegendPosValues),
                makeNumber('gap', 'Отступ от края', 0)
            ]
        ], {collapse: true})
    ],
    dataSet: {
        initDataSets: [{viewType: 'DYNAMIC'}],
        canAdd: true,
        settings: [
            makeString('name', 'Название'),
            makeColor('color', ' Цвет'),
            makeList<ChartType>('chartType', 'Вид', 'LINE', ChartTypeValues),
            makeNumber('axisY', 'Номер оси Y', 1),
            makeSettingsGroup('lineStyle', 'Стиль линии', [
                [
                    makeList<LineType>('type', 'Тип', 'solid', LineTypeValues)
                ],
            ]),
            ...settingsPresets.fill,
            ...settingsPresets.label,
        ]
    }
});
