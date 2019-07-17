import { Frequency } from "../models/types";
export interface IChartData {
    title: string;
    from: string;
    to: string;
    frequency: Frequency;
    preFrequency: Frequency;
    data: Array<Object>;
}
