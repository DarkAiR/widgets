import {ISettings} from "../../interfaces";
import {ServerType} from "../../models/types";

export interface SolidGaugeSettings extends ISettings {
    title: string;
    server: ServerType;
    icon: string;
}
