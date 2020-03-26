import {get as _get, set as _set, forEach as _forEach, defaultTo as _defaultTo} from 'lodash';
import ResizeObserver from 'resize-observer-polyfill';
import {
    DataSetSettings,
    IChart,
    IChartData, IWidgetConfigurationDescription,
    IWidgetConfigurationDescriptionItem,
    IWidgetVariables, WidgetTemplateSettings
} from "../interfaces";
import {WidgetConfigInner} from "./widgetConfig";
import {EventBusWrapper, EventBus, EventBusEvent} from 'goodteditor-event-bus';

const hogan = require('hogan.js');

export abstract class Chart implements IChart {
    protected config: WidgetConfigInner = null;
    private resizeObserver: ResizeObserver = null;

    // tslint:disable: no-any
    private template: any = null;                   // Скомпилированный шаблон

    abstract run(data: IChartData): void;           // Запуск виджета
    abstract getVariables(): IWidgetVariables;      // Получить переменные для общения по шине

    // Получить шаблон. Если не перегружена (null), то шаблонизатор не используется
    getTemplate(): string | null { return null; }

    // Обработчик изменения размера
    onResize: (width: number, height: number) => void = (w, h) => {};

    /**
     * Обработчик сообщений от шины
     * @return true - если необходима перерисовка
     */
    onEventBus: (varName: string, value: string, dataSourceId: number) => boolean = (...args) => false;

    constructor(config: WidgetConfigInner) {
        this.config = config;

        if (!this.config.eventBus) {
            this.config.eventBus = new EventBusWrapper(new EventBus());
        }

        const template = this.getTemplate();
        if (template) {
            this.template = hogan.compile(template);
        }

        console.log('%cWidget add listeners', 'color: #b080ff');
        // Подписаться на шину
        this.config.eventBus.listenStateChange((ev: EventBusEvent, eventObj: Object) => {
            console.log('ListenStateChange:', ev, eventObj);
            let needReload = false;
            const widgetVars: IWidgetVariables = this.getVariables();
            _forEach(eventObj, (value: string, name: string) => {
                const res = /(.*?)(?: (\d*))?$/.exec(name);
                const varName: string = _defaultTo(_get(res, '1'), '');
                const dataSourceId: number = _defaultTo(_get(res, '2'), 0);

                if (widgetVars[varName] !== undefined) {
                    if (this.onEventBus(varName, value, dataSourceId)) {
                        needReload = true;
                    }
                }
            });
            if (needReload) {
                this.redraw();
            }
        });

        // Подписаться на resize
        if (this.config.element) {
            this.resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
                const entry: ResizeObserverEntry = entries[0];
                this.onResize.bind(this).call(this, entry.contentRect.width, entry.contentRect.height);
            });
            this.resizeObserver.observe(this.config.element);
        }
    }

    destroy(): void {
        console.log('%cWidget destroy listeners', 'color: #b080ff');
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        this.config.eventBus.destroy();
    }

    /**
     * Перерисовать виджет с текущими данными
     */
    async redraw(): Promise<void> {
        this.config.dataProvider.parseTemplate(this.config.template)
            .then((templateData: IChartData) => {
                this.run(templateData);
            });
    }

    /**
     * Добавить переменную для управления виджетом извне
     */
    protected addVar(res: IWidgetVariables): Function {
        let sortIndex = 0;
        return (dataSourceIndex: number, name: string, description: string, hint: string) => {
            res[name + (dataSourceIndex === 0 ? '' : ' ' + dataSourceIndex)] = {
                description,
                hint,
                sortIndex: sortIndex++,
            };
        };
    }

    /**
     * Возвращает настройку из сеттингов виджета
     * @param config конфигурация виджета
     * @param settings Объект с настройками
     * @param name название поля
     * @param def если требуется указать значение, отличное от default указанного в конфиге
     */
    protected getWidgetSetting<T = any>(
        config: IWidgetConfigurationDescription,
        settings: WidgetTemplateSettings,
        name: string,
        def: T = null
    ): T {
        const item = config.settings.find((v: IWidgetConfigurationDescriptionItem) => v.name === name);
        if (!item) {
            // NOTE: Вот именно так! сразу бьем по рукам за попытку обратиться к недокументированному параметру
            throw new Error(`Attempt to get an undescribed parameter <${name}>`);
        }
        // Если параметр описан, но не пришел в настройках, выставляем default
        return _get(settings, name, def !== null ? def : item.default);
    }

    /**
     * Возвращает настройку из датасета
     * @param config конфигурация виджета
     * @param settings Объект с настройками
     * @param name название поля
     * @param def если требуется указать значение, отличное от default указанного в конфиге
     */
    protected getDataSetSettings<T = any>(
        config: IWidgetConfigurationDescription,
        settings: DataSetSettings,
        name: string,
        def: T = null
    ): T {
        const item = config.dataSet.settings.find((v: IWidgetConfigurationDescriptionItem) => v.name === name);
        if (!item) {
            // NOTE: Вот именно так! сразу бьем по рукам за попытку обратиться к недокументированному параметру
            throw new Error(`Attempt to get an undescribed parameter <${name}>`);
        }
        // Если параметр описан, но не пришел в настройках, выставляем default
        return _get(settings, name, def !== null ? def : item.default);
    }

    /**
     * Возвращает строку стилей и имя класса
     * Оба значения можно использовать как есть в виде class=`${className}` style=`${colorStyle}`
     * @return Всегда возвращает валидный цвет для подстановки
     */
    protected getColor(
        config: IWidgetConfigurationDescription,
        settings: DataSetSettings,
        defClassName: string,
        defColor: string = '#000'
    ): {
        color: string, colorStyle: string, className: string
    } {
        let color: string = this.getDataSetSettings(config, settings, 'color');
        let colorStyle: string = '';
        let className: string = '';
        if (!color) {
            color = defColor;
            colorStyle = '';
            className = defClassName;
        } else {
            colorStyle = `color: ${color};`;
        }
        return {color, colorStyle, className};
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
