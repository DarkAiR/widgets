import {BaseSetting} from "./BaseSetting";
import {SettingFunc} from "../types";
import {StringSetting} from "./StringSetting";

type DefaultType = string;

export interface ResourceSelectSetting extends BaseSetting<DefaultType> {
}

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
        default: def ?? '',
        condition: '',
        required: data?.required ?? false
    });
}
