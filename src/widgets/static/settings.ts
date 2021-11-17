import {IWidgetSettings, makeSettings, makeColor, makeNumber} from "../../widgetSettings";
import settingsPresets from "../../widgetSettings/settingsPresets";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        ...settingsPresets.title,
        ...settingsPresets.paddings,
        ...settingsPresets.background,
        ...settingsPresets.chartPaddings,
        ...settingsPresets.chartBackground,
        ...settingsPresets.func.axisY(false),
        ...settingsPresets.axisX,
        ...settingsPresets.legend,
    ],
    dataSet: {
        initDataSets: [{viewType: 'STATIC'}],
        canAdd: true,
        settings: [
            ...settingsPresets.dataSourceName,
            makeColor('color', ' Цвет'),
            ...settingsPresets.label,
            makeNumber('symbolSize', 'Размер символа', 20)
        ]
    }
});
