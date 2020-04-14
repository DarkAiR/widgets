/**
 * Класс, содержащий экспортируемые типы в виде строк
 * Нужен в основном для экспорта содержимого литеральных типов и перечислений в JS
 */
import {ViewTypeValues} from "./typesGraphQL";

export class Constants {
    static viewType: string[] = (ViewTypeValues as unknown) as string[];
}
