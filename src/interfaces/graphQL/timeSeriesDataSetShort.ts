import {Frequency, Operation, ViewType} from "../../types";
import {DataSource} from "./dataSource";

export interface TimeSeriesDataSetShort {
    viewType: ViewType;                     // DYNAMIC, нужен для правильной работы серверной части при сохранении шаблонов
    preFrequency: Frequency;                // частота выборки для которой выполняется операция, указанная в operation
    operation: Operation;                   // операция, которую необходимо выполнить при агрегации из preFrequency во frequency
    dataSource1: DataSource;                // описание источника данных для dataSet'a.
}
