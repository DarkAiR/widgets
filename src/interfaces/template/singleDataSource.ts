/**
 * описание источника данных для dataSet'a
 */
import {IDataSourceBase} from "./IDataSourceBase";
import {DimensionFilter} from "./dimensionFilter";
import {Metric} from "./metric";

export interface SingleDataSource extends IDataSourceBase {
    name: string;                       // название таблицы (применим только для SINGLE, нр fte)
    dimensions: DimensionFilter[];      // набор фильтров по полям (применим только для SINGLE)
    metric?: Metric;                    // метрика которую надо расчитать
}
