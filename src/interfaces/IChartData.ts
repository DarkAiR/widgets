import {Frequency} from "../models/types";
import {SingleTimeSeriesValue} from "./template/singleTimeSeriesValue";
import {ISettings} from "./ISettings";

export interface IChartValue {
    // dataSource1: SingleDataSource | AggregationDataSource;          // описание источника данных для dataSet'a.
    // dataSource2: SingleDataSource | AggregationDataSource | null;   // второй источник данных используется для STATIC и REPORT представления
    // viewType: ViewType;                     // тип виджета (должен совпадать со значением в WidgetTemplate)
    // chartType: ChartType;                   // тип отрисовки данных из данного источника
    // from: string | null;                    // дата начала выборки 'YYYY-mm-dd'
    // to: string | null;                      // дата окончания выборки 'YYYY-mm-dd'
    // years: Array<number> | null;            // фильтр по годам
    // days: Array<number> | null;             // фильтр по дням месяца
    // months: Array<number> | null;           // фильтр по месяцам
    // hours: Array<number> | null;            // фильтр по часам
    // weekdays: Array<number> | null;         // фильтр по дням недели
    // frequency: Frequency;                   // частота конечной аггрегации
    // preFrequency: Frequency;                // частота выборки для которой выполняется операция, указанная в operation
    // operation: Operation;                   // операция, которую необходимо выполнить при агрегации из preFrequency во frequency
    // axis: number;                           // номер оси, на которую накладывается график
    // numberOfBeans: number;                  // количество столбцов (используется только для DISTRIBUTION)
    // method: string | null;
    values: Array<SingleTimeSeriesValue>;       // Набор данных

    // блок для стилей графика под конкретный источник данных
    settings?: {
        color: string;                          // Цвет графика
    }
};

export interface IChartData {
    title: string;
    from: string;                           // дата начала выборки 'YYYY-mm-dd'
    to: string;                             // дата окончания выборки 'YYYY-mm-dd'
    frequency: Frequency;                   // частота конечной аггрегации
    preFrequency: Frequency;                // частота выборки для которой выполняется операция, указанная в operation
    settings: ISettings;                     // Настройки виджета

    data: Array<IChartValue>;
}
