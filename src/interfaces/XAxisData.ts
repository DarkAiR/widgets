import {XAxisPos} from "../models/types";

export interface XAxisData {
    name: string;
    nameGap: number;
    nameColor: string;
    color: string;
    position: XAxisPos;
    show: boolean;
    axesToIndex: number[];
    showTick: boolean;
}
