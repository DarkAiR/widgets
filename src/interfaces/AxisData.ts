import {XAxisPos, YAxisPos} from "../types/types";
import {makeNumber} from "../widgetSettings/controls";

export interface AxisData<T> {
    name: string;
    nameGap: number;
    nameColor: string;
    maxValueLength: number;       // Макс. символов в строке подписи
    color: string;
    position: T;
    show: boolean;
    max?: number;
    min?: number;
    axesToIndex: number[];
    showLine: boolean;
    showTick: boolean;
}

export type XAxisData = AxisData<XAxisPos>;
export type YAxisData = Omit<AxisData<YAxisPos>, 'maxValueLength'>;

