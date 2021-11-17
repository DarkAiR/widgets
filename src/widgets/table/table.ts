import widgetStyles from "./table.less";
import {settings as widgetSettings} from "./settings";

import {
    DimensionFilter, DimensionUnit,
    IChartData, IEventOrgUnits, INameValue, ISettings,
    IWidgetVariables, JoinDataSetTemplate, MetricUnit, TableRow, TimeSeriesDataSetShort
} from "../../interfaces";
import {get as _get, map as _map, filter as _filter, keyBy as _keyBy, defaultTo as _defaultTo} from "lodash";
import {AddVarFunc, Chart} from "../../models/Chart";
import {DateHelper, OrgUnitsHelper, TypeGuardsHelper} from "../../helpers";
import {IWidgetSettings} from "../../widgetSettings";
import {WidgetConfigInner} from "../..";
import {WidgetOptions} from "../../models/widgetOptions";
import dayjs, {Dayjs} from "dayjs";
import {Frequency} from "../../types";

// NOTE: <VarNames | string> только для таблиц выставляем общие dimensions наружу
type VarNames = 'org units' | string;

interface TemplateRow {
    cols: INameValue<string>[];
}

export class Table extends Chart {
    constructor(config: WidgetConfigInner, options: WidgetOptions) {
        super(config, options);
        // Инициализация в конструкторе, чтобы можно было вызвать инициализацию переменных до первого рендера
        this.onEventBus = this.onEventBusFunc.bind(this);
    }

    getVariables(): IWidgetVariables {
        const res: IWidgetVariables = {};
        const addVar: AddVarFunc<VarNames> = this.addVar(res);

        addVar(0, 'org units', 'OrgUnits', 'Выбирается в отдельном виджете');

        // NOTE: Для таблицы существует только один источник, если его нет, то это Exception
        if (TypeGuardsHelper.isJoinDataSetTemplate(this.config.template.dataSets[0])) {
            const dimensions: string[] = _map(this.config.template.dataSets[0].dimensions, 'name');
            dimensions.forEach((dimName: string) => {
                addVar(0, dimName, dimName, '');
            });
        }

        return res;
    }

    getSettings(): IWidgetSettings {
        return widgetSettings;
    }

    getStyles(): ISettings {
        return widgetStyles;
    }

    run(): void {
        const data: IChartData = this.chartData;
        const dataByDataSources: TableRow[][] = data.data as TableRow[][];

        // NOTE: Для таблицы существует только один источник, если его нет, то это Exception
        if (TypeGuardsHelper.isJoinDataSetTemplate(data.dataSets[0])) {
            const dataSet: JoinDataSetTemplate = data.dataSets[0];
            const points: TableRow[] = dataByDataSources[0];

            const dimensions: string[] = _map(
                _filter(dataSet.dimensions, (v: DimensionFilter) => v.groupBy),
                'name'
            );

            const metrics: string[] = dataSet.dataSetTemplates.map(
                (v: TimeSeriesDataSetShort) => {
                    if (TypeGuardsHelper.isSingleDataSource(v.dataSource1)) {
                        return v.dataSource1.metric.name;
                    }
                    return '';
                }
            );

            // Готовим данные, формируем общий список метрик
            const header: string[] = this.mapToNames([
                'Date',
                ...dimensions,
                ...metrics
            ], this.getDataSetSettings(0, 'columnNames'));
            const rows: TemplateRow[] = points
                .sort((a: TableRow, b: TableRow) => {
                    const v1: number = dayjs(a.localDateTime).valueOf();
                    const v2: number = dayjs(b.localDateTime).valueOf();
                    return v1 < v2 ? -1 : (v1 === v2 ? 0 : 1);
                })
                .map((v: TableRow) => {
                    const row: INameValue<string>[] = [];
                    const pointDimensionsName: {[dimName: string]: DimensionUnit} = _keyBy(v.dimensions, 'name');
                    const pointMetricsName: {[metricName: string]: MetricUnit} = _keyBy(v.metrics, 'name');

                    row.push({name: 'localDateTime', value: this.getDateStr(dataSet.frequency, v.localDateTime)});   // Конвертируем даты
                    dimensions.forEach((dimName: string) => {
                        row.push({
                            name: dimName,
                            value: _defaultTo(
                                _get(pointDimensionsName[dimName], 'entity.name'),
                                _get(pointDimensionsName[dimName], 'value', '')
                            )
                        });
                    });
                    metrics.forEach((metricName: string) => {
                        row.push({name: metricName, value: _get(pointMetricsName[metricName], 'value', '')});
                    });
                    return {cols: row};
                });

            this.config.element.innerHTML = this.renderTemplate({
                title: this.getWidgetSetting('title'),
                header,
                rows
            });
        }
    }

