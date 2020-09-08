/**
 * Конфиг для работы фабрики виджетов
 */
import {EventBusWrapper} from 'goodteditor-event-bus';
import {DataProvider} from "../dataProvider";
import {WidgetTemplate, IChart} from "../interfaces";

export class WidgetConfig {
    templateId: string;                     // ID шаблона
    element: HTMLElement;                   // Контейнер для виджета
    apiUrl?: string;                        // Url для API на GraphQL (по-умолчанию используется дефолтный)
    eventBus?: EventBusWrapper;             // Шина данных
    dataProvider: DataProvider;             // Провайдер данных для перезагрузки данных виджетами
    afterCreate: (widget: IChart) => void;  // Функция, вызываемая после создания виджета до первого рендера
}

export class WidgetConfigInner extends WidgetConfig {
    template: WidgetTemplate;               // Шаблон для изменения и перезагрузки данных виджетами
}
