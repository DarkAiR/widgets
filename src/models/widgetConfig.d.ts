import { Paddings } from "./types";
/**
 * Конфиг для работы фабрики виджетов
 */
export declare class WidgetConfig {
    templateId: string;
    element: HTMLElement;
    showAxisX: boolean;
    showAxisY: boolean;
    padding: Paddings;
    margin: Paddings;
}
