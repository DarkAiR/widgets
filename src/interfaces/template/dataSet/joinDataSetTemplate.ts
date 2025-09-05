import {Frequency, ViewType} from '../../../types';
import {DimensionFilter, TimeSeriesDataSetShort} from "../../graphQL";
import {ISettings} from "../../ISettings";

export interface JoinDataSetTemplate {
    viewType: ViewType;                     // тип виджета (должен совпадать со значением в WidgetTemplate)
    from: string | null;                    // дата начала выборки 'YYYY-mm-dd'
    to: string | null;                      // дата окончания выборки 'YYYY-mm-dd'
    period?: string | null;                 // Это строка или НИЧЕГО, никаких null или пустых строк, просто не передавать period
                                            // период запроса данных, при указании имеет приоритет перед from/to
                                            // возможно задавать в формате startDate/period, period/endDate, period, period/period
    frequency: Frequency;                   // частота конечной аггрегации
    dimensions: DimensionFilter[];          // набор фильтров по полям (применим только для SINGLE)
    dataSetTemplates: TimeSeriesDataSetShort[]; // Список dataSet
    limit?: number;                         // Количество возвращаемых данных (default = 100)
    settings?: ISettings;                   // Настройки конкретных источников данных
}
