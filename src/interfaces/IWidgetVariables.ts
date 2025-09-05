export interface IWidgetVar {
    description?: string;           // Описание
    hint?: string;                  // Подсказка
    sortIndex: number;              // Порядок сортировки
}

export interface IWidgetVariables {
    [propName: string]: IWidgetVar;
}
