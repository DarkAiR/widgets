import {ISerializer} from "./ISerializer";
import {DataSetTemplate, SingleDataSource} from "../../interfaces";
import * as stringifyObject from 'stringify-object';
import {get as _get, isEmpty as _isEmpty} from 'lodash';

export class DistributionDataSourceSerializer implements ISerializer {
    serialize(dataSource: SingleDataSource): string {
        const dimensionsJson = stringifyObject(dataSource.dimensions, {
            indent: ' ',
            singleQuotes: false
        }).replace(/\n/g, '');

        let expression = _get(dataSource.metric, 'expression', dataSource.metric.name);
        if (!_isEmpty(expression)) {
            expression = expression.replace(/([\"\\])/gm, '\\$1');
        }

        return `{
            type: ${dataSource.type},
            name: "${dataSource.name}",
            dimensions: ${dimensionsJson},
            metric: {
                name: "${dataSource.metric.name}",
                expression: "${expression}",
            }
        }`;
    }
}
