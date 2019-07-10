import {DiagramChartData, DiagramChart} from "../render/diagram-chart";
import {WidgetConfig} from "../models/widgetConfig";
var styles = require("./styles.scss");
import ResizeObserver from 'resize-observer-polyfill';
import {IRender} from "../interfaces";

export class ChartBar {
    chart: IRender;

    run(config: WidgetConfig, data: DiagramChartData): string {
        this.init(config, data);
        return '';
    }

    private init(config: WidgetConfig, data) {
        config.margin.top = 8;
        config.margin.right = 32;
        config.margin.bottom = 8;
        config.margin.left = 8;

        this.chart = new DiagramChart();
        this.chart
            .init(config, styles)
            .setData(data)
            .render();

        if (config.element) {
            this.resizeObserve(config.element, ({width, height}) => {
                this.chart.render();
            });
        }
    }

    private resizeObserve(element, callback: Function) {
        new ResizeObserver(entries => {
            const entry: ResizeObserverEntry = entries[0];
            callback.call(this, entry.contentRect);
        }).observe(element);
    }
}
