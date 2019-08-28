import {Paddings} from "../models/types";

/**
 * Конфиг для работы фабрики виджетов
 */
export interface IWidgetConfig {
    templateId: string;                     // ID шаблона
    element: HTMLElement;                   // Контейнер для виджета
}
