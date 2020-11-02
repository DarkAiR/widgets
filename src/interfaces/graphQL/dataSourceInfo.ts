import {DimensionInfo} from "./dimensionInfo";
import {MetricInfo} from "./metricInfo";

export interface DataSourceInfo {
    name: string;
    caption: string;
    dimensions: DimensionInfo[];
    metrics: MetricInfo[];
    version: DimensionInfo;
}
