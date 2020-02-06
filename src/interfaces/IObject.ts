/**
 * Интерфейс для неизвестного объекта, нр для данных, приходящих по API
 */
export interface IObject {
    // tslint:disable:no-any
    [propName: string]: any;
}
