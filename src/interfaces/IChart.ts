import {IChartData, IWidgetVariables} from ".";

export interface IChart {
    getVariables(): IWidgetVariables;       // Возвращает список переменных, доступных для прослушивания
    run(data: IChartData): void;
}
