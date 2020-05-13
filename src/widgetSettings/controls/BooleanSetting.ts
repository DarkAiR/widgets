import {BaseSetting} from "./BaseSetting";
import {SettingFunc} from "../types";

type DefaultType = boolean;

export interface BooleanSetting extends BaseSetting<DefaultType> {
}

export function makeBoolean(name: string, label: string, def: DefaultType): SettingFunc {
    return (): BooleanSetting => ({
        name,
        label,
        type: 'boolean',
        default: def
    });
}
