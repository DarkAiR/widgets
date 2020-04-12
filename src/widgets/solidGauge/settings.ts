import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import {makeColor, makeIcon} from "../../widgetSettings/settings";
import {commonSettings} from "../commonSettings";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        ...commonSettings,
        makeIcon('icon', 'Иконка', '')
    ],
    dataSet: {
        initDataSets: [{viewType: 'STATIC'}, {viewType: 'STATIC'}],
        canAdd: false,
        settings: [
            makeColor('color', ' Цвет')
        ]
    }
});
