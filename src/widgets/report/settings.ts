import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import {makeColor} from "../../widgetSettings/controls";
import settingsPresets from "../../widgetSettings/settingsPresets";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        ...settingsPresets.common,
    ],
    dataSet: {
        initDataSets: [{viewType: 'REPORT'}],
        canAdd: false,
        settings: [
            makeColor('color', ' Цвет')
        ]
    }
});
