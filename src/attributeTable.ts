

import * as events from 'phovea_core/src/event';
import {AppConstants, ChangeTypes} from './app_constants';
import * as d3 from 'd3';
import {Config} from './config';

/**
 * Creates the attribute table view
 */
class attributeTable{

  private $node;

  constructor(parent: Element) {
    this.$node = d3.select(parent)
      .append('div')
      .classed('attributeTable', true);
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<FilterBar>}
   */
  init() {

    this.build();
    this.attachListener();

    // return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
   * Build the basic DOM elements and binds the change function
   */
  private build() {

    const svg = this.$node.append('svg');
    const table = svg.append("g");

    table.selectAll(".row")
      .data([{'id':'rect1'},{'id':'rect2'}])
      .enter()
      .append("rect")
      .attr('id',function(d){return ('row_' + d.id)})
      .attr('class','row')
      .attr("width", Config.glyphSize * 5)
      .attr("height", Config.glyphSize * 2)
      .attr('stroke','black')
      .attr('stroke-width',3)
      .attr('fill','none')
      .attr("transform",function(d,i){return ('translate(20, ' + (20 + Config.glyphSize * (3*i)) +' )')});
    // this.$node.html(` <div id="tree"> </div>`);

  }

  private attachListener() {

      //Set listener for click event on corresponding node that changes the color of that row to red
      events.on('node_clicked',(evt,item)=> {d3.selectAll('.row').attr('stroke','black'); d3.select('#row_' + item).attr('stroke','red')});
  }

}

/**
 * Factory method to create a new instance of the genealogyTree
 * @param parent
 * @param options
 * @returns {genealogyTree}
 */
export function create(parent: Element) {
  return new attributeTable(parent);
}
