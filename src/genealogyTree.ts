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
  interpolateViridis,
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


/**
 * The visualization showing the genealogy graph
 */
class genealogyTree {

  private $node;

  private data;

  private timer;

  private width;

  private height;

  private margin = Config.margin;

  //Time scale for visible nodes
  private x = scaleLinear();

  //Time scale for nodes outside the viewport
  private x2 = scaleLinear();


  private y = scaleLinear();

  private attributeBarY = scaleLinear().range([Config.glyphSize*2, 0]).domain([0,1]);


  private kidGridSize = 4;
  //Scale to place siblings on kid grid
  private kidGridXScale = scaleLinear().domain([1,this.kidGridSize]).range([0, Config.glyphSize*2]);


   private kidGridYScale = scaleLinear()
  .domain([1,this.kidGridSize/2])
  .range([-Config.hiddenGlyphSize/2, Config.hiddenGlyphSize]);



  //Axis for the visible nodes
  private visibleXAxis;

  //Axis for the nodes outside of the viewport
  private extremesXAxis;

  private startYPos;

  private aggregating_levels;

  private interGenerationScale = scaleLinear();

  private self;

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
      return d['x'];
    })
    .y(function (d) {
      return d['y'];
    });


  private lineFunction = line < any >()
    .x((d: any) => {
      return this.x(d.x);
    }).y((d: any) => {
      return this.y(d.y);
    })
    .curve(curveBasis);


  constructor(parent: Element) {
    this.$node = select(parent)
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
    this.attachListeners();
    // return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
   * Build the basic DOM elements and binds the change function
   */
  private build() {

    let nodes = this.data.nodes;


    this.width = 600 - this.margin.left - this.margin.right
    this.height = Config.glyphSize * 3 * nodes.length - this.margin.top - this.margin.bottom;


    // Y scale. Xscale range and domain are defined in update_time_axis;
    this.y.range([0, this.height]).domain([min(nodes, function (d) {
      return +d['y']
    }), max(nodes, function (d) {
      return +d['y']
    })])

    this.visibleXAxis = axisTop(this.x).tickFormat(format("d"))
    this.extremesXAxis = axisTop(this.x2)



    this.interGenerationScale.range([.75, .25]).domain([2, nodes.length]);


    const svg = this.$node.append('svg')
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .attr('id', 'graph')


	  //Create gradients
	  let gradient = svg.append("defs")
	  .append("linearGradient")
	    .attr("id", "gradient")
	    .attr("x1", "0%")
	    .attr("y1", "50%")
	    .attr("x2", "100%")
	    .attr("y2", "50%")
	    .attr("spreadMethod", "pad");

	gradient.append("stop")
	    .attr("offset", "0%")
	    .attr("stop-color", "#9e9d9b")
	    .attr("stop-opacity", 1);

	gradient.append("stop")
	    .attr("offset", "80%")
	    .attr("stop-color", "#9e9d9b")
	    .attr("stop-opacity", 1);

	gradient.append("stop")
	    .attr("offset", "100%")
	    .attr("stop-color", "white")
	    .attr("stop-opacity", 0);


 let kidGridGradient = svg.append("defs")
	  .append("linearGradient")
	    .attr("id", "kidGridGradient")
	    .attr("x1", "0%")
	    .attr("y1", "50%")
	    .attr("x2", "100%")
	    .attr("y2", "50%")
	    .attr("spreadMethod", "pad");

	kidGridGradient.append("stop")
	    .attr("offset", "0%")
	    .attr("stop-color", "#f2f3f4")
	    .attr("stop-opacity", 1);

	kidGridGradient.append("stop")
	    .attr("offset", "20%")
	    .attr("stop-color", "#f2f3f4")
	    .attr("stop-opacity", 1);

	 kidGridGradient.append("stop")
	    .attr("offset", "75%")
	    .attr("stop-color", "white")
	    .attr("stop-opacity", 1);

	kidGridGradient.append("stop")
	    .attr("offset", "100%")
	    .attr("stop-color", "#f2f3f4")
	    .attr("stop-opacity", 0);




    //Add scroll listener for the graph table div
    document.getElementById('graph_table').addEventListener('scroll', () => {
      this.update_time_axis();
      /* clear the old timeout */
      clearTimeout(this.timer);
      /* wait until 100 ms for callback */
      this.timer = setTimeout(() => {
        this.update_visible_nodes()
      }, 100);
    });

    //Create group for genealogy tree
    svg.append("g")
      .attr("transform", "translate(" + this.margin.left + "," + (this.margin.top + Config.glyphSize) + ")")
//       .classed('genealogyTree', true)
      .attr('id', 'genealogyTree')


      //Ensure the right order of edges and nodes

      //create a group in the background for edges
      select('#genealogyTree')
      .append("g")
      .attr("id","edges")


      //create a group in the foreground for nodes
     select('#genealogyTree')
      .append("g")
      .attr("id","nodes")


    //Create group for all time axis
    const axis = svg.append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top / 1.5 + ")")
      .attr('id', 'axis')

      axis
       .append('rect')
       .attr("width", this.width)
       .attr ('height',100)
       .attr('y',-100)
       .attr('fill','white')


    axis.append("g")
      .attr('id', 'visible_axis')
      .call(this.visibleXAxis)

    axis.append("g")
      .attr('id', 'extremes_axis')
      .call(this.extremesXAxis)



	  //Create temporary group for y axis
    const yaxis = svg.append("g")
      .attr("transform", "translate(" +this.margin.left + "," + (this.margin.top + Config.glyphSize) + ")")
      .attr('id', 'yaxis')
      .call(axisRight(this.y).tickFormat(format(",.1f")).tickValues(range(1,105,.5)).tickSize(this.width))




    //Filter data to only render what is visible in the current window
    this.update_time_axis();

    //Call function that updates the position of all elements in the tree
    this.update_graph(this.data.nodes, this.data.parentChildEdges, this.data.parentParentEdges)
  }

  //End of Build Function


  private update_graph(nodes, edges, parentEdges) {
    this.update_edges(nodes, edges, parentEdges);
    this.update_nodes(nodes, edges, parentEdges)
  }

  //Function that updates the position of all element in the genealogy tree
  private update_edges(nodes, edges, parentEdges) {

    let t = transition('t').duration(500).ease(easeLinear);

    let edgeGroup = select('#genealogyTree').select('#edges')

	//Only draw parentedges if target node is not
    let edgePaths = edgeGroup.selectAll(".edges")
      .data(edges.filter(function (d) {
        return (!d['target']['aggregated'] &&  !(d['target']['hidden'] && !d['target']['hasChildren']))
      }), function (d) {
        return d['id'];
      });

    //remove extra paths
    edgePaths.exit().transition().duration(400).style('opacity', 0).remove();

    let edgePathsEnter = edgePaths
      .enter()
      .append("path");

    edgePaths = edgePathsEnter.merge(edgePaths);


    edgePathsEnter.attr('opacity', 0);

    edgePaths
      .attr("class", "edges")
      .transition(t)
      .attr("d", (d) => {
	      let maY = Math.round(d['ma']['y']);
	      let paY = Math.round(d['pa']['y']);
	      let nodeY = Math.round(d['target']['y']);

	     if ((maY == nodeY) && (paY == nodeY)){
		 	return this.elbow(d, this.interGenerationScale, this.lineFunction,false)
		 }
		 else
		 	return this.elbow(d, this.interGenerationScale, this.lineFunction,true)
      })


    edgePaths
      .transition(t.transition().ease(easeLinear))
      .attr('opacity', 1);


    edgePaths
      .attr("stroke-width", Config.glyphSize / 5)


    let parentEdgePaths = edgeGroup.selectAll(".parentEdges")// only draw parent parent edges if neither parent is aggregated
      .data(parentEdges.filter(function (d) {
        return !d['ma']['aggregated'] || !d['pa']['aggregated']
      }), function (d) {
        return d['id'];
      });


    parentEdgePaths.exit().transition().duration(400).style('opacity', 0).remove();

    let parentEdgePathsEnter = parentEdgePaths
      .enter()
      .append("path");

    parentEdgePathsEnter.attr('opacity', 0)


    parentEdgePaths = parentEdgePathsEnter.merge(parentEdgePaths);

    parentEdgePaths
      .attr("class", "parentEdges")
      .attr("stroke-width", Config.glyphSize / 8)
      .style("fill", 'none')
      .transition(t)
      .attr("d", (d) => {
        return this.parentEdge(d, this.lineFunction)
      })

    parentEdgePaths
      .transition(t.transition().ease(easeLinear))
      .attr('opacity', 1);

  };

  private update_nodes(nodes, edges, parentEdges) {

    /* 		console.log */
    ('called update_nodes')
    let t = transition('t').duration(500).ease(easeLinear);


	let nodeGroup = select('#genealogyTree').select('#nodes')


    let allNodes = nodeGroup.selectAll(".node")
      .data(nodes, function (d) {
        return d['id'];
      });

    allNodes.exit().transition().duration(400).style('opacity', 0).remove();


    let allNodesEnter = allNodes
      .enter()
      .append("g");

//             console.log('allNodesEnter has ', allNodesEnter.size()  ,  'nodes');


    allNodes = allNodesEnter.merge(allNodes);

    allNodes
      .attr('class', (d) => {
	      return 'row'
//         return 'row_' + d['y']
      });

//         allNodes.filter((d)=>{return d['hidden']}).classed('phantom',true);

    allNodes
      .classed("node", true)
      .classed("aggregated", (d) => {
        return d['aggregated']
      })
      .classed("collapsed", (d) => {
        return d['hidden']
      })


    //Attach background rectangle to all rows and set to invisible (will be used to capture mouse events)
    allNodesEnter.filter((d) => {
      return !d['aggregated']
    })
      .append('rect')
      .classed('backgroundBar', true);


    //Attach highlight rectangle to all rows and set to invisible (will be set to visible on hover over backgroundBar)
    allNodesEnter.filter((d) => {
      return !d['aggregated'] && !d['hidden']
    })
      .append('rect')
      .classed('highlightBar', true);


    /*
     //Remove backgroundBar for nodes that were aggregated  - Don't remove because on uncollapse you don't want to have to re-attach; just hide;
     allNodes.filter((d)=>{return d['aggregated'] || d['hidden']})
     .select('.backgroundBar').remove();
     */


    allNodes
      .selectAll('.backgroundBar')
      .attr("width", (d) => {
        return (max(this.x.range()) - min(this.x.range()) + this.margin.right);
//         return (max(this.x.range()) - this.x(d['x']) + this.margin.right);
      })
      .attr('x', (d) => {
        return -this.x(d['x'])
      })
      .attr("height", Config.glyphSize * 2)
      .attr("transform", (d: any) => {
        return d.sex == 'M' ? "translate(" + Config.glyphSize + ",0)" : "translate(" + 0 + "," + (-Config.glyphSize) + ")";
      })

     allNodes
      .selectAll('.highlightBar')
      .attr("width", (d) => {
//         return (max(this.x.range()) - min(this.x.range()) + this.margin.right);
        return (max(this.x.range()) - this.x(d['x']) + this.margin.right);
      })
/*
      .attr('x', (d) => {
        return -this.x(d['x'])
      })
*/
      .attr("height", Config.glyphSize * 2)
      .attr("transform", (d: any) => {
        return d.sex == 'M' ? "translate(" + Config.glyphSize + ",0)" : "translate(" + 0 + "," + (-Config.glyphSize) + ")";
      })


    allNodes
      .selectAll('.backgroundBar')
      .attr('opacity', 0);


     allNodes
      .selectAll('.highlightBar')
      .attr('opacity', 0);

    selectAll('.backgroundBar')
      .on('mouseover', function (d: any) {
// 	        console.log('moused_over' , )

		//Set opacity of corresponding highlightBar
        selectAll('.highlightBar').filter((e)=>{return e ==d}).attr('opacity', .2)

        //Set the age label on the lifeLine of this row to visible
         selectAll('.row').filter((e)=>{return e == d}).filter((d) => {
          return !d['aggregated'] && !d['hidden']
        }).select('.lifeRect').select('.ageLabel').attr('visibility', 'visible');

        //For aggregated nodes, show all the nodes that went into the aggregate
        selectAll('.row').filter((e)=>{return e == d}).filter('.aggregated').attr('opacity', 1)

        //Hide the aggregate node itself
         selectAll('.row').filter((e)=>{return e == d}).select('.hex').attr('opacity', 0)


        events.fire('row_mouseover', d['y']);
      })
      .on('mouseout', (d) => {

        //Hide all the highlightBars
        selectAll('.highlightBar').attr('opacity', 0);

        //Hide all the age labels on the lifeLines
        selectAll('.ageLabel').attr('visibility', 'hidden');

        //Hide all nodes that were aggregated
        selectAll('.aggregated').attr('opacity', 0);

        //Set the opacity of any aggregate icons back to 1;
         selectAll('.row').filter((e)=>{return e == d}).select('.hex').attr('opacity', 1);

        events.fire('row_mouseout', d['y']);
      })


    //Move all node icons to the front.
// 		allNodes.selectAll('.nodeIcon').select(this).parentNode.appendChild(this)});


    //Add life line groups
    let lifeRectsEnter = allNodesEnter.filter((d) => {
      return d['type'] == 'single' && !d['hidden']
    }).append("g")
    .classed('lifeRect',true);


    let lifeRects = allNodes.selectAll('.lifeRect').filter((d) => {
      return !d['hidden']
    });

    lifeRects.exit().remove();

    lifeRects
      .attr("transform", (d: any) => {
        return d.sex == 'M' ? "translate(" + Config.glyphSize + ",0)" : "translate(0," + (-Config.glyphSize) + ")";
      });

    //Add actual life lines
    lifeRectsEnter

      .append("rect");

    lifeRects.selectAll('rect')
      .attr('y', Config.glyphSize)
      .attr("width", (d) => {
        let year = new Date().getFullYear();

        let ageAtDeath = Math.abs(this.x(d['ddate']) - this.x(d['bdate']));
        let ageToday = Math.abs(this.x(year) - this.x(d['bdate']));
        return (+d['deceased'] == 1) ? ageAtDeath : ageToday;
      })
      .attr("height", Config.glyphSize / 4)
      .style('fill', (d: any) => {
	      if (d.affected)
	      return "black";
	      if (d.deceased)
	      return "#9e9d9b";
	      else
		  return "url(#gradient)"
      })
      .style('opacity', .8);
    //         .style('stroke','none')

    //Add label to lifelines
    lifeRectsEnter
      .append("text")
      .attr('class', 'ageLabel')

    lifeRects.selectAll('.ageLabel')
    // .attr("y", glyphSize )
      .attr("dy", Config.glyphSize * 0.8)
      .attr("dx", (d) => {
        let year = new Date().getFullYear();

        let ageAtDeath = Math.abs(this.x(d['ddate']) - this.x(d['bdate']));
        let ageToday = Math.abs(this.x(year) - this.x(d['bdate']))

        return (+d['deceased'] == 1) ? ageAtDeath : ageToday;
//                 return Math.abs(this.x(d['ddate']) - this.x(d['bdate']));
      })
      .attr("text-anchor", 'end')
      .text(function (d) {
        let year = new Date().getFullYear();

        let ageAtDeath = (d['ddate'] - d['bdate']);
        let ageToday = (year - d['bdate'])

        return (+d['deceased'] == 1) ? ageAtDeath : ageToday;

//                 return Math.abs(+d['ddate'] - +d['bdate']);
      })
      .attr('fill', function (d: any) {
        return (d.affected) ? "black" : "#9e9d9b";
      })
      .style('font-size', Config.glyphSize * 1.5)
      .style('font-weight', 'bold')
      .attr('visibility', 'hidden');


    //Add cross at the end of lifelines for deceased people
    lifeRectsEnter.filter(function (d: any) {
      return (+d.deceased == 1);
    })
      .append("line")
      .attr('class', 'endOfTheLine')


    lifeRects.selectAll('.endOfTheLine')
      .attr("x1", (d: any) => {
        return (Math.abs(this.x(d['ddate']) - this.x(d['bdate'])) + Config.glyphSize / 2);
      })
      .attr("y1", function (d: any) {
        return Config.glyphSize / 2;
      })
      .attr("x2", (d: any) => {
        return Math.abs(this.x(d['ddate']) - this.x(d['bdate']) - Config.glyphSize / 2);
      })
      .attr("y2", function (d: any) {

        return Config.glyphSize * 2;
      })
      .attr("stroke-width", 2)
      .attr("stroke", function (d: any) {
        return (d.affected) ? "black" : "#9e9d9b";
      })

	  	//Add KidGrids next to Dad's glyph (if they have children)
    allNodesEnter.filter( (d: any)=> {
	    if (d['sex'] == 'F')
	    	return false;
	    if (!d['hasChildren'])
	    	return false;

	    let hasGrid = true; //change to false to only put kid grids on parents of leaf nodes
	    this.data.parentChildEdges.forEach((edge)=>{
		    if (edge['pa']==d && !edge['target']['hasChildren']){
		    	hasGrid = true;
		    }
	    })
	    return hasGrid;

//       return d['sex'] == 'M' && d['hasChildren'];
    })
      .append("g")
      .classed('kidGrid', true)
      .attr('visibility','hidden')

    //Add cross through lines for deceased people
    allNodesEnter.filter(function (d: any) {
      return (+d.deceased == 1);
    })
      .append("line")
      .attr('class', 'nodeLine')

	  //Node lines for deceased and uncollapsed nodes
    allNodes.selectAll('.nodeLine')
      .attr("x1", function (d: any) {
        return d.sex == 'F' ? -Config.glyphSize : -Config.glyphSize / 3;
      })
      .attr("y1", function (d: any) {
        return d.sex == 'F' ? -Config.glyphSize : -Config.glyphSize / 3;
      })
      .attr("x2", function (d: any) {
        return d.sex == 'F' ? Config.glyphSize : Config.glyphSize * 2.3;
      })
      .attr("y2", function (d: any) {
        return d.sex == 'F' ? Config.glyphSize : Config.glyphSize * 2.3;
      })
      .attr("stroke-width", 3)
      .attr("stroke", function (d: any) {
        return (d.affected) ? "black" : "#9e9d9b";
      })




	 //Node Lines for kid grid
    allNodes.selectAll('.nodeLine').filter((d) => {
      return d['hidden'] && !d['hasChildren']
    })
      .attr("x1", function (d: any) {
        return d.sex == 'F' ? -Config.hiddenGlyphSize : -Config.hiddenGlyphSize / 2;
      })
      .attr("y1", function (d: any) {
        return d.sex == 'F' ? -Config.hiddenGlyphSize : -Config.hiddenGlyphSize / 2;
      })
      .attr("x2", function (d: any) {
        return d.sex == 'F' ? Config.hiddenGlyphSize : Config.hiddenGlyphSize * 2.5;
      })
      .attr("y2", function (d: any) {
        return d.sex == 'F' ? Config.hiddenGlyphSize : Config.hiddenGlyphSize * 2.5;
      })
      .attr("stroke-width", 1);


	  //Node Lines for 75%  sized hidden nodes
    allNodes.selectAll('.nodeLine').filter((d) => {
      return d['hidden'] && d['hasChildren']
    })
      .attr("x1", function (d: any) {
        return d.sex == 'F' ? -Config.hiddenGlyphSize*1.5 : -Config.hiddenGlyphSize / 1.5;
      })
      .attr("y1", function (d: any) {
        return d.sex == 'F' ? -Config.hiddenGlyphSize*1.5 : -Config.hiddenGlyphSize / 1.5;
      })
      .attr("x2", function (d: any) {
        return d.sex == 'F' ? Config.hiddenGlyphSize*1.5 : Config.hiddenGlyphSize * 2.5;
      })
      .attr("y2", function (d: any) {
        return d.sex == 'F' ? Config.hiddenGlyphSize*1.5 : Config.hiddenGlyphSize * 2.5;
      })
      .attr("stroke-width", 1)
      .attr("stroke", function (d: any) {
        return (d.affected) ? "black" : "#9e9d9b";
      })


    //Add Aggregate Node glyphs
    allNodesEnter.filter(function (d: any) {
      return d['type'] == 'aggregate';
    })
      .append("path")
      .attr("d", this.hexLine(this.hexData))
      .classed('hex', true)

    allNodes.selectAll('.hex')
    //             .classed('male', true)
      .classed('nodeIcon', true)



     //Size kidGrids
    allNodesEnter.selectAll('.kidGrid')
      .append('rect')


      allNodes.selectAll('.kidGrid')
	  .select('rect')
      .attr("width", (d)=>{

	    let gridSize = Config.glyphSize*2.5;
	    this.data.parentChildEdges.forEach((edge)=>{
		    if (edge['pa']==d && !edge['target']['hasChildren']){
		    	gridSize  =  Config.glyphSize *4;
		    }
	    })
	    return  gridSize
	  })
      .attr("height", Config.glyphSize*2)
//       .attr("x",Config.glyphSize*1.7)
      .style('fill', "url(#kidGridGradient)")
      .style('stroke','none')



      //Add couples line
     allNodesEnter.filter(function (d: any) {
      return d['sex'] == 'M' && d['hasChildren'];
    })
      .append("line")
      .attr('class', 'couplesLine')
      .attr('visibility','hidden')


    allNodes.selectAll('.couplesLine')
      .attr("x1", (d: any) => {
        return Config.glyphSize *1.3;
      })
      .attr("y1", function (d: any) {
        return -Config.glyphSize*0.2;
      })
      .attr("x2", (d: any) => {
        return Config.glyphSize *1.3;
      })
      .attr("y2", function (d: any) {

        return Config.glyphSize * 2.2;
      })
      .attr("stroke-width", 4)
//       .attr("stroke", '#a09f9f')
      .attr('stroke','#bec3ce')




    //Add Male Node glyphs
    allNodesEnter.filter(function (d: any) {
      return d['sex'] == 'M';
    })
      .append("rect")
      .classed('male', true)
      .classed('nodeIcon', true)





    //Size hidden nodes differently
    //regular nodes
    allNodes.selectAll('.male')
      .attr("width", Config.glyphSize * 2)
      .attr("height", Config.glyphSize * 2);



          //Add Attribute Bars next to node glyphs
    allNodesEnter
    .filter(function (d: any) {
      return !d['hidden'];
    })
      .append("rect")
      .classed('attributeBar', true)

    //attribute Bars
    allNodes.selectAll('.attributeBar')
      .attr("width", Config.glyphSize )
      .attr("height", (d)=>{
	       return Config.glyphSize*2 - this.attributeBarY(1)

	      })
      .attr("x",(d)=>{return d['sex']=='F'? -Config.glyphSize*2.4 : -Config.glyphSize*1.5})
      .attr("y",(d)=>{

			return d['sex']=='F'? (this.attributeBarY(1)-Config.glyphSize) : this.attributeBarY(1)

// 	      return d['sex']=='F'? (this.attributeBarY(0.7)-Config.glyphSize) : this.attributeBarY(0.7)



	      })




	 //leaf nodes, go into kidGrid
    allNodes.selectAll('.male')
      .filter((d) => {
        return d['hidden'] && !d['hasChildren']
      })
      .attr("width", Config.hiddenGlyphSize * 1)
      .attr("height", Config.hiddenGlyphSize * 1);


	//non kid grid nodes, higher up in the tree
    allNodes.selectAll('.male')
      .filter((d) => {
        return d['hidden'] && d['hasChildren']
      })
      .attr("width", Config.glyphSize * .75)
      .attr("height", Config.glyphSize * .75);


    //Add female node glyphs
    allNodesEnter.filter(function (d: any) {
      return d['sex'] == 'F';
    })
      .append("circle")
      .classed('female', true)
      .classed('nodeIcon', true)

	 //unhidden nodes
    allNodes.selectAll('.female')
      .attr("r", Config.glyphSize);

	  //kidGrid nodes
    allNodes.selectAll('.female')
      .filter((d) => {
        return d['hidden'] && !d['hasChildren']
      })
      .attr("r", Config.hiddenGlyphSize/2);

	 //Hidden nodes (not in kid grid) farther up the tree
    allNodes.selectAll('.female')
      .filter((d) => {
        return d['hidden'] && d['hasChildren']
      })
      .attr("r", Config.glyphSize * .45);


    allNodesEnter.attr('opacity', 0);


	     //Position and Color all Nodes
    allNodes
      .filter((d)=>{return !(d['hidden'] && !d['hasChildren'])})
      .transition(t)
      .attr("transform", (node) => {
	    let xpos = this.xPOS(node);
	    let ypos = this.yPOS(node);
        return "translate(" + xpos + "," + ypos+ ")";
       })


    //Position  Kid Grid Nodes (i.e leaf siblings)
        allNodes.filter((d)=>{return d['hidden'] && !d['hasChildren']})
      .transition(t)
      .attr("transform", (node) => {
    	    let xpos = this.xPOS(node);
		    let ypos = this.yPOS(node);

        	let childCount = 0;
        	//Find ma and pa
        	let edge = this.data.parentChildEdges.filter((d) => {
            	return d.target == node
          	});

		  	let ma = edge[0]['ma'];
		  	let pa = edge[0]['pa'];


		  	let xind; let yind;

		  	let gender = node['sex'];
        	this.data.parentChildEdges.forEach((d,i)=>{

	        	if (d.ma == ma && d.pa == pa ){
		        	//Only count unaffected children so as to avoid gaps in the kid Grid
		        	if (!d.target.affected && d.target.sex == gender)
		        		childCount = childCount +1
		        	if (d.target == node){

			        	yind = childCount % (this.kidGridSize/2);

			        	if (yind == 0)
			        		yind = this.kidGridSize/2

			        	xind = Math.ceil(childCount/2)

		        	}
	        	}
        	})
				return  "translate(" + (xpos + this.kidGridXScale(xind)) + "," + (ypos + + this.kidGridYScale(yind)) + ")";

      })




            allNodes
            .style("stroke-width",(d: any) => {
				return (d['hidden'] && !d['hasChildren']) ? 1 : 2
      		})

			.style("fill", (d: any) => {
				return (d.affected) ? "black" : "white"
      		})

    let tran = t.transition().ease(easeLinear);
    allNodes.filter((d) => {
      return !d['aggregated']
    })
      .transition(tran)
      .attr('opacity', 1);


    allNodes.filter((d) => {
      return d['aggregated']
    })
      .transition(tran.duration(100))
      .attr('opacity', 0);


    allNodesEnter
      .append('text')
      .attr('class', 'nodeLabel');

    allNodes.selectAll('.nodeLabel')
    // .attr('visibility','hidden')
      .text(function (d: any) {

        return d['hidden'] ? '' : max(d['family_ids']);
        /*
         let year = new Date().getFullYear();
         if (+d.ddate > 0) {
         return Math.abs(d['ddate'] - d['bdate']);
         }
         else
         return Math.abs(year - d['bdate']);
         */

      })
      .attr('dx', function (d) {
        return d['sex'] == 'M' ? Config.glyphSize / 2 : -Config.glyphSize / 2;
      })
      .attr('dy', function (d) {
        return d['sex'] == 'M' ? 1.3 * Config.glyphSize : Config.glyphSize / 2.75;
      })
      .attr('fill', function (d: any) {
        return (d.affected) ? "white" : "black";
      })
      .attr('stroke', 'none')
      .style('font-size', Config.glyphSize);

/*
      //Temporarily hide all collapsed nodes that aren't in the kid grid;
      selectAll('.nodeIcon').filter((d)=>{return d['hasChildren'] && d['hidden']})
      .attr('visibility','hidden');
 */

       selectAll('.nodeLine').filter((d)=>{return !d['hasChildren'] && d['hidden']})
      .attr('visibility','hidden');



    let dragged = drag()
      .on("start", (d) => {


        console.log('started drag')

        this.startYPos = this.y.invert(mouse(< any > select('.genealogyTree').node())[1]);
        this.aggregating_levels = new Set();
        this.create_phantom(d)

      })
      .on("drag", (d) => {

        let currentY = this.floorY(); //this.y.invert(mouse(<any>select('.genealogyTree').node())[1]);
        if (currentY > this.startYPos) {
          //user is dragging down
          // 		      currentY = this.floorY();
          this.aggregating_levels.add(currentY);
        } else {
          // 		      currentY = this.ceilY();
          this.aggregating_levels.delete(currentY);
        }

        this.aggregating_levels.forEach((level) => {
          this.create_phantom(this.get_row_data('.row_' + level))
          this.update_pos_row('.row_' + level)
        });

        this.update_pos_row('.row_' + Math.round(this.startYPos))

        //Call function that updates the position of all elements in the tree
        this.update_edges(this.data.nodes, this.data.parentChildEdges, this.data.parentParentEdges)
// 				event.stopPropagation()
      })

      .on("end", (d) => {

        this.update_pos_row('.row_' + Math.round(this.startYPos))
        this.aggregating_levels.add(this.closestY())

        let indexes = Array.from(this.aggregating_levels);

        console.log('aggregating ', indexes, 'on click')
        this.data.aggregateNodes(indexes, [], [])

        selectAll('.phantom').remove();

        if (indexes.length == 1) {
          return;
        }

        this.update_visible_nodes()


      });


    allNodes
      .on('contextmenu', (d) => {


        this.data.collapseFamilies(d['family_ids'].slice(-1))
        this.update_visible_nodes()


        event.preventDefault();
        console.log('right menu clicked')

      })

      .on("dblclick", (d) => {

        this.data.restoreTree();
        this.update_visible_nodes();


        if (d['collapsedNodes']) {
          //clicked on an Aggregate Node
          console.log('double clicked on an aggregate')
          this.data.expandAggregates(d['collapsedNodes'].map((n) => {
            return n['y']
          }))
          this.update_visible_nodes()
        }

// 			this.update_visible_nodes()


      })

      .on('click', (d) => {

        console.log(d['KindredID'], console.log(d['y']))

        if (event.altKey) {
          //Hide node
          this.data.hideNodes(d['y']);
          this.update_time_axis();
          this.update_visible_nodes();

          return;
        }
        if (event.defaultPrevented) return; // dragged

        let wasSelected = selectAll('.highlightBar').filter((e) => {
          return e == d
        }).classed('selected');

// 		    let wasSelected = select(this).select('.backgroundBar').classed('selected');

        //'Unselect all other background bars if ctrl was not pressed
        if (!event.metaKey) {
          selectAll('.highlightBar').classed('selected', false);
// 			console.log(selectAll('.selected').data())
        }

        selectAll('.highlightBar').filter((e) => {
          return e == d
        }).classed('selected', function () {
          return (!wasSelected);
        })

// 			d['clicked'] = !wasSelected;


        if (!event.metaKey) {
          events.fire('row_selected', d['y'], 'single');
        }
        else {
          events.fire('row_selected', d['y'], 'multiple');
        }


      })
// 		.call(dragged)


  }


