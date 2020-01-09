export interface Metric {
    name: string;
    expression?: string;        // Если не указано, берется из name
}
