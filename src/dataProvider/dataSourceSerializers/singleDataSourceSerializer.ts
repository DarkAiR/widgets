import {ISerializer} from "./ISerializer";
import {DataSetTemplate, SingleDataSource} from "../../interfaces";
import * as stringifyObject from 'stringify-object';
import {get as _get} from 'lodash';

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

        return `{
            type: ${dataSource1.type},
            name: "${dataSource1.name}",
            metric: {
                name: "${dataSource1.metric.name}",
                expression: "${_get(dataSource1.metric, 'expression', dataSource1.metric.name)}",
            },
            dimensions: ${dimensionsJson}
        }`;
    }

    serializeReport(dataSource: SingleDataSource): string {
        const dimensionsJson = stringifyObject(dataSource.dimensions, {
            indent: ' ',
            singleQuotes: false
        }).replace(/\n/g, '');
        const metricObj = !dataSource.metric
            ? {}
            : {
                metric: {
                    name: dataSource.metric.name,
                    expression: _get(dataSource.metric, 'expression', dataSource.metric.name),
                }
            };

        return `{
            type: ${dataSource.type},
            name: "${dataSource.name}",
            ${metricObj},
            dimensions: ${dimensionsJson}
        }`;
    }
}
