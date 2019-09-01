import {Frequency} from "../models/types";
import {SingleTimeSeriesValue} from "./template/singleTimeSeriesValue";
import {DataSetSettings} from "./template/dataSetSettings";
import {WidgetTemplateSettings} from "./template/widgetTemplateSettings";
import {DataSetTemplate} from "./template/dataSetTemplate";

export interface IChartData {
    from: string;                           // дата начала выборки 'YYYY-mm-dd'
    to: string;                             // дата окончания выборки 'YYYY-mm-dd'
    frequency: Frequency;                   // частота конечной аггрегации
    preFrequency: Frequency;                // частота выборки для которой выполняется операция, указанная в operation

    dataSets: DataSetTemplate[];            // Источники данных, пришедшие в шаблоне
    data: Array<SingleTimeSeriesValue[]>;   // набор данных, каждый item описывает один набор данных, для одного графика/отчета

    settings: WidgetTemplateSettings;       // Настройки виджета
}
