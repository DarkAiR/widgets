import {IWidgetSettings, makeSettings, makeArray, makeString} from "../../widgetSettings";

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
