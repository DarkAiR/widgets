import w from "./table.less";
import {settings as widgetSettings} from "./settings";

import {
    DimensionFilter,
    IChartData, IEventOrgUnits, INameValue, ISettings,
    IWidgetVariables, JoinDataSetTemplate, TableRow, TimeSeriesDataSetShort
} from "../../interfaces";
import {get as _get, map as _map, filter as _filter, keyBy as _keyBy} from "lodash";
import {Chart} from "../../models/Chart";
import {MathHelper, TypeGuardsHelper} from "../../helpers";
import {IWidgetSettings} from "../../widgetSettings";
import {WidgetConfigInner} from "../..";

export class Table extends Chart {
    getVariables(): IWidgetVariables {
        const res: IWidgetVariables = {};
        const addVar = this.addVar(res);

        addVar(0, 'org units', 'OrgUnits', 'Выбирается в отдельном виджете');

        return res;
    }

    getSettings(): IWidgetSettings {
        return widgetSettings;
    }

    constructor(config: WidgetConfigInner) {
        super(config);
        // Инициализация в конструкторе, чтобы можно было вызвать инициализацию переменных до первого рендера
        this.onEventBus = this.onEventBusFunc.bind(this);
    }

    run(): void {
        const data: IChartData = this.chartData;
        const dataByDataSources: TableRow[][] = data.data as TableRow[][];

        // NOTE: Для таблицы существует только один источник, если его нет, то это Exception
        if (TypeGuardsHelper.isJoinDataSetTemplate(data.dataSets[0])) {
            const dataSet: JoinDataSetTemplate = data.dataSets[0];
            const settings: ISettings = dataSet.settings ?? {};
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
            ], this.getDataSetSettings(settings, 'columnNames'));
            let key = 0;
            const rows: Array<{cols: INameValue<{k: number, v: string}>[]}> = points.map((v: TableRow) => {
                const row = [];
                const pointDimensionsName: string = _keyBy(v.dimensions, 'name');
                const pointMetricsName: string = _keyBy(v.metrics, 'name');

                row.push({name: 'localDateTime', value: {k: key++, v: new Date(v.localDateTime).toLocaleDateString()}});   // Конвертируем даты
                dimensions.forEach((dimName: string) => {
                    row.push({
                        name: dimName,
                        value: {
                            k: key++,
                            v: _get(pointDimensionsName[dimName], 'entity.name', _get(pointDimensionsName[dimName], 'value', ''))
                        }
                    });
                });
                metrics.forEach((metricName: string) => {
                    row.push({name: metricName, value: {k: key++, v: _get(pointMetricsName[metricName], 'value', '')}});
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

    private mapToNames(src: string[], arr: INameValue[]): string[] {
        arr.forEach((v: INameValue) => {
            const idx: number = src.findIndex((srcValue: string) => srcValue === v.name);
            if (idx !== -1) {
                src[idx] = v.value;
            }
        });
        return src;
    }

    /**
     * Обработка событий
     * NOTE: все данные меняются в this.config.template
     */
    // tslint:disable-next-line:no-any
    private onEventBusFunc(varName: string, value: any, dataSourceId: number): boolean {
        console.groupCollapsed('Table EventBus data');
        console.log(varName, '=', value);
        console.log('dataSourceId =', dataSourceId);
        console.groupEnd();

        // NOTE: Делаем через switch, т.к. в общем случае каждая обработка может содержать дополнительную логику

        let needReload = false;
        switch (varName) {
            case 'org units':
                needReload = this.processingOrgUnits(value as IEventOrgUnits);
                break;
        }
        return needReload;
    }

    private processingOrgUnits(event: IEventOrgUnits): boolean {
        let needReload = false;
        if (TypeGuardsHelper.everyIsJoinDataSetTemplate(this.config.template.dataSets)) {
            this.config.template.dataSets.forEach((joinDataSet: JoinDataSetTemplate) => {
                joinDataSet.dataSetTemplates.forEach((v: TimeSeriesDataSetShort) => {
                    if (TypeGuardsHelper.isSingleDataSource(v.dataSource1)) {
                        for (const dimName in event) {
                            if (!event.hasOwnProperty(dimName)) {
                                continue;
                            }
                            // NOTE: Нельзя проверять на event[dimName].length, т.к. тогда остануться данные с прошлого раза
                            const dim: DimensionFilter = joinDataSet.dimensions.find((d: DimensionFilter) => d.name === dimName);
                            if (dim) {
                                dim.values = event[dimName];
                                dim.groupBy = event[dimName].length > 0;
                            } else {
                                const newFilter: DimensionFilter = {
                                    name: dimName,
                                    values: event[dimName],
                                    expression: '',
                                    groupBy: true
                                };
                                joinDataSet.dimensions.push(newFilter);
                            }
                            needReload = true;
                        }
                    }
                });
            });
        }
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
            <div class="${w['widget']}">
                <h4>{{title}}</h4>
                <table class="${w['table']} ${w['table-zebra']}">
                <thead>
                    <tr>
                        {{#header}}
                        <th class="${w['table-w-auto']}">
                            <div class="${w['title']}">{{.}}</div>
                        </th>
                        {{/header}}
                    </tr>
                </thead>
                <tbody>
                    {{#rows}}
                    <tr>
                        {{#cols}}
                        <td class="table-small ${w['value']}" attr-key="{{value.k}}">{{value.v}}</td>
                        {{/cols}}
                    </tr>
                    {{/rows}}
                </tbody>
                </table>
            </div>
        `;
    }
}
