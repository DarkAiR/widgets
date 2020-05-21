import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import {
    makeArray, makeBoolean,
    makeColor,
    makeList, makeNumber,
    makeSettingsGroup, makeString,
} from "../../widgetSettings/controls";
import {
    ChartType,
    ChartTypeValues, LegendPos, LegendPosValues,
    LineType,
    LineTypeValues,
    XAxisPos, XAxisPosValues,
    YAxisPos,
    YAxisPosValues
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
            ]),
            ...settingsPresets.fill,
            ...settingsPresets.label,
        ]
    }
});
