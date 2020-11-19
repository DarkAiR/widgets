import {SingleDataSource} from "../../interfaces";
import * as stringifyObject from 'stringify-object';
import {get as _get, isEmpty as _isEmpty} from 'lodash';

export class SingleDataSourceSerializer {
    static async serialize(dataSource: SingleDataSource): Promise<string> {
        // Для пустого имени нельзя возвращать значения,
        // т.к. в дальнейшем при создании TimeSeries на значениях по-умолчанию, будет создано слишком много данных (на каждый час)
        if (_isEmpty(dataSource.name)) {
            return null;
        }

        const versionFilterJson: string = !dataSource.versionFilter
            ? null
            : stringifyObject(dataSource.versionFilter, {
                indent: ' ',
                singleQuotes: false
            }).replace(/\n/g, '');

        const dimensionsJson: string = stringifyObject(dataSource.dimensions, {
            indent: ' ',
            singleQuotes: false
        }).replace(/\n/g, '');

        const metricFiltersJson: string = stringifyObject(dataSource.metricFilters ?? [], {     // Для старых шаблонов может не быть metricFilters
            indent: ' ',
            singleQuotes: false
        }).replace(/\n/g, '');

        let expression = _get(dataSource.metric, 'expression', dataSource.metric.name);
        if (!_isEmpty(expression)) {
            expression = expression.replace(/([\"\\])/gm, '\\$1');
        }

        return `{
            type: ${dataSource.type},
            name: "${dataSource.name}"
            dimensions: ${dimensionsJson},
            ${versionFilterJson ? `versionFilter: ${versionFilterJson},` : ''}
            metric: {
                name: "${dataSource.metric.name}",
                expression: "${expression}",
            },
            metricFilters: ${metricFiltersJson}
        }`;
    }
}
