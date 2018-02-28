import * as events from 'phovea_core/src/event';

import {
  DB_CHANGED_EVENT, LAYOUT_CHANGED_EVENT
} from './headers';

import {
  SUBGRAPH_CHANGED_EVENT, FILTER_CHANGED_EVENT
} from './setSelector';

import { TABLE_VIS_ROWS_CHANGED_EVENT, COL_ORDER_CHANGED_EVENT, ADJ_MATRIX_CHANGED, AGGREGATE_CHILDREN, ATTR_COL_ADDED, PATHWAY_SELECTED, TREE_PRESERVING_SORTING } from './tableManager';

import { VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT, VALUE_TYPE_REAL, VALUE_TYPE_STRING } from 'phovea_core/src/datatype';

import { VALUE_TYPE_ADJMATRIX } from './attributeTable';


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


enum sortedState {
  Ascending,
  Descending,
  Unsorted
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



    events.on(REPLACE_EDGE_EVENT, (evt, info) => {

      //replace parent of selected target as source
      const source = this.graph.nodes.filter((node) => { return node.uuid === info.source; })[0];
      const target = this.graph.nodes.filter((node) => { return node.uuid === info.target; })[0];

      const childNode = [source, target].reduce((acc, cValue) => { return cValue.yy > acc.yy ? cValue : acc; });
      const parentNode = [source, target].reduce((acc, cValue) => { return cValue.yy < acc.yy ? cValue : acc; });

      // console.log('child is ', childNode.title);
      // console.log('parent is ', parentNode.title);

      // console.log('source is ', source.title);
      // console.log('target is ', target.title);

      const oldParent = target.parent ? target.parent : source.parent;
      const child = target.parent ? target : source;

      //remove target from list of old parent's children
      const oldChild = oldParent.children.indexOf(child);
      console.log('oldChild', oldChild);
      oldParent.children.splice(oldChild, 1);

      //make old edge hidden
      //Do not add links that already exists in the tree
      const oldEdge = this.graph.links.filter((ll) => {
        return (ll.source.uuid === oldParent.uuid && ll.target.uuid === child.uuid && ll.edge.data.uuid !== info.uuid)
          || (ll.target.uuid === oldParent.uuid && ll.source.uuid === child.uuid && ll.edge.data.uuid !== info.uuid);
      })[0];
      console.log('oldEdge', oldEdge);

      oldEdge.visible = false;
      oldEdge.visited = true;

      if (!target.parent) {
        source.parent = undefined;
        this.graph.root = [source];
      }

      //Set new Parent and child;
      target.parent = source;
      source.children.push(target);


      //make new edge visible


      const newEdge = this.graph.links.filter((ll) => { return ll.edge.data.uuid === info.uuid;})[0];
      console.log('newEdge', newEdge);

      newEdge.visible = true;
      newEdge.visited = true;

      // console.log(oldParent,target,source,oldEdge,newEdge)

      this.graph.nodes.map((n) => n.visited = false);
      this.layoutEntireTree();
      this.updateEdgeInfo();
      this.exportYValues();
      this.drawTree();


    });

