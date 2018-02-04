import * as events from 'phovea_core/src/event';

import {
  DB_CHANGED_EVENT
} from './headers';

import {
  SUBGRAPH_CHANGED_EVENT
} from './setSelector';

import {
  select,
  selectAll,
  selection,
  mouse,
  event
} from 'd3-selection';
import {
  json
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
  forceCenter
} from 'd3-force';

import {
  Config
} from './config';

/** Class implementing the map view. */
class Graph {

  private tableManager;

  private width;
  private height;
  private radius;
  private color;

  private graph;

  private selectedDB;

  private svg;
  private simulation;

  private nodeNeighbors;

  private treeEdges = [];

  private ypos = 0;

  private padding = { left: 0, right: 300 };

  private t2 = transition('t').duration(600).ease(easeLinear);

  private xScale;
  private yScale;

  private margin = Config.margin;

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

    events.on(DB_CHANGED_EVENT, (evt, info) => {

      this.loadGraph(info.value);;
    });

    events.on(SUBGRAPH_CHANGED_EVENT, (evt, info) => {
      this.loadGraph(info.db, info.rootID, info.depth, info.replace,info.remove);;
    });


    this.tableManager = tmanager;
    this.width = width;
    this.height = 1000; // change to window height so force directed graph has room to breath;
    this.radius = radius;

    select(selector).append('div')
      .attr('id', 'graphHeaders');

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

    this.svg.append('g')
      .attr('class', 'links');

    this.svg.append('g')
      .attr('class', 'nodes');


