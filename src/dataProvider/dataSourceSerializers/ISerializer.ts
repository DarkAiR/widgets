import {DataSource} from "../../interfaces/graphQL";

/**
 * Интерфейс сериализатора
 * Преобразует указанный dataSource в строку для graphQL
 */
export interface ISerializer {
    serialize(dataSource: DataSource): string;
}
