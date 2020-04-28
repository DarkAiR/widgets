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
    ],
    dataSet: {
        initDataSets: [{viewType: 'PROFILE'}],      // DISTRIBUTION
        canAdd: false,
        settings: []
    }
});
