# ABC-charts

The library for visualisation data via charts.

### Install

```npm
npm i abc-charts --save
```
### Usage

Importing needed classed and icon styles. 

```js
import {WidgetConfig, WidgetFactory} from 'abc-charts';
require('abc-charts/styles.css');
```

Running WidgetFactory for drawing widget from template.

For example:
```js
const config = new WidgetConfig();
config.templateId = 'TEMPLATE_ID';
config.element = document.getElementById('ELEMENT_ID');
config.apiUrl = 'YOUR GRAPHQL API';     // Optional
this.widgetFactory.run(config);
```
