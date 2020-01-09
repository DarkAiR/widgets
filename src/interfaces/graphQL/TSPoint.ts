/**
 * Возвращаемые данные для dataSource SingleTimeSeries
 */
import {DimensionUnit} from "./dimensionUnit";
import {OrganizationUnit} from "./organizationUnit";

export interface TSPoint {
    dimensions?: DimensionUnit[];
    orgUnits?: OrganizationUnit[];
    value: number;
    localDateTime: string;
}
