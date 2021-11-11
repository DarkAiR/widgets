import {MetricFilterType} from "../../types/graphQL";

export interface MetricFilter {
    name: string;
    expression?: string;
    lower?: number;                 // Удаляются значения ниже указанного
    lowerStrict?: boolean;          // Использовать строго сравнение
    upper?: number;                 // Удаляются значения выше указанного
    upperStrict?: boolean;          // Использовать строго сравнение
    type?: MetricFilterType;        // Показывает, на каком этапе применяет фильтр метрик
}
