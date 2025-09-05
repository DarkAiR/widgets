import {
    IWidgetSettings,
    makeSettings,
    makeColor,
    makeSettingsGroup,
    makeString, makeBoolean, makeNumber, makeList
} from "../../widgetSettings";
import settingsPresets from "../../widgetSettings/settingsPresets";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        makeSettingsGroup('title', 'Заголовок', [
            [
                makeString('name', 'Заголовок')
            ]
        ]),
        ...settingsPresets.paddings,
        ...settingsPresets.background,
        makeBoolean('enableEvents', 'Включить события', false)
    ],
    dataSet: {
        initDataSets: [{viewType: 'DYNAMIC'}, {viewType: 'DYNAMIC'}],
        canAdd: false,
        settings: [
            makeColor('color', ' Цвет'),
            makeSettingsGroup('value', 'Значение', [
                [
                    makeString('delimiter', 'Разделитель', '.'),
                    makeNumber('precision', 'Точность в знаках', 2)
                ], [
                    makeString('measure', 'Единица измерения значения'),
                    makeBoolean('showMeasure', 'Показывать единицу изменения', false)
                ]
            ])
        ]
    }
});
