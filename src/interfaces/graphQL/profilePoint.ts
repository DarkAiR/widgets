/**
 * Возвращаемые данные для dataSource "Profile"
 */
import {DimensionUnit} from "./dimensionUnit";
import {OrganizationUnit} from "./organizationUnit";

export interface ProfilePoint {
    value: number;
    xposition: number;
    dimensions?: DimensionUnit[];
}
