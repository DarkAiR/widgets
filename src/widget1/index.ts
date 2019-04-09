import * as d3 from "d3";
import styles from "./styles.less";
import {DiagramChartData, DiagramChart} from "../models/diagram-chart";
import {Config} from "../models/config";
var html = require("./index.html");

export class Widget1 {
    chart: DiagramChart;

    run(config: Config, data: DiagramChartData): string {
        this.init(config, data);
        return '';
    }

    private init(config: Config, data) {
        config.showAxisX = true;
        config.showAxisY = true;
        config.margin.top = 8;
        config.margin.right = 32;
        config.margin.bottom = 8;
        config.margin.left = 8;

        this.chart = new DiagramChart();
        this.chart
            .init(config)
            .setData(data)
            .render();
        return;
        /*

                var parseDate = d3.timeParse("%m/%d/%Y %H:%M:%S %p"),
                    formatCount = d3.format(",.0f");

                var margin = {top: 10, right: 30, bottom: 30, left: 30},
                    width = 960 - margin.left - margin.right,
                    height = 500 - margin.top - margin.bottom;

                var x = d3.scaleTime()
                    .domain([new Date(2015, 3, 1), new Date(2015, 8, 1)])
                    .rangeRound([0, width]);

                var y = d3.scaleLinear()
                    .range([height, 0]);

                var histogram = d3.histogram()
                    .value(function(d) { return d.date; })
                    .domain(x.domain())
                    .thresholds(x.ticks(d3.timeWeek));

                var virtualEl = document.createElement('div');
                var svg = d3.select(virtualEl).append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                svg.append("g")
                    .attr("class", "axis axis--x")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(x));

                let innerHtml = 'Empty';
                const data = [
                    { id: 10097071, case: 'HY285524', date: '06/02/2015 09:41:19 PM' },
                    { id: 21907, case: 'HY291065', date: '06/07/2015 03:50:00 AM' },
                    { id: 21908, case: 'HY291065', date: '06/07/2015 03:50:00 AM' },
                    { id: 10156667, case: 'HY345298', date: '07/18/2015 03:17:00 AM' },
                    { id: 10244875, case: 'HY433114', date: '09/22/2015 12:50:00 AM' },
                    { id: 22430, case: 'HY551683', date: '12/27/2015 02:05:00 PM' },
                    { id: 10047709, case: 'HY237154', date: '04/26/2015 09:58:36 PM' },
                ];

                var bins = histogram(data);

                y.domain([0, d3.max(bins, function(d) { return d.length; })]);

                var bar = svg.selectAll(styles.bar)
                    .data(bins)
                    .enter().append("g")
                    .attr("class", styles.bar)
                    .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

                bar.append("rect")
                    .attr("x", 1)
                    .attr("width", function(d) { return x(d.x1) - x(d.x0) - 1; })
                    .attr("height", function(d) { return height - y(d.length); });

                bar.append("text")
                    .attr("dy", ".75em")
                    .attr("y", 6)
                    .attr("x", function(d) { return (x(d.x1) - x(d.x0)) / 2; })
                    .attr("text-anchor", "middle")
                    .text(function(d) { return formatCount(d.length); });

                return virtualEl.innerHTML;

                function type(d) {
                    d.date = parseDate(d.date);
                    return d;
                }

                return innerHtml;*/
    }
}
