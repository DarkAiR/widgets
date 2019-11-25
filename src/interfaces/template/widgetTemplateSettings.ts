import {ISettings} from "../ISettings";
import {ServerType} from "../../models/types";

/**
 * Settings для всего виджета
 * Ниже указаны обязательные поля, остальные могут быть произвольными
 */
export interface WidgetTemplateSettings extends ISettings {
    title: string;

    // NOTE: настройки для конкретных виджетов должны объявляться в конкретных виджетах
}
