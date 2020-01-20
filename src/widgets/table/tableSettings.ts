import {INameValue, WidgetTemplateSettings} from "../../interfaces";

export interface TableSettings extends WidgetTemplateSettings {
    dimensionNames: INameValue[];       // название фильтра -> заголовок фильтра
    metricNames: INameValue[];          // название метрики -> заголовок метрики
}
