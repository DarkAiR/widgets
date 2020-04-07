import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import {INameValue} from "../../interfaces";
import {makeNameValueArray, makeString} from "../../widgetSettings/settings";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        makeString('title', 'Заголовок', '')
    ],
    dataSet: {
        initAmount: 1,
        canAdd: true,
        settings: [
            makeNameValueArray('columnNames', 'Названия колонок', <INameValue[]>[])
        ]
    }
});
