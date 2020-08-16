import {BaseSetting} from "./BaseSetting";
import {SettingFunc} from "../types";
import {ResourceType} from "../../models/types";
import {INameValue} from "../../interfaces";

type DefaultType = ResourceGroupsSettingDataType;

export interface ResourceGroupsSettingDataType {
    type: ResourceType;
    resourceIds: INameValue<string>[];      // Название + resourceId
}

export interface ResourceGroupsSetting extends BaseSetting<DefaultType> {
}

/**
 * Выбор ресурсов из списка
 * Хранит тип и значения
 */
export function makeResourceGroups(
    name: string,
    label: string,
    def: DefaultType = null,
    data: {
        required?: boolean;
    } = null
): SettingFunc {
    return (): ResourceGroupsSetting => ({
        name,
        label: label,
        type: 'resourceGroups',
        default: def ?? {
            type: null,
            resourceIds: []
        },
        condition: '',
        required: data?.required ?? false
    });
}
