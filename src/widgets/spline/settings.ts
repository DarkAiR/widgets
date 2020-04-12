import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import {ChartType, ChartTypeValues, LineType, LineTypeValues, YAxisTypes, YAxisTypesValues} from "../../models/types";
import {
    makeBoolean,
    makeColor,
    makeGradient,
    makeList,
    makeNumber,
    makeSettingsArray,
    makeString
} from "../../widgetSettings/settings";
import {commonSettings} from "../commonSettings";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        ...commonSettings,
        makeSettingsArray('paddings', 'Отступы графика', [
            makeNumber('top', 'Сверху', 20),
            makeNumber('bottom', 'Снизу', 20),
            makeNumber('left', 'Слева', 0),
            makeNumber('right', 'Справа', 0)
        ]),
        makeNumber('axisGap', 'Расстояние между осями', 50),
    ],
    dataSet: {
        initDataSets: [{viewType: 'DYNAMIC'}],
        canAdd: true,
        settings: [
            makeColor('color', ' Цвет'),
            makeList<ChartType>('chartType', 'Вид', 'LINE', ChartTypeValues),
            makeList<YAxisTypes>('yAxis', 'Положение оси', 'left', YAxisTypesValues),
            makeSettingsArray('lineStyle', 'Стиль линии', [
                makeList<LineType>('type', 'Тип', 'solid', LineTypeValues),
            ]),
            makeSettingsArray('fill', 'Стиль заливки', [
                makeGradient('color', 'Цвет заливки'),
                makeBoolean('show', 'Показывать', false)
            ]),
            makeSettingsArray('label', 'Формат вывода значений', [
                makeColor('color', 'Цвет'),
                makeNumber('fontSize', 'Размер шрифта', 12),
                makeString('delimiter', 'Разделитель', '.'),
                makeNumber('precision', 'Точность в знаках', 2),
                makeString('measure', 'Единица измерения'),
                makeBoolean('showMeasure', 'Показывать единицу изменения', false),
                makeBoolean('show', 'Показывать значение', false)
            ])
        ]
    }
});
