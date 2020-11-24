import w from './../styles/preloader.less';
import {get as _get, map as _map, defaultTo as _defaultTo} from 'lodash';
import ResizeObserver from 'resize-observer-polyfill';
import {
    DataSet,
    IChart,
    IChartData, IColor, IEventData, ISettings,
    IWidgetVariables
} from "../interfaces";
import {WidgetConfigInner} from "./widgetConfig";
import {EventBusWrapper, EventBus, EventBusEvent} from 'goodteditor-event-bus';
import {IWidgetSettings} from "../widgetSettings";
import {ColorHelper, SettingsHelper, TypeGuardsHelper} from "../helpers";
import {ChartType} from "./types";
import {WidgetOptions} from "./widgetOptions";

const hogan = require('hogan.js');

export type AddVarFunc<T> = (dataSourceIndex: number, name: T, description: string, hint: string) => void;

export abstract class Chart implements IChart {
    protected config: WidgetConfigInner = null;         // Конфигурация для создания виджета
    protected options: WidgetOptions = null;            // Дополнительные настройки, не связанные с виджетами
    protected widgetSettings: IWidgetSettings = null;   // Информация о настройках виджета
    protected chartData: IChartData = null;             // Данные, пришедшие из graphQL
    protected loading: boolean = false;                 // Идет загрузка данных

    private resizeObserver: ResizeObserver = null;

    // tslint:disable: no-any
    private readonly template: any = null;              // Скомпилированный шаблон

    initialized: boolean = false;                       // Виджет прошел создание и может быть отрендерен

    abstract run(): void;                               // Запуск виджета
    abstract getSettings(): IWidgetSettings;            // Получить настройки виджета
    abstract getVariables(): IWidgetVariables;          // Получить переменные для общения по шине

    // Получить шаблон. Если не перегружена (null), то шаблонизатор не используется
    getTemplate(): string | null { return null; }

    // Обработчик изменения размера
    onResize: (width: number, height: number) => void = (width, height) => {};

    /**
     * Обработчик сообщений от шины
     * @return true - если необходима перерисовка
     */
    onEventBus: (varName: string, value: string, dataSourceId: number) => Promise<boolean> = async (...args): Promise<boolean> => false;

