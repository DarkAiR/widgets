import ResizeObserver from 'resize-observer-polyfill';

export type ResizeFunction = (this: Chart, width: number, height: number) => void;

export abstract class Chart {
    protected resize(element: HTMLElement, callback: ResizeFunction) {
        if (element) {
            this.resizeObserve(element, callback);
        }
    }

    private resizeObserve(element: HTMLElement, callback: Function) {
        new ResizeObserver(entries => {
            const entry: ResizeObserverEntry = entries[0];
            callback.call(this, entry.contentRect.width, entry.contentRect.height);
        }).observe(element);
    }
}
