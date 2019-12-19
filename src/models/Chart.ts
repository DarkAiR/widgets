import {get as _get} from 'lodash';
import ResizeObserver from 'resize-observer-polyfill';
import {DataSetSettings, IChart, IChartData, IWidgetVariables} from "../interfaces";
import {WidgetConfigInner} from "./widgetConfig";
import {EventBusWrapper, EventBus, EventBusEvent} from 'goodteditor-event-bus';

const hogan = require('hogan.js');

export type ListenFunction = (event: EventBusEvent, data: Object) => void;
export type ResizeFunction = (this: Chart, width: number, height: number) => void;

export abstract class Chart implements IChart {
    protected config: WidgetConfigInner = null;
    private resizeObserver: ResizeObserver = null;

    // tslint:disable: no-any
    private template: any = null;                   // Скомпилированный шаблон

    abstract run(data: IChartData): void;           // Запуск виджета
    abstract getVariables(): IWidgetVariables;      // Получить переменные для общения по шине

    constructor(config: WidgetConfigInner) {
        this.config = config;

        if (!this.config.eventBus) {
            this.config.eventBus = new EventBusWrapper(EventBus);
        }

        const template = this.getTemplate();
        if (template) {
            this.template = hogan.compile(template);
        }
    }

    destroy(): void {
        console.log('%cWidget destroy listeners', 'color: #b080ff');
        if (this.resizeObserver) {
            console.log('%c    - resize', 'color: #b080ff');
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        console.log('%c    - eventBus', 'color: #b080ff');
        this.config.eventBus.destroy();
    }

    /**
     * Повесить слушателя на изменения переменных
     */
    protected listen(cb: ListenFunction): void {
        console.log('%cWidget add listeners', 'color: #b080ff');
        this.config.eventBus.listenVariableChange(cb);
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

    protected async reload(): Promise<IChartData | null> {
        const data: IChartData = await this.config.dataProvider.parseTemplate(this.config.template);
        this.destroy();
        this.run(data);
        return data;
    }

    /**
     * Добавить переменную для управления виджетом извне
     */
    protected addVar(res: IWidgetVariables) {
        let sortIndex = 0;
        return (idx: number, name: string, description: string, hint: string) => {
            res[name + (idx === 0 ? '' : ' ' + idx)] = {
                description,
                hint,
                sortIndex: sortIndex++,
            };
        };
    }

    /**
     * Возвращает строку стилей и имя класса
     * Оба значения можно использовать как есть в виде class=`${className}` style=`${colorStyle}`
     * @return Всегда возвращает валидный цвет для подстановки
     */
    protected getColor(settings: DataSetSettings, defClassName: string, defColor: string = '#000'): {
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

    /**
     * Получить шаблон
     */
    protected getTemplate(): string {
        return '';
    }

    /**
     * Отрендерить шаблон
     */
    protected renderTemplate(data: Object): string {
        return this.template
            ? this.template.render(data)
            : '';
    }
}
