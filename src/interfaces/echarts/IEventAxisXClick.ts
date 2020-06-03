export interface IEventAxisXClick {
    // tslint:disable-next-line:no-any
    value: number | string | any[];      // input data value
    componentType: string;      // component name of clicked component e.g., 'series', 'markLine', 'markPoint', 'timeLine'
    componentIndex: number | string;
    event: {
        type: string;           // e.g. 'dblclick'
        cancelBubble: false;
        event: MouseEvent;
        offsetX: number;
        offsetY: number;
        stop: Function;
        target: Object;
        topTarget: Object;
        wheelDelta: number;
        which: number;
    };
    targetType: string;         // e.g. "axisLabel"
    type: string;               // e.g. 'dblclick'
    xAxisIndex: number;
}
