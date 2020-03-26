import {IChart, IChartData, JoinDataSetTemplate, RejectFunc, ResolveFunc, WidgetTemplate, IWidgetConfigurationDescription} from "../interfaces";
import {DataProvider} from "../dataProvider";
import * as widgets from "../widgets";
import {WidgetConfig, WidgetConfigInner} from "../models/widgetConfig";
import { WidgetType } from '../models/types';

declare var __VERSION__: string;

type WidgetsArr = Record<WidgetType, Function>;

export class WidgetFactory {
    dataProvider: DataProvider = null;

    static loadWidgetConfig(widgetType: WidgetType): Promise<IWidgetConfigurationDescription> {
        const widgetTypeToImport: Record<WidgetType, () => Promise<{config: IWidgetConfigurationDescription}>> = {
            'SPLINE':           () => import('./../widgets/spline/config'),
            'AVERAGE_NUMBER':   () => import('./../widgets/averageNumber/config'),
            'SOLID_GAUGE':      () => import('./../widgets/solidGauge/config'),
            'INDICATORS_TABLE': () => import('./../widgets/indicatorsTable/config'),
            'TABLE':            () => import('./../widgets/table/config'),
            'REPORT':           () => import('./../widgets/report/config'),
            'STATIC':           () => import('./../widgets/static/config'),
            'KPI':              () => import('./../widgets/KPI/config'),
            'AVATAR':           () => import('./../widgets/avatar/config'),
            'DISTRIBUTION':     () => import('./../widgets/profileAndDistribution/config'),
            'PROFILE':          () => import('./../widgets/profileAndDistribution/config'),
        };
        return new Promise((resolve: ResolveFunc, reject: RejectFunc) => {
            if (!widgetTypeToImport[widgetType]) {
                reject();
            }
            widgetTypeToImport[widgetType]().then(
                (v: {config: IWidgetConfigurationDescription}) => resolve(v.config)
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
                        this.fixTemplate(template);

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
        this.fixTemplate(template);

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
        const promise = new Promise<IChart>((resolve: ResolveFunc<IChart>, reject: RejectFunc) => {
            this.dataProvider.parseTemplate(template).then((data: IChartData) => {
                let widget: IChart = null;
                if (!widgetsArr[template.widgetType]) {
                    console.error('Not supported');
                    reject();
                }

                widget = new (widgetsArr[template.widgetType]())(config);
                widget.run(data);
                // if (process.env.NODE_ENV === 'development') {
                this.addVersion(config);
                // }
                resolve(widget);
            }).catch((error: Error) => {
                // Ловим ошибку (например 500), чтобы виджеты не зависли в состоянии loading
                console.error(error);
                reject();
            });
        });
        return promise;
    }

    /**
     * Исправление входных данных виджета, т.к. бек не всегда хранит то, что надо
     */
    private fixTemplate(template: WidgetTemplate): void {
        if (template.widgetType === 'TABLE') {
            // FIXME: Удалить, когда viewType появится в JoinDataSetTemplate
            template.dataSets.forEach((dataSet: JoinDataSetTemplate) => {
                dataSet.viewType = template.viewType;       // Добавляем viewType в dataSet
            });
        }
    }

    private addVersion(config: WidgetConfigInner): void {
        const versionElement = document.createElement('div');

        config.element.style.position = 'relative';
        versionElement.style.position = 'absolute';
        versionElement.style.right = '0px';
        versionElement.style.bottom = '0px';
        versionElement.style.fontSize = '.5em';
        versionElement.style.opacity = '.4';
        versionElement.innerHTML = 'v' + __VERSION__;
        config.element.appendChild(versionElement);
    }
}
