/**
 * GraphQL enums
 */

// Типы отображения виджетов. Именно от них формируются запросы в graphQL.
export const ViewTypeValues = ['STATIC', 'DYNAMIC', 'DISTRIBUTION', 'PROFILE', 'TABLE', 'REPORT'] as const;
export type ViewType = typeof ViewTypeValues[number];

// Тип частоты
export type Frequency = 'YEAR' | 'MONTH' | 'WEEK' | 'DAY' | 'HOUR' | 'ALL' | 'NONE';

// Тип DataSource
export type DataSourceType = 'SINGLE' | 'AGGREGATION';

// Операция для данных внутри dataSet
export type Operation = 'SUM' | 'AVG' | 'MIN' | 'MAX';

// Операция в DataSource для типа AGGREGATION
export type ArithmeticOperation = 'SUM' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE';

// Типы применения фильтров метрик
export type MetricFilterType = 'RAW' | 'FINAL';
