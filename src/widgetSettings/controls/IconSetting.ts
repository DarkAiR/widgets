import {SettingFunc} from "../types";
import {BaseSetting} from "./BaseSetting";

type DefaultType = string;

export interface IconSetting extends BaseSetting<DefaultType> {
}

export function makeIcon(name: string, label: string, def: DefaultType): SettingFunc {
    return (): IconSetting => ({
        name,
        label,
        type: 'icon',
        default: def,
        condition: '',
        required: false
    });
}