    constructor(config: WidgetConfigInner, options: WidgetOptions) {
        this.config = config;
        this.options = options;

        if (!this.config.eventBus) {
            this.config.eventBus = new EventBusWrapper(new EventBus());
        }

        const template = this.getTemplate();
        if (template) {
            this.template = hogan.compile(template);
        }

        if (this.options?.logs?.eventBus ?? true) {
            console.log('%cWidget add listeners', 'color: #b080ff');
        }
        // Подписаться на шину
        this.config.eventBus.listenStateChange(async (ev: EventBusEvent, eventObj: IEventData) => {
            // console.log('ListenStateChange:', ev, eventObj);
            let needReload = false;
            const widgetVars: IWidgetVariables = this.getVariables();

            await Promise.all(
                _map(eventObj, async (value: string, name: string) => {
                    const res = /(.*?)(?: (\d*))?$/.exec(name);
                    const varName: string = _defaultTo(_get(res, '1'), '');
                    const dataSourceId: number = _defaultTo(_get(res, '2'), 0);

                    if (widgetVars[varName] !== undefined) {
                        if (await this.onEventBus(varName, value, dataSourceId)) {
                            needReload = true;
                        }
                    }
                })
            );
            if (needReload) {
                await this.redraw();
            }

            if (eventObj._cb && typeof eventObj._cb.func === 'function') {
                eventObj._cb.func();
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
        if (this.options?.logs?.eventBus ?? true) {
            console.log('%cWidget destroy listeners', 'color: #b080ff');
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        this.config.eventBus.destroy();
    }

    /**
     * Создание виджета
     */
    readonly create = (): void => {
        this.widgetSettings = this.getSettings();
    }

    /**
     * Перерисовать виджет с текущими данными
     */
    async redraw(): Promise<void> {
        if (!this.initialized) {
            // Не перерисовываем, пока не закончилась инициализация
            // Необходимо, чтобы изменение переменных по шине в момент создания виджета не вызывало перерисовку
            return;
        }
        this.startLoading();
        this.config.dataProvider.parseTemplate(this.config.template).then(
            (templateData: IChartData) => {
                this.stopLoading();
                this.chartData = templateData;
                this.run();
            }
        ).catch((error: Error) => {
            throw error;
        });
    }

    /**
     * Получить названия всех DataSources
     * NOTE: На донный момент возвращает только SingleDataSource
     * TODO: Передать на отдельное поле DataSetId
     */
    getDataSourceNameIds(): string[] {
        const res: string[] = [];
        this.config.template.dataSets.forEach((dataSet: DataSet) => {
            let name: string = null;
            try {
                name = this.getDataSetSettings<string>(dataSet.settings, 'name.id');
            } catch (err) {}
            if (name) {
                res.push(name);
            }
        });
        return res;
    }

    /**
     * Получить индекс dataSource
     */
    getDataSourceIndex(dataSourceName: string): number | null {
        const index: number = this.config.template.dataSets.findIndex((dataSet: DataSet) => {
            let name: string = null;
            try {
                name = this.getDataSetSettings<string>(dataSet.settings, 'name.id');
            } catch (err) {}
            return dataSourceName === name;
        });
        return index === -1 ? null : index;
    }

    /**
     * Добавить переменную для управления виджетом извне
     */
    protected addVar<T = string>(res: IWidgetVariables): AddVarFunc<T> {
        let sortIndex = 0;
        return (dataSourceIndex: number, name: T, description: string, hint: string) => {
            res[name + (dataSourceIndex === 0 ? '' : ' ' + dataSourceIndex)] = {
                description,
                hint,
                sortIndex: sortIndex++,
            };
        };
    }

    /**
     * Возвращает настройку из сеттингов виджета
     * @param settings Объект с настройками
     * @param path название поля
     * @return возвращает значение того типа, к которому присваивается результат, поэтому нужен тип T
     */
    protected getWidgetSetting<T = void>(...args: Array<ISettings | string>): T {
        if (args[1] === undefined) {
            return SettingsHelper.getWidgetSetting<T>(
                this.widgetSettings.settings,
                this.chartData.settings,
                args[0] as string
            );
        } else {
            return SettingsHelper.getWidgetSetting<T>(
                this.widgetSettings.settings,
                args[0] as ISettings,
                args[1] as string
            );
        }
    }

    /**
     * Возвращает настройку из датасета
     * @param settings Объект с настройками
     * @param path название поля
     * @return возвращает значение того типа, к которому присваивается результат, поэтому нужен тип T
     */
    protected getDataSetSettings<T = void>(settings: ISettings, path: string): T {
        return SettingsHelper.getDataSetSettings<T>(this.widgetSettings.dataSet.settings, settings, path);
    }

    /**
     * Возвращает строку стилей и имя класса
     * Оба значения можно использовать как есть в виде class=`${className}` style=`${colorStyle}`
     * По-умолчанию альфа-канал не используется, поэтому хранится в отдельных переменных
     * @return Всегда возвращает валидный цвет для подстановки
     */
    protected getColor(
        settings: ISettings,
        defColor: string = '#000000'
    ): IColor {
        const colorSetting: string = this.getDataSetSettings(settings, 'color');
        return ColorHelper.hexToColor(!colorSetting ? defColor : colorSetting);
    }

    /**
     * Проверяем, есть ли среди графиков гистограммы
     * Для них необходимо изменить вид графика
     */
    protected hasHistogram(): boolean {
        const data: IChartData = this.chartData;
        if (TypeGuardsHelper.everyIsDataSetTemplate(data.dataSets)) {
            for (let idx = 0; idx < data.data.length; idx++) {
                if (this.getDataSetSettings<ChartType>(data.dataSets[idx].settings, 'chartType') === 'HISTOGRAM') {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Отрендерить шаблон
     */
    protected renderTemplate(data: Object): string {
        return this.template
            ? this.template.render(data)
            : '';
    }

    private startLoading(): void {
        this.config.element.innerHTML = `
            <div style="
                position: absolute; z-index: 1; left: 0; top: 0; right: 0; bottom: 0;
                display: flex;
                align-items: safe center;
                justify-content: safe center;
                width: 100%;
                height: 100%;
            ">
                <div class="${w['preloader']}" style="padding: 1rem"></div>
            </div>
        `;
    }
    private stopLoading(): void {
        // Do nothing
    }
}
