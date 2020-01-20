export interface Paddings {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

<<<<<<< Updated upstream
// Типы виджетов
// Каждый тип виджета может поддерживать определенное число различный viewType
export type WidgetType = 'SPLINE' | 'AVERAGE_NUMBER' | 'SOLID_GAUGE' | 'INDICATORS_TABLE' | 'TABLE'
     | 'REPORT' | 'STATIC' | 'SEARCH_BAR';

// Типы отображения виджетов. Именно от них формируются запросы в graphQL.
export type ViewType = 'STATIC' | 'DYNAMIC' | 'REPORT' | 'TABLE';     // | 'DISTRIBUTION' | 'PROFILE' | 'MAP';

export type ChartType = 'LINE' | 'HISTOGRAM' | 'SCATTER';
=======
<<<<<<< Updated upstream
export type WidgetType = 'SPLINE' | 'AVERAGE_NUMBER' | 'SOLID_GAUGE' | 'INDICATORS_TABLE';
export type ViewType = 'STATIC' | 'DYNAMIC' | 'DISTRIBUTION' | 'PROFILE' | 'REPORT' | 'MAP';
export type ChartType = 'LINE' | 'HISTOGRAM' | 'SCATTER';
export type Frequency = 'YEAR' | 'MONTH' | 'WEEK' | 'DAY' | 'HOUR';
export type Operation = 'SUM' | 'AVG' | 'MIN' | 'MAX' | 'DIVIDE';
=======
// Типы виджетов
// Каждый тип виджета может поддерживать определенное число различный viewType
export type WidgetType = 'SPLINE' | 'AVERAGE_NUMBER' | 'SOLID_GAUGE' | 'INDICATORS_TABLE' | 'TABLE'
     | 'REPORT' | 'STATIC' | 'SEARCH_BAR' | 'KPI' | 'AWESOME' | 'AVATAR';

// Типы отображения виджетов. Именно от них формируются запросы в graphQL.
export type ViewType = 'STATIC' | 'DYNAMIC' | 'REPORT' | 'TABLE';     // | 'DISTRIBUTION' | 'PROFILE' | 'MAP';

export type ChartType = 'LINE' | 'HISTOGRAM' | 'SCATTER' | 'COMPARED_FACT' | 'COMPARED_PLAN';
>>>>>>> Stashed changes
export type YAxisTypes = 'left' | 'right';
export type MethodType = 'MAPE' | 'MAE' | 'coverage' | 'utilization';
export type ServerType = 'druid' | 'qlik';

// GraphQL enums
export type Frequency = 'YEAR' | 'MONTH' | 'WEEK' | 'DAY' | 'HOUR' | 'ALL';
export type Operation = 'SUM' | 'AVG' | 'MIN' | 'MAX';
<<<<<<< Updated upstream
=======
>>>>>>> Stashed changes
>>>>>>> Stashed changes
export type DataSourceType = 'SINGLE' | 'AGGREGATION';
export type ArithmeticOperation = 'SUM' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE';
