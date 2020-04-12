import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import {commonSettings} from "../commonSettings";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        ...commonSettings
    ],
    dataSet: {
        initAmount: 1,
        canAdd: true,
        settings: []
    }
});
