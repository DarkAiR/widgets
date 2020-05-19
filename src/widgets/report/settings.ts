import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import {makeColor, makeList, makeNumber, makeSettingsGroup} from "../../widgetSettings/controls";
import settingsPresets from "../../widgetSettings/settingsPresets";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        ...settingsPresets.title,
        makeSettingsGroup('value', 'Значение', [
            [
                makeColor('color', 'Цвет', '#2c2c2c'),
            ], [
                makeNumber('size', 'Размер шрифта', 14),
                makeList<string>('align', 'Выравнивание', 'left', ['left', 'center', 'right'])
            ]
        ]),
        ...settingsPresets.background,
    ],
    dataSet: {
        initDataSets: [{viewType: 'REPORT'}],
        canAdd: false,
        settings: []
    }
});
