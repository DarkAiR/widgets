import {WidgetTemplate} from "../interfaces/template";
import {DataSourceInfo, IChartData} from "../interfaces";

export interface IDataProvider {
    getTemplate(templateId: string): Promise<WidgetTemplate>;
    parseTemplate(template: WidgetTemplate, hasEntity?: boolean): Promise<IChartData | null>;
    getDataSourceInfo(dataSourceName: string): Promise<DataSourceInfo>;
}

