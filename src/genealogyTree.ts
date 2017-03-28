/**
 * Created by Holger Stitz on 19.12.2016.
 */
import * as events from 'phovea_core/src/event';
import {
  AppConstants,
  ChangeTypes
} from './app_constants';
// import * as d3 from 'd3';

import {
  select,
  selectAll,
  selection,
  mouse,
  event
} from 'd3-selection';
import {
  transition
} from 'd3-transition';
import {
  easeLinear
} from 'd3-ease';
import {
  scaleLinear,
  scaleLog, scalePow
} from 'd3-scale';
import {
  max,
  min,
  ticks,
  range,
  extent
} from 'd3-array';
import {
  axisTop,
  axisLeft,
  axisRight,
} from 'd3-axis';
import {
  format
} from 'd3-format';
import {
  line
} from 'd3-shape';
import {
  curveBasis,
  curveLinear
} from 'd3-shape';
import {
  drag
} from 'd3-drag';

import {
  Config
} from './config';

import {PRIMARY_SECONDARY_SELECTED, POI_SELECTED} from './tableManager';
import {VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT, VALUE_TYPE_REAL} from 'phovea_core/src/datatype';
// import {TABLE_SORTED_EVENT} from './attributeTable'
import Node from './Node';
import {Sex} from './Node';
import {isNull} from 'util';
import {isNullOrUndefined} from 'util';
import {search} from '../../phovea_core/src/internal/array';
import {isUndefined} from 'util';

export const CURRENT_YEAR = 2017;

/**
 * The visualization showing the genealogy graph
 */
class GenealogyTree {

  private $node;

  private data;

  private timer;

  private width;

  private height;

  private margin = Config.margin;

  //Time scale for visible nodes
  private x = scalePow().exponent(10);

  //Time scale for nodes outside the viewport
  private x2 = scalePow().exponent(10);


  private y = scaleLinear();

  private attributeBarY = scaleLinear().range([0, Config.glyphSize * 2]);


  private kidGridSize = 4;
  //Scale to place siblings on kid grid
  private kidGridXScale = scaleLinear().domain([1, this.kidGridSize]).range([0, Config.glyphSize * 2]);


  private kidGridYScale = scaleLinear()
    .domain([1, this.kidGridSize / 2])
    .range([-Config.hiddenGlyphSize / 3, Config.hiddenGlyphSize]);

  private parentGridScale = scaleLinear()
    .domain([1, 8])
    .range([0, Config.glyphSize * 8]);


  //Axis for the visible nodes
  private visibleXAxis;

  //Axis for the nodes outside of the viewport
  private extremesXAxis;

  private startYPos;

  private aggregatingLevels;

  private y2personDict;

  private interGenerationScale = scaleLinear();

  private self;

  private primaryAttribute;
  private secondaryAttribute;

  // private t = transition('t').duration(500).ease(easeLinear); //transition

  private colors = ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00'];

//     private colorScale = scaleLinear().domain([1,2,3,4,5,6,7,8]).range(this.colors)


  //Data attributes to draw hexagons for aggregate rows
  private hexSize = Config.glyphSize * 1.25;

  private hexData = [{x: this.hexSize, y: 0},
    {x: this.hexSize / 2, y: this.hexSize * Math.sqrt(3) / 2},
    {x: -this.hexSize / 2, y: this.hexSize * Math.sqrt(3) / 2},
    {x: -this.hexSize, y: 0},
    {x: -this.hexSize / 2, y: -this.hexSize * Math.sqrt(3) / 2},
    {x: this.hexSize / 2, y: -this.hexSize * Math.sqrt(3) / 2},
    {x: this.hexSize, y: 0}];

  private hexLine = line < any >()
    .x(function (d) {
      return d.x;
    })
    .y(function (d) {
      return d.y;
    });


  private lineFunction = line < any >()
    .x((d: any) => {
      return this.x(d.x);
    }).y((d: any) => {
      return this.y(d.y);
    })
    .curve(curveBasis);

  private slopeLineFunction = line < any >()
    .x((d: any) => {
      return d.x;
    }).y((d: any) => {
      return d.y;
    })
    .curve(curveBasis);


  constructor(parent: Element) {
    this.$node = select(parent);
    this.self = this;
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<genealogyTree>}
   */
  init(data) {
    this.data = data;
    this.build();
    // this.data.collapseAll();
    this.update();
    this.attachListeners();
    // return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }

  /**
   * Updates the view when the input data changes
   */

  private update() {

    //Filter data to only render what is visible in the current window
    this.update_time_axis();

    //Call function that updates the position of all elements in the tree
    this.update_graph();

  }


  /**
   * Build the basic DOM elements and binds the change function
   */
  private build() {

    this.width = 600 - this.margin.left - this.margin.right;

    this.visibleXAxis = axisTop(this.x).tickFormat(format('d'));
    this.extremesXAxis = axisTop(this.x2);

    // window.onscroll = (e:any)=>{console.log(e,'user scrolled')}

    const svg = this.$node.append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('id', 'graph');

    //Create gradients for fading life lines and kidGrids
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'gradient')
      .attr('x1', '0%')
      .attr('y1', '50%')
      .attr('x2', '100%')
      .attr('y2', '50%')
      .attr('spreadMethod', 'pad');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#9e9d9b')
      .attr('stop-opacity', 1);

    gradient.append('stop')
      .attr('offset', '80%')
      .attr('stop-color', '#9e9d9b')
      .attr('stop-opacity', 1);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'white')
      .attr('stop-opacity', 0);

