import {
    IWidgetSettings,
    makeSettings,
    makeColor,
    makeIcon,
    makeString
} from "../../widgetSettings";
import settingsPresets from "../../widgetSettings/settingsPresets";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        makeString('title', 'Заголовок'),
        ...settingsPresets.background,
        makeIcon('icon', 'Иконка', '')
    ],
    dataSet: {
        initDataSets: [{viewType: 'STATIC'}, {viewType: 'STATIC'}],
        canAdd: false,
        settings: [
            makeColor('color', ' Цвет')
        ]
    }
});
