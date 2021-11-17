import {IWidgetSettings, makeSettings, makeArray, makeString, makeSettingsGroup, makeColor, makeNumber, makeList, makeBoolean} from "../../widgetSettings";
import {MinWidth, MinWidthValues} from "../../types";

export const settings: IWidgetSettings = makeSettings({
    settings: [
        makeString('title', 'Заголовок'),
        makeSettingsGroup('header1', 'Первая строка', [
            [
                makeColor('color', 'Цвет'),
            ], [
                makeColor('backgroundColor', 'Цвет фона'),
            ], [
                makeNumber('fontSize', 'Размер шрифта, px', null)
            ]
        ]),
        makeSettingsGroup('header2', 'Вторая строка', [
            [
                makeColor('color', 'Цвет'),
            ], [
                makeColor('backgroundColor', 'Цвет фона'),
            ], [
                makeNumber('fontSize', 'Размер шрифта, px', null)
            ]
        ]),
        makeSettingsGroup('column', 'Первая колонка', [
            [
                makeColor('color', 'Цвет'),
            ], [
                makeColor('backgroundColor', 'Цвет фона'),
            ], [
                makeNumber('fontSize', 'Размер шрифта, px', null)
            ], [
                makeList<MinWidth>('minWidth', 'Минимальная ширина, в условных ед.', 'auto', MinWidthValues),
            ], [
                makeBoolean('noWrap', 'В одну строку', false)
            ]
        ]),
        makeSettingsGroup('cell', 'Ячейка', [
            [
                makeColor('selectBackgroundColor', 'Цвет выделенного значения'),
            ], [
                makeNumber('fontSize', 'Размер шрифта, px', null)
            ], [
                makeList<MinWidth>('minWidth', 'Минимальная ширина, в условных ед.', 'auto', MinWidthValues),
            ]
        ]),
    ],
    dataSet: {
        initDataSets: [{viewType: 'TABLE'}],
        canAdd: false,
        settings: [
            makeArray('columnNames', 'Названия колонок', [
                [
                    makeString('name', ''),
                    makeString('value', '')
                ]
            ])
        ]
    }
});
