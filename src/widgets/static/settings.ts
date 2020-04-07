import {IWidgetSettings} from "../../interfaces";
import {makeString} from "../../widgetSettings/settings";
import {makeSettings} from "../../widgetSettings";

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
