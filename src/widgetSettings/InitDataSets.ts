/**
 * Типы для описания инициализации датасетов
 */
import {ViewType} from "../models/typesGraphQL";

export interface InitDataSetsItem {
    viewType: ViewType;
}

export type InitDataSets = InitDataSetsItem[];
