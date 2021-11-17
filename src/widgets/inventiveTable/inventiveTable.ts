import widgetStyles from "./inventiveTable.less";
import {settings as widgetSettings} from "./settings";

import {
    DimensionFilter, DimensionUnit,
    IChartData, IEventOrgUnits, INameValue, ISettings,
    IWidgetVariables, JoinDataSetTemplate, MetricUnit, TableRow, TimeSeriesDataSetShort
} from "../../interfaces";
import {map as _map, filter as _filter, keyBy as _keyBy, isEmpty as _isEmpty} from "lodash";
import {AddVarFunc, Chart} from "../../models/Chart";
import {DateHelper, OrgUnitsHelper, TypeGuardsHelper} from "../../helpers";
import {IWidgetSettings} from "../../widgetSettings";
import {WidgetConfigInner} from "../..";
import {WidgetOptions} from "../../models/widgetOptions";
import dayjs, {Dayjs} from "dayjs";
import {Frequency, MinWidth} from "../../types";

// NOTE: <VarNames | string> только для таблиц выставляем общие dimensions наружу
type VarNames = 'org units' | string;

interface TemplateRow {
    dimensions: string[];
    cols: Array<{
        value: string;      // NOTE: Отдельной переменной, чтобы в шаблонизаторе заработал if-else
    }>;
}

interface EmployeesDataItem {
    dimensions: string[];
    data: Array<TableRow | null>;   // Данные по колонкам по датам
}
interface EmployeesData {
    [uniqDimKey: string]: EmployeesDataItem;
}

export class InventiveTable extends Chart {
    constructor(config: WidgetConfigInner, options: WidgetOptions) {
        super(config, options);
        // Инициализация в конструкторе, чтобы можно было вызвать инициализацию переменных до первого рендера
        this.onEventBus = this.onEventBusFunc.bind(this);
    }

