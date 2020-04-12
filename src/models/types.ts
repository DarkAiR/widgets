export * from "./typesGraphQL";

// Типы виджетов
// Каждый тип виджета может поддерживать определенное число различный viewType
export type WidgetType = 'SPLINE' | 'AVERAGE_NUMBER' | 'SOLID_GAUGE' | 'INDICATORS_TABLE' | 'TABLE'
     | 'REPORT' | 'STATIC' | 'KPI' | 'AVATAR' | 'DISTRIBUTION' | 'PROFILE';

// Вид графика для spline
export const ChartTypeValues = ['LINE', 'HISTOGRAM', 'COMPARED_FACT', 'COMPARED_PLAN'] as const;
export type ChartType = typeof ChartTypeValues[number];

// Стиль линии графиков
export const LineTypeValues = ['solid', 'dashed', 'dotted'] as const;
export type LineType = typeof LineTypeValues[number];

// Позиция оси Y
// NOTE: Нельзя через enum, т.к. они не экспортируются, поэтому через массив значений + type
export const YAxisTypesValues = ['left', 'right'] as const;   // Создаем массив допустимых значений для экспорта в конфиге
export type YAxisTypes = typeof YAxisTypesValues[number];

export type MethodType = 'MAPE' | 'MAE' | 'coverage' | 'utilization';
export type ServerType = 'druid' | 'qlik';
