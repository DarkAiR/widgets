import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import settingsPresets from "../../widgetSettings/settingsPresets";
import {makeColor, makeNumber, makeString} from "../../widgetSettings/controls";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        ...settingsPresets.title,
        ...settingsPresets.background,
        ...settingsPresets.paddings,
        ...settingsPresets.chartPaddings,
        ...settingsPresets.axisY,
        ...settingsPresets.axisX,
        ...settingsPresets.legend,
    ],
    dataSet: {
        initDataSets: [{viewType: 'STATIC'}],
        canAdd: false,
        settings: [
            makeString('name', 'Название'),
            makeColor('color', ' Цвет'),
            ...settingsPresets.label,
            makeNumber('symbolSize', 'Размер символа', 20)
        ]
    }
});
