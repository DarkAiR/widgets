import {ISettings} from "../ISettings";

/**
 * Settings для источника данных
 * Ниже указаны обязательные поля, остальные могут быть произвольными
 */
export interface DataSetSettings extends ISettings {
    color: string;                      // Цвет графика
}
