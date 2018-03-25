import * as events from 'phovea_core/src/event';

import {
  DB_CHANGED_EVENT, LAYOUT_CHANGED_EVENT
} from './headers';

import {
  SUBGRAPH_CHANGED_EVENT, FILTER_CHANGED_EVENT
} from './setSelector';

import { TABLE_VIS_ROWS_CHANGED_EVENT, COL_ORDER_CHANGED_EVENT, GRAPH_ADJ_MATRIX_CHANGED, ADJ_MATRIX_CHANGED, AGGREGATE_CHILDREN, ATTR_COL_ADDED, PATHWAY_SELECTED, TREE_PRESERVING_SORTING } from './tableManager';

import { VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT, VALUE_TYPE_REAL, VALUE_TYPE_STRING } from 'phovea_core/src/datatype';

import { VALUE_TYPE_ADJMATRIX, VALUE_TYPE_LEVEL } from './attributeTable';

import {
  select,
  selectAll,
  selection,
  mouse,
  event
} from 'd3-selection';
import {
  json,
  request
} from 'd3-request';
import {
  transition
} from 'd3-transition';
import {
  easeLinear
} from 'd3-ease';
import {
  scaleLinear,
  scaleLog, scalePow,
  scaleOrdinal, schemeCategory20c, schemeCategory20
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
  axisBottom,
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
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCollide,
  forceCenter,
  forceY,
  forceX
} from 'd3-force';

import {
  queue
} from 'd3-queue';

import {
  Config
} from './config';

import * as menu from './menu';
import * as tooltip from './toolTip';

import * as arrayVec from './ArrayVector';

export const ROOT_CHANGED_EVENT = 'root_changed';
export const REPLACE_EDGE_EVENT = 'replace_edge_event';
export const EXPAND_CHILDREN = 'expand_children';
export const GATHER_CHILDREN_EVENT = 'gather_children_event';


enum sortedState {
  Ascending,
  Descending,
  Unsorted
}

enum mode {
  level,
  tree
}

enum layout {
  aggregated,
  expanded
}

enum nodeType {
  aggregateLabel,
  levelSummary,
  single
}

/** Class implementing the map view. */
class Graph {

  private tableManager;

  private width;
  private height;
  private radius;
  private color;

  private forceDirectedHeight = 1000;
  private forceDirectedWidth = 1000;

  private graph;

  private selectedDB;
  private layout = 'tree';

  private exclude = [];

  private svg;
  private simulation;

  private nodeNeighbors;

  //array of nodes that need an add icon to fetch children from server;
  private addIcons;

  private pathway = { start: undefined, end: undefined };

  private treeEdges = [];

  private labels;

  private ypos = 0;

  private padding = { left: 0, right: 300 };

  private t2 = transition('t').duration(600).ease(easeLinear);

  private xScale;
  private yScale;

  private margin = Config.margin;

  private menuObject = menu.create();

  private ttip = tooltip.create();

  //flag to determine whether code should auto-populate the adj matrix
  private autoAdjMatrix = { 'value': true, 'count': 7 };

  private interGenerationScale = scaleLinear();

  private lineFunction = line<any>()
    .x((d: any) => {
      return this.xScale(d.x);
    }).y((d: any) => {
      return this.yScale(d.y);
    })
    .curve(curveBasis);


  /**
   * Creates a Map Object
   */
  constructor(width, height, radius, selector, tmanager) {

    select('#graph')
      .on('click', () => { select('.menu').remove(); });

    events.on(GRAPH_ADJ_MATRIX_CHANGED, (evt, info) => {
      console.log(info);
      events.fire(ADJ_MATRIX_CHANGED, { 'db': info.db, 'name': info.name, 'uuid': info.id, 'remove': info.removeAdjMatrix, 'nodes': this.graph.nodes.filter((n) => n.visible && n.nodeType === nodeType.single).map((n) => n.uuid) });
    });

    events.on(EXPAND_CHILDREN, (evt, info) => {

      const url = 'api/data_api/getNodes/' + this.selectedDB;
      console.log('url is ', url);

      console.log(info.children);

      const postContent = JSON.stringify({ 'rootNode': '', 'rootNodes': info.children.map((n) => { return n.uuid; }), 'treeNodes': this.graph.nodes.map((n) => { return n.uuid; }) });


      json(url)
        .header('Content-Type', 'application/json')
        .post(postContent, (error, graph: any) => {
          if (error) {
            throw error;
          }
          console.log('data is ', graph);

          this.mergeGraph(graph, false, true);
          //find root nodes
          const rootNode = this.graph.nodes.find((n) => n.uuid === graph.root);
          this.postMergeUpdate();

        });

    });

    events.on(GATHER_CHILDREN_EVENT, (evt, info) => {

      //iterate through all links in this graph;
      this.graph.links.map((l) => {
        if ((l.source.uuid === info.uuid || l.target.uuid === info.uuid) && !l.visible) {
          const source = l.source.uuid === info.uuid ? l.source : l.target;
          const target = l.source.uuid === info.uuid ? l.target : l.source;
          if (!this.isAncestor(source, target)) {
            //only replace edges in the same or greater level
            this.replaceEdge({ source: source.uuid, target: target.uuid, uuid: l.edge.data.uuid });

            // console.log(source.children);
            //if source doesn't have an aggMode, default it to tree;
            if (source.aggMode === undefined) {
              source.aggMode = mode.tree;
            };

            //recursively set target node and it's children to match parent's mode/layout;
            this.setModeLayout(source, target, source.level);
          }

        }
      });

      this.graph.nodes.map((n) => n.visited = false);


      this.extractTree();
      this.exportYValues();
      this.drawTree();

    });

    events.on(REPLACE_EDGE_EVENT, (evt, info) => {

      this.replaceEdge(info);

      this.layoutTree();
      this.updateEdgeInfo();
      this.exportYValues();
      this.drawTree();


    });

    events.on(ATTR_COL_ADDED, (evt, info) => {
      if (info.remove) {
        this.tableManager.colOrder.splice(this.tableManager.colOrder.indexOf(info.name), 1);

        const adjMatrixCol = this.tableManager.adjMatrixCols.find((a: any) => { return a.desc.name === info.name; });
        this.tableManager.adjMatrixCols.splice(this.tableManager.adjMatrixCols.indexOf(adjMatrixCol), 1);


        events.fire(COL_ORDER_CHANGED_EVENT);
      } else {

        const url = 'api/data_api/property/' + info.db + '/' + info.name;
        console.log('url is ', url);

        const postContent = JSON.stringify({ 'treeNodes': this.graph ? this.graph.nodes.map((n) => { return n.uuid; }) : [''] });


        json(url)
          .header('Content-Type', 'application/json')
          .post(postContent, (error, resultObj: any) => {
            if (error) {
              throw error;
            }

            const nodes = resultObj.results;
            const dataValues = nodes.map((e) => { return isNaN(+e.value) ? e.value : +e.value; });;
            //infer type here:
            const type = typeof dataValues[0] === 'number' ? VALUE_TYPE_INT : VALUE_TYPE_STRING;
            //Add fake vector here:
            const arrayVector = arrayVec.create(type);
            arrayVector.desc.name = info.name;


            arrayVector.dataValues = dataValues;
            arrayVector.idValues = nodes.map((e) => { return e.uuid; });

            arrayVector.desc.value.range = [min(arrayVector.dataValues), max(arrayVector.dataValues)];
            // console.log('range for ', arrayVector.desc.name, ' is ', arrayVector.desc.value.range);
            // arrayVector.desc.value.label = nodes[0].label;

            // console.log(arrayVector);

            //if it's not already in there:
            if (this.tableManager.adjMatrixCols.filter((a: any) => { return a.desc.name === arrayVector.desc.name; }).length < 1) {
              this.tableManager.adjMatrixCols = this.tableManager.adjMatrixCols.concat(arrayVector); //store array of vectors
            }

            //if it's not already in there:
            if (this.tableManager.colOrder.filter((a: any) => { return a === arrayVector.desc.name; }).length < 1) {
              this.tableManager.colOrder = this.tableManager.colOrder.concat([arrayVector.desc.name]); // store array of names
            }

            //sort colOrder so that the order is graphEdges, adjMatrix, then attributes. adjMatrix col are sorted by desc degree;
            this.tableManager.colOrder.sort((a, b) => {

              const arrayVecA = this.tableManager.adjMatrixCols.find((c) => c.desc.name === a);
              const arrayVecB = this.tableManager.adjMatrixCols.find((c) => c.desc.name === b);

              if (arrayVecA.desc.value.type === 'dataDensity') {
                return -1;
              }

              if (arrayVecB.desc.value.type === 'dataDensity') {
                return 1;
              }

              if (arrayVecA.desc.value.type === VALUE_TYPE_ADJMATRIX) {
                if (arrayVecB.desc.value.type === VALUE_TYPE_ADJMATRIX) {
                  return arrayVecA.dataValues.length > arrayVecB.dataValues.length ? -1 : (arrayVecB.dataValues.length > arrayVecA.dataValues.length ? 1 : 0);
                }
                return -1;
              }

              if (arrayVecB.desc.value.type === VALUE_TYPE_ADJMATRIX) {
                return 1;
              }

              return 0;
            });

            events.fire(TABLE_VIS_ROWS_CHANGED_EVENT);

          });

      }

    });

    events.on(PATHWAY_SELECTED, (evt, info) => {

      console.log('here', info);

      if (info.clear || info.start) {
        // this.graph.nodes.map((n) => { n.pathway = false; n.moved = false; });
        // selectAll('.edge.visible').classed('pathway', false);
        //clear pathway info
        this.pathway.start = undefined;
        this.pathway.end = undefined;;
      }

      if (info.clear) {
        return;
      }


      const sNode = this.graph.nodes.filter((n) => n.uuid === info.uuid)[0];
      // const node = sNode;

      if (info.start) {
        this.pathway.start = sNode;
      } else if (info.end) {
        this.pathway.end = sNode;
      }

      if (info.clear === undefined) {
        this.pathwayBFS();
      }

      this.layoutTree();
      this.updateEdgeInfo();
      this.exportYValues();
      this.drawTree();

      select('#pathViewer')
        .style('visibility', 'visible');

    });

    events.on(TREE_PRESERVING_SORTING, (evt, info) => {
      this.layoutTree(info);
      this.updateEdgeInfo();
      this.exportYValues();
      this.drawTree();
    });


    events.on(DB_CHANGED_EVENT, (evt, info) => {

      //clear data
      this.graph = undefined;

      //clear display
      this.svg.select('.visibleLinks').html('');
      this.svg.select('.hiddenLinks').html('');
      this.svg.select('.nodes').html('');
      this.svg.select('.endMarkers').html('');
    });

    events.on(AGGREGATE_CHILDREN, (evt, info) => {
      const root = this.graph.nodes.filter((n) => { return n.uuid === info.uuid; })[0];
      this.setAggregation(root, info.aggregate, true);

      // this.graph.nodes.map((n) => n.visited = false);
      this.layoutTree();
      this.updateEdgeInfo();
      this.exportYValues();
      this.drawTree();
    });

    events.on(FILTER_CHANGED_EVENT, (evt, info) => {

      //see if value is already in exclude;
      if (info.exclude === true) {
        this.exclude = this.exclude.concat(info.label);
      } else if (info.exclude === false) {
        const ind = this.exclude.indexOf(info.label);
        this.exclude.splice(ind, 1);
      }


      if (this.graph) {
        this.extractTree();
        this.exportYValues();

        if (this.layout === 'tree') {
          this.drawTree();
        } else {
          this.drawGraph();
        }
      };
    });

    events.on(LAYOUT_CHANGED_EVENT, (evt, info) => {
      this.layout = info.value;

      this.svg.select('.visibleLinks').html('');
      this.svg.select('.hiddenLinks').html('');
      this.svg.select('.nodes').html('');

      if (this.selectedDB) {
        if (this.layout === 'tree') {
          select('#allBars').style('visibility', 'visible');
          // select('#col3').style('visibility', 'visible');

          select('#col2').select('svg')
            .attr('width', this.width);


          this.drawTree();
        } else {
          select('#allBars').style('visibility', 'hidden');
          // select('#col3').style('visibility', 'hidden');

          select('#col2').select('svg')
            .attr('width', this.forceDirectedWidth)
            .attr('height', this.forceDirectedHeight);

          this.drawGraph();
        }
      };
    });

    events.on(ROOT_CHANGED_EVENT, (evt, info) => {


      //layout is already expanded.
      this.graph.root = [info.root.uuid];
      //change root to tree mode
      const root = info.root;
      const rootAggMode = root.aggMode;

      //remove visited status for all edges;
      this.graph.links.map((l) => l.visited = false);

      //un-aggregate
      this.clearLevelModeNodes(undefined, true);
      this.graph.nodes.map((n) => {
        n.summary = undefined;
        n.pinned = false;
        n.aggregateRoot = undefined;
        n.aggMode = undefined;
        n.mode = mode.tree;
        n.layout = layout.expanded;
      });


      root.summary = {};
      root.aggMode = mode.tree;
      root.mode = mode.tree;
      root.level = 0;

      // //if root was an aggregateRoot, reset it.
      // if (rootAggMode !== undefined) {
      //   root.summary = {};
      //   root.aggMode = rootAggMode;
      // };

      this.extractTree(undefined, undefined, undefined, true); //force re-aggregation'

      this.exportYValues();
      this.drawTree();
    });

    events.on(SUBGRAPH_CHANGED_EVENT, async (evt, info) => {
      await this.loadGraph(info.db, info.rootID, info.replace, info.remove, info.includeRoot, info.includeChildren);;

      if (this.autoAdjMatrix.value) {

        // console.profile('profileTest');
        const fileQueue = queue();
        // Add highly connected nodes to the adj Matrix:
        const allNodes = this.graph.nodes.filter((n) => n.visible).slice(0).sort((a, b) => { return a.degree > b.degree ? -1 : 1; });

        const connectedNodes = allNodes.slice(0, this.autoAdjMatrix.count);
        const allVecs = [];
        // const queue = [];
        connectedNodes.map((cNode, i) => {
          const arrayVector = arrayVec.create(undefined);
          arrayVector.desc.name = cNode.title;
          const id = encodeURIComponent(cNode.uuid);
          allVecs.push({ vec: arrayVector, id, type: 'adjMatrixCol',label:cNode.label});

          const url = 'api/data_api/edges/' + this.selectedDB + '/' + id;

          const postContent = JSON.stringify({ 'treeNodes': this.graph ? this.graph.nodes.map((n) => { return n.uuid; }) : [''] });

          function jsonCall(url, callback) {
            setTimeout(function () {
              json(url)
                .header('Content-Type', 'application/json')
                .post(postContent, (error, graph: any) => {
                  callback(null, graph);
                });
            }, 0);
          }

          fileQueue.defer(jsonCall, url);
        });

        let tableAttributes;
        if (!this.tableManager.adjMatrixCols.find((c) => c.desc.value.type !== VALUE_TYPE_ADJMATRIX && c.desc.value.type !== 'dataDensity')) {
          //start with default attributes
          tableAttributes = Config.defaultAttrs[this.selectedDB];
        } else { //use existing attributes
          tableAttributes = this.tableManager.adjMatrixCols
            .filter((c) => c.desc.value.type !== VALUE_TYPE_ADJMATRIX && c.desc.value.type !== 'dataDensity')
            .map((c) => c.desc.name);
        };

        tableAttributes.map((attr, i) => {

          allVecs.push({ vec: {}, type: 'attributeCol', name: attr});

          const url = 'api/data_api/property/' + this.selectedDB + '/' + attr;

          const postContent = JSON.stringify({ 'treeNodes': this.graph ? this.graph.nodes.map((n) => { return n.uuid; }) : [''] });

          function jsonCall(url, callback) {
            setTimeout(function () {
              json(url)
                .header('Content-Type', 'application/json')
                .post(postContent, (error, graph: any) => {
                  callback(null, graph);
                });
            }, 0);
          }

          fileQueue.defer(jsonCall, url);
        });

        fileQueue.awaitAll((error, attributes) => {
          if (error) {
            throw error;
          }

          this.tableManager.adjMatrixCols = this.tableManager.adjMatrixCols.filter((c) => c.desc.value.type === 'dataDensity');
          this.tableManager.colOrder = this.tableManager.colOrder.filter((c) => this.tableManager.adjMatrixCols.find((cc) => cc.desc.name === c));

          attributes.forEach((data) => {
            const nextVec = allVecs.splice(0, 1)[0];
            let arrayVector = nextVec.vec;
            const colType = nextVec.type;

            if (colType === 'adjMatrixCol') {
              arrayVector.dataValues = data.nodes.map((e) => { return e; });
              arrayVector.idValues = data.nodes.map((e) => { return e.uuid; });
              arrayVector.desc.value.label = [nextVec.label];
            } else {
              const nodes = data.results;

              const dataValues = nodes.map((e) => { return isNaN(+e.value) ? e.value : +e.value; });;
              //infer type here:
              const type = typeof dataValues[0] === 'number' ? VALUE_TYPE_INT : VALUE_TYPE_STRING;

              // //Add fake vector here:
              arrayVector = arrayVec.create(type);
              arrayVector.desc.name = nextVec.name;


              arrayVector.dataValues = dataValues;
              arrayVector.idValues = nodes.map((e) => { return e.uuid; });

              arrayVector.desc.value.range = [min(arrayVector.dataValues), max(arrayVector.dataValues)];

              //create array of unique labels for this columns
              const allLabels=[];
              nodes.map((n)=> {
                n.label.map((label)=> {
                  if(!allLabels.find((l)=> l === label)) {
                    allLabels.push(label);
                }
                });
              });
              arrayVector.desc.value.label = allLabels;
            }

            //if it's not already in there:
            if (this.tableManager.adjMatrixCols.filter((a: any) => { return a.desc.name === arrayVector.desc.name; }).length < 1) {
              this.tableManager.adjMatrixCols = this.tableManager.adjMatrixCols.concat(arrayVector); //store array of vectors
            } else { //replace with new data;
              const adjMatrixCol = this.tableManager.adjMatrixCols.find((a: any) => { return a.desc.name === info.name; });
              this.tableManager.adjMatrixCols.splice(this.tableManager.adjMatrixCols.indexOf(adjMatrixCol), 1);
              this.tableManager.adjMatrixCols = this.tableManager.adjMatrixCols.concat(arrayVector); //store array of vectors
            }

            //if it's not already in there:
            if (this.tableManager.colOrder.filter((a: any) => { return a === arrayVector.desc.name; }).length < 1) {
              this.tableManager.colOrder = this.tableManager.colOrder.concat([arrayVector.desc.name]); // store array of names
            }

          });


          //sort colOrder so that the order is graphEdges, adjMatrix, then attributes. adjMatrix col are sorted by desc degree;
          this.tableManager.colOrder.sort((a, b) => {

            const arrayVecA = this.tableManager.adjMatrixCols.find((c) => c.desc.name === a);
            const arrayVecB = this.tableManager.adjMatrixCols.find((c) => c.desc.name === b);

            if (arrayVecA.desc.value.type === 'dataDensity') {
              return -1;
            }

            if (arrayVecB.desc.value.type === 'dataDensity') {
              return 1;
            }

            if (arrayVecA.desc.value.type === VALUE_TYPE_ADJMATRIX) {
              if (arrayVecB.desc.value.type === VALUE_TYPE_ADJMATRIX) {
                return arrayVecA.dataValues.length > arrayVecB.dataValues.length ? -1 : (arrayVecB.dataValues.length > arrayVecA.dataValues.length ? 1 : 0);
              }

              return -1;
            }

            if (arrayVecB.desc.value.type === VALUE_TYPE_ADJMATRIX) {
              return 1;
            }

            return 0;
          });

          //clear out any attributes that aren't in the top 5
          // Add highly connected nodes to the adj Matrix:
          const allNodes = this.graph.nodes.slice(0).sort((a, b) => { return a.degree > b.degree ? -1 : 1; });
          const connectedNodes = allNodes.slice(0, 5);


          // console.profileEnd();
          events.fire(TABLE_VIS_ROWS_CHANGED_EVENT);


        });

      }

    });



    this.tableManager = tmanager;
    this.width = width;
    this.height = 600; // change to window height so force directed graph has room to breath;
    this.radius = radius;

    // select(selector).append('div')
    //   .attr('id', 'graphHeaders');

    //create pathViewer div
    // const pathViewer = select(selector)
    //   .append('div')
    //   .append('g')
    //   .attr('id', 'pathViewer')
    //   .style('visibility', 'visible')
    //   .attr('class', 'list-group')
    //   .append('a')
    //   .attr('href', '#')
    //   .attr('class', 'list-group-item active')
    //   .text('Shortest Path List');


    //     .append('div')
    // .style('height', '185px')
    // .style('margin-left', '10px')
    // .style('margin-top', '10px')
    // .style('overflow-y', 'scroll')
    // .append('div')
    // .attr('class', 'list-group')
    // .attr('id', 'pathViewer')
    // .append('a')
    // .attr('href', '#')
    // .attr('class', 'list-group-item active')
    // .text('Shortest Path List');

    select(selector).append('div')
      .attr('id', 'graphHeaders');



    const graphDiv = select(selector).append('div')
      .attr('id', 'graphDiv');

    // graphDiv
    // .append('div')
    // .style('height', '185px')
    // .style('margin-left', '10px')
    // .style('margin-top', '10px')
    // .style('overflow-y', 'scroll')
    // .append('div')
    // .attr('class', 'list-group')
    // .attr('id', 'pathViewer')
    // .append('a')
    // .attr('href', '#')
    // .attr('class', 'list-group-item active')
    // .text('Shortest Path List');

    this.svg = select('#graphDiv')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('id', 'graph')
      // .style('margin-top', 195)
      .append('g')
      .attr('id', 'genealogyTree')
      .attr('transform', 'translate(' + this.margin.left + ',' + (Config.glyphSize + this.margin.top) + ')');

    this.color = scaleOrdinal(schemeCategory20);

    //Create Defs
    const svgDefs = this.svg.append('defs');

    //Gradient used to fade out the stubs of hidden edges
    const radGrad = svgDefs.append('radialGradient')
      .attr('id', 'radialGrad')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%');

    radGrad.append('stop')
      .attr('stop-opacity', '0')
      .attr('stop-color', 'white')
      .attr('offset', '25%');

    radGrad.append('stop')
      .attr('stop-opacity', '1')
      .attr('stop-color', 'white')
      .attr('offset', '26%');

    radGrad.append('stop')
      .attr('stop-color', 'white')
      .attr('stop-opacity', '1')
      .attr('offset', '80%');

    radGrad.append('stop')
      .attr('stop-color', 'white')
      .attr('stop-opacity', '0')
      .attr('offset', '81%');

    //Used @ the start and end of edges
    const marker = svgDefs.append('marker')
      .attr('id', 'circleMarker')
      .attr('markerWidth', this.radius * 2)
      .attr('markerHeight', this.radius * 2)
      .attr('refX', 2)
      .attr('refY', 2);

    marker.append('circle')
      .attr('cx', 2)
      .attr('cy', 2)
      .attr('r', 2);

    //Used @ the start and end of hidden edges
    const marker2 = svgDefs.append('marker')
      .attr('id', 'edgeCircleMarker')
      .attr('markerWidth', this.radius)
      .attr('markerHeight', this.radius)
      .attr('refX', 2)
      .attr('refY', 2);

    marker2.append('circle')
      .attr('cx', 2)
      .attr('cy', 2)
      .attr('r', 1.5);

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

    const linkGroup = this.svg.append('g')
      .attr('class', 'links');

    linkGroup.append('g')
      .attr('class', 'visibleLinks');


    linkGroup.append('g')
      .attr('class', 'hiddenLinks')
      .attr('id', 'hiddenLinks');
    // .attr('transform', 'translate(520,0)');

    this.svg.append('g')
      .attr('class', 'nodes')
      .attr('id', 'nodeGroup');

    this.svg.append('g')
      .attr('class', 'endMarkers');



    this.simulation = forceSimulation()
      .force('link', forceLink().id(function (d: any) { return d.index; }))
      .force('collide', forceCollide(function (d: any) { return 30; }).iterations(16))
      .force('charge', forceManyBody())
      .force('center', forceCenter(this.forceDirectedWidth / 2, this.forceDirectedHeight / 2))
      .force('y', forceY(0))
      .force('x', forceX(0));

    // this.simulation = forceSimulation()
    //   .force('link', forceLink().strength(5))
    //   .force('charge', forceManyBody().strength(-300))
    //   .force('center', forceCenter(forceWidth / 2, this.forceDirectedHeight / 2))
    //   .force('collision', forceCollide().radius(20));

  }


