import {DiagramChartData, DiagramChart} from "../render/diagram-chart";
import {Config} from "../models/config";
var styles = require("./styles.scss");
import ResizeObserver from 'resize-observer-polyfill';
import {IChart} from "../interfaces/IChart";

export class ChartBar {
    chart: IChart;

    run(config: Config, data: DiagramChartData): string {
        this.init(config, data);
        return '';
    }

    private init(config: Config, data) {
        config.margin.top = 8;
        config.margin.right = 32;
        config.margin.bottom = 8;
        config.margin.left = 8;

        this.chart = new DiagramChart();
        this.chart
            .init(config, styles)
            .setData(data)
            .render();

        if (config.element.parentNode) {
            this.resizeObserve(config.element.parentNode, ({width, height}) => {
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
