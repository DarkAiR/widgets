import {IWidgetConfig} from "../interfaces";

export class IndicatorsTableConfig implements IWidgetConfig {
    templateId: string;                     // ID шаблона
    element: HTMLElement = null;            // Контейнер для виджета
    title: string = '';
}
