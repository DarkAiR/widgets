import {TSPoint, ReportPoint, ProfilePoint, Point, TableRow, DataSet, ISettings} from "./";

// Типы данных, возвращаемых из GraphQL
export type TData = TSPoint[] | ReportPoint | ProfilePoint[] | Point[] | TableRow[];

export interface IChartData {
    // NOTE: <dataSets> и <data> содержат одинаковое количество элементов
    dataSets: DataSet[];                    // Источники данных, пришедшие в шаблоне
    data: TData[];                          // набор данных, каждый item описывает один набор данных, для одного графика/отчета

    settings: ISettings;                    // Настройки виджета
}
