import w from "./productionPlan.less";
import {settings as widgetSettings} from "./settings";

import {
    DimensionFilter,
    IChartData, IEventOrgUnits, INameValue,
    IWidgetVariables, JoinDataSetTemplate, TableRow, TimeSeriesDataSetShort
} from "../../interfaces";
import {get as _get, map as _map, filter as _filter} from "lodash";
import {AddVarFunc, Chart} from "../../models/Chart";
import {DateHelper, SettingsHelper, TypeGuardsHelper} from "../../helpers";
import {IWidgetSettings} from "../../widgetSettings";
import {WidgetConfigInner} from "../..";
import {WidgetOptions} from "../../models/widgetOptions";
import dayjs, {Dayjs} from "dayjs";
import {Frequency} from "../../models/typesGraphQL";

type VarNames = 'org units';

interface ProductionPlanData {
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

export class ProductionPlan extends Chart {
    getVariables(): IWidgetVariables {
        const res: IWidgetVariables = {};
        const addVar: AddVarFunc<VarNames> = this.addVar(res);

        addVar(0, 'org units', 'OrgUnits', 'Выбирается в отдельном виджете');

        return res;
    }

    getSettings(): IWidgetSettings {
        return widgetSettings;
    }

    constructor(config: WidgetConfigInner, options: WidgetOptions) {
        super(config, options);
        // Инициализация в конструкторе, чтобы можно было вызвать инициализацию переменных до первого рендера
        this.onEventBus = this.onEventBusFunc.bind(this);
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

            if (metrics.length < 3) {
                throw new Error('You should set up at least 3 metrics');
            }

            // Готовим данные, формируем общий список метрик
            const header: string[] = this.mapToNames([
                'Сотрудники',
                ...metrics.splice(0, 3)
            ], this.getDataSetSettings(0, 'columnNames'));

            const rnd: Function = (v: number) => ~~(Math.random() * v);
            const padd: Function = (num: number, size: number) => ([...new Array(size)].reduce((acc: string) => acc + '0', '') + num).substr(-size);

            let key = 1;
            const rows: ProductionPlanData[] = points
                .map((v: TableRow) => {
                    const latenessDate: Dayjs = dayjs().set('hours', rnd(10));
                    const earlyDepartureDate: Dayjs = dayjs().set('hours', rnd(10));
                    return {
                        info: {
                            id: key++,
                            fio: ['Иванов', 'Петров', 'Сидоров'][rnd(3)] + ' ' + ['Олег', 'Иван', 'Василий'][rnd(3)] + ' ' + ['Андреевич', 'Иванович', 'Петрович'][rnd(3)],
                            position: ['Директор', 'Зам.директора', 'Работник'][rnd(3)],
                        },
                        lateness: {
                            count: Number(v.metrics[0].value).toFixed(0).substr(-2),
                            interval: `${padd(latenessDate.hour(), 2)}:${padd(latenessDate.minute(), 2)}`
                        },
                        earlyDeparture: {
                            count: Number(v.metrics[1].value).toFixed(0).substr(-2),
                            interval: `${padd(earlyDepartureDate.hour(), 2)}:${padd(earlyDepartureDate.minute(), 2)}`
                        },
                        rating: {
                            value: Number(v.metrics[2].value).toFixed(0)
                        }
                    };
                });

            const titleSettings = SettingsHelper.getTitleSettings(this.widgetSettings.settings, this.chartData.settings);

            this.config.element.innerHTML = this.renderTemplate({
                showTitle: titleSettings.show,
                title: titleSettings.name,
                titleStyle: titleSettings.style,
                backgroundStyle: SettingsHelper.getBackgroundStyle(this.getWidgetSetting('background.color')),
                paddingStyle: SettingsHelper.getPaddingStyle(this.getWidgetSetting('paddings')),
                header,
                rows
            });
        }
    }

    private getDateStr(frequency: Frequency, localDateTime: string): string {
        const date: Dayjs = dayjs(localDateTime);
        const frequencyFunc: Record<Frequency, Function> = {
            'NONE':     () => date.format('DD.MM.YYYY'),
            'ALL':      () => date.format('DD.MM.YYYY'),
            'YEAR':     () => date.format('YYYY'),
            'MONTH':    () => DateHelper.getMonthsAbbr()[date.month()],
            'WEEK':     () => date.format('DD.MM.YYYY'),
            'DAY':      () => date.format('DD.MM.YYYY'),
            'HOUR':     () => date.format('DD.MM.YYYY HH:mm'),
        };
        return frequencyFunc[frequency]() ?? date.format('DD.MM.YYYY');
    }

