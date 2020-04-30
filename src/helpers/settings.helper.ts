import {get as _get} from 'lodash';
import {IGradient, ISettings} from "../interfaces";
import {WidgetSettingsArray, WidgetSettingsItem} from "../widgetSettings/types";
import {SettingsGroupSetting} from "../widgetSettings/settings";
import {ChartType} from "../models/types";

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
     * Получить настройки fill для echarts
     */
    static getFillSettings(config: WidgetSettingsArray, settings: ISettings, chartType: ChartType): ISettings {
        const getSetting = <T = void>(path: string): T => SettingsHelper.getDataSetSettings<T>(config, settings, path);
        let obj: ISettings = {};

        if (getSetting<boolean>('fill.show')) {
            const gradient: IGradient = getSetting('fill.color');
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
            const color = {
                type: 'linear',
                x: coords[0],
                y: coords[1],
                x2: coords[2],
                y2: coords[3],
                colorStops: colors
            };

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
     * Получить настройки label для echarts
     * См. https://echarts.apache.org/en/option.html#series-line.label.formatter
     */
    static getLabelSettings(config: WidgetSettingsArray, settings: ISettings): ISettings {
        const getSetting = <T = void>(path: string): T => SettingsHelper.getDataSetSettings<T>(config, settings, path);
        const label: ISettings = {       // tslint:disable-line:no-any
            show: getSetting<boolean>('label.show')
        };
        if (label.show) {
            const delimiter: string = getSetting('label.delimiter') || '.';
            const precision: number = getSetting('label.precision') || 0;
            const measure = getSetting<boolean>('label.showMeasure')
                ? getSetting<string>('label.measure')
                : '';

            label.formatter = (params: Object | []): string => {
                let value: string = params['value'] + '';
                const v: number = parseFloat(value);
                const integer: string = v !== NaN ? ((v + '').split('.')[0] ?? '') : '';
                const fraction: string = v !== NaN ? ((v + '').split('.')[1] ?? '') : '';
                value = integer + (+precision === 0 ? '' : (delimiter + fraction.padEnd(precision, '0')));
                return value + measure;
            };
            label.fontSize = getSetting<number>('label.fontSize');
            const color = getSetting<string>('label.color');
            if (!!color) {
                label.color = color;
            }
        }
        return {label: label};
    }
}
