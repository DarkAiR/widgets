import {IWidgetConfig} from "../interfaces";

export class AverageNumberConfig implements IWidgetConfig {
    templateId: string;                     // ID шаблона
    element: HTMLElement = null;            // Контейнер для виджета
}
