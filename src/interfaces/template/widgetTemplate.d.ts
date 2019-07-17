import { DataSetTemplate } from './dataSetTemplate';
import { ViewType } from "../../models/types";
export interface WidgetTemplate {
    id: string | null;
    title: string;
    viewType: ViewType;
    dataSets: Array<DataSetTemplate>;
    _links: {
        self: {
            href: string;
        };
    };
}
