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
        interface IValue {
            localDateTime: string;
            values: number[];
        }
        let valuesArr: IValue[] = [];
        data.forEach((dataValues: TSPoint[], idx: number) => {
            dataValues.forEach((v: TSPoint) => {
                let found: IValue = valuesArr.find((valueArrItem: IValue) => valueArrItem.localDateTime === v.localDateTime);
                if (!found) {
                    found = {localDateTime: v.localDateTime, values: []};
                    valuesArr.push(found);
                }
                found.values[idx] = v.value;
            });
        });

        valuesArr = valuesArr.sort((a: IValue, b: IValue) => new Date(a.localDateTime).getTime() - new Date(b.localDateTime).getTime());

        const result: Array<number[]> = [];
        for (let idx = 0; idx < data.length; idx++) {
            result[idx] = valuesArr.map(
                (valueArrItem: IValue) => valueArrItem.values[idx]
            );
        }
        return {
            dates: valuesArr.map((v: IValue) => v.localDateTime),
            values: result
        };
    }
}
