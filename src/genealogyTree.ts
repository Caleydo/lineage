/**
 * Created by Holger Stitz on 19.12.2016.
 */

import * as events from 'phovea_core/src/event';
import {AppConstants, ChangeTypes} from './app_constants';
import * as d3 from 'd3';
import * as genealogyData from './genealogyData'
import {Config} from './config';

// bundle data file and get URL
import * as csvUrl from 'file-loader!./data/genealogy.csv';


/**
 * Creates the genealogy tree view
 */
class genealogyTree{

  private $node;

  private data;

  constructor(parent: Element) {
    this.$node = d3.select(parent)
      .append('div')
      .classed('genealogyTree', true);
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<FilterBar>}
   */
  init() {

    //this.data = genealogyData.create(csvUrl);
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
    const graph = svg.append("g");

    graph.selectAll(".node")
      .data([{'id':'rect1'},{'id':'rect2'}])
      .enter()
      .append("rect")
      .attr('id',function(d){return d.id})
      .attr('class','node')
      .attr("width", Config.glyphSize * 2)
      .attr("height", Config.glyphSize * 2)
      .attr("transform",function(d,i){return ('translate(' + (20 + Config.glyphSize * (3*i)) + ',20 )')});
    // this.$node.html(` <div id="tree"> </div>`);

  }

  private attachListener() {

    //Fire Event when first rect is clicked
    this.$node.selectAll('.node')
      .on('click', function (e) {
        events.fire('node_clicked',this);
      });

      //Set listener for click event that changes the color of the rect to red
      events.on('node_clicked',(evt,item)=> {d3.select(item).attr('fill','red')});
  }

}

/**
 * Factory method to create a new instance of the genealogyTree
 * @param parent
 * @param options
 * @returns {genealogyTree}
 */
export function create(parent: Element) {
  return new genealogyTree(parent);
}