  private setModeLayout(source, target, level) {

    //clear any aggModes in target nodes
    target.aggMode = undefined;

    target.mode = source.aggMode;

    if (source.aggMode === mode.level) {
      const aggNode = this.graph.nodes.find((n) => {
        return n.label === target.label && n.nodeType === nodeType.aggregateLabel && n.aggregateRoot.uuid === source.uuid && n.level === level + 1;
      });
      target.layout = aggNode && aggNode.children.length > 0 ? layout.expanded : layout.aggregated;
    } else {
      target.layout = layout.expanded;
    }

    target.children.map((c) => {
      const link = this.graph.links.find((l) => {
        return (l.source.uuid === target.uuid && l.target.uuid === c.uuid) || (l.source.uuid === c.uuid && l.target.uuid === target.uuid);
      });
      if (link) {
        this.replaceEdge({ source: target.uuid, target: c.uuid, uuid: link.edge.data.uuid });
      }
      this.setModeLayout(source, c, level + 1);
    });
  }


  private isAncestor(source, target) {
    if (target.level >= source.level || source.parent === undefined) {
      return false;
    }

    if (source.parent === target) {
      return true;
    }

    return this.isAncestor(source.parent, target);
  }
  private replaceEdge(edge) {
    //replace parent of selected target as source
    const source = this.graph.nodes.find((node) => { return node.uuid === edge.source; });
    const target = this.graph.nodes.find((node) => { return node.uuid === edge.target; });

    // const childNode = [source, target].reduce((acc, cValue) => { return cValue.yy > acc.yy ? cValue : acc; });
    // const parentNode = [source, target].reduce((acc, cValue) => { return cValue.yy < acc.yy ? cValue : acc; });

    const oldParent = target.parent; //target.parent ? target.parent : source.parent;
    const child = target; //target.parent ? target : source;

    // console.log(oldParent, child);

    //replacing edge with itself;
    if (oldParent === source) {
      const currentEdge = this.graph.links.find((ll) => { return ll.edge.data.uuid === edge.uuid; });

      currentEdge.visible = true;
      currentEdge.visited = true;

      return;
    }

    //target is not the root of a tree;
    if (oldParent) {


      //remove target from list of old parent's children
      const oldChild = oldParent.children.indexOf(child);
      oldParent.children.splice(oldChild, 1);

      // console.log('removing ', child.title , ' from ', oldParent.title);


      //make old edge hidden
      const oldEdge = this.graph.links.find((ll) => {
        return (ll.source.uuid === oldParent.uuid && ll.target.uuid === child.uuid && ll.edge.data.uuid !== edge.uuid)
          || (ll.target.uuid === oldParent.uuid && ll.source.uuid === child.uuid && ll.edge.data.uuid !== edge.uuid);
      });

      // console.log(oldEdge);

      oldEdge.visible = false;
      oldEdge.visited = true;
      oldEdge.extracted = false;

    }

    // console.log('removing ', oldEdge.source.title , ' -> ', oldEdge.target.title , ' edge');

    // if (!target.parent) {
    //   source.parent = undefined;
    //   this.graph.root = [source];
    // }

    //Set new Parent and child;
    target.parent = source;
    target.pinned = true; //used to make sure this node always has this parent;
    source.children.push(target);


    //make new edge visible


    const newEdge = this.graph.links.find((ll) => { return ll.edge.data.uuid === edge.uuid; });
    // console.log('newEdge', newEdge);

    newEdge.visible = true;
    newEdge.visited = true;
    newEdge.extracted = true;

    // console.log('adding ', newEdge.source.title , ' -> ', newEdge.target.title , ' edge' , newEdge.visible);
  }

  private clearPathway(node) {

    this.graph.nodes.map((n) => {
      n.pathway = false;
      n.paths = [];
      n.visited = false;
    });

    selectAll('.pathway')
      .classed('pathway', false);

  }

