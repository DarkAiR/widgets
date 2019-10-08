/**
 * Конфиг для работы фабрики виджетов
 */
import {EventBusWrapper} from 'goodteditor-event-bus';

export class WidgetConfig {
    templateId: string;                     // ID шаблона
    element: HTMLElement;                   // Контейнер для виджета
    apiUrl?: string;                        // Url для API на GraphQL (по-умолчанию используется дефолтный)
    eventBus?: EventBusWrapper;             // Шина данных
}
