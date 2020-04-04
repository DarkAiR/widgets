import {keys as _keys} from "lodash";
import {TSPoint} from "../interfaces/graphQL";

export interface TimeSeriesData {
    dates: string[];
    values: Array<number[]>;
}

export class TimeSeriesHelper {
    /**
     * Конвертирует данные TimeSeries в массив дат и массив значений
     * @return {
     *     dates: [dateTime]
     *     values: [dateSetIndex][values]
     * }
     * При этом dates.length === values[dateSetIndex].length
     */
    static convertTimeSeriesToData(data: TSPoint[][]): TimeSeriesData {
        const valuesArr: Array<number[]> = [];
        data.forEach((dataValues: TSPoint[], idx: number) => {
            dataValues.forEach((v: TSPoint) => {
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
