import {ISerializer} from "./ISerializer";
import {DataSetTemplate, SingleDataSource} from "../../interfaces";
import * as stringifyObject from 'stringify-object';
import {get as _get, isEmpty as _isEmpty} from 'lodash';

export class ReportDataSourceSerializer implements ISerializer {
    serialize(dataSource: SingleDataSource): string {
        const dimensionsJson = stringifyObject(dataSource.dimensions, {
            indent: ' ',
            singleQuotes: false
        }).replace(/\n/g, '');

        let res = `
            type: ${dataSource.type},
            name: "${dataSource.name}",
            dimensions: ${dimensionsJson}`;

        if (dataSource.metric) {
            res += `,
            metric: {
                name: "${dataSource.metric.name}",
                expression: "${_get(dataSource.metric, 'expression', dataSource.metric.name)}"
            }`;
        }
        return '{' + res + '}';
    }
}
