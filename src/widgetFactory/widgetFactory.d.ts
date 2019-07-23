import { WidgetConfig } from "../models/widgetConfig";
import { DataProvider } from "..";
export declare class WidgetFactory {
    dataProvider: DataProvider;
    run(config: WidgetConfig): void;
    /**
     * Средние показатели за прошлый и позапрошлый интервал
     */
    private averageNumberChart;
    /**
     * Индикатор в виде полукруга
     */
    private solidGaugeChart;
    /**
     * Сплайн
     */
    private splineChart;
    /**
     * Таблица разных индикаторов
     */
    private indicatorsTableChart;
}
