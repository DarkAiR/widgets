import {IChart, WidgetTemplate} from "../interfaces";
import {DataProvider} from "../dataProvider";
import * as widgets from "../widgets";
import {StatesHelper, WidgetConfig, WidgetConfigInner} from "..";
import { WidgetType } from '../types/types';
import {Chart} from "../models/Chart";
import {IWidgetSettings} from "../widgetSettings";
import { WidgetOptions } from '../models/widgetOptions';
import {RejectFunc, ResolveFunc} from "../types/promise";

declare var __VERSION__: string;

type WidgetsArr = Record<WidgetType, Function>;

export class WidgetFactory {
    dataProvider: DataProvider = null;

    static loadWidgetConfig(widgetType: WidgetType): Promise<IWidgetSettings> {
        type T = Promise<{settings: IWidgetSettings}>;
        const widgetTypeToImport: Record<WidgetType, () => T> = {
            'SPLINE':               () => import('../widgets/spline/settings'),
            'CATEGORY':             () => import('../widgets/category/settings'),
            'AVERAGE_NUMBER':       () => import('../widgets/averageNumber/settings'),
            'SOLID_GAUGE':          () => import('../widgets/solidGauge/settings'),
            'TABLE':                () => import('../widgets/table/settings'),
            'REPORT':               () => import('../widgets/report/settings'),
            'STATIC':               () => import('../widgets/static/settings'),
            'KPI':                  () => import('../widgets/KPI/settings'),
            'DISTRIBUTION':         () => import('../widgets/distribution/settings'),
            'PROFILE':              () => import('../widgets/profile/settings'),
            'PIE':                  () => import('../widgets/pie/settings'),
            "PRODUCTION_PLAN":      () => import('../widgets/productionPlan/settings'),
            "DISCIPLINE_REPORT":    () => import('../widgets/disciplineReport/settings')
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

    async run(config: WidgetConfig, options?: WidgetOptions): Promise<IChart> {
        if (!config.element) {
            throw new Error('Required field "element" is not specified');
        }
        if (!config.templateId) {
            throw new Error('Required field "templateId" is not specified');
        }
        if (!config.dataProvider) {
            this.dataProvider = new DataProvider(config.apiUrl);
            config.dataProvider = this.dataProvider;
        } else {
            this.dataProvider = config.dataProvider;
        }
        const template: WidgetTemplate = await this.dataProvider.getTemplate(config.templateId)
            .catch((e: Error) => { throw new Error(`Widget '${config.templateId}' not loaded`); });

        if (options?.logs?.loadingTemplate ?? true) {
            console.log('Load template', template);
        }

        const innerConfig: WidgetConfigInner = Object.assign(config, {
            template: template
        });
        return this.createWidget(innerConfig, options ?? {});
    }

    async runWithSource(config: WidgetConfig, template: WidgetTemplate, options?: WidgetOptions): Promise<IChart> {
        if (!config.element) {
            throw new Error('Required field "element" is not specified');
        }
        if (!config.dataProvider) {
            this.dataProvider = new DataProvider(config.apiUrl);
            config.dataProvider = this.dataProvider;
        } else {
            this.dataProvider = config.dataProvider;
        }
        const innerConfig: WidgetConfigInner = Object.assign(config, {
            template: template
        });
        return this.createWidget(innerConfig, options ?? {});
    }

    private async createWidget(config: WidgetConfigInner, options: WidgetOptions): Promise<IChart> {
        StatesHelper.clear();

        const widgetsArr: WidgetsArr = {
            "SPLINE":               () => widgets.Spline.Spline,
            "CATEGORY":             () => widgets.Category.Category,
            "AVERAGE_NUMBER":       () => widgets.AverageNumber.AverageNumber,
            "SOLID_GAUGE":          () => widgets.SolidGauge.SolidGauge,
            "TABLE":                () => widgets.Table.Table,
            "REPORT":               () => widgets.Report.Report,
            "STATIC":               () => widgets.Static.Static,
            "KPI":                  () => widgets.KPI.KPI,
            "DISTRIBUTION":         () => widgets.Distribution.Distribution,
            "PROFILE":              () => widgets.Profile.Profile,
            "PIE":                  () => widgets.Pie.Pie,
            "PRODUCTION_PLAN":      () => widgets.ProductionPlan.ProductionPlan,
            "DISCIPLINE_REPORT":    () => widgets.DisciplineReport.DisciplineReport,

        };
        if (!widgetsArr[config.template.widgetType]) {
            throw new Error(`Widget type <${config.template.widgetType}> not supported`);
        }
        const widget: Chart = new (widgetsArr[config.template.widgetType]())(config, options);
        widget.create();
        if (config.afterCreate) {
            // Здесь можно, нр, инициализировать переменные до первого рендера через EventBus
            await config.afterCreate(widget);
        }

        // И только когда отработал afterCreate, можно заканчивать инициализацию
        widget.initialized = true;

        // Это должна быть единственная перерисовка при инициализации
        await widget.redraw().catch((e: Error) => {
            throw e;
        });

        this.addVersion(config);
        return widget as IChart;
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