  private pathwayBFS() {

    const start = this.pathway.start;
    const end = this.pathway.end ? this.pathway.end : this.graph.nodes.find((f) => this.graph.root.find((ff) => ff === f.uuid));

    let stopLevel = 100;

    const pathwayBFSHelper = (node, targetUUID, queue, level, parent) => {

      // console.log('visiting ', node.title, node.path)
      if (node.uuid === end.uuid) {
        // console.log('found a path at level ', level)
        stopLevel = level; //update the max length of shortest paths to consider;
      }

      if (parent) {
        parent.path.map((p) => node.path.push(p.concat([node])));
      }

      node.visited = true;

      const children = [];

      this.graph.links.map((l) => {
        if (l.target.uuid === node.uuid || l.source.uuid === node.uuid) {
          const target = l.source.uuid === node.uuid ? l.target : l.source;
          const source = l.source.uuid === node.uuid ? l.source : l.target;
          children.push(target);
        }
      });

      //don't revisit the node that you just came from
      children.filter((cc) => !parent || cc.uuid !== parent.uuid).map((c) => {
        if (level <= stopLevel) {
          queue.push({ node: c, level: level + 1, parent: node });
        }
      });
    };

    this.graph.nodes.map((n) => {
      n.pathway = false;
      n.path = [];
      n.visited = false;
    });

    start.path = [[start]];
    const queue = [{ node: start, level: 0, parent: undefined }];

    // //BFS of the tree
    while (queue.length > 0) {
      const item = queue.splice(0, 1)[0];;
      if (item.level <= stopLevel) { //avoid iterating through the entire tree
        pathwayBFSHelper(item.node, end.uuid, queue, item.level, item.parent);
      }
    }


    //filter out paths longer than the shortest path and duplicates
    const pathIDs = [];
    const uniquePaths = [];
    end.path.map((p) => {
      if (!pathIDs.find((up) => up === p.reduce((acc, cValue) => acc + cValue.uuid, ''))) {
        pathIDs.push(p.reduce((acc, cValue) => acc + cValue.uuid, ''));
        uniquePaths.push(p);
      };
    });

    end.path = uniquePaths.filter((p) => p.length === stopLevel + 1);

    select('#pathViewerAccordion').select('a')
      .html('[' + end.path.length + '] ' + ' <tspan class="pathIcon"> ' + Config.icons[start.label] + '</tspan> ' + start.title + ' to ' + '<tspan class="pathIcon"> ' + Config.icons[end.label] + '</tspan> ' + end.title);


    const tableSelector = select('#pathViewerAccordion').select('#tableBody');

    // create a row for each object in the data
    let rows = tableSelector.select('tbody').selectAll('tr')
      .data(end.path);


    const rowsEnter = rows
      .enter()
      .append('tr');

    rows.exit().remove();
    rows = rowsEnter.merge(rows);

    // create a cell in each row for each column
    let listItems = rows.selectAll('td')
      .data((d: any) => [d]);

    const listItemsEnter = listItems
      .enter()
      .append('td');

    listItems.exit().remove();
    listItems = listItemsEnter.merge(listItems);

    listItems.html((d: any) => {
      let sArray = d.slice(1, d.length - 1);

      sArray = sArray.length < 1 ? '' : (sArray.length < 2 ? ' &#8212 <tspan class="pathIcon">' + Config.icons[sArray[0].label] + '</tspan> ' + sArray[0].title : sArray.reduce((acc, cValue) => { return acc + ' &#8212 <tspan class="pathIcon">' + Config.icons[cValue.label] + '</tspan> ' + cValue.title; }, ''));

      return '<tspan class="pathIcon"> ' + Config.icons[d[0].label] + '</tspan> ' + sArray + ' &#8212 <tspan class="pathIcon"> ' + Config.icons[d[d.length - 1].label] + '</tspan>  <tspan class="linearize">' + Config.icons.Linearize + ' </tspan>';
    });

    listItems.on('click', (d: any) => {
      event.stopPropagation();

      listItems.classed('selectedPathItem', false);
      listItems.filter((l: any) =>
        l.reduce((acc, cValue) => acc + cValue.uuid, '') === d.reduce((acc, cValue) => acc + cValue.uuid, '')).classed('selectedPathItem', true);

      this.highlightPathway(d);
    });

    listItems.on('mouseout', (d: any) => {
      selectAll('.edge').classed('pathway', false).classed('fadeEdge', false);
      select('#nodeGroup').selectAll('.title').classed('fadeNode', false);
      select('#nodeGroup').selectAll('.addIcon')
        .classed('fadeNode', false);
      selectAll('.edge.hiddenEdge')
        .attr('visibility', 'hidden');
    });

    listItems.on('mouseover', (d: any) => {

      selectAll('.edge.hiddenEdge')
        .attr('visibility', 'hidden');

      selectAll('.edge')
        .classed('fadeEdge', true);

      select('#nodeGroup').selectAll('.title')
        .classed('fadeNode', true);

      select('#nodeGroup').selectAll('.addIcon')
        .classed('fadeNode', true);
      // filter()

      d.map((p, i) => {
        //work in pairs
        if (i === d.length - 1) {
          return;
        }


        const startNode = p;
        const endNode = d[i + 1];

        select('#nodeGroup').selectAll('.title')
          .filter((d: any) => d.uuid === startNode.uuid || d.uuid === endNode.uuid)
          .classed('fadeNode', false);

        selectAll('.edge').filter((e: any) => {
          return (e.source.uuid === startNode.uuid && e.target.uuid === endNode.uuid)
            || (e.source.uuid === endNode.uuid && e.target.uuid === startNode.uuid);
        })
          .classed('fadeEdge', false)
          .classed('pathway', true)
          .attr('visibility', 'visible');
      });
    });

    listItems.select('.linearize').on('click', ((d: any) => {

      // // event.stopPropagation();

      // listItems.classed('selectedPathItem', false);
      // listItems.filter((l: any) => l.reduce((acc, cValue) => acc + cValue.uuid, '') === d.reduce((acc, cValue) => acc + cValue.uuid, '')).classed('selectedPathItem', true);

      this.graph.nodes.map((n) => n.pathway = false);

      d.map((p, i) => {
        //work in pairs
        if (i === d.length - 1) {
          return;
        }

        const startNode = p;
        const endNode = d[i + 1];

        startNode.pathway = true;
        endNode.pathway = true;

        const l = this.graph.links.find((l) => (l.source.uuid === startNode.uuid && l.target.uuid === endNode.uuid)
          || (l.source.uuid === endNode.uuid && l.target.uuid === startNode.uuid));

        const source = l.source.uuid === p.uuid ? l.target : l.source;
        const target = l.source.uuid === p.uuid ? l.source : l.target;

        if (l.visible === false) {
          this.replaceEdge({ source: source.uuid, target: target.uuid, uuid: l.edge.data.uuid });
        };

      });

      this.layoutTree();
      this.updateEdgeInfo();
      this.exportYValues();
      this.drawTree();
      this.highlightPathway(d);
    }));

  }

  private highlightPathway(nodeArray) {

    selectAll('.edge').classed('selectedPathway', false);

    nodeArray.map((p, i) => {
      //work in pairs
      if (i === nodeArray.length - 1) {
        return;
      }

      const startNode = p;
      const endNode = nodeArray[i + 1];

      startNode.pathway = true;
      endNode.pathway = true;

      const l = this.graph.links.find((l) => (l.source.uuid === startNode.uuid && l.target.uuid === endNode.uuid)
        || (l.source.uuid === endNode.uuid && l.target.uuid === startNode.uuid));

      const source = l.source.uuid === p.uuid ? l.target : l.source;
      const target = l.source.uuid === p.uuid ? l.source : l.target;

      if (l.visible === false) {
        this.replaceEdge({ source: source.uuid, target: target.uuid, uuid: l.edge.data.uuid });
      };

      selectAll('.edge').filter((e: any) => {
        return (e.source.uuid === startNode.uuid && e.target.uuid === endNode.uuid)
          || (e.source.uuid === endNode.uuid && e.target.uuid === startNode.uuid);
      })
        .classed('selectedPathway', true);

    });


  }



  // private calculatePathway() {
  //   const nodes = this.pathway.start ? (this.pathway.end ? [this.pathway.end] : [this.pathway.start]) : [];
  //   let quit = false;
  //   nodes.map((node) => {
  //     node.pathway = true;
  //     while (node.parent && !quit) {
  //       //if node is already tagged as pathway, you have found a shorter path than going all the way to the root;
  //       if (node.parent.pathway) {
  //         console.log('found', node.parent.title);

  //         selectAll('.edge.visible').filter((e: any) => {
  //           return (e.source.uuid === node.uuid && e.target.uuid === node.parent.uuid)
  //             || (e.source.uuid === node.parent.uuid && e.target.uuid === node.uuid);
  //         })
  //           .classed('pathway', true);

  //         quit = true;
  //         this.clearPathway(node.parent);

  //       } else {
  //         //find edge;

  //         selectAll('.edge.visible').filter((e: any) => {
  //           return (e.source.uuid === node.uuid && e.target.uuid === node.parent.uuid)
  //             || (e.source.uuid === node.parent.uuid && e.target.uuid === node.uuid);
  //         })
  //           .classed('pathway', true);
  //         //set new node, will stop @ the root
  //         node = node.parent;
  //         node.pathway = true;
  //       }
  //     }
  //   });


  // if (this.pathway.end) {
  //   let sNode = this.pathway.end;
  //   let y = 0;
  //   while (sNode.parent && sNode.pathway) {
  //     sNode.moved = true;
  //     sNode.yy = y;
  //     y = y+1;

  //     sNode = sNode.parent;
  //   }
  // }
  // }

  //Function that remove either a single node (root) or the entire sub-tree (including children)
  public removeBranch(rootNode, includeChildren = true) {

    let toRemoveArray, childArray;
    if (!includeChildren) {
      toRemoveArray = [rootNode];
      childArray = rootNode.children;
    } else {
      toRemoveArray = rootNode.children;
    }
    // remove all links to children
    toRemoveArray.forEach((node) => {
      //Only use recursive mode if removing children
      if (includeChildren) {
        this.removeBranch(node);
      } else {
        //remove 'visited status' of hidden edges between children
        childArray.forEach((c) => {
          this.graph.links.map((link) => {
            if (link.source.uuid !== c.uuid || link.target.uuid !== c.uuid) {
              link.visited = false;
            }
          });
        });
      }
      this.graph.links = this.graph.links.filter((link) => {
        return (link.source.uuid !== node.uuid && link.target.uuid !== node.uuid);
      });
    });

    //remove all children of the root from this.graph.nodes
    toRemoveArray.forEach((node) => {
      const index = this.graph.nodes.indexOf(node);
      this.graph.nodes.splice(index, 1);
    });

    if (!rootNode) {
      rootNode.children = [];
    }
  }

  //Recursive Function that hides a sub-tree
  public hideBranch(node, hide = true) {
    node.children.map((child) => {
      //only hide children if they are directly under them.
      if (child.mode === mode.tree || (child.mode === mode.level && child.aggregateRoot === node)) {
        this.hideBranchHelper(child, hide);
      }
      // else {
      //   console.log('not hiding', node,child);
      // }
    });
  }

  public hideBranchHelper(node, hide) {
    // console.log('hiding ', node.title, hide);
    node.visible = !hide;
    node.hidden = hide;
    node.children.map((child) => {
      //only hide children if they are directly under them.
      if (child.mode === mode.tree || (child.mode === mode.level && child.aggregateRoot === node)) {
        this.hideBranchHelper(child, hide);
      }
    }
    );
  }

  /**
   * Function that loads up the graph
   */
  public async loadGraph(db, root = undefined, replace = true, remove = false, includeRoot = true, includeChildren = true) {

    this.selectedDB = db;

    let resolvePromise;
    let rejectPromise;
    const p = new Promise((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });

    if (remove) {
      const rootNode = this.graph.nodes.find((n) => n.uuid === root);

      //make sure the children of the removed node aren't pinned and are set back to default layout/mode;
      rootNode.children.map((c) => { c.mode = mode.tree; c.layout = layout.expanded; c.pinned = false; });

      //recursive function to remove all nodes and edges down this branch;
      this.removeBranch(rootNode, includeChildren);

      //also remove root
      if (includeChildren) {
        this.removeBranch(rootNode, !includeChildren);
      };

      const roots = this.graph.nodes.filter((n) => { return this.graph.root.indexOf(n.uuid) > -1; });

      this.updateFilterPanel();

      this.extractTree();

      this.exportYValues();

      if (this.layout === 'tree') {
        this.drawTree();
      } else {
        this.drawGraph();
      };

      resolvePromise();
    } else {

      const rootURI = encodeURIComponent(root);
      let url;

      if (includeRoot && !includeChildren) {
        url = 'api/data_api/getNode/' + db + '/' + rootURI;

      } else {
        url = root ? 'api/data_api/graph/' + db + '/' + rootURI + '/' + includeRoot.toString() : 'api/data_api/graph/' + db;
      }

      console.log('url is ', url);

      const postContent = JSON.stringify({ 'treeNodes': this.graph ? this.graph.nodes.map((n) => { return n.uuid; }) : [''] });

      json(url)
        .header('Content-Type', 'application/json')
        .post(postContent, (error, graph: any) => {
          if (error) {
            throw error;
          }
          console.log('data return is ', graph);

          //Replace graph or create first graph
          if (replace || !this.graph) {

            const newLinks = [];
            //update indexes to contain refs of the actual nodes;
            graph.links.forEach((link) => {

              link.source = graph.nodes.find((n) => n.uuid === link.source.uuid);
              link.target = graph.nodes.find((n) => n.uuid === link.target.uuid);

              if (link.source && link.target) {
                const existingLink = newLinks.filter((l) => {
                  return l.edge.data.uuid === link.edge.data.uuid;
                });
                //check for existing node
                if (existingLink.length < 1) {
                  newLinks.push(link);
                }
                ;
              }
            });
            graph.links = newLinks;


            this.graph = graph;

          } else {
            this.mergeGraph(graph, includeRoot, includeChildren);

            //find root node
            const rootNode = this.graph.nodes.find((n) => n.uuid === graph.root[0]);
          }

          this.postMergeUpdate();



          resolvePromise();
        });
    }

    return p;
  };


  postMergeUpdate() {

    //Update the filter panel numbers
    this.updateFilterPanel();

    this.extractTree();
    this.exportYValues();
    events.fire(TABLE_VIS_ROWS_CHANGED_EVENT);

    if (this.layout === 'tree') {
      this.drawTree();
    } else {
      this.drawGraph();
    };

  };


  mergeGraph(graph, includeRoot, includeChildren) {


    const rootNode = graph.nodes.filter((n) => graph.root.find((r) => r === n.uuid));
    const existingNodes = []; //nodes in the current subgraph that already exist in the tree

    graph.nodes.forEach((node) => {
      const eNode = this.graph.nodes.filter((n) => { return n.uuid === node.uuid; });
      if (eNode.length < 1) {
        this.graph.nodes = this.graph.nodes.concat(node);
      } else {
        existingNodes.push(eNode[0]);
      }
    });

    //Keep track of which children node are already in the tree, but don't include new ones in the tree
    if (includeRoot && !includeChildren) {
      graph.targetNodes.forEach((node) => {
        const eNode = this.graph.nodes.filter((n) => { return n.uuid === node.uuid; });
        if (eNode.length > 1) {
          existingNodes.push(eNode[0]);
        }
      });
    }

    //only add root to array of roots if it does not already exist in the graph;
    // graph.nodes.find((n) => graph.root.find((r)=> r === n.uuid));
    // if (this.graph.nodes.find((n) => { return n.uuid.toString() === graph.root.toString(); }).length < 1) {
    if (!graph.nodes.find((n) => graph.root.find((r) => r === n.uuid))) {
      this.graph.root = this.graph.root.concat(graph.root);
    };


    //update indexes
    graph.links.forEach((link) => {
      const sourceNode = this.graph.nodes.find((n) => { return n.uuid === link.source.uuid; });
      const targetNode = this.graph.nodes.find((n) => { return n.uuid === link.target.uuid; });

      link.source = sourceNode;
      link.target = targetNode;

      if (link.source && link.target) { //both nodes exist in this tree
        //Set link visibility to hidden if the node already exists
        if (existingNodes.indexOf(sourceNode) > -1 && existingNodes.indexOf(targetNode) > -1) {
          link.visible = false;
          link.visited = true;
          // console.log('setting link to hidden ', 's', sourceNode.title, 't', targetNode.title);
        } else { //set the visibility to true if the link is directly with the root

          if (rootNode[0]) {
            if (!(includeRoot && !includeChildren) && (sourceNode.uuid === rootNode[0].uuid || targetNode.uuid === rootNode[0].uuid)) {
              link.visible = true;
              link.visited = true;
            } else
              if (!(includeRoot && !includeChildren) || (includeRoot && !includeChildren && targetNode.parent)) {
                link.visible = false;
                link.visited = true;
              }
          }
        }


        //Do not add links that already exists in the tree
        const findLink = this.graph.links.find((ll) => {
          return (ll.source.uuid === sourceNode.uuid && ll.target.uuid === targetNode.uuid)
            || (ll.target.uuid === sourceNode.uuid && ll.source.uuid === targetNode.uuid); //if we don't care about direction
        });

        if (!findLink) {
          this.graph.links = this.graph.links.concat([link]);
        };

      }

    });

  }


