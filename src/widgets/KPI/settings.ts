import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import settingsPresets from "../../widgetSettings/settingsPresets";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        ...settingsPresets.title,
        ...settingsPresets.background,
        ...settingsPresets.paddings,
    ],
    dataSet: {
        initDataSets: [{viewType: 'DYNAMIC'}],
        canAdd: false,
        settings: [
            ...settingsPresets.dataSourceName,
            ...settingsPresets.singleValue,
        ]
    }
});
