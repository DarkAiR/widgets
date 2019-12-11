import s from "../styles/_all.less";
import w from "./tableChart.less";

import {IChartData, IWidgetVariables} from "../interfaces";
import {TableSettings} from "./tableSettings";
import {get as _get, head as _head, forEach as _forEach} from "lodash";
import * as moment from 'moment';
import * as hammer from 'hammerjs';
import {Chart} from "../models/Chart";
import {TimeSeriesData, TimeSeriesHelper} from "../helpers/TimeSeries.helper";
import {TSPoint} from "../interfaces/template/TSPoint";

type MetricsStatus = 'normal' | 'warning' | 'error';

export class TableChart extends Chart {
    getVariables(): IWidgetVariables {
        return {};
    }

    run(data: IChartData): void {
        const settings = <TableSettings>data.settings;
        console.log('IndicatorsTableConfig settings: ', settings);

        const mc = hammer(this.config.element);

        let startOffs = 0;
        mc.get('pan').set({ direction: hammer.DIRECTION_HORIZONTAL });
        mc.on("panstart panleft panright", ev => {
            const contEl = _head(this.config.element.getElementsByClassName(w['cont']));
            switch (ev.type) {
                case 'panstart':
                    if (contEl.style.left === '') {
                        contEl.style.left = '0px';
                    }
                    startOffs = contEl ? parseInt(contEl.style.left, 10) : 0;
                    break;
                case 'panleft':
                case 'panright':
                    if (contEl) {
                        let newCoord = startOffs + ev.deltaX;
                        if (newCoord > 0) {
                            newCoord = 0;
                        }
                        let width = 0;
                        _forEach(contEl.children, v => { width += v.offsetWidth; });
                        if (newCoord + width < contEl.parentElement.offsetWidth) {
                            newCoord = contEl.parentElement.offsetWidth - width;
                        }
                        contEl.style.left = newCoord + 'px';
                    }
                    break;
            }
        });

        moment.locale('ru');

        // DataSets:
        // 1,2 value + %
        // 3,4 value + %
        // 5 +/- %
        // 6 bit fields

        let widgetHtml = '';
        const dataSet1 = _get(data.data, '0', null);
        const dataSet2 = _get(data.data, '1', null);
        const dataSet3 = _get(data.data, '2', null);
        const dataSet4 = _get(data.data, '3', null);
        const dataSet5 = _get(data.data, '4', null);
        const dataSet6 = _get(data.data, '5', null);

        const timeSeriesData: TimeSeriesData = TimeSeriesHelper.convertTimeSeriesToData(data.data as TSPoint[][]);

        for (const idx in timeSeriesData.dates) {
            if (!timeSeriesData.dates.hasOwnProperty(idx)) {
                continue;
            }
            let status: MetricsStatus = 'normal';
            let blockHtml = `
                <div class="${w['series1']}">`;
            if (dataSet1 !== null && dataSet2 !== null) {
                // объем проданного топлива за день, литры
                // выполнение плана по проданному топливу за день, в %
                const percents = 100 + (dataSet2[idx].value - 15);
                blockHtml += `${dataSet1[idx].value} тыс.л (${percents}%)`;
                status = this.getMetricsStatus(status, percents);
            }
            blockHtml += `
                </div>
                <div class="${w['series2']}">`;
            if (dataSet3 !== null && dataSet4 !== null) {
                // выручка с НТУ за день
                // выполнение плана по выручке с НТУ за день, в %
                const percents = 100 + (dataSet4[idx].value - 10);
                blockHtml += `${dataSet3[idx].value} тыс.₽ (${percents}%)`;
                status = this.getMetricsStatus(status, percents);
            }
            blockHtml += `
                </div>
                <div class="${w['percents']}">`;
            if (dataSet5 !== null) {
                // отклонение трафика от прогноза трафика, в %
                const percents = dataSet5[idx].value - 10;

                // Получаем локальный статус только для этого индикатора и красим его отдельно
                const localStatus: MetricsStatus = percents >= 0 ? 'normal' : 'error';
                if (localStatus === 'error') {
                    status = 'error';
                }
                const className = localStatus !== 'normal'
                    ? w[localStatus]
                    : w[localStatus] + (percents === 0 ? '' : ' ' + w['green']);

                const percentsStr = percents > 0
                    ? `+${percents}%`
                    : (percents === 0
                        ? '-'
                        : `${percents}%`
                    );
                blockHtml += `
                    <span class="${className}">
                        ${percentsStr}
                    </span>`;
            }
            if (dataSet6 !== null) {
                blockHtml += `
                    </div>
                    <div class="${w['icons']}">`;
                if (this.checkBit(dataSet6[idx].value, 0)) {
                    blockHtml += `<span class="mdi mdi-clock-alert-outline ${s['size-20']} ${s['color-yellow']}"></span>`;
                }
                if (this.checkBit(dataSet6[idx].value, 1)) {
                    blockHtml += `<span class="mdi mdi-run-fast ${s['size-20']} ${s['color-blue']}"></span>`;
                }
                if (this.checkBit(dataSet6[idx].value, 2)) {
                    blockHtml += `<span class="mdi mdi-account-plus ${s['size-20']} ${s['color-green']}"></span>`;
                }
                if (this.checkBit(dataSet6[idx].value, 3)) {
                    blockHtml += `<span class="mdi mdi-account-remove ${s['size-20']} ${s['color-red']}"></span>`;
                }
            }
            blockHtml += `
                </div>`;

            widgetHtml += `
                <div class="${w['block']}">
                    <div class="${w['inner-block']}">
                        <div class="${w['title']} ${w[status]}">${moment(timeSeriesData.dates[idx]).format('D MMMM')}</div>
                        ${blockHtml}
                    </div>
                </div>
            `;
        }

        const str = `
            <div class='${s["widget"]}'>
                <div class="${w['cont']}">
                    ${widgetHtml}
                </div>
            </div>
        `;
        this.config.element.innerHTML = str;
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
