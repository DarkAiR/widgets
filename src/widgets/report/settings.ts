import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import {makeColor, makeString} from "../../widgetSettings/settings";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        makeString('title', 'Заголовок')
    ],
    dataSet: {
        initAmount: 1,
        canAdd: false,
        settings: [
            makeColor('color', ' Цвет')
        ]
    }
});
