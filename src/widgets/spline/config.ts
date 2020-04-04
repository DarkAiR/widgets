import {INameValue, IWidgetInfo} from "../../interfaces";
import {YAxisTypes, YAxisTypesValues} from "../../models/types";
import {makeConfig} from "../../widgetInfo/WidgetInfoSetting";
import {makeString} from "../../widgetInfo/settings/StringSetting";
import {makeList} from "../../widgetInfo/settings/ListSetting";
import {makeColor} from "../../widgetInfo/settings/ColorSetting";
import {makeSettingsArray} from "../../widgetInfo/settings/SettingsArraySetting";

export const config: IWidgetInfo = makeConfig({
    settings: [
        makeString('title', '')
    ],
    dataSet: {
        initAmount: 1,
        canAdd: true,
        settings: [
            makeColor('color', null),
            makeList<YAxisTypes>('yAxis', 'left', YAxisTypesValues.map(
                (v: YAxisTypes): INameValue<typeof v> => ({name: v, value: v})
            )),
            makeSettingsArray('array1', [
                makeString('str1', 'string1'),
                makeString('str2', 'string2'),
            ])
        ]
    }
});