//     		private clicked


  private update_time_axis() {


    let scrollOffset = document.getElementById('graph_table').scrollTop;
    let divHeight = document.getElementById('graph_table').offsetHeight;

    // 	          console.log(divHeight, this.y(65),this.y(72), (divHeight + scrollOffset) - 75)

    let minY = this.y.invert(scrollOffset);
    let maxY = this.y.invert(divHeight + scrollOffset - 75)

    select("#axis")
      .attr("transform", "translate(" + this.margin.left + "," + (scrollOffset + this.margin.top / 1.5) + ")")

    //the 75 offset is the transform applied on the group

    //Filter data to adjust x axis to the range of nodes that are visible in the window.

    let filtered_nodes = this.data.nodes.filter((d) => {
      return d['y'] >= Math.round(minY) && d['y'] <= Math.round(maxY)
    });

    if (filtered_nodes.length == 0)
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
      }) + 5];

    //Build time axis

    //for visible nodes
    let x_range = [0];
    let x_domain = [all_domain[0]];
    let x_ticks = [all_domain[0]]

    //for out of scope nodes
    let x2_range = [0];
    let x2_domain = [all_domain[0]];
    let x2_ticks = [];


    //If there are hidden nodes older than the first visible node
    if (all_domain[0] < filtered_domain[0]) {
      x_range.push(this.width * 0.05);
      x_domain.push(filtered_domain[0])
      x_ticks.push(filtered_domain[0])


      x2_range.push(this.width * 0.05);
      x2_domain.push(filtered_domain[0])

      //Add tick marks
      let left_range = range(all_domain[0], filtered_domain[0], 10);
      x2_ticks = left_range;

    }

    x_ticks = x_ticks.concat(ticks(filtered_domain[0], filtered_domain[1], 10));


    if (all_domain[1] != filtered_domain[1]) {

      x_range.push(this.width * 0.95);
      x_domain.push(filtered_domain[1])
      x_ticks.push(filtered_domain[1])

      x2_range.push(this.width * 0.95)
      x2_domain.push(filtered_domain[1])

      x2_range.push(this.width)
      x2_domain.push(all_domain[1])

      let right_range = range(filtered_domain[1], all_domain[1], 10);
      x2_ticks = x2_ticks.concat(right_range);
    }

    x_range.push(this.width);
    x_domain.push(all_domain[1]);
    x_ticks.push(all_domain[1]);

    let t2 = transition('t2').duration(750).ease(easeLinear);

    this.x.domain(x_domain);
    this.x.range(x_range)

    this.x2.domain(x2_domain);
    this.x2.range(x2_range)

    this.visibleXAxis.tickValues(x_ticks);
    this.extremesXAxis.tickValues(x2_ticks);

    select('#visible_axis')
      .transition(t2)
      .call(this.visibleXAxis)

    select('#extremes_axis')
      .attr('opacity', .6);

    select('#extremes_axis')
    //         .transition(t2)
      .call(this.extremesXAxis)

    select('#extremes_axis')
      .transition(t2)
      .attr('opacity', .6)

    select('#visible_axis')
      .selectAll("text")
      .attr("dx", "1.5em")
      .attr("dy", "-.15em")
      .attr("transform", "rotate(-35)");

  }


  private update_visible_nodes() {

    let scrollOffset = document.getElementById('graph_table').scrollTop;
    let divHeight = document.getElementById('graph_table').offsetHeight;

    // 	          console.log(divHeight, this.y(65),this.y(72), (divHeight + scrollOffset) - 75)

    let minY = this.y.invert(scrollOffset)-2;
    let maxY = this.y.invert(divHeight + scrollOffset - 75)

    let filtered_nodes = this.data.nodes.filter((d) => {
      return d['y'] >= Math.round(minY)
    });


    let filtered_parentParentEdges = this.data.parentParentEdges.filter((d) => {
      return d['ma'].y >= Math.round(minY) && d['pa'].y >= Math.round(minY)
    });

    let filtered_parentChildEdges = this.data.parentChildEdges.filter((d) => {
      return d.target.y >= Math.round(minY)
    });


    //Call function that updates the position of all elements in the tree
//     this.update_graph(this.data.nodes, this.data.parentParentEdges, this.data.parentChildEdges)
    this.update_graph(filtered_nodes, filtered_parentChildEdges, filtered_parentParentEdges)


  }

  private create_phantom(d) {

    let phantom = selectAll('#g_' + d['id']);

    if (phantom.size() == 1) {
      //Create phantom node

      const node = document.getElementById('g_' + d['id'])
      let phantomNode = node.cloneNode(true)
      //        phantomNode.setAttribute("class", "phantom node");
      document.getElementById('genealogyTree').appendChild(phantomNode)
//             console.log(phantom)

    }
  }

  //Update position of a group based on data
  private update_pos(d) {

    const node_group = select('#g_' + d['id']);
    const currentPos = mouse(< any > select('.genealogyTree').node());

    node_group.attr("transform", () => {
      return "translate(" + this.xPOS(d) + "," + currentPos[1] + ")";
    })
  }

  //Update position of a group based on a class
  private update_pos_row(class_id) {

    const row_nodes = select(class_id);

    const currentPos = mouse(< any > select('.genealogyTree').node());

    const node = row_nodes.data()[0];

    let nodePos = {
      'sex': node['sex'],
      'x': node['x'],
      'y': this.y.invert(currentPos[1])
    }
//         node['y'] = this.y.invert(currentPos[1])

    row_nodes.attr("transform", () => {
      return "translate(" + this.xPOS(nodePos) + "," + this.yPOS(nodePos) + ")";
    })
  }

  //Snap row to position
  private snap_pos_row(class_id) {

    const row_nodes = select(class_id);

    const currentPos = mouse(< any > select('.genealogyTree').node());

    const node = row_nodes.data()[0];

    node['y'] = Math.round(this.y.invert(currentPos[1]))

    row_nodes.attr("transform", () => {
      return "translate(" + this.xPOS(node) + "," + this.yPOS(node) + ")";
    })
  }


  private get_row_data(class_id) {
    return select(class_id).data()[0];

  }

  private closestY() {
    const currentPos = mouse(< any > select('.genealogyTree').node());
    return Math.round(this.y.invert(currentPos[1]))
  }

  private ceilY() {
    const currentPos = mouse(< any > select('.genealogyTree').node());
    return Math.ceil(this.y.invert(currentPos[1]))
  }

  private floorY() {
    const currentPos = mouse(< any > select('.genealogyTree').node());
    return Math.floor(this.y.invert(currentPos[1]))
  }


  private xPOS(node) {

	//Check for hidden nodes with no children to place in the kid grid;

/*
	  if (node['hidden'] && !node['hasChildren']){

        	let childCount = 0;
        	//Find ma and pa
        	let edge = this.data.parentChildEdges.filter((d) => {
            	return d.target == node
          	});

		  	let ma = edge[0]['ma'];
		  	let pa = edge[0]['pa'];


        	this.data.parentChildEdges.forEach((d,i)=>{

	        	if (d.ma == ma && d.pa == pa ){
		        	//Only count unaffected children so as to avoid gaps in the kid Grid
		        	if (!d.target.affected)
		        		childCount = childCount +1
		        	if (d.target == node){

			        	let xpos = childCount % this.kidGridSize;
			        	if (xpos == 0)
			        		xpos = this.kidGridSize


						let ans  = this.x(node.x) + this.kidGridScale(xpos)

			        	console.log('Family ' , max(node['family_ids']) ,   ' has ', childCount  , ' kids. child has node.x ', node.x , ' and xpos is ' , ans)
			        	return ans;

		        	}

	        	}

        	})
		}
*/


    if (node['sex'] == 'M') {
      if (node['hidden'] && node['hasChildren'])
	       return this.x(node.x) - Config.hiddenGlyphSize
	  if (!node['hidden'])
	  	return  this.x(node.x) - Config.glyphSize;
	  if (node['hidden'] && !node['hasChildren'])
	  	return  this.x(node.x) - Config.hiddenGlyphSize/2;
    }
    else
      return this.x(node.x);
  }

  private yPOS(node) {
/*

	  	  if (node['hidden'] && !node['hasChildren']){

        	let childCount = 0;
        	//Find ma and pa
        	let edge = this.data.parentChildEdges.filter((d) => {
            	return d.target == node
          	});

		  	let ma = edge[0]['ma'];
		  	let pa = edge[0]['pa'];


        	this.data.parentChildEdges.forEach((d,i)=>{

	        	if (d.ma == ma && d.pa == pa){
		        	//Only count unaffected children so as to avoid gaps in the kid Grid
		        	if (!d.target.affected)
		        		childCount = childCount +1
		        	if (d.target == node){
			        	let ypos = this.y(node.y) + this.kidGridScale(Math.ceil(childCount / this.kidGridSize))
			        	console.log('child has node.y ', node.y , ' and ypos is ' , ypos)
			        	return ypos;
		        	}

	        	}


        	})
		}
*/


//       return (node['hidden'] && node['hasChildren']) ? this.y(node.y) - Config.hiddenGlyphSize : this.y(node.y) - Config.glyphSize;
	if (node['sex'] == 'M'){
	  if (node['hidden'] && node['hasChildren'])
	       return this.y(node.y) - Config.hiddenGlyphSize
	  if (!node['hidden'])
	  	return  this.y(node.y) - Config.glyphSize
	  if (node['hidden'] && !node['hasChildren'])
	  	return  this.y(node.y) - Config.hiddenGlyphSize;
	}
    else
      return this.y(node.y)
  }

  private elbow(d, interGenerationScale, lineFunction,curves) {
    const xdiff = d.ma.x - d.target.x;
    const ydiff = d.ma.y - d.target.y;
    let nx = d.ma.x - xdiff -4 //* interGenerationScale(ydiff)

	let linedata;
	if (curves){
		nx = d.ma.x - xdiff * interGenerationScale(ydiff)
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
    else{
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

  private parentEdge(d, lineFunction) {
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
    events.on('table_row_selected', (evt, item) => {
      let wasSelected = selectAll('.highlightBar').filter((d) => {
        return d['id'] == item
      }).classed('selected');

      //'Unselect all other background bars if ctrl was not pressed
      if (!event.metaKey) {
        selectAll('.highlightBar').classed('selected', false);
      }

      selectAll('.highlightBar').filter((d) => {
        return d['id'] == item
      }).classed('selected', function () {
        return (!wasSelected);
      })
    });

    events.on('table_row_hover_on', (evt, item) => {
      selectAll('.highlightBar').filter((d) => {
        return d['id'] == item
      }).attr('opacity', .2)
       selectAll('.row').filter((e)=>{return e['id'] == item}).filter((d) => {
        return !d['aggregated']
      }).select('.lifeRect').select('.ageLabel').attr('visibility', 'visible');
       selectAll('.row').filter((e)=>{return e['id'] == item}).filter('.aggregated').attr('opacity', 1)
       selectAll('.row').filter((e)=>{return e['id'] == item}).select('.hex').attr('opacity', 0)
    });

    events.on('table_row_hover_off', (evt, item) => {
      selectAll('.aggregated').attr('opacity', 0)
      selectAll('.highlightBar').attr('opacity', 0)
      selectAll('.ageLabel').attr('visibility', 'hidden');
       selectAll('.row').filter((e)=>{return e['id'] == item}).select('.hex').attr('opacity', 1)
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
  return new genealogyTree(parent);
}
