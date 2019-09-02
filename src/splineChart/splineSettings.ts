import {ISettings} from "../interfaces";
import {YAxisTypes} from "../models/types";

export interface SplineSettings extends ISettings {
    title: string;
    yAxis: YAxisTypes;
}
