/**
 * Возвращаемые данные для dataSource "Static"
 */
import {OrganizationUnit} from "./organizationUnit";

export interface Point {
    orgUnits: OrganizationUnit[];
    xValue: number;
    yValue: number;
}
