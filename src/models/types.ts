export type Paddings = {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export type ViewType = 'STATIC' | 'DYNAMIC' | 'DISTRIBUTION' | 'PROFILE' | 'REPORT';
export type ChartType = 'LINE' | 'HISTOGRAM' | 'SCATTER';
export type Frequency = 'MONTH' | 'WEEK' | 'DAY' | 'HOUR';
export type Operation = 'SUM' | 'AVG' | 'MIN' | 'MAX';
export type DataSourceType = 'SINGLE' | 'AGGREGATION';

export type WidgetType =
    'chartBar' |                // Столбцовая диаграмма
    'averageNumber' |           // Средние показатели за прошлый и позапрошлый интервал
    'averageSpline' |           // Сплайн со средними показателями
    'solidGauge' |              // Индикатор в виде полукруга
    'indicatorsTable';          // Таблица разных индикаторов
