import {
    IWidgetSettings,
    makeSettings,
    makeColor,
    makeList, makeNumber,
    makeSettingsGroup
} from "../../widgetSettings";
import {ChartType, ChartTypeValues} from "../../types";
import settingsPresets from "../../widgetSettings/settingsPresets";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        ...settingsPresets.title,
        ...settingsPresets.paddings,
        ...settingsPresets.background,
        ...settingsPresets.chartPaddings,
        ...settingsPresets.chartBackground,
        ...settingsPresets.axisY,
        ...settingsPresets.axisX,
        ...settingsPresets.legend,
    ],
    dataSet: {
        initDataSets: [{viewType: 'DISTRIBUTION'}],
        canAdd: false,
        settings: [
            ...settingsPresets.dataSourceName,
            makeColor('color', ' Цвет'),
            makeList<ChartType>('chartType', 'Вид', 'LINE', ChartTypeValues),
            ...settingsPresets.lineStyle,
            makeSettingsGroup('histogram', 'Гистограмма', [
                [
                    makeNumber('barCategoryGap', 'Расст. между категориями, в %', 20),
                ]
            ], {
                condition: '${chartType} === "HISTOGRAM"',
                collapse: true
            }),
            ...settingsPresets.fill,
            ...settingsPresets.label,
        ]
    }
});