    private mapToNames(src: string[], arr: INameValue[]): string[] {
        arr.forEach((v: INameValue) => {
            const idx: number = src.findIndex((srcValue: string) => srcValue === v.name);
            if (idx !== -1) {
                src[idx] = v.value;
            }
        });
        return src;
    }

    /**
     * Обработка событий
     * NOTE: все данные меняются в this.config.template
     */
    // tslint:disable-next-line:no-any
    private async onEventBusFunc(varName: VarNames, value: any, dataSourceId: number): Promise<boolean> {
        if (this.options?.logs?.eventBus ?? true) {
            console.groupCollapsed('Table EventBus data');
            console.log(varName, '=', value);
            console.log('dataSourceId =', dataSourceId);
            console.groupEnd();
        }
        // NOTE: Делаем через switch, т.к. в общем случае каждая обработка может содержать дополнительную логику

        let needReload = false;

        // Типизированный обязательный switch
        const switchArr: Record<VarNames, Function> = {
            'org units': () => {
                needReload = this.processingOrgUnits(value as IEventOrgUnits);
            },
        };
        await switchArr[varName]();

        return needReload;
    }

    private processingOrgUnits(event: IEventOrgUnits): boolean {
        let needReload = false;
        if (TypeGuardsHelper.everyIsJoinDataSetTemplate(this.config.template.dataSets)) {
            this.config.template.dataSets.forEach((joinDataSet: JoinDataSetTemplate) => {
                joinDataSet.dataSetTemplates.forEach((v: TimeSeriesDataSetShort) => {
                    if (TypeGuardsHelper.isSingleDataSource(v.dataSource1)) {
                        for (const dimName in event) {
                            if (!event.hasOwnProperty(dimName)) {
                                continue;
                            }
                            // NOTE: Нельзя проверять на event[dimName].length, т.к. тогда остануться данные с прошлого раза
                            const dim: DimensionFilter = joinDataSet.dimensions.find((d: DimensionFilter) => d.name === dimName);
                            if (dim) {
                                dim.values = event[dimName];
                                dim.groupBy = event[dimName].length > 0;
                            } else {
                                const newFilter: DimensionFilter = {
                                    name: dimName,
                                    values: event[dimName],
                                    expression: '',
                                    groupBy: true
                                };
                                joinDataSet.dimensions.push(newFilter);
                            }
                            needReload = true;
                        }
                    }
                });
            });
        }
        return needReload;
    }

    getTemplate(): string {
        return `
            <div class="${w['widget']}" style="{{backgroundStyle}} {{paddingStyle}}">
                {{#showTitle}}
                <div class="${w['header']}">
                    <div class="${w['title']}" style="{{titleStyle}}">
                        {{title}}
                    </div>
                </div>
                {{/showTitle}}
                
                <table class="${w['table']} ${w['table-vmid']} ${w['table-borders']}">
                <thead>
                    <tr>
                        {{#header}}
                        <th class="${w['table-w-auto']} ${w['color-grey']} ${w['text-small']}">
                            {{.}}
                        </th>
                        {{/header}}
                    </tr>
                </thead>
                <tbody>
                    {{#rows}}
                    <tr>
                        <td class="${w['w-100']}" attr-key="{{info.id}}_1">
                            <div class="${w['d-flex']} ${w['flex-v-center']}">
                                <div class="${w['text-large']} ${w['text-bold']} ${w['mar-h-5']}">{{info.id}}</div>
                                <div class="${w['text-left']} ${w['fio']}">
                                    <div class="">{{info.fio}}</div>
                                    <div class="${w['color-grey']} ${w['text-small']}">{{info.position}}</div>
                                </div>
                            </div>
                        </td>
                        <td attr-key="{{info.id}}_2">
                            <div class="${w['d-flex']} ${w['flex-v-center']}">
                                <div class="${w['badge']} ${w['badge-error']}
                                            ${w['text-small']} ${w['lateness']}
                                            ${w['mar-right-3']}
                                ">
                                    {{ lateness.count }}
                                </div>
                                <div class="${w['color-red']} ${w['text-small']}">{{ lateness.interval }}</div>
                            </div>
                        </td>
                        <td attr-key="{{info.id}}_3">
                            <div class="${w['d-flex']} ${w['flex-v-center']}">
                                <div class="${w['badge']} ${w['badge-error']}
                                            ${w['text-small']} ${w['earlyDeparture']}
                                            ${w['mar-right-3']}
                                ">
                                    {{ earlyDeparture.count }}
                                </div>
                                <div class="${w['color-red']} ${w['text-small']}">{{ earlyDeparture.interval }}</div>
                            </div>
                        </td>
                        <td attr-key="{{info.id}}_4">
                            <div class="${w['d-flex']} ${w['flex-h-end']}">
                                <div class="${w['badge']}
                                            ${w['text-small']} ${w['rating']}
                                ">
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
