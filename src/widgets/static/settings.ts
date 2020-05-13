import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import settingsPresets from "../../widgetSettings/settingsPresets";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        ...settingsPresets.common,
    ],
    dataSet: {
        initDataSets: [{viewType: 'STATIC'}],
        canAdd: true,
        settings: []
    }
});
