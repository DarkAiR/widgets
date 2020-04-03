import {INameValue, IWidgetInfo} from "../../interfaces";
import {makeConfig} from "../../widgetInfo/WidgetInfoSetting";
import {makeString} from "../../widgetInfo/settings/StringSetting";
import {makeNameValueArray} from "../../widgetInfo/settings/NameValueArraySetting";

export const config: IWidgetInfo = makeConfig({
    settings: [
        makeString('title', '')
    ],
    dataSet: {
        initAmount: 1,
        canAdd: true,
        settings: [
            makeNameValueArray('columnNames', <INameValue[]>[])
        ]
    }
});
