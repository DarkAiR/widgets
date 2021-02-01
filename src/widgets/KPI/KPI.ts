import w from "./KPI.less";
import {settings as widgetSettings} from "./settings";
import {
    DataSet,
    DataSetTemplate, DataSourceInfo,
    IChartData,
    IEventOrgUnits,
    ISettings,
    IWidgetVariables, SingleDataSource,
    TSPoint
} from "../../interfaces";
import {
    forEach as _forEach
} from 'lodash';
import {AddVarFunc, Chart} from "../../models/Chart";
import {OrgUnitsHelper, SettingsHelper, TypeGuardsHelper} from "../../helpers";
import {IWidgetSettings} from "../../widgetSettings";
import {WidgetConfigInner} from "../..";
import {WidgetOptions} from "../../models/widgetOptions";

// Типы переменных
type VarNames = 'org units' | 'period' | 'start date' | 'finish date' | 'version filter';

export class KPI extends Chart {
    getVariables(): IWidgetVariables {
        const res: IWidgetVariables = {};
        const addVar: AddVarFunc<VarNames> = this.addVar(res);

        addVar(0, 'org units', 'OrgUnits', 'Выбирается в отдельном виджете');

        _forEach(this.config.template.dataSets, (v: DataSet, idx: number) => {
            if (TypeGuardsHelper.isDataSetTemplate(v)) {
                const nameStr: string = v.dataSource1.type === 'SINGLE' ? '(' + (<SingleDataSource>v.dataSource1).name + ')' : '';
                addVar(idx, 'period', 'Период', `${nameStr}: формат см. документацию по template-api`);
                addVar(idx, 'start date', 'Начало выборки', `${nameStr}: YYYY-mm-dd`);
                addVar(idx, 'finish date', 'Окончание выборки', `${nameStr}: YYYY-mm-dd`);
                addVar(idx, 'version filter', 'Версия', 'Версия');
            }
        });
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
        const points: TSPoint[][] = data.data as TSPoint[][];

        if (TypeGuardsHelper.everyIsDataSetTemplate(data.dataSets)) {
            const dataSetSettings: ISettings = data.dataSets[0].settings;
            const titleSettings = SettingsHelper.getTitleSettings(this.widgetSettings.settings, data.settings);
            const [value, valueStyle]: [string, string] = SettingsHelper.getSingleValueStyle(points[0][0].value || 0, this.getDataSetSettings(dataSetSettings, 'value'));

            this.config.element.innerHTML = this.renderTemplate({
                backgroundStyle: SettingsHelper.getBackgroundStyle(this.getWidgetSetting('background.color')),
                paddingStyle: SettingsHelper.getPaddingStyle(this.getWidgetSetting('paddings')),
                showTitle: titleSettings.show,
                title: titleSettings.name,
                titleStyle: titleSettings.style,
                value: value,
                valueStyle: valueStyle,
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
            console.groupCollapsed('KPI EventBus data');
            console.log(varName, '=', value);
            console.log('dataSourceId =', dataSourceId);
            console.groupEnd();
        }
        // NOTE: Делаем через switch, т.к. в общем случае каждая обработка может содержать дополнительную логику

        const dataSet: DataSetTemplate = this.config.template.dataSets[dataSourceId] as DataSetTemplate;
        let needReload = false;

        // Типизированный обязательный switch
        const switchArr: Record<VarNames, Function> = {
            'org units': () => {
                if (TypeGuardsHelper.everyIsDataSetTemplate(this.config.template.dataSets)) {
                    this.config.template.dataSets.forEach((v: DataSetTemplate) => {
                        // Отключаем группировку
                        const event: IEventOrgUnits = value as IEventOrgUnits;
                        event.orgUnitsGroupBy = [];

                        if (OrgUnitsHelper.setOrgUnits(v.dataSource1, event)) {
                            needReload = true;
                        }
                    });
                }
            },
            'start date':       () => { dataSet.from = value; needReload = true; },
            'finish date':      () => { dataSet.to = value; needReload = true; },
            'period':           () => { dataSet.period = value; needReload = true; },
            'version filter':   async () => {
                const dataSource: SingleDataSource = dataSet.dataSource1 as SingleDataSource;
                const dsInfo: DataSourceInfo = await this.config.dataProvider.getDataSourceInfo(dataSource.name);
                if (dsInfo.version && !dsInfo.version.hidden) {
                    dataSource.versionFilter = {
                        name: dsInfo.version.name,
                        upperTime: value + ''       // versionFilter (number -> string)
                    };
                    needReload = true;
                }
            }
        };
        await switchArr[varName]();

        return needReload;
    }

    getTemplate(): string {
        return `
            <div class="${w['widget']}" style="{{backgroundStyle}} {{paddingStyle}}">
                {{#showTitle}}
                <div class="${w['title']}" style="{{titleStyle}}">
                    {{title}}
                </div>
                {{/showTitle}}

                <div style='{{valueStyle}}'>{{value}}</div>
            </div>
        `;
    }
}
