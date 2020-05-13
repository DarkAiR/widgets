import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import {makeArray, makeString} from "../../widgetSettings/controls";
import settingsPresets from "../../widgetSettings/settingsPresets";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        ...settingsPresets.common,
    ],
    dataSet: {
        initDataSets: [{viewType: 'TABLE'}],
        canAdd: true,
        settings: [
            makeArray('columnNames', 'Названия колонок', [
                [
                    makeString('name', ''),
                    makeString('value', '')
                ]
            ])
        ]
    }
});
