import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import {makeArray, makeString} from "../../widgetSettings/controls";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        makeString('title', 'Заголовок')
    ],
    dataSet: {
        initDataSets: [{viewType: 'TABLE'}],
        canAdd: false,
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