    private getDateStr(frequency: Frequency, localDateTime: string): string {
        const date: Dayjs = dayjs(localDateTime);
        switch (frequency) {
            default:
            case "ALL":
                return date.format('DD.MM.YYYY');
            case "YEAR":
                return date.format('YYYY');
            case "MONTH":
                return DateHelper.getMonthsAbbr()[date.month()];
            case "WEEK":
            case "DAY":
                return date.format('DD.MM.YYYY');
            case "HOUR":
                return date.format('DD.MM.YYYY HH:mm');
        }
    }

    private mapToNames(src: string[], arr: INameValue[]): string[] {
        const res: string[] = [...src];
        arr.forEach((v: INameValue) => {
            const idx: number = res.findIndex((srcValue: string) => srcValue === v.name);
            if (idx !== -1) {
                res[idx] = v.value;
            }
        });
        return res;
    }

    /**
     * Обработка событий
     * NOTE: все данные меняются в this.config.template
     */
    // tslint:disable-next-line:no-any
    private async onEventBusFunc(varName: VarNames, value: any, dataSourceId: number): Promise<boolean> {
        if (this.options?.logs?.eventBus ?? true) {
            console.groupCollapsed('Table EventBus data');
            console.log(varName, '=', value);
            console.log('dataSourceId =', dataSourceId);
            console.groupEnd();
        }
        // NOTE: Делаем через switch, т.к. в общем случае каждая обработка может содержать дополнительную логику

        let needReload = false;

        // Типизированный обязательный switch
        const switchArr: Record<VarNames, Function> = {
            'org units': () => {
                needReload = OrgUnitsHelper.setOrgUnitsForTable(this.config.template.dataSets, value as IEventOrgUnits);
            },
        };
        switchArr[varName]();

        return needReload;
    }

    /**
     * Анимирование значения от n1 до n2 за время time в ms
     */
    // animNumber(numbers: [[number, number]], time: number): Function {
    //     return () => {
    //         const animFunc = function (d: number): number {
    //             return 1 - Math.pow((d - 1), 4);
    //         };
    //
    //         let steps = 20;
    //         const stepTime = MathHelper.trunc(time / steps);
    //         let x = 0;
    //         let resValues: string[] = [];
    //         const timerId = setInterval(() => {
    //             const k = animFunc(x) / animFunc(1);
    //             resValues = [];
    //             for (const num of numbers) {
    //                 resValues.push((num[0] + k * (num[1] - num[0])).toFixed(2));
    //             }
    //             x += stepTime / time;
    //             if (--steps <= 0) {
    //                 resValues = [];
    //                 for (const num of numbers) {
    //                     resValues.push((num[1]).toFixed(2));
    //                 }
    //                 clearInterval(timerId);
    //             }
    //         }, stepTime);
    //     };
    // }

    getTemplate(): string {
        return `
            <div class="widget">
                {{#title}}
                    <h4>{{title}}</h4>
                {{/title}}
                <table class="table table-zebra">
                <thead>
                    <tr>
                        {{#header}}
                        <th class="table-w-auto">
                            <div class="title">{{.}}</div>
                        </th>
                        {{/header}}
                    </tr>
                </thead>
                <tbody>
                    {{#rows}}
                    <tr>
                        {{#cols}}
                        <td>{{value}}</td>
                        {{/cols}}
                    </tr>
                    {{/rows}}
                </tbody>
                </table>
            </div>
        `;
    }
}
