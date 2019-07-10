/**
 * описание источника данных для dataSet'a
 */
import {DataSourceType} from './../../models/types';

export interface SingleDataSource {
    name: string;                       // название таблицы (применим только для SINGLE, нр fte)
    type: DataSourceType;               // тип источника

    // набор фильтров по полям (применим только для SINGLE)
    // фильтр - это KEY (название поля):[список допустимых значений]
    dimensions: Array<{
       name: string;
       values: Array<string>;
    }>;
}
