import {DataSet, DataSetTemplate, JoinDataSetTemplate} from "../interfaces/template/dataSet";

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
}
