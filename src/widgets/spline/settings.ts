import {
    ChartType,
    ChartTypeValues, HistogramType, HistogramTypeValues
} from "../../types";
import {
    IWidgetSettings,
    makeSettings,
    makeBoolean,
    makeColor,
    makeList,
    makeNumber,
    makeSettingsGroup
} from "../../widgetSettings";
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
        ], {collapse: true}),
        makeBoolean('enableZoom', 'Включить zoom', false)
    ],
    dataSet: {
        initDataSets: [{viewType: 'DYNAMIC'}],
        canAdd: true,
        settings: [
            ...settingsPresets.dataSourceName,
            makeColor('color', ' Цвет'),
            makeList<ChartType>('chartType', 'Вид', 'LINE', ChartTypeValues),
            ...settingsPresets.lineStyle,
            ...settingsPresets.fill,
            ...settingsPresets.label,
            makeNumber('axisX', 'Номер оси X', 1),
            makeNumber('axisY', 'Номер оси Y', 1),
        ]
    }
});
