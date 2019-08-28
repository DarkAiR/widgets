import {IWidgetConfig} from "../interfaces";

export class SplineConfig implements IWidgetConfig {
    templateId: string;                     // ID шаблона
    element: HTMLElement = null;            // Контейнер для виджета
    title: string = '';
}
