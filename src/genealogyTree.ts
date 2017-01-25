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
class genealogyTree {

  private $node;

  private data;

  private width;
  private height;

  private margin = {top: 40, right: 120, bottom: 20, left: 20};


  constructor(parent:Element) {
    this.$node = d3.select(parent)
      .append('div')
      .classed('genealogyTree', true);
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<FilterBar>}
   */
  init(data) {
    this.data = data;
    this.build(this.data);
    this.attachListener();

    // return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
   * Build the basic DOM elements and binds the change function
   */
  private build(dataObject) {

    let data = dataObject.data;

    this.width = 250
    this.height = Config.glyphSize * 3 * data.length;

    // Scales
    let x = d3.scaleLinear().range([20, this.width]).domain([d3.min(data,function(d){return d['dob']}), d3.max(data,function(d){return d['dob']}) + 20]);
    let y = d3.scaleLinear().range([0, this.height]).domain([0, data.length]);

    console.log(x.domain(), x.range())

    const svg = this.$node.append('svg')
      .attr('width', this.width)
      .attr('height', this.height);
    const graph = svg.append("g");

    let nodeGroups = graph.selectAll(".node")
      .data(data)
      .enter()
      .append("g")
      .attr('class','nodeGroup')
      .attr("transform", function (d, i) {
        return ('translate(' + x(d['dob']) + ',' + y(i) + ' )')
      });

    let nodes = nodeGroups
      .append("rect")
      .attr('class', 'node')
      .attr("width", Config.glyphSize * 2)
      .attr("height", Config.glyphSize * 2)
      .attr('id', function (d) {
        return d.id
      })
      // .attr("transform", function (d, i) {
      //   return ('translate(20, ' + y(i) + ' )')
      // })
      .style("fill",'white')
      .style("stroke-width", 3)

    //Add life line groups
    const lifeRects = nodeGroups
      .append("g")
      .attr('class', 'lifeRect')
      .attr("transform", function (d, i) {
        return ('translate('+ 2*Config.glyphSize + ', 0)')
      })

    //Add actual life lines
    lifeRects
      .append("rect")
      .attr('y', Config.glyphSize)
      .attr("width", function(d){return (d3.max(x.range()) - x(d['dob']))})
      .attr("height", Config.glyphSize / 4)
      .style('fill', 'black')
      .style('opacity', .4)


    // nodes.call(d3.drag()
    //   .on("start",started)
    //   .on("drag", dragged)
    //   .on("end",ended));


    let startYPos;

    function started(d){
      //const node = d3.select(this).data()[0];
      startYPos = y.invert(d3.mouse(<any>d3.select('.genealogyTree').node())[1]);

    }
    function ended(d){
      //const node = d3.select(this).data()[0];
      const ypos2 = y.invert(d3.mouse(<any>d3.select('.genealogyTree').node())[1]);
      console.log('started dragging at position ', Math.round(startYPos));
      console.log('ended dragging at position ', Math.round(ypos2));
      // events.fire('node_dragged', [Math.round(startYPos),Math.round(ypos2)]);
      dataObject.aggregateNodes(Math.round(startYPos),Math.round(ypos2))

    }

    function dragged(d) {
      const node:any = d3.select(this).data()[0];
      node.y = y.invert(d3.mouse(<any>d3.select('.genealogyTree').node())[1]);
      //currentY = Math.round(y.invert(d3.mouse(d3.select('#graph').node())[1]));

      d3.select(this).attr("transform", function (d,i) {
        return "translate(0," + y(Math.round(node.y)) + ")";
      });
    }

  }

  private attachListener() {

    //Fire Event when first rect is clicked
    this.$node.selectAll('.node')
      .on('click', function (e) {
        events.fire('node_clicked', d3.select(this).attr('id'));
      });


    //Set listener for click event that changes the color of the rect to red
    //events.on('node_clicked',(evt,item)=> {d3.select(item).attr('fill','red')});
  }

}

/**
 * Factory method to create a new instance of the genealogyTree
 * @param parent
 * @param options
 * @returns {genealogyTree}
 */
export function create(parent:Element) {
  return new genealogyTree(parent);
}
