import * as events from 'phovea_core/src/event';
import { keys } from 'd3-collection';

import { Config } from './config';


import {
    scaleLinear,
} from 'd3-scale';

import {
    max,
    min
} from 'd3-array';

import {
    select,
    selectAll,
    selection,
    mouse,
    event
} from 'd3-selection';

import {
    json
} from 'd3-request';


/**
 * Creates the menu
 */
class ToolTip {

    private $node;

    constructor(parent: Element = undefined) {
        // this.$node = select(parent);
    }

    /**
     * Initialize the view and return a promise
     * that is resolved as soon the view is completely initialized.
     * @returns {Promise<Menu>}
     */
    init() {

        // return the promise directly as long there is no dynamical data to update
        return Promise.resolve(this);
    }

    public addTooltip(type, data = null) {

        // console.log('adding tooltip');
        const container = document.getElementById('app');
        const coordinates = mouse(container);

        let content;
        if (type === 'cell') {
            if (data.type === 'categorical') {

                content = data.name + ' : ';
                const categories = data.data.filter(function (value, index, self) {
                    return self.indexOf(value) === index;
                });
                categories.map((category) => {
                    const count = data.data.reduce(function (accumulator, currentValue) {
                        return currentValue === category ? accumulator + 1 : accumulator;
                    }, 0);
                    content = content.concat((categories.length > 1 ? count : '') + category + '  ');

                });

            } else if (data.type === 'adjMatrix') {

                const validEdges = data.data.filter((d) => !(d === undefined));
                console.log(validEdges.length, data.data.length)
                if (validEdges.length === 1) {
                    const incomingEdge = validEdges[0] && data.name === validEdges[0].endNode.title;
                    const edge = validEdges[0].edge.info;
                    content = validEdges[0].startNode.title + ' ' + edge.type + ' ' + validEdges[0].endNode.title;
                } else if (validEdges.length > 1) {
                    content = validEdges.length + ' out of ' + data.data.length + ' nodes in this row have this edge';
                } else {
                    content = 'no edge';
                }




            } else if (data.type === 'int') {
                content = data.name + ' : ' + data.data.sort((a, b) => { return (a - b); }); //display sorted values
            } else if (data.type === 'string') {
                content = data.name + ' : ' + data.data[0].toString().toLowerCase();
            } else if (data.type === 'dataDensity') {
                content = data.name + ' : ' + (data.data[0].value ? data.data[0].value : data.data);
            } else if (data.type === 'idtype') {
                content = data.name + ' : ' + data.data;
            }

        } else if (type === 'header') {
            content = (data.type === 'categorical' ? (data.name + '(' + data.category + ') ') : data.name);
        } else if (type === 'edge') {

            content = '<tspan x="10" dy="0em"> SOURCE: ' + data.source.title
            + '</tspan> <tspan x="10" dy="1.5em"> TARGET: ' + data.target.title + '</tspan>'
            + '</tspan> <tspan x="10" dy="1.5em"> EDGE TYPE: ' + data.edge.type;
            if (data.edge.data) {
                Object.keys(data.edge.data).map((key,i)=> {
                    content = content.concat(' <tspan x="20" dy="1.5em">' + key + ':' +  data.edge.data[key] + '</tspan>');
                });
            }
        } else if (type === 'node') {
            content = data.title;
        }

        console.log(content)

        let menuWidth = 100; //dummy value. to be updated;
        let menuHeight = 30;


        select('#tooltipMenu')
            .select('svg').remove();

        const menu = select('#tooltipMenu')
            .append('svg')
            .attr('class', 'menu')
            .attr('height', menuHeight)
            .attr('opacity', 0)
            .append('g')
            .attr('id','textGroup')


        menu.append('rect')
            .attr('fill', '#f7f7f7')
            .attr('height', menuHeight)
            .attr('opacity', 1);

        menu
            .append('text')
            .attr('x', 10)
            .attr('y', 20)
            .html(() => content)
            .classed('tooltipTitle', true);

        const textNode = <SVGTSpanElement>menu.select('text').node();


        // menuWidth = textNode.getComputedTextLength() + 20;
        menuWidth = document.getElementById('textGroup').getBoundingClientRect().width+20;
        menuHeight = document.getElementById('textGroup').getBoundingClientRect().height+10;

        console.log(menuWidth, menuHeight)

        // menuWidth = 100;

        select('#tooltipMenu').select('.menu')
            .attr('transform', 'translate(' + (coordinates[0] - menuWidth - 20) + ',' + (coordinates[1] - menuHeight / 2) + ')');

        select('#tooltipMenu')
            .attr('width', menuWidth)
            .attr('height', menuHeight);

        select('#tooltipMenu')
            .select('rect')
            .attr('width', menuWidth)
            .attr('height', menuHeight);

        select('#tooltipMenu')
            .select('svg')
            .attr('width', menuWidth)
            .attr('height', menuHeight);

        menu.append('line')
            .attr('x1', 0)
            .attr('x2', menuWidth)
            .attr('y1', menuHeight * 0.3)
            .attr('y2', menuHeight * 0.3)
            .attr('y1', 0)
            .attr('y2', 0)
            .attr('stroke-width', '5px')
            .attr('stroke', '#e86c37');

        select('#tooltipMenu').select('.menu')
            .transition()
            .delay(500)
            .attr('opacity', 1);


    }

};

/**
 * Factory method to create a new instance of the genealogyTree
 * @param parent
 * @param options
 * @returns {ToolTip}
 */
export function create() {
    return new ToolTip();
}

