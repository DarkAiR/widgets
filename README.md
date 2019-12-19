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
  ⎣ <widgetName>Settings.ts
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
    switch (template.widgetType) {
        ...
        case <WIDGET_ID':
            new <widgetName>(config)
}
```

- Добавляем новый тип виджета в файл```src/models/types.ts```

```type WidgetType = ... | 'WIDGET_TYPE' ```

#### Структура виджета

##### ```<widgetName>.ts```
Компонент виджета наследуется от класса ```Chart``` , который, в свою очередь, реализует интерфейс ```IChart```, для управления виджетом из вызывающего проекта.

В компоненте необходимо реализовать все abstract методы, в частности метод ```run```,
который на входе принимает конфигуратор с DOM-элементом, куда записывает результат своей работы.

*Реализация метода ```run``` не регламентирована ничем, кроме CodeStyle, и каждый виджет может быть написан с использованием уникальных для него подходов (нр, HTML-верстка, SVG, echarts и т.д.).*

##### ```<widgetName>.less```

Файл стилей, который будет собран в изолированное пространство css-классов, исходя из уникальности имени файла.
 
##### ```<widgetName>Settings.ts```

Файл с настройками, уникальными для конкретного виджета.
```
export interface <WidgetName>Settings extends ISettings {
    varName: someType;
    ...
}
```

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
