import {DataSetTemplate} from './dataSetTemplate';
import {ViewType, WidgetType} from "../../models/types";
import {WidgetTemplateSettings} from "./WidgetTemplateSettings";

export interface WidgetTemplate {
    id: string | null;                      // ID шаблона (может быть null)
    title: string;                          // Название шаблона
    widgetType: WidgetType;                 // Тип виджета
    viewType: ViewType;                     // Тип отображения
    dataSets: DataSetTemplate[];            // набор данных, каждый item описывает один набор данных, для одного графика/отчета
                                            // каждый item - это json DataSetTemplate
    settings?: WidgetTemplateSettings;
    _links: {
        self: {
            href: string;
        }
    };
}
