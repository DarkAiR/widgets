export declare type Paddings = {
    top: number;
    right: number;
    bottom: number;
    left: number;
};
export declare type ViewType = 'STATIC' | 'DYNAMIC' | 'DISTRIBUTION' | 'PROFILE' | 'REPORT';
export declare type ChartType = 'LINE' | 'HISTOGRAM' | 'SCATTER';
export declare type Frequency = 'MONTH' | 'WEEK' | 'DAY' | 'HOUR';
export declare type Operation = 'SUM' | 'AVG' | 'MIN' | 'MAX';
export declare type DataSourceType = 'SINGLE' | 'AGGREGATION';
export declare type WidgetType = 'chartBar' | // Столбцовая диаграмма
'averageNumber' | // Средние показатели за прошлый и позапрошлый интервал
'averageSpline' | // Сплайн со средними показателями
'solidGauge' | // Индикатор в виде полукруга
'indicatorsTable';
