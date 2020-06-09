import s from '../../styles/_all.less';
import w from './static.less';
import {settings as widgetSettings} from "./settings";

import echarts from 'echarts';
import {
    DataSetTemplate,
    IChartData, IColor, IEventOrgUnits, ISettings,
    IWidgetVariables, XAxisData, YAxisData,
} from '../../interfaces';
import {Chart} from '../../models/Chart';
import {Point} from '../../interfaces';
import {IWidgetSettings} from "../../widgetSettings";
import {OrgUnitsHelper, SettingsHelper, TypeGuardsHelper} from "../../helpers";

export class Static extends Chart {
    getVariables(): IWidgetVariables {
        const res: IWidgetVariables = {};
        const addVar = this.addVar(res);

        addVar(0, 'org units', 'OrgUnits', 'Выбирается в отдельном виджете');

        return res;
    }

    getSettings(): IWidgetSettings {
        return widgetSettings;
    }

    run(): void {
        const data: IChartData = this.chartData;

        const series: Object[] = this.getSeries(data.data as Point[][]);

        const xAxisData = this.getXAxis();
        const yAxisData = this.getYAxis();

        const legend: Object = SettingsHelper.getLegendSettings(this.widgetSettings.settings, this.chartData.settings);

        const options = {
            grid: {
                top: +this.getWidgetSetting('chartPaddings.top'),
                bottom: +this.getWidgetSetting('chartPaddings.bottom'),
                right: +this.getWidgetSetting('chartPaddings.right'),
                left: +this.getWidgetSetting('chartPaddings.left'),
                containLabel: true
            },
            legend: legend,
            xAxis: xAxisData,
            yAxis: yAxisData,
            series: series
        };

        console.groupCollapsed('Static eChart options');
        console.log(options);
        console.log(JSON.stringify(options));
        console.groupEnd();

        const titleSettings = SettingsHelper.getTitleSettings(this.widgetSettings.settings, this.chartData.settings);

        this.config.element.innerHTML = this.renderTemplate({
            showTitle: titleSettings.show,
            title: titleSettings.name,
            titleStyle: titleSettings.style,
            backgroundStyle: SettingsHelper.getBackgroundStyle(this.getWidgetSetting('backgroundColor')),
            paddingStyle: SettingsHelper.getPaddingStyle(this.getWidgetSetting('paddings'))
        });

        const el = this.config.element.getElementsByClassName(w['chart'])[0];
        const myChart = echarts.init(el);
        myChart.setOption(options);

        this.onResize = (width: number, height: number) => {
            myChart.resize();
        };
        this.onEventBus = this.onEventBusFunc.bind(this);
    }

    private getSeries(data: Point[][]): Object[] {
        const series: ISettings[] = [];
        const dataSetSettings: ISettings = this.chartData.dataSets[0].settings;
        const color: IColor = this.getColor(dataSetSettings, 'color-yellow');

        data.forEach((item: Point[]) => {
            const label: ISettings = SettingsHelper.getLabelSettings(this.widgetSettings.dataSet.settings, dataSetSettings);
            label.label.position = 'top';

            const seriesData = {
                name: this.getDataSetSettings<string>(dataSetSettings, 'name') || ' ',     // Чтобы чтото отобразилось, нужно хотя бы пробел
                color: color.hex,                   // Основной цвет
                itemStyle: {
                    opacity: color.opacity          // Прозрачность влияет на весь подписи + метки
                },
                emphasis: label,
                symbolSize: this.getDataSetSettings(dataSetSettings, 'symbolSize'),
                data: [],
                type: "scatter"
            };
            item.forEach((obj: Point) => {
                const pair = [obj.xValue, obj.yValue];
                seriesData.data.push(pair);
            });

            series.push(seriesData);
        });

        return series;
    }

    /**
     * Получить данные для осей
     */
    private getXAxis(): Object {
        const axisData: XAxisData = {
            show: this.getWidgetSetting('axisX.show'),
            name: this.getWidgetSetting('axisX.name'),
            nameGap: this.getWidgetSetting('axisX.nameGap'),
            nameColor: this.getWidgetSetting('axisX.nameColor'),
            color: this.getWidgetSetting('axisX.color'),
            position: this.getWidgetSetting('axisX.position'),
            axesToIndex: [],
            showTick: this.getWidgetSetting('axisX.showTick'),
        };

        const res = SettingsHelper.getXAxisSettings(
            axisData,
            0,
            'value',
            null,
            0,
            false,
            false
        );
        // res.data = xAxisValues;
        return res;
    }

    /**
     * Получить данные для осей
     */
    private getYAxis(): Object {
        const dataSetSettings: ISettings = this.chartData.dataSets[0].settings;
        let color: string = this.getWidgetSetting('axisY.color');
        if (!color) {
            // Получаем цвет из цвета графика
            color = this.getDataSetSettings(dataSetSettings, 'color');
        }

        const axisData: YAxisData = {
            show: this.getWidgetSetting('axisY.show'),
            name: this.getWidgetSetting('axisY.name'),
            nameGap: this.getWidgetSetting('axisY.nameGap'),
            nameColor: this.getWidgetSetting('axisY.nameColor'),
            color: color,
            position: this.getWidgetSetting('axisY.position'),
            axesToIndex: [],
            showTick: this.getWidgetSetting('axisY.showTick')
        };

        let nameRotate = 0;
        switch (axisData.position) {
            case 'left':
                nameRotate = 90;
                break;
            case 'right':
                nameRotate = 270;
                break;
        }

        return SettingsHelper.getYAxisSettings(
            axisData,
            0,
            0,
            nameRotate
        );
    }

    /**
     * Обработка событий
     * NOTE: все данные меняются в this.config.template
     */
    // tslint:disable-next-line:no-any
    private onEventBusFunc(varName: string, value: any, dataSourceId: number): boolean {
        console.groupCollapsed('Static EventBus data');
        console.log(varName, '=', value);
        console.log('dataSourceId =', dataSourceId);
        console.groupEnd();

        let needReload = false;
        switch (varName) {
            case 'org units':
                if (TypeGuardsHelper.everyIsDataSetTemplate(this.config.template.dataSets)) {
                    this.config.template.dataSets.forEach((v: DataSetTemplate) => {
                        if (OrgUnitsHelper.setOrgUnits(v.dataSource1, value as IEventOrgUnits)) {
                            needReload = true;
                        }
                    });
                }
                break;
        }
        return needReload;
    }

    getTemplate(): string {
        return `
            <div class='${s['widget']}  ${w['widget']}' style="{{backgroundStyle}} {{paddingStyle}}">
                {{#showTitle}}
                <div class='${w['row']}'>
                    <div class="${w['title']}" style="{{titleStyle}}">
                        {{title}}
                    </div>
                </div>
                {{/showTitle}}

                <div class='${w['row']} ${w['chart']}'>
                </div>
            </div>
        `;
    }
}
