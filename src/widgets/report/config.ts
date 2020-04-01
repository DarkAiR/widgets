import {IWidgetInfo} from "../../interfaces";
import {makeString} from "../../widgetInfo/settings/StringSetting";
import {makeColor} from "../../widgetInfo/settings/ColorSetting";
import {makeConfig} from "../../widgetInfo/WidgetInfoSetting";

export const config: IWidgetInfo = makeConfig({
    settings: [
        makeString('title', '')
    ],
    dataSet: {
        initAmount: 1,
        canAdd: false,
        settings: [
            makeColor('color', null)
        ]
    }
});
