import * as d3 from 'd3';
import * as moment from 'moment';
import * as _ from 'lodash';
import {IRender} from '../interfaces';
import {WidgetConfig} from '../models/widgetConfig';
import {Moment} from "moment";
import StartOf = moment.unitOfTime.StartOf;
import {ChartType, Paddings} from "../models/types";

export type DiagramChartDataValue = {
    value: number,
    delta: number,
    color: string,
    interactive: boolean,
    onClick,
    onMouseLeave,
    onMouseOver,
    _bar: boolean,
    _data: {
        organizationUnit: string,
        date: Moment,
        kpi: "fte"
    }
}

export type DiagramChartDataValuesOnDate = {
    date: Moment,
    data: Array<DiagramChartDataValue>
}

export type DiagramChartData = {
    values: Array<DiagramChartDataValuesOnDate>;
    properties: {
        currency: boolean,
        drawingType: ChartType,
        startDate: Moment,
        endDate: Moment,
        secondaryAxis: boolean,
        height: number,
        frequency: StartOf
    };
     indicators: Array<{
        values,
        properties: {
            hide: boolean,
            type: ChartType,
            color: string,
            interactive: boolean
        }
     }>;
}

/**
 * Чарт для диаграм
 */
export class DiagramChart implements IRender {
    private config: WidgetConfig = new WidgetConfig();
    private styles = null;
    private svg = null;
    private base = null;
    private x = null;
    private y = null;
    private ySecondary = null;
    private data: DiagramChartData = null;

    private xDomain: Array<moment.Moment>;
    // private xAxisDomain: Array<Moment>;

    private yDomain: Array<any>;
    private yDomainSecondary: Array<any>;
    private yHeight: number;
    private yHeightSecondary: number;

    private width: number;
    private height: number;
    private cellWidth: number;
    private padding: Paddings = {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    };
    private margin: Paddings = {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    };

    init(config: WidgetConfig, styles): IRender {
        this.config = config;
        this.styles = styles;
        this.padding = this.config.padding;
        this.margin = this.config.margin;
        this.svg = d3.select(config.element).append('svg').attr('width', '100%').attr('height', '100%');
        return this;
    }

