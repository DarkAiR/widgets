import {AggregationDataSource, DataSource, SingleDataSource} from "../interfaces/graphQL";
import {ISettings} from "../interfaces";
import * as stringifyObject from 'stringify-object';
import {get as _get, isEmpty as _isEmpty} from 'lodash';
import {TypeGuardsHelper} from "../helpers";

export class Serializer {
    static async serialize(dataSource: DataSource): Promise<string | null> {
        if (TypeGuardsHelper.isSingleDataSource(dataSource)) {
            return Serializer.singleDataSource(dataSource);
        }
        if (TypeGuardsHelper.isAggregationDataSource(dataSource)) {
            return Serializer.aggregationDataSource(dataSource);
        }
        return null;
    }

    private static async singleDataSource(dataSource: SingleDataSource): Promise<string> {
        // Для пустого имени нельзя возвращать значения,
        // т.к. в дальнейшем при создании TimeSeries на значениях по-умолчанию, будет создано слишком много данных (на каждый час)
        if (Serializer.isDataSourceNameEmpty(dataSource)) {
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
            singleQuotes: false,
            // tslint:disable-next-line:no-any
            transform: (obj: ISettings, prop: string, originalResult: any) => {
                if (prop === 'type') {
                    return originalResult.replace(/\"/g, '');       // Убираем ковычки для знаяения этого поля
                }
                return originalResult;
            }
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

    private static async aggregationDataSource(dataSource: AggregationDataSource): Promise<string | null> {
        // Проверяем на name === '' и не формируем запрос (возвращаем null)
        // Для пустого имени нельзя возвращать значения,
        // т.к. в дальнейшем при создании TimeSeries на значениях по-умолчанию, будет создано слишком много данных (на каждый час)
        if (Serializer.isDataSourceNameEmpty(dataSource)) {
            return null;
        }

        const firstDataSource = await Serializer.serialize(dataSource.firstDataSource);
        const secondDataSource = await Serializer.serialize(dataSource.secondDataSource);

        return `{
            type: ${dataSource.type},
            firstDataSource: ${firstDataSource},
            secondDataSource: ${secondDataSource},
            operation: ${dataSource.operation}
        }`;
    }

    private static isDataSourceNameEmpty(dataSource: DataSource): boolean {
        if (TypeGuardsHelper.isSingleDataSource(dataSource)) {
            return _isEmpty(dataSource.name);
        }
        if (TypeGuardsHelper.isAggregationDataSource(dataSource)) {
            return Serializer.isDataSourceNameEmpty(dataSource.firstDataSource) || Serializer.isDataSourceNameEmpty(dataSource.secondDataSource);
        }
        return true;
    }
}
