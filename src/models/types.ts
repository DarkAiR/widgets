export * from "./typesGraphQL";

// Типы виджетов
// Каждый тип виджета может поддерживать определенное число различный viewType
export type WidgetType = 'SPLINE' | 'AVERAGE_NUMBER' | 'SOLID_GAUGE' | 'INDICATORS_TABLE' | 'TABLE'
     | 'REPORT' | 'STATIC' | 'KPI' | 'DISTRIBUTION' | 'PROFILE';

// Вид графика для spline
// NOTE: Нельзя через enum, т.к. они не экспортируются, поэтому через массив значений + type
export const ChartTypeValues = ['LINE', 'HISTOGRAM', 'COMPARED_FACT', 'COMPARED_PLAN'] as const;
export type ChartType = typeof ChartTypeValues[number];

// Стиль линии графиков
export const LineTypeValues = ['solid', 'dashed', 'dotted'] as const;
export type LineType = typeof LineTypeValues[number];

// Позиция оси X
export const XAxisPosValues = ['bottom', 'top'] as const;
export type XAxisPos = typeof XAxisPosValues[number];

// Позиция оси Y
export const YAxisPosValues = ['left', 'right'] as const;   // Создаем массив допустимых значений для экспорта в конфиге
export type YAxisPos = typeof YAxisPosValues[number];

// Позиция легенды
export const LegendPosValues = ['top', 'right', 'bottom', 'left'] as const;
export type LegendPos = typeof LegendPosValues[number];

export type MethodType = 'MAPE' | 'MAE' | 'coverage' | 'utilization';
export type ServerType = 'druid' | 'qlik';
