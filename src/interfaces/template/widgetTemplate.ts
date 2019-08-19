import {DataSetTemplate} from './dataSetTemplate';
import {ViewType} from "../../models/types";
import {WidgetTemplateSettings} from "./WidgetTemplateSettings";

export interface WidgetTemplate {
    id: string | null;                      // ID шаблона (может быть null)
    title: string;                          // Название шаблона
    viewType: ViewType;                     // Тип виджета
    dataSets: Array<DataSetTemplate>;       // набор данных, каждый item описывает один набор данных, для одного графика/отчета
                                            // каждый item - это json DataSetTemplate
    style?: WidgetTemplateSettings;
    _links: {
        self: {
            href: string;
        }
    };
}