    this.simulation = forceSimulation()
      .force('link', forceLink())
      .force('charge', forceManyBody().strength(-70))
      .force('center', forceCenter(this.width / 2, this.height / 2))
      .force('collision', forceCollide().radius((d) => {
        return this.radius * 3;
      }));

  }

  public removeBranch (rootNode){
    const toRemove = [];
    // remove all links to children
    rootNode.children.forEach((node) => {
        this.removeBranch(node);
        this.graph.links.forEach((link,i) => {
          if (link.source.uuid === node.uuid || link.target.uuid === node.uuid) {
            toRemove.push(i);
          }
        });
    });
    //remove all children of the root from this.graph.nodes
    rootNode.children.forEach((node) => {
      const index = this.graph.nodes.indexOf(node);
      this.graph.nodes.splice(index,1);
  });

     toRemove.sort().reverse(); //start @ the end of the array
     toRemove.map((l)=> {return this.graph.links.splice(l,1);});

    rootNode.children=[];

  }

  /**
   * Function that loads up the graph
   */
  public async loadGraph(db, root = undefined, depth = undefined, replace = true, remove = false) {

    this.selectedDB = db;

    let resolvePromise;
    let rejectPromise;
    const p = new Promise((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });

    if (remove) { 
      const rootNode = this.graph.nodes.filter((n) => { return n.uuid == root; });
      
      //recursive function to remove all nodes down this branch;
      this.removeBranch(rootNode[0]);

      const roots = this.graph.nodes.filter((n) => { return this.graph.root.indexOf(n.uuid) > -1; });
      this.extractTree(roots.length > 0 ? roots : undefined, this.graph, false);
      
            this.exportYValues();
      
            // this.drawGraph();
            this.drawTree();

      resolvePromise();
    } else {

    const url = root ? 'api/data_api/graph/' + db + '/' + root + '/' + depth : 'api/data_api/graph/' + db;

    json(url, (error, graph: any) => {
      if (error) {
        throw error;
      }

      console.log('url is', url);
      //Replace graph or merge with incoming subgraph
      if (replace || !this.graph) {
        //update indexes to contain refs of the actual nodes;
        graph.links.forEach((link) => {
          const sourceNode = graph.nodes.filter((n)=> {return n.uuid == link.source.uuid;})[0];
          const targetNode = graph.nodes.filter((n)=> {return n.uuid == link.target.uuid;})[0];
          link.source = sourceNode;
          link.target = targetNode;
        });

        this.graph = graph;
      } else {
        const rootNode = graph.nodes.filter((n) => { return n.uuid == graph.root; });

           const existingNodes = []; //nodes in the current subgraph that already exist in the tree
  
          graph.nodes.forEach((node) => {
            const eNode = this.graph.nodes.filter((n) => { return n.uuid === node.uuid; });
            if (eNode.length < 1) {
              this.graph.nodes = this.graph.nodes.concat(node);
            } else {
              existingNodes.push(eNode[0]);
            }
          });
  
          //only add root to array of roots if it does not already exist in the graph;
          if (this.graph.nodes.filter((n) => { return n.uuid == graph.root; }).length < 1) {
            this.graph.root = this.graph.root.concat(graph.root);
          };
  
          //update indexes
          graph.links.forEach((link) => {
            const sourceNode = this.graph.nodes.filter((n)=> {return n.uuid == link.source.uuid;})[0];
            const targetNode = this.graph.nodes.filter((n)=> {return n.uuid == link.target.uuid;})[0];
            
            link.source = sourceNode;
            link.target = targetNode;

            //Set link visibility to hidden if the node already exists
            if (existingNodes.indexOf(sourceNode) > -1 && existingNodes.indexOf(targetNode) > -1) {
              link.visible = false;
              link.visited = true;
              // console.log('setting link to hidden ', 's', sourceNode.title, 't', targetNode.title);
            } else { //set the visibility to true if the link is directly with the root
              if (sourceNode.uuid === rootNode[0].uuid || targetNode.uuid === rootNode[0].uuid) {
                link.visible = true;
                link.visited = true;
              } else {
                link.visible = false;
                link.visited = true;
              }
            }
  
            //Do not add link to parent (already exists in the tree)
            if (sourceNode !== targetNode.parent  && targetNode !== sourceNode.parent) {
              this.graph.links = this.graph.links.concat([link]);
            };
  
          });
        }
        
      

      this.interGenerationScale.range([.75, .25]).domain([2, this.graph.nodes.length]);

      //create dictionary of nodes with
      //1) set of adjacent nodes in the graph
      this.nodeNeighbors = {};
      this.graph.nodes.map((n, i) => {
        this.nodeNeighbors[n.uuid] = {
          'neighbors': new Set(),
          'degree': 0
        };
      });

      //Populate dictionary
      //Find all edges that start or end on that node
      this.graph.links.map((l) => {

        const targetNode = l.target;
        const sourceNode = l.source;

        const targetDictEntry = this.nodeNeighbors[targetNode.uuid];
        const sourceDictEntry = this.nodeNeighbors[sourceNode.uuid];

        targetDictEntry.neighbors.add(sourceNode);
        targetDictEntry.degree = targetDictEntry.neighbors.size;

        sourceDictEntry.neighbors.add(sourceNode);
        sourceDictEntry.degree = sourceDictEntry.neighbors.size;
      });

      const roots = this.graph.nodes.filter((n) => { return this.graph.root.indexOf(n.uuid) > -1; });

      this.extractTree(roots.length > 0 ? roots : undefined, this.graph, false);

      this.exportYValues();

      // this.drawGraph();
      this.drawTree();


      resolvePromise();
    });
  }

    return p;
  };


  //Function that extracts tree from Graph
  //takes in tgree parameters:
  // roots, which graph to extract, and whether to replace any existing tree.
  extractTree(roots = undefined, localGraph = this.graph, replace = true) {

    //set default values for unvisited nodes;
    localGraph.nodes.map((n, i) => {
      // if (replace) {
        n.index = i;
        n.visited = false;
        n.children = [];
        n.parent = undefined;
        n.y = undefined;
        n.x = undefined;
      // }
    });

    //set default values for unvisited links;
    localGraph.links.map((l, i) => {
        l.visible = (l.visited && !replace) ? l.visible : false;
        l.visited = (l.visited && !replace) ? l.visited : false;
        l.index = i;
    });
      this.ypos = 0;


    while (localGraph.nodes.filter((n) => {
      return n.visited === false;
    }).length > 0) {

      
      //Start with preferential root, then pick node with highest degree if none was supplied.
      const root = (roots.filter((r) => { return !r.visited;}).length > 0) ? roots.filter((r) => { return !r.visited; })[0] :
        this.graph.nodes.filter((n) => {
          return n.visited === false;
        }).reduce((a, b) => this.nodeNeighbors[a.index].degree > this.nodeNeighbors[b.index].degree ? a : b); //potential problem with indexing if this is on a subset of the graph
      const maxY = max(this.graph.nodes, (n: any) => {
        return +n.y;
      });

      //If root already has an x or y value, do not overwrite
      root.x = root.x && !replace ? root.x : 0;
      root.y = root.y && !replace ? root.y : (maxY > -1 ? maxY + 2 : 0);


      const queue = [root];

      // //BFS of the tree
      while (queue.length > 0) {
        const node = queue.splice(0, 1)[0];;
        this.extractTreeHelper(node, queue);
      }
      this.layoutTree(root);
    }
  }

  // recursive helper function to extract tree from graph
  extractTreeHelper(node, queue, evalFcn = undefined, depth = undefined) {

    // if (!node.visited) {
      node.visited = true;
      const edges = this.graph.links.filter((l) => {
        // return l.target === node.index || l.source === node.index;
        return l.target.uuid === node.uuid || l.source.uuid === node.uuid;
      });
  
      // console.log('there are ',  edges.length , ' edges connected to ', node.title)
  
      edges.map((e) => {
        
        // const target = this.graph.nodes[e.target];
        // const source = this.graph.nodes[e.source];
        const target = e.target;
        const source = e.source;
  
        if (!target.visited) {
          e.visible = e.visited ? e.visible : true;
          //only visit edge if there are no previous constraints on this edge visibility
          if (e.visible) {
           target.visited = true;
           target.parent=node;
           node.children.push(target);
           queue.push(target);
          }
        } else if (!source.visited) {
          e.visible = e.visited ? e.visible : true;
          //only visit edge if there are no previous constraints on this edge visibility
          if (e.visible) {
            source.visited = true;
            source.parent=node;
            node.children.push(source);
            queue.push(source);
          }
        }

        e.visited = true;
      });
    // }
    
  }

  layoutTree(root) {
    this.layoutTreeHelper(root);
  }

  layoutTreeHelper(node) {

      node.y = this.ypos;
      this.ypos = this.ypos + 1;

    node.children.map((c) => {
      c.x = node.x + 1;
      this.layoutTreeHelper(c);
    });

  }

  drawTree() {

    const graph = this.graph;

    let link = this.svg.select('.links')
      .selectAll('.edge')
      .data(graph.links, (d) => {
        return d.index;
      });

    const linksEnter = link
      .enter()
      .append('path')
      .attr('class', 'edge');

    link.exit().remove();

    link = linksEnter.merge(link);

    const maxX = max(graph.nodes, (n: any) => {
      return +n.x;
    });
    const maxY = max(graph.nodes, (n: any) => {
      return +n.y;
    });

    // this.height = maxY * 22;

    const yrange: number[] = [min(graph.nodes, function (d: any) {
      return Math.round(d.y);
    }), max(graph.nodes, function (d: any) {
      return Math.round(d.y);
    })];

    this.height = Config.glyphSize * 4 * (yrange[1] - yrange[0] + 1); // - this.margin.top - this.margin.bottom;


    select('#graph').select('svg').attr('height', this.height);

    const xScale = scaleLinear().domain([0, maxX]).range([this.padding.left, this.width - this.padding.right - this.padding.left]);
    const yScale = scaleLinear().range([0, this.height * .7]).domain(yrange);

    this.xScale = xScale;
    this.yScale = yScale;

    let linkClips = this.svg.select('defs')
      .selectAll('clipPath')
      .data(graph.links.filter((l) => { return !l.visible; }), (d) => {
        return d.index;
      });

    const linkClipsEnter = linkClips.enter()
      .append('clipPath')
      .attr('id', (d) => {
        // const st = this.createID(this.graph.nodes[d.source].title);
        // const tt = this.createID(this.graph.nodes[d.target].title);
        const st = this.createID(d.source.title);
        const tt = this.createID(d.target.title);
        return st + '_' + tt;
      });

    linkClipsEnter
      .append('circle')
      .attr('id', 'sourceCircle');

    linkClipsEnter
      .append('circle')
      .attr('id', 'targetCircle');

    linkClips.exit().remove();

    linkClips = linkClips.merge(linkClipsEnter);


    linkClips.select('#sourceCircle')
      // .attr('cx', (d) => { return xScale(this.graph.nodes[d.source].x); })
      // .attr('cy', (d) => { return yScale(this.graph.nodes[d.source].y); })
      .attr('cx', (d) => { return xScale(d.source.x); })
      .attr('cy', (d) => { return yScale(d.source.y); })
      .attr('r', this.radius * 0.9);


    linkClips.select('#targetCircle')
      // .attr('cx', (d) => { return xScale(this.graph.nodes[d.target].x); })
      // .attr('cy', (d) => { return yScale(this.graph.nodes[d.target].y); })
      .attr('cx', (d) => { return xScale(d.target.x); })
      .attr('cy', (d) => { return yScale(d.target.y); })
      .attr('r', this.radius * 0.9);


    this.svg.select('defs')
      .selectAll('mask').remove();

    let linkMasks = this.svg.select('defs')
      .selectAll('mask')
      .data(graph.links.filter((l) => { return !l.visible; }), (d) => {
        return d.index;
      });

    const linkMasksEnter = linkMasks.enter()
      .append('mask')
      .attr('id', (d) => {
        // const st = this.createID(this.graph.nodes[d.source].title);
        // const tt = this.createID(this.graph.nodes[d.target].title);
        const st = this.createID(d.source.title);
        const tt = this.createID(d.target.title);
        return 'm_' + st + '_' + tt;
      });

    linkMasksEnter
      .append('circle')
      .attr('id', 'sourceCircleMask')
      .attr('r', this.radius * 2)
      .attr('fill', 'url(#radialGrad)');
    // .attr('fill','#df5555');

    linkMasksEnter
      .append('circle')
      .attr('id', 'targetCircleMask')
      .attr('r', this.radius * 2)
      // .attr('fill','#df5555');
      .attr('fill', 'url(#radialGrad)');

    linkMasks.exit().remove();
    linkMasks = linkMasks.merge(linkMasksEnter);

    link
      .classed('visible', (d) => {
        return d.visible ? true : false;
      })
      .classed('hiddenEdge', (d) => {
        return d.visible ? false : true;
      });


    selectAll('.hiddenEdge')
      .attr('clip-path', (d: any) => {
        // const st = this.createID(this.graph.nodes[d.source].title);
        // const tt = this.createID(this.graph.nodes[d.target].title);
        const st = this.createID(d.source.title);
        const tt = this.createID(d.target.title);
        return 'url(#' + st + '_' + tt + ')';
      })
      // .attr('mask', (d: any) => {
      //   const st = this.createID(this.graph.nodes[d.source].title);
      //   const tt = this.createID(this.graph.nodes[d.target].title);
      //   return 'url(#m_' + st + '_' + tt + ')';
      // })
      .attr('marker-end', '')
      .attr('marker-start', '');

    linkMasks.select('#sourceCircleMask')
      // .attr('cx', (d) => { return xScale(this.graph.nodes[d.source].x); })
      // .attr('cy', (d) => { return yScale(this.graph.nodes[d.source].y); })
      .attr('cx', (d) => { return xScale(d.source.x); })
      .attr('cy', (d) => { return yScale(d.source.y); })      
      .attr('r', this.radius);

    linkMasks.select('#targetCircleMask')
      // .attr('cx', (d) => { return xScale(this.graph.nodes[d.target].x); })
      // .attr('cy', (d) => { return yScale(this.graph.nodes[d.target].y); })
      .attr('cx', (d) => { return xScale(d.source.x); })
      .attr('cy', (d) => { return yScale(d.source.y); })
      .attr('r', this.radius);


    selectAll('.visible')
      .attr('marker-end', 'url(#circleMarker)')
      .attr('marker-start', 'url(#circleMarker)');

    selectAll('.hiddenEdge')
      .attr('marker-end', 'url(#edgeCircleMarker)')
      .attr('marker-start', 'url(#edgeCircleMarker)');


    link
      .transition('t')
      .duration(1000)
      .attr('d', (d) => {
        return this.elbow(d, this.interGenerationScale, this.lineFunction, d.visible === true);
      });




    let node = this.svg.select('.nodes')
      .selectAll('.title')
      .data(graph.nodes, (d) => {
        return d.index;
      });

    const nodesEnter = node.enter()
      .append('text')
      .attr('class', 'title')
      .attr('alignment-baseline', 'middle');


    node.exit().remove();

    node = nodesEnter.merge(node);

    node
      .text((d) => { return Config.icons[d.label] + ' ' + d.title + ' (' + this.nodeNeighbors[d.uuid].degree + ')'; })
      .on('click', (d) => {
        console.log(d)
        events.fire(SUBGRAPH_CHANGED_EVENT,{'db':this.selectedDB,'rootID':d.uuid,'depth':1,'replace':false,'remove':d.children.length>0});

        // // extractTree(roots = undefined, localGraph = this.graph, replace = true)
        // this.extractTree([d]);
        // this.drawTree();
      })
      .on('contextmenu', (d) => {
        console.log('right click')
        // extractTree(roots = undefined, localGraph = this.graph, replace = true)
        // this.extractTree([d]);
        // this.drawTree();
      });

    node.on('mouseover', (d) => {
      const element = selectAll('.hiddenEdge').filter((dd: any) => {
        // return this.graph.nodes[dd.source].title === d.title || this.graph.nodes[dd.target].title === d.title;
        return dd.source.title === d.title || dd.target.title === d.title;
      });

      element.attr('clip-path', 'undefined');
      element.attr('mask', 'undefined');
    })
      .on('mouseout', (d) => {

        const element = selectAll('.hiddenEdge').filter((dd: any) => {
          // return this.graph.nodes[dd.source].title === d.title || this.graph.nodes[dd.target].title === d.title;
          return dd.source.title === d.title || dd.target.title === d.title;
        });

        element.attr('clip-path', (dd: any) => {
          // const st = this.createID(this.graph.nodes[dd.source].title);
          // const tt = this.createID(this.graph.nodes[dd.target].title);
          const st = this.createID(dd.source.title);
          const tt = this.createID(dd.target.title);
          return 'url(#' + st + '_' + tt + ')';
        });

        // element.attr('mask', (dd: any) => {
        //   const st = this.createID(this.graph.nodes[dd.source].title);
        //   const tt = this.createID(this.graph.nodes[dd.target].title);
        // const st = this.createID(dd.source.title);
        // const tt = this.createID(dd.target.title);
        
        //   return 'url(#m_' + st + '_' + tt + ')';
        // });

      });


    // .on('mouseover', (d) => { console.log(d); });
    //   .on('mouseover', (d) => {
    //     // d3.selectAll('.hiddenEdge').attr('display','none');
    //     // console.log(d);
    //     let hiddenEdges = d3.selectAll('.hiddenEdge').filter((e) => {
    //       return e.source == d.index || e.target == d.index
    //     });
    //     hiddenEdges.attr('display', 'inherit');
    //   })

    node.append('title')
      .text(function (d) {
        return d.title;
      });


    node
      .transition('t')
      .duration(1000)
      // .attr('cx', (d) => {
      //   return xScale(d.x);
      // })
      // .attr('cy', (d) => {
      //   return yScale(d.y);
      // });
      .attr('x', (d) => {
        // const bbox = select(d).node().getBoundingClientRect();
        // console.log('bbox',bbox);
        return xScale(d.x) + this.radius;
      })
      .attr('y', (d) => {
        return yScale(d.y);
      });

    // d3.selectAll('.hiddenEdge').attr('display', 'none');

    this.addHightlightBars();

    select('#graph')
      .attr('height', document.getElementById('genealogyTree').getBoundingClientRect().height);

  }

  drawGraph() {

    const graph = this.graph;

    const link = this.svg.select('.links')
      .selectAll('line')
      .data(graph.links)
      .enter()
      .append('line')
      .attr('class', 'visible');



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

    const node = this.svg.select('.nodes')
      // .selectAll('circle')
      .selectAll('.title')
      .data(graph.nodes)
      .enter()
      .append('text')
      .attr('class', 'title')
      .text((d) => { return d.label === 'movie' ? d.title + '  \uf008' : d.title + '  \uf007'; })




      // .append('circle')
      // .attr('r', (d) => {
      //   return d.label === 'actor' ? 7 : 10;
      // })
      // .attr('fill', (d, i) => {
      //   console.log(this.color(0), this.color(1), this.color(20));
      //   return (d.label === 'actor' ? this.color(2) : this.color(10));
      // })
      .call(drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    node.append('title')
      .text(function (d) {
        return d.title;
      });


    const ticked = (e) => {
      const k = 6 * this.simulation.alpha();

      // Push sources up and targets down to form a weak tree.
      link
        .each(function (d) {
          d.source.y += k;
          d.target.y -= k;
        })
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


      // node.attr('cx', (d) => {
      //   return d.x = Math.max(this.radius, Math.min(this.width - this.radius, d.x));
      // })
      //   .attr('cy', (d) => {
      //     return d.y = Math.max(this.radius, Math.min(this.height - this.radius, d.y));
      //   });

      node.attr('x', (d) => {
        return d.x = Math.max(this.radius, Math.min(this.width - this.radius, d.x));
      })
        .attr('y', (d) => {
          return d.y = Math.max(this.radius, Math.min(this.height - this.radius, d.y));
        });

    };

    this.simulation
      .nodes(this.graph.nodes)
      .on('tick', ticked);

    this.simulation.force('link')
      .links(graph.links);
  }

  private addHightlightBars() {

    // const t = transition('t').duration(500).ease(easeLinear);

    const highlightBarGroup = select('#genealogyTree').select('#highlightBars');

    const yRange: number[] = [min(this.graph.nodes, function (d: any) {
      return Math.round(d.y);
    }), max(this.graph.nodes, function (d: any) {
      return Math.round(d.y);
    })];

    //Create data to bind to highlightBars
    const yData: any[] = [];
    for (let i = yRange[0]; i <= yRange[1]; i++) {
      //find all nodes in this row
      const yNodes = this.graph.nodes.filter((n: any) => {
        return Math.round(n.y) === i;
      });

      // console.log(yNodes[0])
      // if (yNodes.length>0) {
      yData.push({
        y: i, x: min(yNodes, (d: any) => {
          return d.x;
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
        return Math.round(n.y) === i && n.aggregated;
      });
      if (yNodes.length > 0) {
        aggregateBarData.push({
          y: i, x: min(yNodes, (d: any) => {
            return d.x;
          })
        });
      }

    }

    // Attach aggregateBars
    let aggregateBars = highlightBarGroup.selectAll('.aggregateBar')
      .data(aggregateBarData, (d) => { return d.y; });


    aggregateBars.exit().remove();

    const aggregateBarsEnter = aggregateBars
      .enter()
      .append('rect')
      .classed('aggregateBar', true)
      .attr('opacity', 0);

    aggregateBars = aggregateBarsEnter.merge(aggregateBars);

    aggregateBars
      // .transition(t)
      .attr('transform', (row: any) => {
        return 'translate(0,' + (this.yScale(row.y) - Config.glyphSize * 1.25) + ')';
      })
      .attr('width', (row: any) => {
        const range = this.xScale.range();
        return (max([range[0], range[1]]) - this.xScale(row.x) + this.margin.right);
      })
      .attr('x', (row: any) => {
        return this.xScale(row.x);
      })
      .attr('height', Config.glyphSize * 2.5);


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
        return 'translate(0,' + (this.yScale(row.y) - Config.glyphSize) + ')';
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
        return (max([range[0], range[1]]) - this.xScale(row.x) + this.margin.right + this.padding.right);
      })
      .attr('x', (row: any) => {
        return this.xScale(row.x);
      })
      .attr('height', Config.glyphSize * 2);


    //Set both the background bar and the highlight bar to opacity 0;
    selectAll('.bars')
      .selectAll('.backgroundBar')
      .attr('opacity', 0);

    selectAll('.bars')
      .selectAll('.highlightBar')
      .attr('opacity', 0);

    function highlightRows(d: any) {

      function selected(e: any) {
        let returnValue = false;
        //Highlight the current row in the graph and table

        if (e.y === Math.round(d.y)) {
          returnValue = true;
        }
        return returnValue;
      }

      selectAll('.slopeLine').classed('selectedSlope', false);

      selectAll('.slopeLine').filter((e: any) => {

        return e.y === Math.round(d.y);
      }).classed('selectedSlope', true);

      //Set opacity of corresponding highlightBar
      selectAll('.highlightBar').filter(selected).attr('opacity', .2);

      //Set the age label on the lifeLine of this row to visible
      selectAll('.ageLineGroup').filter((e: any) => {
        return e.y === Math.round(d.y);
      }).filter((d: any) => {
        return !d.aggregated && !d.hidden;
      }).select('.ageLabel').attr('visibility', 'visible');

      // selectAll('.duplicateLine').filter(selected).attr('visibility', 'visible');
    }

    function clearHighlights() {
      // selectAll('.duplicateLine').attr('visibility', 'hidden');

      selectAll('.slopeLine').classed('selectedSlope', false);

      //Hide all the highlightBars
      selectAll('.highlightBar').attr('opacity', 0);

      selectAll('.ageLabel').attr('visibility', 'hidden');
    }


    selectAll('.highlightBar')
      .on('mouseover', highlightRows)
      .on('mouseout', clearHighlights)
      .on('click', (d: any, i) => {
        if (event.defaultPrevented) { return; } // dragged

        const wasSelected = selectAll('.highlightBar').filter((e: any) => {
          return e.y === d.y || e.y === Math.round(d.y);
        }).classed('selected');


        //'Unselect all other background bars if ctrl was not pressed
        if (!event.metaKey) {
          selectAll('.slopeLine').classed('clickedSlope', false);
          selectAll('.highlightBar').classed('selected', false);
        }

        selectAll('.slopeLine').filter((e: any) => {
          return e.y === d.y || e.y === Math.round(d.y);
        }).classed('clickedSlope', function () {
          return (!wasSelected);
        });

        selectAll('.highlightBar').filter((e: any) => {
          return e.y === d.y || e.y === Math.round(d.y);
        }).classed('selected', function () {
          return (!wasSelected);
        });
      });

    selectAll('.bars')
      .selectAll('.backgroundBar')
      .on('mouseover', highlightRows)
      .on('mouseout', clearHighlights);

  }


  private createID(title) {
    return title.replace(/ /g, '_').replace(/'/g, '').replace(/\(/g, '').replace(/\)/g, '');
  }





  private elbow(d, interGenerationScale, lineFunction, curves) {

    // let source = this.graph.nodes[d.source];
    // let target = this.graph.nodes[d.target];

    let source = d.source;
    let target = d.target; 

    if (source.x < target.x) {
      const t = target;
      target = source;
      source = t;
    }
    const xdiff = source.x - target.x;
    const ydiff = source.y - target.y;
    let nx = source.x - xdiff * interGenerationScale(ydiff);

    let linedata;
    if (curves) {
      nx = source.x - xdiff;
      linedata = [{
        x: source.x,
        y: source.y
      },
      {
        x: nx,
        y: source.y
      },
      {
        x: nx,
        y: target.y
      },
      {
        x: target.x,
        y: target.y
      }];
    } else {
      linedata = [{
        x: source.x,
        y: source.y
      },
      {
        x: target.x,
        y: target.y
      }];
    }

    if (curves) {
      lineFunction.curve(curveBasis);
    } else {
      lineFunction.curve(curveLinear);
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

    this.graph.nodes.forEach((node) => {
      if ((node.uuid) in dict) {
        dict[node.uuid].push(Math.round(node.y));
      } else {
        dict[node.uuid] = [Math.round(node.y)];
      }
    });

    //Assign y values to the tableManager object
    this.tableManager.yValues = dict;
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
