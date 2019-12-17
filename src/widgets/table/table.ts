import s from "../../styles/_all.less";
import w from "./table.less";

import {DimensionFilter, IChartData, IWidgetVariables, SingleDataSource} from "../../interfaces";
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

        const dataSource: SingleDataSource = (data.dataSets[0].dataSource1 as SingleDataSource);
        const dimensions: string[] = [];
        _forEach(
            dataSource.dimensions,
            (v: DimensionFilter) => {
                dimensions.push(v.name);
            });

        this.template({
            template: `
                <div class="${w['cont']}">
                    <div :for="dimensionName in this.dimensions" class="${w['block']}">
                        <div class="${w['inner-block']}">
                            {dimensionName}
                        </div>
                    </div>
                    <div class="${w['block']}">
                        <div class="${w['inner-block']}">
                            ${dataSource.name} : ${dataSource.metric.name}
                        </div>
                    </div>
                </div>
            `,
            data: {
                dimensions
            }
        });
        return;
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
