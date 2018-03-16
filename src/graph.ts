import * as events from 'phovea_core/src/event';

import {
  DB_CHANGED_EVENT, LAYOUT_CHANGED_EVENT
} from './headers';

import {
  SUBGRAPH_CHANGED_EVENT, FILTER_CHANGED_EVENT
} from './setSelector';

import { TABLE_VIS_ROWS_CHANGED_EVENT, COL_ORDER_CHANGED_EVENT, ADJ_MATRIX_CHANGED, AGGREGATE_CHILDREN, ATTR_COL_ADDED, PATHWAY_SELECTED, TREE_PRESERVING_SORTING } from './tableManager';

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
  Config
} from './config';

import * as menu from './menu';
import * as tooltip from './toolTip';

import * as arrayVec from './ArrayVector';

export const ROOT_CHANGED_EVENT = 'root_changed';
export const REPLACE_EDGE_EVENT = 'replace_edge_event';
export const EXPAND_CHILDREN = 'expand_children';


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

    events.on(EXPAND_CHILDREN, (evt, info) => {

      const url = 'api/data_api/getNodes/' + this.selectedDB;
      console.log('url is ', url);



      const postContent = JSON.stringify({ 'rootNode': '', 'rootNodes': info.children.map((n) => { return n.uuid; }), 'treeNodes': this.graph.nodes.map((n) => { return n.uuid; }) });


      json(url)
        .header('Content-Type', 'application/json')
        .post(postContent, (error, graph: any) => {
          if (error) {
            throw error;
          }

          this.mergeGraph(graph, false, true);
          //find root nodes
          const rootNode = this.graph.nodes.find((n) => n.uuid === graph.root);
          this.postMergeUpdate();

        });

    });

    events.on(REPLACE_EDGE_EVENT, (evt, info) => {

      //replace parent of selected target as source
      const source = this.graph.nodes.filter((node) => { return node.uuid === info.source; })[0];
      const target = this.graph.nodes.filter((node) => { return node.uuid === info.target; })[0];

      const childNode = [source, target].reduce((acc, cValue) => { return cValue.yy > acc.yy ? cValue : acc; });
      const parentNode = [source, target].reduce((acc, cValue) => { return cValue.yy < acc.yy ? cValue : acc; });

      const oldParent = target.parent ? target.parent : source.parent;
      const child = target.parent ? target : source;

      //remove target from list of old parent's children
      const oldChild = oldParent.children.indexOf(child);
      // console.log('oldChild', oldChild);
      oldParent.children.splice(oldChild, 1);

      //make old edge hidden
      //Do not add links that already exists in the tree
      const oldEdge = this.graph.links.filter((ll) => {
        return (ll.source.uuid === oldParent.uuid && ll.target.uuid === child.uuid && ll.edge.data.uuid !== info.uuid)
          || (ll.target.uuid === oldParent.uuid && ll.source.uuid === child.uuid && ll.edge.data.uuid !== info.uuid);
      })[0];
      // console.log('oldEdge', oldEdge);

      oldEdge.visible = false;
      oldEdge.visited = true;

      if (!target.parent) {
        source.parent = undefined;
        // this.graph.root = [source];
      }

      //Set new Parent and child;
      target.parent = source;
      source.children.push(target);


      //make new edge visible


      const newEdge = this.graph.links.filter((ll) => { return ll.edge.data.uuid === info.uuid; })[0];
      // console.log('newEdge', newEdge);

      newEdge.visible = true;
      newEdge.visited = true;

      // console.log(oldParent,target,source,oldEdge,newEdge)

      this.graph.nodes.map((n) => n.visited = false);
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

            arrayVector.desc.value.range = [min([max(arrayVector.dataValues), 0]), max(arrayVector.dataValues)];

            // console.log(arrayVector);

            //if it's not already in there:
            if (this.tableManager.adjMatrixCols.filter((a: any) => { return a.desc.name === arrayVector.desc.name; }).length < 1) {
              this.tableManager.adjMatrixCols = this.tableManager.adjMatrixCols.concat(arrayVector); //store array of vectors
            }

            //if it's not already in there:
            if (this.tableManager.colOrder.filter((a: any) => { return a === arrayVector.desc.name; }).length < 1) {
              this.tableManager.colOrder = this.tableManager.colOrder.concat([arrayVector.desc.name]); // store array of names
            }

            events.fire(TABLE_VIS_ROWS_CHANGED_EVENT);

          });

      }

    });

    events.on(PATHWAY_SELECTED, (evt, info) => {

      if (info.clear || info.start) {
        this.graph.nodes.map((n) => { n.pathway = false; n.moved = false; });
        selectAll('.edge.visible').classed('pathway', false);
        //clear pathway info
        this.pathway.start = undefined;
        this.pathway.end = undefined;;
      }


      const sNode = this.graph.nodes.filter((n) => n.uuid === info.uuid)[0];
      const node = sNode;

      if (info.start) {
        this.pathway.start = sNode;
      } else if (info.end) {
        this.pathway.end = sNode;
      }

      if (info.clear === undefined) {
        this.calculatePathway();
      }

      this.layoutTree();
      this.updateEdgeInfo();
      this.exportYValues();
      this.drawTree();

    });

    events.on(TREE_PRESERVING_SORTING, (evt, info) => {
      this.graph.nodes.map((n) => n.visited = false);
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
      this.setAggregation(root, info.aggregate,true);

      this.graph.nodes.map((n) => n.visited = false);
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

      //clear all other aggregate flags;
      this.graph.nodes.filter((n) => n.summary = undefined);

       //layout is already expanded.
       this.graph.root =[info.root.uuid];
      //change root to tree mode
      const root = info.root;

      const rootAggMode = root.aggMode;

      root.summary = {};
      root.aggMode = mode.tree;
      root.mode = mode.tree;
      root.level = 0;

      this.extractTree(undefined,undefined,undefined,true); //force un-aggregation'

      //if root was an aggregateRoot, reset it.
      if (rootAggMode !== undefined) {
        root.summary = {};
        root.aggMode = rootAggMode;
        this.extractTree(undefined,undefined,undefined,true); //force re-aggregation'
      }


      // //layout is already expanded.
      // this.graph.root =[info.root.uuid];



      this.exportYValues();
      this.drawTree();
    });

    events.on(SUBGRAPH_CHANGED_EVENT, (evt, info) => {
      this.loadGraph(info.db, info.rootID, info.replace, info.remove, info.includeRoot, info.includeChildren);;
    });


    this.tableManager = tmanager;
    this.width = width;
    this.height = 600; // change to window height so force directed graph has room to breath;
    this.radius = radius;

    // select(selector).append('div')
    //   .attr('id', 'graphHeaders');

    const graphDiv = select(selector).append('div')
      .attr('id', 'graphDiv');

    this.svg = select('#graphDiv')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('id', 'graph')
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

  private clearPathway(node) {
    if (node.parent) {
      const filteredPathways = selectAll('.pathway').filter((e: any) => {
        if (node.parent) {
          const edge1 = (e.source.uuid === node.uuid && e.target.uuid === node.parent.uuid);
          const edge2 = (e.source.uuid === node.parent.uuid && e.target.uuid === node.uuid);
          return (edge1 || edge2);
        } else {
          return false;
        }
      });

      filteredPathways
        .classed('pathway', false);

      node.parent.pathway = undefined;
      this.clearPathway(node.parent);
    }

  }

  private calculatePathway() {
    const nodes = this.pathway.start ? (this.pathway.end ? [this.pathway.end] : [this.pathway.start]) : [];
    let quit = false;
    nodes.map((node) => {
      node.pathway = true;
      while (node.parent && !quit) {
        //if node is already tagged as pathway, you have found a shorter path than going all the way to the root;
        if (node.parent.pathway) {
          console.log('found', node.parent.title);

          selectAll('.edge.visible').filter((e: any) => {
            return (e.source.uuid === node.uuid && e.target.uuid === node.parent.uuid)
              || (e.source.uuid === node.parent.uuid && e.target.uuid === node.uuid);
          })
            .classed('pathway', true);

          quit = true;
          this.clearPathway(node.parent);

        } else {
          //find edge;

          selectAll('.edge.visible').filter((e: any) => {
            return (e.source.uuid === node.uuid && e.target.uuid === node.parent.uuid)
              || (e.source.uuid === node.parent.uuid && e.target.uuid === node.uuid);
          })
            .classed('pathway', true);
          //set new node, will stop @ the root
          node = node.parent;
          node.pathway = true;
        }
      }
    });


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
  }

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
  public hideBranch(rootNode,hide = true) {
    rootNode.children.map((c)=>this.hideBranchHelper(c,hide));
  }

  public hideBranchHelper(node,hide) {
        node.visible = !hide;
        node.hidden = hide;
        node.children.map((c)=> this.hideBranchHelper(c,hide));
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
      const rootNode = this.graph.nodes.filter((n) => n.uuid === root);


      //recursive function to remove all nodes and edges down this branch;
      this.removeBranch(rootNode[0], includeChildren);

      //also remove root
      if (includeChildren) {
        this.removeBranch(rootNode[0], !includeChildren);
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


    const rootNode = graph.nodes.filter((n) => { return n.uuid.toString() === graph.root.toString(); });
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
    if (this.graph.nodes.filter((n) => { return n.uuid.toString() === graph.root.toString(); }).length < 1) {
      this.graph.root = this.graph.root.concat(graph.root);
    };


    //update indexes
    graph.links.forEach((link) => {
      const sourceNode = this.graph.nodes.filter((n) => { return n.uuid.toString() === link.source.uuid.toString(); })[0];
      const targetNode = this.graph.nodes.filter((n) => { return n.uuid.toString() === link.target.uuid.toString(); })[0];

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
        const findLink = this.graph.links.filter((ll) => {
          return (ll.source.uuid === sourceNode.uuid && ll.target.uuid === targetNode.uuid)
            || (ll.target.uuid === sourceNode.uuid && ll.source.uuid === targetNode.uuid); //if we don't care about direction
        });

        if (findLink.length < 1) {
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
    const filterLabels = select('#filterPanel')
      .selectAll('.dropdownMenu')
      .html(function (d: any) {
        const count = labels[d.name] ? labels[d.name] : 0;
        return '<tspan class="icon">' + Config.icons[d.name] + '</tspan> ' + d.name + ' [' + count + ']'; //+  Config.icons.menu;
      });
  }

  //Function that extracts tree from Graph
  //takes in tgree parameters:
  // roots, which graph to extract, and whether to replace any existing tree.
  extractTree(roots = undefined, graph = this.graph, replace = false,forceAggregation=false) {

    //remove all levelMode Nodes
    this.clearLevelModeNodes();

    //create an array with all root nodes in the graph
    roots = roots ? roots : this.graph.nodes.filter((n) => { return graph.root.indexOf(n.uuid) > -1; });
    let setNewRoot = true;

    this.updateEdgeInfo();

    //Filter out all nodes to be excluded
    const excluded = this.exclude;

    // console.table(this.graph.nodes.map((c)=> { return {'title':c.title,'label':c.label,'mode':c.mode,'layout':c.layout};}));

    //set default values for unvisited nodes;
    // .filter((n)=> !n.visited)
    graph.nodes.map((n, i) => {
      n.visible = excluded.indexOf(n.label) > -1 || n.hidden === true ? false : true; //used to hide filtered and collapsed nodes
      n.visited = excluded.indexOf(n.label) > -1 ? true : false; //excluded nodes are not part of the tree structure
      n.children = [];
      n.parent = undefined;
      n.yy = undefined;
      n.xx = undefined;
      // n.originalX = undefined;
      n.layout = n.layout !== undefined ? n.layout : layout.expanded; //preserve original layout if there was one
      n.mode = n.mode !== undefined ? n.mode : mode.tree; //preserve original 'mode' if there was one
      n.nodeType = nodeType.single;
    });

        // console.table(this.graph.nodes.map((c)=> { return {'title':c.title,'label':c.label,'mode':c.mode,'layout':c.layout};}));


    //set default values for unvisited links;
    graph.links.map((l, i) => {
      //set visibility back to original
      l.visible = l.inTree === undefined ? (l.visited && !replace) ? l.visible : false : l.inTree;
      l.visited = (l.visited && !replace) ? l.visited : false; //link has been visited
    });

    // this.calculatePathway();
    // this.graph.nodes.map((n) => { n.visited = (n.pathway && n.moved) ? true : false; });

    // const pathwayNodes = this.graph.nodes.filter((n) => n.pathway && n.moved);
    // this.ypos = pathwayNodes.length > 0 ? +max(pathwayNodes, (n: any) => n.yy) : -1;

    this.ypos = -1;

    while (graph.nodes.filter((n) => {
      return n.visited === false;
    }).length > 0) {

      //Start with preferential root, then pick node with highest degree if none was supplied.
      const root = (roots && roots.filter((r) => { return !r.visited; }).length > 0) ? roots.filter((r) => { return !r.visited; })[0] :
        this.graph.nodes.filter((n) => {
          return n.visited === false;
        }).reduce((a, b) => this.nodeNeighbors[a.uuid].degree > this.nodeNeighbors[b.uuid].degree ? a : b);


      // If graph.root is empty, add the node with the highest degree.
      if (roots.length < 1 && setNewRoot) {
        setNewRoot = false;
        this.graph.root = [root.uuid];
      };

      const maxY = max(this.graph.nodes, (n: any) => {
        return +n.yy;
      });

      const queue = [root];
      console.log('root is ', root);
      // //BFS of the tree
      while (queue.length > 0) {
        const node = queue.splice(0, 1)[0];;
        this.extractTreeHelper(node, queue);
      }
    }

    // //Re-aggregate any aggregated portions of the tree;
    const aggRoots = this.graph.nodes.filter((n) => n.summary !== undefined);
    // console.log(aggRoots)
    aggRoots.map((aggRoot) => this.setAggregation(aggRoot, aggRoot.aggMode === mode.level),forceAggregation);



    this.graph.nodes.map((n) => n.visited = false);
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



    //Find all edges that start or end on that node
    this.graph.links.map((l) => {

      const targetNode = l.target;
      const sourceNode = l.source;

      // set visibility back to original
      l.visible = l.inTree === undefined ? l.visible : l.inTree;

      // Set all edges that connect level-mode non levelSummary nodes to hidden
      if ((targetNode.mode === mode.level && targetNode.nodeType !== nodeType.levelSummary)
        || (sourceNode.mode === mode.level && sourceNode.nodeType !== nodeType.levelSummary)) {
        l.inTree = l.visible; //save original edge visibility information
        l.visible = false;

        //check for the exception where the edge connects parent in level mode and child in tree mode;
        const parent = [targetNode, sourceNode].find((n) => n.xx === min([targetNode, sourceNode], (n) => n.xx));
        const child = [targetNode, sourceNode].find((n) => n.xx === max([targetNode, sourceNode], (n) => n.xx));
        if (parent.children && child.mode === mode.tree && parent.children.filter((c) => c.uuid === child.uuid).length > 0) {
          l.visible = true;
        }

        //check for the exception where the edge connects parent in level mode and child in levelSummary Mode;
        if (parent.children && child.nodeType === nodeType.levelSummary && parent.children.filter((c) => c.uuid === child.uuid).length > 0) {
          l.visible = true;
        }
      }


      const targetDictEntry = this.nodeNeighbors[targetNode.uuid];
      const sourceDictEntry = this.nodeNeighbors[sourceNode.uuid];

      targetDictEntry.degree = targetDictEntry.degree + 1;
      sourceDictEntry.degree = sourceDictEntry.degree + 1;

      if (l.visible === false) {
        targetDictEntry.hidden = targetDictEntry.hidden + 1;
        sourceDictEntry.hidden = sourceDictEntry.hidden + 1;
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
      title: 'Tree Edges',
      data: this.graph.nodes.map((n, i) => { return { 'value': this.nodeNeighbors[n.uuid].degree, 'uuid': n.uuid, 'aggregated': n.layout === layout.aggregated }; }),
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


    vec = {
      type: VALUE_TYPE_LEVEL,
      title: 'Hierarchy Level',
      data: this.graph.nodes.map((n, i) => { return { 'value': n.hierarchy, 'uuid': n.uuid, 'aggregated': n.layout === layout.aggregated }; }),
      ids: this.graph.nodes.map((n) => { return n.uuid; })
    };


    this.addArrayVec(vec);

  }

  addArrayVec(vec) {
    //Add arrayVec for node degree here:
    const arrayVector = arrayVec.create(vec.type);

    arrayVector.desc.name = vec.title;


    arrayVector.dataValues = vec.data;
    arrayVector.idValues = vec.ids;

    arrayVector.desc.value.range = [min(arrayVector.dataValues, (v) => { return v.value; }), max(arrayVector.dataValues, (v) => { return v.value; })];


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

      const target = e.target;
      const source = e.source;

      if (!target.visited) {

        e.visible = e.visited ? e.visible : true;

        //only visit edge if there are no previous constraints on this edge visibility
        if (e.visible) {
          target.visited = true;
          target.parent = node;
          node.children.push(target);
          queue.push(target);
        }
      } if (!source.visited) {
        e.visible = e.visited ? e.visible : true;
        //only visit edge if there are no previous constraints on this edge visibility
        if (e.visible) {
          source.visited = true;
          source.parent = node;
          node.children.push(source);
          queue.push(source);
        }
      }
      e.visited = true;
    });

  }

  //Function that removes all aggregateLabels and levelSummary nodes as well as their edges from the tree;
  clearLevelModeNodes(root = undefined) {

    //returns true for any node that is aggregateLabel or level Summary within that aggregated branch
    const toRemove = (n) => {
      if (!root) { //remove all level mode nodes
        return (n.nodeType === nodeType.aggregateLabel || n.nodeType === nodeType.levelSummary);
      } else { //only remove level mode nodes for this subtree
        return ((n.nodeType === nodeType.aggregateLabel && n.aggregateRoot === root) ||
          (n.nodeType === nodeType.levelSummary && n.aggregateRoot === root));
      };
    };

    //remove relevant edges and aggregateLabel and aggSummary nodes;
    this.graph.nodes = this.graph.nodes.filter((n) => !toRemove(n));
    this.graph.links = this.graph.links.filter((l) => !toRemove(l.target));

  }

  //function that iterates down branch and sets aggregate flag to true/false
  setAggregation(root, aggregate,force=false) { //forcing aggregation overrides child values.

    //clear all previous aggregation nodes first
    if (aggregate) {
      this.clearLevelModeNodes(root);
    }

    root.summary = {};
    root.aggMode = aggregate ? mode.level : mode.tree;
    root.level = root.level !== undefined ? root.level : 0;
    const queue = [root];

    // //BFS of the tree
    while (queue.length > 0) {
      const node = queue.splice(0, 1)[0];
      this.aggregateHelper(root, node, aggregate, queue,force);
    }

    if (!aggregate) {
      this.clearLevelModeNodes(root);
    }

    // console.table(this.graph.nodes.filter((n)=>n.mode === mode.level).map((c)=> { return {'title':c.title,'label':c.label,'layout':c.layout};}));

  }

  aggregateHelper(root, node, aggregate, queue,force=false) {
    const aggregateBy = 'label';

    if (aggregate) {

      //Create a dictionary of all aggregate types per level;
      const level = (node.level + 1).toString();
      node.children.filter((n)=>n.visible).map((c) => {
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

      if (node.children.filter((n)=>n.visible).length > 0) {

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
          cc.level === levelSummary.level && cc[aggregateBy] === levelSummary[aggregateBy]);

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
          if (!(levelSummary.children.find((cc) =>
            cc.level === aggregateNode.level && cc[aggregateBy] === aggregateNode[aggregateBy]))) {
            levelSummary.children.push(aggregateNode);
            //add nodes to array of nodes in this graph
            this.graph.nodes.push(aggregateNode);
          }

          //restablish connection between aggregateNodes and their semi-aggregated children if there are any
          const aggregatedNodes = this.graph.nodes.filter((n) => {
            return (n.visible &&
              n[aggregateBy] === nlabel &&
              n.level === aggregateNode.level &&
              aggregateNode.aggregateRoot === n.aggregateRoot &&
              n.mode === mode.level &&
              n.layout === layout.expanded);
          });


          aggregateNode.children = aggregatedNodes;
          // console.log('aggChildren of ', aggregateNode.title, aggregateNode.label, ' are ', aggregatedNodes)

        });
      }

      node.children.filter((n)=>n.visible).map((c) => {
        //default new level modes to aggregated layout
        c.layout = c.nodeType === nodeType.single ?
          (c.mode === mode.level ? c.layout : layout.aggregated) : layout.expanded; //preserve existing layout
        c.mode = mode.level;
        c.level = node.level + 1;
        c.aggregateRoot = root;

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

    } else {

      //don't change the mode of the root, only the children
      node.layout = node === root ? node.layout : layout.expanded;
      node.mode = node === root ? node.mode : mode.tree;

      //remove any level mode nodes from the parent
      node.children = node.children.filter((n) => n.nodeType === nodeType.single);

      node.children.filter((n)=>n.visible).map((c) => {
        c.level = undefined;
        c.aggParent = undefined;
        c.aggregateRoot = undefined;
        if (c.nodeType === nodeType.single) {
          queue.push(c);
        };
      });

    };
  }


  layoutTree(sortAttribute = undefined) {

    // this.graph.nodes.map((n) => { n.visited = (n.pathway && n.moved) ? true : false; });

    // const pathwayNodes = this.graph.nodes.filter((n)=> n.pathway && n.moved);
    // this.ypos = pathwayNodes.length >0 ? +max(pathwayNodes,(n:any)=> n.yy) : -1;
    this.ypos = -1;


    while (this.graph.nodes.filter((n) => {
      return n.visible && n.visited === false;
    }).length > 0) {

      const roots = this.graph.nodes.filter((n) => { return this.graph.root.indexOf(n.uuid) > -1; });
      //Start with preferential root, then pick node with highest degree if none was supplied.
      const root = (roots && roots.filter((r) => { return !r.visited; }).length > 0) ? roots.filter((r) => { return !r.visited; })[0] :
        this.graph.nodes.filter((n) => {
          return n.visited === false;
        }).reduce((a, b) => {
          return this.nodeNeighbors[a.uuid] && this.nodeNeighbors[a.uuid].degree > this.nodeNeighbors[b.uuid].degree ? a : b;
        });

      root.xx = 0;
      root.hierarchy = 0;
      root.mode = mode.tree;
      root.layout = layout.expanded;

      this.layoutTreeHelper(root, sortAttribute);
    }

    // console.table(this.graph.nodes.filter((n)=>n.layout === layout.aggregated).map((c)=> { return {'title':c.title,'xx':c.xx,'aggParent':c.aggParent.label};}));
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

      node.children.sort((a, b) => {
        const aloc = ids.findIndex((id) => { return id.find((i) => { return i === a.uuid; }); });
        const bloc = ids.findIndex((id) => { return id.find((i) => { return i === b.uuid; }); });

        a.value = data[aloc];
        b.value = data[bloc];

        if (typeof a.value === 'number') {
          a.value = +a.value;
        }
        if (typeof b.value === 'number') {
          b.value = +b.value;
        }

        // console.log(a.value,b.value);

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
      console.log(node.children);
    } else {
      //default sorting is alphabetical
      node.children.sort((a, b) => {
        return a.title < b.title ? -1 : (a.title === b.title ? (a.uuid < b.uuid ? -1 : 1) : 1);
      });
    }


    //prioritize children that are part of a pathway
    node.children
      // .sort((a,b)=> {return a.pathway ? -1 :(b.pathway ? 1 : 0);})
      .map((c, i) => {
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
          this.layoutTreeHelper(c);
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
      }), (d) => { return this.createID(d.title) + '_endMarker'; });

    const linkEndMarkersEnter = linkEndMarkers
      .enter()
      .append('text')
      .attr('class', 'endMarker');

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
      .text((d) => {
        return d.children.filter((c) => c.visible).length > 0 ? Config.icons.arrowDown : Config.icons.arrowRight;
      })
      .on('click', (d) => {
        this.toggleExpand(d,'.endMarker');
      });

    //set initial position to parent
    linkEndMarkersEnter
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


    linkEndMarkers
      .attr('x', (d: any, i) => {
        return d.children.filter((n)=>n.visible).length > 0 ? this.xScale(d.xx) - 5 : this.xScale(d.xx) - 2;
      });

      animated(linkEndMarkers)
      .attr('y', (d: any, i) => {
        return this.yScale(d.yy) + 1;
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
    const semiAggregatedNodes = node.filter((d) => d.nodeType === nodeType.single && d.layout === layout.expanded && d.mode === mode.level);
    const regularNodes = node.filter((d) => d.nodeType === nodeType.single && d.layout === layout.expanded);

    regularNodes
    .select('.expand')
    .text(' ');

    aggregatedNodes
      .select('.type')
      .text(Config.icons.aggregateIcon);

    aggregatedNodes
      .select('.expand')
      .text(' ');

    aggregatedNodes
      .select('.titleContent')
      .text('');

    // aggregateLabels
    //   .select('.aggregateLabel')
    //   .text((d) => d.label + '    ');

    aggregateLabels
      .select('.expand')
      .text((d) => d.children.filter((c)=>c.visible).length > 0 ? Config.icons.arrowDown + ' ' : Config.icons.arrowRight + '  ' + Config.icons[d.label]);

    aggregateLabels
      .select('.titleContent')
      .text((d) => d.children.length > 0 ? d.label + 's' : '  ');


    // aggregateLabels
    //   .select('.titleContent')
    //   .text((d) => d.title);

    semiAggregatedNodes
      .select('.expand')
      .text((d) => {
        const remove = d.children.filter((c)=>c.visible && c.layout === layout.expanded).length > 0;
        return remove ? Config.icons.arrowDown + ' ' : Config.icons.arrowRight + ' ';
      });

    regularNodes
      .select('.type')
      .text((d) => Config.icons[d.label]);

    regularNodes
      .select('.titleContent')
      .text((d) => ' ' + d.title);


    node.selectAll('.expand')
      .on('click', (d) => {

        //grow tree from this node;
        if (d.mode === mode.level && d.layout === layout.expanded) {
          d.summary = {};
          d.aggMode = d.aggMode !== undefined? d.aggMode : mode.tree;

          this.toggleExpand(d,'.expand');
          return;
        }

        //put aggregates into expanded level nodes
        const aggNode = this.graph.nodes.find((n) => n.uuid === d.uuid && d.nodeType === nodeType.aggregateLabel);

        if (aggNode.children.length < 1) {

          const aggregatedNodes = this.graph.nodes.filter((n) => {
            return (n.label === d.label && n.level === d.level && d.aggregateRoot === n.aggregateRoot && n.layout === layout.aggregated);
          });

          aggNode.children = aggregatedNodes;

          aggregatedNodes.map((c) => {
            c.layout = layout.expanded;
            //reveal any hidden children;
            this.hideBranch(c,false);
          });
          events.fire(FILTER_CHANGED_EVENT,{});

        } else {

          //re-aggregate expanded level nodes
          const aggregatedNodes = this.graph.nodes.filter((n) => {
            return (n.label === d.label && n.level === d.level && d.aggregateRoot === n.aggregateRoot && n.layout === layout.expanded);
          });

          aggNode.children = [];

          aggregatedNodes.map((c) => {
            c.layout = layout.aggregated;
            this.hideBranch(c,true);
          });
          events.fire(FILTER_CHANGED_EVENT,{});
        }



        this.graph.nodes.map((n) => n.visited = false);
        this.layoutTree();
        this.updateEdgeInfo();
        this.exportYValues();
        this.drawTree(false);

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
        return d.layout === layout.aggregated ? xScale(xpos) + this.radius : (d.mode === mode.level ? xScale(d.xx) : xScale(d.xx) + this.radius);
      })
      .attr('y', (d) => {
        const ypos = d.yy + .5 - (1 / 3 * ((d.xx - 1) % 3 + 1) * this.yScale.invert(18));
        return d.layout === layout.aggregated ? yScale(ypos) : yScale(d.yy);
      })
      .on('end', (d, i) => {

        // console.log(i,select('.nodes').selectAll('text').size())
        if (i >= select('.nodes').selectAll('text').size() - 1) {
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



  private addHightlightBars() {

    // selectAll('.title')
    //   .on('mouseover', highlightRows);

    // const t = transition('t').duration(500).ease(easeLinear);

    const highlightBarGroup = select('#genealogyTree').select('#highlightBars');

    const yRange: number[] = [min(this.graph.nodes.filter((n)=>n.visible), function (d: any) {
      return Math.round(d.yy);
    }), max(this.graph.nodes.filter((n)=>n.visible), function (d: any) {
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
        data: yNodes[0], yy: i, xx: min(yNodes, (d: any) => {return d.xx;})
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


    allBars
      .select('.backgroundBar')
      .attr('width', () => {
        const range = this.xScale.range();
        return (max([range[0], range[1]]) - min([range[0], range[1]]) + this.margin.right + this.padding.right);
      })
      .attr('height', Config.glyphSize * 2);

    allBars
      .select('.highlightBar')
      .attr('width', (row: any) => {
        const range = this.xScale.range();
        return (max([range[0], range[1]]) - this.xScale(row.xx) + this.margin.right + this.padding.right);
      })
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
                const remove = d.children.filter((c)=>c.visible).length > 0;
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
                      events.fire(ADJ_MATRIX_CHANGED, { 'db': this.selectedDB, 'name': d.title, 'uuid': d.uuid, 'remove': removeAdjMatrix });
                    }
                  }];

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
                  const aggregate = !(d.children.find((c) => c.nodeType === nodeType.levelSummary));
                  actions = actions.concat(
                    [{
                      'icon': 'Aggregate', 'string': aggregate ? 'Aggregate Children' : 'Un-Aggregate Children', 'callback': () => {
                        events.fire(AGGREGATE_CHILDREN, { 'uuid': d.uuid, 'aggregate': aggregate });
                      }
                    }]
                  );
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

          // element.attr('clip-path', (dd: any) => {
          //   const st = this.createID(dd.source.title);
          //   const tt = this.createID(dd.target.title);
          //   return 'url(#' + st + '_' + tt + ')';
          // });

          // element.attr('mask', (dd: any) => {
          //   const st = this.createID(this.graph.nodes[dd.source].title);
          //   const tt = this.createID(this.graph.nodes[dd.target].title);
          // const st = this.createID(dd.source.title);
          // const tt = this.createID(dd.target.title);

          //   return 'url(#m_' + st + '_' + tt + ')';
          // });
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
      const className = 'starRect_' + this.createID(d.data.title);
      select('.' + className).attr('opacity', .2);
    }

  }

  private clearHighlights() {
    // selectAll('.aggregateLabel').attr('visibility', 'hidden');
    selectAll('.highlightBar').attr('opacity', 0);
    selectAll('.starRect').attr('opacity', 0);
  }


  private createID(title) {
    return title.replace(/ /g, '_').replace(/\./g, '').replace(/\?/g, '').replace(/\:/g, '').replace(/\(/g, '').replace(/\)/g, '').replace(/\'/g, '').replace(/\&/g, '').replace(/\//g, '').replace(/\,/g, '');
  }


  private toggleExpand(d,selector) {
    const selectedItem = selectAll(selector).filter((m:any)=> m.uuid === d.uuid);
    const hide = d.children.filter((c) => c.visible && c.layout === layout.expanded).length > 0;

    selectedItem.text((d: any) => {
      return hide ? Config.icons.arrowDown : Config.icons.arrowRight;
    });

    if (hide) {
      //hide all children;
      this.hideBranch(d,true);
      events.fire(FILTER_CHANGED_EVENT,{});
    } else {
      //check if node already has hidden children in the graph
      if (d.children.filter((c) => c.visible === false).length > 0) {
        this.hideBranch(d,false);
         events.fire(FILTER_CHANGED_EVENT,{});
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
      y: end+ .3
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

      n.yy = n.layout === layout.aggregated ? n.aggParent.yy : (n.nodeType === nodeType.levelSummary ? start + (end-start)/ 2 : n.yy);
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

    this.graph.nodes.filter((n) =>n.visible).forEach((node) => {
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
