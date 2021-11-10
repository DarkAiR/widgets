/**
 * Типы для описания инициализации датасетов
 */
import {ViewType} from "../types/graphQL";

export interface InitDataSetsItem {
    viewType: ViewType;
}

export type InitDataSets = InitDataSetsItem[];
