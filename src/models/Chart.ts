import {get as _get} from 'lodash';
import ResizeObserver from 'resize-observer-polyfill';
import {DataSetSettings} from "../interfaces";
import {WidgetConfig} from "./widgetConfig";
import {EventBusWrapper, EventBus, EventBusEvent} from 'goodteditor-event-bus';

export type ListenFunction = (event: EventBusEvent, data: Object) => void;
export type ResizeFunction = (this: Chart, width: number, height: number) => void;

export abstract class Chart {
    protected config: WidgetConfig = null;
    private resizeObserver: ResizeObserver = null;
    private listenCb: ListenFunction = null;

    constructor(config: WidgetConfig) {
        this.config = config;

        if (!this.config.eventBus) {
            this.config.eventBus = new EventBusWrapper(EventBus);
        }
    }

    destroy(): void {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        if (this.listenCb) {
            this.config.eventBus.unlistenVariableChange(this.listenCb);
            this.listenCb = null;
        }
    }

    /**
     * Повесить слушателя на изменения переменных
     */
    protected listen(cb: ListenFunction): void {
        this.listenCb = cb;
        this.config.eventBus.listenVariableChange(this.listenCb);
    }

    /**
     * Подписаться на resize
     */
    protected resize(element: HTMLElement, callback: ResizeFunction) {
        if (element) {
            this.resizeObserve(element, callback);
        }
    }

    private resizeObserve(element: HTMLElement, callback: Function) {
        this.resizeObserver = new ResizeObserver(entries => {
            const entry: ResizeObserverEntry = entries[0];
            callback.call(this, entry.contentRect.width, entry.contentRect.height);
        });
        this.resizeObserver.observe(element);
    }

    /**
     * Возвращает строку стилей и имя класса
     * Оба значения можно использовать как есть в виде class=`${className}` style=`${colorStyle}`
     * @return Всегда возвращает валидный цвет для подстановки
     */
    getColor(settings: DataSetSettings, defClassName: string, defColor: string = '#000'): {
        color: string, colorStyle: string, className: string
    } {
        let color: string = _get(settings, 'color', '');
        let colorStyle: string = '';
        let className: string = '';
        if (!color) {
            color = defColor;
            colorStyle = '';
            className = defClassName;
        } else {
            colorStyle = 'color: ' + color;
        }
        return {color, colorStyle, className};
    }
}
