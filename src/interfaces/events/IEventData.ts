import {ISettings} from "../ISettings";

/**
 * Обьект данных передаваемых по шине
 */
export interface IEventData extends ISettings {
    // NOTE: Делаем через обьект, т.к. cloneDeep в шине не умеет копировать функции как есть
    _cb?: {
        func: () => void;       // Callback для информирования внешней системы, что обработка события завершилась.
                                // Необходима из-за того, что шина не поддерживает Promise
    };

}
