import {get as _get, isEmpty as _isEmpty, merge as _merge} from 'lodash';
import {IGradient, ISettings, XAxisData, YAxisData} from "../interfaces";
import {WidgetSettingsArray, WidgetSettingsItem} from "../widgetSettings/types";
import {SettingsGroupSetting} from "../widgetSettings/controls";
import {ChartType, LegendPos} from "../models/types";

export class SettingsHelper {
    /**
     * Возвращает настройку из сеттингов виджета
     * @param settings Объект с настройками
     * @param path название поля
     * @return возвращает значение того типа, к которому присваивается результат, поэтому нужен тип T
     */
    static getWidgetSetting<T = void>(config: WidgetSettingsArray, settings: ISettings, path: string): T {
        const item: WidgetSettingsItem = SettingsHelper.getWidgetSettingByPath(config, path.split('.'));
        return _get(settings, path, item.default);  // Если параметр описан, но не пришел в настройках, выставляем default
    }

    /**
     * Возвращает настройку из датасета
     * @param settings Объект с настройками
     * @param path название поля
     * @return возвращает значение того типа, к которому присваивается результат, поэтому нужен тип T
     */
    static getDataSetSettings<T = void>(config: WidgetSettingsArray, settings: ISettings, path: string): T {
        const item: WidgetSettingsItem = SettingsHelper.getWidgetSettingByPath(config, path.split('.'));
        return _get<T>(settings, path, item.default);   // Если параметр описан, но не пришел в настройках, выставляем default
    }

    /**
     * Получить конфигурацию настройки по пути до нее
     */
    static getWidgetSettingByPath(config: WidgetSettingsArray, parts: string[]): WidgetSettingsItem {
        if (!parts.length) {
            throw new Error('Path not found');
        }
        let item = config.find((v: WidgetSettingsItem) => v.name === parts[0]);
        if (!item) {
            throw new Error(`Attempt to get not described parameter "${parts.join('.')}"`);
        }
        if (parts.length === 1) {
            return item;
        }
        if ((item as SettingsGroupSetting).settings !== undefined) {
            let foundItem: WidgetSettingsItem = null;
            const newParts = parts.slice(1 - parts.length);
            (item as SettingsGroupSetting).settings.some((cfgRow: WidgetSettingsArray) => {
                try {
                    foundItem = SettingsHelper.getWidgetSettingByPath(cfgRow, newParts);
                    return true;
                } catch (e) {
                    return false;
                }
            });
            if (foundItem === null) {
                throw new Error(`Attempt to get not described parameter "${parts.join('.')}"`);
            }
            item = foundItem;
        }
        return item;
    }

    /**
     * Получить настройки title
     */
    static getTitleSettings(config: WidgetSettingsArray, settings: ISettings): {
        show: boolean,
        name: string,
        style: string
    } {
        const getSetting = <T = void>(path: string): T => SettingsHelper.getWidgetSetting<T>(config, settings, path);

        const titleStyle = [];
        titleStyle.push(`color: ${getSetting('title.color')}`);
        if (!_isEmpty(getSetting('title.size'))) {
            titleStyle.push(`font-size: ${getSetting('title.size')}px`);
        }
        titleStyle.push(`text-align: ${getSetting('title.align')}`);
        return {
            show: getSetting<boolean>('title.show'),
            name: getSetting<string>('title.name'),
            style: titleStyle.join(';')
        };
    }

    /**
     * Получить настройки legend
     */
    static getLegendSettings(config: WidgetSettingsArray, settings: ISettings): Object {
        const getSetting = <T = void>(path: string): T => SettingsHelper.getWidgetSetting<T>(config, settings, path);

        const align: LegendPos = getSetting('legend.position');
        const gap: number = +getSetting('legend.gap');
        let obj: ISettings = {};
        switch (align) {
            case "top":
                obj = {
                    orient: 'horizontal',
                    top: gap,
                };
                break;
            case "right":
                obj = {
                    orient: 'vertical',
                    right: gap,
                    top: 'middle'
                };
                break;
            case "bottom":
                obj = {
                    orient: 'horizontal',
                    bottom: gap,
                };
                break;
            case "left":
                obj = {
                    orient: 'vertical',
                    left: gap,
                    top: 'middle'
                };
                break;
        }
        const textStyle: ISettings = {};
        const color: string = getSetting('legend.color');
        if (!color) {
            textStyle.color = color;
        }
        _merge(obj, {
            show: getSetting('legend.show'),
            type: 'plain',
            align: 'left',
            textStyle: {
                ...textStyle
            }
        });
        return obj;
    }

