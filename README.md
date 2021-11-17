# abc-charts

The library for visualisation data via charts.

### Install

```npm
npm i abc-charts --save
```

### Exported modules

- ```abc-charts``` - almost all the modules, except below
- ```abc-charts/widgetFactory``` - factory to create widgets
- ```abc-charts/widgetConfig``` - config to provide to the widget factory
- ```abc-charts/dataProvider``` - data provider for GraphQL
- ```abc-charts/constants``` - constants for using in selectors only
- ```abc-charts/settings``` - widget settings, helping functions and controls
- ```abc-charts/types``` - general types

### Usage

Importing needed classes

```js
import {WidgetConfig} from 'abc-charts/widgetConfig';
import {WidgetFactory} from 'abc-charts/widgetFactory';     // Фабрика
import {DataProvider} from "abc-charts/dataProvider";       // Провайдер данных
import {Constants} from "abc-charts/constants";             // Значения литеральных типов и перечислений
import {SomeInterface} from 'abc-charts/interfaces';
import {SomeType} from 'abc-charts/types';
```

If your intergration system does not includes "material design" or needed fonts you can import these from the "abc-charts".  
For example:

```
TypeScript:
require('abc-charts/styles.css');
```
```
Less/Scss:
@import '~abc-charts/styles.css';
```

Running WidgetFactory to draw widget from template.
Also you can use Promise for receiving signals about complete of loading widget or errors.

*(Looking example below...)*

Interface IChart has method for getting available variables for EventBus:
```
interface IChart {
    getVariables(): IWidgetVariables;
    ...
}
```
where IWidgetVariables is
```
{
    <VAR_NAME>: {
        description?: string;
    }
}
```

###### *Full example with massive sending*
*Service:*
```
class EventBusService {
    private eventBus: EventBus = null;

    constructor() {
        this.eventBus = new EventBus();
        this.eventBus.useStateDeferredMerging = false;
    }

    getWrapper(): EventBusWrapper {
        return new EventBusWrapper(this.eventBus);
    }

    appendWidgetVariables(eventBusWrapper: EventBusWrapper, widgetVars: IWidgetVariables): void {
        eventBusWrapper.varAliases = [...Object.keys(widgetVars), '_cb']
            .reduce((obj, key) => {
                obj[key] = {listen: key, trigger: key};
                return obj;
            }, {})
    }

    async sendMassive(eventBusWrapper: EventBusWrapper, widgetVars: IWidgetVariables, values: NameValue[]): Promise<void> {
        return new Promise(resolve => {
            let params: IEventData = {
                _cb: {
                    func: resolve
                }
            };
            values.forEach((v: NameValue) => {
                const regExp: RegExp = new RegExp(`^${v.name}`, 'g')
                params = {
                    ...params,
                    ...Object.keys(widgetVars)
                        .filter(v => regExp.test(v))
                        .reduce((obj, key) => {
                            obj[key] = v.value;
                            return obj;
                        }, {})
                };
            });
            eventBusWrapper.triggerStateChange(params);
        }
    }
}
```

*Main code:*
```
class Example {
    private widget: IChart = null;

    create() {
        const eventBusWrapper: EventBusWrapper = eventBusService.getWrapper();
        
        this.widgetConfig = new WidgetConfig();
        this.widgetConfig.apiUrl = <API URL>;
        this.widgetConfig.eventBus = eventBus;
        this.widgetConfig.templateId = <TEMPLATE ID>;
        this.widgetConfig.element = <HTMLElement>;
        this.widgetConfig.afterCreate = async (widget: IChart): Promise<void> => {
            // Function call after create before the first render
            const widgetVars: IWidgetVariables = widget.getVariables();
            eventBusService.appendWidgetVariables(eventBusWrapper, widgetVars);
        
            // First init of widget variables
            await eventBusService.sendMassive(eventBusWrapper, widgetVars, [
                {name: 'start date', value: DateHelper.yyyymmdd(new Date())},
                {name: 'finish date', value: DateHelper.yyyymmdd(new Date())},
            ]);
        }
        
        (new WidgetFactory).run(this.widgetConfig, <options?: WidgetOptions>).then(
            (widget: IChart) => this.widget = widget,
            (err) => <ERROR FUNCTION>
        );
    }

    destroy() {
        if (this.widget) {
            this.widget.destroy();      // Unsubscribe
            this.widget = null
        }
    }
}
```

#### Basic auth

The authorization hash stored in the LocalStorage.
The integration product must control authentication on its own and store it in LocalStorage using the “authToken” key.
```
localStorage.setItem('authToken', btoa('login:pass'))
```

#### Prevent logs

You can hide logs specify WidgetOptions when creating the widget via WidgetFactory.
```
(new WidgetFactory).run(config: WidgetConfig, options: WidgetOptions);
```
where
```
WidgetOptions {
    logs?: {
        render?: boolean;               // Render logs (default: true)
        eventBus?: boolean;             // Event bus logs (default: true)
    };
}        
```  

-----------------------

## Local development

Use ```npm link``` for making reference to package ```widget-render``` from your package.

For example:
```
# cd widget-render/lib
# npm link
# cd YOUR_PACKAGE
# npm link abc-charts
```

Don't forget local link will be reset after any npm-operations in your package.

### Добавление нового виджета

**NOTE:** Все названия директорий и компонентов в **lowerCamelCase**

**NOTE:** CodeStyle регламентируется файлом ```tslint.json```. Требуется настроить свою IDE для работы с правилами линтера.

- Создаем (копируем из существующего виджета) директорию видa
```
/src/widgets/<widgetName>/
  ⎣ index.ts
  ⎣ <widgetName>.ts
  ⎣ <widgetName>.less
  ⎣ settings.ts
```
Уникальное имя файла нужно для того, чтобы имена классов собирались изолировано.