  updateFilterPanel() {

    const labels = {};

    this.graph.nodes.map((n) => {
      if (labels[n.label]) {
        labels[n.label] = labels[n.label] + 1;
      } else {
        labels[n.label] = 1;
      }
    });

    this.labels = labels;

    //Update numbers in Filter Panel
    const filterLabels = select('#nodeFilter')
      .selectAll('.dropdownMenu')
      .html(function (d: any) {
        const count = labels[d.name] ? labels[d.name] : 0;
        return '<tspan class="icon">' + Config.icons[d.name] + '</tspan> ' + d.name + ' [' + count + ']'; //+  Config.icons.menu;
      });
  }

  //Function that extracts tree from Graph
  //takes in tgree parameters:
  // roots, which graph to extract, and whether to replace any existing tree.
  extractTree(roots = undefined, graph = this.graph, replace = false, forceAggregation = false) {
    if (this.graph.nodes[0] && this.graph.nodes[0].children) {

      const rootNode = this.graph.nodes.find((n) => this.graph.root.find((f) => f === n.uuid));
      //remove all levelMode Nodes
      this.clearLevelModeNodes(rootNode, forceAggregation);
    }

    //Filter out all nodes to be excluded
    const excluded = this.exclude;

    graph.nodes.map((n, i) => {
      n.visible = excluded.indexOf(n.label) > -1 || n.hidden === true ? false : true; //used to hide filtered and collapsed/hidden nodes
      n.visited = excluded.indexOf(n.label) > -1 ? true : false; //excluded nodes are not part of the tree structure, hidden ones are
      n.children = [];
      n.parent = n.pinned ? n.parent : undefined; //keep parent of pinned children;
      n.yy = undefined;
      n.xx = undefined;
      n.layout = n.layout !== undefined ? n.layout : layout.expanded; //preserve original layout if there was one
      n.mode = n.mode !== undefined ? n.mode : mode.tree; //preserve original 'mode' if there was one
      n.nodeType = nodeType.single;
      n.title = n.title ? n.title : n.uuid;
    });

    //if none of the roots are in the graph, pick node with the largest degree as the root;
    if (!this.graph.nodes.find((n) => this.graph.root.find((r) => r === n.uuid))) {
      this.updateEdgeInfo(); //calculates the degree of each node in the tree
      graph.root = [this.graph.nodes.reduce((a, b) => a.degree > b.degree ? a : b, []).uuid]; //picks the largest one as the root.
      console.log('derived root is ', this.graph.nodes.reduce((a, b) => a.degree > b.degree ? a : b, []));
    }

    //create an array with all root nodes in the graph
    roots = roots ? roots : graph.nodes.filter((n) => { return graph.root.find((r) => r === n.uuid); });





    //set default values for unvisited links;
    graph.links.map((l, i) => {
      l.visible = (l.visited && !replace) ? l.visible : false;
      l.visited = (l.visited && !replace) ? l.visited : false;
    });



    // this.calculatePathway();
    // this.graph.nodes.map((n) => { n.visited = (n.pathway && n.moved) ? true : false; });

    // const pathwayNodes = this.graph.nodes.filter((n) => n.pathway && n.moved);
    // this.ypos = pathwayNodes.length > 0 ? +max(pathwayNodes, (n: any) => n.yy) : -1;

    this.ypos = -1;

    while (graph.nodes.filter((n) => {
      return n.visited === false;
    }).length > 0) {

      //Start with preferential root, then sort nodes alphabetically
      const root = (roots && roots.filter((r) => { return !r.visited; }).length > 0) ? roots.filter((r) => { return !r.visited; })[0] :
        this.graph.nodes.filter((n) => {
          return n.visited === false;
        }).reduce((a, b) => a.title < b.title ? a : b);
      // .reduce((a, b) => this.nodeNeighbors[a.uuid].degree > this.nodeNeighbors[b.uuid].degree ? a : b);


      const queue = [root];

      // console.log('extract root is ', root.title);

      // //BFS of the tree
      while (queue.length > 0) {
        const node = queue.splice(0, 1)[0];;
        this.extractTreeHelper(node, queue);
      }
    }

    // //Re-aggregate any aggregated portions of the tree;
    const aggRoots = this.graph.nodes.filter((n) => n.summary !== undefined);
    aggRoots.map((aggRoot) => this.setAggregation(aggRoot, aggRoot.aggMode === mode.level), forceAggregation);

    this.layoutTree();
    this.updateEdgeInfo();

  }


  updateEdgeInfo() {
    //create dictionary of nodes with
    //1) set of adjacent nodes in the graph
    this.nodeNeighbors = {};
    this.graph.nodes.map((n, i) => {
      this.nodeNeighbors[n.uuid] = {
        'title': n.title,
        'degree': 0,
        'hidden': 0
      };
    });
    //Populate dictionary
    //Find all edges that start or end on that node (only looks at edges between visible nodes)
    this.graph.links.filter((l) => l.target.nodeType === nodeType.single && l.source.nodeType === nodeType.single && !l.target.hidden && !l.source.hidden).map((l, i) => {

      const targetNode = l.target;
      const sourceNode = l.source;

      // const parent = [targetNode, sourceNode].find((n) => n.xx === min([targetNode, sourceNode], (n) => n.xx));
      // const child = [targetNode, sourceNode].find((n) => n.xx === max([targetNode, sourceNode], (n) => n.xx));

      let parent, child;
      if (sourceNode.children.find((c) => c.uuid === targetNode.uuid)) {
        parent = sourceNode;
        child = targetNode;
      } else if (targetNode.children.find((c) => c.uuid === sourceNode.uuid)) {
        child = sourceNode;
        parent = targetNode;
      };



      // Set all edges that connect level-mode to non levelSummary nodes to hidden
      if ((targetNode.mode === mode.level && targetNode.nodeType !== nodeType.levelSummary)
        || (sourceNode.mode === mode.level && sourceNode.nodeType !== nodeType.levelSummary)) {

        l.visible = false;

        //check for the exception where the edge connects parent in level mode and child in tree mode;
        if (parent && child.mode === mode.tree) {
          l.visible = true;
        }

        //check for the exception where the edge connects parent in level mode and child in levelSummary Mode;
        if (parent && child.nodeType === nodeType.levelSummary) {
          l.visible = true;
        }
      }


      const targetDictEntry = this.nodeNeighbors[targetNode.uuid];
      const sourceDictEntry = this.nodeNeighbors[sourceNode.uuid];

      targetDictEntry.degree = targetDictEntry.degree + 1;
      sourceDictEntry.degree = sourceDictEntry.degree + 1;

      //edge between parent and child are not considered 'hidden';
      if (l.visible === false && l.extracted && l.target.visible && l.source.visible) {
        if (parent === undefined || (child.mode === mode.level && !parent.children.find((c) => c.uuid === child.aggParent.parent.uuid))) {
          targetDictEntry.hidden = targetDictEntry.hidden + 1;
          sourceDictEntry.hidden = sourceDictEntry.hidden + 1;
        }
      }

    });

    this.graph.nodes.map((n) => {
      n.degree = this.nodeNeighbors[n.uuid].degree;
    });

    let vec;

    vec = {
      type: 'dataDensity',
      title: 'Graph Edges',
      data: this.graph.nodes.map((n, i) => { return { 'value': n.graphDegree, 'uuid': n.uuid, 'aggregated': n.layout === layout.aggregated }; }),
      ids: this.graph.nodes.map((n) => { return n.uuid; })
    };


    this.addArrayVec(vec);


    vec = {
      type: 'dataDensity',
      title: 'Visible Edges',
      data: this.graph.nodes.map((n, i) => { return { 'value': this.nodeNeighbors[n.uuid].degree - this.nodeNeighbors[n.uuid].hidden, 'uuid': n.uuid, 'aggregated': n.layout === layout.aggregated }; }),
      ids: this.graph.nodes.map((n) => { return n.uuid; })
    };

    this.addArrayVec(vec);

    vec = {
      type: 'dataDensity',
      title: 'Hidden Edges',
      data: this.graph.nodes.map((n, i) => { return { 'value': this.nodeNeighbors[n.uuid].hidden, 'uuid': n.uuid, 'aggregated': n.layout === layout.aggregated }; }),
      ids: this.graph.nodes.map((n) => { return n.uuid; })
    };


    this.addArrayVec(vec);


    // vec = {
    //   type: VALUE_TYPE_LEVEL,
    //   title: 'Hierarchy Level',
    //   data: this.graph.nodes.map((n, i) => { return { 'value': n.hierarchy, 'uuid': n.uuid, 'aggregated': n.layout === layout.aggregated }; }),
    //   ids: this.graph.nodes.map((n) => { return n.uuid; })
    // };


    // this.addArrayVec(vec);

  }

  addArrayVec(vec) {
    //Add arrayVec for node degree here:
    const arrayVector = arrayVec.create(vec.type);

    arrayVector.desc.name = vec.title;
    arrayVector.dataValues = vec.data;
    arrayVector.idValues = vec.ids;

    arrayVector.desc.value.range = [min(arrayVector.dataValues, (v) => { return v.value; }), max(arrayVector.dataValues, (v) => { return v.value; })];
    // console.log('range for ', arrayVector.desc.name ,  ' is ', arrayVector.desc.value.range);

    //remove existing Vector to replace with newly computed values for new tree;
    const existingVec = this.tableManager.adjMatrixCols.filter((a: any) => { return a.desc.name === arrayVector.desc.name; })[0];
    if (existingVec) {
      this.tableManager.adjMatrixCols.splice(this.tableManager.adjMatrixCols.indexOf(existingVec), 1);
    }
    this.tableManager.adjMatrixCols = this.tableManager.adjMatrixCols.concat(arrayVector); //store array of vectors

    //if it's not already in there:
    if (this.tableManager.colOrder.indexOf(arrayVector.desc.name) < 0) {
      this.tableManager.colOrder = [arrayVector.desc.name].concat(this.tableManager.colOrder); // store array of names
    }
  }

  // recursive helper function to extract tree from graph
  extractTreeHelper(node, queue) {

    node.visited = true;
    const edges = this.graph.links.filter((l) => {
      return l.target.uuid === node.uuid || l.source.uuid === node.uuid;
    });

    edges.map((e) => {
      const target = e.source.uuid === node.uuid ? e.target : e.source;
      const source = e.source.uuid === node.uuid ? e.source : e.target;

      //visited a node if it hasn't been pinned, or if it has, if the source is the pinned parent;
      if (!target.visited && (!target.pinned || source.uuid === target.parent.uuid)) {


        e.visible = e.visited ? e.visible : true;
        //only visit edge if there are no previous constraints on this edge visibility
        if (e.visible || target.mode === mode.level) {
          target.visited = true;
          target.parent = node;
          target.pinned = true; //preserves the parent chosen in the first extraction;
          node.children.push(target);

          queue.push(target);
        }
      }

      e.visited = true;
      e.extracted = true;
    });

  }

  //Function that removes all aggregateLabels and levelSummary nodes as well as their edges from the tree;
  clearLevelModeNodes(root = undefined, force = false) {

    //returns true for any node that is aggregateLabel or level Summary within that aggregated branch
    const toRemove = (n) => {
      return (n.nodeType === nodeType.aggregateLabel || n.nodeType === nodeType.levelSummary);
    };

    if (!root) {
      //remove relevant edges and aggregateLabel and aggSummary nodes;
      this.graph.links = this.graph.links.filter((l) => !toRemove(l.target) && !toRemove(l.source));
      this.graph.nodes = this.graph.nodes.filter((n) => !toRemove(n));
    } else {

      //remove any aggregateLabelNodes from this.graph.nodes
      const levelSummaryNodes = root.children.filter((c) => c.nodeType === nodeType.levelSummary);


      //remove all aggregateLabel labels (all children of level summary nodes)
      levelSummaryNodes.map((levelSummaryNode) => {
        levelSummaryNode.children.filter((c) => c.nodeType === nodeType.aggregateLabel).map((aggregateLabelNode) => {
          this.graph.nodes = this.graph.nodes.filter((n) => n.uuid !== aggregateLabelNode.uuid);
        });
      });

      //recursively call CLMN on levelSummaryNode children;
      levelSummaryNodes.map((levelSummaryNode) => {
        if (levelSummaryNode.children.find((c) => c.nodeType === nodeType.levelSummary)) {
          console.log('calling CLM on ', levelSummaryNode.label); this.clearLevelModeNodes(levelSummaryNode, force);
        };
      });

      //remove levelSummaryNodes from this.graph.nodes
      levelSummaryNodes.map((levelSummaryNode) => {
        this.graph.links = this.graph.links.filter((l) => l.source.uuid !== levelSummaryNode.uuid && l.target.uuid !== levelSummaryNode.uuid);
        this.graph.nodes = this.graph.nodes.filter((n) => n.uuid !== levelSummaryNode.uuid);
      });

      //remove any levelModeNodes from the child array of the parent;
      root.children = root.children.filter((c) => !toRemove(c));
      root.children.map((c) => { c.summary = force ? undefined : c.summary; c.aggMode = force ? undefined : c.aggMode; this.clearLevelModeNodes(c, force); });
    }
  }

  //function that iterates down branch and sets aggregate flag to true/false
  setAggregation(root, aggregate, force = false) { //forcing aggregation overrides child values.

    // console.log('setting aggregation from ' ,root.title , ' as ', aggregate);

    //clear all previous aggregation nodes first
    this.clearLevelModeNodes(root, force);

    root.summary = {};
    root.aggMode = aggregate ? mode.level : mode.tree;
    root.level = root.level !== undefined ? root.level : 0;
    const queue = [root];

    // //BFS of the tree
    while (queue.length > 0) {
      const node = queue.splice(0, 1)[0];
      this.aggregateHelper(root, node, aggregate, queue, force);
    }
  }

