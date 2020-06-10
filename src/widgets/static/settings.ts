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
        ...settingsPresets.multiAxesY,
        ...settingsPresets.multiAxesX,
        ...settingsPresets.legend,
    ],
    dataSet: {
        initDataSets: [{viewType: 'STATIC'}],
        canAdd: true,
        settings: [
            makeString('name', 'Название'),
            makeColor('color', ' Цвет'),
            ...settingsPresets.label,
            makeNumber('symbolSize', 'Размер символа', 20),
            makeNumber('axisY', 'Номер оси Y', 1),
            makeNumber('axisX', 'Номер оси X', 1),
        ]
    }
});
