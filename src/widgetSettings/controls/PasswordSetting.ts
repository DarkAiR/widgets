import {BaseSetting} from "./BaseSetting";
import {SettingFunc} from "../types";

type DefaultType = string;

export interface PasswordSetting extends BaseSetting<DefaultType> {
}

export function makePassword(name: string, label: string): SettingFunc {
    return (): PasswordSetting => ({
        name,
        label: label,
        type: 'password',
        default: '',
        condition: ''
    });
}