  aggregateHelper(root, node, aggregate, queue, force = false) {
    // console.log('aggregating ', node.title , ' from ', root.title, ' force: ', force);
    const aggregateBy = 'label';

    if (aggregate) {

      //Create a dictionary of all aggregate types per level;
      const level = (node.level + 1).toString();
      node.children.filter((n) => n.visible && n.nodeType === nodeType.single).map((c) => {
        if (root.summary[level]) {
          if (root.summary[level].indexOf(c[aggregateBy]) < 0) {
            root.summary[level].push(c[aggregateBy]);
          }
        } else {
          root.summary[level] = [c[aggregateBy]];
        }
      });

      //find parent of this level
      let parent;

      //find parent levelSummary node. There is one levelSummary node per level.
      parent = this.graph.nodes.find((n) => {
        return n.aggregateRoot === root && n.nodeType === nodeType.levelSummary && n.level === +level - 1;
      });

      if (parent === undefined) {
        parent = root;
      };

      if (node.children.filter((n) => n.visible).length > 0) {

        // console.log('creating level node for ', node.title, node.label)
        //create a levelSummary node for this level.
        let levelSummary = {
          parent,
          level: +level,
          children: [],
          label: 'level_' + level + '_summary',
          uuid: root.uuid + '_' + level + '_levelSummary',
          visible: true,
          aggregateRoot: root,
          nodeType: nodeType.levelSummary,
          title: ''
        };

        const existingSummary = parent.children.find((cc) =>
          cc.level === levelSummary.level && cc[aggregateBy] === levelSummary[aggregateBy]
        );

        //look for existing aggregate
        if (!existingSummary) {
          parent.children.push(levelSummary);
          this.graph.nodes.push(levelSummary);

          //create edge between aggSummary and its parent;
          const edge = { source: levelSummary.parent, target: levelSummary, visible: true, visited: true, edge: { data: { uuid: levelSummary.uuid } } };
          this.graph.links.push(edge);

        } else {
          levelSummary = existingSummary;
        }

        //set children mode, level, and aggregateRoot values
        node.children.filter((n) => n.visible).map((c) => {

          //set layout to preserve existing layout for level mode nodes;
          if (c.nodeType === nodeType.single) {
            if (c.mode === mode.level && !force) {
              c.layout = c.layout; //preserve aggregated/expanded state of level mode nodes;
            } else {
              c.layout = layout.aggregated;// for new nodes, default to aggregated state.
            }
          } else {
            c.layout = undefined; // layout for levelSummary and aggregateLabels don't matter;
          }

          //set all nodes to level mode (since aggregation is true here)
          c.mode = mode.level;
          c.level = node.level + 1;
          c.aggregateRoot = root;
        });

        root.summary[level].map((nlabel) => {

          //iterate through and create fake nodes for each level
          const aggregateNode = {
            parent: levelSummary,
            level: +level,
            children: [],
            uuid: root.uuid + '_' + level + '_' + nlabel,
            label: nlabel,
            visible: true,
            aggregateRoot: root,
            nodeType: nodeType.aggregateLabel,
            title: ''
          };

          //add node to children array of parent (if it's not already there)
          if (!(levelSummary.children.find((cc) => cc.level === aggregateNode.level && cc[aggregateBy] === aggregateNode[aggregateBy]))) {
            levelSummary.children.push(aggregateNode);
            //add nodes to array of nodes in this graph
            this.graph.nodes.push(aggregateNode);
          }

          //restablish connection between aggregateNodes and their semi-aggregated (expanded level mode) children if there are any
          const aggregatedNodes = this.graph.nodes.filter((n) => {
            return (n.visible &&
              n[aggregateBy] === nlabel &&
              n.level === aggregateNode.level &&
              aggregateNode.aggregateRoot === n.aggregateRoot &&
              n.mode === mode.level &&
              n.layout === layout.expanded);
          });


          aggregateNode.children = aggregatedNodes;

        });

        node.children.filter((n) => n.visible).map((c) => {
          //Find aggregateLabel that is the parent of that single node
          const parent = this.graph.nodes.find((n) => {
            return (n[aggregateBy] === c[aggregateBy] && //same label
              n.level === c.level && //same level
              c.aggregateRoot === n.aggregateRoot && //same branch
              n.nodeType === nodeType.aggregateLabel //aggregateLabel for that row
            );
          });

          c.aggParent = parent;


          if (c.nodeType === nodeType.single && (c.aggMode === undefined || force === true)) {
            queue.push(c);
          };
        });
      }

    } else {

      //don't change the mode of the root, only the children
      node.layout = node === root || (node.mode === mode.level && !force) ? node.layout : layout.expanded;
      node.mode = node === root || (node.mode === mode.level && !force) ? node.mode : mode.tree;

      // console.log(node.nodeType, node.title, node === root, node.mode,node.layout, force)

      //remove any level mode nodes from the parent
      // node.children = node.children.filter((n) => n.nodeType === nodeType.single);

      node.children.filter((n) => n.visible).map((c) => {
        //set edges between parent and child to visible again

        const link = this.graph.links.find((l) => (l.source.uuid === c.uuid && l.target.uuid === node.uuid) || (l.target.uuid === c.uuid && l.source.uuid === node.uuid));
        link.visible = true;

        c.level = undefined;
        c.aggParent = undefined;
        // console.trace('setting aggParent to undefined for ', c);
        c.aggregateRoot = undefined;
        if (c.nodeType === nodeType.single) {
          queue.push(c);
        };
      });

    };
  }


  layoutTree(sortAttribute = undefined) {

    this.graph.nodes.map((n) => n.visited = false);

    this.updateEdgeInfo();

    // this.graph.nodes.map((n) => { n.visited = (n.pathway && n.moved) ? true : false; });

    // const pathwayNodes = this.graph.nodes.filter((n)=> n.pathway && n.moved);
    // this.ypos = pathwayNodes.length >0 ? +max(pathwayNodes,(n:any)=> n.yy) : -1;
    this.ypos = -1;

    // //if no roots is provided, start with the one with the highest degree:
    // this.graph.root = this.graph.root ? this.graph.root : this.graph.nodes.reduce((a, b) => {
    //   return a.degree > b.degree ? a.uuid : b.uuid;
    // });


    while (this.graph.nodes.filter((n) => {
      return n.visible && n.visited === false;
    }).length > 0) {

      const roots = this.graph.nodes.filter((n) => { return this.graph.root.indexOf(n.uuid) > -1; });
      //Start with preferential root, then pick node with highest degree if none was supplied.
      const root = (roots && roots.filter((r) => { return !r.visited; }).length > 0) ? roots.filter((r) => { return !r.visited; })[0] :
        this.graph.nodes.filter((n) => {
          return n.visited === false;
        }).reduce((a, b) => {
          return a.title < b.title ? a : b;
          // return this.nodeNeighbors[a.uuid] && this.nodeNeighbors[a.uuid].degree > this.nodeNeighbors[b.uuid].degree ? a : b;
        });

      root.xx = 0;
      root.hierarchy = 0;
      root.mode = mode.tree;
      root.layout = layout.expanded;

      // console.log('layout root is ', root.title);

      this.layoutTreeHelper(root, sortAttribute);
    }
  }

  layoutTreeHelper(node, sortAttribute = undefined) {

    if (node.visited) {
      return;
    }

    node.visited = true;

    if (node.visible === false) {
      return;
    }

    //yValues for aggregated and level Summaries (aggSummary) are done in exportYValues
    if (node.layout !== layout.aggregated && node.nodeType !== nodeType.levelSummary) {
      this.ypos = this.ypos + 1;
      node.yy = this.ypos;
    }

    //sort Children by chosen attribute
    if (sortAttribute) {
      const data = sortAttribute.data;
      const ids = sortAttribute.ids;
      const sortOrder = sortAttribute.sortOrder;

      // console.log(ids, data);

      // console.table(data.map((d,i)=> {return {id:ids[i],data:d};}))
      // console.table(node.children.map((c,i)=> {return {id:c.uuid,title:c.title};}))

      node.children.sort((a, b) => {

        //prioritize children that are part of a pathway or are level Summary Nodes
        if (this.pathway.start && a.pathway === true) {
          return -1;
        };

        if (this.pathway.start && b.pathway === true) {
          return 1;
        };

        if (a.nodeType === nodeType.levelSummary) {
          return 1;
        }

        if (b.nodeType === nodeType.levelSummary) {
          return -1;
        }

        const aloc = ids.findIndex((id) => { return id.find((i) => { return i === a.uuid; }); });
        const bloc = ids.findIndex((id) => { return id.find((i) => { return i === b.uuid; }); });

        let aValues, bValues;

        if (aloc > -1) { //this is a single node
          aValues = data[aloc].filter((v) => v !== undefined);
        } else { //this is an aggregateLabel Node
          if (a.nodeType === nodeType.aggregateLabel) {
            const aIDs = this.graph.nodes.filter((n) => {
              return (n.visible &&
                n.label === a.label &&
                n.level === a.level &&
                a.aggregateRoot === n.aggregateRoot &&
                n.mode === mode.level &&
                n.layout === layout.aggregated);
            }).map((n) => n.uuid);

            if (aIDs.length > 0) {
              const aloc = ids.findIndex((id) => { return id.find((i) => { return i === aIDs[0]; }); });
              aValues = data[aloc].filter((v) => v !== undefined);
            } else {
              aValues = [];
            }
          }
        }
        // console.log(a,aValues);

        a.value = aValues.reduce((acc, cValue) => acc + cValue, 0);

        if (bloc > -1) {//this is a single Node
          bValues = data[bloc].filter((v) => v !== undefined);
        } else {//this is an aggregateLabel Node
          if (b.nodeType === nodeType.aggregateLabel) {
            const bIDs = this.graph.nodes.filter((n) => {
              return (n.visible &&
                n.label === b.label &&
                n.level === b.level &&
                b.aggregateRoot === n.aggregateRoot &&
                n.mode === mode.level &&
                n.layout === layout.aggregated);
            }).map((n) => n.uuid);

            if (bIDs.length > 0) {
              const bloc = ids.findIndex((id) => { return id.find((i) => { return i === bIDs[0]; }); });
              bValues = data[bloc].filter((v) => v !== undefined);
            } else {
              bValues = [];
            }
          }
        }
        // if (!bValues) {
        //   console.trace('bValues are undefined for, ', a, b);
        // }
        b.value = bValues.reduce((acc, cValue) => acc + cValue, 0);

        if (typeof a.value === 'number') {
          a.value = +a.value;
        }
        if (typeof b.value === 'number') {
          b.value = +b.value;
        }

        if (sortOrder === sortedState.Ascending) {
          if (b.value === undefined || a.value < b.value) { return -1; }
          if (a.value === undefined || a.value > b.value) { return 1; }
          if (a.value === b.value) {
            if (a.index === b.index) { return 0; }
            if (a.title < b.title) { return -1; }
            if (a.title > b.title) { return 1; }
          }
          if (a.value > b.value) { return 1; }
          if (a.value < b.value) { return -1; }

        } else {
          if (b.value === undefined || a.value > b.value) { return -1; }
          if (a.value === undefined || a.value < b.value) { return 1; }
          if (a.value === b.value) {
            if (a.title === b.title) { return 0; }
            if (a.title < b.title) { return -1; }
            if (a.title > b.title) { return 1; }
          }
          if (a.value < b.value) { return 1; }
          if (a.value > b.value) { return -1; }
        }

      });
    } else {
      //default sorting is alphabetical
      node.children.sort((a, b) => {
        //prioritize children that are part of a pathway
        if (this.pathway.start && a.pathway === true) {
          return -1;
        };

        if (this.pathway.start && b.pathway === true) {
          return 1;
        };

        return a.title < b.title ? -1 : (a.title === b.title ? (a.uuid < b.uuid ? -1 : 1) : 1);
      });
    }



    //prioritize children that are part of a pathway
    node.children

      // .sort((a, b) => { return a.pathway ? -1 : (b.pathway ? 1 : 0); })
      .map((c, i) => {
        // console.log('visiting ', c.title);
        const lastNode = this.graph.nodes.filter((n: any) =>
          c.aggParent && n.visited && n.layout === layout.aggregated && n.aggParent === c.aggParent);
        let maxX = +max(lastNode, (n: any) => n.xx);

        if (lastNode.length < 1 && c.aggregateRoot) {
          maxX = 0;
        }

        ////Only visit semi-aggregated nodes if they are the children of aggLabels
        if (c.mode === mode.level && c.nodeType === nodeType.single && c.layout === layout.expanded && node.nodeType !== nodeType.aggregateLabel) {
          // console.log('skipping ', c.title, c.label);
        } else {
          // console.log('visiting', c.title,c.label)

          if (c.layout === layout.aggregated) {
            c.xx = maxX + 1; //incremental x  for aggregates. proper placement is done in node.attr('x')
          } else if (c.nodeType === nodeType.levelSummary) {
            c.xx = node.xx + .7; //place level Summaries .7 units ahead of the parent (70% of the way between parent and child)
          } else if (node.nodeType === nodeType.levelSummary) {
            c.xx = node.xx + .3; //place aggregateNodes .3 units ahead of the level Summaries
          } else if (c.layout === layout.expanded && c.nodeType === nodeType.single && c.mode === mode.level) {
            c.xx = node.xx + .5; //place expanded aggregates (still in level mode) .5 unit ahead of the aggregate group label
          } else {
            c.xx = node.xx + 1; //place tree nodes always one unit ahead of their parent
          }

          if (c.nodeType === nodeType.levelSummary || (node.nodeType === nodeType.single)) {
            c.hierarchy = node.hierarchy + 1;
          } else {
            c.hierarchy = node.hierarchy;
          };
        };

        // console.log('visiting ', c.title,c.label, c.xx, 'parent',node.title,node.label,node.xx)
        ////Only visit semi-aggregated nodes if they are the children of aggLabels
        if (c.mode === mode.level && c.nodeType === nodeType.single && c.layout === layout.expanded && node.nodeType !== nodeType.aggregateLabel) {
          //do nothing
        } else {
          this.layoutTreeHelper(c, sortAttribute);
        }

      });
  }

