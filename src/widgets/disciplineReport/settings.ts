import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import {makeColor} from "../../widgetSettings/controls";
import settingsPresets from "../../widgetSettings/settingsPresets";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        ...settingsPresets.title,
        ...settingsPresets.paddings,
        ...settingsPresets.background,
    ],
    dataSet: {
        initDataSets: [{viewType: 'DYNAMIC'}],      // FIXME: Set right view type
        canAdd: false,
        settings: [
            makeColor('color', ' Цвет')
        ]
    }
});
