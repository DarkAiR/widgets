export interface Paddings {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

// Типы виджетов
// Каждый тип виджета может поддерживать определенное число различный viewType
export type WidgetType = 'SPLINE' | 'AVERAGE_NUMBER' | 'SOLID_GAUGE' | 'INDICATORS_TABLE' | 'TABLE'
     | 'REPORT' | 'STATIC' | 'SEARCH_BAR';

// Типы отображения виджетов. Именно от них формируются запросы в graphQL.
export type ViewType = 'STATIC' | 'DYNAMIC' | 'REPORT' | 'TABLE';     // | 'DISTRIBUTION' | 'PROFILE' | 'MAP';

export type ChartType = 'LINE' | 'HISTOGRAM' | 'SCATTER';
export type Frequency = 'YEAR' | 'MONTH' | 'WEEK' | 'DAY' | 'HOUR' | 'ALL';
export type Operation = 'SUM' | 'AVG' | 'MIN' | 'MAX' | 'DIVIDE';
export type DataSourceType = 'SINGLE' | 'AGGREGATION';
export type YAxisTypes = 'left' | 'right';
export type MethodType = 'MAPE' | 'MAE' | 'coverage' | 'utilization';
export type ServerType = 'druid' | 'qlik';
