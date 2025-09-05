/**
 * Класс, содержащий экспортируемые типы в виде строк
 * Нужен в основном для экспорта содержимого литеральных типов и перечислений в JS
 */
import {ViewTypeValues} from "../types";

export class Constants {
    static viewType: string[] = (ViewTypeValues as unknown) as string[];
}
