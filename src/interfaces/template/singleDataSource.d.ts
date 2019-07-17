/**
 * описание источника данных для dataSet'a
 */
import { DataSourceType } from './../../models/types';
export interface SingleDataSource {
    name: string;
    type: DataSourceType;
    dimensions: Array<{
        name: string;
        values: Array<string>;
    }>;
}
