/**
 * Возвращаемые данные для dataSource "Static"
 */
import {DimensionUnit} from "./dimensionUnit";
import {OrganizationUnit} from "./organizationUnit";

export interface Point {
    dimensions: DimensionUnit[];
    orgUnits: OrganizationUnit[];
    xValue: number;
    yValue: number;
}
