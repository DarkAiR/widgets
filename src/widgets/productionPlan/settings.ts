import {
    IWidgetSettings,
    makeSettings,
    makeColor,
    makeSettingsGroup,
    makeString
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
    ],
    dataSet: {
        initDataSets: [{viewType: 'DYNAMIC'}, {viewType: 'DYNAMIC'}],
        canAdd: false,
        settings: [
            makeColor('color', ' Цвет')
        ]
    }
});