    const slopeGradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'linear')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    slopeGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#05a')

    slopeGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#0a5')


    const kidGridGradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'kidGridGradient')
      .attr('x1', '0%')
      .attr('y1', '50%')
      .attr('x2', '100%')
      .attr('y2', '50%')
      .attr('spreadMethod', 'pad');

    kidGridGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#f7f7f6')
      .attr('stop-opacity', 0);

    kidGridGradient.append('stop')
      .attr('offset', '10%')
      .attr('stop-color', '#f7f7f6')
      .attr('stop-opacity', 1);

    kidGridGradient.append('stop')
      .attr('offset', '20%')
      .attr('stop-color', '#f7f7f6')
      .attr('stop-opacity', 1);

    kidGridGradient.append('stop')
      .attr('offset', '60%')
      .attr('stop-color', '#f7f7f6')
      .attr('stop-opacity', 1);

    kidGridGradient.append('stop')
      .attr('offset', '75%')
      .attr('stop-color', '#f7f7f6')
      .attr('stop-opacity', 1);

    kidGridGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#f7f7f6')
      .attr('stop-opacity', 0);

    //Add scroll listener for the graph table div
    document.getElementById('graph_table').addEventListener('scroll', () => {
      this.update_time_axis();
      /* clear the old timeout */
      clearTimeout(this.timer);
      /* wait until 100 ms for callback */
      this.timer = setTimeout(() => {
        this.update_graph();
      }, 100);
    });

    //Create group for genealogy tree
    svg.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + (this.margin.top + Config.glyphSize) + ')')
      .attr('id', 'genealogyTree');

    //Ensure the right order of all the elements by creating seprate groups

    //create a group in the background for edges
    select('#genealogyTree')
      .append('g')
      .attr('id', 'edges');

    //create a group for highlight bars
    select('#genealogyTree')
      .append('g')
      .attr('id', 'allBars');

    //create a group for highlight bars of hidden nodes
    select('#allBars')
      .append('g')
      .attr('id', 'hiddenHighlightBars');

    //create a group for highlight bars of non hidden nodes
    select('#allBars')
      .append('g')
      .attr('id', 'highlightBars');

    // //create a group for slopeChart
    // select('#genealogyTree')
    //   .append('g')
    //   .attr('id', 'slopeChart');

    //create a group for lifeLines
    select('#genealogyTree')
      .append('g')
      .attr('id', 'lifeLines');

    //create a group for kidGrids
    select('#genealogyTree')
      .append('g')
      .attr('id', 'kidGrids');

    //create a group in the foreground for nodes
    select('#genealogyTree')
      .append('g')
      .attr('id', 'nodes');


    //Create group for all time axis
    const axis = svg.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.axisTop + ')')
      .attr('id', 'axis');






    // legend
    //   .append('rect')
    //   .attr('width', this.width)
    //   .attr('height', this.margin.top - this.margin.axisTop)

    axis
      .append('rect')
      .attr('width', this.width)
      .attr('height', Config.legendHeight)
      .attr('y', -Config.legendHeight)
      .attr('fill', 'white');

    //Create group for legend
    const legend = axis.append('g')
      .attr('id', 'legend');

    //Add button to slopeChart Div that says 'revert to Tree Order'
    let button = legend
      .append('g')
      .attr('transform', 'translate(0,'  + (-65) + ')')
      .attr('id', 'treeButtons')

    let self = this;
    button.append('rect')
      .classed('button',true)
      .attr('width', 120)
      .attr('height', 25)
      .attr('x', this.width*0.1)
      .attr('rx', 10)
      .attr('ry', 20)
      .attr('fill', '#959492')
      .attr('y', 0)
      .attr('opacity', .1)
      .on('click', function (d) {
        selectAll('.button').attr('fill', '#959492')
        .attr('opacity', .1)
        select(this)
          .attr('fill','#3b3b3b')
          .attr('opacity', .3)
        self.data.aggregateTreeWrapper(undefined, true);
        self.update_graph();
      })

    button.append('text')
      .classed('histogramLabel', true)
      .attr('x', this.width*0.1+60)
      .attr('y', 15)
      .text('Aggregate All')
      .attr('text-anchor', 'middle')


    button.append('rect')
      .classed('button',true)
      .attr('width', 120)
      .attr('height', 25)
      .attr('x', this.width*0.35)
      .attr('rx', 10)
      .attr('ry', 20)
      .attr('fill', '#959492')
      .attr('y', 0)
      .attr('opacity', .1)
      .on('click', function (d) {
        selectAll('.button')
          .attr('fill', '#959492')
        .attr('opacity', .1)
        select(this)
          .attr('fill','#3b3b3b')
          .attr('opacity', .3)
        self.data.aggregateTreeWrapper(undefined, false);
        self.update_graph();
      })

    button.append('text')
      .classed('histogramLabel', true)
      .attr('x', this.width*0.35+60)
      .attr('y', 15)
      .text('Hide All')
      .attr('text-anchor', 'middle')



    button.append('rect')
      .classed('button',true)
      .attr('width', 120)
      .attr('height', 25)
      .attr('x', this.width*0.6)
      .attr('rx', 10)
      .attr('ry', 20)
      .attr('fill', '#959492')
      .attr('y', 0)
      .attr('opacity', .1)
      .on('click', function (d) {
        selectAll('.button').attr('fill', '#959492')
        .attr('opacity', .1)
        select(this)
          .attr('fill','#3b3b3b')
          .attr('opacity', .3)
        self.data.aggregateTreeWrapper(undefined, undefined);
        self.update_graph();
      })

    button.append('text')
      .classed('histogramLabel', true)
      .attr('x', this.width*0.6+60)
      .attr('y', 15)
      .text('Expand All')
      .attr('text-anchor', 'middle')





    axis.append('g')
      .attr('id', 'visible_axis')
      .call(this.visibleXAxis);

    axis.append('g')
      .attr('id', 'extremes_axis')
      .call(this.extremesXAxis);

    // legend.append('g')
    //   .attr('id','legendIcons')
    //   .attr('transform', 'translate(10,20)')


    //  //Create temporary group for y axis
    // const yaxis = svg.append('g')
    //   .attr('transform', 'translate(' +this.margin.left + ',' + (this.margin.top + Config.glyphSize) + ')')
    //   .attr('id', 'yaxis')
    //   .call(axisRight(this.y).tickFormat(format(',.1f')).tickValues(range(1,105,.5)).tickSize(this.width))
  }

  //End of Build Function


  private update_legend() {
    let legendIcons = select('#legendIcons').selectAll('.icons')
      .data([this.primaryAttribute, this.secondaryAttribute]);

    let legendIconsEnter = legendIcons.enter().append('rect').classed('icons', true);

    legendIcons = legendIconsEnter.merge(legendIcons);

    legendIcons.selectAll('.icons')
      .attr('width', 50)
      .attr('fill', 'white')
      .attr('height', Config.legendHeight * 0.65)


  }

  /**
   *
   * This function updates the genealogy tree by calling the update_edges
   * and update_nodes functions.
   *
   * @param nodes array of node to update the tree with
   * @param childParentEdges array of child parent edges to update the tree with
   * @param parentParentEdges array of parent parent edges to update the tree with
   */
  private update_graph() {
    const nodes = this.data.nodes;

    let yrange = [min(nodes, function (d: any) {
      return Math.round(+d.y);
    }), max(nodes, function (d: any) {
      return Math.round(+d.y);
    })];

    this.height = Config.glyphSize * 3 * (yrange[1] - yrange[0] + 1); // - this.margin.top - this.margin.bottom;
    // console.log('tree height is ', this.height)

    this.y.range([0, this.height]).domain(yrange);

    this.interGenerationScale.range([.75, .25]).domain([2, nodes.length]);

    select('#graph')
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    this.update_edges();
    this.update_nodes();
  }

  /**
   *
   * This function updates the edges in the genealogy tree
   *
   * @param childParentEdges array of child parent edges to update the tree with
   * @param parentParentEdges array of parent parent edges to update the tree with
   */
  //Function that updates the position of all edges in the genealogy tree
  private update_edges() {

    let childParentEdges = this.data.parentChildEdges;
    let parentParentEdges = this.data.parentParentEdges;

    let t = transition('t').duration(500).ease(easeLinear);

    let edgeGroup = select('#genealogyTree').select('#edges');

    //Only draw parentedges if target node is not hidden
    let edgePaths = edgeGroup.selectAll('.edges')
      .data(childParentEdges.filter(function (d) {
        return (!(d['target']['hidden'] && !d['target']['hasChildren']))
      }), function (d) {
        return d['id'];
      });

    //remove extra paths
    edgePaths.exit().transition().duration(400).style('opacity', 0).remove();

    let edgePathsEnter = edgePaths
      .enter()
      .append('path');

    edgePaths = edgePathsEnter.merge(edgePaths);

    edgePathsEnter.attr('opacity', 0);

    edgePaths
      .attr('class', 'edges')
      .transition(t)
      .attr('d', (d: Node) => {
        let maY = Math.round(d.ma.y);
        let paY = Math.round(d.pa.y);
        let nodeY = Math.round(d.target.y);

        if ((maY === nodeY) && (paY === nodeY)) {
          return this.elbow(d, this.interGenerationScale, this.lineFunction, false)
        }
        else
          return this.elbow(d, this.interGenerationScale, this.lineFunction, true)
      });

    edgePaths
      .transition(t.transition().ease(easeLinear))
      .attr('opacity', 1)
      .attr('stroke-width', Config.glyphSize / 5);

    let parentEdgePaths = edgeGroup.selectAll('.parentEdges')// only draw parent parent edges if neither parent is aggregated
      .data(parentParentEdges
          .filter(function (d: Node) {
            return (!d.ma.hidden && !d.pa.hidden) || (!d.ma.affected && !d.pa.affected)
          })
        , function (d: any) {
          return d.id;
        });


    parentEdgePaths.exit().transition().duration(400).style('opacity', 0).remove();

    let parentEdgePathsEnter = parentEdgePaths
      .enter()
      .append('path');

    parentEdgePathsEnter.attr('opacity', 0);

    parentEdgePaths = parentEdgePathsEnter.merge(parentEdgePaths);

    parentEdgePaths
      .attr('class', 'parentEdges')
      .attr('stroke-width', Config.glyphSize / 5)
      .style('fill', 'none')
      .transition(t)
      .attr('d', (d) => {
        return GenealogyTree.parentEdge(d, this.lineFunction)
      });

    parentEdgePaths
      .transition(t.transition().ease(easeLinear))
      .attr('opacity', 1);

  };



  private addKidGrids() {

    const kidGridGroup = select('#genealogyTree').select('#kidGrids');

    let filteredData = this.data.nodes.filter(function (d: Node) {
      let hasUnaffectedSpouse = d.spouse.find(s => {
        return s.sex == Sex.Male || s.affected
      });
      return d.aggregated && d.hasChildren && !d.affected && isNullOrUndefined(hasUnaffectedSpouse);
    });

    // Attach kidGrid groups
    let allKidGrids = kidGridGroup.selectAll('.kidGrid')
      .data(filteredData, function (d: Node) {
        return d.id;
      });

    console.log('kid grid for', filteredData.length, ' nodes')

    const allKidGridsEnter = allKidGrids
      .enter()
      .append('rect');

    allKidGrids = allKidGridsEnter.merge(allKidGrids);

    allKidGrids.exit().transition().duration(400).style('opacity', 0).remove();

    allKidGrids
      .classed('collapsed', (d) => {
        return d['hidden'];
      })
      .classed('kidGrid', true)


    select('#kidGrids').selectAll('.kidGrid')
      .attr('width', (d) => {
        let gridSize = Config.glyphSize * 2;


        this.data.parentChildEdges.forEach((edge) => {
          if (edge['pa'] === d && !edge['target']['hasChildren']) {
            gridSize = Config.glyphSize * 3;
          }
        })

        if (!d['affected'] && d['hidden'] && d['spouse'][0]['affected']) {
          gridSize = gridSize * 2;
        }

        if (d['affected'] && !d['spouse'][0]['affected']) {
          gridSize = gridSize * 2;
        }
        ;

        return gridSize;
      })
      .attr('height', Config.glyphSize * 2)
      .transition()
      .attr('x', (d) => {
        if (!d['affected'] && d['spouse'][0]['affected']) {
          return this.x(d['spouse'][0]['x']);
        } else {
          return this.x(d['x']);
        }
      })
      .attr('y', (d) => {
        if (d['affected'] && d['spouse'][0]['affected']) {
          return min([this.yPOS(d), this.yPOS(d['spouse'][0])]);
        } else {
          return this.yPOS(d);
        }

      })
      .style('fill', 'url(#kidGridGradient)')
      .style('stroke', 'none')
  }

  private addHightlightBars() {

    let t = transition('t').duration(500).ease(easeLinear);

    const highlightBarGroup = select('#genealogyTree').select('#highlightBars');

    let yRange: number[] = [min(this.data.nodes, function (d: any) {
      return Math.round(d.y);
    }), max(this.data.nodes, function (d: any) {
      return Math.round(d.y);
    })];

    //Create data to bind to highlightBars
    let yData: any [] = [];
    for (var i = yRange[0]; i <= yRange[1]; i++) {
      //find all nodes in this row
      let yNodes = this.data.nodes.filter((n: Node) => {
        return Math.round(n.y) === i
      });
      yData.push({
        y: i, x: min(yNodes, (d: Node) => {
          return d.x
        })
      , id:yNodes[0].uniqueID});
    }

    //Create data to bind to aggregateBars
    let aggregateBarData: any [] = [];
    for (var i = yRange[0]; i <= yRange[1]; i++) {
      //find all nodes in this row
      let yNodes = this.data.nodes.filter((n: Node) => {
        return Math.round(n.y) === i && n.aggregated
      });
      if (yNodes.length > 0) {
        aggregateBarData.push({
          y: i, x: min(yNodes, (d: Node) => {
            return d.x
          })
        });
      }

    }

    // Attach aggregateBars
    let aggregateBars = highlightBarGroup.selectAll('.aggregateBar')
      .data(aggregateBarData, d => {return d.y});


    aggregateBars.exit().remove();

    const aggregateBarsEnter = aggregateBars
      .enter()
      .append('rect')
      .classed('aggregateBar', true)
      .attr('opacity',0);

    aggregateBars = aggregateBarsEnter.merge(aggregateBars);

    aggregateBars
      .transition(t)
      .attr('transform', (row: any) => {
        return 'translate(0,' + (this.y(row.y) - Config.glyphSize * 1.25) + ')';
      })
      .attr('width', (row: any) => {
        return (max(this.x.range()) - this.x(row.x) + this.margin.right);
      })
      .attr('x', (row: any) => {
        return this.x(row.x);
      })
      .attr('height', Config.glyphSize * 2.5)


    aggregateBars
      .transition(t.transition())
      .attr('opacity',1);


    // Attach highlight Bars
    let allBars = highlightBarGroup.selectAll('.bars')
      .data(yData,d =>{return d.id});

    allBars.exit().remove();

    const allBarsEnter = allBars
      .enter()
      .append('g')
      .classed('bars', true);

    allBarsEnter
      .append('rect')
      .classed('backgroundBar', true);

    allBarsEnter
      .append('rect')
      .classed('highlightBar', true)

    allBars = allBarsEnter.merge(allBars);

    //Position all bars:
    allBars
      .attr('transform', (row: any) => {
        return 'translate(0,' + (this.y(row.y) - Config.glyphSize) + ')';
      })


    allBars
      .select('.backgroundBar')
      .attr('width', () => {
        return (max(this.x.range()) - min(this.x.range()) + this.margin.right);
      })
      .attr('height', Config.glyphSize * 2)

    allBars
      .select('.highlightBar')
      .attr('width', (row: any) => {
        return (max(this.x.range()) - this.x(row.x) + this.margin.right);
      })
      .attr('x', (row: any) => {
        return this.x(row.x);
      })
      .attr('height', Config.glyphSize * 2)


    //Set both the background bar and the highlight bar to opacity 0;
    selectAll('.bars')
      .selectAll('.backgroundBar')
      .attr('opacity', 0);

    selectAll('.bars')
      .selectAll('.highlightBar')
      .attr('opacity', 0)


    selectAll('.bars')
      .selectAll('.backgroundBar')
      .on('mouseover', function (d: any) {

        function selected(e: Node) {
          let returnValue = false;
          //Highlight the current row in the graph and table
          if (e.y === Math.round(d.y))
            returnValue = true;
          //Highlight any duplicates for this node
          // d.duplicates.forEach(dup => {
          //   if (Math.round(dup.y) === Math.round(e.y))
          //     returnValue = true;
          // });

          return returnValue;
        }

        selectAll('.slopeLine').classed('selectedSlope', false);

        selectAll('.slopeLine').filter((e: Node) => {

          return e.y === Math.round(d.y);
        }).classed('selectedSlope', true)

        //Set opacity of corresponding highlightBar
        selectAll('.highlightBar').filter(selected).attr('opacity', .2);

        //Set the age label on the lifeLine of this row to visible
        selectAll('.lifeLine').filter((e: Node) => {
          return e === d;
        }).filter((d: Node) => {
          return !d.aggregated && !d.hidden
        }).select('.lifeRect').select('.ageLabel').attr('visibility', 'visible');

        selectAll('.duplicateLine').filter(selected).attr('visibility', 'visible');

        // events.fire('row_mouseover', Math.round(d.y));
      })
      // FIXME is any a node?
      .on('mouseout', () => {

        selectAll('.duplicateLine').attr('visibility', 'hidden');

        selectAll('.slopeLine').classed('selectedSlope', false);

        //Hide all the highlightBars
        selectAll('.highlightBar').attr('opacity', 0);

        selectAll('.ageLabel').attr('visibility', 'hidden');

        // events.fire('row_mouseout', d.y);
      })
      .on('click', (d: any) => {

        // if (event.altKey) {
        //
        //   this.data.hideNodes(Math.round(d['y']), false);
        //
        //   this.update_time_axis();
        //   this.update_visible_nodes();
        //
        //   // Perhaps change to only unselected bars that are part of this newly aggregated/expanded set?
        //   selectAll('.highlightBar').classed('selected', false);
        //
        //   events.fire('graphLayout_changed')
        //
        //   return;
        // }
        if (event.defaultPrevented) return; // dragged

        let wasSelected = selectAll('.highlightBar').filter((e: any) => {
          return e.y === d.y || e.y === Math.round(d.y)
        }).classed('selected');


        //'Unselect all other background bars if ctrl was not pressed
        if (!event.metaKey) {
          selectAll('.slopeLine').classed('clickedSlope', false)
          selectAll('.highlightBar').classed('selected', false);
        }

        selectAll('.slopeLine').filter((e: any) => {
          return e.y === d.y || e.y === Math.round(d.y)
        }).classed('clickedSlope', function () {
          return (!wasSelected);
        })

        selectAll('.highlightBar').filter((e: any) => {
          return e.y === d.y || e.y === Math.round(d.y)
        }).classed('selected', function () {
          return (!wasSelected);
        })
      })

  }




  //Function that returns the x and y position for the couples line and kid grid of a given family.
  private getFamilyPos(n:Node){

    //Not a direct ancestor
    if (isUndefined(n.ma) || isUndefined(n.pa)){
      return undefined
    }

    //Dangling Node
    if (n.spouse.length === 0){
      return undefined
    }

    if (n.affected && !isUndefined(n.spouse.find((s:Node)=>{return !s.aggregated && !s.affected}))){
      return undefined;
    }
    let parents = [n].concat(n.spouse);

    if (isUndefined(parents.find((p:Node)=>{return p.hidden})) && isUndefined(n.children.find((p:Node)=>{return p.hidden}))){
        return undefined;
    }

    //All parents are affected and they have at least one aggregated child
    if (isUndefined(parents.find((p:Node)=>{return !p.affected}))){
      if (n.hasChildren && !isUndefined(n.children.find((child:Node)=>{return !child.hasChildren && !child.affected}))){
      // return {'x':max(parents,(p:Node)=>{return p.x}), 'y':min(parents,(p:Node)=>{return p.y})-1};
      let girls = n.children.filter((child:Node)=>{return child.sex === Sex.Female}); let boys = n.children.filter((child:Node)=>{return child.sex === Sex.Male});
      let maxKidGridRows = max([girls.length,boys.length]);

      return {'x':n.children.find((c:Node) => { return !c.affected}).x,
        'y':Math.round(n.children.find((c:Node) => { return !c.affected}).y),
        'id':n.uniqueID,
        'extend':true,
      'kids':min([4,maxKidGridRows])};
      }
    } else { //There is at least one unaffected parent;
      let unaffectedParent = parents.find((p:Node)=>{return !p.affected});
      let affectedParent = parents.find((p:Node)=>{return p.affected});

      let girls = n.children.filter((child:Node)=>{return child.sex === Sex.Female}); let boys = n.children.filter((child:Node)=>{return child.sex === Sex.Male});
      let maxKidGridRows = max([girls.length,boys.length]);


      if (unaffectedParent.hidden){
        if (isUndefined(affectedParent) && unaffectedParent.aggregated){
          return {'x':unaffectedParent.x, 'y':Math.round(unaffectedParent.y),'id':n.uniqueID,'extend':false,
            'kids':min([4,maxKidGridRows])}
        } else {

          if (unaffectedParent.aggregated) {
            return {
              'x': unaffectedParent.x, 'y': Math.round(unaffectedParent.y), 'id': n.uniqueID, 'extend': true,
              'kids': min([4, maxKidGridRows])
            }
          } else {
            return {
              'x': unaffectedParent.x, 'y': Math.round(unaffectedParent.y), 'id': n.uniqueID, 'extend': false,
              'kids': min([4, maxKidGridRows])
            }

          }
        }
      } else {
        return undefined;
      }

    }


  }

  private addFamilyElements() {

    let t = transition('t').duration(500).ease(easeLinear);

    const couplesLinesGroup = select('#genealogyTree').select('#nodes');

    let couplesData = [];

    this.data.nodes.forEach((n:Node)=>{
      let familyPos = this.getFamilyPos(n);
      if (!isUndefined(familyPos)){
        couplesData.push(familyPos);
      }
    })

    console.log(couplesData)
    // Attach Couples Lines
    let couplesLines = couplesLinesGroup.selectAll('.couplesLine')
      .data(couplesData, d => {return d.id});

    couplesLines.exit().remove();

    const couplesLinesEnter = couplesLines
      .enter()
      .append('line')
      .attr('class', 'couplesLine')
      // .attr('visibility', 'hidden')

    couplesLines = couplesLinesEnter.merge(couplesLines)

    couplesLines
      .attr('x1', (d:any) => {
        return this.x(d.x) + Config.glyphSize*.85;
      })
      .attr('y1', (d:any)=> {
        return this.y(d.y-0.4)
      })
      .attr('x2', (d:any) => {
        return this.x(d.x) + Config.glyphSize*.85;
      })
      .attr('y2', (d:any) =>{
        if (d.extend){
          return this.y(d.y+0.7)
        }
        return this.y(d.y+0.4)
      })
      .attr('stroke-width', 2)

    const kidGridsGroup = select('#genealogyTree').select('#kidGrids');

    // Attach backgroundRects
    let backgroundRects = kidGridsGroup.selectAll('.kidGrids')
      .data(couplesData, d => {return d.id});

    backgroundRects.exit().remove();

    const backgroundRectsEnter = backgroundRects
      .enter()
      .append('rect')
      .attr('class', 'kidGrids')

    backgroundRects = backgroundRectsEnter.merge(backgroundRects);


    backgroundRects
      .attr('x', (d:any) => {
        return this.x(d.x) - Config.glyphSize*1.2;
      })
      .attr('y', (d:any)=> {
        return this.y(d.y-0.4)
      })
      .attr('width', (d)=>{return Config.glyphSize*2 + d.kids*Config.glyphSize})
      .attr('height', Config.glyphSize*2.6)
      .style('fill', 'url(#kidGridGradient)')

  }

  private addNodes() {

    let self = this;

    let nodes = this.data.nodes;

    let t = transition('t').duration(500).ease(easeLinear);

    //Separate groups for separate layers
    const nodeGroup = select('#genealogyTree').select('#nodes');

    // Attach node groups
    let allNodes = nodeGroup.selectAll('.node')
      .data(nodes, function (d: Node) {
        return d.uniqueID;
      });

    allNodes.exit().transition().duration(400).style('opacity', 0).remove();

    const allNodesEnter = allNodes
      .enter()
      .append('g');

    allNodes = allNodesEnter.merge(allNodes);

    allNodesEnter.attr('opacity', 0);

    //Position and Color all Nodes
    allNodes
      .filter((d) => {
        return !(d['hidden'] && !d['hasChildren'])
      })
      .transition(t)
      .attr('transform', (node: Node) => {
        let xpos = this.xPOS(node);
        let ypos = this.yPOS(node);

        let xoffset = 0;

        //Position Parent Grid;
        if (node.hidden && node.hasChildren && (node.spouse.length > 1 || node.spouse[0].spouse.length > 1)) {

          let parentCount: number = 0;
          let searchSpouse;
          let ind;
          this.data.parentParentEdges.forEach((d) => {
            let ss = node.spouse.find(n => {
              return n === d.ma
            });
            if (ss && node.sex == Sex.Male) {
              if (!searchSpouse) {
                searchSpouse = ss;
                parentCount = parentCount + 1
              } else {
                if (ss === searchSpouse) {
                  parentCount = parentCount + 1
                }
              }

              if (d.pa === node && node.sex === Sex.Male) {
                ind = parentCount;
              }
            } else {
              let ss = node.spouse.find(n => {
                return n === d.pa
              });
              if (ss && node.sex == Sex.Female) {

                if (!searchSpouse) {
                  searchSpouse = ss;
                  parentCount = parentCount + 1
                } else {
                  if (ss === searchSpouse) {
                    parentCount = parentCount + 1
                  }
                }
                if (d.ma === node && node.sex === Sex.Female) {
                  ind = parentCount;
                }

              }
            }

          })

          if (ind > 1) {
            xoffset = this.parentGridScale(ind);
          }
        }
        return 'translate(' + (xpos - xoffset) + ',' + ypos + ')';
      })


    //Position  Kid Grid Nodes (i.e leaf siblings)
    allNodes.filter((d: any) => {
      return d.hidden && !d.hasChildren && d.ma && d.pa
    })
      .transition(t)
      .attr('transform', (node: Node) => {
        let xpos = this.xPOS(node);
        let ypos = this.yPOS(node);

        let childCount = 0;

        let ma = node.ma;
        let pa = node.pa;

        let xind;
        let yind;

        let gender = node.sex;
        this.data.parentChildEdges.forEach((d, i) => {
          if (d.ma === ma && d.pa === pa) {
            //Only count unaffected children that do not have children of their own so as to avoid gaps in the kid Grid
            if (!d.target.affected && d.target.sex === gender && !d.target.hasChildren)
              childCount = childCount + 1
            if (d.target === node) {

              yind = childCount % (this.kidGridSize / 2);

              if (yind === 0)
                yind = this.kidGridSize / 2;

              xind = Math.ceil(childCount / 2);
            }
          }
        })

        let xoffset = 0;

        if (node.ma.affected && node.pa.affected) {
          xoffset = Config.glyphSize * 2;
        }
        else {
          xoffset = Config.glyphSize * 1.5;
        }
        return 'translate(' + (xpos + xoffset + this.kidGridXScale(xind) ) + ',' + (ypos + +this.kidGridYScale(yind)) + ')';
//
      })

    allNodes
      .transition(t.transition().ease(easeLinear))
      .attr('opacity', 1);

    //AllNodes
    allNodes
      .classed('node', true)
      // .classed('aggregated', (d) => {
      //   return d['aggregated'];
      // })
      .classed('collapsed', (d) => {
        return d['hidden'];
      });

    allNodes.each(function (cell) {
      self.renderNodeGroup(select(this), cell);
    });
  }

  private renderNodeGroup(element, d: Node) {

    element
      .classed('affected', (n: any) => {
        return n.affected
      })

    //Add ageLine first to ensure it goes behind the node;
    if (element.selectAll('.ageLineGroup').size() === 0) {

      let ageLineGroup = element
        .append('g')
        .classed('ageLineGroup', true);

      ageLineGroup.append('rect')
        .classed('ageLine', true)

      //Add cross at the end of lifelines for deceased people
      if (d.ddate) {
        ageLineGroup
          .append('line')
          .attr('class', 'endOfTheLine');
      }


    }

    //Add cross through lines for deceased people
    if (d.ddate && element.selectAll('.nodeLine').size() === 0) {
      element
        .append('line')
        .attr('class', 'nodeLine')
    }

    let m1, m2, f1, f2, strokeWidth, glyphSize, radius, lineGlyphSize;

    if (d['hidden'] && !d['hasChildren']) {
      f1 = 2 / 3;
      m1 = 1 / 3;
      f2 = 2 / 3;
      m2 = 1.3;
      strokeWidth = 1;
      lineGlyphSize = Config.hiddenGlyphSize;
      glyphSize = Config.hiddenGlyphSize;
      radius = Config.hiddenGlyphSize / 2

    } else if (d['hidden'] && d['hasChildren']) {
      f1 = 1;
      m1 = 1 / 3;
      f2 = 1;
      m2 = 1.8;
      strokeWidth = 1;
      lineGlyphSize = Config.hiddenGlyphSize;
      glyphSize = Config.glyphSize * .75;
      radius = Config.glyphSize * .45

    } else {
      f1 = 1;
      m1 = 1 / 3;
      f2 = 1;
      m2 = 2.3;
      strokeWidth = 3;
      lineGlyphSize = Config.glyphSize;
      glyphSize = Config.glyphSize * 2;
      radius = Config.glyphSize;
    }

    //Node lines for deceased and uncollapsed nodes
    element.selectAll('.nodeLine')
      .attr('x1', function (d: any) {
        return d.sex === Sex.Female ? -lineGlyphSize * f1 : -lineGlyphSize * m1;
      })
      .attr('y1', function (d: any) {
        return d.sex === Sex.Female ? -lineGlyphSize * f1 : -lineGlyphSize * m1;
      })
      .attr('x2', function (d: any) {
        return d.sex === Sex.Female ? lineGlyphSize * f2 : lineGlyphSize * m2;
      })
      .attr('y2', function (d: any) {
        return d.sex === Sex.Female ? lineGlyphSize * f2 : lineGlyphSize * m2;
      })
      .attr('stroke-width', strokeWidth)


    //Add cross through lines for deceased people
    if (element.selectAll('.nodeIcon').size() === 0) {
      if (d.sex === Sex.Male) {
        element
          .append('rect')
          .classed('male', true)
          .classed('nodeIcon', true)
      } else {
        element
          .append('circle')
          .classed('female', true)
          .classed('nodeIcon', true)
      }


      //Add Attribute Bars next to node glyphs
      element
        .append('rect')
        .classed('attributeFrame', true)
        .classed('primary', true)

      element
        .append('rect')
        .classed('attributeBar', true)
        .classed('primary', true)


    }

    element.selectAll('.nodeIcon').on('click', (d) => {


      if (event.altKey) {
        this.data.aggregateTreeWrapper(d.uniqueID, false);
        this.update_graph();
        event.preventDefault();

        return;
      }

      console.log('clicked on node', d)

      this.data.aggregateTreeWrapper(d.uniqueID, true);
      this.update_graph();
      event.preventDefault();


    })

    //Size hidden nodes differently
    //regular nodes
    element.selectAll('.male')
      .attr('width', glyphSize)
      .attr('height', glyphSize);

    //unhidden nodes
    element.selectAll('.female')
      .attr('r', radius);

    //attribute frames
    element.select('.attributeFrame')
      .attr('width', Config.glyphSize)
      .attr('y', () => {
        return d.sex === Sex.Female ? (-Config.glyphSize) : 0
      })
      .attr('fill', 'white')
      .attr('height', () => {
        let height = 0;
        let attr = this.primaryAttribute;


        if (attr) {
          let data = this.data.getAttribute(attr.name, d.id);
          if (data){
            height = Config.glyphSize * 2;
          }
        }
        return height
      })


    //attribute Bars
    element.select('.attributeBar')
      .attr('y', () => {
        return d.sex === Sex.Female ? (-Config.glyphSize) : 0
      })
      .attr('width', Config.glyphSize)
      .attr('height', () => {
        let height = 0;
        let attr = this.primaryAttribute;

        if (attr) {
          let data = this.data.getAttribute(attr.name, d.id);

          if (attr && data && attr.type === VALUE_TYPE_CATEGORICAL) {
            height = Config.glyphSize * 2;
          } else if (attr && data && (attr.type === VALUE_TYPE_INT || attr.type === VALUE_TYPE_REAL)) {
            this.attributeBarY.domain([attr.stats.min, attr.stats.max]);
            height = this.attributeBarY(data);
          }
        }
        return height;
      })
      .attr('y', () => {
        let y = 0;
        let attr = this.primaryAttribute;

        if (attr) {
          let data = this.data.getAttribute(attr.name, d.id);
          if (attr && data && (attr.type === VALUE_TYPE_INT || attr.type === VALUE_TYPE_REAL)) {
            this.attributeBarY.domain([attr.stats.min, attr.stats.max]);
            y = Config.glyphSize * 2 - this.attributeBarY(data);
          }
          return d.sex === Sex.Female ? (-Config.glyphSize) + y : y
        }
      })
      .attr('fill', () => {
        let attr = this.primaryAttribute;

        if (attr) {
          let data = this.data.getAttribute(attr.name, d.id);
          if (attr && data && attr.type === VALUE_TYPE_CATEGORICAL) {
            let ind = attr.categories.indexOf(data);
            return attr.color[ind]
          } else if (attr && data && (attr.type === VALUE_TYPE_INT || attr.type === VALUE_TYPE_REAL)) {
            return attr.color
          }

        }
      })

    element.selectAll('.primary')
      .attr('x', () => {
        return d['sex'] === Sex.Female ? Config.glyphSize * 2 : Config.glyphSize * 3
      })


    element.select('.ageLineGroup')
      .attr('transform', () => {
        return d.sex === Sex.Male ? 'translate(' + Config.glyphSize + ',0)'
          : 'translate(0,' + (-Config.glyphSize) + ')';
      });


    element.selectAll('.ageLine')
      .attr('y', Config.glyphSize)
      .attr('width', () => {
        let ageAtDeath = Math.abs(this.x(d.ddate) - this.x(d.bdate));
        let ageToday = Math.abs(this.x(CURRENT_YEAR) - this.x(d.bdate));
        if (isNaN(ageAtDeath) && isNaN(ageToday)) {
          return 0;
        }
        return (d.ddate) ? ageAtDeath : ageToday;
      })
      .attr('height', Config.glyphSize / 8)

    element.select('.endOfTheLine')
      .attr('x1', () => {
        return (Math.abs(this.x(d.ddate) - this.x(d.bdate)) + Config.glyphSize / 3);
      })
      .attr('y1', function () {
        return Config.glyphSize * 1.5;
      })
      .attr('x2', () => {
        return Math.abs(this.x(d.ddate) - this.x(d.bdate) - Config.glyphSize / 3);
      })
      .attr('y2', function () {
        return (Config.glyphSize / 2);
      })


    //         .style('stroke','none')
//
//     //Add label to lifelines
//     lifeRectsEnter
//       .append('text')
//       .attr('class', 'ageLabel');
//
//     lifeRects.selectAll('.ageLabel')
//     // .attr('y', glyphSize )
//       .attr('dy', Config.glyphSize * 0.8)
//       .attr('dx', (d) => {
//
//         let ageAtDeath = Math.abs(this.x(d['ddate']) - this.x(d['bdate']));
//         let ageToday = Math.abs(this.x(CURRENT_YEAR) - this.x(d['bdate']))
//
//         if (isNaN(ageAtDeath) && isNaN(ageToday)) {
//           return '';
//         }
//
//         return (+d['ddate']) ? ageAtDeath : ageToday;
// //                 return Math.abs(this.x(d['ddate']) - this.x(d['bdate']));
//       })
//       .attr('text-anchor', 'end')
//       .text(function (d) {
//         let ageAtDeath = (d['ddate'] - d['bdate']);
//         let ageToday = (CURRENT_YEAR - d['bdate']);
//         if (isNaN(ageAtDeath) && isNaN(ageToday)) {
//           return '';
//         }
//         return (+d['ddate']) ? ageAtDeath : ageToday;
//
// //                 return Math.abs(+d['ddate'] - +d['bdate']);
//       })
//       .attr('fill', function (d: any) {
//         return (d.affected) ? 'black' : '#9e9d9b';
//       })
//       .style('font-size', Config.glyphSize * 1.5)
//       .style('font-weight', 'bold')
//       .attr('visibility', 'hidden');
//
//


    //
    // allNodesEnter.filter((n: Node) => {
    //   return n.duplicates.length > 0
    // })
    //   .append('text')
    //   .classed('duplicateIcon', true);
    //
    // allNodesEnter.filter((n: Node) => {
    //   return n.duplicates.length > 0
    // })
    //   .append('line')
    //   .classed('duplicateLine', true);


    // selectAll('.duplicateLine')
    //   .attr('x1',(n:Node)=>{
    //
    //     let dupNode = n.duplicates.find(d=>{return d.y !== n.y});
    //     if (dupNode.y > n.y)
    //       return;
    //
    //     let glyphSize;
    //     let offset =0;
    //
    //     if (n.hidden)
    //       glyphSize = Config.hiddenGlyphSize;
    //     else
    //       glyphSize = Config.glyphSize;
    //
    //
    //     //Add offset for kid grids
    //     if (!n.hasChildren && n.hidden){
    //       offset = glyphSize * 3;
    //     }
    //
    //     if (dupNode.x <n.x)
    //         return glyphSize - offset
    //     return glyphSize + offset
    //   })
    //   .attr('y1',
    //     (n:Node)=>{
    //
    //       let dupNode = n.duplicates.find(d=>{return d.y !== n.y});
    //       if (dupNode.y > n.y)
    //         return;
    //
    //       let glyphSize;
    //     if (n.hidden)
    //       glyphSize = Config.hiddenGlyphSize;
    //     else
    //       glyphSize = Config.glyphSize;
    //
    //       if (dupNode.y <n.y)
    //       return -glyphSize
    //     return +3*glyphSize
    //   })
    //   .attr('x2',(n:Node)=>{
    //
    //     let dupNode = n.duplicates.find(d=>{return d.y !== n.y});
    //     if (dupNode.y > n.y)
    //       return;
    //
    //
    //     let glyphSize;
    //     let offset =0;
    //
    //     if (n.hidden) {
    //       glyphSize = Config.hiddenGlyphSize;
    //     }
    //     else
    //       glyphSize = Config.glyphSize;
    //
    //     //Add offset for kid grids
    //     if (!dupNode.hasChildren && dupNode.hidden){
    //       offset = glyphSize * 3;
    //     }
    //
    //     if (dupNode.x <=n.x){
    //       return this.x(dupNode.x)- this.x(n.x) +glyphSize + offset
    //     } else {
    //       return  this.x(dupNode.x) - this.x(n.x) +glyphSize - offset;
    //     }})
    //   .attr('y2',(n:Node)=>{
    //
    //     let dupNode = n.duplicates.find(d=>{return d.y !== n.y});
    //     if (dupNode.y > n.y)
    //       return;
    //
    //     let glyphSize;
    //     if (n.hidden)
    //       glyphSize = Config.hiddenGlyphSize;
    //     else
    //       glyphSize = Config.glyphSize;
    //
    //       return this.y(n.duplicates.find(d=>{return d.y !== n.y}).y)- this.y(n.y)
    //   })
    //   .attr('visibility', 'hidden')


    // dupIcons = dupIconsEnter.merge(dupIcons);

    // selectAll('.duplicateIcon')
    //   .text('\uf0dd')
    //   .attr('y', (n: Node) => {
    //     let glyphSize;
    //     if (n.hidden)
    //       glyphSize = Config.hiddenGlyphSize*.75;
    //     // if (n.hidden && !n.hasChildren)
    //     //   glyphSize = Config.hiddenGlyphSize*.5;
    //     else
    //       glyphSize = Config.glyphSize;
    //
    //     if (n.y > n.duplicates.find(d=>{return d.y !== n.y}).y)
    //       return glyphSize
    //     else
    //       return glyphSize * 3
    //   })
    //   .attr('x', (n: Node) => {
    //     let glyphSize;
    //     if (n.hidden)
    //       glyphSize = Config.hiddenGlyphSize*.75;
    //     // if (n.hidden && !n.hasChildren)
    //     //   glyphSize = Config.hiddenGlyphSize*.5;
    //     else
    //       glyphSize = Config.glyphSize;
    //
    //
    //     if (n.y > n.duplicates.find(d=>{return d.y !== n.y}).y)
    //       return -glyphSize
    //     else
    //       return glyphSize
    //   })
    //   // .attr('y',0)
    //   // .attr('x',0)
    //   .attr('font-family', 'FontAwesome')
    //   .attr('font-size', (d:Node)=>{
    //     if (d.hidden){return Config.hiddenGlyphSize*2} else {return Config.glyphSize*2.5}})
    //   .attr('text-anchor', 'middle')
    //   // .attr('text-anchor','start')
    //   .attr("transform", (n: Node) => {
    //     if (n.y > (n.duplicates.find(d=>{return d.y !== n.y}).y))
    //       return 'rotate(' + 180 + ')'
    //   })

  }


  /**
   *
   * This function updates the nodes in the genealogy tree
   *
   * @param nodes array of nodes to update the tree with
   */
  private update_nodes() {

    this.addHightlightBars();
    this.addFamilyElements();
    this.addNodes();

    // this.addKidGrids();
  }

  private update_time_axis() {

    let scrollOffset = document.getElementById('graph_table').scrollTop;
    let divHeight = document.getElementById('graph_table').offsetHeight;

    // 	          console.log(divHeight, this.y(65),this.y(72), (divHeight + scrollOffset) - 75)

    let minY = this.y.invert(scrollOffset);
    let maxY = this.y.invert(divHeight + scrollOffset - 75)

    select('#axis')
      .attr('transform', 'translate(' + this.margin.left + ',' + (scrollOffset + 130) + ')')

    //the 75 offset is the transform applied on the group

    //Filter data to adjust x axis to the range of nodes that are visible in the window.

    let filtered_nodes = this.data.nodes.filter((d) => {
      return d['y'] >= Math.round(minY) && d['y'] <= Math.round(maxY)
    });

    if (filtered_nodes.length === 0)
      return; //no visible nodes on the screen;

    let filtered_domain = [min(filtered_nodes, function (d) {
      return +d['bdate'] - 5
    }),
      max(filtered_nodes, function (d) {
        return +d['ddate'] + 5
      })];


    let all_domain = [min(this.data.nodes, function (d) {
      return +d['bdate'] - 5
    }),
      max(this.data.nodes, function (d) {
        return +d['ddate']
      })];

    //Temporary cap @ 2016. Not sure why the axis are scaling to 2025 automatically.
    if (all_domain[1] > CURRENT_YEAR)
      all_domain[1] = CURRENT_YEAR;

    if (filtered_domain[1] > CURRENT_YEAR)
      filtered_domain[1] = CURRENT_YEAR;
    // console.log(all_domain, filtered_domain)
    //Build time axis

    //for visible nodes
    let x_range = [0];
    let x_domain = [all_domain[0]];
    let x_ticks = [all_domain[0]];

    //for out of scope nodes
    let x2_range = [0];
    let x2_domain = [all_domain[0]];
    let x2_ticks = [];


    //If there are hidden nodes older than the first visible node
    if (all_domain[0] < filtered_domain[0]) {
      x_range.push(this.width * 0.05);
      x_domain.push(filtered_domain[0]);
      x_ticks.push(filtered_domain[0]);


      x2_range.push(this.width * 0.05);
      x2_domain.push(filtered_domain[0]);

      //Add tick marks
      let left_range = range(all_domain[0], filtered_domain[0], 10);
      x2_ticks = left_range;

    }

    x_ticks = x_ticks.concat(ticks(filtered_domain[0], filtered_domain[1], 10));


    if (all_domain[1] !== filtered_domain[1]) {

      x_range.push(this.width * 0.95);
      x_domain.push(filtered_domain[1]);
      x_ticks.push(filtered_domain[1]);

      x2_range.push(this.width * 0.95);
      x2_domain.push(filtered_domain[1]);

      x2_range.push(this.width);
      x2_domain.push(all_domain[1]);

      let right_range = range(filtered_domain[1], all_domain[1], 10);
      x2_ticks = x2_ticks.concat(right_range);
    }

    x_range.push(this.width);
    x_domain.push(all_domain[1]);
    x_ticks.push(all_domain[1]);

    this.x.domain(x_domain);
    this.x.range(x_range);

    this.x2.domain(x2_domain);
    this.x2.range(x2_range);

    this.visibleXAxis.tickValues(x_ticks);
    this.extremesXAxis.tickValues(x2_ticks);

    select('#visible_axis')
      .call(this.visibleXAxis);

    select('#extremes_axis')
      .attr('opacity', .6);

    select('#extremes_axis')
      .call(this.extremesXAxis)

    select('#extremes_axis')
      .attr('opacity', .6)

    select('#visible_axis')
      .selectAll('text')
      .attr('dx', '1.5em')
      .attr('dy', '-.15em')
      .attr('transform', 'rotate(-35)');

  }


  //Function that repositions the visible nodes to fill the graph.
  private update_visible_nodes() {

    // console.log('called update_visible_nodes');

    let scrollOffset = document.getElementById('graph_table').scrollTop;
    let divHeight = document.getElementById('graph_table').offsetHeight;

    // 	          console.log(divHeight, this.y(65),this.y(72), (divHeight + scrollOffset) - 75)

    let minY = this.y.invert(scrollOffset) - 2;
    let maxY = this.y.invert(divHeight + scrollOffset - 75);

    let filtered_nodes = this.data.nodes.filter((d) => {
      return d['y'] >= Math.round(minY);
    });


    let filtered_parentParentEdges = this.data.parentParentEdges.filter((d) => {
      return d['ma'].y >= Math.round(minY) && d['pa'].y >= Math.round(minY);
    });

    let filtered_parentChildEdges = this.data.parentChildEdges.filter((d) => {
      return d.target.y >= Math.round(minY);
    });


    //Call function that updates the position of all elements in the tree
    this.update_graph()


  }


  private xPOS(node) {

    if (node['sex'] === Sex.Male) {
      if (node['hidden'] && node['hasChildren'])
        return this.x(node.x) - Config.hiddenGlyphSize;
      if (!node['hidden'])
        return this.x(node.x) - Config.glyphSize;
      if (node['hidden'] && !node['hasChildren'])
        return this.x(node.x) - Config.hiddenGlyphSize / 2;
    }
    else
      return this.x(node.x);
  }

  private yPOS(node) {
    if (node['sex'] === Sex.Male) {
      if (node['hidden'] && node['hasChildren'])
        return this.y(node.y) - Config.hiddenGlyphSize;
      if (!node['hidden'])
        return this.y(node.y) - Config.glyphSize;
      if (node['hidden'] && !node['hasChildren'])
        return this.y(node.y) - Config.hiddenGlyphSize;
    }
    else
      return this.y(node.y)
  }

  private elbow(d, interGenerationScale, lineFunction, curves) {
    const xdiff = d.ma.x - d.target.x;
    const ydiff = d.ma.y - d.target.y;
    let nx = d.ma.x - xdiff - 4; //* interGenerationScale(ydiff)

    let linedata;
    if (curves) {
      nx = d.ma.x - xdiff * interGenerationScale(ydiff);
      linedata = [{
        x: (d.ma.x + d.pa.x) / 2,
        y: (d.ma.y + d.pa.y) / 2
      },
        {
          x: nx,
          y: (d.ma.y + d.pa.y) / 2
        },
        {
          x: nx,
          y: d.target.y
        },
        {
          x: d.target.x,
          y: d.target.y
        }];
    }
    else {
      linedata = [{
        x: (d.ma.x + d.pa.x) / 2,
        y: (d.ma.y + d.pa.y) / 2
      },
        {
          x: nx,
          y: (d.ma.y + d.pa.y) / 2
        },
        {
          x: nx,
          y: d.target.y
        },
        {
          x: d.target.x,
          y: d.target.y
        }];
    }

    if (curves)
      lineFunction.curve(curveBasis);
    else
      lineFunction.curve(curveLinear);

    return lineFunction(linedata);
  }

  private static parentEdge(d, lineFunction) {
    const linedata = [{
      x: d['ma'].x,
      y: d['ma'].y
    }, {
      x: d['pa'].x,
      y: d['pa'].y
    }];
    return lineFunction(linedata);
  }

  private attachListeners() {

    // events.on('table_row_selected', (evt, item) => {
    //   let wasSelected = selectAll('.highlightBar').filter((d) => {
    //     return d['id'] === item
    //   }).classed('selected');
    //
    //   //'Unselect all other background bars if ctrl was not pressed
    //   if (!event.metaKey) {
    //     selectAll('.highlightBar').classed('selected', false);
    //   }
    //
    //   selectAll('.highlightBar').filter((d) => {
    //     return d['id'] === item
    //   }).classed('selected', function () {
    //     return (!wasSelected);
    //   })
    // });

    events.on('redraw_tree', (evt, item) => {
      this.update();
    });

    // events.on(TABLE_SORTED_EVENT,(evt,item) =>{
    //
    //   let t = transition('t').duration(500).ease(easeLinear);
    //
    //   selectAll('.slopeLine')
    //     .transition(t)
    //     .attr('d', (d: any) => {
    //       let nodes = this.y2personDict[item.rowOrder[item.sortedIndexes.indexOf(d.ind)]].map((id)=>{return this.data.nodes.filter((n)=>{return n.id == id.toString()})})
    //       // console.log(max(nodes,(n:Node)=>{console.log('node is ', n[0]); return n[0].x}))
    //       return this.slopeChart({'y':d.y, 'ind':item.sortedIndexes.indexOf(d.ind), x:max(nodes,(n:Node)=>{return n[0].ddate ? n[0].ddate : n[0].bdate})},item.rowOrder)
    //     });
    //
    // })

    events.on(PRIMARY_SECONDARY_SELECTED, (evt, attribute) => {

      if (attribute.primary) {
        this.primaryAttribute = attribute;
      } else {
        this.secondaryAttribute = attribute;
      }
      this.update_graph();
      // this.update_visible_nodes();

      this.update_legend();
    });

    events.on(POI_SELECTED, (evt, affectedState) => {
      console.log('POI', affectedState.name);
      // this.data.uncollapseAll();
      this.data.defineAffected(affectedState);
      // this.data.collapseAll();
      this.update();
    });

    // events.on('table_row_hover_on', (evt, item) => {
    //   selectAll('.highlightBar').filter((d) => {
    //     return d['id'] === item
    //   }).attr('opacity', .2)
    //   selectAll('.row').filter((e) => {
    //     return e['id'] === item
    //   }).filter((d) => {
    //     return !d['aggregated']
    //   }).select('.lifeRect').select('.ageLabel').attr('visibility', 'visible');
    //   selectAll('.row').filter((e) => {
    //     return e['id'] === item
    //   }).filter('.aggregated').attr('opacity', 1)
    //   selectAll('.row').filter((e) => {
    //     return e['id'] === item
    //   }).select('.hex').attr('opacity', 0)
    // });
    //
    // events.on('table_row_hover_off', (evt, item) => {
    //   selectAll('.aggregated').attr('opacity', 0)
    //   selectAll('.highlightBar').attr('opacity', 0)
    //   selectAll('.ageLabel').attr('visibility', 'hidden');
    //   selectAll('.row').filter((e) => {
    //     return e['id'] === item
    //   }).select('.hex').attr('opacity', 1)
    // });
  }
}

/**
 * Factory method to create a new instance of the genealogyTree
 * @param parent
 * @param options
 * @returns {genealogyTree}
 */
export function create(parent: Element) {
  return new GenealogyTree(parent);
}
