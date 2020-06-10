import {XAxisPos, YAxisPos} from "../models/types";

export interface AxisData<T> {
    name: string;
    nameGap: number;
    nameColor: string;
    color: string;
    position: T;
    show: boolean;
    max?: number;
    min?: number;
    axesToIndex: number[];
    showTick: boolean;
}

export type XAxisData = AxisData<XAxisPos>;
export type YAxisData = AxisData<YAxisPos>;
