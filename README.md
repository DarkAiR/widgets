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
```

Include styles as you can.
For example:

```typescript
TypeScript:
require('abc-charts/styles.css');
```
```less
Less/Scss:
@import '~abc-charts/styles.css';
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
