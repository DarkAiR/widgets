import {ISerializer} from "./ISerializer";
import {AggregationDataSource, DataSetTemplate} from "../../interfaces";
import * as stringifyObject from 'stringify-object';

export class AggregationDataSourceSerializer implements ISerializer{
    serialize(dataSet: DataSetTemplate): string {
        const dataSource1 = <AggregationDataSource>dataSet.dataSource1;

        const firstDataSource = stringifyObject(dataSource1.firstDataSource, {
            indent: ' ',
            singleQuotes: false
        }).replace(/\n/g, '');
        const secondDataSource = stringifyObject(dataSource1.secondDataSource, {
            indent: ' ',
            singleQuotes: false
        }).replace(/\n/g, '');

        return `{
            type: ${dataSource1.type},
            firstDataSource: ${firstDataSource},
            secondDataSource: ${secondDataSource},
            operation: ${dataSource1.operation}
        }`;
    }
}
