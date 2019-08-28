import {IChartData, WidgetTemplate} from "../interfaces";
import {
    DataProvider,
    AverageNumberSettings,
    AverageNumberChart,
    SolidGaugeChart,
    SolidGaugeSettings,
    SplineChart,
    SplineSettings,
    IndicatorsTableChart,
    IndicatorsTableSettings
} from "..";
import {WidgetConfig} from "../models/widgetConfig";

export class WidgetFactory {
    dataProvider: DataProvider = new DataProvider();

    run(config: WidgetConfig): void {
        if (!config.element) {
            console.error('Required field "element" is not specified');
            return;
        }
        if (!config.templateId) {
            console.error('Required field "templateId" is not specified');
            return;
        }

        this.dataProvider.getTemplate(config.templateId).then((template: WidgetTemplate) => {
            this.dataProvider.parseTemplate(template).then((data: IChartData) => {
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
        });
    }
}
