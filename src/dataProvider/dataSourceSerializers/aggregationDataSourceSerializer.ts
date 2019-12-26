import {ISerializer} from "./ISerializer";
import {AggregationDataSource} from "../../interfaces";
import * as stringifyObject from 'stringify-object';

export class AggregationDataSourceSerializer implements ISerializer {
    serialize(dataSource: AggregationDataSource): string {
        const firstDataSource = stringifyObject(dataSource.firstDataSource, {
            indent: ' ',
            singleQuotes: false
        }).replace(/\n/g, '');
        const secondDataSource = stringifyObject(dataSource.secondDataSource, {
            indent: ' ',
            singleQuotes: false
        }).replace(/\n/g, '');

        return `{
            type: ${dataSource.type},
            firstDataSource: ${firstDataSource},
            secondDataSource: ${secondDataSource},
            operation: ${dataSource.operation}
        }`;
    }
}
