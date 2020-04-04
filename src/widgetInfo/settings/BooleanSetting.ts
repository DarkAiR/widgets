import {BaseSetting} from "./BaseSetting";
import {SettingFunc} from "../types";

type DefaultType = boolean;

export interface BooleanSetting extends BaseSetting<DefaultType> {
}

export function makeBoolean(name: string, def: DefaultType): SettingFunc {
    return (): BooleanSetting => ({
        name,
        type: 'boolean',
        default: def
    });
}
