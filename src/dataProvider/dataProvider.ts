import 'whatwg-fetch';
import {get as _get, defaultTo as _defaultTo} from 'lodash';
import {IGqlRequest} from "./IGqlRequest";
import {ServerType, ViewType, WidgetType} from "../models/types";
import {
    IChartData,
    WidgetTemplate,
    DataSet,
    DataSetTemplate,
    JoinDataSetTemplate,
    TimeSeriesDataSetShort, DataSource, ISettings, ResolveFunc, RejectFunc, DataSourceInfo, DimensionInfo
} from "../interfaces";
import * as stringifyObject from 'stringify-object';
import {TypeGuardsHelper} from "../helpers";
import {Serializer} from "./serializer";

type SerializeFunc = (dataSet: DataSet, server: ServerType, widgetType: WidgetType, hasEntity: boolean) => Promise<IGqlRequest | null>;

interface Cache {
    dataSources: DataSourceInfo[];
    dataSourcesPromise: Promise<DataSourceInfo[]>;
}

export class DataProvider {
    private readonly apiUrl: string;
    private cache: Cache = {
        dataSources: null,
        dataSourcesPromise: null,
    };

    private get gqlLink(): string {
        return (this.apiUrl || 'http://localhost') + '/graphql';
    }
    private get templatesLink(): string {
        return (this.apiUrl || 'http://localhost') + '/api/v1/templates';
    }
    private get authHeaders(): HeadersInit {
        const basicHash: string = localStorage.getItem('authToken') || '';
        return {
            ...(basicHash ? {'Authorization': 'Basic ' + basicHash} : {})
        };
    }

    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;
    }

    async getTemplate(templateId: string): Promise<WidgetTemplate> {
        const template = await fetch(this.templatesLink + '/' + templateId, {
            headers: {
                ...this.authHeaders
            }
        })
            .then(this.handleError)
            .then((response: Response) => response.json());
        return template;
    }

    async parseTemplate(template: WidgetTemplate, hasEntity: boolean = false): Promise<IChartData | null> {
        if (_get(template, 'dataSets', null) === null  ||  !template.dataSets.length) {
            return null;
        }
        const data: IChartData = {
            dataSets: template.dataSets,        // Копируется ссылка, поэтому можно менять dataSets и ничего не потеряется
            data: [],
            settings: _defaultTo(_get(template, 'settings'), {})
        };

        const requests: {request: string, resultProp: string}[] = await this.templateToRequests(template, hasEntity);

        // NOTE: idx - Сохраняем порядок dataSet
        const promises = template.dataSets.map(async (item: DataSet, idx: number) => {
            if (requests[idx]?.request ?? null) {
                data.data[idx] = await fetch(this.gqlLink, {
                    method: 'post',
                    body: requests[idx].request,
                    headers: {
                        'Content-Type': 'application/json',
                        ...this.authHeaders
                    },
                })
                    .then(this.handleError)
                    .then((resp: Response) => resp.json())
                    .then((res: ISettings) => {
                        if (res.errors.length) {
                            throw new Error(res.errors[0].message);
                        }
                        return res;
                    })
                    .then((resp: ISettings) => _defaultTo(_get(resp, requests[idx].resultProp), []));
            }
        });
        // Асинхронно загружаем все данные
        await Promise.all(promises);

        return data;
    }

    /**
     * Возвращает список запросов для graphQL по каждому dataSet
     * Также используется для экспорта данных
     */
    async templateToRequests(template: WidgetTemplate, hasEntity: boolean = false): Promise<{request: string, resultProp: string}[]> {
        if (_get(template, 'dataSets', null) === null  ||  !template.dataSets.length) {
            return null;
        }
        const loadData: Record<ViewType, {
            serializeFunc: SerializeFunc,
            resultProp: string,
            hasEntity?: boolean
        }> = {
            'DYNAMIC': {
                serializeFunc: this.serializeDynamicGQL,
                resultProp: 'data.getSingleTimeSeries'
            },
            'STATIC': {
                serializeFunc: this.serializeStaticGQL,
                resultProp: 'data.getStatic'
            },
            'REPORT': {
                serializeFunc: this.serializeReportGQL,
                resultProp: 'data.getReport'
            },
            'TABLE': {
                serializeFunc: this.serializeTableGQL,
                resultProp: 'data.getTableData',
                hasEntity: true
            },
            'DISTRIBUTION': {
                serializeFunc: this.serializeDistributionGQL,
                resultProp: 'data.getDistribution'
            },
            'PROFILE': {
                serializeFunc: this.serializeProfileGQL,
                resultProp: 'data.getProfile'
            }
        };

        const res: {request: string, resultProp: string}[] = [];

        // NOTE: idx - Сохраняем порядок dataSet
        const promises = template.dataSets.map(async (item: DataSet, idx: number) => {
            // Выбор типа item автоматически в фции сериализации
            const serializedData: string = await loadData[item.viewType].serializeFunc.call(
                this,
                item,
                template.server,
                template.widgetType,
                loadData[item.viewType].hasEntity ?? hasEntity
            );
            if (serializedData !== null) {
                res[idx] = {
                    request: JSON.stringify(serializedData),
                    resultProp: loadData[item.viewType].resultProp
                };
            }
        });
        // Асинхронно загружаем все данные
        await Promise.all(promises);

        return res;
    }

    async getDimensionsInfo(dataSourceName: string, dimensions: string[]): Promise<DimensionInfo[]> {
        const dataSource: DataSourceInfo = await this.getDataSourceInfo(dataSourceName);
        return dataSource
            ? dataSource.dimensions.filter((v: DimensionInfo) => dimensions.includes(v.name))
            : [];
    }

    async getDataSourceInfo(dataSourceName: string): Promise<DataSourceInfo> {
        const dataSource: DataSourceInfo = (this.cache.dataSources || []).find((info: DataSourceInfo) => info.name === dataSourceName);
        if (dataSource) {
            return dataSource;
        }

        return new Promise((resolve: ResolveFunc, reject: RejectFunc) => {
            fetch(this.gqlLink, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.authHeaders
                },
                body: JSON.stringify(this.makeGqlRequest(`
                    getDataSource(
                        dataSourceName: "${dataSourceName}"
                    ){name, caption, version{name, caption, hidden}, dimensions{name, caption, hidden, version}, metrics{name, caption}}
                `))
            }).then((response: Response) => {
                if (!response.ok) {
                    throw new Error();
                }
                return response.json();
            }).then((data: ISettings) => {
                return (data?.dataPresent || false)
                    ? (data?.data.getDataSource || null)
                    : null;
            }).then((data: DataSourceInfo) => {
                // Убираем версию
                // data.dimensions = data.dimensions.filter((v: DimensionInfo) => !v.version);

                if (this.cache.dataSources === null) {
                    this.cache.dataSources = [data];
                } else {
                    this.cache.dataSources.push(data);
                }
                resolve(data);
            }).catch(() => reject(null));
        });
    }

    async getDataSources(): Promise<DataSourceInfo[]> {
        if (this.cache.dataSources !== null) {
            return Promise.resolve(this.cache.dataSources);
        }
        if (this.cache.dataSourcesPromise !== null) {
            return this.cache.dataSourcesPromise;
        }
        this.cache.dataSourcesPromise = new Promise((resolve: ResolveFunc, reject: RejectFunc) => {
            fetch(this.gqlLink, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.authHeaders
                },
                body: JSON.stringify(this.makeGqlRequest(
                    'getDataSources{name, caption, version{name, caption, hidden}, dimensions{name, caption, hidden, version}, metrics{name, caption}}')
                )
            }).then((response: Response) => {
                if (!response.ok) {
                    throw new Error();
                }
                return response.json();
            }).then((data: ISettings) => {
                return (data?.dataPresent || false)
                    ? (data?.data.getDataSources || [])
                    : [];
            }).then((data: DataSourceInfo[]) => {
                this.cache.dataSources = data.map((ds: DataSourceInfo) => {
                    // Убираем версию
                    // ds.dimensions = ds.dimensions.filter((v: DimensionInfo) => !v.version);
                    return ds;
                });
                resolve(data);
            }).catch(() => {
                this.cache.dataSources = null;
                this.cache.dataSourcesPromise = null;
                reject(null);
            });
        });
        return this.cache.dataSourcesPromise;
    }

    private async handleError(response: Response): Promise<Response> {
        if (!response.ok) {
            let errStr = '';
            switch (response.status) {
                case 401:
                    errStr = 'Unauthorized';
                    break;
                default:
                    errStr = response.statusText;
                    if (!errStr) {
                        errStr = 'Unknown error';
                        try {
                            const json = await response.json();
                            errStr = json?.message || json?.error || errStr;
                        } catch (e) {
                            // Do nothing
                        }
                    }
                    break;
            }
            throw new Error(errStr);
        }
        return response;
    }

    /**
     * @return null - если не распознан тип dataSource или name === ''
     */
    private async serializeDataSource(dataSource: DataSource): Promise<string | null> {
        return Serializer.serialize(dataSource);
    }

    private async serializeDynamicGQL(dataSet: DataSetTemplate, server: ServerType, widgetType: WidgetType, hasEntity: boolean): Promise<IGqlRequest | null> {
        const dataSource = await this.serializeDataSource(dataSet.dataSource1);
        if (dataSource === null) {
            return null;
        }

        // NOTE: Типизировать возвращаемые данные не получится, т.к. не все поля являются строками
        //       Нр, frequency: HOUR, а значит, что не получится их сохранять в объекте и сериализовать
        //       потому что не получится отличить поле, которое должно быть обернуто в кавычки от других
        let dimensions: string = '';
        switch (widgetType) {
            case 'CATEGORY':
            case 'PIE':
                dimensions = `dimensions { name value entity {name, outerId} }`;
                break;
            default:
                dimensions = hasEntity ? 'dimensions { entity {name, outerId} }' : '';
                break;
        }
        return {
            operationName: null,
            variables: {},
            query: `
                {getSingleTimeSeries(
                    server: "${server}"
                    dataSet: {
                        ${this.getPeriod(dataSet)}
                        frequency: ${dataSet.frequency}
                        preFrequency: ${dataSet.preFrequency}
                        operation: ${dataSet.operation}
                        dataSource1: ${dataSource}
                    }
                ){
                    value
                    localDateTime
                    ${dimensions}
                }}`
        };
    }

    private async serializeTableGQL(dataSet: JoinDataSetTemplate, server: ServerType, widgetType: WidgetType, hasEntity: boolean): Promise<IGqlRequest | null> {
        const dataSetArr: string[] = [];

        await Promise.all(
            dataSet.dataSetTemplates.map(async (v: TimeSeriesDataSetShort) => {
                const dataSource = await this.serializeDataSource(v.dataSource1);
                if (dataSource !== null) {
                    dataSetArr.push(`{
                        preFrequency: ${v.preFrequency},
                        operation: ${v.operation},
                        dataSource1: ${dataSource}
                    }`);
                }
            })
        );

        const dimensionsJson: string = stringifyObject(dataSet.dimensions, {
            indent: ' ',
            singleQuotes: false
        }).replace(/\n/g, '');

        const dataSetTemplates: string = `[${dataSetArr.join(',')}]`;

        return {
            operationName: null,
            variables: {},
            query: `
                {getTableData(
                    server: "${server}"
                    dataSet: {
                        ${this.getPeriod(dataSet)}
                        frequency: ${dataSet.frequency}
                        dimensions: ${dimensionsJson}
                        dataSetTemplates: ${dataSetTemplates}
                    }
                ){
                    localDateTime
                    dimensions { name value ${hasEntity ? 'entity {name, outerId}' : ''}}
                    metrics { name value }
                }}`
        };
    }

    private async serializeReportGQL(dataSet: DataSetTemplate, server: ServerType, widgetType: WidgetType, hasEntity: boolean): Promise<IGqlRequest | null> {
        const dataSource1 = await this.serializeDataSource(dataSet.dataSource1);
        const dataSource2 = await this.serializeDataSource(dataSet.dataSource2);
        if (dataSource1 === null || dataSource2 === null) {
            return null;
        }

        return {
            operationName: null,
            variables: {},
            query: `
                {getReport(
                    server: "${server}"
                    dataSet: {
                        ${this.getPeriod(dataSet)},
                        frequency: ${dataSet.frequency}
                        preFrequency: ${dataSet.preFrequency}
                        operation: ${dataSet.operation}
                        methods: ["${dataSet.methods.join('", "')}"]
                        dataSource1: ${dataSource1}
                        dataSource2: ${dataSource2}
                    }
                ){
                    items {
                        key
                        value
                    }
                    ${hasEntity ? 'dimensions { entity {name, outerId} }' : ''}
                }}`
        };
    }

    private async serializeStaticGQL(dataSet: DataSetTemplate, server: ServerType, widgetType: WidgetType, hasEntity: boolean): Promise<IGqlRequest | null> {
        const dataSource1 = await this.serializeDataSource(dataSet.dataSource1);
        const dataSource2 = await this.serializeDataSource(dataSet.dataSource2);
        if (dataSource1 === null || dataSource2 === null) {
            return null;
        }

        return {
            operationName: null,
            variables: {},
            query: `
                {getStatic(
                    server: "${server}",
                    dataSet: {
                        ${this.getPeriod(dataSet)}
                        frequency: ${dataSet.frequency}
                        preFrequency: ${dataSet.preFrequency}
                        operation: ${dataSet.operation}
                        dataSource1: ${dataSource1}
                        dataSource2: ${dataSource2}
                    }
                ){
                    xValue
                    yValue
                    ${hasEntity ? 'dimensions { entity {name, outerId} }' : ''}
                }}`
        };
    }

    private async serializeProfileGQL(dataSet: DataSetTemplate, server: ServerType, widgetType: WidgetType, hasEntity: boolean): Promise<IGqlRequest | null> {
        const dataSource1 = await this.serializeDataSource(dataSet.dataSource1);
        if (dataSource1 === null) {
            return null;
        }

        return {
            operationName: null,
            variables: {},
            query: `
                {getProfile(
                    server: "${server}",
                    dataSet: {
                        ${this.getPeriod(dataSet)}
                        frequency: ${dataSet.frequency}
                        preFrequency: ${dataSet.preFrequency}
                        operation: ${dataSet.operation}
                        dataSource1: ${dataSource1}
                    }
                ){
                    value
                    xposition
                    ${hasEntity ? 'dimensions { entity {name, outerId} }' : ''}
                }}`
        };
    }

    private async serializeDistributionGQL(dataSet: DataSetTemplate, server: ServerType, widgetType: WidgetType, hasEntity: boolean): Promise<IGqlRequest | null> {
        const dataSource1 = await this.serializeDataSource(dataSet.dataSource1);
        if (dataSource1 === null) {
            return null;
        }

        return {
            operationName: null,
            variables: {},
            query: `
                {getDistribution(
                    server: "${server}",
                    dataSet: {
                        ${this.getPeriod(dataSet)}
                        frequency: ${dataSet.frequency}
                        preFrequency: ${dataSet.preFrequency}
                        operation: ${dataSet.operation}
                        dataSource1: ${dataSource1}
                        numberOfBeans: ${dataSet.numberOfBeans}
                    }
                ){
                    value
                    xposition
                    ${hasEntity ? 'dimensions { entity {name, outerId} }' : ''}
                }}`
        };
    }

    private getPeriod(dataSet: DataSet): string {
        return dataSet.period
            ? `period: "${dataSet.period}"`
            : `from: "${dataSet.from}"
               to: "${dataSet.to}"`;
    }

    private makeGqlRequest(query: string): IGqlRequest {
        return {
            operationName: null,
            variables    : {},
            query        : `{${query}}`
        };
    }
}
