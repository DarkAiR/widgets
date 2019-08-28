import {IWidgetConfig} from "../interfaces";

export class SolidGaugeConfig implements IWidgetConfig {
    templateId: string;                     // ID шаблона
    element: HTMLElement = null;            // Контейнер для виджета
    title: string = '';
    icon: string = '';
}
