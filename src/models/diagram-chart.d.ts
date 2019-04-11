import * as moment from 'moment';
import { IChart } from '../interfaces/IChart';
import { Config } from './config';
import { Moment } from "moment";
import StartOf = moment.unitOfTime.StartOf;
import { ChartType } from "./types";
export declare type DiagramChartDataValue = {
    value: number;
    delta: number;
    classes: Array<string>;
    interactive: boolean;
    onClick: any;
    onMouseLeave: any;
    onMouseOver: any;
    _bar: boolean;
    _data: {
        organizationUnit: string;
        date: Moment;
        kpi: "fte";
    };
};
export declare type DiagramChartDataValuesOnDate = {
    date: Moment;
    data: Array<DiagramChartDataValue>;
};
export declare type DiagramChartData = {
    values: Array<DiagramChartDataValuesOnDate>;
    properties: {
        currency: boolean;
        drawingType: ChartType;
        startDate: Moment;
        endDate: Moment;
        secondaryAxis: boolean;
        height: number;
        frequency: StartOf;
    };
    indicators: Array<{
        values: any;
        properties: {
            hide: any;
            type: any;
            class: any;
        };
    }>;
};
/**
 * Чарт для диаграм
 */
export declare class DiagramChart implements IChart {
    private config;
    private styles;
    private svg;
    private base;
    private x;
    private y;
    private ySecondary;
    private data;
    private xDomain;
    private yDomain;
    private yDomainSecondary;
    private yHeight;
    private yHeightSecondary;
    private width;
    private height;
    private cellWidth;
    private padding;
    private margin;
    init(config: Config, styles: any): IChart;
    render(): void;
    clear(): IChart;
    setData(data: DiagramChartData): IChart;
    private createDomain;
    static daysBetween(startDate: any, endDate: any): number;
    static addEventListeners(nodes: any, data?: any): void;
}
