import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import {makeColor, makeIcon, makeString} from "../../widgetSettings/settings";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        makeString('title', 'Заголовок', ''),
        makeIcon('icon', 'Иконка', '')
    ],
    dataSet: {
        initAmount: 2,
        canAdd: false,
        settings: [
            makeColor('color', ' Цвет', null)
        ]
    }
});
