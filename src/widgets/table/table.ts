import s from "../../styles/_all.less";
import w from "./table.less";

import {
    DimensionFilter,
    DimensionUnit,
    IChartData,
    IWidgetVariables, MetricUnit, SingleDataSource,
    TSPoint
} from "../../interfaces";
import {TableSettings} from "./tableSettings";
import {get as _get, head as _head, forEach as _forEach} from "lodash";
import {Chart} from "../../models/Chart";

type MetricsStatus = 'normal' | 'warning' | 'error';

export class Table extends Chart {
    getVariables(): IWidgetVariables {
        return {};
    }

    run(data: IChartData): void {
        const settings = <TableSettings>data.settings;
        console.log('TableConfig settings: ', settings);

        const dataByDataSources: TSPoint[][] = data.data as TSPoint[][];

        // FIXME: Берем только первый источник, а надо все
        const points: TSPoint[] = _get(dataByDataSources, 0, []);
        const dimensions: DimensionUnit[] = _get(points, '0.dimensions', []);
        const metrics: MetricUnit[] = _get(points, '0.metrics', []);

        console.log('points', points);
        console.log('dimensions', dimensions);

        // Конвертируем даты
        _forEach(points, (v: TSPoint) => {
            v.localDateTime = new Date(v.localDateTime).toLocaleDateString();
        });

        // 1.       localDateTime
        // 2...N-1  dimensions
        // N        value
        this.config.element.innerHTML = this.renderTemplate({
            title: settings.title,
            dimensions,
            metrics,
            points
        });
    }

    getTemplate(): string {
        return `
            <div class='${s["widget"]}'>
                <h4>{{title}}</h4>
                <table class="${s['table']} ${s['w-100']}">
                <thead>
                    <tr>
                        <th class="${s['table-w-auto']}">
                            <div class="${w['title']}">localDateTime</div>
                        </th>
                        {{#dimensions}}
                            <th>
                                <div class="${w['title']}">{{name}}</div>
                            </th>
                        {{/dimensions}}
                        {{#metrics}}
                            <th class="${s['table-w-auto']}">
                                <div class="${w['title']}">{{name}}</div>
                            </th>
                        {{/metrics}}
                    </tr>
                </thead>
                <tbody>
                    {{#points}}
                    <tr>
                        <td>{{localDateTime}}</td>
                        {{#dimensions}}
                            <td>{{value}}</td>
                        {{/dimensions}}
                        {{#metrics}}
                            <td>{{value}}</td>
                        {{/metrics}}
                    </tr>
                    {{/points}}
                </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Устанавливает общий статус исходя из процентов
     * @param status предыдущий статус
     * @param percents значение в процентах
     */
    private getMetricsStatus(status: MetricsStatus, percents: number): MetricsStatus {
        // пороги индикации для показателей
        const tmpStatus = percents < 80
            ? 'error'
            : (percents < 90
                ? 'warning'
                : 'normal'
            );
        // console.log('getMetricsStatus', percents, tmpStatus);
        if (tmpStatus === 'error') {
            return 'error';
        }
        if (tmpStatus === 'warning' && status !== 'error') {
            return 'warning';
        }
        if (tmpStatus === 'normal' && status === 'normal') {
            return 'normal';
        }
        return status;
    }

    private checkBit(v: number, bitPos: number): boolean {
        return (v & (2 ** bitPos)) !== 0;
    }
}
