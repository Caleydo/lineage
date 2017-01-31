import * as events from 'phovea_core/src/event';
import {AppConstants, ChangeTypes} from './app_constants';
// import * as d3 from 'd3';
import {Config} from './config';

import {select, selectAll} from 'd3-selection';
import {scaleLinear} from 'd3-scale';
import {max, min} from 'd3-array';
import {entries} from 'd3-collection';

/**
 * Creates the attribute table view
 */
class attributeTable {

  private $node;

  private width;
  private height;

     private margin = {top: 60, right: 20, bottom: 60, left: 40};

  constructor(parent:Element) {
    this.$node = select(parent)
      // .append('div')
      // .classed('attributeTable', true);
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<FilterBar>}
   */
  init(data) {

    this.build(data);
    this.attachListener();

    // return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
   * Build the basic DOM elements and binds the change function
   */
  private build(data) {

     this.width = 150 - this.margin.left - this.margin.right
    this.height = Config.glyphSize * 3 * data.length - this.margin.top - this.margin.bottom;

    // Scales
    let x = scaleLinear().range([0 , this.width]).domain([1 ,1]);
     let y = scaleLinear().range([0, this.height]).domain([min(data,function(d){return d['y']}), max(data,function(d){return d['y']}) ])



    const svg = this.$node.append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)

    const table = svg.append("g")
    .attr("transform", "translate(0," + this.margin.top + ")")

    let rows = table.selectAll(".row")
      .data(data)
      .enter()
      .append("g")
      .attr('id', function (d) {
        return ('row_' + d.id)
      })
      .attr('class', 'row')
      .attr("transform", function (d, i) {
        return ('translate(0, ' + y(d['y'])+ ' )')
      });

    rows
    // .select('.cell')
    //   .data(function (d) {
    //     return entries(d)
    //   })
    //   .enter()
      .append('rect')
      // .attr('id', function (d) {
      //   return ('cell_' + d.key) //or d.value
      // })
      .attr("width", Config.glyphSize * 10)
      .attr("height", Config.glyphSize * 2.5)
      .attr('stroke', 'black')
      .attr('stroke-width', 3)
      .attr('fill', 'none')
      // .attr("transform", function (d, i) {
      //   return ('translate(' + (Config.glyphSize * (3 * i)) + ' , 0)')
      // });

  }

  private attachListener() {

    //Set listener for click event on corresponding node that changes the color of that row to red
    events.on('node_clicked', (evt, item)=> {
      selectAll('.row').classed('selected', function (d) {
        return (!select(this).classed('selected') && select(this).attr('id') === 'row_' + item);
      });
    });
  }

}

/**
 * Factory method to create a new instance of the genealogyTree
 * @param parent
 * @param options
 * @returns {genealogyTree}
 */
export function create(parent:Element) {
  return new attributeTable(parent);
}
