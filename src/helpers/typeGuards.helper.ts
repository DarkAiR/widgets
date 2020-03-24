import {DataSet, DataSetTemplate, JoinDataSetTemplate} from "../interfaces/template/dataSet";
import {AggregationDataSource, DataSource, SingleDataSource} from "../interfaces/graphQL";

export class TypeGuardsHelper {
    static dataSetsIsDataSetTemplate(dataSets: DataSet[]): dataSets is DataSetTemplate[] {
        return dataSets.every((v: DataSet) => v.viewType !== 'TABLE');
    }

    static isDataSetTemplate(dataSet: DataSet): dataSet is DataSetTemplate {
        return dataSet.viewType !== 'TABLE';
    }

    static isJoinDataSetTemplate(dataSet: DataSet): dataSet is JoinDataSetTemplate {
        return dataSet.viewType === 'TABLE';
    }

    static isSingleDataSource(dataSource: DataSource): dataSource is SingleDataSource {
        return dataSource.type === 'SINGLE';
    }

    static isAggregationDataSource(dataSource: DataSource): dataSource is AggregationDataSource {
        return dataSource.type === 'AGGREGATION';
    }
}
