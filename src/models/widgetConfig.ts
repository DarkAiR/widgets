import {Paddings, WidgetType} from "./types";

/**
 * Конфиг для работы фабрики виджетов
 */
export class WidgetConfig {
    type: WidgetType;                       // Тип виджета
    templateId: string;                     // ID шаблона

    element: HTMLElement = null;            // Контейнер для виджета
    showAxisX: boolean = false;
    showAxisY: boolean = false;
    padding: Paddings = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    };
    margin: Paddings = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    }
}
