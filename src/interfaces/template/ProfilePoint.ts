/**
 * Возвращаемые данные для dataSource "Profile"
 */

import { OrganizationUnit } from "./organizationUnit";

export interface ProfilePoint {
    orgUnits: OrganizationUnit[];
    value: number;
    xposition: number;
}
