/**
 * GraphQL enums
 */

// Типы отображения виджетов. Именно от них формируются запросы в graphQL.
export type ViewType = 'STATIC' | 'DYNAMIC' | 'DISTRIBUTION' | 'PROFILE' | 'TABLE' | 'REPORT';

// Тип частоты
export type Frequency = 'YEAR' | 'MONTH' | 'WEEK' | 'DAY' | 'HOUR' | 'ALL';

// Тип DataSource
export type DataSourceType = 'SINGLE' | 'AGGREGATION';

// Операция для данных внутри dataSet
export type Operation = 'SUM' | 'AVG' | 'MIN' | 'MAX';

// Операция в DataSource для типа AGGREGATION
export type ArithmeticOperation = 'SUM' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE';
