import s from "../../styles/_all.less";
import w from "./table.less";
import {config as widgetConfig} from "./config";

import {
    IChartData, INameValue,
    IWidgetVariables, JoinDataSetTemplate, TableRow, TimeSeriesDataSetShort
} from "../../interfaces";
import {TableSettings} from "./tableSettings";
import * as _get from "lodash/get";
import * as _map from "lodash/map";
import * as _keyBy from "lodash/keyBy";
import {Chart} from "../../models/Chart";
import {TypeGuardsHelper} from "../../helpers";

export class Table extends Chart {
    getVariables(): IWidgetVariables {
        return {};
    }

    run(data: IChartData): void {
        const settings = <TableSettings>data.settings;
        console.log('TableConfig settings: ', settings);

        const dataByDataSources: TableRow[][] = data.data as TableRow[][];

        // NOTE: Для таблицы существует только один источник, если его нет, то это Exception
        const points: TableRow[] = dataByDataSources[0];
        const dimensions: string[] = _map((data.dataSets[0] as JoinDataSetTemplate).dimensions, 'name');
        const metrics: string[] = (data.dataSets[0] as JoinDataSetTemplate).dataSetTemplates.map(
            (v: TimeSeriesDataSetShort) => {
                if (TypeGuardsHelper.isSingleDataSource(v.dataSource1)) {
                    return v.dataSource1.metric.name;
                }
                return '';
            }
        );

        // Готовим данные, формируем общий список метрик
        const header: string[] = [
            'Date',
            ...dimensions,
            ...metrics
        ];
        const rows: Array<{cols: INameValue<string>[]}> = points.map((v: TableRow) => {
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
            title: this.getWidgetSetting(widgetConfig, settings, 'title'),
            header,
            rows
        });
    }

    getTemplate(): string {
        return `
            <div class='${s["widget"]}'>
                <h4>{{title}}</h4>
                <table class="${s['table']} ${s['w-100']}">
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
