import {cloneDeep as _cloneDeep, sortBy as _sortBy, values as _values, isEqual as _isEqual} from "lodash";
import {DataSetTemplate} from "../interfaces/template/dataSet";
import {DimensionFilter, DimensionInfo, DimensionUnit, TSPoint} from "../interfaces/graphQL";
import {TypeGuardsHelper} from "./typeGuards.helper";
import {DataProvider} from "../dataProvider";
import {INameValue} from "../interfaces";

interface CategoryData {
    [dataSetIdx: number]: Array<{value: [string, number, INameValue[]]}>;
}

export class CategoryDataHelper {
    /**
     * Получить данные по dimensions для всех dataSet
     * @param dataSets
     */
    static async getDimensionInfos(dataProvider: DataProvider, dataSets: DataSetTemplate[]): Promise<DimensionInfo[]> {
        const dimInfos: DimensionInfo[] = [];
        const cmp = (a: DimensionInfo, b: DimensionInfo) => a.name === b.name;

        let dataSet: DataSetTemplate;
        for (dataSet of dataSets) {
            if (TypeGuardsHelper.isSingleDataSource(dataSet.dataSource1)) {
                const res: DimensionInfo[] = await dataProvider.getDimensionsInfo(
                    dataSet.dataSource1.name,
                    dataSet.dataSource1.dimensions
                        .filter((d: DimensionFilter) => d.groupBy)
                        .map((d: DimensionFilter) => d.name)
                );
                const tmpArr: DimensionInfo[] = _cloneDeep(dimInfos);
                res.forEach((v1: DimensionInfo) => tmpArr.some((v2: DimensionInfo) => cmp(v1, v2)) ? false : dimInfos.push(v1));
            } else {
                throw new Error('AggregationDataSource not supported');
            }
        }
        return dimInfos;
    }

    /**
     * @param data Массив всех точек всех датасорсов
     * @param dimInfos Массив всех дименшинов
     */
    static createCategoryData(data: TSPoint[][], dimInfos: DimensionInfo[]): {
        labels: string[],
        data: CategoryData
    } {
        // Получить название dimension
        const getDimensionInfo = (name: string): string => dimInfos.find((v: DimensionInfo) => v.name === name).caption ?? name;

        // Получить комплексный ключ из dimensions
        const getDimensionKey = (v: TSPoint): INameValue[] => {
            return _sortBy(
                (v.dimensions || []).map((d: DimensionUnit): INameValue => ({
                    name: getDimensionInfo(d.name),
                    value: d?.entity?.name ?? d.value
                })),
                _values
            );
        };

        // Проверить что комплексный ключ уже существует
        const keyExist = (arr: INameValue[][], v1: INameValue[]): boolean => {
            return arr.some((v2: INameValue[]) => _isEqual(v1, v2));
        };

        // dimArr - список dimensions для каждой точки
        const dimArr: INameValue[][] = [];
        data.forEach((pointsValues: TSPoint[]) => {
            pointsValues.forEach((v: TSPoint) => {
                const key: INameValue[] = getDimensionKey(v);
                if (!keyExist(dimArr, key)) {
                    dimArr.push(key);
                }
            });
        });

        /*
              d1  d2  d3
        idx1  v1  v2  -
        idx2  -   v4  v3
         */

        // res - соотносим комплексные ключи значениям для всех dataSource
        // [[[key, value], ...], [[key, value], ...], ...]
        const res: [INameValue[], number][][] = [...new Array(data.length)].map(
            () => dimArr.map((v: INameValue[]) => [v, 0])
        );

        // Проходим по все исходным точкам
        data.forEach((pointsValues: TSPoint[], idx: number) => {
            pointsValues.forEach((v: TSPoint) => {
                // В массиве res[idx] находим нужный dimension и заполняем его данными
                const v1: INameValue[] = getDimensionKey(v);
                res[idx].some((v2: [INameValue[], number]) => {
                    if (_isEqual(v1, v2[0])) {
                        v2[1] = v.value;
                        return true;
                    }
                    return false;
                });
            });
        });

        const createKey = (v: INameValue[]): string => v.map((v2: INameValue): string => `${v2.value}`).join("\n");

        const resData: CategoryData = [];
        data.forEach((pointsValues: TSPoint[], idx: number) => {
            resData[idx] = res[idx].map((v: [INameValue[], number]) => ({
                value: [createKey(v[0]), v[1], v[0]]
            }));
        });
        return {
            labels: dimArr.map((v: INameValue[]): string => createKey(v)),
            data: resData
        };
    }
}
