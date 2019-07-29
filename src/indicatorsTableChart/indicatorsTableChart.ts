import s from "../styles/_all.less";
import w from "./indicatorsTableChart.less";

import {IChart, IChartData} from "../interfaces";
import {IndicatorsTableConfig} from "./indicatorsTableConfig";
import {get as _get, head as _head, forEach as _forEach} from "lodash";
import * as moment from 'moment';
import * as hammer from 'hammerjs';
import {Chart} from "../models/Chart";
import {TimeSeriesHelper} from "../helpers/TimeSeries.helper";

export class IndicatorsTableChart extends Chart implements IChart {
    run(config: IndicatorsTableConfig, data: IChartData): void {
        const mc = hammer(config.element);

        let startOffs = 0;
        mc.get('pan').set({ direction: hammer.DIRECTION_HORIZONTAL });
        mc.on("panstart panleft panright", ev => {
            const contEl = _head(config.element.getElementsByClassName(w['cont']));
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

        let widgetHtml = '';
        const dataSet1 = _get(data.data, '0', null);
        const dataSet2 = _get(data.data, '1', null);
        const dataSet3 = _get(data.data, '2', null);

        const timeSeriesData = TimeSeriesHelper.convertTimeSeriesToData(data.data);

        for (let idx in timeSeriesData.dates) {
            widgetHtml += `
                <div class="${w['block']}">
                    <div class="${w['inner-block']}">
                        <div class="${w['title']}">${moment(timeSeriesData.dates[idx]).format('D MMMM')}</div>
                        <div class="${w['series1']}">`;
            if (dataSet1 !== null) {
                const rnd = Math.ceil(Math.random()*30 + 70);
                widgetHtml += `${dataSet1.values[idx].value} тыс.л (${rnd}%)`;
            }
            widgetHtml += `
                        </div>
                        <div class="${w['series2']}">`;
            if (dataSet2 !== null) {
                const rnd = Math.ceil(Math.random()*50 + 75);
                widgetHtml += `${dataSet2.values[idx].value} тыс.₽ (${rnd}%)`;
            }
            widgetHtml += `
                        </div>
                        <div class="${w['percents']}">`;
            if (dataSet3 !== null) {
                const rnd = Math.random();
                if (rnd < 0.33) {
                    widgetHtml += `-`;
                } else if (rnd < 0.66) {
                    widgetHtml += `<span class="${s['color-green']}">+${dataSet3.values[idx].value}%</span>`;
                } else {
                    widgetHtml += `<span class="${s['color-red']}">-${dataSet3.values[idx].value}%</span>`;
                }
            }
            widgetHtml += `
                        </div>
                        <div class="${w['icons']}">
                            <span class="icon-clock-alert-outline ${s['size-20']} ${s['color-yellow']}"></span>
                            <span class="icon-run-fast ${s['size-20']} ${s['color-blue']}"></span>
                            <span class="icon-account-plus ${s['size-20']} ${s['color-green']}"></span>
                            <span class="icon-account-remove ${s['size-20']} ${s['color-red']}"></span>
                        </div>
                    </div>
                </div>`;
        }

        const str = `
            <div class='${s["widget"]}'>
                <div class="${w['cont']}">
                    ${widgetHtml}
                </div>
            </div>
        `;
        config.element.innerHTML = str;
    }
}
