export type Paddings = {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export type WidgetType = 'SPLINE' | 'AVERAGE_NUMBER' | 'SOLID_GAUGE' | 'INDICATORS_TABLE';
export type ViewType = 'STATIC' | 'DYNAMIC' | 'DISTRIBUTION' | 'PROFILE' | 'REPORT' | 'MAP';
export type ChartType = 'LINE' | 'HISTOGRAM' | 'SCATTER';
export type Frequency = 'YEAR' | 'MONTH' | 'WEEK' | 'DAY' | 'HOUR';
export type Operation = 'SUM' | 'AVG' | 'MIN' | 'MAX' | 'DIVIDE';
export type DataSourceType = 'SINGLE' | 'AGGREGATION';
