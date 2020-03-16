import {Frequency, Operation} from "../../models/types";
import {DataSource} from "./dataSource";

export interface TimeSeriesDataSetShort {
    preFrequency: Frequency;                // частота выборки для которой выполняется операция, указанная в operation
    operation: Operation;                   // операция, которую необходимо выполнить при агрегации из preFrequency во frequency
    dataSource1: DataSource;                // описание источника данных для dataSet'a.
}
