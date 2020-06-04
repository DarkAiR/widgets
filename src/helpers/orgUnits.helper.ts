import {DataSource, DimensionFilter, SingleDataSource} from "../interfaces/graphQL";
import {TypeGuardsHelper} from "./typeGuards.helper";
import {IEventOrgUnits} from "../interfaces/events";

export class OrgUnitsHelper {
    /**
     * Установить orgUnits в dataSource
     * @param dataSource
     * @param event
     * @return boolean needReload
     */
    static setOrgUnits(dataSource: DataSource, event: IEventOrgUnits): boolean {
        let needReload = false;
        if (TypeGuardsHelper.isSingleDataSource(dataSource)) {
            for (const dimName in event) {
                if (!event.hasOwnProperty(dimName)) {
                    continue;
                }
                // NOTE: Нельзя проверять на event[dimName].length, т.к. тогда остануться данные с прошлого раза
                const dim: DimensionFilter = dataSource.dimensions.find((d: DimensionFilter) => d.name === dimName);
                if (dim) {
                    dim.values = event[dimName];
                } else {
                    // Пустые данные не приходят в виджет, поэтому dimension может и не быть
                    const newFilter: DimensionFilter = {
                        name: dimName,
                        values: event[dimName],
                        expression: '',
                        groupBy: false
                    };
                    dataSource.dimensions.push(newFilter);
                }
                needReload = true;
            }
        }
        return needReload;
    }
}
