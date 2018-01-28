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

/** Class implementing the map view. */
class Graph {

  private width;
  private height;
  private radius;
  private color;

  private graph;

  private svg;
  private simulation;

  private nodeNeighbors;

  private treeEdges;

  private ypos = 0;

  private padding = { left: 150, right: 100 };

  private t2 = transition('t').duration(600).ease(easeLinear);

  private xScale;
  private yScale;

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
  constructor(width, height, radius, selector) {
    this.width = width;
    this.height = height;
    this.radius = radius;

    this.svg = select(selector).append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('pointer-events', 'all');

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
      .attr('offset', '30%');

      radGrad.append('stop')
      .attr('stop-opacity', '1')
      .attr('stop-color', 'white')
      .attr('offset', '31%');

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
      .attr('markerWidth', this.radius)
      .attr('markerHeight', this.radius)
      .attr('refX', 2)
      .attr('refY', 2);

    marker.append('circle')
      .attr('cx', 2)
      .attr('cy', 2)
      .attr('r', 2);

          //Used @ the start and end of edges
    const marker2 = svgDefs.append('marker')
    .attr('id', 'edgeCircleMarker')
    .attr('markerWidth', this.radius)
    .attr('markerHeight', this.radius)
    .attr('refX', 1.8)
    .attr('refY', 1.8);

    marker2.append('circle')
    .attr('cx', 1.8)
    .attr('cy',1.8)
    .attr('r', 1.8);

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

  /**
   * Function that loads up the graph
   */
  async loadGraph() {

    json('api/data_api/graph/got', (error, graph) => {
      if (error) {
        throw error;
      }

      this.graph = graph;

      this.interGenerationScale.range([.75, .25]).domain([2, this.graph.nodes.length]);

      //create dictionary of nodes with
      //1) set of adjacent nodes in the graph
      this.nodeNeighbors = {};
      // 2) list of visible adjacent nodes, ordered by degree
      // this.visibleNodeNeighbors = {};

      this.graph.nodes.map((n, i) => {
        this.nodeNeighbors[i] = {
          'neighbors': new Set(),
          'degree': 0
        };
        // this.visibleNodeNeighbors[i.toString()] = [];
      });

      //Populate dictionary
      //Find all edges that start or end on that node
      this.graph.links.map((l) => {
        const target = this.nodeNeighbors[l.target.toString()];
        const source = this.nodeNeighbors[l.source.toString()];

        target.neighbors.add(this.graph.nodes[l.source]);
        target.degree = target.neighbors.size;

        source.neighbors.add(this.graph.nodes[l.target]);
        source.degree = source.neighbors.size;
      });

      this.extractTree();

      // this.drawGraph();
      this.drawTree();
    });
  };


  //Function that extracts tree from Graph
  //takes in two parameters:
  // fcn that evaluates which edge to pick when traversing a graph and the depth of the tree to extract.
  extractTree(userChosenRoot = undefined, evalFcn = undefined, depth = undefined) {

    this.graph.nodes.map((n, i) => {
      n.index = i;
      n.visited = false;
      n.children = [];
      n.y = undefined;
      n.x = undefined;
    });

    this.graph.links.map((l, i) => {
      l.visible = false;
      l.index = i;
    });
    this.treeEdges = [];

    this.ypos = 0;

    while (this.graph.nodes.filter((n) => {
      return n.visited === false;
    }).length > 0) {

      //Pick node with highest degree if none was supplied.
      const root = (userChosenRoot && userChosenRoot.visited === false) ? userChosenRoot : this.graph.nodes.filter((n) => {
        return n.visited === false;
      }).reduce((a, b) => this.nodeNeighbors[a.index].degree > this.nodeNeighbors[b.index].degree ? a : b);

      // let root = this.graph.nodes[rootIndex];

      const maxY = max(this.graph.nodes, (n: any) => {
        return +n.y;
      });

      root.x = 0;
      root.y = maxY > -1 ? maxY + 2 : 0;
      root.visited = true;

      // this.root = root; //save root for easy tree traversal later;
      const queue = [root];

      // //BFS of the tree
      while (queue.length > 0) {
        const node = queue.splice(0, 1)[0];;
        // node.y = yPos + 1;
        // yPos = yPos + 1;
        this.extractTreeHelper(node, queue, evalFcn, depth);
      }

      // //DFS of the tree
      // while (queue.length>0) {
      //   const node = queue.splice(queue.length-1,1)[0];;
      //   // node.y = yPos +1;
      //   // yPos = yPos +1;
      //   this.extractTreeHelper(node, queue, evalFcn, depth);
      // }

      //   this.extractTreeHelper(root, evalFcn, depth)
      
      this.layoutTree(root);
    }

    //   this.graph.links = this.treeEdges;

  }

  // recursive helper function to extract tree from graph
  extractTreeHelper(node, queue, evalFcn = undefined, depth = undefined) {

    //Find all edges that start or end on that node
    node.visited = true;
    // node.yPos = yPos[0];
    // yPos[0] = yPos[0] + 1;

    const edges = this.graph.links.filter((l) => {
      return l.target === node.index || l.source === node.index;
    });

    edges.map((e) => {
      const target = this.graph.nodes[e.target];
      const source = this.graph.nodes[e.source];
      // console.log('target', target.title, 'source', source.title)

      if (!target.visited) {
        //   console.log('visiting target', target.title)
        // e.index = target.index;
        e.visible = true;

        this.treeEdges.push(e);
        target.visited = true;
        node.children.push(target);
        queue.push(target);
      } else if (!source.visited) {
        //   console.log('visiting source', source.title)
        // e.index = source.index;
        e.visible = true;
        this.treeEdges.push(e);
        source.visited = true;
        node.children.push(source);
        queue.push(source);
      }
    });
  }

  layoutTree(root) {
    this.layoutTreeHelper(root);
  }

  layoutTreeHelper(node) {

    node.y = this.ypos;
    this.ypos = this.ypos + 1;

    node.children.map((c) => {


      const xNodes = this.graph.nodes.filter((nn) => {
        return nn.x === node.x + 1;
      });

      const maxY = max(xNodes, (n: any) => {
        return n.y;
      });

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

  //   //Add markers for hidden edges
  //   let hiddenLinks = this.svg.select('.links')
  //   .selectAll('.hiddenLink')
  //   .data(graph.links.filter((l)=> {return !l.visible;}), (d) => {
  //     return d.index;
  //   });

  // const hiddenLinksEnter = hiddenLinks
  //   .enter();

  //   hiddenLinksEnter
  //   .append('circle')
  //   .attr('class', 'hiddenLink');

  //   hiddenLinksEnter
  //   .append('circle')
  //   .attr('class', 'hiddenLink');

  //   hiddenLinks.exit().remove();

  //   hiddenLinks = hiddenLinksEnter.merge(hiddenLinks);


    const maxX = max(graph.nodes, (n: any) => {
      return +n.x;
    });
    const maxY = max(graph.nodes, (n: any) => {
      return +n.y;
    });

    this.height = maxY * 22;

    const xScale = scaleLinear().domain([0, maxX]).range([this.padding.left, this.width - this.padding.right-this.padding.left]);
    const yScale = scaleLinear().domain([0, maxY]).range([20, this.height - 40]);

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
        const st = this.graph.nodes[d.source].title.replace(/ /g, '_').replace(/'/g, '');
        const tt = this.graph.nodes[d.target].title.replace(/ /g, '_').replace(/'/g, '');
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
      .attr('cx', (d) => { return xScale(this.graph.nodes[d.source].x); })
      .attr('cy', (d) => { return yScale(this.graph.nodes[d.source].y); })
      .attr('r', this.radius*0.9);


    linkClips.select('#targetCircle')
      .attr('cx', (d) => { return xScale(this.graph.nodes[d.target].x); })
      .attr('cy', (d) => { return yScale(this.graph.nodes[d.target].y); })
      .attr('r', this.radius*0.9);


    let linkMasks = this.svg.select('defs')
      .selectAll('mask')
      .data(graph.links.filter((l) => { return !l.visible; }), (d) => {
        return d.index;
      });

    const linkMasksEnter = linkMasks.enter()
      .append('mask')
      .attr('id', (d) => {
        const st = this.graph.nodes[d.source].title.replace(/ /g, '_').replace(/'/g, '');
        const tt = this.graph.nodes[d.target].title.replace(/ /g, '_').replace(/'/g, '');
        return 'm_' + st + '_' + tt;
      });

    linkMasksEnter
      .append('circle')
      .attr('id', 'sourceCircleMask')
      .attr('r', this.radius )
      .attr('fill', 'url(#radialGrad)');
      // .attr('fill','#df5555');

    linkMasksEnter
      .append('circle')
      .attr('id', 'targetCircleMask')
      .attr('r', this.radius )
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
        const st = this.graph.nodes[d.source].title.replace(/ /g, '_').replace(/'/g, '');
        const tt = this.graph.nodes[d.target].title.replace(/ /g, '_').replace(/'/g, '');
        return 'url(#' + st + '_' + tt + ')';
      })
      .attr('mask', (d: any) => {
        const st = this.graph.nodes[d.source].title.replace(/ /g, '_').replace(/'/g, '');
        const tt = this.graph.nodes[d.target].title.replace(/ /g, '_').replace(/'/g, '');
        return 'url(#m_' + st + '_' + tt + ')';
      })
      .attr('marker-end', '')
      .attr('marker-start', '');

    linkMasks.select('#sourceCircleMask')
      .attr('cx', (d) => { return xScale(this.graph.nodes[d.source].x); })
      .attr('cy', (d) => { return yScale(this.graph.nodes[d.source].y); })
      .attr('r', this.radius);

    linkMasks.select('#targetCircleMask')
      .attr('cx', (d) => { return xScale(this.graph.nodes[d.target].x); })
      .attr('cy', (d) => { return yScale(this.graph.nodes[d.target].y); })
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
      })


    select('#graph').select('svg').attr('height', this.height);


    let node = this.svg.select('.nodes')
      // .selectAll('circle')
      .selectAll('.title')
      .data(graph.nodes, (d) => {
        return d.index;
      });

    const nodesEnter = node.enter()
      .append('text')
      .attr('class', 'title')
      .attr('alignment-baseline', 'middle');
    // .append('circle');


    node.exit().remove();

    node = nodesEnter.merge(node);

    node
      .text((d) => { return d.label === 'actor' ? '\uf008 ' + d.title : '\uf007 ' + d.title; })
      // .attr('r', (d) => {
      //   return d.label === 'actor' ? 7 : 10;
      // })
      // .attr('fill', (d, i) => {
      //   console.log(this.color(0), this.color(1), this.color(20));
      //   return (d.label === 'actor' ? this.color(2) : this.color(10));
      // })
      .on('click', (d) => {
        console.log(d);
        this.extractTree(d);
        this.drawTree();
      });

    node.on('mouseover', (d) => {
      const element = selectAll('.hiddenEdge').filter((dd: any) => {
        return this.graph.nodes[dd.source].title === d.title || this.graph.nodes[dd.target].title === d.title;
      });

      element.attr('clip-path', 'undefined');
      element.attr('mask', 'undefined');
    })
      .on('mouseout', (d) => {

        const element = selectAll('.hiddenEdge').filter((dd: any) => {
          return this.graph.nodes[dd.source].title === d.title || this.graph.nodes[dd.target].title === d.title;
        });

        element.attr('clip-path', (dd: any) => {
          const st = this.graph.nodes[dd.source].title.replace(/ /g, '_').replace(/'/g, '');
          const tt = this.graph.nodes[dd.target].title.replace(/ /g, '_').replace(/'/g, '');
          return 'url(#' + st + '_' + tt + ')';
        });

        element.attr('mask', (dd: any) => {
          const st = this.graph.nodes[dd.source].title.replace(/ /g, '_').replace(/'/g, '');
          const tt = this.graph.nodes[dd.target].title.replace(/ /g, '_').replace(/'/g, '');
          return 'url(#m_' + st + '_' + tt + ')';
        });

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
      })


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


  }

  drawGraph() {

    const graph = this.graph;

    const link = this.svg.select('.links')
      .selectAll('line')
      .data(graph.links)
      .enter()
      .append('line')
      .attr('class', 'visible')



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


  private elbow(d, interGenerationScale, lineFunction, curves) {

    let source = this.graph.nodes[d.source];
    let target = this.graph.nodes[d.target];

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


}



/**
 * Factory method to create a new instance of the genealogyTree
 * @param parent
 * @param options
 * @returns {graph}
 */
export function create(width, height, radius, selector) {
  return new Graph(width, height, radius, selector);
}
