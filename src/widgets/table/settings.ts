import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import {makeArray, makeString} from "../../widgetSettings/settings";
import {commonSettings} from "../commonSettings";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        ...commonSettings
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
