/**
 * Возвращаемые данные для dataSource "Profile"
 */
import {DimensionUnit} from "./dimensionUnit";
import {OrganizationUnit} from "./organizationUnit";

export interface ProfilePoint {
    dimensions?: DimensionUnit[];
    orgUnits?: OrganizationUnit[];
    value: number;
    xposition: number;
}
