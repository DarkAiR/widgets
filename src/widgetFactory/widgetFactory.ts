import {IChart, IChartData, RejectFunc, ResolveFunc, WidgetTemplate} from "../interfaces";
import {DataProvider} from "../dataProvider";
import * as widgets from "../widgets";
import {StatesHelper, WidgetConfig, WidgetConfigInner} from "..";
import { WidgetType } from '../models/types';
import {Chart} from "../models/Chart";
import {IWidgetSettings} from "../widgetSettings";

declare var __VERSION__: string;

type WidgetsArr = Record<WidgetType, Function>;

export class WidgetFactory {
    dataProvider: DataProvider = null;

    static loadWidgetConfig(widgetType: WidgetType): Promise<IWidgetSettings> {
        type T = Promise<{settings: IWidgetSettings}>;
        const widgetTypeToImport: Record<WidgetType, () => T> = {
            'SPLINE':           () => import('../widgets/spline/settings'),
            'AVERAGE_NUMBER':   () => import('../widgets/averageNumber/settings'),
            'SOLID_GAUGE':      () => import('../widgets/solidGauge/settings'),
            'INDICATORS_TABLE': () => import('../widgets/indicatorsTable/settings'),
            'TABLE':            () => import('../widgets/table/settings'),
            'REPORT':           () => import('../widgets/report/settings'),
            'STATIC':           () => import('../widgets/static/settings'),
            'KPI':              () => import('../widgets/KPI/settings'),
            'DISTRIBUTION':     () => import('../widgets/distribution/settings'),
            'PROFILE':          () => import('../widgets/profile/settings'),
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
        StatesHelper.clear();

        const widgetsArr: WidgetsArr = {
            "SPLINE":           () => widgets.Spline.Spline,
            "AVERAGE_NUMBER":   () => widgets.AverageNumber.AverageNumber,
            "SOLID_GAUGE":      () => widgets.SolidGauge.SolidGauge,
            "INDICATORS_TABLE": () => widgets.IndicatorsTable.IndicatorsTable,
            "TABLE":            () => widgets.Table.Table,
            "REPORT":           () => widgets.Report.Report,
            "STATIC":           () => widgets.Static.Static,
            "KPI":              () => widgets.KPI.KPI,
            "PROFILE":          () => widgets.Profile.Profile,
            "DISTRIBUTION":     () => widgets.Distribution.Distribution

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
        const versionElement = document.createElement('div');

        config.element.style.position = 'relative';
        versionElement.style.position = 'absolute';
        versionElement.style.right = '0px';
        versionElement.style.top = '0px';
        versionElement.style.fontSize = '.5em';
        versionElement.style.opacity = '.4';
        if (process.env.NODE_ENV !== 'development') {
            versionElement.style.opacity = '.0';
        }
        versionElement.innerHTML = 'v' + __VERSION__;
        config.element.appendChild(versionElement);
    }
}