  //default animations to true
  drawTree(animate = true) {
    const graph = this.graph;

    const animated = animate ? (d) => d.transition('t').duration(1000) : (d) => d;


    let link = this.svg.select('.visibleLinks')
      .selectAll('.edge')
      .data(graph.links.filter((l) => {
        return l.source.visible && l.target.visible && //both nodes are visible
          l.visible; //the edge is tagged as visible
      }),
      (d) => { return d.edge.data.uuid; });

    let linksEnter = link
      .enter()
      .append('path')
      .attr('class', 'edge');

    link.exit().remove();

    let linkEndMarkers = this.svg.select('.endMarkers')
      .selectAll('.endMarker')
      .data(graph.nodes.filter((n) => {
        return (!(n.children.length < 1 && n.graphDegree <= n.degree)) && n.visible && n.mode === mode.tree && n.nodeType === nodeType.single;
      }), (d) => { return this.createID(d) + '_endMarker'; });

    const linkEndMarkersEnter = linkEndMarkers
      .enter()
      .append('text')
      // .attr('alignment-baseline', 'middle')
      .attr('class', 'endMarker');

    linkEndMarkersEnter.append('tspan').classed('arrowIcon', true);
    linkEndMarkersEnter.append('tspan').classed('aggIcon', true);

    linkEndMarkers.exit().remove();

    linkEndMarkers = linkEndMarkers.merge(linkEndMarkersEnter);


    // Add Brackets for each level

    let levelBrackets = this.svg.select('.endMarkers')
      .selectAll('.levelGroup')
      .data(graph.nodes.filter((n) => {
        return (n.nodeType === nodeType.levelSummary);
      }), (d) => { return d.uuid + '_levelBracket'; });

    const levelBracketsEnter = levelBrackets
      .enter()
      .append('g')
      .attr('class', 'levelGroup');


    levelBracketsEnter
      .append('path')
      .attr('class', 'levelBracket');



    levelBracketsEnter
      .append('text')
      .attr('class', 'levelBracketMenu');



    levelBrackets.exit().remove();

    levelBrackets = levelBrackets.merge(levelBracketsEnter);

    levelBrackets
      .select('.levelBracketMenu')
      .text((d) => {
        return d.children.length > 0 ? Config.icons.arrowDown : Config.icons.arrowRight;
      });

    link = this.svg.select('.hiddenLinks')
      .selectAll('.edge')
      .data(graph.links.filter((l) => { return l.source.visible && l.target.visible && !l.visible; }),
      (d) => { return d.edge.data.uuid; });

    linksEnter = link
      .enter()
      .append('path')
      .attr('class', 'edge');

    link.exit().remove();


    const maxX = max(graph.nodes, (n: any) => {
      return +n.xx;
    });

    const yrange: number[] = [min(graph.nodes, function (d: any) {
      return Math.round(d.yy);
    }), max(graph.nodes, function (d: any) {
      return Math.round(d.yy);
    })];

    this.height = Config.glyphSize * 4 * (yrange[1] - yrange[0] + 1); // - this.margin.top - this.margin.bottom;


    select('#graph').select('svg').attr('height', this.height);

    const xScale = scaleLinear().domain([0, maxX]).range([this.padding.left, maxX * 40]); //- this.padding.right - this.padding.left]);
    const yScale = scaleLinear().range([0, this.height * .7]).domain(yrange);

    this.xScale = xScale;
    this.yScale = yScale;

    const self = this;

    linkEndMarkers
      .select('.arrowIcon')
      .text((d: any) => {
        return this.expandIcon(d);
      })
      .on('click', (d) => {
        this.toggleExpand(d, '.endMarker');
      });


    linkEndMarkers
      .select('.aggIcon')
      .text((d: any) => {
        if (this.whichExpandIcon(d) === 'arrowDown') {
          return Config.icons.AggregateIcon;
        };
        return '';
      });
    // .style('fill', (d) => (d.children.find((c) => c.nodeType === nodeType.levelSummary) ? '#7b94a9' : '#bcb9b9'))
    // .on('click', (d) => {
    //   const unaggregate = (d.children.find((c) => c.nodeType === nodeType.levelSummary));
    //   if (unaggregate) {
    //     events.fire(AGGREGATE_CHILDREN, { 'uuid': d.uuid, 'aggregate': false });
    //   } else {
    //     events.fire(AGGREGATE_CHILDREN, { 'uuid': d.uuid, 'aggregate': true });
    //   }
    // });



    //set initial position to parent
    linkEndMarkersEnter
      // .attr('transform', (d)=> 'translate (' +  this.xScale(d.xx)+ ','+ (d.parent ? this.yScale(d.parent.yy) : this.yScale(d.yy))  +')');
      .attr('x', (d: any, i) => {
        return this.xScale(d.xx);
      })
      .attr('y', (d: any, i) => {
        return d.parent ? this.yScale(d.parent.yy) : this.yScale(d.yy);
      });


    animated(levelBrackets.select('.levelBracket'))
      .attr('d', (d: any, i) => {
        return this.bracket(d);
      });


    animated(linkEndMarkers)
      // .attr('transform', (d)=> 'translate (' +  (this.whichExpandIcon(d) === 'arrowDown' ? this.xScale(d.xx)+5: this.xScale(d.xx) +3) + ','+ this.yScale(d.yy)  +')');

      .attr('x', (d: any, i) => {
        return this.whichExpandIcon(d) === 'arrowDown' ? this.xScale(d.xx) - 5 : this.xScale(d.xx) - 2;
      })
      .attr('y', (d: any, i) => {
        return this.yScale(d.yy);
      });

    // animated(levelBrackets)
    // .attr('transform',(d)=> { return 'translate (' + this.xScale(d.xx) + ',' + this.yScale(d.yy)  + ')';});


    levelBrackets.select('.levelBracketMenu')
      .attr('x', (d: any, i) => {
        return this.xScale(d.xx) + this.xScale.invert(10);
      })
      .attr('y', (d: any, i) => {
        const aggLabelChildren = d.children.filter((n) => n.nodeType === nodeType.aggregateLabel);
        const minYY = min(aggLabelChildren, (c: any) => c.yy);
        return this.yScale(minYY);
      });

    selectAll('.edge')
      .classed('visible', (d: any) => {
        return d.visible ? true : false;
      })
      .classed('hiddenEdge', (d: any) => {
        return d.visible ? false : true;
      })
      .on('click', ((d: any) => console.log(d, d.visible, d.source.title, d.target.title)));


    selectAll('.hiddenEdge')
      .attr('visibility', 'hidden')
      .attr('marker-end', 'url(#edgeCircleMarker)')
      .attr('marker-start', 'url(#edgeCircleMarker)')
      .on('click', (d: any) => {

        //check if they are direct descendants.
        const childNode = [d.source, d.target].reduce((acc, cValue) => { return cValue.yy > acc.yy ? cValue : acc; });
        const parentNode = [d.source, d.target].reduce((acc, cValue) => { return cValue.yy < acc.yy ? cValue : acc; });

        const areDescendantes = this.areDescendants(parentNode, childNode);

        let actions = [{
          'icon': 'edge', 'string': 'Add ' + parentNode.title + ' ---> ' + childNode.title + ' edge', 'callback': () => {
            events.fire(REPLACE_EDGE_EVENT, { 'source': parentNode.uuid, 'target': childNode.uuid, 'uuid': d.edge.data.uuid });
          }
        }];

        if (!areDescendantes) {
          actions = actions.concat({
            'icon': 'edge', 'string': 'Add ' + childNode.title + ' ---> ' + parentNode.title + ' edge', 'callback': () => {
              events.fire(REPLACE_EDGE_EVENT, { 'source': childNode.uuid, 'target': parentNode.uuid, 'uuid': d.edge.data.uuid });
            }
          });
        }
        this.menuObject.addMenu(d, actions);
      })
      .on('mouseover', function (d) {
        select('#treeMenu').select('.menu').remove();
        select(this).classed('highlightEdge', true);
        return self.ttip.addTooltip('edge', d);
      })
      .on('mouseout', function (d) {
        select(this).classed('highlightEdge', false);
        select('#tooltipMenu').select('svg').remove();
      });


    selectAll('.visible')
      .attr('marker-end', 'url(#circleMarker)')
      .attr('marker-start', 'url(#circleMarker)');

    animated(selectAll('.edge'))
      // .transition('t')
      // .duration(1000)
      .attr('d', (d: any, i) => {
        return this.elbow(d, this.lineFunction, d.visible);
      });

    const aggregateRoots = graph.nodes.filter((n) => n.summary && n.children.length > 0 && n.children[0].layout === layout.aggregated);
    const aggregateIcons = [];

    aggregateRoots.map((r) => {
      const levels = Object.keys(r.summary);
      levels.map((l) => {
        r.summary[l].map(((n) => {
          const xx = r.xx + +l * .6;

          //find offset
          const lev = Object.keys(r.summary).map(Number)
            .filter((ll) => { return ll <= +l; });

          const hops = lev.reduce((accumulator, level) => {
            const cValue = level < +l ? r.summary[level.toString()].length
              : r.summary[level.toString()].indexOf(n);
            return accumulator + cValue;
          }, 1);

          const yy = r.yy + hops;
          aggregateIcons.push({
            aggregateRoot: r,
            uuid: r.uuid + '_' + l + '_' + n,
            label: n,
            visible: true,
            nodeType: nodeType.aggregateLabel,
            title: '',
            xx,
            yy
          });
        })

        );
      });
    });

    let addIcons = this.svg.select('.nodes')
      .selectAll('.addIconGroup')
      .data(this.addIcons, (d) => {
        return d.uuid;
      });

    const addIconsEnter = addIcons.enter()
      .append('g')
      .attr('class', 'addIconGroup');

    addIconsEnter
      .append('line')
      .attr('class', 'addIconLine');

    addIconsEnter
      .append('text')
      .attr('class', 'addIcon')
      .attr('alignment-baseline', 'middle');

    addIcons.exit().remove();

    addIcons = addIcons.merge(addIconsEnter);

    addIcons.on('click', (d) => events.fire(SUBGRAPH_CHANGED_EVENT, { 'db': this.selectedDB, 'rootID': d.uuid, 'replace': false, 'remove': false }));

    addIcons
      .select('.addIcon')
      .html((d) => {
        return '<tspan>' + Config.icons.AddNode + '</tspan> ' + (d.graphDegree - d.degree);
      });

    addIcons
      .select('.addIcon')
      .attr('x', (d) => {
        return xScale(d.xx) - 5;
      })
      .attr('y', (d) => {
        if (d.children.find((c) => c.nodeType === nodeType.levelSummary)) {
          return yScale(d.children.find((c) => c.nodeType === nodeType.levelSummary).yy + .5);
        }
        return yScale(d.children.reduce((acc, cValue) => { return cValue.yy > acc.yy ? cValue : acc; }).yy + .5);
      });

    addIcons
      .select('.addIconLine')
      .attr('x1', (d) => { return xScale(d.xx); })
      .attr('x2', (d) => { return xScale(d.xx); })
      .attr('y1', (d) => {
        if (d.children.find((c) => c.nodeType === nodeType.levelSummary)) {
          return yScale(d.children.find((c) => c.nodeType === nodeType.levelSummary).yy + .3);
        }
        return yScale(d.children.reduce((acc, cValue) => { return cValue.yy > acc.yy ? cValue : acc; }).yy + .3);
      })
      .attr('y2', (d) => {
        if (d.children.find((c) => c.nodeType === nodeType.levelSummary)) {
          return yScale(d.children.find((c) => c.nodeType === nodeType.levelSummary).yy);
        }
        return yScale(d.children.reduce((acc, cValue) => { return cValue.yy > acc.yy ? cValue : acc; }).yy);
      });


    let node = this.svg.select('.nodes')
      .selectAll('.title')
      .data(graph.nodes.filter((n) => { return n.visible; }), (d) => {
        return d.uuid;
      });

    const nodesEnter = node.enter()
      .append('text')
      .attr('class', 'title')
      .attr('alignment-baseline', 'middle');


    node.exit().remove();

    //place new nodes @ parent's location;
    nodesEnter
      // .attr('opacity',0)
      .attr('x', (d) => {
        return xScale(d.xx) + this.radius;
      })
      .attr('y', (d) => {
        return d.parent ? yScale(d.parent.yy) : yScale(d.yy);
        // return yScale(d.yy)-200;
      });


    nodesEnter
      .append('tspan')
      .text('-')
      .attr('visibility', 'hidden');

    // nodesEnter
    //   .append('tspan')
    //   .attr('class', 'aggregateLabel');

    nodesEnter
      .append('tspan')
      .attr('class', 'icon expand');

    nodesEnter
      .append('tspan')
      .attr('class', 'icon aggIcon');

    nodesEnter
      .append('tspan')
      .attr('class', 'icon type');

    nodesEnter
      .append('tspan')
      .attr('class', 'titleContent');



    // nodesEnter.append('title');

    node = nodesEnter.merge(node);

    node.classed('aggregateTitle', (n) => n.nodeType === nodeType.aggregateLabel);

    // node.select('title')
    // .text(function (d) {
    //   return d.title;
    // });

    const aggregateLabels = node.filter((d) => d.nodeType === nodeType.aggregateLabel);
    const aggregatedNodes = node.filter((d) => d.layout === layout.aggregated);

    const semiAggregatedNodes = node.filter((n) => {
      return n.visible && n.mode === mode.level && n.layout === layout.expanded && n.nodeType === nodeType.single;
    });

    const regularNodes = node.filter((d) => d.nodeType === nodeType.single && d.layout === layout.expanded);

    regularNodes
      .select('.expand')
      .text(' ');

    regularNodes
      .select('.aggIcon')
      .text(' ');


    aggregatedNodes
      .select('.type')
      .text(Config.icons.aggregateIcon);

    aggregatedNodes
      .select('.expand')
      .text(' ');

    aggregatedNodes
      .select('.aggIcon')
      .text('');




    aggregatedNodes
      .select('.titleContent')
      .text('');

    // aggregateLabels
    //   .select('.aggregateLabel')
    //   .text((d) => d.label + '    ');

    aggregateLabels
      .select('.expand')
      .text(this.expandIcon);
    //   (d) => {
    //   return d.children.filter((c) => c.visible).length > 0 ? Config.icons.arrowDown + ' ' : Config.icons.arrowRight + '  ' + Config.icons[d.label]
    // });;

    aggregateLabels
      .select('.titleContent')
      .text((d) => this.whichExpandIcon(d) === 'arrowDown' ? d.label + 's' : '  ');


    aggregateLabels
      .select('.aggIcon')
      .text(' ');
    // .on('click', (d:any) => {
    //   const unaggregate = (d.children.find((c) => c.nodeType === nodeType.levelSummary));
    //   console.log(d,unaggregate);
    //   if (unaggregate) {
    //     events.fire(AGGREGATE_CHILDREN, { 'uuid': d.uuid, 'aggregate': false });
    //   } else {
    //     events.fire(AGGREGATE_CHILDREN, { 'uuid': d.uuid, 'aggregate': true });
    //   }
    // });


    selectAll('.aggIcon')
      .style('fill', (d: any) => (d.children.find((c) => c.nodeType === nodeType.levelSummary) ? '#7b94a9' : '#bcb9b9'))
      .on('click', (d: any) => {
        const unaggregate = d.children.find((c) => c.nodeType === nodeType.levelSummary);
        // console.log(d,unaggregate);
        if (unaggregate) {
          events.fire(AGGREGATE_CHILDREN, { 'uuid': d.uuid, 'aggregate': false });
        } else {
          events.fire(AGGREGATE_CHILDREN, { 'uuid': d.uuid, 'aggregate': true });
        }
      });


    // aggregateLabels
    //   .select('.titleContent')
    //   .text((d) => d.title);

    semiAggregatedNodes
      .select('.aggIcon')
      .text((d: any) => {
        if (this.whichExpandIcon(d) === 'arrowDown') {
          return Config.icons.AggregateIcon + ' ';
        };
        return '  ';
      });

    semiAggregatedNodes
      .select('.expand')
      .text(this.expandIcon)
      .style('font-size', (d) => {
        if (this.whichExpandIcon(d) === 'noArrow') {
          return '8px';
        }
      })
      .style('stroke-width', (d) => {
        if (this.whichExpandIcon(d) === 'noArrow') {
          return '2px';
        }
      })
      .style('stroke', (d) => {
        if (this.whichExpandIcon(d) === 'noArrow') {
          return 'white';
        }
      });

    regularNodes
      .select('.type')
      .text((d) => Config.icons[d.label]);

    regularNodes
      .select('.titleContent')
      .text((d) => ' ' + d.title.slice(0, 100));

    node.on('click', (d) => console.log(d));

    node.selectAll('.expand')
      .on('click', (d) => {

        // console.log(d, d.label, d.mode, d.layout);
        //grow tree from this node;
        if (d.mode === mode.level && d.layout === layout.expanded) {
          d.summary = {};
          d.aggMode = d.aggMode !== undefined ? d.aggMode : mode.tree;

          this.toggleExpand(d, '.expand');
          return;
        }

        //put aggregates into expanded level nodes
        const aggNode = d; //this.graph.nodes.find((n) => n.uuid === d.uuid && d.nodeType === nodeType.aggregateLabel);

        if (aggNode.children.length < 1) {

          const aggregatedNodes = this.graph.nodes.filter((n) => {
            return (n.label === d.label && n.level === d.level && d.aggregateRoot === n.aggregateRoot && n.layout === layout.aggregated);
          });

          aggNode.children = aggregatedNodes;

          aggregatedNodes.map((c) => {
            c.layout = layout.expanded;
            //reveal any hidden children;
            this.hideBranch(c, false);

          });

          console.log('expanding ', aggregatedNodes);

          // this.hideBranch(aggNode,false);
          events.fire(FILTER_CHANGED_EVENT, {});

        } else {

          //re-aggregate expanded level nodes
          const aggregatedNodes = this.graph.nodes.filter((n) => {
            return (n.label === d.label && n.level === d.level && d.aggregateRoot === n.aggregateRoot && n.mode === mode.level && n.layout === layout.expanded);
          });

          aggNode.children = [];

          aggregatedNodes.map((c) => {
            c.layout = layout.aggregated;
            //hide all children of the aggregated children;
            this.hideBranch(c, true);
          });


          console.log('aggregating ', aggregatedNodes);
          events.fire(FILTER_CHANGED_EVENT, {});
        }

      });

    selectAll('.aggregateLabel')
      .attr('visibility', 'hidden');

    node
      .on('mouseover', (d: any) => {
        if (d.layout === layout.aggregated) {
          self.ttip.addTooltip('node', d);
        }
      })
      .on('mouseout', (d: any) => {
        if (d.layout === layout.aggregated) {
          select('#tooltipMenu').select('svg').remove();
        }
      });
    node.classed('aggregated', (n) => n.layout === layout.aggregated);

    node
      .transition('t')
      .duration(animate ? 1000 : 0)
      // .attr('opacity',1)
      .attr('x', (d) => {
        // console.log(d.title,d.label,d.xx)
        const xpos = d.layout === layout.aggregated ? Math.floor((d.xx - 1) / 3) * this.xScale.invert(6) + d.aggParent.xx + this.xScale.invert(30) : undefined;
        // const labelXpos = d.nodeType === nodeType.aggregateLabel ? d.aggregateRoot.xx + d.level : undefined;

        // return d.layout === layout.aggregated ? xScale(xpos) + this.radius : (d.nodeType === nodeType.aggregateLabel ? xScale(labelXpos) : (d.mode === mode.level && d.layout === layout.expanded ? xScale(d.xx - 1) + this.radius : xScale(d.xx) + this.radius));
        //
        return d.layout === layout.aggregated ? xScale(xpos) + this.radius * 1.5 : (d.mode === mode.level ? xScale(d.xx) : xScale(d.xx) + this.radius * 1.5);
      })
      .attr('y', (d) => {
        const ypos = d.yy + .5 - (1 / 3 * ((d.xx - 1) % 3 + 1) * this.yScale.invert(18));
        return d.layout === layout.aggregated ? yScale(ypos) : yScale(d.yy);
      })
      .on('end', (d, i) => {

        if (i >= select('.nodes').selectAll('.title').size() - 1) {
          const nodeGroupWidth = document.getElementById('nodeGroup').getBoundingClientRect().width;
          //set width of svg to size of node group + margin.left
          select('#graph')
            .transition('t')
            .duration(500)
            .attr('width', nodeGroupWidth + this.margin.left + 50);

          select('#hiddenLinks')
            .attr('transform', 'translate(' + (nodeGroupWidth + 50 - Config.glyphSize) + ' ,0)');
        }

      });

    this.addHightlightBars();

    select('#graph')
      .attr('height', document.getElementById('genealogyTree').getBoundingClientRect().height + this.margin.top * 2);
  }

