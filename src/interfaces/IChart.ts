import {IChartData, IWidgetVariables} from ".";

/**
 * NOTE: Здесь описываются только методы, которые будут доступны НАРУЖУ из библиотеки, и ничего более!
 */
export interface IChart {
    destroy(): void;                        // Удаление виджета
    getVariables(): IWidgetVariables;       // Возвращает список переменных, доступных для прослушивания
    getDataSources(): string[];             // Получить названия всех DataSources
    getDataSourceIndex(dataSourceName: string): number | null;  // Получить индекс dataSource
    redraw(): Promise<void>;                // Перерисовать виджет с текущими данными
}
