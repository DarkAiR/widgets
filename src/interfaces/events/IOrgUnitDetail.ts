export interface IOrgUnitDetail {
    id: number;                         // ID OrgUnit from WFM API
    outerId: string;                    // Значение для подстановки в dimensions
    name: string;
    active: boolean;
    dateFrom?: string;                  // YYYY-MM-dd
    dateTo?: string;                    // YYYY-MM-dd
    organizationUnitTypeId: number;
}
