import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import settingsPresets from "../../widgetSettings/settingsPresets";
import {makeColor, makeNumber, makeString} from "../../widgetSettings/controls";

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
