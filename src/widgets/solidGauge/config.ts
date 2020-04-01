import {IWidgetInfo} from "../../interfaces";
import {makeString} from "../../widgetInfo/settings/StringSetting";
import {makeColor} from "../../widgetInfo/settings/ColorSetting";
import {makeConfig} from "../../widgetInfo/WidgetInfoSetting";
import {makeIcon} from "../../widgetInfo/settings/IconSetting";

export const config: IWidgetInfo = makeConfig({
    settings: [
        makeString('title', ''),
        makeIcon('icon', '')
    ],
    dataSet: {
        initAmount: 2,
        canAdd: false,
        settings: [
            makeColor('color', null)
        ]
    }
});
