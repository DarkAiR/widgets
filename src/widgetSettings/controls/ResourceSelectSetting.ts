import {BaseSetting} from "./BaseSetting";
import {SettingFunc} from "../types";
import {ResourceType} from "../../models/types";

type DefaultType = ResourceSelectSettingDataType;

export interface ResourceSelectSettingDataType {
    type: ResourceType;
    code: string;
}

export interface ResourceSelectSetting extends BaseSetting<DefaultType> {
}

/**
 * Выбор ресурса из списка
 * Хранит тип и значение
 */
export function makeResourceSelect(
    name: string,
    label: string,
    def: DefaultType = null,
    data: {
        required?: boolean;
    } = null
): SettingFunc {
    return (): ResourceSelectSetting => ({
        name,
        label: label,
        type: 'resourceSelect',
        default: def ?? {
            type: null,
            code: ''
        },
        condition: '',
        required: data?.required ?? false
    });
}
