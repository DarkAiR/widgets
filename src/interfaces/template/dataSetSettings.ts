import {ISettings} from "../ISettings";
import {YAxisTypes} from "../../models/types";

/**
 * Settings для источника данных
 * Ниже указаны обязательные поля, остальные могут быть произвольными
 */
export interface DataSetSettings extends ISettings {
    color: string;                      // Цвет графика
    yAxis: YAxisTypes;
}
