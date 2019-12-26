import {DimensionUnit, MetricUnit} from '.';

/**
 * Возвращаемые данные для dataSource "Table"
 */
export interface TableRow {
    localDateTime: string;
    dimensions: DimensionUnit[];
    metrics: MetricUnit[];
}
