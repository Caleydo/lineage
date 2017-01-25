import * as events from 'phovea_core/src/event';
import {AppConstants, ChangeTypes} from './app_constants';
import * as d3 from 'd3';
import {Config} from './config';

/**
 * Creates the attribute table view
 */
class attributeTable {

  private $node;

  private width;
  private height;

  constructor(parent:Element) {
    this.$node = d3.select(parent)
      .append('div')
      .classed('attributeTable', true);
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

    this.width = 300;
    this.height = Config.glyphSize*3* data.length;

    // Scales
    let x = d3.scaleLinear().range([0, this.width]).domain([1 ,1]);
    let y = d3.scaleLinear().range([0, this.height]).domain([0 ,data.length]);


    const svg = this.$node.append('svg')
      .attr('width', this.width)
      .attr('height',this.height);

    const table = svg.append("g");

    let rows = table.selectAll(".row")
      .data(data)
      .enter()
      .append("g")
      .attr('id', function (d) {
        return ('row_' + d.id)
      })
      .attr('class', 'row')
      .attr("transform", function (d, i) {
        return ('translate(0, ' + y(i)+ ' )')
      });

    rows.selectAll('.cell')
      .data(function (d) {
        return d3.entries(d)
      })
      .enter()
      .append('rect')
      .attr('id', function (d) {
        return ('cell_' + d.key) //or d.value
      })
      .attr("width", Config.glyphSize * 5)
      .attr("height", Config.glyphSize * 2)
      .attr('stroke', 'black')
      .attr('stroke-width', 3)
      .attr('fill', 'none')
      .attr("transform", function (d, i) {
        return ('translate(' + (Config.glyphSize * (5 * i)) + ' , 0)')
      });
    // this.$node.html(` <div id="tree"> </div>`);

  }

  private attachListener() {

    //Set listener for click event on corresponding node that changes the color of that row to red
    events.on('node_clicked', (evt, item)=> {
      d3.selectAll('.row').classed('selected', function (d) {
        return d3.select(this).attr('id') === 'row_' + item;
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
