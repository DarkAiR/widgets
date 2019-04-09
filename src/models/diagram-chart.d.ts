import { IChart } from '../interfaces/IChart';
import * as moment from 'moment';
import { Config } from './config';
export declare type DiagramChartDataValue = {
    value: number;
    delta: number;
};
export declare type DiagramChartDataValuesOnDate = {
    date: string;
    data: Array<DiagramChartDataValue>;
};
export declare type DiagramChartData = {
    values: Array<DiagramChartDataValuesOnDate>;
};
/**
 * Чарт для диаграм
 */
export declare class DiagramChart implements IChart {
    private config;
    private svg;
    private data;
    xDomain: Array<moment.Moment>;
    yDomain: Array<any>;
    yDomainSecondary: Array<any>;
    yHeight: number;
    yHeightSecondary: number;
    init(config: Config): IChart;
    render(): void;
    clear(): IChart;
    setData(data: DiagramChartData): IChart;
}
