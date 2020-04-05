import s from "../../styles/_all.less";
import w from "./avatar.less";
import {settings as widgetSettings} from "./settings";

import {IChart, IChartData, IWidgetSettings, IWidgetVariables} from "../../interfaces";
import {get as _get} from "lodash";
import {Chart} from "../../models/Chart";

export class Avatar extends Chart {
    getVariables(): IWidgetVariables {
        return {};
    }

    getSettings(): IWidgetSettings {
        return widgetSettings;
    }

    run(): void {
/**
         const data: IChartData = this.chartData;

        let fio;
        const fioColor = this.getColor(data.dataSets[0].settings, 'color-yellow');
        const fioStyle = fioColor.colorStyle + _get(data.dataSets[0].settings, 'fioStyle', '');
        const backStyle = _get(data.dataSets[0].settings, 'globalSets', '');

        if (data.dataSets[0].settings.valueType !== undefined && data.dataSets[0].settings.subValue !== undefined && data.dataSets[0].settings.valueType === 'text') {
            fio = _get(data.dataSets[0].settings, 'subValue', '');
        } else {
            fio = _get(data.data[0], '[0].value', 0);
        }

        if (_get(data.dataSets[0].settings, 'fioSplit', false) === true) {
            fio = fio.replace(' ', '<br>');
        }
        let func;
        let funcColor;
        let funcStyle;
        let funcStr = '';
        if (data.data[2] !== undefined) {

            if (data.dataSets[2].settings.valueType !== undefined && data.dataSets[2].settings.subValue !== undefined && data.dataSets[2].settings.valueType === 'text') {
                func = _get(data.dataSets[2].settings, 'subValue', '');
            } else {
                func = _get(data.data[2], '[0].value', 0);
            }

            funcColor = this.getColor(data.dataSets[2].settings, 'color-grey');
            funcStyle = funcColor.colorStyle + _get(data.dataSets[2].settings, 'funcStyle', '');



            funcStr = `
            <div class='${w['sub']} ${w['text']} ${w[funcColor.className]} ${s["col-vmid"]}'
                 style='${funcStyle}'>
                ${func}
            </div>
            `;
        }

        const str = `
            <div class='${s["col"]}' style="margin:0; padding: 0;width: fit-content">
                <div class='${w['main']} ${w['text']} ${w[fioColor.className]} ${s["col-vmid"]}'
                     style='${fioStyle}'>
                    ${fio}
                </div>
            ${funcStr}
            </div>
        `;
        let insider = '';

        if (data.data[1] !== undefined) {
            const photoPos = _get(data.dataSets[1].settings, 'position', 'top');

            let photoStr = '';
            const photoURL =  _get(data.dataSets[1].settings, 'photoURL', 'https://www.papertraildesign.com/wp-content/uploads/2018/03/Lego-head-3.png');
            const photoSize = _get(data.dataSets[1].settings, 'size', '50');
            const photoAlign = _get(data.dataSets[1].settings, 'align', 'unset');
            const photoStyle = 'width:' + photoSize + '; height:' + photoSize + '; border-radius: 50%;vertical-align:' + photoAlign + ';';
            const photoColWrapperStyle = "margin: 0; padding: 0;text-align:" + photoAlign + ";";
            const photoRawWrapperStyle = "display: inline-block;height: 100%;vertical-align:" + photoAlign + ";";

            switch (photoPos) {
                case 'bottom':
                    photoStr = `
                        <div class='${s["col"]}' style="margin: 0; padding: 0;" height="fit-content" width="fit-content">
                            ${str}
                            <div height="fit-content" width="100%" style='${photoColWrapperStyle}'>
                                <img src='${photoURL}' style='${photoStyle}'>
                            </div>
                        </div>
                    `;
                    break;
                case 'right':
                    photoStr = `
                        <div class='${s["row"]}' style="margin: 0; padding: 0;" height="fit-content" width="fit-content">
                            ${str}
                            <div height="100%" width="fit-content" style="margin: 0; padding: 0;">
                                <span style='${photoRawWrapperStyle}'></span>
                                <img src='${photoURL}' style='${photoStyle}'>
                            </div>
                        </div>
                    `;
                    break;
                case 'left':
                    photoStr = `
                        <div class='${s["row"]}' style="margin: 0; padding: 0;" height="fit-content" width="fit-content">
                            <div height="100%" width="fit-content" style="margin: 0; padding: 0;">
                                <span style='${photoRawWrapperStyle}'></span>
                                <img src='${photoURL}' style='${photoStyle}'>
                            </div>
                            ${str}
                        </div>
                    `;
                    break;
                default:
                    photoStr = `
                        <div class='${s["col"]}' style="margin: 0; padding: 0;" height="fit-content" width="fit-content">
                            <div height="fit-content" width="100%" style='${photoColWrapperStyle}'>
                                <img src='${photoURL}' style='${photoStyle}'>
                            </div>
                            ${str}
                        </div>
                    `;
                    break;
            }

            insider = photoStr;
        }

        const wrapper = `
            <div class='${s["widget"]}' style='${backStyle}'>
                ${insider}
            </div>
        `;

        this.config.element.innerHTML = wrapper;
*/
    }
}
