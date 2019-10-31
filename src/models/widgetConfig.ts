/**
 * Конфиг для работы фабрики виджетов
 */
import {EventBusWrapper} from 'goodteditor-event-bus';
import {DataProvider} from "../dataProvider";
import {WidgetTemplate} from "../interfaces";

export class WidgetConfig {
    templateId: string;                     // ID шаблона
    element: HTMLElement;                   // Контейнер для виджета
    apiUrl?: string;                        // Url для API на GraphQL (по-умолчанию используется дефолтный)
    eventBus?: EventBusWrapper;             // Шина данных
}

export class WidgetConfigInner extends WidgetConfig {
    dataProvider: DataProvider;             // Провайдер данных для перезагрузки данных виджетами
    template: WidgetTemplate;               // Шаблон для изменения и перезагрузки данных виджетами
}
