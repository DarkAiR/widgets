import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import {commonSettings} from "../commonSettings";
import {
    makeBoolean,
    makeColor,
    makeList,
    makeNumber,
    makeSettingsGroup,
    makeString
} from "../../widgetSettings/settings";
import {ChartType, ChartTypeValues, LineType, LineTypeValues} from "../../models/types";
import {fillSettings} from "../fillSettings";
import {labelSettings} from "../labelSettings";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        // ...commonSettings
        makeSettingsGroup('title', 'Заголовок', [
            [
                makeBoolean('show', 'Отображать', true),
                makeColor('color', 'Цвет', '#2c2c2c')
            ], [
                makeString('name', 'Заголовок')
            ], [
                makeNumber('size', 'Размер шрифта', 14),
                makeList<string>('align', 'Выравнивание', 'left', ['left', 'center', 'right'])
            ]
        ]),
        makeSettingsGroup('paddings', 'Отступы графика', [
            [
                makeNumber('top', 'Сверху', 20),
                makeNumber('bottom', 'Снизу', 0)
            ], [
                makeNumber('left', 'Слева', 0),
                makeNumber('right', 'Справа', 0)
            ]
        ], {collapse: true}),
    ],
    dataSet: {
        initDataSets: [{viewType: 'DISTRIBUTION'}],
        canAdd: false,
        settings: [
            makeColor('color', ' Цвет'),
            makeList<ChartType>('chartType', 'Вид', 'LINE', ChartTypeValues),
            makeSettingsGroup('lineStyle', 'Стиль линии', [
                [
                    makeList<LineType>('type', 'Тип', 'solid', LineTypeValues)
                ],
            ]),
            ...fillSettings,
            ...labelSettings,
        ]
    }
});
