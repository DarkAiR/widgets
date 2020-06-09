import {YAxisPos} from "../models/types";

export interface YAxisData {
    name: string;
    nameGap: number;
    nameColor: string;
    color: string;
    position: YAxisPos;
    show: boolean;
    max?: number;
    min?: number;
    axesToIndex: number[];
    showTick: boolean;
}
