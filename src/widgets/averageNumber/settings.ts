import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import {makeColor} from "../../widgetSettings/controls";
import settingsPresets from "../../widgetSettings/settingsPresets";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        ...settingsPresets.title,
        ...settingsPresets.background,
    ],
    dataSet: {
        initDataSets: [{viewType: 'STATIC'}, {viewType: 'STATIC'}],
        canAdd: false,
        settings: [
            makeColor('color', ' Цвет')
        ]
    }
});
