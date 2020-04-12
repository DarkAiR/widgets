import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import {commonSettings} from "../commonSettings";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        ...commonSettings
    ],
    dataSet: {
        initDataSets: [{viewType: 'STATIC'}],
        canAdd: true,
        settings: []
    }
});