    /**
     * Получить настройки fill для echarts
     */
    static getFillSettings(config: WidgetSettingsArray, settings: ISettings, chartType: ChartType): ISettings {
        const getSetting = <T = void>(path: string): T => SettingsHelper.getDataSetSettings<T>(config, settings, path);
        let obj: ISettings = {};

        if (getSetting<boolean>('fill.show')) {
            const gradient: IGradient = getSetting('fill.color');
            const color: ISettings = SettingsHelper.getGradientSettings(gradient);
            switch (chartType) {
                case 'LINE':
                    obj = {
                        areaStyle: {
                            color
                        }
                    };
                    break;
                case 'HISTOGRAM':
                    obj = {
                        itemStyle: {
                            color
                        }
                    };
                    break;
            }

        }
        return obj;
    }

    /**
     * Получить настройки градиента для echarts
     */
    static getGradientSettings(gradient: IGradient): ISettings {
        let angle: number = gradient.rotate % 360;
        if (angle < 0) {
            angle = 360 + angle;
        }
        // Переводим угол в координаты градиента
        const sin: number = Math.sin(angle / 180 * Math.PI) / 2;
        const cos: number = Math.cos(angle / 180 * Math.PI) / 2;
        let coords = [0.5 - cos, 0.5 - sin, 0.5 + cos, 0.5 + sin];
        coords = coords.map((v: number) => +v.toFixed(2));
        let colorsStart: number = 0;
        const colorsOffs: number = gradient.colors.length <= 1 ? 1 : 1 / (gradient.colors.length - 1);
        const colors: Object[] = gradient.colors.map((c: string) => {
            const res: Object = {
                offset: colorsStart,
                color: c
            };
            colorsStart += colorsOffs;
            return res;
        });
        return {
            type: 'linear',
            x: coords[0],
            y: coords[1],
            x2: coords[2],
            y2: coords[3],
            colorStops: colors
        };
    }

    /**
     * Получить настройки label для echarts
     * См. https://echarts.apache.org/en/option.html#series-line.label.formatter
     */
    static getLabelSettings(config: WidgetSettingsArray, settings: ISettings): ISettings {
        const getSetting = <T = void>(path: string): T => SettingsHelper.getDataSetSettings<T>(config, settings, path);
        const label: ISettings = {       // tslint:disable-line:no-any
            show: getSetting<boolean>('label.show')
        };
        if (label.show) {
            label.formatter = SettingsHelper.formatSingleValue(getSetting('label'));
            label.fontSize = getSetting<number>('label.fontSize');
            const color = getSetting<string>('label.color');
            if (!!color) {
                label.color = color;
            }
        }
        return {label: label};
    }

