import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import {makeColor, makeIcon} from "../../widgetSettings/controls";
import settingsPresets from "../../widgetSettings/settingsPresets";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        ...settingsPresets.common,
        ...settingsPresets.background,
        makeIcon('icon', 'Иконка', '')
    ],
    dataSet: {
        initDataSets: [{viewType: 'STATIC'}, {viewType: 'STATIC'}],
        canAdd: false,
        settings: [
            makeColor('color', ' Цвет')
        ]
    }
});
