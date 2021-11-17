import widgetStyles from "./disciplineReport.less";
import {settings as widgetSettings} from "./settings";

import {
    DimensionFilter,
    IChartData, IEventOrgUnits,
    IWidgetVariables, JoinDataSetTemplate, TableRow, TimeSeriesDataSetShort, ISettings, DimensionUnit, MetricUnit, DataSet
} from "../../interfaces";
import {map as _map, filter as _filter} from "lodash";
import {AddVarFunc, Chart} from "../../models/Chart";
import {DateHelper, OrgUnitsHelper, SettingsHelper, TypeGuardsHelper} from "../../helpers";
import {IWidgetSettings} from "../../widgetSettings";
import {WidgetConfigInner} from "../..";
import {WidgetOptions} from "../../models/widgetOptions";
import dayjs, {Dayjs} from "dayjs";
import {Frequency} from "../../types";

type VarNames = 'org units' | 'employees';

interface DisciplineReportData {
    info: {
        id: number;
        fio: string;
        position: string;
    };
    lateness: {
        count: string;
        interval: string;
    };
    earlyDeparture: {
        count: string;
        interval: string;
    };
    rating: {
        value: string;
    };
}

export class DisciplineReport extends Chart {
    constructor(config: WidgetConfigInner, options: WidgetOptions) {
        super(config, options);
        // Инициализация в конструкторе, чтобы можно было вызвать инициализацию переменных до первого рендера
        this.onEventBus = this.onEventBusFunc.bind(this);
    }

    // TODO: Распространить на все остальные виджеты
    private help(): string {
        return `
            Дименшины:
            - Все дименшины (с groupBy) попадают в первую колонку в том порядке, в котором пришли в соотв. с версткой
            - Первый дименшин - ФИО сотрудника
            - Второй дименшин - должность
            - Остальные дименшины будут игнорироваться
            
            Источники данных:
            - 1: количество опозданий
            - 2: время опозданий в секундах
            - 3: количество ранних уходов
            - 4: время ранних уходов в секундах
            - 5: общее количество плановых смен (planned_shift_count)
            - Остальные источники будут игнорироваться
        `;
    }

    getVariables(): IWidgetVariables {
        const res: IWidgetVariables = {};
        const addVar: AddVarFunc<VarNames> = this.addVar(res);

        addVar(0, 'org units', 'OrgUnits', 'Выбирается в отдельном виджете');
        addVar(0, 'employees', 'Employees', 'Сотрудники');

        return res;
    }

    getSettings(): IWidgetSettings {
        return widgetSettings;
    }

    getStyles(): ISettings {
        return widgetStyles;
    }

    run(): void {
        const data: IChartData = this.chartData;
        const dataByDataSources: TableRow[][] = data.data as TableRow[][];

        // NOTE: Для таблицы существует только один источник, если его нет, то это Exception
        if (TypeGuardsHelper.isJoinDataSetTemplate(data.dataSets[0])) {
            const dataSet: JoinDataSetTemplate = data.dataSets[0];
            const points: TableRow[] = dataByDataSources[0];

            const dimensions: string[] = _map(
                _filter(dataSet.dimensions, (v: DimensionFilter) => v.groupBy),
                'name'
            );

            const metrics: string[] = dataSet.dataSetTemplates.map(
                (v: TimeSeriesDataSetShort) => {
                    if (TypeGuardsHelper.isSingleDataSource(v.dataSource1)) {
                        return v.dataSource1.metric.name;
                    }
                    return '';
                }
            );

            const maxLength: number = 5;
            if (metrics.length < maxLength) {
                throw new Error(`You should set up at least ${maxLength} metrics`);
            }

            // Готовим данные, формируем общий список метрик
            const header: string[] = [
                'Сотрудники',
                'Опоздания',
                'Ранний уход',
                'Плановые смены'
            ];

            const padd: Function = (num: number, size: number) => ([...new Array(size)].reduce((acc: string) => acc + '0', '') + num).substr(-size);

            let key = 1;
            const rows: DisciplineReportData[] = points
                .map((v: TableRow) => {
                    // FIXME: Здесь идет жесткая привязка к названиям dimensions и metrics
                    const employee = v.dimensions.find((d: DimensionUnit) => d.name === 'employee');
                    const position = v.dimensions.find((d: DimensionUnit) => d.name === 'positions');
                    const lateCount = v.metrics.find((d: MetricUnit) => d.name === 'late_count');
                    const timeLate = v.metrics.find((d: MetricUnit) => d.name === 'time_late');
                    const earlyDepartureCount = v.metrics.find((d: MetricUnit) => d.name === 'early_departure_count');
                    const timeEarlyDeparture = v.metrics.find((d: MetricUnit) => d.name === 'time_early_departure');
                    const plannedShiftCount = v.metrics.find((d: MetricUnit) => d.name === 'planned_shift_count');

                    const latenessDate: Dayjs = dayjs()
                        .set('hours', ~~(timeLate.value / 60 / 60))
                        .set('minutes', ~~((timeLate.value / 60) % 60))
                        .set('seconds', timeLate.value % 60);
                    const earlyDepartureDate: Dayjs = dayjs()
                        .set('hours', ~~(timeEarlyDeparture.value / 60 / 60))
                        .set('minutes', ~~((timeEarlyDeparture.value / 60) % 60))
                        .set('seconds', timeEarlyDeparture.value % 60);

                    const latenessCount: number = Number(lateCount.value);
                    const earlyCount: number = Number(earlyDepartureCount.value);

                    return {
                        info: {
                            id: key++,
                            fio: employee ? (employee.entity?.name ?? '') : '',
                            position: position ? (position.entity?.name ?? '') : '',
                        },
                        lateness: {
                            count: latenessCount.toFixed(0),
                            interval: `${padd(latenessDate.hour(), 2)}:${padd(latenessDate.minute(), 2)}`
                        },
                        earlyDeparture: {
                            count: earlyCount.toFixed(0),
                            interval: `${padd(earlyDepartureDate.hour(), 2)}:${padd(earlyDepartureDate.minute(), 2)}`
                        },
                        rating: {
                            value: Number(plannedShiftCount.value).toFixed(0)
                        }
                    };
                });

            const titleSettings = SettingsHelper.getTitleSettings(this.widgetSettings.settings, this.chartData.settings);

            this.config.element.innerHTML = this.renderTemplate({
                showTitle: titleSettings.show && titleSettings.name.trim().length ,
                title: titleSettings.name,
                titleStyle: titleSettings.style,
                backgroundStyle: SettingsHelper.getBackgroundStyle(this.getWidgetSetting('background.color')),
                paddingStyle: SettingsHelper.getPaddingStyle(this.getWidgetSetting('paddings')),
                header,
                rows
            });
        }
    }

