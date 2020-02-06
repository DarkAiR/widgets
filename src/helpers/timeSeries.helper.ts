import {forEach as _forEach, keys as _keys, map as _map} from "lodash";
import {TSPoint} from "../interfaces/graphQL/TSPoint";

export interface TimeSeriesData {
    dates: string[];
    values: Array<number[]>;
}

export class TimeSeriesHelper {
    /**
     * Конвертирует данные TimeSeries в массив дат и массив значений
     */
    static convertTimeSeriesToData(data: TSPoint[][]): TimeSeriesData {
        const valuesArr: Array<number[]> = [];
        _forEach(data, (dataValues: TSPoint[], idx: number) => {
            _forEach(dataValues, (v: TSPoint) => {
                if (valuesArr[v.localDateTime] === undefined) {
                    valuesArr[v.localDateTime] = [];
                }
                valuesArr[v.localDateTime][idx] = v.value;
            });
        });

        const result: Array<number[]> = [];
        for (let idx = 0; idx < data.length; idx++) {
            const arr: number[] = [];
            // Вот такой странный обход массива, т.к. это по факту объект (forEach не заработает)
            for (const v in valuesArr) {
                if (valuesArr.hasOwnProperty(v)) {
                    arr.push(valuesArr[v][idx]);
                }
            }
            result[idx] = arr;
        }
        return {
            dates: _keys(valuesArr),
            values: result
        };
    }
}
