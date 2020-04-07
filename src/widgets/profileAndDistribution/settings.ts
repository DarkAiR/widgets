import {IWidgetSettings} from "../../interfaces";
import {makeSettings} from "../../widgetSettings";
import {makeString} from "../../widgetSettings/settings";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        makeString('title', 'Заголовок', '')
    ],
    dataSet: {
        initAmount: 1,
        canAdd: true,
        settings: []
    }
});
