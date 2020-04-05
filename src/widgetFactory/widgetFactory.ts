import {IChart, IChartData, RejectFunc, ResolveFunc, WidgetTemplate, IWidgetSettings} from "../interfaces";
import {DataProvider} from "../dataProvider";
import * as widgets from "../widgets";
import {WidgetConfig, WidgetConfigInner} from "..";
import { WidgetType } from '../models/types';
import {Chart} from "../models/Chart";

declare var __VERSION__: string;

type WidgetsArr = Record<WidgetType, Function>;

export class WidgetFactory {
    dataProvider: DataProvider = null;

    static loadWidgetConfig(widgetType: WidgetType): Promise<IWidgetSettings> {
        const widgetTypeToImport: Record<WidgetType, () => Promise<{settings: IWidgetSettings}>> = {
            'SPLINE':           () => import('../widgets/spline/settings'),
            'AVERAGE_NUMBER':   () => import('../widgets/averageNumber/settings'),
            'SOLID_GAUGE':      () => import('../widgets/solidGauge/settings'),
            'INDICATORS_TABLE': () => import('../widgets/indicatorsTable/settings'),
            'TABLE':            () => import('../widgets/table/settings'),
            'REPORT':           () => import('../widgets/report/settings'),
            'STATIC':           () => import('../widgets/static/settings'),
            'KPI':              () => import('../widgets/KPI/settings'),
            'AVATAR':           () => import('../widgets/avatar/settings'),
            'DISTRIBUTION':     () => import('../widgets/profileAndDistribution/settings'),
            'PROFILE':          () => import('../widgets/profileAndDistribution/settings'),
        };
        return new Promise((resolve: ResolveFunc, reject: RejectFunc) => {
            if (!widgetTypeToImport[widgetType]) {
                reject();
            }
            widgetTypeToImport[widgetType]().then(
                (v: {settings: IWidgetSettings}) => resolve(v.settings)
            ).catch(reject);
        });
    }

    run(config: WidgetConfig): Promise<IChart> {
        return new Promise((resolve: ResolveFunc, reject: RejectFunc) => {
            if (!config.element) {
                console.error('Required field "element" is not specified');
                reject();
            }
            if (!config.templateId) {
                console.error('Required field "templateId" is not specified');
                reject();
            }
            resolve();
        }).then(() => {
            this.dataProvider = new DataProvider(config.apiUrl);
            return new Promise<IChart>((resolve: ResolveFunc<IChart>) => {
                this.dataProvider
                    .getTemplate(config.templateId)
                    .then((template: WidgetTemplate) => {
                        const innerConfig: WidgetConfigInner = Object.assign(config, {
                            dataProvider: this.dataProvider,
                            template: template
                        });
                        this.createWidget(innerConfig, template).then((widget: IChart) => resolve(widget));
                    });
            });
        });
    }

    runWithSource(config: WidgetConfig, template: WidgetTemplate): Promise<IChart> {
        return new Promise((resolve: ResolveFunc, reject: RejectFunc) => {
            if (!config.element) {
                console.error('Required field "element" is not specified');
                reject();
            }
            resolve();
        }).then(() => {
            this.dataProvider = new DataProvider(config.apiUrl);
            const innerConfig: WidgetConfigInner = Object.assign(config, {
                dataProvider: this.dataProvider,
                template: template
            });
            return this.createWidget(innerConfig, template);
        });
    }

    private createWidget(config: WidgetConfigInner, template: WidgetTemplate): Promise<IChart> {
        const widgetsArr: WidgetsArr = {
            "SPLINE":           () => widgets.Spline.Spline,
            "AVERAGE_NUMBER":   () => widgets.AverageNumber.AverageNumber,
            "SOLID_GAUGE":      () => widgets.SolidGauge.SolidGauge,
            "INDICATORS_TABLE": () => widgets.IndicatorsTable.IndicatorsTable,
            "TABLE":            () => widgets.Table.Table,
            "REPORT":           () => widgets.Report.Report,
            "STATIC":           () => widgets.Static.Static,
            "KPI":              () => widgets.KPI.KPI,
            "AVATAR":           () => widgets.Avatar.Avatar,
            "PROFILE":          () => widgets.ProfileAndDistribution.ProfileAndDistribution,
            "DISTRIBUTION":     () => widgets.ProfileAndDistribution.ProfileAndDistribution

        };
        return new Promise<IChart>((resolve: ResolveFunc<IChart>, reject: RejectFunc) => {
            this.dataProvider.parseTemplate(template).then((data: IChartData) => {
                if (!widgetsArr[template.widgetType]) {
                    console.error('Not supported');
                    reject();
                }

                const widget: Chart = new (widgetsArr[template.widgetType]())(config);
                widget.create(data);
                this.addVersion(config);
                resolve(widget as IChart);
            }).catch((error: Error) => {
                // Ловим ошибку (например 500), чтобы виджеты не зависли в состоянии loading
                console.error(error);
                reject();
            });
        });
    }

    private addVersion(config: WidgetConfigInner): void {
        // if (process.env.NODE_ENV !== 'development') {
        //     return;
        // }
        const versionElement = document.createElement('div');

        config.element.style.position = 'relative';
        versionElement.style.position = 'absolute';
        versionElement.style.right = '0px';
        versionElement.style.top = '0px';
        versionElement.style.fontSize = '.5em';
        versionElement.style.opacity = '.4';
        versionElement.innerHTML = 'v' + __VERSION__;
        config.element.appendChild(versionElement);
    }
}
