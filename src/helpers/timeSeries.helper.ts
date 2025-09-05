import {TSPoint} from "../interfaces/graphQL";
import {ISettings, DataSet} from '../interfaces';
import {Frequency} from "../types";
import {TypeGuardsHelper} from "./typeGuards.helper";
import {min as _min, max as _max, get as _get} from 'lodash';
import { DateHelper } from './date.helper';

export interface TimeSeriesData {
    dates: string[];            // [dateTime]
    values: Array<number[]>;    // [dateSetIndex][values]
}

export class TimeSeriesHelper {
    private static frequencyPriority: Record<Frequency, number> = {
        'NONE': 0,
        'HOUR': 1,
        'DAY': 2,
        'WEEK': 3,
        'MONTH': 4,
        'YEAR': 5,
        'ALL': 6
    };

    /**
     * Конвертирует данные TimeSeries в массив дат и массив значений
     * @return {
     *     dates: [dateTime]
     *     values: [dateSetIndex][values]
     * }
     * При этом dates.length === values[dateSetIndex].length
     */
    static convertTimeSeriesToData(data: TSPoint[][], dataSets: DataSet[], cutFrom: string = null, cutTo: string = null): TimeSeriesData {
        interface IValue {
            localDateTime: string;
            values: number[];
        }
        let valuesArr: IValue[] = [];

        // Находим самый короткий интервал частот
        const [shortestDataSetIdx, shortestFrequency] = TimeSeriesHelper.getShortestInterval(data, dataSets) as [number, Frequency];

        const interval: ISettings = {
            minTimeInInterval: Number.MAX_VALUE,    // Минимальное значение в интервале shortestIdx
            maxTimeInInterval: 0,                   // Максимальное значение в интервале shortestIdx
            minTime: Number.MAX_VALUE,              // Минимальное значение среди всех интервалов
            maxTime: 0                              // Минимальное значение среди всех интервалов
        };
        data.forEach((dataValues: TSPoint[], idx: number) => {
            dataValues.forEach((v: TSPoint) => {
                let found: IValue = valuesArr.find((valueArrItem: IValue) => valueArrItem.localDateTime === v.localDateTime);
                if (!found) {
                    found = {localDateTime: v.localDateTime, values: []};
                    valuesArr.push(found);
                    try {
                        const t: number = new Date(v.localDateTime).getTime();
                        interval.minTime = _min([t, interval.minTime]);
                        interval.maxTime = _max([t, interval.maxTime]);
                        if (shortestDataSetIdx === idx) {
                            interval.minTimeInInterval = _min([t, interval.minTimeInInterval]);
                            interval.maxTimeInInterval = _max([t, interval.maxTimeInInterval]);
                        }
                    } catch (e) {}
                }
                found.values[idx] = +_get(found.values, idx, 0) + v.value;
            });
        });

        // Расширяем самый мелкий датасет до самого большого времени
        let tmpDate: Date = null;
        while (interval.maxTimeInInterval < interval.maxTime) {
            tmpDate = new Date(interval.maxTimeInInterval);
            switch (shortestFrequency) {
                case 'HOUR':    tmpDate.setHours(tmpDate.getHours() + 1);           break;
                case 'DAY':     tmpDate.setDate(tmpDate.getDate() + 1);             break;
                case 'WEEK':    tmpDate.setDate(tmpDate.getDate() + 7);             break;
                case 'MONTH':   tmpDate.setMonth(tmpDate.getMonth() + 1);           break;
                case 'YEAR':    tmpDate.setFullYear(tmpDate.getFullYear() + 1);     break;
            }
            interval.maxTimeInInterval = tmpDate.getTime();
            const found: IValue = valuesArr.find((valueArrItem: IValue) => new Date(valueArrItem.localDateTime).getTime() === interval.maxTimeInInterval);
            if (!found) {
                valuesArr.push({
                    localDateTime: DateHelper.toISOString(tmpDate),
                    values: []
                });
            }
        }
        while (interval.minTimeInInterval > interval.minTime) {
            tmpDate = new Date(interval.minTimeInInterval);
            switch (shortestFrequency) {
                case 'HOUR':    tmpDate.setHours(tmpDate.getHours() - 1);           break;
                case 'DAY':     tmpDate.setDate(tmpDate.getDate() - 1);             break;
                case 'WEEK':    tmpDate.setDate(tmpDate.getDate() - 7);             break;
                case 'MONTH':   tmpDate.setMonth(tmpDate.getMonth() - 1);           break;
                case 'YEAR':    tmpDate.setFullYear(tmpDate.getFullYear() - 1);     break;
            }
            interval.minTimeInInterval = tmpDate.getTime();
            const found: IValue = valuesArr.find((valueArrItem: IValue) => new Date(valueArrItem.localDateTime).getTime() === interval.minTimeInInterval);
            if (!found) {
                valuesArr.push({
                    localDateTime: DateHelper.toISOString(tmpDate),
                    values: []
                });
            }
        }

        valuesArr = valuesArr.sort((a: IValue, b: IValue) => new Date(a.localDateTime).getTime() - new Date(b.localDateTime).getTime());

        // Обрезать данные по указанным датам
        const fromTime: number = cutFrom === null ? 0 : new Date(cutFrom).getTime();
        const toTime: number = cutTo === null ? Number.MAX_VALUE : new Date(cutTo).getTime();
        valuesArr = valuesArr.filter((v: IValue) => {
            const time: number = new Date(v.localDateTime).getTime();
            return time >= fromTime &&  time <= toTime;
        });

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

    /**
     * Получить частоту самого короткого интервала
     */
    static getShortestInterval(data: TSPoint[][], dataSets: DataSet[]): [number, Frequency] {
        let shortestFrequencyIdx: number = TimeSeriesHelper.frequencyPriority['ALL'];
        let shortestDataSetIdx: number = 0;
        data.forEach((dataValues: TSPoint[], idx: number) => {
            if (TypeGuardsHelper.isDataSetTemplate(dataSets[idx])) {
                const f: number = TimeSeriesHelper.frequencyPriority[dataSets[idx].frequency];
                if (f < shortestFrequencyIdx) {
                    shortestFrequencyIdx = f;
                    shortestDataSetIdx = idx;
                }
            }
        });
        return [shortestDataSetIdx, TimeSeriesHelper.swapFrequencyPriority()[shortestFrequencyIdx]];
    }

    /**
     * Получить частоту самого длинного интервала
     */
    static getLongestInterval(data: TSPoint[][], dataSets: DataSet[]): [number, Frequency] {
        let longestFrequencyIdx: number = TimeSeriesHelper.frequencyPriority['NONE'];
        let longestDataSetIdx: number = null;
        data.forEach((dataValues: TSPoint[], idx: number) => {
            if (TypeGuardsHelper.isDataSetTemplate(dataSets[idx])) {
                const f: number = TimeSeriesHelper.frequencyPriority[dataSets[idx].frequency];
                if (f > longestFrequencyIdx) {
                    longestFrequencyIdx = f;
                    longestDataSetIdx = idx;
                }
            }
        });
        return [longestDataSetIdx, TimeSeriesHelper.swapFrequencyPriority()[longestFrequencyIdx]];
    }

    /**
     * Увеличить частоту
     */
    static increaseFrequency(curr: Frequency, max: Frequency = 'ALL'): Frequency {
        const f: Record<Frequency, number> = TimeSeriesHelper.frequencyPriority;
        if (f[curr] >= f[max]) {
            return curr;
        }
        return TimeSeriesHelper.swapFrequencyPriority()[f[curr] + 1];
    }

    /**
     * Уменьшить частоту
     */
    static decreaseFrequency(curr: Frequency, min: Frequency = 'NONE'): Frequency {
        const f: Record<Frequency, number> = TimeSeriesHelper.frequencyPriority;
        if (f[curr] <= f[min]) {
            return curr;
        }
        let newFrequency: Frequency = TimeSeriesHelper.swapFrequencyPriority()[f[curr] - 1];
        if (newFrequency === 'WEEK') {
            newFrequency = TimeSeriesHelper.swapFrequencyPriority()[f[curr] - 2];
        }
        return newFrequency;
    }

    static compareFrequency(a: Frequency, b: Frequency): -1 | 0 | 1 {
        const f: Record<Frequency, number> = TimeSeriesHelper.frequencyPriority;
        return f[a] < f[b]
            ? -1
            : (f[a] > f[b] ? 1 : 0);
    }

    static calcInterval(dates: string[]): Frequency {
        const timestamps: number[] = dates.map((localDateTime: string) => new Date(localDateTime).getTime());
        const hours: number = Math.ceil((_max(timestamps) - _min(timestamps)) / (60 * 60 * 1000));
        return hours > 31 * 24 ? 'YEAR' :
            hours > 24 ? 'MONTH' :
            'DAY';
    }

    /**
     * Получить обратный массив
     */
    private static swapFrequencyPriority(): {[key: number]: Frequency} {
        return Object
            .entries(TimeSeriesHelper.frequencyPriority)
            .reduce(
                (all: {[key: number]: Frequency}, [key, value]: [Frequency, number]) => {
                    return {...all, [value]: key};
                }, {});
    }
}
