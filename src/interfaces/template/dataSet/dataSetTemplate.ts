import {ViewType, ChartType, Frequency, Operation} from './../../models/types';
import {DataSetSettings} from "./dataSetSettings";
import {DataSource} from "../graphQL";

export interface DataSetTemplate {
    dataSource1: DataSource;                // описание источника данных для dataSet'a.
    dataSource2?: DataSource | null;        // второй источник данных используется для STATIC и REPORT представления
    viewType: ViewType;                     // тип виджета (должен совпадать со значением в WidgetTemplate)
    chartType: ChartType;                   // тип отрисовки данных из данного источника
    from: string | null;                    // дата начала выборки 'YYYY-mm-dd'
    to: string | null;                      // дата окончания выборки 'YYYY-mm-dd'
    period?: string | null;                 // Это строка или НИЧЕГО, никаких null или пустых строк, просто не передавать period
                                            // период запроса данных, при указании имеет приоритет перед from/to
                                            // возможно задавать в формате startDate/period, period/endDate, period, period/period
    years?: number[] | null;                // фильтр по годам
    days?: number[] | null;                 // фильтр по дням месяца
    months?: number[] | null;               // фильтр по месяцам
    hours?: number[] | null;                // фильтр по часам
    weekdays?: number[] | null;             // фильтр по дням недели
    frequency: Frequency;                   // частота конечной аггрегации
    preFrequency: Frequency;                // частота выборки для которой выполняется операция, указанная в operation
    operation: Operation;                   // операция, которую необходимо выполнить при агрегации из preFrequency во frequency
    axis: number;                           // номер оси, на которую накладывается график
    numberOfBeans?: number;                 // количество столбцов (используется только для DISTRIBUTION)
    methods?: string[] | null;

    settings?: DataSetSettings;             // Настройки конкретных источников данных
}
