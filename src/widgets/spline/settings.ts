import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import {
    ChartType,
    ChartTypeValues,
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
        ...settingsPresets.legend
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
                    makeList<LineType>('type', 'Тип', 'solid', LineTypeValues),
                    makeNumber('width', 'Ширина', 2)
                ],
            ]),
            ...settingsPresets.fill,
            ...settingsPresets.label,
        ]
    }
});
