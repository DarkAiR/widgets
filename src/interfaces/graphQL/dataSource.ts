import {SingleDataSource} from "./singleDataSource";
import {AggregationDataSource} from "./aggregationDataSource";

// export interface DataSource extends SingleDataSource, AggregationDataSource {}
export type DataSource = SingleDataSource | AggregationDataSource;
