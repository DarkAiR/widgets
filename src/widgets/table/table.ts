import s from "../../styles/_all.less";
import w from "./table.less";

import {
    DimensionUnit,
    IChartData,
    IWidgetVariables,
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

        console.log('points', points);
        console.log('dimensions', dimensions);

        // 1.       localDateTime
        // 2...N-1  dimensions
        // N        value
        const output = this.renderTemplate({
            dimensions,
            points
        });
        this.config.element.innerHTML = output;
    }

    getTemplate(): string {
        return `
            <div class='${s["widget"]}'>
                <table class="${s['table']} ${s['w-100']}">
                <thead>
                    <tr>
                        <th class="${s['table-w-auto']}">localDateTime</th>
                        {{#dimensions}}
                        <th>{{name}}</th>
                        {{/dimensions}}
                        <th class="${s['table-w-auto']}">value</th>
                    </tr>
                </thead>
                <tbody>
                    {{#points}}
                    <tr>
                        <td>{{localDateTime}}</td>
                        {{#dimensions}}
                        <td>{{value}}</td>
                        {{/dimensions}}
                        <td>{{value}}</td>
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
