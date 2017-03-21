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
import {TABLE_SORTED_EVENT} from './attributeTable'
import Node from './Node';
import {Sex} from './Node';

export const CURRENT_YEAR = 2014;

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
    this.data.collapseAll();
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
      .attr('width', this.width + Config.slopeChartWidth + this.margin.left + this.margin.right)
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
      .attr('stop-color', '#f2f3f4')
      .attr('stop-opacity', 1);

    kidGridGradient.append('stop')
      .attr('offset', '20%')
      .attr('stop-color', '#f2f3f4')
      .attr('stop-opacity', 1);

    kidGridGradient.append('stop')
      .attr('offset', '75%')
      .attr('stop-color', 'white')
      .attr('stop-opacity', 1);

    kidGridGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#f2f3f4')
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

    //create a group for slopeChart
    select('#genealogyTree')
      .append('g')
      .attr('id', 'slopeChart');

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

    //Create group for legend
    const legend = axis.append('g')
      .attr('id', 'legend');

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

    //Only draw parentedges if target node is not
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
        //   .filter(function (d) {
        //   return !d['ma']['aggregated'] || !d['pa']['aggregated']
        // })
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

  /**
   *
   * This function adds the lifeLines to the graph
   */
  private addLifeLines() {

    const lifeLineGroup = select('#genealogyTree').select('#lifeLines');

    // Attach lifeLines groups
    let allLifeLines = lifeLineGroup.selectAll('.lifeLine')
      .data(this.data.nodes, function (d: Node) {
        return d.id.toString();
      });

    allLifeLines.exit().transition().duration(400).style('opacity', 0).remove();

    const allLifeLinesEnter = allLifeLines
      .enter()
      .append('g');

    allLifeLines = allLifeLinesEnter.merge(allLifeLines);

    //AllNodes
    allLifeLines
      .classed('lifeLine', true)
      .classed('aggregated', (d) => {
        return d.aggregated;
      })
      .classed('collapsed', (d) => {
        return d.hidden;
      });

    //Add life line groups
    const lifeRectsEnter = allLifeLinesEnter.filter((d) => {
      return d.type === 'single' && !d.hidden;
    }).append('g')
      .classed('lifeRect', true);


    let lifeRects = allLifeLines.selectAll('.lifeRect').filter((d: Node) => {
      return !d.hidden;
    });

    lifeRects.exit().remove();

    lifeRects
      .transition()
      .attr('transform', (d: Node) => {
        // console.log('lifeLine Data is ' , d)
        return d.sex === Sex.Male ? 'translate(' + (this.xPOS(d) + Config.glyphSize) + ',' + this.yPOS(d) + ')'
          : 'translate(' + this.xPOS(d) + ',' + (this.yPOS(d) - Config.glyphSize) + ')';
      });

    //Add actual life lines
    lifeRectsEnter
      .append('rect');

    lifeRects.selectAll('rect')
      .attr('y', Config.glyphSize)
      .attr('width', (d: Node) => {
        let ageAtDeath = Math.abs(this.x(d.ddate) - this.x(d.bdate));
        let ageToday = Math.abs(this.x(CURRENT_YEAR) - this.x(d.bdate));
        if (isNaN(ageAtDeath) && isNaN(ageToday)) {
          return 0;
        }
        return (d.ddate) ? ageAtDeath : ageToday;
      })
      .attr('height', Config.glyphSize / 8)
      .style('fill', (d: any) => {
        return '#9e9d9b';
        // if (d.affected)
        //   return '#484646';
        // if (d.deceased)
        //   return '#9e9d9b';
        // else
        //   return 'url(#gradient)'
      })
      .style('opacity', .6);
    //         .style('stroke','none')

    //Add label to lifelines
    lifeRectsEnter
      .append('text')
      .attr('class', 'ageLabel');

    lifeRects.selectAll('.ageLabel')
    // .attr('y', glyphSize )
      .attr('dy', Config.glyphSize * 0.8)
      .attr('dx', (d) => {

        let ageAtDeath = Math.abs(this.x(d['ddate']) - this.x(d['bdate']));
        let ageToday = Math.abs(this.x(CURRENT_YEAR) - this.x(d['bdate']))

        if (isNaN(ageAtDeath) && isNaN(ageToday)) {
          return '';
        }

        return (+d['ddate']) ? ageAtDeath : ageToday;
//                 return Math.abs(this.x(d['ddate']) - this.x(d['bdate']));
      })
      .attr('text-anchor', 'end')
      .text(function (d) {
        let ageAtDeath = (d['ddate'] - d['bdate']);
        let ageToday = (CURRENT_YEAR - d['bdate']);
        if (isNaN(ageAtDeath) && isNaN(ageToday)) {
          return '';
        }
        return (+d['ddate']) ? ageAtDeath : ageToday;

//                 return Math.abs(+d['ddate'] - +d['bdate']);
      })
      .attr('fill', function (d: any) {
        return (d.affected) ? 'black' : '#9e9d9b';
      })
      .style('font-size', Config.glyphSize * 1.5)
      .style('font-weight', 'bold')
      .attr('visibility', 'hidden');


    //Add cross at the end of lifelines for deceased people
    lifeRectsEnter.filter(function (d: any) {
      return (d.ddate);
    })
      .append('line')
      .attr('class', 'endOfTheLine');


    lifeRects.selectAll('.endOfTheLine')
      .attr('x1', (d: any) => {
        return (Math.abs(this.x(d['ddate']) - this.x(d['bdate'])) + Config.glyphSize / 3);
      })
      .attr('y1', function (d: any) {
        return Config.glyphSize * 1.5;
      })
      .attr('x2', (d: any) => {
        return Math.abs(this.x(d['ddate']) - this.x(d['bdate']) - Config.glyphSize / 3);
      })
      .attr('y2', function (d: any) {

        return (Config.glyphSize / 2);
      })
      .attr('stroke-width', 1)
      .attr('stroke', function (d: any) {
        return '#9e9d9b';
      })
      .attr('opacity', .6)

  }

  private addKidGrids() {

    const kidGridGroup = select('#genealogyTree').select('#kidGrids');

    // Attach kidGrid groups
    let allKidGrids = kidGridGroup.selectAll('.kidGrid')
      .data(this.data.filter((d: any) => {
        if (d['sex'] === Sex.Female)
          return false;
        if (!d['hasChildren'])
          return false;

        let hasGrid = true; //change to false to only put kid grids on parents of leaf nodes
        this.data.parentChildEdges.forEach((edge) => {
          if (edge['pa'] === d && !edge['target']['hasChildren']) {
            hasGrid = true;
          }
        })
        return hasGrid;

      }), function (d) {
        return d['id'];
      });


    allKidGrids.exit().transition().duration(400).style('opacity', 0).remove();

    const allKidGridsEnter = allKidGrids
      .enter()
      .append('rect');

    allKidGrids = allKidGridsEnter.merge(allKidGrids);

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

    const highlightBarGroup = select('#genealogyTree').select('#highlightBars');
    const hiddenHighlightBarGroup = select('#genealogyTree').select('#hiddenHighlightBars');


    // Attach highlight Bars
    let hiddenBars = hiddenHighlightBarGroup.selectAll('.bars')
      .data(this.data.nodes.filter((n) => {
        return n.hidden && n.hasChildren && n.sex === Sex.Male
      }), function (d) {
        return d['id'];
      });

    hiddenBars.exit().remove();

    const hiddenBarsEnter = hiddenBars
      .enter()
      .append('g');

    hiddenBars = hiddenBarsEnter.merge(hiddenBars);

    //AllBars
    hiddenBars
      .classed('bars', true);

    //Attach background rectangle to all rows and set to invisible with css (will be used to capture mouse events)
    hiddenBarsEnter
    //   .filter((d) => {
    //   return !d['aggregated']
    // })
      .append('rect')
      .classed('backgroundBar', true);


    //Attach highlight rectangle to all unhidden rows and set to invisible (will be set to visible on hover over backgroundBar)
    hiddenBarsEnter
    //   .filter((d) => {
    //   return !d['aggregated']
    // })
      .append('rect')
      .classed('highlightBar', true);


    // Attach highlight Bars
    let allBars = highlightBarGroup.selectAll('.bars')
      .data(this.data.nodes.filter((n) => {
        return !n.hidden
      }), function (d) {
        return d['id'];
      });

    allBars.exit().remove();

    const allBarsEnter = allBars
      .enter()
      .append('g');

    allBars = allBarsEnter.merge(allBars);

    //AllBars
    allBars
      .classed('bars', true);

    //Attach background rectangle to all rows and set to invisible with css (will be used to capture mouse events)
    allBarsEnter.filter((d) => {
      return !d['aggregated']
    })
      .append('rect')
      .classed('backgroundBar', true);


    //Attach highlight rectangle to all unhidden rows and set to invisible (will be set to visible on hover over backgroundBar)
    allBarsEnter.filter((d) => {
      return !d['aggregated']
    })
      .append('rect')
      .classed('highlightBar', true);

    selectAll('.bars')
      .classed('aggregated', (d) => {
        return d['aggregated'];
      })
      .classed('collapsed', (d) => {
        return d['hidden'];
      });


    //Position all bars:
    selectAll('.bars')
      .attr('transform', (node) => {
        return 'translate(0,' + this.yPOS(node) + ')';
      })


    selectAll('.bars')
      .selectAll('.backgroundBar')
      .attr('width', (d) => {
        return (max(this.x.range()) - min(this.x.range()) + this.margin.right);
//         return (max(this.x.range()) - this.x(d['x']) + this.margin.right);
      })
      .attr('height', Config.glyphSize * 2)
      .attr('transform', (d: any) => {
        return d.sex === Sex.Male ? 'translate(' + Config.glyphSize + ',0)' : 'translate(' + 0 + ',' + (-Config.glyphSize) + ')';
      })

    selectAll('.bars')
      .selectAll('.highlightBar')
      .attr('width', (d) => {
        return (max(this.x.range()) - this.x(d['x']) + this.margin.right);
      })
      .attr('x', (d) => {
        return this.xPOS(d)
      })
      .attr('height', Config.glyphSize * 2)
      .attr('transform', (d: any) => {
        return d.sex === Sex.Male ? 'translate(' + Config.glyphSize + ',0)' : 'translate(' + 0 + ',' + (-Config.glyphSize) + ')';
      })


    //Set both the background bar and the highlight bar to opacity 0;
    selectAll('.bars')
      .selectAll('.backgroundBar')
      .attr('opacity', 0);

    selectAll('.bars')
      .selectAll('.highlightBar')
      .attr('opacity', 0);

    selectAll('.bars')
      .selectAll('.backgroundBar')
      .on('mouseover', function (d: any) {

        selectAll('.slopeLine').classed('selectedSlope', false);
        // FIXME is any a node?
        selectAll('.slopeLine').filter((e: any) => {
          return e.y === d.y || e.y === Math.round(d.y);
        }).classed('selectedSlope', true)

        //Set opacity of corresponding highlightBar
        selectAll('.highlightBar').filter((e: any) => {
          return e.y === d.y || e.y === Math.round(d.y);
        }).attr('opacity', .2);

        //Set the age label on the lifeLine of this row to visible
        selectAll('.lifeLine').filter((e) => {
          return e === d;
        }).filter((d) => {
          return !d['aggregated'] && !d['hidden']
        }).select('.lifeRect').select('.ageLabel').attr('visibility', 'visible');

        events.fire('row_mouseover', Math.round(d.y));
      })
      // FIXME is any a node?
      .on('mouseout', (d: any) => {

        selectAll('.slopeLine').classed('selectedSlope', false);

        //Hide all the highlightBars
        selectAll('.highlightBar').attr('opacity', 0);

        selectAll('.ageLabel').attr('visibility', 'hidden');

        events.fire('row_mouseout', d.y);
      })


    selectAll('.bars')
      .on('contextmenu', (d) => {
        this.data.hideNodes(Math.round(d['y']), true);
        // this.data.collapseFamilies(d['familyIds'].slice(-1))
        this.update_visible_nodes();
        event.preventDefault();

      })
      .on('dblclick', () => {
      });

    //Set click callback on background bars
    selectAll('.bars')
      .on('click', (d: any) => {

        console.log(d)

        if (event.altKey) {

          this.data.hideNodes(Math.round(d['y']), false);

          this.update_time_axis();
          this.update_visible_nodes();
          selectAll('.highlightBar').classed('selected', false);

          return;
        }
        if (event.defaultPrevented) return; // dragged

        let wasSelected = selectAll('.highlightBar').filter((e: any) => {
          return e.y === d.y || e.y === Math.round(d.y)
        }).classed('selected');

        //'Unselect all other background bars if ctrl was not pressed
        if (!event.metaKey) {
          selectAll('.highlightBar').classed('selected', false);
        }

        selectAll('.highlightBar').filter((e: any) => {
          return e.y === d.y || e.y === Math.round(d.y)
        }).classed('selected', function () {
          return (!wasSelected);
        })

        if (!event.metaKey) {
          events.fire('row_selected', d['y'], 'single');
        }
        else {
          events.fire('row_selected', d['y'], 'multiple');
        }
      })

  }

  private addNodes() {


    let nodes = this.data.nodes;

    let t = transition('t').duration(500).ease(easeLinear);

    //Separate groups for separate layers
    const nodeGroup = select('#genealogyTree').select('#nodes');

    // Attach node groups
    let allNodes = nodeGroup.selectAll('.node')
      .data(nodes, function (d) {
        return d['id'];
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
      .attr('transform', (node) => {
        let xpos = this.xPOS(node);
        let ypos = this.yPOS(node);

        let xoffset = 0;
        if (!node['affected'] && node['spouse'].length > 0 && node['spouse'][0]['affected'] && node['hidden']) {
          xoffset = Config.glyphSize * 2;
        }
        return 'translate(' + (xpos + xoffset) + ',' + ypos + ')';
      })


    //Position  Kid Grid Nodes (i.e leaf siblings)
    allNodes.filter((d: any) => {
      return d.hidden && !d.hasChildren && d.ma && d.pa
    })
      .transition(t)
      .attr('transform', (node) => {
        let xpos = this.xPOS(node);
        let ypos = this.yPOS(node);

        let childCount = 0;

        let ma = node['ma'];
        let pa = node['pa'];

        let xind;
        let yind;

        let gender = node['sex'];
        this.data.parentChildEdges.forEach((d, i) => {

          if (d.ma === ma && d.pa === pa) {
            //Only count unaffected children so as to avoid gaps in the kid Grid
            if (!d.target.affected && d.target.sex === gender)
              childCount = childCount + 1
            if (d.target === node) {

              yind = childCount % (this.kidGridSize / 2);

              if (yind === 0)
                yind = this.kidGridSize / 2;

              xind = Math.ceil(childCount / 2);

            }
          }
        })

        let xoffset;

        if (node['ma']['affected'] && node['pa']['affected']) {
          xoffset = Config.glyphSize * 2;
        } else if (node['ma']['affected'] || node['pa']['affected']) {
          xoffset = Config.glyphSize * 3.5;
        } else {
          xoffset = Config.glyphSize * 1.5;
        }
        return 'translate(' + (xpos + xoffset + this.kidGridXScale(xind)) + ',' + (ypos + +this.kidGridYScale(yind)) + ')';

      })

    allNodes
      .transition(t.transition().ease(easeLinear))
      .attr('opacity', 1);

    //AllNodes
    allNodes
      .classed('node', true)
      .classed('aggregated', (d) => {
        return d['aggregated'];
      })
      .classed('collapsed', (d) => {
        return d['hidden'];
      });

    //Add cross through lines for deceased people
    allNodesEnter.filter(function (d: any) {
      return (d.ddate);
    })
      .append('line')
      .attr('class', 'nodeLine')

    //Node lines for deceased and uncollapsed nodes
    allNodes.selectAll('.nodeLine')
      .attr('x1', function (d: any) {
        return d.sex === Sex.Female ? -Config.glyphSize : -Config.glyphSize / 3;
      })
      .attr('y1', function (d: any) {
        return d.sex === Sex.Female ? -Config.glyphSize : -Config.glyphSize / 3;
      })
      .attr('x2', function (d: any) {
        return d.sex === Sex.Female ? Config.glyphSize : Config.glyphSize * 2.3;
      })
      .attr('y2', function (d: any) {
        return d.sex === Sex.Female ? Config.glyphSize : Config.glyphSize * 2.3;
      })
      .attr('stroke-width', 3)
      .attr('stroke', function (d: any) {
        return (d.affected) ? 'red' : '#e2e1e0';
      })


    //Node Lines for kid grid
    allNodes.selectAll('.nodeLine').filter((d) => {
      return d['hidden'] && !d['hasChildren']
    })
      .attr('x1', function (d: any) {
        return d.sex === Sex.Female ? -Config.hiddenGlyphSize / 1.5 : -Config.hiddenGlyphSize / 3;
      })
      .attr('y1', function (d: any) {
        return d.sex === Sex.Female ? -Config.hiddenGlyphSize / 1.5 : -Config.hiddenGlyphSize / 3;
      })
      .attr('x2', function (d: any) {
        return d.sex === Sex.Female ? Config.hiddenGlyphSize / 1.5 : Config.hiddenGlyphSize * 1.3;
      })
      .attr('y2', function (d: any) {
        return d.sex === Sex.Female ? Config.hiddenGlyphSize / 1.5 : Config.hiddenGlyphSize * 1.3;
      })
      .attr('stroke-width', 1);


    //Node Lines for non kid-grid hidden nodes
    allNodes.selectAll('.nodeLine').filter((d) => {
      return d['hidden'] && d['hasChildren']
    })
      .attr('x1', function (d: any) {
        return d.sex === Sex.Female ? -Config.hiddenGlyphSize : -Config.hiddenGlyphSize / 3;
      })
      .attr('y1', function (d: any) {
        return d.sex === Sex.Female ? -Config.hiddenGlyphSize : -Config.hiddenGlyphSize / 3;
      })
      .attr('x2', function (d: any) {
        return d.sex === Sex.Female ? Config.hiddenGlyphSize : Config.hiddenGlyphSize * 1.8;
      })
      .attr('y2', function (d: any) {
        return d.sex === Sex.Female ? Config.hiddenGlyphSize : Config.hiddenGlyphSize * 1.8;
      })
      .attr('stroke-width', 1)
    // .attr('stroke', function (d: any) {
    //   return (d.affected) ? 'red' : '#e2e1e0';
    // })

    //Add couples line
    allNodesEnter.filter(function (d: any) {
      return d['hasChildren'];
    })
      .append('line')
      .attr('class', 'couplesLine')
      .attr('visibility', 'hidden')


    allNodes.selectAll('.couplesLine')
      .attr('x1', (d: any) => {
        return d['sex'] === Sex.Female ? Config.glyphSize * 0.8 : Config.glyphSize * 1.3;
      })
      .attr('y1', function (d: any) {
        return d['sex'] === Sex.Female ? ( -Config.glyphSize * 1.8) : -Config.glyphSize * 0.2;
      })
      .attr('x2', (d: any) => {
        return d['sex'] === Sex.Female ? Config.glyphSize * 0.8 : Config.glyphSize * 1.3;
      })
      .attr('y2', function (d: any) {

        return d['sex'] === Sex.Female ? Config.glyphSize * 0.6 : Config.glyphSize * 2.2;
      })
      .attr('stroke-width', 2)


    //Add Male Node glyphs
    allNodesEnter.filter(function (d: any) {
      return d['sex'] === Sex.Male;
    })
      .append('rect')
      .classed('male', true)
      .classed('nodeIcon', true)


    //Size hidden nodes differently
    //regular nodes
    allNodes.selectAll('.male')
      .attr('width', Config.glyphSize * 2)
      .attr('height', Config.glyphSize * 2);


    //Add Attribute Bars next to node glyphs
    allNodesEnter
      .filter(function (d: any) {
        return !d['hidden'];
      })
      .append('rect')
      .classed('primary', true)
      .classed('attributeFrame', true)


    allNodesEnter
      .filter(function (d: any) {
        return !d['hidden'];
      })
      .append('rect')
      .classed('primary', true)
      .classed('attributeBar', true)

    allNodesEnter
      .filter(function (d: any) {
        return !d['hidden'];
      })
      .append('rect')
      .classed('secondary', true)
      .classed('attributeFrame', true)


    allNodesEnter
      .filter(function (d: any) {
        return !d['hidden'];
      })
      .append('rect')
      .classed('secondary', true)
      .classed('attributeBar', true)


    //leaf nodes, go into kidGrid
    allNodes.selectAll('.male')
      .filter((d) => {
        return d['hidden'] && !d['hasChildren']
      })
      .attr('width', Config.hiddenGlyphSize * 1)
      .attr('height', Config.hiddenGlyphSize * 1);


    //non kid grid nodes, higher up in the tree
    allNodes.selectAll('.male')
      .filter((d) => {
        return d['hidden'] && d['hasChildren']
      })
      .attr('width', Config.glyphSize * .75)
      .attr('height', Config.glyphSize * .75);


    //Add female node glyphs
    allNodesEnter.filter(function (d: any) {
      return d['sex'] === Sex.Female;
    })
      .append('circle')
      .classed('female', true)
      .classed('nodeIcon', true)

    //unhidden nodes
    allNodes.selectAll('.female')
      .attr('r', Config.glyphSize);

    //kidGrid nodes
    allNodes.selectAll('.female')
      .filter((d) => {
        return d['hidden'] && !d['hasChildren']
      })
      .attr('r', Config.hiddenGlyphSize / 2);

    //Hidden nodes (not in kid grid) farther up the tree
    allNodes.selectAll('.female')
      .filter((d) => {
        return d['hidden'] && d['hasChildren']
      })
      .attr('r', Config.glyphSize * .45);


    allNodes
      .classed('affected', (n: any) => {
        return n.affected
      })


    allNodesEnter
      .append('text')
      .attr('class', 'nodeLabel');

    allNodes.selectAll('.nodeLabel')
    // .attr('visibility','hidden')
      .text((d: any) => {
        return '';
        // return d.id
      })
      .attr('dx', function (d) {
        return d['sex'] === Sex.Male ? Config.glyphSize / 2 : -Config.glyphSize / 2;
      })
      .attr('dy', function (d) {
        return d['sex'] === Sex.Male ? 1.3 * Config.glyphSize : Config.glyphSize / 2.75;
      })
      .attr('fill', function (d: any) {
        return (d.affected) ? 'white' : 'black';
      })
      .attr('stroke', 'none')
      .style('font-size', Config.glyphSize);

  }

  private fillAttributeBars() {

    let nodeGroup = select('#genealogyTree').select('#nodes');
    let allNodes = nodeGroup.selectAll('.node');

    //attribute frames
    allNodes.selectAll('.attributeFrame')
      .attr('width', Config.glyphSize)
      .attr('y', (d) => {
        return d['sex'] === Sex.Female ? (-Config.glyphSize) : 0
      })
      .attr('fill', 'white')

    //attribute Bars
    allNodes.selectAll('.attributeBar')
      .attr('y', (d) => {
        return d['sex'] === Sex.Female ? (-Config.glyphSize) : 0
      })
      .attr('width', Config.glyphSize)


    allNodes.selectAll('.attributeFrame').filter('.primary')
      .attr('height', (d) => {
        let height = 0;
        let attr = this.primaryAttribute;

        if (attr) {
          height = Config.glyphSize * 2;
        }
        return height
      })


    allNodes.selectAll('.attributeFrame').filter('.secondary')
      .attr('height', (d) => {
        let height = 0;
        let attr = this.secondaryAttribute;

        if (attr) {
          height = Config.glyphSize * 2;
        }
        return height
      })

    allNodes.selectAll('.attributeBar').filter('.primary')
      .attr('height', (d: any) => {
        let height = 0;
        let attr = this.primaryAttribute;

        if (attr) {
          let data = this.data.getAttribute(attr.name, d.id);

          if (attr && attr.type === VALUE_TYPE_CATEGORICAL) {
            height = Config.glyphSize * 2;
          } else if (attr && data && (attr.type === VALUE_TYPE_INT || attr.type === VALUE_TYPE_REAL)) {
            this.attributeBarY.domain([attr.stats.min, attr.stats.max]);
            height = this.attributeBarY(data);
          }
        }

        return height;

      })
      .attr('y', (d: any) => {
        let y = 0;
        let attr = this.primaryAttribute;

        if (attr) {
          let data = this.data.getAttribute(attr.name, d.id);
          if (attr && data && (attr.type === VALUE_TYPE_INT || attr.type === VALUE_TYPE_REAL)) {
            this.attributeBarY.domain([attr.stats.min, attr.stats.max]);
            y = Config.glyphSize * 2 - this.attributeBarY(data);
          }


          return d['sex'] === Sex.Female ? (-Config.glyphSize) + y : y

        }
      })
      .attr('fill', (d: any) => {
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

    allNodes.selectAll('.attributeBar').filter('.secondary')
      .attr('height', (d) => {
        let height = 0;
        let attr = this.secondaryAttribute;

        if (attr && attr.type === VALUE_TYPE_CATEGORICAL) {
          height = Config.glyphSize * 2;
        } else if (attr && d[attr.name] && (attr.type === VALUE_TYPE_INT || attr.type === VALUE_TYPE_REAL)) {
          this.attributeBarY.domain([attr.stats.min, attr.stats.max]);
          height = this.attributeBarY(d[attr.name]);
        }
        return height
      })
      .attr('y', (d) => {
        let y = 0;
        let attr = this.secondaryAttribute;
        if (attr && d[attr.name] && (attr.type === VALUE_TYPE_INT || attr.type === VALUE_TYPE_REAL)) {
          this.attributeBarY.domain([attr.stats.min, attr.stats.max]);
          y = Config.glyphSize * 2 - this.attributeBarY(d[attr.name]);
        }
        return d['sex'] === Sex.Female ? (-Config.glyphSize) + y : y
      })
      .attr('fill', (d) => {
        let attr = this.secondaryAttribute;
        if (attr && d[attr.name] && attr.type === VALUE_TYPE_CATEGORICAL) {
          // console.log(d[attr.name],attr.categories)
          let ind = attr.categories.indexOf(d[attr.name]);
          return attr.color[ind]
        } else if (attr && d[attr.name] && (attr.type === VALUE_TYPE_INT || attr.type === VALUE_TYPE_REAL)) {
          return attr.color
        }
      })


    allNodes.selectAll('.primary')
      .attr('x', (d) => {
        // return d['sex'] === Sex.Female ? -Config.glyphSize * 2 : -Config.glyphSize
        return d['sex'] === Sex.Female ? Config.glyphSize * 2 : Config.glyphSize * 3
      })

    allNodes.selectAll('.secondary')
      .attr('x', (d) => {
        // return d['sex'] === Sex.Female ? -Config.glyphSize * 3 : -Config.glyphSize*2
        return d['sex'] === Sex.Female ? Config.glyphSize * 3.5 : Config.glyphSize * 4.5
      })


  }

  private addSlopeChart(){

    //Find y indexes of all rows
    let allPeople = Object.keys(this.data.yValues).map(Number);

    //Create a dictionary of y value to people
    let y2personDict = {};
    let yDict = this.data.yValues;

    // console.log('yDict', yDict)
    allPeople.forEach((person) => {
      if (person in yDict) { //may not be if dangling nodes were removed
        //Handle Duplicate Nodes
        yDict[person].forEach((y) => {
          if (y in y2personDict) {
            y2personDict[y].push(person);
          } else {
            y2personDict[y] = [person];
          }
        })
      }
    });

    //Find y indexes of all rows
    let rowOrder = Object.keys(y2personDict).map(Number);

    this.y2personDict = y2personDict;

    let t = transition('t').duration(500).ease(easeLinear);

    //create slope Lines
    // //Bind data to the cells
    let slopeLines = select('#slopeChart').selectAll('.slopeLine')
      .data(rowOrder.map((d: any,i) => {
        let nodes = y2personDict[d].map((id)=>{return this.data.nodes.filter((n)=>{return n.id == id.toString()})})
          return {y:d, ind:i, x:max(nodes,(n:Node)=>{return n[0].x})}}),(d:any)=> {return d.y});

    slopeLines.exit().remove();

    let slopeLinesEnter = slopeLines.enter().append('path') ;

    slopeLines = slopeLinesEnter.merge(slopeLines)

    slopeLines
      .attr('class', 'slopeLine')
      .transition(t)
      .attr('d', (d:any) => {
        return this.slopeChart(d,rowOrder)
      })
      .style('stroke','url(#gradient)');
  }

  //Path generator for Slope Chart Lines
  private slopeChart(d,rowOrder) {

    let nx = Config.slopeChartWidth*0.3;
    let width = Config.slopeChartWidth;
    // let endpoint = this.width + 40;

    let linedata = [{
      x: this.x(d.x),
      y: this.y(rowOrder[d.ind])
    },
      {
          x: this.width,
          y:this.y(rowOrder[d.ind])
        },
        {
          x:  this.width + Config.slopeChartWidth - nx,
          y: this.y(d.y)
        },
      {
        x: this.width + Config.slopeChartWidth,
        y: this.y(d.y)
      }];


    return this.slopeLineFunction(linedata);
  }



  /**
   *
   * This function updates the nodes in the genealogy tree
   *
   * @param nodes array of nodes to update the tree with
   */
  private update_nodes() {
    this.addNodes();
    this.addHightlightBars();
    this.addLifeLines();
    this.fillAttributeBars();
    this.addSlopeChart();
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

    console.log('called update_visible_nodes');

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

      console.log('redrawing tree, there are ', this.data.nodes.filter(d => {
        return d.hidden
      }).length, 'hidden nodes')
      // this.data = item;
      this.update();
    });

    events.on(TABLE_SORTED_EVENT,(evt,item) =>{

      let t = transition('t').duration(500).ease(easeLinear);

      selectAll('.slopeLine')
        .transition(t)
        .attr('d', (d: any) => {
          let nodes = this.y2personDict[item.rowOrder[item.sortedIndexes.indexOf(d.ind)]].map((id)=>{return this.data.nodes.filter((n)=>{return n.id == id.toString()})})
          // console.log(max(nodes,(n:Node)=>{console.log('node is ', n[0]); return n[0].x}))
          return this.slopeChart({'y':d.y, 'ind':item.sortedIndexes.indexOf(d.ind), x:max(nodes,(n:Node)=>{return n[0].x})},item.rowOrder)
        });

    })

    events.on(PRIMARY_SECONDARY_SELECTED, (evt, attribute) => {

      if (attribute.primary) {
        this.primaryAttribute = attribute;
      } else {
        this.secondaryAttribute = attribute;
      }
      this.update_visible_nodes();

      this.update_legend();
    });

    events.on(POI_SELECTED, (evt, affectedState) => {
      this.data.uncollapseAll();
      this.data.defineAffected(affectedState);
      this.data.collapseAll();
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
