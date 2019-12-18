/**
 * Возвращаемые данные для dataSource "Profile"
 */
import {DimensionUnit, OrganizationUnit} from "./";

export interface ProfilePoint {
    dimensions?: DimensionUnit[];
    orgUnits?: OrganizationUnit[];
    value: number;
    xposition: number;
}
