import {IOrgUnitDetail} from "./IOrgUnitDetail";

export interface IEventOrgUnits {
    [orgUnitName: string]: IOrgUnitDetail[];
}
