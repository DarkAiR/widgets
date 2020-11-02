import {AggregationDataSource} from "../../interfaces";
import * as stringifyObject from 'stringify-object';

export class AggregationDataSourceSerializer {
    static async serialize(dataSource: AggregationDataSource): Promise<string> {
        // TODO: Проверять на name === '' и не формировать запрос (возвращать null)

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
