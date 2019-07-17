import * as moment from 'moment';
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
export declare class DiagramChart {
}