    getVariables(): IWidgetVariables {
        const res: IWidgetVariables = {};
        const addVar: AddVarFunc<VarNames> = this.addVar(res);

        addVar(0, 'org units', 'OrgUnits', 'Выбирается в отдельном виджете');

        // NOTE: Для таблицы существует только один источник, если его нет, то это Exception
        if (TypeGuardsHelper.isJoinDataSetTemplate(this.config.template.dataSets[0])) {
            const dimensions: string[] = _map(this.config.template.dataSets[0].dimensions, 'name');
            dimensions.forEach((dimName: string) => {
                addVar(0, dimName, dimName, '');
            });
        }

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
            points.sort((a: TableRow, b: TableRow) => {
                const v1: number = dayjs(a.localDateTime).valueOf();
                const v2: number = dayjs(b.localDateTime).valueOf();
                return v1 < v2 ? -1 : (v1 === v2 ? 0 : 1);
            });
            const columnNames: INameValue[] = this.getDataSetSettings(0, 'columnNames');

            // Массив значений по датам
            const localDateTimeArr: number[] = Array.from(new Set(
                points.map((v: TableRow) => dayjs(v.localDateTime).valueOf())
            ));

            /*
             Первая строка - основные колонки
             */
            const headersMainColumns: string[] = this.mapToNames(
                ['Date'],
                columnNames
            );
            const headersSecondColumns: string[] = localDateTimeArr.map((v: number) => this.getDateStr(dataSet.frequency, v));

            /*
             Вторая строка - дополнительные колонки
             */
            // Первая колонка
            const dimensions: string[] = _map(
                _filter(dataSet.dimensions, (v: DimensionFilter) => v.groupBy),
                (v: DimensionFilter) => v.name
            );
            const dimensionsName: string[] = this.mapToNames(
                dimensions,
                columnNames
            );
            // Остальные колонки
            const metrics: string[] = dataSet.dataSetTemplates.map(
                (v: TimeSeriesDataSetShort) => {
                    if (TypeGuardsHelper.isSingleDataSource(v.dataSource1)) {
                        return v.dataSource1.metric.name;
                    }
                    return '';
                }
            );
            const metricsName: string[] = this.mapToNames(
                metrics,
                columnNames
            );

            /*
             Получаем матрицу данных по сотрудникам
             */
            const employeesData: EmployeesData = this.getEmployeesData(points, localDateTimeArr, dimensions);

            // Заполняем строки
            const rows: TemplateRow[] = _map(employeesData, (emplItem: EmployeesDataItem) => {
                // Dimensions
                const row: Array<{value: string}> = [];
                // Metrics
                emplItem.data.forEach((r: TableRow) => {
                    if (r === null) {
                        metricsName.forEach(() => row.push({value: ''}));
                    } else {
                        r.metrics.forEach((metric: MetricUnit) => {
                            row.push({value: '' + (metric.value || '')});
                        });
                    }
                });
                return {
                    dimensions: [...emplItem.dimensions],
                    cols: row
                };
            });

            this.config.element.innerHTML = this.renderTemplate({
                title: this.getWidgetSetting('title'),
                headerStyle1: this.getHeaderStyle('header1'),
                headerStyle2: this.getHeaderStyle('header2'),
                cellStyle: this.getCellStyle(),
                cellSelectedStyle: this.getCellSelectedStyle(),
                columnStyle: this.getColumnStyle(),
                headersMainColumns,
                headersSecondColumns,
                dimensionsName,
                metricsName,
                rows
            });
        }
    }

    private getEmployeesData(points: TableRow[], localDateTimeArr: number[], dimensions: string[]): EmployeesData {
        const employeesData: EmployeesData = {};
        points.forEach((tableRow: TableRow) => {
            // Все дименшины из текущей строки
            const pointDimensionsName: {[dimName: string]: DimensionUnit} = _keyBy(tableRow.dimensions, 'name');

            // Проходим по все дименшинам из запроса и заполняем те, которые есть в строке данных
            const dimValues: string[] = dimensions.map((dimName: string) => {
                return pointDimensionsName[dimName].entity?.name || pointDimensionsName[dimName].value || '';
            });

            // Склеиваем все dimensions в один большой уникальный ключ
            const uniqDimKey: string =  dimValues.join('_');
            if (employeesData[uniqDimKey] === undefined) {
                employeesData[uniqDimKey] = {
                    dimensions: dimValues,
                    data: [...new Array(localDateTimeArr.length)].fill(null),
                };
            }
            const timeValue: number = dayjs(tableRow.localDateTime).valueOf();
            const localDateTimeIdx: number = localDateTimeArr.findIndex((t: number) => t === timeValue);
            if (localDateTimeIdx === -1) {
                throw new Error(`Increadable! Not found localDateTime index <${tableRow.localDateTime}> in array`);
            }
            employeesData[uniqDimKey].data[localDateTimeIdx] = tableRow;
        });
        return employeesData;
    }

    private getDateStr(frequency: Frequency, localDateTime: string | number): string {
        const date: Dayjs = dayjs(localDateTime);
        switch (frequency) {
            default:
            case "ALL":
                return date.format('DD.MM.YYYY');
            case "YEAR":
                return date.format('YYYY');
            case "MONTH":
                return DateHelper.getMonthsAbbr()[date.month()];
            case "WEEK":
            case "DAY":
                return date.format('DD.MM.YYYY');
            case "HOUR":
                return `${date.format('HH')}:00 - ${dayjs(date).add(1, 'hours').format('HH')}:00`;
        }
    }

    private mapToNames(src: string[], arr: INameValue[]): string[] {
        const res: string[] = [...src];
        arr.forEach((v: INameValue) => {
            const idx: number = res.findIndex((srcValue: string) => srcValue === v.name);
            if (idx !== -1) {
                res[idx] = v.value;
            }
        });
        return res;
    }

    private getHeaderStyle(settingName: string): string {
        const styles: string[] = [];
        const colorStr: string = this.getWidgetSetting(`${settingName}.color`);
        if (!_isEmpty(colorStr)) {
            styles.push(`color: ${colorStr}`);
        }
        const backgroundColorStr: string = this.getWidgetSetting(`${settingName}.backgroundColor`);
        if (!_isEmpty(backgroundColorStr)) {
            styles.push(`background-color: ${backgroundColorStr}`);
        }
        const fontSize: number = this.getWidgetSetting(`${settingName}.fontSize`);
        if (!_isEmpty(fontSize)) {
            styles.push(`font-size: ${fontSize}px`);
        }
        return styles.join(';');
    }

    private getCellStyle(): string {
        const styles: string[] = [];
        const cellFontSize: number = this.getWidgetSetting('cell.fontSize');
        if (!_isEmpty(cellFontSize)) {
            styles.push(`font-size: ${cellFontSize}px`);
        }
        return [
            this.getMinWidthStyle('cell'),
            styles.join(';')
        ].join(';');
    }

    private getCellSelectedStyle(): string {
        const styles: string[] = [];
        const cellSelectedColor: string = this.getWidgetSetting('cell.selectBackgroundColor');
        if (!_isEmpty(cellSelectedColor)) {
            styles.push(`background-color: ${cellSelectedColor}`);
        }
        return [
            this.getCellStyle(),
            styles.join(';')
        ].join(';');
    }

    private getColumnStyle(): string {
        const styles: string[] = [];
        const noWrap: boolean = this.getWidgetSetting('column.noWrap');
        if (noWrap) {
            styles.push(`white-space: nowrap`);
        }
        return [
            this.getHeaderStyle('column'),
            this.getMinWidthStyle('column'),
            styles.join(';')
        ].join(';');
    }

    private getMinWidthStyle(settingName: string): string {
        const cellMinWidth: MinWidth = this.getWidgetSetting(`${settingName}.minWidth`);
        const minWidthArr: Record<MinWidth, string> = {
            'auto': 'auto',
            '×1': 'calc(var(--spacer9) * 1)',
            '×1.5': 'calc(var(--spacer9) * 1.5)',
            '×2': 'calc(var(--spacer9) * 2)',
            '×2.5': 'calc(var(--spacer9) * 2.5)',
            '×3': 'calc(var(--spacer9) * 3)',
            '×4': 'calc(var(--spacer9) * 4)',
            '×5': 'calc(var(--spacer9) * 5)',
            '×6': 'calc(var(--spacer9) * 6)',
            '×7': 'calc(var(--spacer9) * 7)',
            '×8': 'calc(var(--spacer9) * 8)',
        };
        return `min-width: ${minWidthArr[cellMinWidth] ?? 'auto'}`;
    }

    /**
     * Обработка событий
     * NOTE: все данные меняются в this.config.template
     */
    // tslint:disable-next-line:no-any
    private async onEventBusFunc(varName: VarNames, value: any, dataSourceId: number): Promise<boolean> {
        if (this.options?.logs?.eventBus ?? true) {
            console.groupCollapsed('Inventive table EventBus data');
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
        };
        switchArr[varName]();

        return needReload;
    }

    getTemplate(): string {
        return `
            <div class="widget">
                {{#title}}
                    <h4>{{title}}</h4>
                {{/title}}
                <table class="table table-borders">
                <tbody>
                    <!-- header 1 -->
                    <tr style="{{headerStyle1}}">
                        {{#headersMainColumns}}
                        <td class="table-w-auto" colspan="{{dimensionsName.length}}">
                            <div class="mar-bot-3 nobr">{{.}}</div>
                        </td>
                        {{/headersMainColumns}}
                        {{#headersSecondColumns}}
                        <td class="table-w-auto" colspan="{{metricsName.length}}">
                            <div class="mar-bot-3 nobr text-center">{{.}}</div>
                        </td>
                        {{/headersSecondColumns}}
                    </tr>

                    <!-- header 2 -->
                    <tr style="{{headerStyle2}}">
                        {{#dimensionsName}}
                        <td class="min-width" >
                            <div class="mar-bot-3 nobr">{{.}}</div>
                        </td>
                        {{/dimensionsName}}
                        {{#headersSecondColumns}}
                            {{#metricsName}}
                            <td class="min-width">
                                <div class="mar-bot-3 nobr text-center">{{.}}</div>
                            </td>
                            {{/metricsName}}
                        {{/headersSecondColumns}}
                    </tr>

                    <!-- body -->
                    {{#rows}}
                    <tr>
                        {{#dimensions}}
                            <td style="{{columnStyle}}">{{.}}</td>
                        {{/dimensions}}
                        {{#cols}}
                            {{#value}}
                                <td style="{{cellSelectedStyle}}">
                                    <div class="text-center">
                                        {{value}}
                                    </div>
                                </td>
                            {{/value}}
                            {{^value}}
                                <td style="{{cellStyle}}">
                                    <div class="text-center">
                                        {{value}}
                                    </div>
                                </td>
                            {{/value}}
                        {{/cols}}
                    </tr>
                    {{/rows}}
                </tbody>
                </table>
            </div>
        `;
    }
}
