/**
 * Возвращаемые данные для dataSource SingleTimeSeries
 */
import {OrganizationUnit} from "./organizationUnit";

export interface TSPoint {
    orgUnits: OrganizationUnit[];
    value: number;
    localDateTime: string;
}
