import {DiagramChartData, WidgetConfig} from "..";
import {IChart} from "../interfaces";
const styles = require("./../css/s.css");

export class AverageNumberChart implements IChart {
    run(config: WidgetConfig, data: DiagramChartData): void {
        const str = 'You see the AverageNumberChart' + `
<div class="${styles['alert']} ${styles['alert-warn']}">
    <div class="${styles['icon']} ${styles['close']}"><i class="${styles['mdi']} ${styles['mdi-close']}"></i></div>
    <div class="${styles['alert-body']}">
        <h4>Title</h4>
        <div>Body content</div>
    </div>
</div>
        `;
        config.element.innerHTML = str;
    }
}
