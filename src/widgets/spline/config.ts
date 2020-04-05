import {INameValue, IWidgetInfo} from "../../interfaces";
import {YAxisTypes, YAxisTypesValues} from "../../models/types";
import {makeConfig} from "../../widgetInfo/WidgetInfoSetting";
import {makeString} from "../../widgetInfo/settings/StringSetting";
import {makeList} from "../../widgetInfo/settings/ListSetting";
import {makeColor} from "../../widgetInfo/settings/ColorSetting";
import {makeSettingsArray} from "../../widgetInfo/settings/SettingsArraySetting";
import {makeNumber} from "../../widgetInfo/settings/NumberSetting";
import {makeBoolean} from "../../widgetInfo/settings/BooleanSetting";

export const config: IWidgetInfo = makeConfig({
    settings: [
        makeString('title', 'Заголовок', '')
    ],
    dataSet: {
        initAmount: 1,
        canAdd: true,
        settings: [
            makeColor('color', ' Цвет', null),
            makeList<YAxisTypes>('yAxis', 'Положение оси', 'left', YAxisTypesValues.map(
                (v: YAxisTypes): INameValue<typeof v> => ({name: v, value: v})
            )),
            makeSettingsArray('labelFormat', 'Формат вывода значений', [
                makeString('delimiter', 'Разделитель', '.'),
                makeNumber('precision', 'Точность в знаках', 2),
                makeString('measure', 'Единица измерения', ''),
                makeBoolean('showMeasure', 'Показывать единицу изменения', false)
            ])
        ]
    }
});
