import {DataSetTemplate} from "../../interfaces";

export interface ISerializer {
    serialize(dataSet: DataSetTemplate): string;
}
