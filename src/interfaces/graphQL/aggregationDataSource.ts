/**
 * DataSource для типа AGGREGATION
 * Используется для последующей комбинации двух вложенных источников данных.
 * result = firstDataSource {operation} secondDataSource
 */
import {ArithmeticOperation, DataSourceType} from '../../models/types';
import {DataSource} from "./dataSource";

export interface AggregationDataSource {
    type: DataSourceType;
    firstDataSource: DataSource;        // первый вложенный источник данных
    operation: ArithmeticOperation;     // операция между первым и вторым источником данных.
    secondDataSource: DataSource;       // второй вложенный источник данных.
}
