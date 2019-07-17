import { ViewType, ChartType, Frequency, Operation } from './../../models/types';
import { SingleDataSource } from "./singleDataSource";
import { AggregationDataSource } from "./aggregationDataSource";
export interface DataSetTemplate {
    dataSource1: SingleDataSource | AggregationDataSource;
    dataSource2: SingleDataSource | AggregationDataSource | null;
    viewType: ViewType;
    chartType: ChartType;
    from: string | null;
    to: string | null;
    years: Array<number> | null;
    days: Array<number> | null;
    months: Array<number> | null;
    hours: Array<number> | null;
    weekdays: Array<number> | null;
    frequency: Frequency;
    preFrequency: Frequency;
    operation: Operation;
    axis: number;
    numberOfBeans: number;
    method: string | null;
    style: {
        color: string;
    };
}
