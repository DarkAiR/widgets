import {ISettings} from "../ISettings";

/**
 * Settings для всего виджета
 * Ниже указаны обязательные поля, остальные могут быть произвольными
 */
export interface WidgetTemplateSettings extends ISettings {
    title: string;
}
