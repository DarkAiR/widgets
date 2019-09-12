import {forEach as _forEach, keys as _keys, map as _map} from "lodash";
import {SingleTimeSeriesValue} from "../interfaces/template/singleTimeSeriesValue";

export class TimeSeriesHelper {
    static convertTimeSeriesToData(data: Array<SingleTimeSeriesValue[]>): {
        dates: string[],
        values: Array<number[]>
    } {
        const valuesArr: Array<number[]> = [];
        _forEach(data, (dataValues: SingleTimeSeriesValue[], idx) => {
            _forEach(dataValues, (v: SingleTimeSeriesValue) => {
                if (valuesArr[v.localDateTime] === undefined) {
                    valuesArr[v.localDateTime] = [];
                }
                valuesArr[v.localDateTime][idx] = v.value;
            });
        });

        const result: Array<number[]> = [];
        for (let idx = 0; idx < data.length; idx++) {
            const arr: number[] = [];
            // Вот такой странный обход массива, т.к. это по факту объект
            for (const v in valuesArr) {
                arr.push(valuesArr[v][idx]);
            }
            result[idx] = arr;
        }
        return {
            dates: _keys(valuesArr),
            values: result
        };
    }
}
