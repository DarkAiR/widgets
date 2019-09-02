import {ISettings} from "../interfaces";

export interface SplineSettings extends ISettings {
    title: string;
    yAxis: 'LEFT' | 'RIGHT';
}
