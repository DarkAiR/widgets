export declare type ResizeFunction = (this: any, width: number, height: number) => void;
export declare abstract class Chart {
    protected resize(element: HTMLElement, callback: ResizeFunction): void;
    private resizeObserve;
}
