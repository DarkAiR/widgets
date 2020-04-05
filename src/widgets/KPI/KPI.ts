import s from "../../styles/_all.less";
import w from "./KPI.less";
import {settings as widgetSettings} from "./settings";

// TODO: Удалить, когда выкинем кастомные стили
import * as _getFromLodash from 'lodash/get';
function _get<T>(settings: ISettings, path: string, def: T): T {
    console.log('%cKPI: Attempt to access custom parameter <%s>. Please rewrite your widget!', 'color: red', path);
    return _getFromLodash(settings, path, def);
}

import {IChartData, ISettings, IWidgetSettings, IWidgetVariables} from "../../interfaces";
import {Chart} from "../../models/Chart";
import {TypeGuardsHelper} from "../../helpers";

export class KPI extends Chart {
    getVariables(): IWidgetVariables {
        return {};
    }

    getSettings(): IWidgetSettings {
        return widgetSettings;
    }

    run(): void {
        const data: IChartData = this.chartData;

        if (TypeGuardsHelper.dataSetsIsDataSetTemplate(data.dataSets)) {
            const valueMainColor = this.getColor(data.dataSets[0].settings, 'color-yellow');
            const style1 = valueMainColor.colorStyle + _get(data.dataSets[0].settings, 'valueStyle', '');
            const backStyle = _get(data.dataSets[0].settings, 'globalSets', '');
            const titleStyle = _get(data.dataSets[0].settings, 'titleSets', '');

            const valueMain = (
                data.dataSets[0].settings.valueType !== undefined &&
                data.dataSets[0].settings.subValue !== undefined &&
                data.dataSets[0].settings.valueType === 'text'
            )
                ? _get(data.dataSets[0].settings, 'subValue', '')
                : _get(data.data[0], '[0].value', 0);

            let value2str = '';
            if (data.data[1] !== undefined) {
                const valueSub = (
                    data.dataSets[1].settings.valueType !== undefined &&
                    data.dataSets[1].settings.subValue !== undefined &&
                    data.dataSets[1].settings.valueType === 'text'
                )
                    ? _get(data.dataSets[1].settings, 'subValue', '')
                    : _get(data.data[1], '[0].value', 0);

                const valueSubColor = this.getColor(data.dataSets[1].settings, 'color-grey');
                const style2 = valueSubColor.colorStyle + _get(data.dataSets[1].settings, 'valueStyle', '');
                value2str = `
                    <div class='${w['sub']} ${w['text']} ${w[valueSubColor.className]} ${s["col-vbot"]}' style='${style2}'>
                        ${valueSub}
                    </div>
                `;
            }

            let tooltip = '';
            if (_get(data.dataSets[0].settings, 'enableTooltip', false)) {
                const tooltipText = _get(data.dataSets[0].settings, 'tooltipText', 'Привет!');
                const tooltipIcon = _get(data.dataSets[0].settings, 'tooltipIcon', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDQwLjEyNCA0MC4xMjQiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQwLjEyNCA0MC4xMjQ7IiB4bWw6c3BhY2U9InByZXNlcnZlIj48ZyB0cmFuc2Zvcm09Im1hdHJpeCgxIDQuODk4NTllLTE2IC00Ljg5ODU5ZS0xNiAxIDEuNzc2MzZlLTE0IC0xLjc3NjM2ZS0xNCkiPjxnPgoJPGc+CgkJPHBhdGggZD0iTTE5LjkzOCwxMi4xNDFjMS44NTYsMCwyLjk3MSwwLjk5LDIuOTcxLDIuNjZjMCwzLjAzMy01LjQxNCwzLjg2OS01LjQxNCw3LjU1YzAsMC45OSwwLjY0OCwyLjA3MiwxLjk3OSwyLjA3MiAgICBjMi4wNDIsMCwxLjc5NS0xLjUxNiwyLjUzOC0yLjZjMC45ODktMS40NTMsNS42LTMsNS42LTcuMDIzYzAtNC4zNjEtMy44OTctNi4xODgtNy44NTgtNi4xODhjLTMuNzczLDAtNy4yNCwyLjY5Mi03LjI0LDUuNzI1ICAgIGMwLDEuMjM3LDAuOTI5LDEuODg3LDIuMDEyLDEuODg3QzE3LjUyNSwxNi4yMjUsMTUuOTc5LDEyLjE0MSwxOS45MzgsMTIuMTQxeiIgZGF0YS1vcmlnaW5hbD0iIzAwMDAwMCIgY2xhc3M9ImFjdGl2ZS1wYXRoIiBzdHlsZT0iZmlsbDojQjRCNEI0IiBkYXRhLW9sZF9jb2xvcj0iIzAwMDAwMCI+PC9wYXRoPgoJCTxwYXRoIGQ9Ik0yMi4xMzUsMjguOTczYzAtMS4zOTMtMS4xNDUtMi41MzctMi41MzctMi41MzdzLTIuNTM3LDEuMTQ2LTIuNTM3LDIuNTM3YzAsMS4zOTMsMS4xNDUsMi41MzcsMi41MzcsMi41MzcgICAgUzIyLjEzNSwzMC4zNjYsMjIuMTM1LDI4Ljk3M3oiIGRhdGEtb3JpZ2luYWw9IiMwMDAwMDAiIGNsYXNzPSJhY3RpdmUtcGF0aCIgc3R5bGU9ImZpbGw6I0I0QjRCNCIgZGF0YS1vbGRfY29sb3I9IiMwMDAwMDAiPjwvcGF0aD4KCQk8cGF0aCBkPSJNNDAuMTI0LDIwLjA2MkM0MC4xMjQsOSwzMS4xMjQsMCwyMC4wNjIsMFMwLDksMCwyMC4wNjJzOSwyMC4wNjIsMjAuMDYyLDIwLjA2MlM0MC4xMjQsMzEuMTI1LDQwLjEyNCwyMC4wNjJ6IE0yLDIwLjA2MiAgICBDMiwxMC4xMDMsMTAuMTAzLDIsMjAuMDYyLDJjOS45NTksMCwxOC4wNjIsOC4xMDMsMTguMDYyLDE4LjA2MmMwLDkuOTU5LTguMTAzLDE4LjA2Mi0xOC4wNjIsMTguMDYyICAgIEMxMC4xMDMsMzguMTI0LDIsMzAuMDIxLDIsMjAuMDYyeiIgZGF0YS1vcmlnaW5hbD0iIzAwMDAwMCIgY2xhc3M9ImFjdGl2ZS1wYXRoIiBzdHlsZT0iZmlsbDojQjRCNEI0IiBkYXRhLW9sZF9jb2xvcj0iIzAwMDAwMCI+PC9wYXRoPgoJPC9nPgo8L2c+PC9nPiA8L3N2Zz4=');
                tooltip = `
                    <div class='${s["row"]}'>
                        <div class='${s["col"]}' style="text-align: end;">
                            <div class="${w["tooltip"]}" style="margin-bottom: 10px;margin-right: 10px;width: 15px;height: 15px" >
                                <img width="15px" height="15px" src='${tooltipIcon}' />
                                <span class="${w["tooltiptext"]}">${tooltipText}</span>
                            </div>
                        </div>
                    </div>
                `;
            }

            const str = `
                <div class='${s["widget"]} ${w["chart"]}' style='${backStyle}'>
                    <div class='${s["row"]}' style="height:fit-content;">
                        <div class='${s["col"]}'>
                            <div class="${w['title']}" style='${titleStyle}'>
                                ${this.getWidgetSetting(data.settings, 'title')}
                            </div>
                        </div>
                    </div>
                    <div class='${s["row"]}' style="align-self: flex-end;">
                        <div class='${s["col"]}'>
                            <div class='${w['main']} ${w['text']} ${w[valueMainColor.className]} ${s["col-vbot"]}'
                                 style='${style1}'>
                                ${valueMain}
                            </div>
                            ${value2str}
                        </div>
                        ${tooltip}
                    </div>
                </div>
            `;
            this.config.element.innerHTML = str;
        }
    }
}
