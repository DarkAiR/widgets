import {IChart} from '../interfaces/IChart';
import * as d3 from 'd3';
import * as moment from 'moment';
import * as $ from 'jquery';
import * as _ from 'lodash';
import {Config} from './config';

const ъ = Symbol();

class DiagramChartPrivate {

    static daysBetween(startDate, endDate) {
        return Math.round((endDate - startDate) / 86400000);
    }

    static addEventListeners(nodes, data?) {
        Array.isArray(nodes) && nodes.forEach(node =>
            Object.keys(data || node.__data__).forEach(name => {
                name.slice(0, 2) === 'on' &&
                node.addEventListener(name.slice(2).toLocaleLowerCase(), (data || node.__data__)[name]);
            })
        );
    };

}

export type DiagramChartDataValue = {
    value: number,
    delta: number
}

export type DiagramChartDataValuesOnDate = {
    date: string,
    data: Array<DiagramChartDataValue>
}

export type DiagramChartData = {
    values: Array<DiagramChartDataValuesOnDate>;
    // properties: {
    //     endDate,
    //     startDate,
    //     currency,
    //     secondaryAxis,
    //     height,
    //     frequency
    // };
    // indicators: Array<{
    //     values,
    //     properties: {
    //         hide,
    //         type,
    //         class,
    //     }
    // }>;
}

/**
 * Чарт для диаграм
 */
export class DiagramChart implements IChart {
    private config: Config = new Config();
    private svg = null;
    private data: DiagramChartData = null;
    xDomain: Array<moment.Moment>;
    yDomain: Array<any>;
    yDomainSecondary: Array<any>;
    yHeight: number;
    yHeightSecondary: number;

    init(config: Config): IChart {
        this.config = config;
        this.svg = d3.select(config.element);
        return this;
    }

