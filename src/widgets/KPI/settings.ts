import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import settingsPresets from "../../widgetSettings/settingsPresets";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        ...settingsPresets.title,
        ...settingsPresets.background,
    ],
    dataSet: {
        initDataSets: [{viewType: 'DYNAMIC'}],
        canAdd: false,
        settings: [
            ...settingsPresets.singleValue,
        ]
    }
});
