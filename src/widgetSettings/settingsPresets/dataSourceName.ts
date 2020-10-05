/**
 * Настройки для названия dataSource
 */

import {
    makeSettingsGroup,
    makeString
} from "../controls";
import {SettingFunc} from "../types";

export const dataSourceName: SettingFunc[] = [
    makeSettingsGroup('name', 'Название', [
        [
            makeString('name', 'Название'),
            makeString('id', 'Id'),
        ]
    ], {hint: {type: 'string', text: 'Id для управления DataSource по шине'}}),
];

