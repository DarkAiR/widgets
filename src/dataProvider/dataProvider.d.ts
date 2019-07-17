import { WidgetConfig } from "../models/widgetConfig";
import { IChartData } from "../interfaces/IChartData";
export declare class DataProvider {
    private readonly gqlLink;
    private readonly templatesLink;
    getData(config: WidgetConfig): Promise<IChartData>;
    private getTemplate;
    private parseTemplate;
    /**
     * Загрузка данных для шаблона
     */
    private loadData;
    private serializeGQL;
}
