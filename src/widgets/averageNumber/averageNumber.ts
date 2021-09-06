import widgetStyles from "./averageNumber.less";
import {settings as widgetSettings} from "./settings";

import {IChartData, ISettings, IWidgetVariables} from "../../interfaces";
import {get as _get} from "lodash";
import {Chart} from "../../models/Chart";
import {SettingsHelper, TypeGuardsHelper} from "../../helpers";
import {IWidgetSettings} from "../../widgetSettings";

export class AverageNumber extends Chart {
    getVariables(): IWidgetVariables {
        return {};
    }

    getSettings(): IWidgetSettings {
        return widgetSettings;
    }

    getStyles(): ISettings {
        return widgetStyles;
    }

    run(): void {
        const data: IChartData = this.chartData;

        if (TypeGuardsHelper.everyIsDataSetTemplate(data.dataSets)) {
            const currColor: string = this.getDataSetSettings(0, 'color');
            const prevColor: string = this.getDataSetSettings(1, 'color');
            const titleSettings = SettingsHelper.getTitleSettings(this.widgetSettings.settings, this.chartData.settings);

            this.config.element.innerHTML = this.renderTemplate({
                backgroundStyle: SettingsHelper.getBackgroundStyle(this.getWidgetSetting('background.color')),
                showTitle: titleSettings.show,
                title: titleSettings.name,
                titleStyle: titleSettings.style,
                currValue: _get(data.data[0], '[0].value', 0),
                currStyle: currColor ? `color: ${currColor}` : '',
                prevValue: _get(data.data[1], '[0].value', 0),
                prevStyle: prevColor ? `color: ${prevColor}` : '',
            });
        }
    }

    getTemplate(): string {
        return `
            <td class="widget" style="{{backgroundStyle}}">
                {{#showTitle}}
                <div class="title" style="{{titleStyle}}">
                    {{title}}
                </div>
                {{/showTitle}}
                
                <table class="table"><tbody>
                    <tr>
                        <td class="curr num" style="{{currStyle}}">{{currValue}}</td>
                        <td class="prev num" style="{{prevStyle}}">{{prevValue}}</td>
                    </tr>
                    <tr>
                        <td class="curr text" style="{{currStyle}}">Текущие</td>
                        <td class="prev text" style="{{prevStyle}}">Предыдущие</td>
                    </tr>
                </tbody></table>
            </div>
        `;
    }
}