    render() {
        console.log(' ');
        console.log('DATA');
        console.log(this.data);
        console.log(' ');
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

        this.yHeight      = max(this.data.values);
        console.log('HEIGHT', this.yHeight);

        // let size             = (this.yHeight + '').length;
        // this[ъ].padding.left = Math.pow((this.yHeight < 10 ? size + 2 : size) + (this.data.properties.currency ? 6 : 0), .5) * 33;
        //
        // this.data.indicators && _.forEach(this.data.indicators, e => {
        //     let max_                 = max(e.values);
        //     this.yHeightSecondary = d3.max([this.yHeightSecondary, max_]);
        // });
        //
        // size                             = (this.yHeightSecondary + '').length;
        // this[ъ].padding.right            = this.data.properties.secondaryAxis ? Math.pow(this.yHeightSecondary < 10 ? size + 2 : size, .5) * 36 : 0;
        // this[ъ].yOriginalHeightSecondary = this.yHeightSecondary;
        // this[ъ].yOriginalHeight          = this.yHeight;
        //
        // if (this.data.properties.height) {
        //     this.yHeightSecondary = this.yHeightSecondary * this.data.properties.height / this.yHeight;
        //     this.yHeight          = this.data.properties.height;
        // }
        //
        // function createDomain(domain, size) {
        //     domain.push(0);
        //     if (size > 0) for (let c = 1, top = size < 7 ? size : 7; c < top; c++) domain.push(size / top * c);
        //     domain.push(size);
        // }
        //
        // createDomain.call(this, this.yDomain, this.yHeight);
        // this.data.indicators &&
        // createDomain.call(this, this.yDomainSecondary, this.yHeightSecondary);
        //
        // this[ъ].xAxisDomain = [];
        // for (let data = this.data.properties.startDate.clone().startOf(this.data.properties.frequency);
        //      data.isSameOrBefore(this.data.properties.endDate, this.data.properties.frequency);
        //      data.add(1, this.data.properties.frequency)) this[ъ].xAxisDomain.push(data.clone());
        //
        // this[ъ].width       = Math.round((this.config.element.offsetWidth - this[ъ].margin.left - this[ъ].margin.right - this[ъ].padding.left - this[ъ].padding.right) / this.xDomain.length) * this.xDomain.length;
        // this[ъ].width       = this.config.element.offsetWidth - this[ъ].margin.left - this[ъ].margin.right - this[ъ].padding.left - this[ъ].padding.right;
        // this[ъ].height      = this.config.element.offsetHeight - this[ъ].margin.top - this[ъ].margin.bottom;
        // this[ъ].cellWidth   = this[ъ].width / this.xDomain.length;
        // this[ъ].base        = this.svg.append('g').attr('transform', `translate(${this[ъ].margin.left + this[ъ].padding.left}, ${this[ъ].margin.top})`);
        // this[ъ].padding.top = 0;
        //
        // (this[ъ].x = d3.scaleBand().range([0, this[ъ].width])).domain(this.xDomain);
        // (this[ъ].y = d3.scaleLinear().rangeRound([this[ъ].height, 0])).domain([0, this.yHeight]);
        //
        // this.data.indicators &&
        // (this[ъ].ySecondary = d3.scaleLinear().rangeRound([this[ъ].height, 0])).domain([0, this.yHeightSecondary]);
        //
        // let padding = this[ъ].cellWidth * 0.2,
        //     margin  = this.data.values[0].data.length === 1 ? 0 : ((this[ъ].cellWidth - padding * 2) / (this.data.values[0].data.length - 1) * 0.1),
        //     width   = (this[ъ].cellWidth - margin * (this.data.values[0].data.length - 1) - padding * 2) / this.data.values[0].data.length;
        //
        // this[ъ]
        //     .base
        //     .selectAll('.diagram__line--horizontal')
        //     .data(this.yDomain)
        //     .enter()
        //     .append('g')
        //     .attr('class', 'diagram__line diagram__line--horizontal')
        //     .append('line')
        //     .attr('x1', this[ъ].x(this.xDomain[0]) + margin)
        //     .attr('x2', this[ъ].width - margin)
        //     .attr('y1', d => this[ъ].y(d) + this[ъ].padding.top)
        //     .attr('y2', d => this[ъ].y(d) + this[ъ].padding.top);
        //
        // this.data.values.forEach((value, i) => {
        //
        //     let g = this[ъ].base.append('g')
        //         .attr('id', `diagram__bar--${i}`)
        //         .attr('transform', () => `translate(${this[ъ].x(value.date) + padding}, ${this[ъ].padding.top})`)
        //         .selectAll(`#diagram__bar--${i}`)
        //         .data(value.data)
        //         .enter();
        //
        //     DiagramChartPrivate.addEventListeners(g.append('rect')
        //         .attr('class', d => `${d.classes ? d.classes[0] : ''} ${d.interactive ? 'diagram__interactive' : ''}`)
        //         .attr('x', (d, i) => (width + margin) * i)
        //         .attr('y', d => this[ъ].y(d.value - (d.delta > 0 ? d.delta : 0)))
        //         .attr('width', width)
        //         .attr('height', d => {
        //             let height = this[ъ].height - this[ъ].y(d.value - (d.delta > 0 ? d.delta : 0));
        //             height     = height < 0 ? 0 : height;
        //             return height;
        //         })
        //         .nodes());
        //
        //     DiagramChartPrivate.addEventListeners(g.append('rect')
        //         .attr('class', d => `${d.classes ? d.classes[1] : ''} ${d.interactive ? 'diagram__interactive' : ''}`)
        //         .attr('x', (d, i) => (width + margin) * i)
        //         .attr('y', d => this[ъ].y(d.value - (d.delta > 0 ? 0 : d.delta)))
        //         .attr('width', width)
        //         .attr('height', d => {
        //             let height = this[ъ].height - this[ъ].y(Math.abs(d.delta));
        //             height     = height < 0 ? 0 : height;
        //             return height;
        //         })
        //         .nodes());
        //
        //     g
        //         .append('text').attr('class', 'diagram__icon').text(d => d.icon)
        //         .attr('x', (d, i) => (width + margin) * i + 2).attr('y', d => this[ъ].y(d.value) + 20);
        //
        // });
        //
        // if (Array.isArray(this.data.indicators)) {
        //     this.data.indicators.forEach(indicator => {
        //         if (indicator.properties.hide) return;
        //         switch (indicator.properties.type) {
        //             case 'LINE':
        //                 let g             = this[ъ].base.append('g').attr('class', `diagram__line ${indicator.properties.class ? indicator.properties.class : ''}`);
        //                 g.node().__data__ = indicator.properties;
        //                 DiagramChartPrivate.addEventListeners([g.node()]);
        //                 Array.isArray(indicator.values) && indicator.values.forEach((value, n) => {
        //                     if (n === 0) return;
        //                     g.append('line')
        //                         .attr('x1', this[ъ].cellWidth * (n - 1) + this[ъ].cellWidth / 2)
        //                         .attr('y1', this[ъ].ySecondary(indicator.values[n - 1].data[0].value))
        //                         .attr('x2', this[ъ].cellWidth * n + this[ъ].cellWidth / 2)
        //                         .attr('y2', this[ъ].ySecondary(indicator.values[n].data[0].value))
        //                 });
        //                 break;
        //         }
        //     });
        // }
        //
        // if (this[ъ].showAxisX) {
        // }
        //
        // if (this[ъ].showAxisY) {
        //     this[ъ].base
        //         .append('g')
        //         .attr('class', 'diagram__axis diagram__axis--y')
        //         .attr('transform', `translate(${-8}, ${this[ъ].padding.top})`)
        //         .call(d3.axisLeft(this[ъ].y).tickValues(this.yDomain)
        //             .tickFormat(d3.format('.1f'))
        //             .tickSizeOuter(0)
        //             .tickSizeInner(0)
        //         )
        //         .append('text')
        //         .attr('transform', 'rotate(-90)');
        // }
        //
        // if (this.data.properties.secondaryAxis) {
        //     this[ъ]
        //         .base.append('g')
        //         .attr('class', 'diagram__axis diagram__axis--y diagram__axis--secondary')
        //         .attr('transform', `translate(${this[ъ].width + (this[ъ].margin.right + this[ъ].padding.right) * .7}, ${this[ъ].padding.top})`)
        //         .call(d3.axisLeft(this[ъ].ySecondary)
        //             .tickValues(this.yDomainSecondary)
        //             .tickFormat(d3.format('.1f'))
        //             .tickSizeOuter(0)
        //             .tickSizeInner(0))
        //         .append('text')
        //         .attr('transform', 'rotate(-90)');
        // }
    }

    clear(): IChart {
        this.svg.select('*').remove();
        return this;
    }

    setData(data: DiagramChartData): IChart {
        this.data = _.clone(data);
        return this;
    }

    // getDomain(axis) {
    //     if (axis === 'x') return this[ъ][axis + 'AxisDomain'];
    //     if (axis === 'y') return this[ъ][axis + 'Domain'];
    // }

    // getWidth() {
    //     return this[ъ].width;
    // }

    // getHeight() {
    //     return this[ъ].height;
    // }

    // getOffset() {
    //     return {
    //         top   : this[ъ].margin.top + this[ъ].padding.top,
    //         left  : this[ъ].margin.left + this[ъ].padding.left,
    //         right : this[ъ].margin.right + this[ъ].padding.right,
    //         bottom: this[ъ].margin.bottom + this[ъ].padding.bottom
    //     };
    // }

    // getOriginalHeight() {
    //     return this[ъ].yOriginalHeight;
    // }

    // getIndicators() {
    //     return (this.data && this.data.indicators) ? this.data.indicators : [];
    // }
}
