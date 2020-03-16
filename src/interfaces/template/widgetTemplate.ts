import {ViewType, WidgetType, ServerType} from "../../models/types";
import {WidgetTemplateSettings} from "./widgetTemplateSettings";
import { DataSet } from './dataSet';

export interface WidgetTemplate {
    id: string | null;                      // ID шаблона (может быть null)
    title: string;                          // Название шаблона
    widgetType: WidgetType;                 // Тип виджета
    viewType: ViewType;                     // Тип отображения
    server: ServerType;                     // Тип сервера
    dataSets: DataSet[];                    // набор данных, каждый item описывает один набор данных, для одного графика/отчета
                                            // каждый item - это json DataSet
    settings?: WidgetTemplateSettings;
    _links: {
        self?: {
            href: string;
        }
    };
}
