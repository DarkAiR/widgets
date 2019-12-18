/**
 * Возвращаемые данные для dataSource "Static"
 */
import {DimensionUnit, OrganizationUnit} from "./";

export interface Point {
    dimensions: DimensionUnit[];
    orgUnits: OrganizationUnit[];
    xValue: number;
    yValue: number;
}