  areDescendants(parent, child, value = false) {
    if (parent.children.length < 1) {
      return value || false;
    }

    if (parent.children.filter((c) => { return c.uuid === child.uuid; }).length > 0) {
      return true;
    } else {
      parent.children.map((c) => {
        value = value || this.areDescendants(c, child, value);
      });
      return value;
    }
  }

  drawGraph() {

    const graph = this.graph;

    const dragstarted = (d) => {
      if (!event.active) {
        this.simulation.alphaTarget(0.3).restart();
      }
      d.fx = d.x;
      d.fy = d.y;
    };

    const dragged = (d) => {
      d.fx = event.x;
      d.fy = event.y;
    };

    const dragended = (d) => {
      if (!event.active) {
        this.simulation.alphaTarget(0);
      }
      d.fx = null;
      d.fy = null;
    };


    select('#graph').select('svg').attr('height', this.forceDirectedHeight);

    let link = this.svg.select('.visibleLinks')
      .selectAll('line')
      .data(graph.links.filter((l) => { return l.source.visible && l.target.visible; }));

    const linkEnter = link
      .enter()
      .append('line')
      .attr('class', 'visible');

    link.exit().remove();
    link = link.merge(linkEnter);

    let node = this.svg.select('.nodes')
      // .selectAll('g')
      .selectAll('.title')
      .data(graph.nodes.filter((n) => n.visible));

    const nodeEnter = node
      .enter()
      .append('g')
      .attr('class', 'title');

    nodeEnter.append('circle');

    nodeEnter
      .append('text');


    node.exit().remove();

    node = node.merge(nodeEnter);

    node.select('circle')
      .attr('fill', ((d) => { return Config.colors[d.label] ? Config.colors[d.label] : 'lightblue'; }))
      .attr('r', (d) => { return 15; });


    node.select('text')
      .text((d) => {
        const ellipsis = d.title.length > 4 ? '...' : '';
        return d.title.slice(0, 4) + ellipsis; //Config.icons[d.label] + ' ' +
      })
      .on('mouseover', (d) => {
        const selectedText = selectAll('.title').select('text').filter((l: any) => { return l.title === d.title; });
        selectedText.html((dd: any) => { return '<tspan class="icon">' + Config.icons[dd.label] + '</tspan> ' + dd.title; });
        this.highlightRows(d);
      })
      .on('mouseout', (d) => {
        const selectedText = selectAll('.title').select('text').filter((l: any) => { return l.title === d.title; });
        selectedText.text((dd: any) => {
          const ellipsis = d.title.length > 4 ? '...' : '';
          return d.title.slice(0, 4) + ellipsis; //Config.icons[dd.label] + ' ' +
        });
        this.clearHighlights();
      });

    node
      .call(drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));


    const ticked = (e) => {
      link
        .attr('x1', function (d) {
          return d.source.x;
        })
        .attr('y1', function (d) {
          return d.source.y;
        })
        .attr('x2', function (d) {
          return d.target.x;
        })
        .attr('y2', function (d) {
          return d.target.y;
        });

      const nodeBumper = 20;

      node.select('circle')
        .attr('cx', (d) => {
          return d.x;
          // return d.x = Math.max(nodeBumper, Math.min(forceWidth - nodeBumper, d.x));
        })
        .attr('cy', (d) => {
          return d.y;
          // return d.y = Math.max(nodeBumper, Math.min(this.forceDirectedHeight - nodeBumper, d.y));
        });

      node
        .select('text')
        .attr('x', (d) => {
          return d.x;
          // return d.x = Math.max(nodeBumper, Math.min(forceWidth - nodeBumper, d.x));
        })
        .attr('y', (d) => {
          return d.y;
          // return d.y = Math.max(nodeBumper, Math.min(this.forceDirectedHeight - nodeBumper, d.y));
        });
    };

    this.simulation
      .nodes(this.graph.nodes)
      .on('tick', ticked);

    this.simulation.force('link')
      .links(graph.links);