Текущее правило для css-классов [name]-[local].
В противном случае классы виджетов пересекуться и использовать их на одной странице станет затруднительно.


- Добавляем в /src/widgets/index.ts экспорт.

```
export * from './<widgetName>';
```
В ```WidgetFactory``` классы автоматически импортируются в скоуп widgets.

- Обрабатываем в WidgetFactory
```
private createWidget(...) {
    ...
    const widgetsArr: WidgetsArr = {
        ...
        "WIDGET_TYPE": () => widgets.YourWidget,
    }
}
```

- Добавляем новый тип виджета в файл```src/models/types.ts```

```type WidgetType = ... | 'WIDGET_TYPE' ```

### Deploy

- Меняем версию в ```package-lib.json```
- Корректно вносим изменения в ```CHANGELOG.md```
- Вызываем ```npm run npm:publish```

### Структура виджета

#### ```<widgetName>.ts```
Компонент виджета наследуется от класса ```Chart``` , который, в свою очередь, реализует интерфейс ```IChart```, для управления виджетом из вызывающего проекта.

В компоненте необходимо реализовать все abstract методы, в частности метод ```run```,

*Реализация метода ```run``` не регламентирована ничем, кроме CodeStyle, и каждый виджет может быть написан с использованием уникальных для него подходов (нр, HTML-верстка, SVG, echarts и т.д.).*

##### run()
Запуск виджета.  
Принимает конфигуратор с DOM-элементом, куда записывает результат своей работы.

##### destroy()
Уничтожает виджет, в частности все обработчики, которые на него повешаны.

##### redraw()
Перерисовать виджет с текущими данными без пересоздания самого виджета.

----

##### getVariables(): IWidgetVariables
Возвращает переменные для общения по шине.
*NOTE: Реализовано через generic, чтобы гарантировать правильное использование. Не менять!*
```
getVariables(): IWidgetVariables {
    const res: IWidgetVariables = [];
    const addVar = this.addVar(res);
    addVar(<dataSourceIndex>, 'varName', 'varDesc', 'varHint');
    return res;
} 
```

**Если по шине передаются данные привязанные к конкретным dimensions, надо ОБЯЗАТЕЛЬНО проверять, есть ли такие dimensions (нр, organizationUnit) и не добавлять внешнее событие через addVar, если dimensions нет.**

----
##### onEventBus: (ev: EventBusEvent, eventObj: IEventData) => void
Обработчик сообщений от шины.    
*NOTE: Реализован через переменную, для сохранения контекста вызова*

----
##### getSettings: IWidgetSettings
Возвращает настройки конкретного виджета для доступа в базовом классе.
Сделано через метод, чтобы нельзя было забыть про возврат этих значений (нр, в противовес вызову super.run())

##### getTemplate(): string | null
Получить шаблон. Если не перегружена (null), то шаблонизатор не используется.

##### onResize: (width: number, height: number) => void
Обработчик изменения размера.   
*NOTE: Реализован через переменную, для сохранения контекста вызова*

#### ```<widgetName>.less```

Файл стилей, который будет собран в изолированное пространство css-классов, исходя из уникальности имени файла.

#### ```settings.ts```

Файл с настройками, уникальными для конкретного виджета.
См. ниже "Добавление нового типа настройки"


### Шаблонизатор

В проекте используется шаблонизатор [hogan.js](https://twitter.github.io/hogan.js/) синтаксис которого базируется на [mustache.js](https://github.com/janl/mustache.js#usage)

#### Пример использования

Если нужно рендерить вручную, то можно не переопределять метод ```getTemplate```.

```
class Widget extends Chart {
    run() {
        const output = this.renderTemplate({
            var1: value1,
            var2: value2
        });
        this.config.element.innerHTML = output;
    }
    
    getTemplate(): string {
        return `Your template {{var1}} {{var2}}`;
    }
}
```


### Добавление нового типа настройки

Все необходимые файлы лежат в папке ```/widgetInfo```

1.  добавляем новый тип setting к ```WidgetSettingsTypes```.
2.  в ```/widgetInfo/settings``` в файле ```<YourType>Setting.ts``` описываем структуру данных и функцию создания ```make<YourType>(...): SettingFunc```
3.  добавляем новый тип данных к типу ```WidgetInfoSettingsItem```
4.  Все! Можно использовать вашу функцию для создания новой настройки в конфиге


Пример создания настройки ```MyTypeSetting.ts```:
```
>>> 1. задаем тип дефолтного значения
type DefaultType = boolean;

export interface MyTypeSetting extends BaseSetting<DefaultType> {
}

>>> 2. дописываем интерфейс настройки MyTypeSetting к общему WidgetInfoSettingsItem в types.ts

export function makeBoolean(name: string, label: string, def: DefaultType): SettingFunc {
    // Через функцию, чтобы гарантировать правильность структуры setting 
    return (): BooleanSetting => ({
        name,
        label,
        type: 'boolean',        >>> 3. Определяем новый тип настройки
        default: def
    });
}
```

Пример конфигурации ```widgets\<MyWidget>\settings.ts```:   
*Примечание: Конфиг задается через функции makeSettings и make<MySetting>, чтобы гарантировать правильность структуры данных.
Например, чтобы избежать попыток записать в конфиг несуществующие переменные foo и boo: ```settings: [ {name, value, foo, boo} ]```*

```
export const settings: IWidgetInfo = makeSettings({
    settings: [
        makeString('title', ''),
    ],
    dataSet: {
        initDataSets: [{viewType: 'DYNAMIC'}, {viewType: 'DYNAMIC'}],
        canAdd: true,
        settings: [
            makeColor('color', null),
        ]
    }
});
```
