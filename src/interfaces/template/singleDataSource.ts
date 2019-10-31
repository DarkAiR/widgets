/**
 * описание источника данных для dataSet'a
 */
import {IDataSourceBase} from "./IDataSourceBase";

export interface SingleDataSource extends IDataSourceBase {
    name: string;                       // название таблицы (применим только для SINGLE, нр fte)

    // набор фильтров по полям (применим только для SINGLE)
    // фильтр - это KEY (название поля):[список допустимых значений]
    dimensions: Array<{
       name: string;
       values: Array<string>;
    }>;

    // метрика которую надо расчитать
    metric?: {
        name: string,
        expression?: string            // если не указан, то name берется как название поля
    };
}
