export interface Paddings {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export type WidgetType = 'SPLINE' | 'AVERAGE_NUMBER' | 'SOLID_GAUGE' | 'INDICATORS_TABLE' | 'SINGLE_NUMBER' | 'REPORT' | 'STATIC';
export type ViewType = 'STATIC' | 'DYNAMIC' | 'DISTRIBUTION' | 'PROFILE' | 'REPORT' | 'MAP';
export type ChartType = 'LINE' | 'HISTOGRAM' | 'SCATTER';
export type Frequency = 'YEAR' | 'MONTH' | 'WEEK' | 'DAY' | 'HOUR' | 'ALL';
export type Operation = 'SUM' | 'AVG' | 'MIN' | 'MAX' | 'DIVIDE';
export type DataSourceType = 'SINGLE' | 'AGGREGATION';
export type YAxisTypes = 'left' | 'right';
export type MethodType = 'MAPE' | 'MAE' | 'coverage' | 'utilization';
export type ServerType = 'druid' | 'qlik';
