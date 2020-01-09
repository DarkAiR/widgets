/**
 * DataSource для типа AGGREGATION
 * Используется для последующей комбинации двух вложенных источников данных.
 * result = firstDataSource {operation} secondDataSource
 */
import {DataSourceType, Operation} from '../../models/types';
import {DataSource} from "./dataSource";

export interface AggregationDataSource {
    type: DataSourceType;
    firstDataSource: DataSource;        // первый вложенный источник данных
    operation: Operation;               // операция между первым и вторым источником данных.
    secondDataSource: DataSource;       // второй вложенный источник данных.
}
