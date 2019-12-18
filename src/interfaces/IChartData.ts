import {Frequency} from "../models/types";
import {WidgetTemplateSettings, DataSetTemplate, TSPoint, ReportPoint, ProfilePoint, Point} from "./";

// Типы данных, возвращаемых из GraphQL
export type TData = TSPoint[] | ReportPoint | ProfilePoint[] | Point[];

export interface IChartData {
    from: string;                           // дата начала выборки 'YYYY-mm-dd'
    to: string;                             // дата окончания выборки 'YYYY-mm-dd'
    frequency: Frequency;                   // частота конечной аггрегации
    preFrequency: Frequency;                // частота выборки для которой выполняется операция, указанная в operation

    // NOTE: <dataSets> и <data> содержат одинаковое количество элементов
    dataSets: DataSetTemplate[];            // Источники данных, пришедшие в шаблоне
    data: TData[];                          // набор данных, каждый item описывает один набор данных, для одного графика/отчета

    settings: WidgetTemplateSettings;       // Настройки виджета
}
