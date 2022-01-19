import {
    IWidgetSettings,
    makeSettings,
    makeColor,
    makeSettingsGroup,
    makeString, makeBoolean
} from "../../widgetSettings";
import settingsPresets from "../../widgetSettings/settingsPresets";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        makeSettingsGroup('title', 'Заголовок', [
            [
                makeString('name', 'Заголовок')
            ]
        ], {collapse: false}),
        ...settingsPresets.paddings,
        ...settingsPresets.background,
        makeBoolean('enableEvents', 'Включить события', false)
    ],
    dataSet: {
        initDataSets: [{viewType: 'DYNAMIC'}, {viewType: 'DYNAMIC'}],
        canAdd: false,
        settings: [
            makeColor('color', ' Цвет')
        ]
    }
});
