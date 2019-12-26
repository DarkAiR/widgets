import {IDataSourceBase} from "../../interfaces/template/IDataSourceBase";

/**
 * Интерфейс сериализатора
 * Преобразует указанный dataSource в строку для graphQL
 */
export interface ISerializer {
    serialize(dataSource: IDataSourceBase): string;
}
