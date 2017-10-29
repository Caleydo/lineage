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
  scaleLog, scalePow,
  scaleOrdinal, schemeCategory20c
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

import {PRIMARY_SELECTED, POI_SELECTED, TABLE_VIS_ROWS_CHANGED_EVENT} from './tableManager';
import {VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT, VALUE_TYPE_REAL} from 'phovea_core/src/datatype';
// import {TABLE_SORTED_EVENT} from './attributeTable'
import Node from './Node';
import {Sex} from './Node';
import {layoutState} from './Node';
import {isNull} from 'util';
import {isNullOrUndefined} from 'util';
import {search} from 'phovea_core/src';
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

    private colorScale = ["#969696", "#9e9ac8", "#74c476", "#fd8d3c", "#9ecae1"];

    

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

    this.width = 970 - this.margin.left - this.margin.right;

    this.visibleXAxis = axisTop(this.x).tickFormat(format('d'));
    this.extremesXAxis = axisTop(this.x2);

    // window.onscroll = (e:any)=>{console.log(e,'user scrolled')}

    this.$node.append('nav').attr('class','navbar navbar-expand-lg navbar-light bg-light')
    .append('div').attr('id', 'tableNav')
    // .attr('class','mx-auto') //for centering on nav bar

    this.$node.select('#tableNav')
    .append('a').attr('class','navbar-brand')
    .html('Genealogy Tree View')


    this.$node.select('.navbar')
    .append('button').attr('type','button').attr('class','btn btn-secondary mr-1 ml-auto').text('Aggregate Tree')
    this.$node.select('.navbar')
    .append('button').attr('type','button').attr('class','btn btn-secondary mr-1').text('Hide Non Affected Nodes')
    this.$node.select('.navbar')
    .append('button').attr('type','button').attr('class','btn btn-secondary mr-1').text('Expand Tree')

    //Create a static div for the headers
    // this.$node.append('div').attr('id', 'headersDIV');




    // const headerSVG = select('#headersDIV').append('svg')
    const headerSVG =this.$node.append('svg')
      .attr('width', 1000)
      .attr('height',170)
      .attr('id', 'headers')

    // headerSVG.append('rect')
    //   .attr('width', 970)
    //   .attr('height',160)
    //   .attr('fill','white')

    // headerSVG.append('g')
    //   .attr('transform', 'translate(' + this.margin.left + ',90)')
    //   .attr('id', 'headerGroup');

    const svg = this.$node.append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('id', 'graph')
      .on('click',()=>{
        select('#nodeActions').attr('visibility', 'hidden');
        selectAll('.edges').classed('selected',false);
        selectAll('.parentEdges').classed('selected',false);
        selectAll('.clicked').classed('clicked',false);
      })

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
    document.getElementById('graph').addEventListener('scroll', () => {
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
      .attr('transform', 'translate(' + this.margin.left + ',' + (Config.glyphSize) + ')')
      .attr('id', 'genealogyTree');

    //Ensure the right order of all the elements by creating seprate groups

    //create a group in the background for edges
    select('#genealogyTree')
      .append('g')
      .attr('id', 'familyBars');

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


    //create a group in the foreground for nodes
    select('#genealogyTree')
      .append('g')
      .attr('id', 'nodes');


    //create a group in the fore-foreground for menus
    select('#genealogyTree')
      .append('g')
      .attr('id', 'menus');


    let button = select('#menus')
      .append('g')
      .attr('id','nodeActions')
      .attr('visibility','hidden')

    button.append('rect')
      .classed('nodeButton',true)
      .attr('id','menuOption1')
      .attr('y', -18)

    button.append('text')
      .classed('nodeButtonText', true)
      .attr('id','menuLabel1')
      .attr('y',-8)
      .attr('x',5)

    button.append('rect')
      .classed('nodeButton',true)
      .attr('id','menuOption2')
      .attr('y', 0)

    button.append('text')
      .classed('nodeButtonText', true)
      .attr('id','menuLabel2')
      .attr('y',10)
      .attr('x',5)

    selectAll('.nodeButtonText')
      .attr('text-anchor', 'start')
      .attr('fill', 'white')
      .attr('font-size',12)

    selectAll('.nodeButton')
      .attr('width', 60)
      .attr('height', 15)
      .attr('fill', '#393837')
      .attr('opacity', .8)
      .attr('x', 0)
      .attr('rx', 2)
      .attr('ry', 10)

    //Create group for all time axis
    const axis = select('#headers').append('g')
      .attr('transform', 'translate(40,135)')
      .attr('id', 'axis');


    //Create group for legend
    const legend = axis.append('g')
      .attr('id', 'legend');

    //Add button to slopeChart Div that says 'revert to Tree Order'
    button = legend
    // button = select('#caleydoHeader').select('.navbar')
      .append('g')
      .attr('transform', 'translate(0,'  + (-65) + ')')
      .attr('id', 'treeButtons')

    const self = this;
    button.append('rect')
      .classed('button',true)
      .attr('id','aggregateAllButton')
      .attr('width', 120)
      .attr('height', 25)
      .attr('x', this.width*0.1)
      .attr('rx', 10)
      .attr('ry', 20)
      .attr('fill', '#959492')
      .attr('y', 0)
      .attr('opacity', .1)
      .on('click', function (d) {

        selectAll('.slopeLine').classed('clickedSlope', false)
        selectAll('.highlightBar').classed('selected', false);

        selectAll('.button').attr('fill', '#959492')
        .attr('opacity', .1)
        select(this)
          .attr('fill','#3b3b3b')
          .attr('opacity', .3)
        self.data.aggregateTreeWrapper(undefined, layoutState.Aggregated);
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
      .attr('id','hideAllButton')
      .attr('width', 120)
      .attr('height', 25)
      .attr('x', this.width*0.35)
      .attr('rx', 10)
      .attr('ry', 20)
      .attr('fill', '#959492')
      .attr('y', 0)
      .attr('opacity', .1)
      .on('click', function (d) {

        selectAll('.slopeLine').classed('clickedSlope', false)
        selectAll('.highlightBar').classed('selected', false);

        selectAll('.button')
          .attr('fill', '#959492')
        .attr('opacity', .1)
        select(this)
          .attr('fill','#3b3b3b')
          .attr('opacity', .3)
        self.data.aggregateTreeWrapper(undefined, layoutState.Hidden);
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
      .attr('id','expandAllButton')
      .attr('width', 120)
      .attr('height', 25)
      .attr('x', this.width*0.6)
      .attr('rx', 10)
      .attr('ry', 20)
      .attr('fill', '#959492')
      .attr('y', 0)
      .attr('opacity', .1)
      .on('click', function (d) {

        selectAll('.slopeLine').classed('clickedSlope', false)
        selectAll('.highlightBar').classed('selected', false);

        selectAll('.button').attr('fill', '#959492')
        .attr('opacity', .1)
        select(this)
          .attr('fill','#3b3b3b')
          .attr('opacity', .3)
        self.data.aggregateTreeWrapper(undefined, layoutState.Expanded);
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
 console.log('HERE')
    this.$node.select('#graph')
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    this.update_edges();
    this.update_nodes();

    // console.log(this.data.nodes)

    this.addFamilyBars();
  }

  private addFamilyBars() {

    let self = this;

    let nodes = this.data.nodes;

    let t = transition('t').duration(500).ease(easeLinear);

    //Separate groups for separate layers
    const familyBarsGroup = select('#genealogyTree').select('#familyBars');

    let familyDict = {};

    nodes.map((node)=>{
      if (familyDict[node.kindredID]){
        familyDict[node.kindredID].push(node.y)
      } else {
        familyDict[node.kindredID] = [node.y]
      }

    })

    var familyArray = new Array();

    console.log(familyDict)

    let maxY = 1;
    for (var key in familyDict) {
        // // maxY = max([maxY, max(familyDict[key])])
        
        // console.log(typeof(maxY),typeof(max(familyDict[key])))
        // console.log(Math.max(maxY,+max(familyDict[key])))
        familyArray.push({'id':key,'min':max([maxY, +min(familyDict[key])])+1, 'max':max(familyDict[key])});
        maxY = Math.max(maxY,+max(familyDict[key]))
    }



    console.log(familyArray)
    // // Attach node groups
    let allFamilyBars = familyBarsGroup.selectAll('.familyBar')
      .data(familyArray, function (d: Node) {
        return d.id;
      });

    allFamilyBars.exit().remove();

    const allFamilyBarsEnter = allFamilyBars
      .enter()
      .append('rect')
      .classed('familyBar',true)



    // let colorScale = scaleOrdinal().domain([0,1]).range(['#8ca252','#6b6ecf'])

    allFamilyBars = allFamilyBarsEnter.merge(allFamilyBars);

    allFamilyBars
    .attr('x',-15)
    .attr('y',(d)=>{return this.y(Math.round(d.min))})
    .attr('width',25)
    .attr('height',(d)=>{return this.y(Math.round(d.max)) - this.y(Math.round(d.min))})
    .attr('opacity',.4)
    .attr('fill',(d,i)=>{console.log(d); return d.id === '42623' ? this.colorScale[1] : this.colorScale[0]})

    let allFamilyLabels = familyBarsGroup.selectAll('.familyLabel')
      .data(familyArray, function (d: Node) {
        return d.id;
      });

    allFamilyLabels.exit().remove();

    const allFamilyLabelsEnter = allFamilyLabels
      .enter()
      .append('text')
      .classed('familyLabel',true)



    allFamilyLabels = allFamilyLabelsEnter.merge(allFamilyLabels);

    allFamilyLabels
    .attr('x',-10)
    .attr('y',(d)=>{return this.y(Math.round(d.max))+23})
    .text((d)=>{return 'Family ' + d.id})
    // .attr("font-family", "sans-serif")
    .attr("font-size", "20px")
    .attr('font-weight','bold')
    .attr("fill", "#4e4e4e")
    .attr('transform', (d)=>{return 'rotate(-90,-20,' + this.y(Math.round(d.max)) + ')' })
    .attr('text-anchor','start');


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
    edgePaths.exit().remove();

    let edgePathsEnter = edgePaths
      .enter()
      .append('path');

    edgePaths = edgePathsEnter.merge(edgePaths);

    edgePathsEnter.attr('opacity', 0);

    // edgePaths.attr('opacity',0)

    edgePaths
      .attr('class', 'edges')
      // .transition(t)
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
      // .transition(t.transition().duration(1000).ease(easeLinear))
      .transition('t')
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


    parentEdgePaths.exit().style('opacity', 0).remove();

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
      // .transition(t)
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
      .transition(t.transition().duration(500).ease(easeLinear))
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

    function highlightRows(d: any) {

      function selected(e: Node) {
        let returnValue = false;
        //Highlight the current row in the graph and table

        if (e.y === Math.round(d.y)) {
          returnValue = true;
        }
        return returnValue;
      }

      selectAll('.slopeLine').classed('selectedSlope', false);

      selectAll('.slopeLine').filter((e: Node) => {

        return e.y === Math.round(d.y);
      }).classed('selectedSlope', true)

      //Set opacity of corresponding highlightBar
      selectAll('.highlightBar').filter(selected).attr('opacity', .2);

      //Set the age label on the lifeLine of this row to visible
      selectAll('.ageLineGroup').filter((e: Node) => {
        return e.y === Math.round(d.y);
      }).filter((d: Node) => {
        return !d.aggregated && !d.hidden
      }).select('.ageLabel').attr('visibility', 'visible');

      // selectAll('.duplicateLine').filter(selected).attr('visibility', 'visible');
    }

    function clearHighlights(){
      // selectAll('.duplicateLine').attr('visibility', 'hidden');

      selectAll('.slopeLine').classed('selectedSlope', false);

      //Hide all the highlightBars
      selectAll('.highlightBar').attr('opacity', 0);

      selectAll('.ageLabel').attr('visibility', 'hidden');
    }


    selectAll('.highlightBar')
      .on('mouseover',highlightRows)
      .on('mouseout', clearHighlights)
      .on('click', (d: any) => {

        console.log('clicked')
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

      selectAll('.bars')
      .selectAll('.backgroundBar')
      .on('mouseover', highlightRows)
      .on('mouseout', clearHighlights);

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

    // Attach Couples Lines
    let couplesLines = couplesLinesGroup.selectAll('.couplesLine')
      .data(couplesData, d => {return d.id});

    couplesLines.exit().remove();

    const couplesLinesEnter = couplesLines
      .enter()
      .append('line')
      .attr('class', 'couplesLine')
      .attr('visibility', 'hidden')

    couplesLines = couplesLinesEnter.merge(couplesLines)

    couplesLines.attr('opacity',0)

    couplesLines
      .attr('x1', (d:any) => {
        return this.x(d.x) + Config.glyphSize*.9;
      })
      .attr('y1', (d:any)=> {
        return this.y(d.y-0.4)
      })
      .attr('x2', (d:any) => {
        return this.x(d.x) + Config.glyphSize*.9;
      })
      .attr('y2', (d:any) =>{
        if (d.extend){
          return this.y(d.y+1)
        }
        return this.y(d.y+0.4)
      })
      .attr('stroke-width', 2)


    couplesLines.attr('opacity',1);

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

    let nodes = this.data.nodes; //.filter(d=>{return !d.hasChildren && !d.hidden});

    let t = transition('t').duration(500).ease(easeLinear);

    //Separate groups for separate layers
    const nodeGroup = select('#genealogyTree').select('#nodes');

    // Attach node groups
    let allNodes = nodeGroup.selectAll('.node')
      .data(nodes, function (d: Node) {
        return d.uniqueID;
      });

    allNodes.exit().remove();

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
          if (d.ma === ma || d.pa === pa) {
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



  /**
   *
   * This function highlights (on, or off) all the edges in a branch
   *
   * @param starting node
   * @param on true to turn the highlighting on, false to turn it off
   */
  private highlightBranch(node:Node,on:boolean) {
    if (!node.hasChildren) {
      return;
    }
    // start by highlighting spouse edges
   let selectedEdges = selectAll('.edges').filter((d:Node) => {
      return ((d.ma === node || d.pa === node) || !isUndefined(node.spouse[0].spouse.find((s:Node) => {return d.ma === s || d.pa === s;})));
    })
    let selectedParentEdges = selectAll('.parentEdges').filter((d:Node) => {
      return ((d.ma === node || d.pa === node) || !isUndefined(node.spouse[0].spouse.find((s:Node) => {return d.ma === s || d.pa === s;})));
    })


    if (on) {
      selectedEdges.classed('selected', true);
      selectedParentEdges.classed('selected', true);
    } else {
      selectedEdges.classed('selected', false);
      selectedParentEdges.classed('selected', false);
    }


    node.children.forEach((child:Node) => {this.highlightBranch(child,on)});
  }

  private renderNodeGroup(element, d: Node) {

    const t = transition('t').duration(500).ease(easeLinear);

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

      ageLineGroup
        .append('text')
        .attr('class', 'ageLabel');

      //Add cross at the end of lifelines for deceased people
      if (d.ddate < CURRENT_YEAR) {
        ageLineGroup
          .append('line')
          .attr('class', 'endOfTheLine');
      }


    }

    //Add cross through lines for deceased people
    if (d.ddate && element.selectAll('.nodeLine').size() === 0) {
      element
        .append('line')
        .attr('class', 'nodeLine');
    }

    let m1, m2, f1, f2, strokeWidth, glyphSize, radius, lineGlyphSize;

    if (d.hidden && !d.hasChildren) {
      f1 = 2 / 3;
      m1 = 1 / 3;
      f2 = 2 / 3;
      m2 = 1.3;
      strokeWidth = 1;
      lineGlyphSize = Config.hiddenGlyphSize;
      glyphSize = Config.hiddenGlyphSize;
      radius = Config.hiddenGlyphSize / 2;
    } else if (d.hidden && d.hasChildren) {
      f1 = 1;
      m1 = 1 / 3;
      f2 = 1;
      m2 = 1.8;
      strokeWidth = 1;
      lineGlyphSize = Config.hiddenGlyphSize;
      glyphSize = Config.glyphSize * .75;
      radius = Config.glyphSize * .45;

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

    if (d.duplicates.length>0 && !d.hidden && element.selectAll('.duplicateIcon').size() === 0) {
      element
        .append('text')
        .classed('duplicateIcon', true);

        element
          .append('line')
          .classed('duplicateLine', true);
    }


    //Add nodes
    if (element.selectAll('.nodeIcon').size() === 0) {
      if (d.sex === Sex.Male) {
        element
          .append('rect')
          .classed('male', true)
          .classed('nodeIcon', true);
      } else {
        element
          .append('circle')
          .classed('female', true)
          .classed('nodeIcon', true);
      }

      //Add Attribute Bars next to node glyphs
      element
        .append('rect')
        .classed('attributeFrame', true)
        .classed('primary', true)

      element
        .append('rect')
        .classed('attributeBar', true)
        .classed('primary', true);


    }


    element.selectAll('.nodeIcon')
      .on('click', (d:Node) => {
        event.stopPropagation();

        selectAll('.nodeIcon').classed('hover', false);
        // selectAll('.nodeIcon').filter((n:Node)=>{return n == d}).classed('clicked', true);


        selectAll('.edges').classed('selected',false);
        this.highlightBranch(d,true);

        function selected(e: Node) {
          let returnValue = false;
          //Highlight the current row in the graph and table
          if (e.y === Math.round(d.y)){
            returnValue = true;
          }
          //Highlight any duplicates for this node
          d.duplicates.forEach((dup) => {
            if (Math.round(dup.y) === Math.round(e.y)){
              returnValue = true;
            }
          });
          return returnValue;
        }




        if (d.hasChildren) {

          select('#nodeActions').attr('visibility', 'visible');

          let xOffset, yOffset;
          if (d.sex === Sex.Female) {
            xOffset = 12 -83 + 40 ; yOffset = 30;
          } else {
            xOffset = 20 - 83 + 40; yOffset = 8 + 30;
          }

          select('#nodeActions').attr('transform', 'translate(' + (this.xPOS(d) + xOffset) + ' , ' + (this.yPOS(d) + yOffset) + ' )')

          let actions;

          if (d.state === layoutState.Expanded) {
            actions = [{'state':layoutState.Aggregated, 'string':'Aggregate','offset':5},{'state':layoutState.Hidden, 'string':'Hide' , 'offset':20}];
          } else if (d.state === layoutState.Aggregated) {
            actions = [{'state':layoutState.Expanded, 'string':'Expand', 'offset':13},{'state':layoutState.Hidden, 'string':'Hide','offset':20}];
          } else if (d.state === layoutState.Hidden) {
            actions = [{'state':layoutState.Expanded, 'string':'Expand','offset':13},{'state':layoutState.Aggregated, 'string':'Aggregate','offset':5}];
          }

          select('#nodeActions').select('#menuLabel1')
            .text(actions[0].string)
            .attr('x',actions[0].offset)

          select('#nodeActions').select('#menuLabel2')
            .text(actions[1].string)
            .attr('x',actions[1].offset)

          select('#nodeActions').select('#menuOption1')
            .on('click', () => {
              // select('#nodeActions').attr('visibility', 'hidden');
              this.data.aggregateTreeWrapper(d.uniqueID, actions[0].state);
              this.update_graph();
            })

          select('#nodeActions').select('#menuOption2')
            .on('click', () => {
              // select('#nodeActions').attr('visibility', 'hidden');
              this.data.aggregateTreeWrapper(d.uniqueID, actions[1].state);
              this.update_graph();
            });
        } else {

          select('#nodeActions').attr('visibility', 'hidden');;
        }

        selectAll('.slopeLine').classed('selectedSlope', false);

        selectAll('.slopeLine').filter((e: Node) => {
          return e.y === Math.round(d.y);
        }).classed('selectedSlope', true)

        //Set opacity of corresponding highlightBar
        selectAll('.highlightBar').filter(selected).attr('opacity', .2);

        //Set the age label on the lifeLine of this row to visible
        selectAll('.ageLineGroup').filter((e: Node) => {
          return e.y === Math.round(d.y);
        }).filter((d: Node) => {
          return !d.aggregated && !d.hidden
        }).select('.ageLabel').attr('visibility', 'visible');

        // selectAll('.duplicateLine').filter(selected).attr('visibility', 'visible');
      })
      .on('mouseover', function (){

        if (d.hasChildren){
          select(this).classed('hovered', true);
        }


      })
      .on('mouseout', function (){

        select(this).classed('hovered', false);

        selectAll('.slopeLine').classed('selectedSlope', false);

        //Hide all the highlightBars
        selectAll('.highlightBar').attr('opacity', 0);

        selectAll('.ageLabel').attr('visibility', 'hidden');

      })

    //Size hidden nodes differently
    //regular nodes
    element.selectAll('.male')
      .transition(t)
      .attr('width', glyphSize)
      .attr('height', glyphSize);

    //unhidden nodes
    element.selectAll('.female')
      .transition(t)
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
        const attr = this.primaryAttribute;


        if (attr) {
          const data = this.data.getAttribute(attr.name, d.id);
          if (data) {
            height = Config.glyphSize * 2;
          }
        }
        return height;
      })


    //attribute Bars
    element.select('.attributeBar')
      .attr('y', () => {
        return d.sex === Sex.Female ? (-Config.glyphSize) : 0
      })
      .attr('width', Config.glyphSize)
      .attr('height', () => {
        let height = 0;
        const attr = this.primaryAttribute;

        if (attr) {
          let data = this.data.getAttribute(attr.name, d.id);

          if (attr && data && attr.type === VALUE_TYPE_CATEGORICAL) {
            height = Config.glyphSize * 2;
          } else if (attr && data && (attr.type === VALUE_TYPE_INT || attr.type === VALUE_TYPE_REAL)) {
            this.attributeBarY.domain(attr.range).clamp(true);
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
            this.attributeBarY.domain(attr.range).clamp(true);
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


      element.select('.ageLabel')
      .attr('dy', Config.glyphSize * 0.8)
      .attr('dx', () => {

        let ageAtDeath = Math.abs(this.x(d['ddate']) - this.x(d['bdate']));
        let ageToday = Math.abs(this.x(CURRENT_YEAR) - this.x(d['bdate']))

        if (isNaN(ageAtDeath) && isNaN(ageToday)) {
          return '';
        }

        return (+d['ddate']) ? ageAtDeath : ageToday;
      })
      .attr('text-anchor', 'end')
      .text(function () {
        let ageAtDeath = (d['ddate'] - d['bdate']);
        let ageToday = (CURRENT_YEAR - d['bdate']);
        if (isNaN(ageAtDeath) && isNaN(ageToday)) {
          return '';
        }
        return (+d['ddate']) ? ageAtDeath : ageToday;
      })
      .attr('fill', function (d: any) {
        return (d.affected) ? 'black' : '#9e9d9b';
      })
      .style('font-size', Config.glyphSize * 1.5)
      .style('font-weight', 'bold')
      .attr('visibility', 'hidden');




    element.select('.duplicateLine')
      .attr('x1',()=>{
        let n = d;
        let dupNode = n.duplicates.find(d=>{return d.y !== n.y});
        if (dupNode.y > n.y)
          return;

        let glyphSize;
        let offset =0;

        if (n.hidden)
          glyphSize = Config.hiddenGlyphSize;
        else
          glyphSize = Config.glyphSize;


        //Add offset for kid grids
        if (!n.hasChildren && n.hidden){
          offset = glyphSize * 3;
        }

         if (dupNode.x <=n.x){
          if (n.sex === Sex.Male) {
            return  glyphSize;
          } else {
            return 0;
          }
        }


        // return glyphSize + offset
      })
      .attr('y1',()=>{

        let n = d;
          let dupNode = n.duplicates.find(d=>{return d.y !== n.y});
          if (dupNode.y > n.y)
            return;

          let glyphSize;
        if (n.hidden) {
          glyphSize = Config.hiddenGlyphSize;
        } else {
          glyphSize = Config.glyphSize;

          if (dupNode.y < n.y) {
            if (n.sex === Sex.Male) {
              return -glyphSize
            } else {
              return -glyphSize*2
            }
          }
        }

        // return +3*glyphSize
      })
      .attr('x2',()=>{
        let n = d;
        let dupNode = n.duplicates.find(d=>{return d.y !== n.y});
        if (dupNode.y > n.y)
          return;


        let glyphSize;
        let offset =0;

        if (n.hidden) {
          glyphSize = Config.hiddenGlyphSize;
        }
        else
          glyphSize = Config.glyphSize;

        //Add offset for kid grids
        if (!dupNode.hasChildren && dupNode.hidden){
          offset = glyphSize * 3;
        }

        // if (dupNode.x <=n.x){
        //   return this.x(dupNode.x)- this.x(n.x) +glyphSize + offset
        // } else {
        //   return  this.x(dupNode.x) - this.x(n.x) +glyphSize - offset;
        // }

        if (dupNode.x <=n.x){

          if (n.sex === Sex.Male) {
            return this.x(dupNode.x)- this.x(n.x) +glyphSize + offset
          } else {
            return 0;
          }
        }
      })
      .attr('y2',(n:Node)=>{

        let dupNode = n.duplicates.find(d=>{return d.y !== n.y});
        if (dupNode.y > n.y)
          return;

        let glyphSize;
        if (n.hidden)
          glyphSize = Config.hiddenGlyphSize;
        else
          glyphSize = Config.glyphSize;

        if (n.sex === Sex.Male) {
          return this.y(n.duplicates.find(d=>{return d.y !== n.y}).y)- this.y(n.y) + glyphSize*3
        } else {
          return this.y(n.duplicates.find(d=>{return d.y !== n.y}).y)- this.y(n.y) + glyphSize*2
        }


      })
      // .attr('visibility', 'hidden')


    element.select('.duplicateIcon')
      .text('\uf0dd')
      .attr('y', (n: Node) => {
        let glyphSize;
        if (n.hidden)
          glyphSize = Config.hiddenGlyphSize*.75;
        // if (n.hidden && !n.hasChildren)
        //   glyphSize = Config.hiddenGlyphSize*.5;
        else
          glyphSize = Config.glyphSize;
        if (n.sex === Sex.Male){
          if (n.y > n.duplicates.find(d=>{return d.y !== n.y}).y)
            return glyphSize -1
          else
            return glyphSize * 3 - 1
        } else {
            return glyphSize * 2 - 1
        }

      })
      .attr('x', (n: Node) => {
        let glyphSize;
        if (n.hidden)
          glyphSize = Config.hiddenGlyphSize*.75;
        // if (n.hidden && !n.hasChildren)
        //   glyphSize = Config.hiddenGlyphSize*.5;
        else
          glyphSize = Config.glyphSize;

        if (n.sex === Sex.Male){
          if (n.y > n.duplicates.find(d=>{return d.y !== n.y}).y)
            return -glyphSize
          else
            return glyphSize
        } else {
          return 0;
        }
      })
      // .attr('y',0)
      // .attr('x',0)
      .attr('font-family', 'FontAwesome')
      .attr('font-size', (d:Node)=>{
        if (d.hidden){return Config.hiddenGlyphSize*2} else {return Config.glyphSize*2.5}})
      .attr('text-anchor', 'middle')
      // .attr('text-anchor','start')
      .attr('transform', (n: Node) => {
        if (n.y > (n.duplicates.find((d) => {return d.y !== n.y;}).y)){
          return 'rotate(' + 180 + ')';
        }

      })

    element.select('.duplicateIcon')
      .on('mouseover',function(){
        select(this).classed('hovered', true);
        //show duplicate rows


        function selected(e: Node) {
          let returnValue = false;
          //Highlight the current row in the graph and table
          if (e.y === Math.round(d.y)){
            returnValue = true;
          }
          //Highlight any duplicates for this node
          d.duplicates.forEach((dup) => {
            if (Math.round(dup.y) === Math.round(e.y)){
              returnValue = true;
            }
          });
          return returnValue;
        }
        selectAll('.duplicateLine').filter(selected).classed('hovered',true);

      })
      .on('mouseout',function(){
        select(this).classed('hovered', false);
        selectAll('.duplicateLine').classed('hovered',false);
        //show duplicate rows
      })
      .on('click',function(){
        event.stopPropagation();

        function selected(e: Node) {
          let returnValue = false;
          //Highlight the current row in the graph and table
          if (e.y === Math.round(d.y)){
            returnValue = true;
          }
          //Highlight any duplicates for this node
          d.duplicates.forEach((dup) => {
            if (Math.round(dup.y) === Math.round(e.y)){
              returnValue = true;
            }
          });
          return returnValue;
        }

        selectAll('.duplicateLine').filter(selected).classed('clicked',true);
        select(this).classed('clicked', true);
        select(this).classed('hovered', false);

      })


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

    const scrollOffset = document.getElementById('graph').scrollTop;
    const divHeight = document.getElementById('graph').offsetHeight;

    const minY = this.y.invert(scrollOffset);
    const maxY = this.y.invert(divHeight + scrollOffset - 75)

    //Filter data to adjust x axis to the range of nodes that are visible in the window.

    const filtered_nodes = this.data.nodes.filter((d:Node) => {
      return d.y >= Math.round(minY) && d.y <= Math.round(maxY);
    });

    if (filtered_nodes.length === 0){
      return; //no visible nodes on the screen;
    }


    const filteredDomain = [min(filtered_nodes, function (d:Node) {
      return +d.bdate - 5;
    }),
      max(filtered_nodes, function (d:Node) {
        return +d.ddate + 5;
      })];


    const allDomain = [min(this.data.nodes, function (d:Node) {
      return +d.bdate - 5;
    }),
      max(this.data.nodes, function (d:Node) {
        return +d.ddate;
      })];

    //Temporary cap @ 2016. Not sure why the axis are scaling to 2025 automatically.
    if (allDomain[1] > CURRENT_YEAR)
      allDomain[1] = CURRENT_YEAR;

    if (filteredDomain[1] > CURRENT_YEAR) {
      filteredDomain[1] = CURRENT_YEAR;
    }
    // console.log(allDomain, filteredDomain)
    //Build time axis

    //for visible nodes
    let x_range = [0];
    let x_domain = [allDomain[0]];
    let x_ticks = [allDomain[0]];

    //for out of scope nodes
    let x2_range = [0];
    let x2_domain = [allDomain[0]];
    let x2_ticks = [];


    //If there are hidden nodes older than the first visible node
    if (allDomain[0] < filteredDomain[0]) {
      x_range.push(this.width * 0.05);
      x_domain.push(filteredDomain[0]);
      x_ticks.push(filteredDomain[0]);


      x2_range.push(this.width * 0.05);
      x2_domain.push(filteredDomain[0]);

      //Add tick marks
      let left_range = range(allDomain[0], filteredDomain[0], 10);
      x2_ticks = left_range;

    }

    x_ticks = x_ticks.concat(ticks(filteredDomain[0], filteredDomain[1], 10));


    if (allDomain[1] !== filteredDomain[1]) {

      x_range.push(this.width * 0.95);
      x_domain.push(filteredDomain[1]);
      x_ticks.push(filteredDomain[1]);

      x2_range.push(this.width * 0.95);
      x2_domain.push(filteredDomain[1]);

      x2_range.push(this.width);
      x2_domain.push(allDomain[1]);

      let right_range = range(filteredDomain[1], allDomain[1], 10);
      x2_ticks = x2_ticks.concat(right_range);
    }

    x_range.push(this.width);
    x_domain.push(allDomain[1]);
    x_ticks.push(allDomain[1]);

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

  //
  // //Function that repositions the visible nodes to fill the graph.
  // private update_visible_nodes() {
  //
  //   // console.log('called update_visible_nodes');
  //
  //   let scrollOffset = document.getElementById('graph_table').scrollTop;
  //   let divHeight = document.getElementById('graph_table').offsetHeight;
  //
  //   // 	          console.log(divHeight, this.y(65),this.y(72), (divHeight + scrollOffset) - 75)
  //
  //   let minY = this.y.invert(scrollOffset) - 2;
  //   let maxY = this.y.invert(divHeight + scrollOffset - 75);
  //
  //   let filtered_nodes = this.data.nodes.filter((d) => {
  //     return d['y'] >= Math.round(minY);
  //   });
  //
  //
  //   let filtered_parentParentEdges = this.data.parentParentEdges.filter((d) => {
  //     return d['ma'].y >= Math.round(minY) && d['pa'].y >= Math.round(minY);
  //   });
  //
  //   let filtered_parentChildEdges = this.data.parentChildEdges.filter((d) => {
  //     return d.target.y >= Math.round(minY);
  //   });
  //
  //
  //   //Call function that updates the position of all elements in the tree
  //   this.update_graph()
  //
  //
  // }


  /**
   *
   * This function returns the x position for a given node.
   *
   * @param node node to position
   * @param offset optional flag to only return the offset for male/female and not the position in the whole svg.
   */
  private xPOS(node:Node,offset?:boolean) {

    if (offset == null) {
      offset = false;
    }

    if (node.sex === Sex.Male) {
      if (node.hidden && node.hasChildren)
        return !offset? this.x(node.x) - Config.hiddenGlyphSize*.8 : -Config.hiddenGlyphSize*.8;
      if (!node.hidden)
        return !offset? this.x(node.x) - Config.glyphSize : -Config.glyphSize;
      if (node.hidden && !node.hasChildren)
        return !offset? this.x(node.x) - Config.hiddenGlyphSize / 2 : -Config.hiddenGlyphSize / 2;
    }
    else
      return !offset? this.x(node.x) : 0;
  }

  /**
   *
   * This function returns the x position for a given node.
   *
   * @param node node to position
   * @param offset optional flag to only return the offset for male/female and not the position in the whole svg.
   */
  private yPOS(node:Node,offset?) {

    if (offset == null) {
      offset = false;
    }

    if (node.sex=== Sex.Male) {
      if (node.hidden && node.hasChildren) {
        return !offset ? this.y(node.y) - Config.hiddenGlyphSize : -Config.hiddenGlyphSize;
      }
      if (!node.hidden) {
        return !offset ? this.y(node.y) - Config.glyphSize : -Config.glyphSize;
      }
      if (node.hidden && !node.hasChildren) {
        return !offset ? this.y(node.y) - Config.hiddenGlyphSize : -Config.hiddenGlyphSize;
      }
    } else {
      return !offset? this.y(node.y) : 0;
    }

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

  private static parentEdge(d:Node, lineFunction) {
    const linedata = [{
      x: d.ma.x,
      y: d.ma.y
    }, {
      x: d.pa.x,
      y: d.pa.y
    }];
    return lineFunction(linedata);
  }

  private attachListeners() {

    events.on(TABLE_VIS_ROWS_CHANGED_EVENT, (evt, item) => {
      this.update();
    });

    events.on(PRIMARY_SELECTED, (evt, attribute) => {

      this.primaryAttribute = attribute;

      this.update_graph();
      // this.update_visible_nodes();

      this.update_legend();
    });

    events.on(POI_SELECTED, (evt, affectedState) => {
      this.data.defineAffected(affectedState);
      this.data.aggregateTreeWrapper(undefined,undefined);
      this.update_time_axis();
      this.update_graph();
    });

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
