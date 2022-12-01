import {DataSource, DimensionFilter} from "../interfaces/graphQL";
import {TypeGuardsHelper} from "./typeGuards.helper";
import {IEventKpi} from "../interfaces/events";

export class KpiHelper {
    static readonly KPI_DIMENSION: string = 'kpi';

    /**
     * Установить kpis в dataSource
     * @param {DataSource} dataSource
     * @param {IEventKpi} event - событие, переданное по шине
     * @return boolean needReload
     */
    static setKpi(dataSource: DataSource, event: IEventKpi): boolean {
        let needReload = false;
        if (TypeGuardsHelper.isSingleDataSource(dataSource)) {
            // Ищем нужный фильтр в списке уже установленных
            const dimIndex: number = dataSource.dimensions.findIndex((d: DimensionFilter) => d.name === KpiHelper.KPI_DIMENSION);
            if (dimIndex !== -1) {
                dataSource.dimensions[dimIndex].values = event.kpi ?? [];
            } else {
                // Фильтра еще нет
                dataSource.dimensions.push({
                    name: KpiHelper.KPI_DIMENSION,
                    values: event.kpi ?? [],
                    expression: '',
                    groupBy: false,
                });
            }
            needReload = true;
        }
        return needReload;
    }
}
