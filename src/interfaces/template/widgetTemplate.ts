import {ViewType, WidgetType, ServerType} from "../../models/types";
import { DataSet } from './dataSet';
import {ISettings} from "../ISettings";

export interface WidgetTemplate {
    id: string | null;                      // ID шаблона (может быть null)
    title: string;                          // Название шаблона
    widgetType: WidgetType;                 // Тип виджета
    viewType: ViewType;                     // Тип отображения
    server: ServerType;                     // Тип сервера
    dataSets: DataSet[];                    // набор данных, каждый item описывает один набор данных, для одного графика/отчета
                                            // каждый item - это json DataSet
    settings?: ISettings;
    _links: {
        self?: {
            href: string;
        }
    };
}
