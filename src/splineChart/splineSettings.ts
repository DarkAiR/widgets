import {ISettings} from "../interfaces";
import {YAxisType} from "../models/types";

export interface SplineSettings extends ISettings {
    title: string;
    yAxis: YAxisType;
}
