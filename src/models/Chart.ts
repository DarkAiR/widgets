import {get as _get} from 'lodash';
import ResizeObserver from 'resize-observer-polyfill';
import {DataSetSettings} from "../interfaces";
import {WidgetConfig} from "./widgetConfig";
import {EventBusWrapper, EventBus} from 'goodteditor-event-bus';

export type ResizeFunction = (this: Chart, width: number, height: number) => void;

export abstract class Chart {
    protected config: WidgetConfig = null;

    constructor(config: WidgetConfig) {
        this.config = config;

        if (!this.config.eventBus) {
            this.config.eventBus = new EventBusWrapper(EventBus);
        }
    }

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
