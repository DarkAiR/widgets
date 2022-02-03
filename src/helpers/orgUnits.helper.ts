import {DataSource, DimensionFilter, TimeSeriesDataSetShort} from "../interfaces/graphQL";
import {TypeGuardsHelper} from "./typeGuards.helper";
import {IEventOrgUnits} from "../interfaces/events";
import {DataSet, JoinDataSetTemplate} from "../interfaces";

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
            for (const dimName in event.orgUnits) {
                if (!event.orgUnits.hasOwnProperty(dimName)) {
                    continue;
                }
                // NOTE: Нельзя проверять на event.orgUnits[dimName].length, т.к. тогда остануться данные с прошлого раза
                const dimIndex: number = dataSource.dimensions.findIndex((d: DimensionFilter) => d.name === dimName);
                if (dimIndex !== -1) {
                    // NOTE: Если пришли пустые orgUnits, то удаляем предыдущие
                    //       Это нужно для того, чтобы ранее установленные удалились
                    if (!event.orgUnits[dimName] || (Array.isArray(event.orgUnits[dimName]) && event.orgUnits[dimName].length === 0)) {
                        // Удаляем dimension
                        dataSource.dimensions.splice(dimIndex, 1);
                    } else {
                        dataSource.dimensions[dimIndex].values = event.orgUnits[dimName];
                    }
                } else {
                    // Пустые данные не приходят в виджет, поэтому dimension может и не быть
                    if (!event.orgUnits[dimName] || (Array.isArray(event.orgUnits[dimName]) && event.orgUnits[dimName].length === 0)) {
                        // Do nothing
                    } else {
                        const newFilter: DimensionFilter = {
                            name: dimName,
                            values: event.orgUnits[dimName],
                            expression: '',
                            groupBy: event.orgUnitsGroupBy.includes(dimName)
                        };
                        dataSource.dimensions.push(newFilter);
                    }
                }
                needReload = true;
            }
        }
        return needReload;
    }

    static setOrgUnitsForTable(dataSets: DataSet[], event: IEventOrgUnits): boolean {
        let needReload = false;
        if (TypeGuardsHelper.everyIsJoinDataSetTemplate(dataSets)) {
            dataSets.forEach((joinDataSet: JoinDataSetTemplate) => {
                joinDataSet.dataSetTemplates.forEach((v: TimeSeriesDataSetShort) => {
                    if (TypeGuardsHelper.isSingleDataSource(v.dataSource1)) {
                        for (const dimName in event.orgUnits) {
                            if (!event.orgUnits.hasOwnProperty(dimName)) {
                                continue;
                            }
                            // NOTE: Нельзя проверять на event.orgUnits[dimName].length, т.к. тогда останутся данные с прошлого раза
                            const dimIndex: number = joinDataSet.dimensions.findIndex((d: DimensionFilter) => d.name === dimName);
                            if (dimIndex !== -1) {
                                // NOTE: Если пришли пустые orgUnits от удаляем предыдущие
                                //       Это нужно для того, чтобы ранее установленные удалились
                                if (!event.orgUnits[dimName] || (Array.isArray(event.orgUnits[dimName]) && event.orgUnits[dimName].length === 0)) {
                                    // Удаляем dimension
                                    joinDataSet.dimensions.splice(dimIndex, 1);
                                } else {
                                    joinDataSet.dimensions[dimIndex].values = event.orgUnits[dimName];
                                    joinDataSet.dimensions[dimIndex].groupBy = event.orgUnits[dimName].length > 0;
                                }
                            } else {
                                // Пустые данные не приходят в виджет, поэтому dimension может и не быть
                                if (!event.orgUnits[dimName] || (Array.isArray(event.orgUnits[dimName]) && event.orgUnits[dimName].length === 0)) {
                                    // Do nothing
                                } else {
                                    const newFilter: DimensionFilter = {
                                        name: dimName,
                                        values: event.orgUnits[dimName],
                                        expression: '',
                                        groupBy: true
                                    };
                                    joinDataSet.dimensions.push(newFilter);
                                }
                            }
                            needReload = true;
                        }
                    }
                });
            });
        }
        return needReload;
    }
}
