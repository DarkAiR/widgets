import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import {
    ChartType,
    ChartTypeValues,
    LineType,
    LineTypeValues,
    XAxisPosValues,
    XAxisPos,
    YAxisPos,
    YAxisPosValues
} from "../../models/types";
import {
    makeArray,
    makeBoolean,
    makeColor,
    makeGradient,
    makeList,
    makeNumber,
    makeSettingsGroup,
    makeString
} from "../../widgetSettings/settings";
import {commonSettings} from "../commonSettings";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        // ...commonSettings,
        makeSettingsGroup('title', 'Заголовок', [
            [
                makeBoolean('show', 'Отображать', true),
                makeColor('color', 'Цвет', '#2c2c2c')
            ], [
                makeString('name', 'Заголовок')
            ], [
                makeNumber('size', 'Размер шрифта', 14),
                makeList<string>('align', 'Выравнивание', 'left', ['left', 'center', 'right'])
            ]
        ]),
        makeSettingsGroup('paddings', 'Отступы графика', [
            [
                makeNumber('top', 'Сверху', 20),
                makeNumber('bottom', 'Снизу', 20)
            ], [
                makeNumber('left', 'Слева', 0),
                makeNumber('right', 'Справа', 0)
            ]
        ], {collapse: true}),
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
        ], {collapse: true})
    ],
    dataSet: {
        initDataSets: [{viewType: 'DYNAMIC'}],
        canAdd: true,
        settings: [
            makeColor('color', ' Цвет'),
            makeList<ChartType>('chartType', 'Вид', 'LINE', ChartTypeValues),
            makeNumber('axisY', 'Номер оси Y', 1),
            makeSettingsGroup('lineStyle', 'Стиль линии', [
                [
                    makeList<LineType>('type', 'Тип', 'solid', LineTypeValues)
                ],
            ]),
            makeSettingsGroup('fill', 'Стиль заливки', [
                [
                    makeGradient('color', 'Цвет заливки'),
                    makeBoolean('show', 'Показывать', false)
                ]
            ]),
            makeSettingsGroup('label', 'Формат вывода значений', [
                [
                    makeBoolean('show', 'Показывать значение', false)
                ], [
                    makeColor('color', 'Цвет'),
                    makeNumber('fontSize', 'Размер шрифта', 12)
                ], [
                    makeString('delimiter', 'Разделитель', '.'),
                    makeNumber('precision', 'Точность в знаках', 2)
                ], [
                    makeString('measure', 'Единица измерения'),
                    makeBoolean('showMeasure', 'Показывать единицу изменения', false)
                ]
            ])
        ]
    }
});
