import {ECElementEvent} from "echarts/types/src/util/types";

type AxisIndexKey = 'xAxisIndex' | 'yAxisIndex' | 'radiusAxisIndex' | 'angleAxisIndex' | 'singleAxisIndex';
export type AxisEventData = {
    componentType: string;
    componentIndex: number;
    targetType: 'axisName' | 'axisLabel';
    name?: string;
    value?: string | number;
} & {
    [key in AxisIndexKey]?: number;
} & ECElementEvent;
