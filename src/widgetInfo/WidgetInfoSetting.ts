// Элемент настроек
import {IWidgetInfo} from "./IWidgetInfo";
import {SettingFunc, WidgetInfoSettings} from "./types";

/**
 * Создание конфига для экспорта
 * Все это нужно для того, чтобы можно было задавать конфиг строго в виде:
 * makeConfig({
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
export function makeConfig(cfg: IWidgetInfo<SettingFunc[]>): IWidgetInfo {
    const mainSettings: WidgetInfoSettings =  cfg.settings.map((v: SettingFunc) => v());
    const dataSetSettings: WidgetInfoSettings = cfg.dataSet.settings.map((v: SettingFunc) => v());
    return Object.assign(
        {},
        cfg, {settings: mainSettings},
        {dataSet: Object.assign({}, cfg.dataSet, {settings: dataSetSettings})}
    );
}