    //restart simulation;
    this.simulation.alpha(1).restart();
    // this.simulation.alphaTarget(0);
  }

  //function that determines the icon for expansion that should be shown
  private expandIcon(node) {
    if ((node.children.length < 1 && node.graphDegree === node.degree) || (node.mode === mode.level && node.layout === layout.expanded && !node.children.find((n) => n.nodeType === nodeType.levelSummary || n.layout === layout.expanded) && node.graphDegree === node.degree)) {
      return Config.icons.smallCircle + ' ';
    } else {
      return node.children.filter((c) => (c.visible && c.nodeType === nodeType.levelSummary) || (c.visible && c.layout === layout.expanded && ((c.mode === mode.tree) || ((c.mode === mode.level && c.aggParent === node))))).length > 0 ? Config.icons.arrowDown + ' ' :
        (node.nodeType === nodeType.aggregateLabel ? Config.icons.arrowRight + ' ' + Config.icons[node.label] + ' ' : Config.icons.arrowRight + ' ');
    }

  }

  //function that determines if the icon is arrowRight, arrowDown, or noArrow
  private whichExpandIcon(node) {
    if ((node.children.length < 1 && node.graphDegree === node.degree) || (node.mode === mode.level && node.layout === layout.expanded && !node.children.find((n) => n.nodeType === nodeType.levelSummary || n.layout === layout.expanded) && node.graphDegree === node.degree)) {
      return 'noArrow';
    } else {
      return node.children.filter((c) => (c.visible && c.nodeType === nodeType.levelSummary) || (c.visible && c.layout === layout.expanded && ((c.mode === mode.tree) || ((c.mode === mode.level && c.aggParent === node))))).length > 0 ? 'arrowDown' : 'arrowRight';
    }
  }
  private addHightlightBars() {

    // selectAll('.title')
    //   .on('mouseover', highlightRows);

    // const t = transition('t').duration(500).ease(easeLinear);

    const highlightBarGroup = select('#genealogyTree').select('#highlightBars');

    const yRange: number[] = [min(this.graph.nodes.filter((n) => n.visible), function (d: any) {
      return Math.round(d.yy);
    }), max(this.graph.nodes.filter((n) => n.visible), function (d: any) {
      return Math.round(d.yy);
    })];

    //Create data to bind to highlightBars
    const yData: any[] = [];
    for (let i = yRange[0]; i <= yRange[1]; i++) {
      //find all nodes in this row
      const yNodes = this.graph.nodes.filter((n: any) => {
        return n.visible && Math.round(n.yy) === i;
      });

      // console.log(yNodes[0])
      // if (yNodes.length>0) {
      yData.push({
        //works for individual rows. Need to reconsider for aggregate rows.
        data: yNodes[0], yy: i, xx: min(yNodes, (d: any) => { return d.xx; })
        , id: yNodes[0].uuid
      });


      // }

    }

    //Create data to bind to aggregateBars
    const aggregateBarData: any[] = [];
    for (let i = yRange[0]; i <= yRange[1]; i++) {
      //find all nodes in this row
      const yNodes = this.graph.nodes.filter((n: any) => {
        return Math.round(n.yy) === i && n.layout === layout.aggregated;
      });
      if (yNodes.length > 0) {
        aggregateBarData.push({
          yy: i, xx: min(yNodes, (d: any) => {
            return d.xx;
          })
        });
      }

    }

    // Attach aggregateBars
    let aggregateBars = highlightBarGroup.selectAll('.aggregateBar')
      .data(aggregateBarData, (d) => { return d.yy; });


    aggregateBars.exit().remove();

    const aggregateBarsEnter = aggregateBars
      .enter()
      .append('rect')
      .classed('aggregateBar', true)
      .attr('opacity', 0);

    aggregateBars = aggregateBarsEnter.merge(aggregateBars);

    // aggregateBars
    //   // .transition(t)
    //   .attr('transform', (row: any) => {
    //     console.log(row,this.yScale(row.y))
    //     return 'translate(0,' + (this.yScale(row.y) - Config.glyphSize * 1.25) + ')';
    //   })
    //   .attr('width', (row: any) => {
    //     const range = this.xScale.range();
    //     return (max([range[0], range[1]]) - this.xScale(row.x) + this.margin.right);
    //   })
    //   .attr('x', (row: any) => {
    //     return this.xScale(row.x);
    //   })
    //   .attr('height', Config.glyphSize * 2.5);


    aggregateBars
      // .transition(t.transition().duration(500).ease(easeLinear))
      .attr('opacity', 1);


    // Attach highlight Bars
    let allBars = highlightBarGroup.selectAll('.bars')
      .data(yData, (d) => { return d.id; });

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
      .classed('highlightBar', true);

    allBars = allBarsEnter.merge(allBars);

    //Position all bars:
    allBars
      .attr('transform', (row: any) => {
        return 'translate(0,' + (this.yScale(row.yy) - Config.glyphSize) + ')';
      });


    const nodeGroupWidth = document.getElementById('nodeGroup').getBoundingClientRect().width;
    //set width of svg to size of node group + margin.left
    select('#graph')
      .transition('t')
      .duration(500)
      .attr('width', nodeGroupWidth + this.margin.left + 50);

    allBars
      .select('.backgroundBar')
      .attr('width', document.getElementById('nodeGroup').getBoundingClientRect().width + this.margin.left + 50)
      //   const range = this.xScale.range();
      //   return (max([range[0], range[1]]) - min([range[0], range[1]]) + this.margin.right + this.padding.right);
      // })
      .attr('height', Config.glyphSize * 2);


    allBars
      .select('.highlightBar')
      .attr('width', document.getElementById('nodeGroup').getBoundingClientRect().width + this.margin.left + 50)
      // (row: any) => {
      //   const range = this.xScale.range();
      //   return (max([range[0], range[1]]) - this.xScale(row.xx) + this.margin.right + this.padding.right);
      // })
      .attr('x', (row: any) => {
        return this.xScale(row.xx);
      })
      .attr('height', Config.glyphSize * 2);


    //Set both the background bar and the highlight bar to opacity 0;
    selectAll('.bars')
      .selectAll('.backgroundBar')
      .attr('opacity', 0);

    selectAll('.bars')
      .selectAll('.highlightBar')
      .attr('opacity', 0);

    // function highlightRows(d: any) {

    //   function selected(e: any) {
    //     let returnValue = false;
    //     //Highlight the current row in the graph and table

    //     if (e.yy === Math.round(d.yy) || e.y === Math.round(d.yy)) {
    //       returnValue = true;
    //     }
    //     return returnValue;
    //   }

    //   selectAll('.slopeLine').classed('selectedSlope', false);

    //   selectAll('.slopeLine').filter((e: any) => {

    //     return e.yy === Math.round(d.yy);
    //   }).classed('selectedSlope', true);

    //   //Set opacity of corresponding highlightBar
    //   selectAll('.highlightBar').filter(selected).attr('opacity', .2);

    //   const className = 'starRect_' + this.createID(d.data.title);
    //   console.log(this)

    //   select('.'+className).attr('opacity',.2);

    // }

    // function clearHighlights() {
    //   // selectAll('.duplicateLine').attr('visibility', 'hidden');

    //   selectAll('.slopeLine').classed('selectedSlope', false);

    //   //Hide all the highlightBars
    //   selectAll('.highlightBar').attr('opacity', 0);

    //   selectAll('.ageLabel').attr('visibility', 'hidden');
    // }


    selectAll('.highlightBar')
      .on('mouseover', (e: any) => {
        //Add glyphs;
        const d = e.data;

        if (d) {
          // const remove = d.children.length > 0;
          const element = selectAll('.hiddenEdge').filter((dd: any) => {
            return dd.source.title === d.title || dd.target.title === d.title;
          });

          //for non aggregate rows only
          if (d.layout !== layout.aggregated && d.nodeType === nodeType.single) {
            const currentText = select('.nodes').selectAll('.title').filter((t: any) => { return t.uuid === d.uuid; });

            selectAll('tspan.menu').remove();

            currentText.append('tspan')
              .attr('class', 'icon menu')
              .text('  ' + Config.icons.settings);

            currentText.selectAll('.icon.menu')
              // .on('mousoever',this.highlightRow)
              .on('mouseover', (d) => {
                this.highlightRows(d);
              })
              .on('click', () => {
                const remove = d.children.filter((c) => c.visible).length > 0;
                const removeAdjMatrix = this.tableManager.colOrder.indexOf(d.title) > -1;
                const removeAttr = this.tableManager.colOrder.indexOf('age') > -1;
                let actions = [
                  {
                    'icon': 'RemoveNode', 'string': 'Remove Node ', 'callback': () => {
                      events.fire(SUBGRAPH_CHANGED_EVENT, { 'db': this.selectedDB, 'rootID': d.uuid, 'replace': false, 'remove': true, 'includeChildren': false });
                    }
                  },
                  {
                    'icon': 'RemoveNode', 'string': 'Remove Sub-tree', 'callback': () => {
                      events.fire(SUBGRAPH_CHANGED_EVENT, { 'db': this.selectedDB, 'rootID': d.uuid, 'replace': false, 'remove': true, 'includeChildren': true });
                    }
                  },
                  {
                    'icon': 'MakeRoot', 'string': 'Make Root', 'callback': () => {
                      events.fire(ROOT_CHANGED_EVENT, { 'root': d });
                    }
                  },
                  {
                    'icon': 'Add2Matrix', 'string': removeAdjMatrix ? 'Remove from Table' : 'Add to Table', 'callback': () => {
                      events.fire(ADJ_MATRIX_CHANGED, { 'db': this.selectedDB, 'name': d.title, 'uuid': d.uuid, 'remove': removeAdjMatrix, 'nodes': this.graph.nodes.map((n) => n.uuid) });
                    },

                  },
                  // {
                  //   'icon': 'Aggregate', 'string': 'Aggregate Children', 'callback': () => {
                  //     events.fire(AGGREGATE_CHILDREN, { 'uuid': d.uuid, 'aggregate': true });
                  //   }
                  // }
                ];
                //Only have option to gather neighbors if this node has hidden children;
                if (this.nodeNeighbors[d.uuid].hidden > 0) {
                  actions = actions.concat([
                    {
                      'icon': 'RemoveNode', 'string': 'Gather Children', 'callback': () => {
                        events.fire(GATHER_CHILDREN_EVENT, { uuid: d.uuid });
                      }
                    },
                    // {
                    //   'icon': 'RemoveNode', 'string': 'Gather Children with duplication', 'callback': () => {
                    //     events.fire(GATHER_CHILDREN_EVENT, { uuid: d.uuid });
                    //   }
                    // }
                  ]);
                }

                if (!d.pathway) {
                  actions = actions.concat(
                    [{
                      'icon': 'setPathway', 'string': 'Set as Pathway Start', 'callback': () => {
                        events.fire(PATHWAY_SELECTED, { 'start': true, 'uuid': d.uuid });
                      }
                    }]);
                }
                if (this.pathway.start && !d.pathway) {
                  actions = actions.concat(
                    [{
                      'icon': 'setPathway', 'string': 'Set as Pathway End', 'callback': () => {
                        events.fire(PATHWAY_SELECTED, { 'end': true, 'uuid': d.uuid });
                      }
                    }]);
                }
                if (d.pathway) {
                  actions = actions.concat(
                    [{
                      'icon': 'setPathway', 'string': 'Clear Pathway', 'callback': () => {
                        events.fire(PATHWAY_SELECTED, { 'clear': true });
                      }
                    }]
                  );
                }
                if (d.children.length > 0) {
                  // const unaggregate = (d.children.find((c) => c.nodeType === nodeType.levelSummary));
                  // if (unaggregate) {
                  //   actions = actions.concat(
                  //     [{
                  //       'icon': 'Aggregate', 'string': 'Un-Aggregate Children', 'callback': () => {
                  //         events.fire(AGGREGATE_CHILDREN, { 'uuid': d.uuid, 'aggregate': false });
                  //       }
                  //     }]);
                  // }
                  const aggregate = !(d.children.find((c) => c.nodeType === nodeType.levelSummary));
                  if (aggregate) {
                    actions = actions.concat(
                      [{
                        'icon': 'Aggregate', 'string': 'Expand all Children', 'callback': () => {
                          events.fire(EXPAND_CHILDREN, { 'children': d.children });
                        }
                      }]);
                  }
                }

                this.menuObject.addMenu(d, actions);
              });
          }

          this.highlightRows(e);
        }
      })
      .on('mouseout', (e: any) => {
        const d = e.data;
        if (d) {
          const element = selectAll('.hiddenEdge').filter((dd: any) => {
            return dd.source.title === d.title || dd.target.title === d.title;
          });

          this.clearHighlights();
          // selectAll('tspan.menu').remove();
        }
      });

    //CLICK CALLBACK FOR HIGHLIGHT BARS. DO NOT DELETE.
    // .on('click', (d: any, i) => {
    //   if (event.defaultPrevented) { return; } // dragged

    //   const wasSelected = selectAll('.highlightBar').filter((e: any) => {
    //     return e.yy === d.yy || e.y === Math.round(d.yy);
    //   }).classed('selected');


    //   //'Unselect all other background bars if ctrl was not pressed
    //   if (!event.metaKey) {
    //     selectAll('.slopeLine').classed('clickedSlope', false);
    //     selectAll('.highlightBar').classed('selected', false);
    //   }

    //   selectAll('.slopeLine').filter((e: any) => {
    //     return e.yy === d.yy || e.yy === Math.round(d.yy);
    //   }).classed('clickedSlope', function () {
    //     return (!wasSelected);
    //   });

    //   selectAll('.highlightBar').filter((e: any) => {
    //     return e.yy === d.yy || e.yy === Math.round(d.yy);
    //   }).classed('selected', function () {
    //     return (!wasSelected);
    //   });
    // });

    // selectAll('.bars')
    //   .selectAll('.backgroundBar')
    //   .on('mouseover', this.highlightRows)
    //   .on('mouseout', this.clearHighlights);

  }

  //highlight rows for hover on force-directed graph
  private highlightRows(d: any) {

    function selected(e: any) {
      let returnValue = false;
      //Highlight the current row in the graph and table

      if (e.y === Math.round(d.y) || e.yy === Math.round(d.y) || e.y === Math.round(d.yy) || e.yy === Math.round(d.yy)) {
        returnValue = true;
      }
      return returnValue;
    }

    selectAll('.title').select('.aggregateLabel').filter((bar: any) => { return bar.yy === d.yy; }).attr('visibility', 'visible');
    //Set opacity of corresponding highlightBar
    selectAll('.highlightBar').filter(selected).attr('opacity', .2);

    if (d.data) {
      const className = 'starRect_' + this.createID(d.data);
      select('.' + className).attr('opacity', .2);
    }

    // console.log(d);
    const eoi = selectAll('.hiddenEdge').filter((e: any) => {
      let parent, child;
      if (e.source.children.find((c) => c.uuid === e.target.uuid)) {
        parent = e.source;
        child = e.target;
      } else if (e.target.children.find((c) => c.uuid === e.source.uuid)) {
        child = e.source;
        parent = e.target;
      };

      if (parent === undefined || (child.mode === mode.level && !parent.children.find((c) => c.uuid === child.aggParent.parent.uuid))) {
        return (d.id === e.source.uuid || d.id === e.target.uuid);
      } else {
        return false;
      }

    });

    // console.log('eoi size', eoi.size())

    //only highlight connected nodes
    eoi.each((element: any) => {
      select('.nodes')
        .selectAll('.title')
        .filter((t: any) => {
          return (t.uuid === element.source.uuid || t.uuid === element.target.uuid);
        })
        .style('opacity', 1);
    });

    eoi
      .attr('visibility', 'visible');


  }

  private clearHighlights() {
    // selectAll('.aggregateLabel').attr('visibility', 'hidden');
    selectAll('.highlightBar').attr('opacity', 0);
    selectAll('.starRect').attr('opacity', 0);
    selectAll('.hiddenEdge').attr('visibility', 'hidden');
  }


  private createID(d) {
    const title = d.title ? d.title : d.uuid;
    return title.replace(/ /g, '_').replace(/\./g, '').replace(/\@/g, '').replace(/\?/g, '').replace(/\:/g, '').replace(/\(/g, '').replace(/\)/g, '').replace(/\'/g, '').replace(/\&/g, '').replace(/\!/g, '').replace(/\//g, '').replace(/\,/g, '');
  }


  private toggleExpand(d, selector) {


    const selectedItem = selectAll(selector).filter((m: any) => m.uuid === d.uuid);
    const hide = this.whichExpandIcon(d) === 'arrowDown';


    if (hide) {
      //hide all children;
      this.hideBranch(d, true);
      selectedItem.classed('hasHiddenChildren', true);
      events.fire(FILTER_CHANGED_EVENT, {});
    } else {
      selectedItem.classed('hasHiddenChildren', false);
      //check if node already has hidden children in the graph
      if (d.children.find((c) => c.visible === false)) {

        this.hideBranch(d, false);
        events.fire(FILTER_CHANGED_EVENT, {});
      } else {
        events.fire(SUBGRAPH_CHANGED_EVENT, { 'db': this.selectedDB, 'rootID': d.uuid, 'replace': false, 'remove': hide });
      }

    }
  }


  private bracket(d, lineFunction = this.lineFunction) {

    const start = min(d.children.filter((c) => c.nodeType !== nodeType.levelSummary), (c: any) => {
      const childrenY = min(c.children, (cc: any) => +cc.yy);
      return min([+c.yy, childrenY]);
    });

    const end = max(d.children.filter((c) => c.nodeType !== nodeType.levelSummary), (c: any) => {
      const childrenY = max(c.children, (cc: any) => +cc.yy);
      return max([+c.yy, childrenY]);
    });


    let linedata, nx, sx;
    nx = this.xScale.invert(20);
    sx = this.xScale.invert(10);

    linedata = [{
      x: d.xx + nx,
      y: start - .3
    },
    {
      x: d.xx + sx,
      y: start
    },
    {
      x: d.xx + sx,
      y: end
    },
    {
      x: d.xx + nx,
      y: end + .3
    }];

    // linedata = [];
    // let j = start;
    // while (j <=end) {
    //   linedata.push({
    //     x:d.xx + nx,
    //     y: j
    //   });
    //   linedata.push({
    //     x:d.xx,
    //     y: j
    //   });
    //   j = j+1;
    // };


    // console.log(linedata)


    lineFunction.curve(curveLinear);

    return lineFunction(linedata);
  }

  private elbow(d, lineFunction, curves) {
    // let i;
    // if (!d.visible) {
    //   const hiddenEdges = Array.from(this.nodeNeighbors[d.source.uuid].hiddenNeighbors);

    //   i = hiddenEdges.indexOf(d.target);
    //   console.log(hiddenEdges,i)
    // }

    let source = d.source;
    let target = d.target;

    if (source.xx < target.xx) {
      const t = target;
      target = source;
      source = t;
    }
    const xdiff = source.xx - target.xx > 0 ? source.xx - target.xx : this.xScale.invert(10);
    const ydiff = source.yy - target.yy;
    let nx = source.xx - xdiff;

    let linedata;
    if (curves) {
      nx = source.xx - xdiff;
      linedata = [{
        x: source.xx,
        y: source.yy
      },
      {
        x: nx,
        y: source.yy
      },
      {
        x: nx,
        y: target.yy
      },
      {
        x: target.xx,
        y: target.yy
      }];
    } else {

      // //find all hidden edges that end or start here
      // const allEdges = this.graph.links.filter((l)=> {return !l.visible &&
      //   (l.target.uuid === source.uuid || l.source.uuid === source.uuid || l.source.uuid === target.uuid || l.source.uuid === target.uuid);})
      //   .sort((a,b)=> {return Math.abs(a.target.yy - a.source.yy) >  Math.abs(b.target.yy - b.source.yy);});

      nx = -this.xScale.invert(Math.pow(Math.abs(target.yy - source.yy), 1) * 5);
      // nx = -this.xScale.invert((allEdges.indexOf(d)+1)*10);
      // nx = -this.xScale.invert((i+1)*(i+1));

      //Straight Lines
      // linedata = [{
      //   x: 0,
      //   y: source.yy
      // },
      // {
      //   x: nx,
      //   y: source.yy + this.yScale.invert(10)
      // },
      // {
      //   x: nx,
      //   y: target.yy - this.yScale.invert(10)
      // },
      // {
      //   x: 0,
      //   y: target.yy
      // }];

      //Curves
      linedata = [{
        x: 0,
        y: source.yy
      },
      {
        x: nx,
        y: (source.yy + target.yy) / 2
      },
      {
        x: 0,
        y: target.yy
      }];


      // linedata = [{
      //   x: source.xx,
      //   y: source.yy
      // },
      // {
      //   x: target.xx,
      //   y: target.yy
      // }];
    }

    if (curves) {
      lineFunction.curve(curveLinear);
    } else {
      lineFunction.curve(curveBasis);
      // lineFunction.curve(curveLinear);
      // curveBasis
    }

    return lineFunction(linedata);
  }


  private updateYValues() {

    this.addIcons = [];
    //set yy values for aggregateNodes as a function of the aggregateParent
    this.graph.nodes.map((n) => {
      // console.log(!n.aggParent, n);

      const start = min(n.children.filter((c) => c.nodeType !== nodeType.levelSummary), (c: any) => {
        const childrenY = min(c.children, (cc: any) => +cc.yy);
        return min([+c.yy, childrenY]);
      });

      const end = max(n.children.filter((c) => c.nodeType !== nodeType.levelSummary), (c: any) => {
        const childrenY = max(c.children, (cc: any) => +cc.yy);
        return max([+c.yy, childrenY]);
      });

      if (n.layout === layout.aggregated && !n.aggParent) {
        console.log(n);
      };
      n.yy = n.layout === layout.aggregated ? n.aggParent.yy : (n.nodeType === nodeType.levelSummary ? start + (end - start) / 2 : n.yy);

      //check for need to add '+' icon to fetch remaining children in server
      if (this.whichExpandIcon(n) === 'arrowDown') {
        if (n.degree < n.graphDegree) {
          this.addIcons.push(n);
        }
      }
    });
  }
  /**
   *
   * This function passes the newly computed y values to the tableManager
   *
   */
  private exportYValues() {

    this.updateYValues();

    //Create hashmap of personID to y value;
    const dict = {};

    this.graph.nodes.filter((n) => n.visible && n.nodeType === nodeType.single).forEach((node) => {
      if ((node.uuid) in dict) {
        dict[node.uuid].push(Math.round(node.yy));
      } else {
        dict[node.uuid] = [Math.round(node.yy)];
      }
    });





    //Assign y values to the tableManager object
    this.tableManager.yValues = dict;

    events.fire(TABLE_VIS_ROWS_CHANGED_EVENT);
    // this.yValues = dict; //store dict for tree to use when creating slope chart
  }


}



/**
 * Factory method to create a new instance of the genealogyTree
 * @param parent
 * @param options
 * @returns {graph}
 */
export function create(width, height, radius, selector, tmanager) {
  return new Graph(width, height, radius, selector, tmanager);
}
