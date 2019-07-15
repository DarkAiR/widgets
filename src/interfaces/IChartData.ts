import {Frequency} from "../models/types";

export interface IChartData {
    title: string;
    from: string;                           // дата начала выборки 'YYYY-mm-dd'
    to: string;                             // дата окончания выборки 'YYYY-mm-dd'
    frequency: Frequency;                   // частота конечной аггрегации
    preFrequency: Frequency;                // частота выборки для которой выполняется операция, указанная в operation

    data: Array<Object>;
}
