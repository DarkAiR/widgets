import {IWidgetInfo} from "../../interfaces";
import {makeString} from "../../widgetInfo/settings/StringSetting";
import {makeColor} from "../../widgetInfo/settings/ColorSetting";
import {makeConfig} from "../../widgetInfo/WidgetInfoSetting";

export const config: IWidgetInfo = makeConfig({
    settings: [
        makeString('title', 'Заголовок', '')
    ],
    dataSet: {
        initAmount: 2,
        canAdd: false,
        settings: [
            makeColor('color', ' Цвет', null)
        ]
    }
});