    render() {
        if (!this.data || !Array.isArray(this.data.values) || !this.data.values.length) {
            throw new Error('Data for visualization is missing');
        }
        // if (moment(this.data.properties.endDate).isBefore(this.data.properties.startDate, 'day')) {
        //     throw new Error('Start date must be before end date');
        // }

        this.clear();
        this.xDomain          = this.data.values.map(e => moment(e.date));
        this.yDomain          = [];
        this.yDomainSecondary = [];
        this.yHeightSecondary = 0;

        function max(array) {
            return d3.max(array, e => d3.max(
                e['data'].map(
                    v => v.value - ((!v.delta || v.delta > 0) ? 0 : v.delta)
                )
            ));
        }

        this.yHeight        = max(this.data.values);
        let size            = (this.yHeight + '').length;
        this.padding.left   = Math.pow((this.yHeight < 10 ? size + 2 : size) + (this.data.properties.currency ? 6 : 0), .5) * 33;

        if (this.data.indicators) {
            _.forEach(this.data.indicators, e => {
                this.yHeightSecondary = d3.max([this.yHeightSecondary, max(e.values)]);
            });
        }

        size                             = (this.yHeightSecondary + '').length;
        this.padding.right               = this.data.properties.secondaryAxis
            ? Math.pow(this.yHeightSecondary < 10 ? size + 2 : size, .5) * 36
            : 0;

        if (this.data.properties.height) {
            this.yHeightSecondary = this.yHeightSecondary * this.data.properties.height / this.yHeight;
            this.yHeight          = this.data.properties.height;
        }

        this.createDomain(this.yDomain, this.yHeight);
        if (this.data.indicators) {
            this.createDomain(this.yDomainSecondary, this.yHeightSecondary);
        }

        // this.xAxisDomain = [];
        // for (let data = this.data.properties.startDate.clone().startOf(this.data.properties.frequency);
        //      data.isSameOrBefore(this.data.properties.endDate, this.data.properties.frequency);
        //      data.add(1, this.data.properties.frequency)
        // ) {
        //     this.xAxisDomain.push(data.clone());
        // }

        this.width       = Math.round((this.config.element.clientWidth - this.margin.left - this.margin.right - this.padding.left - this.padding.right) / this.xDomain.length) * this.xDomain.length;
        this.width       = this.config.element.clientWidth - this.margin.left - this.margin.right - this.padding.left - this.padding.right;
        this.height      = this.config.element.clientHeight - this.margin.top - this.margin.bottom;
        this.cellWidth   = this.width / this.xDomain.length;
        this.base        = this.svg.append('g').attr('transform', `translate(${this.margin.left + this.padding.left}, ${this.margin.top})`);
        this.padding.top = 0;

        this.x = d3.scaleBand().range([0, this.width]);
        this.x.domain(this.xDomain);
        this.y = d3.scaleLinear().rangeRound([this.height, 0]);
        this.y.domain([0, this.yHeight]);

        if (this.data.indicators) {
            this.ySecondary = d3.scaleLinear().rangeRound([this.height, 0]);
            this.ySecondary.domain([0, this.yHeightSecondary]);
        }

        let padding = this.cellWidth * 0.2;
        let margin  = this.data.values[0].data.length === 1
            ? 0
            : (this.cellWidth - padding * 2) / (this.data.values[0].data.length - 1) * 0.1;
        let width   = (this.cellWidth - margin * (this.data.values[0].data.length - 1) - padding * 2) / this.data.values[0].data.length;

        this.base
            .selectAll('.diagram__line--horizontal')
            .data(this.yDomain)
            .enter()
            .append('g')
            .attr('class', this.styles['diagram__line'] + ' ' + this.styles['diagram__line--horizontal'])
            .append('line')
            .attr('x1', this.x(this.xDomain[0]) + margin)
            .attr('x2', this.width - margin)
            .attr('y1', d => this.y(d) + this.padding.top)
            .attr('y2', d => this.y(d) + this.padding.top);

        this.data.values.forEach((value, i) => {
            let g = this.base
                .append('g')
                .attr('id', `diagram__bar--${i}`)
                .attr('transform', () => `translate(${this.x(moment(value.date)) + padding}, ${this.padding.top})`)
                .selectAll(`#diagram__bar--${i}`)
                .data(value.data)
                .enter();

            DiagramChart.addEventListeners(g.append('rect')
                .attr('class', d => {
                    return (d.color ? this.styles['diagram__'+d.color] : '')            // classes[0]
                        + ' '
                        + (d.interactive ? this.styles['diagram__interactive'] : '');
                })
                .attr('x', (d, i) => (width + margin) * i)
                .attr('y', d => this.y(d.value - (d.delta > 0 ? d.delta : 0)))
                .attr('width', width)
                .attr('height', d => {
                    let height = this.height - this.y(d.value - (d.delta > 0 ? d.delta : 0));
                    height     = height < 0 ? 0 : height;
                    return height;
                })
                .nodes());

            // Непонятная хрень
            // DiagramChart.addEventListeners(g.append('rect')
            //     .attr('class', d => {
            //         return (d.color ? this.styles['diagram__'+d.color] : '')            // classes[1]
            //             + ' '
            //             + (d.interactive ? this.styles['diagram__interactive'] : '');
            //     })
            //     .attr('x', (d, i) => (width + margin) * i)
            //     .attr('y', d => this.y(d.value - (d.delta > 0 ? 0 : d.delta)))
            //     .attr('width', width)
            //     .attr('height', d => {
            //         let height = this.height - this.y(Math.abs(d.delta));
            //         height     = height < 0 ? 0 : height;
            //         return height;
            //     })
            //     .nodes());

            g.append('text')
                .attr('class', this.styles['diagram__icon'])
                .text(d => d.icon)
                .attr('x', (d, i) => (width + margin) * i + 2)
                .attr('y', d => this.y(d.value) + 20);
        });

        if (Array.isArray(this.data.indicators)) {
            this.data.indicators.forEach(indicator => {
                if (indicator.properties.hide) {
                    return;
                }
                switch (indicator.properties.type) {
                    case 'LINE':
                        let g = this.base
                            .append('g')
                            .attr('class',
                                this.styles['diagram__line']
                                    + ' '
                                    + (indicator.properties.color ? this.styles['diagram__'+indicator.properties.color+'-line'] : '')
                                    + ' '
                                    + (indicator.properties.interactive ? 'diagram__line--interactive' : '')
                            );
                        g.node().__data__ = indicator.properties;
                        DiagramChart.addEventListeners([g.node()]);
                        Array.isArray(indicator.values) && indicator.values.forEach((value, n) => {
                            if (n === 0) {
                                return;
                            }
                            g.append('line')
                                .attr('x1', this.cellWidth * (n - 1) + this.cellWidth / 2)
                                .attr('y1', this.ySecondary(indicator.values[n - 1].data[0].value))
                                .attr('x2', this.cellWidth * n + this.cellWidth / 2)
                                .attr('y2', this.ySecondary(indicator.values[n].data[0].value))
                        });
                        break;
                }
            });
        }

        if (this.config.showAxisX) {
            // TODO
        }

        if (this.config.showAxisY) {
            this.base
                .append('g')
                .attr('class', this.styles['diagram__axis'] + ' ' + this.styles['diagram__axis--y'])
                .attr('transform', `translate(${-8}, ${this.padding.top})`)
                .call(d3.axisLeft(this.y).tickValues(this.yDomain)
                    .tickFormat(d3.format('.1f'))
                    .tickSizeOuter(0)
                    .tickSizeInner(0)
                )
                .append('text')
                .attr('transform', 'rotate(-90)');
        }

        if (this.data.properties.secondaryAxis) {
            this.base
                .append('g')
                .attr('class', this.styles['diagram__axis'] + ' ' + this.styles['diagram__axis--y'] + ' ' + this.styles['diagram__axis--secondary'])
                .attr('transform', `translate(${this.width + (this.margin.right + this.padding.right) * .7}, ${this.padding.top})`)
                .call(d3.axisLeft(this.ySecondary)
                    .tickValues(this.yDomainSecondary)
                    .tickFormat(d3.format('.1f'))
                    .tickSizeOuter(0)
                    .tickSizeInner(0))
                .append('text')
                .attr('transform', 'rotate(-90)');
        }
    }

    clear(): IRender {
        this.svg.select('*').remove();
        return this;
    }

    setData(data: DiagramChartData): IRender {
        this.data = _.clone(data);
        return this;
    }

    private createDomain(domain, size): void {
        domain.push(0);
        if (size > 0) {
            for (let c = 1, top = size < 7 ? size : 7; c < top; c++) {
                domain.push(size / top * c);
            }
        }
        domain.push(size);
    }

    static daysBetween(startDate, endDate) {
        return Math.round((endDate - startDate) / 86400000);
    }

    static addEventListeners(nodes, data?) {
        Array.isArray(nodes) && nodes.forEach(node =>
            Object.keys(data || node.__data__).forEach(name => {
                if (name.slice(0, 2) === 'on') {
                    node.addEventListener(name.slice(2).toLocaleLowerCase(), (data || node.__data__)[name]);
                }
            })
        );
    };
}
