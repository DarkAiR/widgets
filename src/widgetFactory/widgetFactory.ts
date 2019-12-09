import {IChart, IChartData, WidgetTemplate} from "../interfaces";
import {
    DataProvider,
    AverageNumberChart,
    SolidGaugeChart,
    SplineChart,
    IndicatorsTableChart,
    ReportChart,
    StaticChart
} from "..";
import {WidgetConfig, WidgetConfigInner} from "../models/widgetConfig";

declare var __VERSION__: string;

export class WidgetFactory {
    dataProvider: DataProvider = null;

    run(config: WidgetConfig): Promise<IChart> {
        return new Promise((resolve, reject) => {
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
            return new Promise<IChart>((resolve) => {
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
        return new Promise((resolve, reject) => {
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
        const promise = new Promise<IChart>((resolve) => {
            this.dataProvider.parseTemplate(template).then((data: IChartData) => {
                let widget: IChart = null;
                switch (template.widgetType) {
                    // Сплайн
                    case "SPLINE":
                        widget = new SplineChart(config);
                        break;

                    // Средние показатели за прошлый и позапрошлый интервал
                    case "AVERAGE_NUMBER":
                        widget = new AverageNumberChart(config);
                        break;

                    // Индикатор в виде полукруга
                    case "SOLID_GAUGE":
                        widget = new SolidGaugeChart(config);
                        break;

                    // Таблица разных индикаторов
                    case "INDICATORS_TABLE":
                        widget = new IndicatorsTableChart(config);
                        break;

                    case "REPORT":
                        widget = new ReportChart(config);
                        break;

                    case "STATIC":
                        widget = new StaticChart(config);
                        break;

                    default:
                        console.error('Not supported');
                        break;
                }
                if (widget) {
                    widget.run(data);
                    // if (process.env.NODE_ENV === 'development') {
                    this.addVersion(config);
                    // }
                    resolve(widget);
                }
            });
        });
        return promise;
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
