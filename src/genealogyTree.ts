/**
 * Created by Holger Stitz on 19.12.2016.
 */

import * as events from 'phovea_core/src/event';
import {AppConstants, ChangeTypes} from './app_constants';
// import * as d3 from 'd3';

import {select, selectAll, mouse} from 'd3-selection';
import {scaleLinear} from 'd3-scale';
import {max, min} from 'd3-array';
import {axisTop} from 'd3-axis';
import {format} from 'd3-format';
import {line} from 'd3-shape';
import {curveBasis, curveLinear} from 'd3-shape';


import * as genealogyData from './genealogyData'
import {Config} from './config';




/**
 * Creates the genealogy tree view
 */
class genealogyTree {

  private $node;

  private data;

  private width;

  private height;

  private margin = {top: 60, right: 20, bottom: 60, left: 40};

  private x  = scaleLinear();

  private y = scaleLinear();

  private interGenerationScale = scaleLinear();


  constructor(parent:Element) {
    this.$node = select(parent)
    // .append('div')
    // .classed('genealogyTree', true);
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<FilterBar>}
   */
  init(data) {
    this.data = data;
    this.build();
    this.attachListener();

    // return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
   * Build the basic DOM elements and binds the change function
   */
  private build() {

    let nodes = this.data.data; //.nodes;
    // let edges = this.data.relationshipEdges;
    // let parentEdges = this.data.relationshipNodes;

    this.width = 600 - this.margin.left - this.margin.right
    this.height = Config.glyphSize * 3 * nodes.length - this.margin.top - this.margin.bottom;

    // Scales
    this.x.range([0, this.width]).domain([min(nodes, function (d) {
      return d['bdate']
    }), max(nodes, function (d) {
      return d['bdate']
    }) + 20]);
    this.y.range([0, this.height]).domain([min(nodes, function (d) {
      return d['y']
    }), max(nodes, function (d) {
      return d['y']
    })])

    this.interGenerationScale.range([.75, .25]).domain([2, nodes.length]);


    const svg = this.$node.append('svg')
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)

    //append axis
    svg.append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top / 1.5 + ")")
      .call(axisTop(this.x).tickFormat(format("d")));


    const graph = svg.append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // const edgePaths = graph.selectAll(".edges")
    //   .data(edges)
    //   .enter().append("path")
    //   .attr("class", "edges")
    //   // .style("stroke", function (d) {
    //   //     return d.color
    //   // })
    //   // .style("fill", 'none')
    //   .attr("d", this.elbow)
    //   .attr("stroke-width", 3)
    //   .on('click', function (d) {
    //     console.log(d)
    //   });
    //
    //
    // const parentEdgePaths = graph.selectAll(".parentEdges")
    //   .data(parentEdges)
    //   .enter().append("path")
    //   .attr("class", "parentEdges")
    //   // .style("stroke", function (d) {
    //   //     return d.color
    //   // })
    //   .style("stroke-width", 4)
    //   .style("fill", 'none')
    //   .attr("d", this.parentEdge);


    let nodeGroups = graph.selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr('class', 'nodeGroup')
      .attr("transform", d=> {
        return ('translate(' + this.x(+d['x']) + ',' + this.y(+d['y']) + ' )')
      });


    //Add life line groups
    const lifeRects = nodeGroups
      .append("g")
      .attr('class', 'lifeRect')
      
    //Add actual life lines
    lifeRects
      .append("rect")
      .attr('y', Config.glyphSize)
      .attr("width", d=> {
        return (max(this.x.range()) - this.x(d['bdate']))
      })
      .attr("height", Config.glyphSize/6)
      .style('opacity', .3)
      .attr("fill", "black")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
//       .attr('stroke-dasharray',5)
      
      let nodeObjects = nodeGroups
      .append("rect")
      .attr('class', 'node')
      .attr("width", Config.glyphSize * 2)
      .attr("height", Config.glyphSize * 2)
      .attr('id', function (d) {
        return d.id
      })
      .style("fill", 'white')
      .style("stroke-width", 3)

    // nodes.call(d3.drag()
    //   .on("start",started)
    //   .on("drag", dragged)
    //   .on("end",ended));


    let startYPos;

    function started(d) {
      //const node = d3.select(this).data()[0];
      startYPos = this.y.invert(mouse(<any>select('.genealogyTree').node())[1]);

    }

    function ended(d) {
      //const node = d3.select(this).data()[0];
      const ypos2 = this.y.invert(mouse(<any>select('.genealogyTree').node())[1]);
      console.log('started dragging at position ', Math.round(startYPos));
      console.log('ended dragging at position ', Math.round(ypos2));
      // events.fire('node_dragged', [Math.round(startYPos),Math.round(ypos2)]);
      this.data.aggregateNodes(Math.round(startYPos), Math.round(ypos2))

    }

    function dragged(d) {
      const node:any = select(this).data()[0];
      node.y = this.y.invert(mouse(<any>select('.genealogyTree').node())[1]);
      //currentY = Math.round(y.invert(d3.mouse(d3.select('#graph').node())[1]));

      select(this).attr("transform", function (d, i) {
        return "translate(0," + this.y(Math.round(node.y)) + ")";
      });
    }

  }

  private attachListener() {

    //Fire Event when first rect is clicked
    this.$node.selectAll('.node')
      .on('click', function (e) {
        events.fire('node_clicked', select(this).attr('id'));
      });


    //Set listener for click event that changes the color of the rect to red
    //events.on('node_clicked',(evt,item)=> {d3.select(item).attr('fill','red')});
  }

  private  lineFunction = line<any>()
    .x(function (d:any) {
        return this.x(d.x);
    }).y(function (d:any) {
        return this.y(d.y);
    });


  private elbow(d) {
    const xdiff = d.source.x - d.target.x;
    const ydiff = d.source.y - d.target.y;
    const nx = d.source.x - xdiff * this.interGenerationScale(ydiff);

    const linedata = [{
      x: d.source.x,
      y: d.source.y
    }, {
      x: nx,
      y: d.source.y
    }, {
      x: nx,
      y: d.target.y
    }, {
      x: d.target.x,
      y: d.target.y
    }];

    if (Config.curvedLines)
      this.lineFunction.curve(curveBasis);
    else
      this.lineFunction.curve(curveLinear);

    return this.lineFunction(linedata);
  }

  private parentEdge(d) {

    const linedata = [{
      x: d.x1,
      y: d.y1
    }, {
      x: d.x2,
      y: d.y2
    }];

    return this.lineFunction(linedata);
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
