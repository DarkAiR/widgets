# ABC-charts

The library for visualisation data via charts.

### Install

```npm
npm i abc-charts
```
### Usage

Importing needed classed and icon styles. 

```js
import {AverageNumberConfig, SolidGaugeConfig, IndicatorsTableConfig, SplineConfig, WidgetFactory} from 'abc-charts';
require('abc-charts/styles.css');
```

Running WidgetFactory for drawing widget from template.

For example:
```js
const config = new AverageNumberConfig();
config.templateId = 'TEMPLATE_ID';
config.element = document.getElementById('ELEMENT_ID');
// ... Fill other options of config
this.widgetFactory.run(config);
```
