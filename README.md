# ABC-charts

The library for visualisation data via charts.

### Install

```npm
npm i abc-charts --save
```
### Usage

Importing needed classes 

```js
import {WidgetConfig, WidgetFactory} from 'abc-charts';
import {SomeInterface} from 'abc-charts/interfaces';
import {SomeType} from 'abc-charts/models/types';
```

Include styles as you can.
For example:

```
TypeScript:
require('abc-charts/styles.css');
```
```
Less/Scss:
@import '~abc-charts/styles.css';
```

Running WidgetFactory for drawing widget from template.

For example:
```
const config = new WidgetConfig();
config.templateId = 'TEMPLATE_ID';
config.element = document.getElementById('ELEMENT_ID');
config.apiUrl = 'YOUR GRAPHQL API';     // Optional
config.eventBus = <EventBusWrapper>
this.widgetFactory.run(config);
```

Also you can use Promise for receiving signals about complete of loading widget or errors.

For example:
```
this.widgetFactory.run(config).then(
    (widget: IChart) => complete,
    () => error
);
``` 

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

-----------------------

### Local development

Use ```npm link``` for making reference to package ```widget-render``` from your package.

For example:
```
# cd widget-render/lib
# npm link
# cd YOUR_PACKAGE
# npm link abc-charts
```

Don't forget local link will be reset after any npm-operations in your package.

#### Добавление нового виджета

**NOTE:** Все названия директорий и компонентов в **lowerCamelCase**

**NOTE:** CodeStyle регламентируется файлом ```tslint.json```. Требуется настроить свою IDE для работы с правилами линтера. 

- Создаем (копируем из существующего виджета) директорию видa
```
/src/widgets/<widgetName>/
  ⎣ index.ts
  ⎣ <widgetName>.ts
  ⎣ <widgetName>.less
  ⎣ config.ts
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

#### Структура виджета

##### ```<widgetName>.ts```
Компонент виджета наследуется от класса ```Chart``` , который, в свою очередь, реализует интерфейс ```IChart```, для управления виджетом из вызывающего проекта.

В компоненте необходимо реализовать все abstract методы, в частности метод ```run```,

*Реализация метода ```run``` не регламентирована ничем, кроме CodeStyle, и каждый виджет может быть написан с использованием уникальных для него подходов (нр, HTML-верстка, SVG, echarts и т.д.).*

###### run(...)
Запуск виджета.  
Принимает конфигуратор с DOM-элементом, куда записывает результат своей работы.

###### destroy()
Уничтожает виджет, в частности все обработчики, которые на него повешаны.

###### redraw()
Перерисовать виджет с текущими данными без пересоздания самого виджета.

###### getVariables(): IWidgetVariables
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

###### getTemplate(): string | null
Получить шаблон. Если не перегружена (null), то шаблонизатор не используется.

###### onResize: (width: number, height: number) => void
Обработчик изменения размера.   
*NOTE: Реализован через переменную, для сохранения контекста вызова*

###### onEventBus: (ev: EventBusEvent, eventObj: Object) => void
Обработчик сообщений от шины   
*NOTE: Реализован через переменную, для сохранения контекста вызова*
 
##### ```<widgetName>.less```

Файл стилей, который будет собран в изолированное пространство css-классов, исходя из уникальности имени файла.
 
##### ```config.ts```

Файл с настройками, уникальными для конкретного виджета.
См. ниже "Добавление нового типа настройки"


### Шаблонизатор

В проекте используется шаблонизатор [hogan.js](https://twitter.github.io/hogan.js/) синтаксис которого базируется на [mustache.js](https://github.com/janl/mustache.js#usage)

##### Пример использования

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


#### Добавление нового типа настройки

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

Пример конфигурации ```widgets\<MyWidget>\config.ts```:   
*Примечание: Конфиг задается через функции makeConfig и make<MySetting>, чтобы гарантировать правильность структуры данных.
Например, чтобы избежать попыток записать в конфиг несуществующие переменные foo и boo: ```settings: [ {name, value, foo, boo} ]```* 

```
export const config: IWidgetInfo = makeConfig({
    settings: [
        makeString('title', ''),
    ],
    dataSet: {
        initAmount: 1,
        canAdd: true,
        settings: [
            makeColor('color', null),
        ]
    }
});
```

#### Правила разработки библиотеки виджетов

*Правила ниже нужны, в первую очередь, для единства кода при работе нескольких человек.   
Библиотека виджетов не подразумевается к использованию нигде, кроме собственных продуктов компании. Отсюда вытекают, в том числе, условия по стилям, описанные ниже.* 

1. **Библиотека должна быть небольшой, насколько это возможно.** Поэтому мы не затягиваем никаких лишних библиотек без острой необходимости.
   На данный момент для формирования HTML можно использовать встроенный шаблонизатор, а для внутренней работы с событиями связку ```querySelector + addEventListener```.      
   Текущая проблема - ```echarts``` не проходит этап минификации - требует решения.
   
2. В рамках отдельного виджета программист может самостоятельно решать, как будет построена работа его виджета.   
   Если необходимо, можно затянуть новый npm-пакет, но необходимо согласование (см. п.1)   
   В остальном особых ограничений нет.

3. **Мы используем TypeScript.** Использование нативного JS необосновано ничем, кроме legacy-кода.   
   Портирование кода на TypeScript максимально просто и не вызывает никаких проблем.   
   Если остро необходимо использовать именно JS, то можно решить все или методом require или обернув JS в отдельную библиотеку.   

   *В любом случае все новые виджеты должны наследоваться от конкретного базового класса, что не получится сделать при попытке написать все на JS.*
   
4. **Мы используем препроцессоры.** В нашем случае LESS. В современном мире никто не пишет на голом CSS из-за его очевидных ограничений.   
   Архитектура проекта при этом позволяет использовать CSS с учетом того, что он будет подключен и использован по аналогии с less через ```import```.

5. Использование препроцессоров заставляет программиста писать более осознанный код и пресекает попытки использовать css в виде глобального набора классов, что, очевидно, сломает страницу, на которой будет подключен виджет.   
   Другими словами все это позволяет нам изолировать все стили в рамках конкретных виджетов.
   
6. **Мы не держим в проекте никаких лишних файлов стилей**, если это не обосновано и не согласовано с продукт-оунером.   
   Это нужно для того, чтобы все виджеты выглядели одинаково и не требовали дополнительных include в вызывающих проектах.   
   Единственное исключение - библиотека ```goodt-css-framework```, которая содержит весь набор необходимых css-классов.   
   Т.к. на данный момент ```goodt-css-framework``` используется во всех продуктах, где подключена библиотека виджетов, то в какой-то момент даже она будет исключена из сборки.
   
7. *Для поддержки единых тем* мы не должны использовать сторонние css-стили кроме дефолтных.   
   Это значит, что любые попытки затянуть в проект целиком свой css будут пресекаться на этапе review.
