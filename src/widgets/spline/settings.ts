import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import {
    ChartType,
    ChartTypeValues, HistogramType, HistogramTypeValues,
    LineType,
    LineTypeValues,
} from "../../models/types";
import {
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
        ...settingsPresets.background,
        ...settingsPresets.paddings,
        ...settingsPresets.chartPaddings,
        ...settingsPresets.multiAxesY,
        ...settingsPresets.multiAxesX,
        ...settingsPresets.legend,
        makeList<HistogramType>('histogramType', 'Вид гистограммы', 'normal', HistogramTypeValues),
    ],
    dataSet: {
        initDataSets: [{viewType: 'DYNAMIC'}],
        canAdd: true,
        settings: [
            makeString('name', 'Название'),
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
            makeNumber('axisY', 'Номер оси Y', 1),
        ]
    }
});
