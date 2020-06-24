import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import {
    HistogramType, HistogramTypeValues
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
        ...settingsPresets.paddings,
        ...settingsPresets.background,
        ...settingsPresets.chartPaddings,
        ...settingsPresets.chartBackground,
        ...settingsPresets.axisY,
        ...settingsPresets.axisX,
        ...settingsPresets.legend,
        makeSettingsGroup('histogram', 'Гистограмма', [
            [
                makeNumber('barCategoryGap', 'Расст. между категориями, в %', 20),
                makeNumber('barGap', 'Расст. между источниками, в %', 30, {condition: '${type} === "normal"'}),
            ]
        ])
    ],
    dataSet: {
        initDataSets: [{viewType: 'DYNAMIC'}],
        canAdd: true,
        settings: [
            makeString('name', 'Название'),
            makeColor('color', ' Цвет'),
            ...settingsPresets.fill,
            ...settingsPresets.label,
            makeNumber('axisY', 'Номер оси Y', 1),
        ]
    }
});