    /**
     * Получить настройки axis для echarts
     */
    static getXAxisSettings(
        axisData: XAxisData,
        axisIndex: number,
        formatter: any,                 // tslint:disable-line:no-any
        offset: number,
        hasHistogram: boolean,
        triggerEvent: boolean
    ): ISettings {
        const nameObj = {};
        if (axisData.name) {
            nameObj['name'] = axisData.name;
            nameObj['nameLocation'] = 'middle';
        }
        if (axisData.nameGap) {
            nameObj['nameGap'] = axisData.nameGap;
        }
        if (axisData.nameColor) {
            nameObj['nameTextStyle'] = {
                color: axisData.nameColor
            };
        }

        // Цифры
        const axisLabel: ISettings = {
            formatter,
            fontSize: 12
        };
        // Настройки оси
        const axisLine: ISettings = {
            lineStyle: {}
        };
        if (!!axisData.color) {
            axisLabel.color = axisData.color;
            axisLine.lineStyle.color = axisData.color;
        }

        const res = {
            id: axisIndex,          // Записываем в id реальный индекс оси
            type: 'category',
            show: axisData.show,
            position: axisData.position,
            boundaryGap: hasHistogram,
            offset: offset,
            triggerEvent,
            axisLabel,
            axisLine,
            // Насечки на оси
            axisTick: {
                show: axisData.showTick
            },
            // Сетка
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#e9e9e9',
                    width: 1,
                    type: 'dashes'
                }
            },
            data: null
        };
        _merge(res, nameObj);
        return res;
    }

    /**
     * Получить настройки axis для echarts
     */
    static getYAxisSettings(
        axisData: YAxisData,
        axisIndex: number,
        offset: number,
        nameRotate: number
    ): ISettings {
        const nameObj = {
            nameRotate
        };
        if (axisData.name) {
            nameObj['name'] = axisData.name;
            nameObj['nameLocation'] = 'middle';
        }
        if (axisData.nameGap) {
            nameObj['nameGap'] = axisData.nameGap;
        }
        if (axisData.nameColor) {
            nameObj['nameTextStyle'] = {
                color: axisData.nameColor
            };
        }

        // Цифры
        const axisLabel: ISettings = {
            fontSize: 12
        };

        // Настройки оси
        const axisLine: ISettings = {
            lineStyle: {}
        };

        if (!!axisData.color) {
            axisLabel.color = axisData.color;
            axisLine.lineStyle.color = axisData.color;
        }

        const res = {
            id: axisIndex,                          // Записываем в id реальный индекс оси
            type: 'value',
            show: axisData.show,
            position: axisData.position,
            min: axisData.min,
            max: axisData.max,
            offset: offset,
            splitNumber: 3,                         // На сколько делить ось
            // minInterval: maxY / 3,                  // Минимальный размер интервала
            // maxInterval: maxY / 3,                  // Максимальный размер интервала
            axisLabel,
            axisLine,
            // Насечки на оси
            axisTick: {
                show: axisData.showTick
            },
            // Сетка
            splitLine: {
                lineStyle: {
                    color: '#e9e9e9',
                    width: 1,
                    type: 'solid'
                }
            }
        };
        _merge(res, nameObj);
        return res;
    }

    /**
     * Возвращает строку стилей для background
     */
    static getBackgroundStyle(gradient: IGradient): string {
        if (!gradient.colors.length) {
            return '';
        }
        return gradient.colors.length === 1
            ? `background-color: ${gradient.colors[0]}; height: 100%;`
            : `background: linear-gradient(${(gradient.rotate + 90) % 360}deg, ${gradient.colors.join(', ')}); height: 100%;`;
    }

    /**
     * Возвращает строку стилей для background
     */
    static getPaddingStyle(paddings: ISettings): string {
        return 'padding: ' +
            `${+paddings.top}px ` +
            `${+paddings.right}px ` +
            `${+paddings.bottom}px ` +
            `${+paddings.left}px;`;
    }

    /**
     * Получить строку стилей для singleValue
     */
    static getSingleValueStyle(value: number, settings: ISettings): [string, string] {
        const valueStyle = [];
        valueStyle.push(`color: ${settings.color}`);
        if (!_isEmpty(settings.size)) {
            valueStyle.push(`font-size: ${settings.size}px`);
        }
        valueStyle.push(`text-align: ${settings.align}`);
        return [SettingsHelper.formatSingleValue(settings)({value}), valueStyle.join('; ')];
    }

    /**
     * Отформатировать singleValue
     */
    static formatSingleValue(settings: ISettings): Function {
        const delimiter: string = settings.delimiter || '.';
        const precision: number = settings.precision || 0;
        const measure: string = settings.showMeasure
            ? settings.measure
            : '';

        return (params: {value: string | number} | []): string => {
            let value: string = params['value'] + '';
            const v: number = parseFloat(value);
            const integer: string = v !== NaN ? ((v + '').split('.')[0] ?? '') : '';
            const fraction: string = v !== NaN ? ((v + '').split('.')[1] ?? '') : '';
            value = integer + (+precision === 0 ? '' : (delimiter + fraction.padEnd(precision, '0')));
            return value + measure;
        };
    }
}
