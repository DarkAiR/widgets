import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import {
    makeColor,
    makeList, makeNumber,
    makeSettingsGroup, makeString,
} from "../../widgetSettings/controls";
import {
    ChartType,
    ChartTypeValues,
    LineType,
    LineTypeValues
} from "../../models/types";
import settingsPresets from "../../widgetSettings/settingsPresets";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        ...settingsPresets.title,
        ...settingsPresets.background,
        ...settingsPresets.paddings,
        ...settingsPresets.chartPaddings,
        ...settingsPresets.axisY,
        ...settingsPresets.axisX,
        ...settingsPresets.legend
    ],
    dataSet: {
        initDataSets: [{viewType: 'PROFILE'}],
        canAdd: false,
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
            makeSettingsGroup('histogram', 'Гистограмма', [
                [
                    makeNumber('barCategoryGap', 'Расст. между категориями, в %', 20),
                ]
            ], {
                condition: '${chartType} === "HISTOGRAM"'
            }),
            ...settingsPresets.fill,
            ...settingsPresets.label,
        ]
    }
});
