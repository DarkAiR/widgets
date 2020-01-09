/**
 * Возвращаемые данные для dataSource "Table"
 */
import {DimensionUnit} from "./dimensionUnit";
import {MetricUnit} from "./metricUnit";

export interface TableRow {
    localDateTime: string;
    dimensions: DimensionUnit[];
    metrics: MetricUnit[];
}
