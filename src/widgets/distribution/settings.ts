import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import {
    makeColor,
    makeList,
    makeSettingsGroup,
} from "../../widgetSettings/controls";
import {ChartType, ChartTypeValues, LineType, LineTypeValues} from "../../models/types";
import settingsPresets from "../../widgetSettings/settingsPresets";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        ...settingsPresets.title,
        ...settingsPresets.paddings,
        ...settingsPresets.background,
    ],
    dataSet: {
        initDataSets: [{viewType: 'DISTRIBUTION'}],
        canAdd: false,
        settings: [
            makeColor('color', ' Цвет'),
            makeList<ChartType>('chartType', 'Вид', 'LINE', ChartTypeValues),
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
