/**
 * Типы для описания инициализации датасетов
 */
import {ViewType} from "../types";

export interface InitDataSetsItem {
    viewType: ViewType;
}

export type InitDataSets = InitDataSetsItem[];