    events.on(ATTR_COL_ADDED, (evt,info)=> {
      
            if (info.remove) {
              this.tableManager.colOrder.splice(this.tableManager.colOrder.indexOf(info.name), 1);
              events.fire(COL_ORDER_CHANGED_EVENT);
            } else {

           const url = 'api/data_api/property/' + info.db + '/' + info.name ;
           console.log('url is ', url);
      
           const postContent = JSON.stringify({'treeNodes':this.graph ? this.graph.nodes.map((n)=> {return n.uuid;}):['']});
           
      
                  json(url)
                  .header('Content-Type', 'application/json')
                  .post(postContent,(error, resultObj: any) => {
                      if (error) {
                        throw error;
                      }
      
                      const nodes = resultObj.results;
                      const dataValues = nodes.map((e)=> {return isNaN(+e.value) ? e.value : +e.value ;});;
                      //infer type here:
                      const type = typeof dataValues[0]  === 'number' ? VALUE_TYPE_INT : VALUE_TYPE_STRING;
                        //Add fake vector here:
                       const arrayVector = arrayVec.create(type);
                      arrayVector.desc.name = info.name;
      
      
                      arrayVector.dataValues = dataValues;
                      arrayVector.idValues = nodes.map((e)=> {return e.uuid;});
      
                      arrayVector.desc.value.range = [min([max(arrayVector.dataValues),0]), max(arrayVector.dataValues)];
      
                      // console.log(arrayVector);
      
                      //if it's not already in there:
                      if (this.tableManager.adjMatrixCols.filter((a:any )=> {return a.desc.name === arrayVector.desc.name; }).length<1) {
                        this.tableManager.adjMatrixCols =this.tableManager.adjMatrixCols.concat(arrayVector); //store array of vectors
                      }
      
                      //if it's not already in there:
                      if (this.tableManager.colOrder.filter((a:any )=> {return a === arrayVector.desc.name; }).length<1) {
                        this.tableManager.colOrder = [arrayVector.desc.name].concat(this.tableManager.colOrder); // store array of names
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

      this.layoutEntireTree();
      this.updateEdgeInfo();
      this.exportYValues();
      this.drawTree();

    });

    events.on(TREE_PRESERVING_SORTING,(evt,info)=> {
      console.log('tree preserving aggregation fired')
      this.graph.nodes.map((n) => n.visited = false);
      this.layoutEntireTree(info);
      this.updateEdgeInfo();
      this.exportYValues();
      this.drawTree();
    })


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
      this.setAggregation(root, info.aggregate);
      this.graph.nodes.map((n) => n.visited = false);
      this.layoutEntireTree();
      this.updateEdgeInfo();
      this.exportYValues();
      this.drawTree();
    });

    events.on(FILTER_CHANGED_EVENT, (evt, info) => {
      //see if value is already in exclude;
      if (info.exclude) {
        this.exclude = this.exclude.concat(info.label);
      } else {
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
      this.extractTree([info.root]);
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

  public removeBranch(rootNode, rootOnly = false) {

    let toRemoveArray, childArray;
    if (rootOnly) {
      toRemoveArray = [rootNode];
      childArray = rootNode.children;
    } else {
      toRemoveArray = rootNode.children;
    }
    // remove all links to children
    toRemoveArray.forEach((node) => {
      //Only use recursive mode if removing children
      if (!rootOnly) {
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
      const rootNode = this.graph.nodes.filter((n) => { return n.uuid.toString() === root.toString(); });

      //recursive function to remove all nodes and edges down this branch;
      this.removeBranch(rootNode[0], !includeChildren);

      const roots = this.graph.nodes.filter((n) => { return this.graph.root.indexOf(n.uuid) > -1; });

      this.updateFilterPanel();

      // console.log('calling extract tree on ', roots[0], ' input root is ', rootNode[0])
      this.extractTree(roots.length > 0 ? roots : undefined, this.graph, false);

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

      // url = url + '?treeNodes=' + (this.graph ? this.graph.nodes.map((n)=> {return n.uuid;}) : '');

      console.log('url is ', url);

      const postContent = JSON.stringify({'treeNodes':this.graph ? this.graph.nodes.map((n)=> {return n.uuid;}):['']});

      json(url)
      .header('Content-Type', 'application/json')
      .post(postContent, (error, graph: any) => {
        if (error) {
          throw error;
        }
        console.log('data return is ', graph);

        //Replace graph or merge with incoming subgraph
        if (replace || !this.graph) {

          const newLinks = [];
          //update indexes to contain refs of the actual nodes;
          graph.links.forEach((link) => {
            const sourceNode = graph.nodes.filter((n) => { return n.uuid.toString() === link.source.uuid.toString(); })[0];
            const targetNode = graph.nodes.filter((n) => { return n.uuid.toString() === link.target.uuid.toString(); })[0];
            link.source = sourceNode;
            link.target = targetNode;
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
          console.log('filtered links',graph.links);


          this.graph = graph;
        } else {

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



        // this.interGenerationScale.range([.75, .25]).domain([2, this.graph.nodes.length]);

        const roots = this.graph.nodes.filter((n) => { return this.graph.root.indexOf(n.uuid) > -1; });



        this.updateFilterPanel();

        this.extractTree(roots.length > 0 ? roots : undefined, this.graph, false);

        this.exportYValues();

        if (this.layout === 'tree') {
          this.drawTree();
        } else {
          this.drawGraph();
        };


        resolvePromise();
      });
    }

    return p;
  };


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
        return '<tspan class="icon">' + Config.icons[d.name] + '</tspan> ' + d.name + ' [' + count + ']' ; //+  Config.icons.menu;
      });
  }

  //Function that extracts tree from Graph
  //takes in tgree parameters:
  // roots, which graph to extract, and whether to replace any existing tree.
  extractTree(roots = undefined, graph = this.graph, replace = true) {

    let setNewRoot = true;

    this.updateEdgeInfo();

    // if (roots === undefined) {
    //   console.log('undefined root');
    //   roots = graph.nodes.filter((n)=> {return n.uuid = graph.root;});
    // }

    //replace graph root with current root;
    // this.graph.root = roots;

    //Filter out all nodes to be excluded
    const excluded = this.exclude;

    //set default values for unvisited nodes;
    graph.nodes.map((n, i) => {
      n.index = i;
      n.visible = excluded.indexOf(n.label) > -1 ? false : true;
      n.visited = excluded.indexOf(n.label) > -1 ? true : false;
      n.children = [];
      n.parent = undefined;
      n.yy = undefined;
      n.xx = undefined;
    });



    // console.log(graph.nodes.map(n=>n.title))

    //set default values for unvisited links;
    graph.links.map((l, i) => {
      l.visible = (l.visited && !replace) ? l.visible : false;
      l.visited = (l.visited && !replace) ? l.visited : false;
      // l.index = i;
    });

    this.calculatePathway();
    // this.graph.nodes.map((n) => { n.visited = (n.pathway && n.moved) ? true : false; });

    const pathwayNodes = this.graph.nodes.filter((n) => n.pathway && n.moved);
    this.ypos = pathwayNodes.length > 0 ? +max(pathwayNodes, (n: any) => n.yy) : -1;

    // console.log(this.ypos)

    while (graph.nodes.filter((n) => {
      return n.visited === false;
    }).length > 0) {

      //Start with preferential root, then pick node with highest degree if none was supplied.
      const root = (roots && roots.filter((r) => { return !r.visited; }).length > 0) ? roots.filter((r) => { return !r.visited; })[0] :
        this.graph.nodes.filter((n) => {
          return n.visited === false;
        }).reduce((a, b) => this.nodeNeighbors[a.uuid].degree > this.nodeNeighbors[b.uuid].degree ? a : b);


      // If graph.root is empty, add the node with the highest degree.
      if (!roots && setNewRoot) {
        setNewRoot = false;
        this.graph.root = [root.uuid];
      };

      const maxY = max(this.graph.nodes, (n: any) => {
        return +n.yy;
      });

      //If root already has an x or y value, do not overwrite
      root.xx = root.xx && !replace ? root.xx : 0;
      root.yy = root.yy && !replace ? root.yy : (maxY > -1 ? maxY + 2 : 0);


      const queue = [root];

      // //BFS of the tree
      while (queue.length > 0) {
        const node = queue.splice(0, 1)[0];;
        this.extractTreeHelper(node, queue);
      }

      //clear visited status
      // this.graph.nodes.map((n)=>n.visited = false);
      this.layoutTree(root);
    }

    this.updateEdgeInfo();

    events.fire(TABLE_VIS_ROWS_CHANGED_EVENT);
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

                    const targetDictEntry = this.nodeNeighbors[targetNode.uuid];
                    const sourceDictEntry = this.nodeNeighbors[sourceNode.uuid];

                    targetDictEntry.degree = targetDictEntry.degree +1;
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
      data: this.graph.nodes.map((n, i) => { return { 'value': n.graphDegree, 'uuid': n.uuid, 'aggregated':n.aggregated }; }),
      ids: this.graph.nodes.map((n) => { return n.uuid; })
    };


    this.addArrayVec(vec);


    vec = {
      type: 'dataDensity',
      title: 'Tree Edges',
      data: this.graph.nodes.map((n, i) => { return { 'value': this.nodeNeighbors[n.uuid].degree, 'uuid': n.uuid, 'aggregated':n.aggregated }; }),
      ids: this.graph.nodes.map((n) => { return n.uuid; })
    };

    this.addArrayVec(vec);

    vec = {
      type: 'dataDensity',
      title: 'Hidden Edges',
      data: this.graph.nodes.map((n, i) => { return { 'value': this.nodeNeighbors[n.uuid].hidden, 'uuid': n.uuid, 'aggregated':n.aggregated }; }),
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
  extractTreeHelper(node, queue, evalFcn = undefined, depth = undefined) {

    // if (!node.visited) {
    node.visited = true;
    const edges = this.graph.links.filter((l) => {
      return l.target.uuid === node.uuid || l.source.uuid === node.uuid;
    });

    edges.map((e) => {

      const target = e.target;
      const source = e.source;


      if (!target.visited) {
        e.visible = e.visited ? e.visible : true;
        // console.log(e.source.title, e.target.title,e.visible);
        //only visit edge if there are no previous constraints on this edge visibility
        if (e.visible) {
          target.visited = true;
          target.parent = node;
          node.children.push(target);
          queue.push(target);
        }
      } if (!source.visited) {
        e.visible = e.visited ? e.visible : true;
        // console.log(e.source.title, e.target.title,e.visible);
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

  //function that iterates down branch and sets aggregate flag to true/false
  setAggregation(root, aggregate) {

    root.summary = {};
    root.hops = {};
    root.level = 0;
    const queue = [root];
    // //BFS of the tree
    while (queue.length > 0) {
      const node = queue.splice(0, 1)[0];;
      this.aggregateHelper(root, node, aggregate, queue);
    }
  }

  aggregateHelper(root, node, aggregate, queue) {
    const level = (node.level + 1).toString();
    node.children.map((c) => {
      if (root.summary[level]) {
        if (root.summary[level].indexOf(c.label) < 0) {
          root.summary[level].push(c.label);
        }
      } else {
        root.summary[level] = [c.label];
      }
    });

    node.children.map((c) => {
      c.aggregated = aggregate;
      c.level = node.level + 1;
      c.aggregateRoot = aggregate ? root : undefined;
      queue.push(c);
    });
  }


  layoutEntireTree(sortAttribute = undefined) {

    // this.graph.nodes.map((n) => { n.visited = (n.pathway && n.moved) ? true : false; });

    // const pathwayNodes = this.graph.nodes.filter((n)=> n.pathway && n.moved);
    // this.ypos = pathwayNodes.length >0 ? +max(pathwayNodes,(n:any)=> n.yy) : -1;
    this.ypos = -1;


    while (this.graph.nodes.filter((n) => {
      return n.visited === false;
    }).length > 0) {

      // const roots = this.graph.nodes.filter((n) => { return n.parent === undefined; });
      // const roots = this.graph.nodes.filter((n) => { return n.parent === undefined; });


      const roots = this.graph.nodes.filter((n) => { return this.graph.root.indexOf(n.uuid) > -1; });
      // console.log('roots are ', roots);
      //Start with preferential root, then pick node with highest degree if none was supplied.
      const root = (roots && roots.filter((r) => { return !r.visited; }).length > 0) ? roots.filter((r) => { return !r.visited; })[0] :
        this.graph.nodes.filter((n) => {
          return n.visited === false;
        }).reduce((a, b) => this.nodeNeighbors[a.uuid].degree > this.nodeNeighbors[b.uuid].degree ? a : b);

      // console.log('visiting root', root.title)
      root.xx = 0;
      this.layoutTree(root,sortAttribute);
    }
  }

  layoutTree(root,sortAttribute = undefined) {
    this.layoutTreeHelper(root,sortAttribute);
  }

  layoutTreeHelper(node,sortAttribute = undefined) {
    // console.log('visiting', node.title)
    // if (!node.visited) {
    node.visited = true;

    // if (!node.moved) {
    if (node.aggregated) {
      //find offset
      const levels = Object.keys(node.aggregateRoot.summary).map(Number)
        .filter((l) => { return l <= node.level; });

      const hops = levels.reduce((accumulator, level) => {
        const cValue = level < node.level ? node.aggregateRoot.summary[level.toString()].length
          : node.aggregateRoot.summary[level.toString()].indexOf(node.label);
        return accumulator + cValue;
      }, 1);
      node.yy = node.aggregateRoot.yy + hops;
      this.ypos = max([this.ypos, node.yy]);
    } else {
      this.ypos = this.ypos + 1;
      node.yy = this.ypos;
    }
    // }
    // }

    //sort Children by chosen attribute
    if (sortAttribute) {
      const data = sortAttribute.data;
      const ids = sortAttribute.ids;
      const sortOrder = sortAttribute.sortOrder;

      node.children.sort((a,b)=> { 
        const aloc = ids.findIndex((id)=> {return id.find((i)=> {return i === a.uuid;});});
        const bloc = ids.findIndex((id)=> {return id.find((i)=> {return i === b.uuid;});});

        a.value = data[aloc]; 
        b.value = data[bloc]; 

        if (sortOrder === sortedState.Ascending) {
            if (b.value === undefined || a.value < b.value) { console.log( ' 1 '); return -1; }
            if (a.value === undefined || a.value > b.value) { console.log( ' 2 ');return 1; }
            if (a.value === b.value) {
              if (a.index === b.index) {console.log( ' 3 '); return 0; }
              if (a.title < b.title) { console.log( ' 4 ');return -1; }
              if (a.title > b.title) { console.log( ' 5 ');return 1; }
            }
        } else {
            if (b.value === undefined || a.value > b.value) { console.log( ' 6 ');return -1; }
            if (a.value === undefined || a.value < b.value) { console.log( ' 7 ');return 1; }
            if (a.value === b.value) {
              if (a.title === b.title) { console.log( ' 8 ');return 0; }
              if (a.title < b.title) { console.log( ' 9 ');return -1; }
              if (a.title > b.title) { console.log( ' 10 ');return 1; }
            }
            if (a.value < b.value) { console.log( ' 11 ');return 1; }
        }
        
      });
    } else {
      //default sorting is alphabetical
      node.children.sort((a,b)=> { return a.title < b.title ? -1 : (a.title === b.title ? (a.uuid < b.uuid ? -1 : 1) : 1);});
    }
    
    //prioritize children that are part of a pathway
    node.children
      // .sort((a,b)=> {return a.pathway ? -1 :(b.pathway ? 1 : 0);})
      .map((c, i) => {
        let hops;
        if (c.aggregated) {
          const levels = Object.keys(c.aggregateRoot.summary).map(Number)
            .filter((l) => { return l <= c.level; });

          hops = levels.reduce((accumulator, level) => {
            const cValue = level < c.level ? c.aggregateRoot.summary[level.toString()].length
              : c.aggregateRoot.summary[level.toString()].indexOf(c.label);
            return accumulator + cValue;
          }, 1);

        }

        let maxX = +max(this.graph.nodes.filter((n: any) => (n.visited && c.aggregateRoot && n.yy === c.aggregateRoot.yy + hops)), (n: any) => n.xx);

        if (!maxX && c.aggregateRoot) {
          maxX = 0;
        }
        c.xx = c.aggregated ? maxX + 1 : node.xx + 1;

        this.layoutTreeHelper(c);
      });

  }

  drawTree() {
    const graph = this.graph;

    let link = this.svg.select('.visibleLinks')
      .selectAll('.edge')
      .data(graph.links.filter((l) => { return l.source.visible && !l.source.aggregated && !l.target.aggregated && l.target.visible && l.visible; }),
      (d) => {return d.edge.data.uuid;});

    let linksEnter = link
      .enter()
      .append('path')
      .attr('class', 'edge');

    link.exit().remove();

    let linkEndMarkers = this.svg.select('.endMarkers')
      .selectAll('.endMarker')
      .data(graph.nodes.filter((n)=> {
        return (!(n.children.length<1 && n.graphDegree<=n.degree)) && n.visible && !n.aggregated && n.visible;
      }),(d) => {return this.createID(d.title)+ '_endMarker';});

    const linkEndMarkersEnter = linkEndMarkers
      .enter()
      .append('text')
      .attr('class', 'endMarker');

    linkEndMarkers.exit().remove();

    linkEndMarkers = linkEndMarkers.merge(linkEndMarkersEnter);


    link = this.svg.select('.hiddenLinks')
      .selectAll('.edge')
      .data(graph.links.filter((l) => { return l.source.visible && l.target.visible && !l.visible; }),
      (d) => {return d.edge.data.uuid;});

    linksEnter = link
      .enter()
      .append('path')
      .attr('class', 'edge');



    link.exit().remove();
    // link = linksEnter.merge(link);


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
        return d.children.length > 0 ? Config.icons.arrowDown : Config.icons.arrowRight;
      })
      .on('click', function (d) {
        const remove = d.children.length > 0;
        select(this).text((d: any) => {
          return remove ? Config.icons.arrowDown : Config.icons.arrowRight;
        });

        events.fire(SUBGRAPH_CHANGED_EVENT, { 'db': self.selectedDB, 'rootID': d.uuid, 'replace': false, 'remove': remove });
      });

      //set initial position to parent
      linkEndMarkersEnter
      .attr('x', (d: any, i) => {
        return this.xScale(d.xx);
      })
      .attr('y', (d: any, i) => {
        return d.parent ? this.yScale(d.parent.yy) : this.yScale(d.yy);
      });



    linkEndMarkers
      .transition('t')
      .duration(1000)
      .attr('x', (d: any, i) => {
        return d.children.length > 0 ? this.xScale(d.xx) - 5 : this.xScale(d.xx) - 2;
      })
      .attr('y', (d: any, i) => {
        return this.yScale(d.yy) + 1;
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

        const areDescendantes = this.areDescendants(parentNode,childNode);

        let actions = [{
          'icon': 'edge', 'string': 'Add ' + parentNode.title + ' ---> ' + childNode.title +  ' edge' , 'callback': () => {
            events.fire(REPLACE_EDGE_EVENT, { 'source': parentNode.uuid, 'target': childNode.uuid, 'uuid':d.edge.data.uuid });
          }
        }];

        console.log(parentNode.title,childNode.title,areDescendantes);
        if (!areDescendantes) {
          actions = actions.concat({
            'icon': 'edge', 'string': 'Add ' + childNode.title + ' ---> ' + parentNode.title + ' edge', 'callback': () => {
              events.fire(REPLACE_EDGE_EVENT, { 'source': childNode.uuid, 'target': parentNode.uuid, 'uuid':d.edge.data.uuid });
            }});
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

    selectAll('.edge')
      .transition('t')
      .duration(1000)
      .attr('d', (d: any, i) => {
        return this.elbow(d, this.lineFunction, d.visible);
      });

    const aggregateRoots = graph.nodes.filter((n) => n.summary && n.children.length > 0 && n.children[0].aggregated);
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

          const yy = r.yy + hops; // + r.summary[l].indexOf(n)+1 ;
          aggregateIcons.push({ uuid: r.uuid + '_' + l + '_' + n, label: n, visible: true, aggregated: false, aggregateLabel:true, title: '', xx, yy });
        })

        );
      });
    });

    let node = this.svg.select('.nodes')
      .selectAll('.title')
      .data(graph.nodes.filter((n) => { return n.visible; }).concat(aggregateIcons), (d) => {
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

    node = nodesEnter.merge(node);

    node
      .html((d) => {
        return d.aggregated ? '<tspan class="icon">' + Config.icons.aggregateIcon + '</tspan>'
        : (d.aggregateLabel?  '<tspan class="aggregateLabel titleContent">' + d.label +  '</tspan> <tspan class="icon">' + Config.icons[d.label] + '</tspan> ' + '<tspan class="titleContent">' + d.title + '</tspan>'
        : '.<tspan class="icon">' + Config.icons[d.label] + '</tspan> ' + '<tspan class="titleContent">' + d.title + '</tspan>');
      });

    selectAll('.aggregateLabel')
    .attr('visibility','hidden');

    node
      .on('mouseover', (d: any) => {
        if (d.aggregated) {
          self.ttip.addTooltip('node', d);
        }
      })
      .on('mouseout', (d: any) => {
        if (d.aggregated) {
          select('#tooltipMenu').select('svg').remove();
        }
      });
    node.classed('aggregated', (n) => n.aggregated);


    node.append('title')
      .text(function (d) {
        return d.title;
      });


    node
      .transition('t')
      .duration(1000)
      // .attr('opacity',1)
      .attr('x', (d) => {
        const xpos = d.aggregated ? Math.floor((d.xx - 1) / 3) * this.xScale.invert(6) + d.aggregateRoot.xx + 1 + d.level * 0.6 : undefined;
        return d.aggregated ? xScale(xpos) : xScale(d.xx) + this.radius;
      })
      .attr('y', (d) => {
        const ypos = d.yy + .5 - (1 / 3 * ((d.xx - 1) % 3 + 1) * this.yScale.invert(18));
        return d.aggregated ? yScale(ypos) : yScale(d.yy);
      })
      .on('end', (d, i) => {

        // console.log(i,select('.nodes').selectAll('text').size())
        if (i >= select('.nodes').selectAll('text').size() - 1) {
          const nodeGroupWidth = document.getElementById('nodeGroup').getBoundingClientRect().width;
          console.log('here');
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

  areDescendants(parent,child,value=false) {
    if (parent.children.length<1) {
      return value || false;
    }

    if (parent.children.filter((c)=> {return c.uuid === child.uuid;}).length>0) {
      return true;
    } else {
      parent.children.map((c)=> {
        value = value || this.areDescendants(c,child,value);
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

    const yRange: number[] = [min(this.graph.nodes, function (d: any) {
      return Math.round(d.yy);
    }), max(this.graph.nodes, function (d: any) {
      return Math.round(d.yy);
    })];

    //Create data to bind to highlightBars
    const yData: any[] = [];
    for (let i = yRange[0]; i <= yRange[1]; i++) {
      //find all nodes in this row
      const yNodes = this.graph.nodes.filter((n: any) => {
        return Math.round(n.yy) === i;
      });

      // console.log(yNodes[0])
      // if (yNodes.length>0) {
      yData.push({
        //works for individual rows. Need to reconsider for aggregate rows.
        data: yNodes[0], yy: i, xx: min(yNodes, (d: any) => {
          return d.xx;
        })
        , id: yNodes[0].uuid
      });
      // }

    }

    //Create data to bind to aggregateBars
    const aggregateBarData: any[] = [];
    for (let i = yRange[0]; i <= yRange[1]; i++) {
      //find all nodes in this row
      const yNodes = this.graph.nodes.filter((n: any) => {
        return Math.round(n.yy) === i && n.aggregated;
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
          const remove = d.children.length > 0;
          const element = selectAll('.hiddenEdge').filter((dd: any) => {
            return dd.source.title === d.title || dd.target.title === d.title;
          });

          //for non aggregate rows only
          if (!d.aggregated) {
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
                const remove = d.children.length > 0;
                const removeAdjMatrix = this.tableManager.colOrder.indexOf(d.title) > -1;
                const removeAttr = this.tableManager.colOrder.indexOf('age') > -1;
                let actions = [
                  {
                    'icon': 'RemoveNode', 'string': 'Remove Node  (leaves children)', 'callback': () => {
                      events.fire(SUBGRAPH_CHANGED_EVENT, { 'db': this.selectedDB, 'rootID': d.uuid, 'replace': false, 'remove': true, 'includeChildren': false });
                    }
                  },
                  {
                    'icon': 'MakeRoot', 'string': 'Make Root', 'callback': () => {
                      // console.log(d);
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
                  const aggregate = d.children[0] && !d.children[0].aggregated;
                  actions = actions.concat(
                    [{
                      'icon': 'Aggregate', 'string': aggregate ? 'Aggregate Children' : 'Expand Children', 'callback': () => {
                        events.fire(AGGREGATE_CHILDREN, { 'uuid': d.uuid, 'aggregate': aggregate });
                      }
                    }]
                  );
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

    selectAll('.title').select('.aggregateLabel').filter((bar:any)=> {return bar.yy === d.yy;}).attr('visibility','visible');
    //Set opacity of corresponding highlightBar
    selectAll('.highlightBar').filter(selected).attr('opacity', .2);

    if (d.data) {
      const className = 'starRect_' + this.createID(d.data.title);
      select('.' + className).attr('opacity', .2);
    }

  }

  private clearHighlights() {
    selectAll('.aggregateLabel').attr('visibility','hidden');
    selectAll('.highlightBar').attr('opacity', 0);
    selectAll('.starRect').attr('opacity', 0);
  }


  private createID(title) {
    return title.replace(/ /g, '_').replace(/\./g, '').replace(/\:/g, '').replace(/\(/g, '').replace(/\)/g, '').replace(/\'/g, '').replace(/\&/g, '').replace(/\//g, '').replace(/\,/g, '');
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

  /**
   *
   * This function passes the newly computed y values to the tableManager
   *
   */
  private exportYValues() {

    //Create hashmap of personID to y value;
    const dict = {};

    this.graph.nodes.filter((n) => { return n.visible; }).forEach((node) => {
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
