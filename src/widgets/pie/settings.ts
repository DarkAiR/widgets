import {IWidgetSettings, makeSettings} from "../../widgetSettings";
import settingsPresets from "../../widgetSettings/settingsPresets";
import {makeArray, makeColor, makeList, makeNumber, makeSettingsGroup, makeString} from "../../widgetSettings/controls";
import {PieLabelAlign, PieLabelAlignValues} from "../../types/types";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        ...settingsPresets.title,
        ...settingsPresets.paddings,
        ...settingsPresets.background,
        ...settingsPresets.legend,
    ],
    dataSet: {
        initDataSets: [{viewType: 'DYNAMIC'}],
        canAdd: false,
        settings: [
            ...settingsPresets.dataSourceName,
            makeSettingsGroup('radius', 'Радиус', [
                [
                    makeNumber('radius1', 'Внутренний, %', 0, {min: 0, max: 100}),
                    makeNumber('radius2', 'Внешний, %', 75, {min: 0, max: 100})
                ]
            ]),
            makeSettingsGroup('label', 'Формат вывода значений', [
                ...settingsPresets.labelFields,
                [
                    makeNumber('distanceToLabelLine', 'Расстояние от линии до значения, px', 5),
                    makeList<PieLabelAlign>('alignTo', 'Выравнивание значений', 'none', PieLabelAlignValues),
                ]
            ]),
            makeArray('palette', 'Цвета категорий', [
                [
                    makeColor('color', 'Цвет')
                ]
            ])
        ]
    }
});
