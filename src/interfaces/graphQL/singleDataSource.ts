/**
 * DataSource для типа SINGLE
 */
import {DimensionFilter} from "./dimensionFilter";
import {Metric} from "./metric";
import {DataSourceType} from "../../types";
import {MetricFilter} from "./metricFilter";
import {VersionFilter} from "./versionFilter";

// NOTE: Делаем все поля обязательными, чтобы не перегружать код switch(viewType)
export interface SingleDataSource {
    type: DataSourceType;
    name: string;                       // название таблицы (применим только для SINGLE, нр fte)
    dimensions: DimensionFilter[];      // набор фильтров по полям (применим только для SINGLE)
    metric: Metric;                     // метрика которую надо расчитать
    metricFilters: MetricFilter[];      // Дополнительные условия для фильтрации по метрикам
    versionFilter?: VersionFilter;      // Фильтр версий
}
