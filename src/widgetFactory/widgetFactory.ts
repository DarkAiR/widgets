import {IChartData, WidgetTemplate} from "../interfaces";
import {
    DataProvider,
    AverageNumberChart,
    SolidGaugeChart,
    SplineChart,
    IndicatorsTableChart,
} from "..";
import {WidgetConfig} from "../models/widgetConfig";

export class WidgetFactory {
    dataProvider: DataProvider = null;

    run(config: WidgetConfig): Promise<void> {
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
            return this.dataProvider
                .getTemplate(config.templateId)
                .then((template: WidgetTemplate) => {
                    return this.createWidget(config, template);
                });
        });
    }

    runWithSource(config: WidgetConfig, template: WidgetTemplate): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!config.element) {
                console.error('Required field "element" is not specified');
                reject();
            }
            resolve();
        }).then(() => {
            this.dataProvider = new DataProvider(config.apiUrl);
            return this.createWidget(config, template);
        })
    }

    private createWidget(config: WidgetConfig, template: WidgetTemplate): Promise<void> {
        return this.dataProvider.parseTemplate(template).then((data: IChartData) => {
            switch (template.widgetType) {
                // Сплайн
                case "SPLINE":
                    new SplineChart().run(config, data);
                    break;

                // Средние показатели за прошлый и позапрошлый интервал
                case "AVERAGE_NUMBER":
                    new AverageNumberChart().run(config, data);
                    break;

                // Индикатор в виде полукруга
                case "SOLID_GAUGE":
                    new SolidGaugeChart().run(config, data);
                    break;

                // Таблица разных индикаторов
                case "INDICATORS_TABLE":
                    new IndicatorsTableChart().run(config, data);
                    break;

                default:
                    console.error('Not supported');
                    break;
            }
        });
    }
}
