/**
 * Используется для последующей комбинации двух вложенных источников данных.
 * result = firstDataSource {operation} secondDataSource
 */
import { DataSourceType, Operation } from './../../models/types';
import { SingleDataSource } from "./singleDataSource";
export interface AggregationDataSource {
    type: DataSourceType;
    firstDataSource: SingleDataSource | AggregationDataSource;
    operation: Operation;
    secondDataSource: SingleDataSource | AggregationDataSource;
}
