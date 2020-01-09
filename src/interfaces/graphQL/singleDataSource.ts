/**
 * DataSource для типа SINGLE
 */
import {DimensionFilter} from "./dimensionFilter";
import {Metric} from "./metric";
import {DataSourceType} from "../../models/types";

export interface SingleDataSource {
    type: DataSourceType;
    name: string;                       // название таблицы (применим только для SINGLE, нр fte)
    dimensions: DimensionFilter[];      // набор фильтров по полям (применим только для SINGLE)
    metric?: Metric;                    // метрика которую надо расчитать
}
