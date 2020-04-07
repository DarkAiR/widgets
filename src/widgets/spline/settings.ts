import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import {LineType, LineTypeValues, YAxisTypes, YAxisTypesValues} from "../../models/types";
import {makeBoolean, makeColor, makeList, makeNumber, makeSettingsArray, makeString} from "../../widgetSettings/settings";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        makeString('title', 'Заголовок', '')
    ],
    dataSet: {
        initAmount: 1,
        canAdd: true,
        settings: [
            makeColor('color', ' Цвет', null),
            makeList<YAxisTypes>('yAxis', 'Положение оси', 'left', YAxisTypesValues),
            makeSettingsArray('lineStyle', 'Стиль линии', [
                makeList<LineType>('type', 'Тип', 'solid', LineTypeValues),
            ]),
            makeSettingsArray('labelFormat', 'Формат вывода значений', [
                makeString('delimiter', 'Разделитель', '.'),
                makeNumber('precision', 'Точность в знаках', 2),
                makeString('measure', 'Единица измерения', ''),
                makeBoolean('showMeasure', 'Показывать единицу изменения', false),
                makeBoolean('show', 'Показывать значение', false)
            ])
        ]
    }
});
