import {DataSetTemplate} from './dataSetTemplate';
import {ViewType} from "../../models/types";

export interface WidgetTemplate {
    id: string | null;                      // ID шаблона (может быть null)
    title: string;                          // Название шаблона
    viewType: ViewType;                     // Тип виджета
    dataSets: Array<DataSetTemplate>;       // набор данных, каждый item описывает один набор данных, для одного графика/отчета
                                            // каждый item - это json DataSetTemplate
    style?: {
        background: string;
        title: string;
    };
    _links: {
        self: {
            href: string;
        }
    };
}
