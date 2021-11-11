export * from "./graphQL";

// NOTE: Экспортируются и значения и сами типы. Значения используются во внешних проектах.
//       Нельзя через enum, т.к. они не экспортируются, поэтому через массив значений + type

// Типы виджетов
// Каждый тип виджета может поддерживать определенное число различных viewType
export type WidgetType = 'SPLINE' | 'CATEGORY' | 'AVERAGE_NUMBER' | 'SOLID_GAUGE' | 'TABLE'
     | 'REPORT' | 'STATIC' | 'KPI' | 'DISTRIBUTION' | 'PROFILE' | 'PIE'
     | 'PRODUCTION_PLAN';
    // 'DISCIPLINE_REPORT';

// Вид графика для spline
export const ChartTypeValues = ['LINE', 'HISTOGRAM'] as const;
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

// Варианты отображения HISTOGRAM
export const HistogramTypeValues = ['normal', 'stack', 'overlap'] as const;
export type HistogramType = typeof HistogramTypeValues[number];

// Типы ресурсов до которых разграничен доступ
export const ResourceTypeValues = ['TEMPLATE', 'DATASOURCE', 'DASHBOARD'] as const;
export type ResourceType = typeof ResourceTypeValues[number];

// Выравнивание label для pie
// label: alignTo
// 'none' (default): label lines have fixed length as labelLine.length and labelLine.length2.
// 'labelLine': aligning to the end of label lines and the length of the shortest horizontal label lines is configured by labelLine.length2.
// 'edge': aligning to text and the distance between the edges of text and the viewport is configured by label.edgeDistance
export const PieLabelAlignValues = ['none', 'labelLine', 'edge'] as const;
export type PieLabelAlign = typeof PieLabelAlignValues[number];

