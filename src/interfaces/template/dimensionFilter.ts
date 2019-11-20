export interface DimensionFilter {
    name: string;
    values: Array<string>;
    expression: string;             // Строка
    groupBy: boolean;               // Boolean
}
