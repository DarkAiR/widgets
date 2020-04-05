// Элемент настроек
import {IWidgetSettings} from "./IWidgetSettings";
import {SettingFunc, WidgetSettingsArray} from "./types";

/**
 * Создание конфига для экспорта
 * Все это нужно для того, чтобы можно было задавать конфиг строго в виде:
 * makeSettings({
 *     settings: [
 *         makeYourType(name, def)
 *     ]
 * }
 *
 * и пресечь вариант:
 *     settings: [
 *         {name: 'ttt', type: 'string', default: def}      <-- здесь можно указать любые другие поля, что недопустимо
 *     ]
 */
export function makeSettings(cfg: IWidgetSettings<SettingFunc[]>): IWidgetSettings {
    const mainSettings: WidgetSettingsArray =  cfg.settings.map((v: SettingFunc) => v());
    const dataSetSettings: WidgetSettingsArray = cfg.dataSet.settings.map((v: SettingFunc) => v());
    return Object.assign(
        {},
        cfg,
        {settings: mainSettings},
        {dataSet: Object.assign({}, cfg.dataSet, {settings: dataSetSettings})}
    );
}
