import {SettingFunc} from "../types";
import {BaseSetting} from "./BaseSetting";

type DefaultType = string;

export interface IconSetting extends BaseSetting<DefaultType> {
}

export function makeIcon(name: string, def: DefaultType): SettingFunc {
    return (): IconSetting => ({
        name,
        type: 'icon',
        default: def
    });
}
