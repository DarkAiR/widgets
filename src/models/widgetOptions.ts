/**
 * Дополнительные опции, не связанные с настройками виджетов
 */
export class WidgetOptions {
    logs?: {
        render?: boolean;               // Render logs (default: true)
        eventBus?: boolean;             // Event bus logs (default: true)
        loadingTemplate?: boolean;      // Load template messages
    };
}
