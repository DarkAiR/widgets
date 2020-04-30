import s from "../../styles/_all.less";
import w from "./table.less";
import {settings as widgetSettings} from "./settings";

import {
    DimensionFilter,
    IChartData, INameValue, ISettings,
    IWidgetVariables, JoinDataSetTemplate, TableRow, TimeSeriesDataSetShort
} from "../../interfaces";
import {get as _get, map as _map, filter as _filter, keyBy as _keyBy} from "lodash";
import {Chart} from "../../models/Chart";
import {TypeGuardsHelper} from "../../helpers";
import {IWidgetSettings} from "../../widgetSettings";

export class Table extends Chart {
    getVariables(): IWidgetVariables {
        return {};
    }

    getSettings(): IWidgetSettings {
        return widgetSettings;
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
            const rows: Array<{cols: INameValue[]}> = points.map((v: TableRow) => {
                const row = [];
                const pointDimensionsName: string = _keyBy(v.dimensions, 'name');
                const pointMetricsName: string = _keyBy(v.metrics, 'name');

                row.push({name: 'localDateTime', value: new Date(v.localDateTime).toLocaleDateString()});   // Конвертируем даты
                dimensions.forEach((dimName: string) => {
                    row.push({name: dimName, value: _get(pointDimensionsName[dimName], 'value', '')});
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

    private mapToNames(src: string[], arr: INameValue[]): string[] {
        arr.forEach((v: INameValue) => {
            const idx: number = src.findIndex((srcValue: string) => srcValue === v.name);
            if (idx !== -1) {
                src[idx] = v.value;
            }
        });
        return src;
    }

    getTemplate(): string {
        return `
            <div class='${s["widget"]} ${w["widget"]}'>
                <h4>{{title}}</h4>
                <table class="${s['table']} ${s['w-100']} ${w['table']}">
                <thead>
                    <tr>
                        {{#header}}
                            <th class="${s['table-w-auto']}">
                                <div class="${w['title']}">{{.}}</div>
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
