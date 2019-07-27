/**
 * Возвращаемые данные для dataSource
 */

export interface SingleTimeSeriesValue {
    orgUnits: Array<{
        name: string
    }>;
    value: number,
    localDateTime: string;
}
