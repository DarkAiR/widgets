/**
 * Возвращаемые данные для dataSource SingleTimeSeries
 */
import {DimensionUnit, OrganizationUnit} from "./";

export interface TSPoint {
    dimensions?: DimensionUnit[];
    orgUnits?: OrganizationUnit[];
    value: number;
    localDateTime: string;
}
