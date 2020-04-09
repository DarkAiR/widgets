import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import {makeString} from "../../widgetSettings/settings";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        makeString('title', 'Заголовок')
    ],
    dataSet: {
        initAmount: 6,
        canAdd: false,
        settings: []
    }
});
