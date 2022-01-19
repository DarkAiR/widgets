/**
 * Конфиг для работы фабрики виджетов
 */
import {EventBusWrapper} from 'goodteditor-event-bus';
import {WidgetTemplate, IChart} from "../interfaces";
import {IDataProvider} from "../dataProvider";

export class WidgetConfig {
    templateId: string;                     // ID шаблона
    element: HTMLElement;                   // Контейнер для виджета
    apiUrl?: string;                        // Url для API на GraphQL (по-умолчанию используется дефолтный)
    eventBus?: EventBusWrapper;             // Шина данных
    dataProvider: IDataProvider;            // Провайдер данных для перезагрузки данных виджетами
    afterCreate: (widget: IChart) => Promise<void>;  // Функция, вызываемая после создания виджета до первого рендера
}

export class WidgetConfigInner extends WidgetConfig {
    template: WidgetTemplate;               // Шаблон для изменения и перезагрузки данных виджетами
}
