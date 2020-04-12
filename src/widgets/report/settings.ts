import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import {makeColor} from "../../widgetSettings/settings";
import {commonSettings} from "../commonSettings";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        ...commonSettings
    ],
    dataSet: {
        initDataSets: [{viewType: 'REPORT'}],
        canAdd: false,
        settings: [
            makeColor('color', ' Цвет')
        ]
    }
});
