import {ISerializer} from "./ISerializer";
import {DataSetTemplate, SingleDataSource} from "../../interfaces";
import * as stringifyObject from 'stringify-object';

export class SingleDataSourceSerializer implements ISerializer{
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
            case "REPORT":
            case "STATIC":
                break;
        }

        return `{
            type: ${dataSource1.type},
            name: "${dataSource1.name}",
            metric: "${dataSource1.metric}",
            dimensions: ${dimensionsJson}
        }`;
    }
}
