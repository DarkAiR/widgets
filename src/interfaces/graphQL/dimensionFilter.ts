export interface DimensionFilter {
    name: string;
    values: string[];
    expression: string;             // Строка
    groupBy: boolean;               // Boolean
}
