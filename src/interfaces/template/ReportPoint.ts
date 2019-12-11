/**
 * Возвращаемые данные для dataSource "Report"
 */
import {ReportItem} from "./ReportItem";

export interface ReportPoint {
    items: ReportItem[];
    xValue: number;
    yValue: number;
}
