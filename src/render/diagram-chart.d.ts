import * as moment from 'moment';
import { IRender } from '../interfaces';
import { WidgetConfig } from '../models/widgetConfig';
import { Moment } from "moment";
import StartOf = moment.unitOfTime.StartOf;
import { ChartType } from "../models/types";
export declare type DiagramChartDataValue = {
    value: number;
    delta: number;
    color: string;
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
            hide: boolean;
            type: ChartType;
            color: string;
            interactive: boolean;
        };
    }>;
};
/**
 * Чарт для диаграм
 */
export declare class DiagramChart implements IRender {
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
    init(config: WidgetConfig, styles: any): IRender;
    render(): void;
    clear(): IRender;
    setData(data: DiagramChartData): IRender;
    private createDomain;
    static daysBetween(startDate: any, endDate: any): number;
    static addEventListeners(nodes: any, data?: any): void;
}
