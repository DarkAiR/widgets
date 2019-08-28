import {IChartData, IWidgetConfig} from "../interfaces";
import {
    DataProvider,
    AverageNumberConfig,
    AverageNumberChart,
    SolidGaugeChart,
    SolidGaugeConfig,
    SplineChart,
    SplineConfig,
    IndicatorsTableChart,
    IndicatorsTableConfig
} from "..";

export class WidgetFactory {
    dataProvider: DataProvider = new DataProvider();

    run(config: IWidgetConfig): void {
        if (!config.element) {
            console.error('Required field "element" is not specified');
            return;
        }
        if (!config.templateId) {
            console.error('Required field "templateId" is not specified');
            return;
        }

        if (config instanceof AverageNumberConfig) {
            // Средние показатели за прошлый и позапрошлый интервал
            this.averageNumberChart(config);
        } else
        if (config instanceof SolidGaugeConfig) {
            // Индикатор в виде полукруга
            this.solidGaugeChart(config);
        } else
        if (config instanceof SplineConfig) {
            // Сплайн
            this.splineChart(config);
        } else
        if (config instanceof IndicatorsTableConfig) {
            // Таблица разных индикаторов
            this.indicatorsTableChart(config);
        } else {
            console.error('Not supported');
        }
    }

    /**
     * Средние показатели за прошлый и позапрошлый интервал
     */
    private averageNumberChart(config: AverageNumberConfig): void {
        this.dataProvider.getData(config).then((data: IChartData) => {
            new AverageNumberChart().run(config, data);
        });
    }

    /**
     * Индикатор в виде полукруга
     */
    private solidGaugeChart(config: SolidGaugeConfig): void {
        this.dataProvider.getData(config).then((data: IChartData) => {
            new SolidGaugeChart().run(config, data);
        });
    }

    /**
     * Сплайн
     */
    private splineChart(config: SplineConfig): void {
        this.dataProvider.getData(config).then((data: IChartData) => {
            new SplineChart().run(config, data);
        });
    }

    /**
     * Таблица разных индикаторов
     */
    private indicatorsTableChart(config: IndicatorsTableConfig): void {
        this.dataProvider.getData(config).then((data: IChartData) => {
            new IndicatorsTableChart().run(config, data);
        });
    }
}