    /**
     * Обработка событий
     * NOTE: все данные меняются в this.config.template
     */
    // tslint:disable-next-line:no-any
    private async onEventBusFunc(varName: VarNames, value: any, dataSourceId: number): Promise<boolean> {
        if (this.options?.logs?.eventBus ?? true) {
            console.groupCollapsed('DisciplineReport EventBus data');
            console.log(varName, '=', value);
            console.log('dataSourceId =', dataSourceId);
            console.groupEnd();
        }
        // NOTE: Делаем через switch, т.к. в общем случае каждая обработка может содержать дополнительную логику

        let needReload = false;

        // Типизированный обязательный switch
        const switchArr: Record<VarNames, Function> = {
            'org units': () => {
                needReload = OrgUnitsHelper.setOrgUnitsForTable(this.config.template.dataSets, value as IEventOrgUnits);
            },
            'employees': () => {
                needReload = this.processEmployees((value as Array<string | number>).map((v: number | string) => '' + v));
            }
        };
        switchArr[varName]();

        return needReload;
    }

    private processEmployees(employeeIds: string[]): boolean {
        let needReload = false;
        const dataSets: DataSet[] = this.config.template.dataSets;
        const dimName: string = 'employee';     // FIXME: здесь требуется конкретный dimension
        if (TypeGuardsHelper.everyIsJoinDataSetTemplate(dataSets)) {
            dataSets.forEach((joinDataSet: JoinDataSetTemplate) => {
                joinDataSet.dataSetTemplates.forEach((v: TimeSeriesDataSetShort) => {
                    if (TypeGuardsHelper.isSingleDataSource(v.dataSource1)) {

                        // NOTE: Нельзя проверять на event.orgUnits[dimName].length, т.к. тогда останутся данные с прошлого раза
                        const dimIndex: number = joinDataSet.dimensions.findIndex((d: DimensionFilter) => d.name === dimName);
                        if (dimIndex !== -1) {
                            joinDataSet.dimensions[dimIndex].values = employeeIds;
                            joinDataSet.dimensions[dimIndex].groupBy = true;
                        } else {
                            // Пустые данные не приходят в виджет, поэтому dimension может и не быть
                            const newFilter: DimensionFilter = {
                                name: dimName,
                                values: employeeIds,
                                expression: '',
                                groupBy: true
                            };
                            joinDataSet.dimensions.push(newFilter);
                        }
                        needReload = true;
                    }
                });
            });
        }
        return needReload;
    }

    getTemplate(): string {
        return `
            <div class="widget" style="{{backgroundStyle}} {{paddingStyle}}">
                {{#showTitle}}
                <div class="header">
                    <div class="title" style="{{titleStyle}}">
                        {{title}}
                    </div>
                </div>
                {{/showTitle}}
                
                <table class="table table-vmid table-borders">
                <thead>
                    <tr>
                        {{#header}}
                        <th class="table-w-auto color-grey text-small">
                            {{.}}
                        </th>
                        {{/header}}
                    </tr>
                </thead>
                <tbody>
                    {{#rows}}
                    <tr>
                        <td class="w-100" attr-key="{{info.id}}_1">
                            <div class="d-flex flex-v-center">
                                <div class="text-large text-bold mar-h-5">{{info.id}}</div>
                                <div class="text-left fio">
                                    <div>{{info.fio}}</div>
                                    <div class="color-grey text-small">{{info.position}}</div>
                                </div>
                            </div>
                        </td>
                        <td attr-key="{{info.id}}_2">
                            {{#lateness}}
                            <div class="d-flex flex-v-center">
                                <div class="badge badge-error
                                            text-small lateness
                                            mar-right-3
                                ">
                                    {{ count }}
                                </div>
                                <div class="color-red text-small">
                                    {{ interval }}
                                </div>
                            </div>
                            {{/lateness}}
                        </td>
                        <td attr-key="{{info.id}}_3">
                            {{#earlyDeparture}}
                            <div class="d-flex flex-v-center">
                                <div class="badge badge-error
                                            text-small earlyDeparture
                                            mar-right-3
                                ">
                                    {{ count }}
                                </div>
                                <div class="color-red text-small">
                                    {{ interval }}
                                </div>
                            </div>
                            {{/earlyDeparture}}
                        </td>
                        <td attr-key="{{info.id}}_4">
                            <div class="d-flex flex-h-end">
                                <div class="badge text-small rating">
                                    {{ rating.value }}
                                </div>
                            </div>
                        </td>
                    </tr>
                    {{/rows}}
                </tbody>
                </table>
            </div>
        `;
    }
}
