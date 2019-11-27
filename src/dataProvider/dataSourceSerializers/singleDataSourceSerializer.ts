import {ISerializer} from "./ISerializer";
import {DataSetTemplate, SingleDataSource} from "../../interfaces";
import * as stringifyObject from 'stringify-object';
import {get as _get, isEmpty as _isEmpty} from 'lodash';

export class SingleDataSourceSerializer implements ISerializer {
    serialize(dataSet: DataSetTemplate): string {
        const dataSource1 = <SingleDataSource>dataSet.dataSource1;
        let dimensionsJson: string = '{}';
        switch (dataSet.viewType) {
            case 'DYNAMIC':
            case 'DISTRIBUTION':
            case 'PROFILE':
                dimensionsJson = stringifyObject(dataSource1.dimensions, {
                    indent: ' ',
                    singleQuotes: false
                }).replace(/\n/g, '');
                break;
            case "STATIC":
                break;
        }

        let expression = _get(dataSource1.metric, 'expression', dataSource1.metric.name);
        if (!_isEmpty(expression)) {
            expression = expression.replace(/([\"\\])/gm, '\\$1');
        }

        return `{
            type: ${dataSource1.type},
            name: "${dataSource1.name}",
            metric: {
                name: "${dataSource1.metric.name}",
                expression: "${expression}",
            },
            dimensions: ${dimensionsJson}
        }`;
    }

    serializeReport(dataSource: SingleDataSource): string {
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
