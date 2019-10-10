import {IChartData, IWidgetVariables} from ".";

export interface IChart {
    destroy(): void;                        // Удаление виджета
    getVariables(): IWidgetVariables;       // Возвращает список переменных, доступных для прослушивания
    run(data: IChartData): void;            // Запуск виджета
}
