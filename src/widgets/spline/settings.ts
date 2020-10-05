import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import {
    ChartType,
    ChartTypeValues, HistogramType, HistogramTypeValues,
    LineType,
    LineTypeValues,
} from "../../models/types";
import {
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
        ...settingsPresets.chartBorder,
        ...settingsPresets.paddings,
        ...settingsPresets.background,
        ...settingsPresets.chartPaddings,
        ...settingsPresets.chartBackground,
        ...settingsPresets.multiAxesY,
        ...settingsPresets.multiAxesX,
        ...settingsPresets.legend,
        makeSettingsGroup('histogram', 'Гистограмма', [
            [
                makeList<HistogramType>('type', 'Вид гистограммы', 'normal', HistogramTypeValues),
            ], [
                makeNumber('barCategoryGap', 'Расст. между категориями, в %', 20),
                makeNumber('barGap', 'Расст. между источниками, в %', 30, {condition: '${type} === "normal"'}),
            ]
        ]),
        makeBoolean('enableZoom', 'Включить zoom', false)
    ],
    dataSet: {
        initDataSets: [{viewType: 'DYNAMIC'}],
        canAdd: true,
        settings: [
            ...settingsPresets.dataSourceName,
            makeColor('color', ' Цвет'),
            makeList<ChartType>('chartType', 'Вид', 'LINE', ChartTypeValues),
            makeSettingsGroup('lineStyle', 'Стиль линии', [
                [
                    makeList<LineType>('type', 'Тип', 'solid', LineTypeValues),
                    makeNumber('width', 'Ширина', 2)
                ],
            ], {
                condition: '${chartType} === "LINE"'
            }),
            ...settingsPresets.fill,
            ...settingsPresets.label,
            makeNumber('axisX', 'Номер оси X', 1),
            makeNumber('axisY', 'Номер оси Y', 1),
        ]
    }
});
