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
    mouse
} from 'd3-selection';
import {
    scaleLinear
} from 'd3-scale';
import {
    max,
    min
} from 'd3-array';
import {
    axisTop
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


import * as genealogyData from './genealogyData'
import {
    Config
} from './config';




/**
 * Creates the genealogy tree view
 */
class genealogyTree {

    private $node;

    private data;

    private width;

    private height;

    private margin = {
        top: 60,
        right: 20,
        bottom: 60,
        left: 40
    };

    private x = scaleLinear();

    private y = scaleLinear();
    
    private startYPos;

    private interGenerationScale = scaleLinear();

    private self;

    private lineFunction = line < any > ()
        .x((d: any) => {
            return this.x(d.x);
        }).y((d: any) => {
            return this.y(d.y);
        })
        .curve(curveBasis);


    constructor(parent: Element) {
        this.$node = select(parent)
        this.self = this;
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

        let nodes = this.data.nodes; //.nodes;
        let edges = this.data.parentChildEdges;
        let parentEdges = this.data.parentParentEdges;

        this.width = 600 - this.margin.left - this.margin.right
        this.height = Config.glyphSize * 3 * nodes.length - this.margin.top - this.margin.bottom;

        // Scales
        this.x.range([0, this.width]).domain([min(nodes, function(d) {
            return +d['bdate']
        }), max(nodes, function(d) {
            return +d['ddate']
        }) + 20]);
        this.y.range([0, this.height]).domain([min(nodes, function(d) {
            return d['y']
        }), max(nodes, function(d) {
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
            .attr("transform", "translate(" + this.margin.left + "," + (this.margin.top + Config.glyphSize) + ")")
            .classed('genealogyTree',true)
            .attr('id','genealogyTree')

        const edgePaths = graph.selectAll(".edges")
            .data(edges)
            .enter().append("path")
            .attr("class", "edges")
            // .style("stroke", function (d) {
            //     return d.color
            // })
            // .style("fill", 'none')
            .attr("d", (d) => {
                return this.elbow(d, this.interGenerationScale, this.lineFunction)
            })
            .attr("stroke-width", 3)
            .on('click', function(d) {
                console.log(d)
            });


        const parentEdgePaths = graph.selectAll(".parentEdges")
            .data(parentEdges)
            .enter().append("path")
            .attr("class", "parentEdges")
            // .style("stroke", function (d) {
            //     return d.color
            // })
            .style("stroke-width", 4)
            .style("fill", 'none')
            .attr("d", (d) => {
                return this.parentEdge(d, this.lineFunction)
            })
            
       let allNodes = graph.selectAll(".node")
        .data(nodes)
        .enter()
        .append("g")
        .attr('class',(d)=>{return 'row_' + d['y']})
        .classed('node','true')
        
       


//Add life line groups
    const lifeRects = allNodes.append("g")
        .attr('class', 'lifeRect')
        .attr("transform",  (d:any) => {
            return d.sex == 'M' ? "translate(0,0)" : "translate(0," + (- Config.glyphSize) + ")";
        });

    //Add actual life lines
    lifeRects.filter(function (d:any) {
        return (+d.deceased == 1);
    })
        .append("rect")
        .attr('y', Config.glyphSize)
        .attr("width",  (d)=> {
            return Math.abs(this.x(d['ddate']) - this.x(d['bdate']));
        })
        .attr("height", Config.glyphSize / 4)
        .style('fill',  (d:any)=> {
            return (+d.affection == 100) ? "black" : "#e0dede";
        })
        .style('opacity', .8)
//         .style('stroke','none')

    //Add label to lifelines
    lifeRects
        .append("text")
        // .attr("y", glyphSize )
        .attr("dy", Config.glyphSize * 0.8)
        .attr("dx", (d) => {
            return Math.abs(this.x(d['ddate']) - this.x(d['bdate']));
        })
        .attr("text-anchor", 'end')
        .text(function (d) {
            return Math.abs(+d['ddate'] - +d['bdate']);
        })
        .attr('fill', function (d:any) {
            return (+d.affection == 100) ? "black" : "#e0dede";
        })
        .style('font-size', Config.glyphSize * 1.5)
        .style('font-weight','bold');
            
        
        
    
	//Add cross through lines for deceased people
    allNodes.filter(function (d:any) {
        return (+d.deceased == 1);
    })
        .append("line")
        .attr("x1", function (d:any) {
            return d.sex == 'F' ? -Config.glyphSize : -Config.glyphSize / 2;
        })
        .attr("y1", function (d:any) {
            return d.sex == 'F' ? -Config.glyphSize : -Config.glyphSize / 2;
        })
        .attr("x2", function (d:any) {
            return d.sex == 'F' ? Config.glyphSize : Config.glyphSize * 2.5;
        })
        .attr("y2", function (d:any) {
            return d.sex == 'F' ? Config.glyphSize : Config.glyphSize * 2.5;
        })
        .attr("stroke-width", 3)
        .attr("stroke", "black");
        
        
   allNodes.filter(function (d:any) {
        return d['sex'] == 'M';
    })  
        .append("rect")
        .classed('male',true)
        .classed('nodeIcon',true)
        .attr("width", Config.glyphSize * 2)
        .attr("height", Config.glyphSize * 2);



    //Add female node glyphs
    allNodes.filter(function (d:any) {
        return d['sex'] == 'F';
    })
        .append("circle")
        .classed('female',true)
        .classed('nodeIcon',true)
        .attr("r", Config.glyphSize);



    //Position and Color all Nodes
      allNodes
        .attr("transform", (d)=> {
            return "translate(" + this.xPOS(d) + "," + this.yPOS(d) + ")";
        })
        .style("fill", function (d:any) {
            return (+d.affection == 100) ? "black" : "white";
        })
        .attr('id',(d)=> {return 'g_' + d['id']} )
        .style("stroke-width", 3)


    graph.selectAll('g.node')
        .append('text')
        .attr('class', 'ageLabel')
        // .attr('visibility','hidden')
        .text(function (d:any) {
            if (+d.ddate > 0) {
                return Math.abs(d['ddate'] - d['bdate']);
            }
            else
                return Math.abs(2016 - d['bdate']);
        })
        .attr('dx', function (d) {
            return d['sex'] == 'M' ? Config.glyphSize / 2 : -Config.glyphSize / 2;
        })
        .attr('dy', function (d) {
            return d['sex'] == 'M' ? 1.5 * Config.glyphSize : Config.glyphSize / 2;
        })
        .attr('fill', function (d:any) {
            return (+d.affection == 100) ? "white" : "black";
        })
        .attr('stroke', 'none');
        
        

        allNodes.call(drag()
      .on("start",(d)=>{
	         this.startYPos = this.y.invert(mouse(<any>select('.genealogyTree').node())[1]);
	         
	         //Create phantom node
	         const Node = document.getElementById('g_' + d['id'])
	         const phantomNode = Node.cloneNode(true)
	            
	         phantomNode.setAttribute('class', 'phantom node');        

	         document.getElementById('genealogyTree').appendChild(phantomNode)
      })
      .on("drag", (d)=>{
      
      const node_group = select('#g_' + d['id']);    
      const currentPos  = mouse(<any>select('.genealogyTree').node());
      
      node_group.attr("transform", ()=> {
        return "translate(" + this.xPOS(d) + "," + currentPos[1] + ")";
      })
      
      //Check to see where the current i is
    

 })
      .on("end",(d)=>{
	  
 	  selectAll('.phantom').remove();  
	    
	  const node_group = select('#g_' + d['id']);   
	  
// 	  node_group.select('.lifeRect').attr('visibility','hidden') 
	  
      const currentPos  = mouse(<any>select('.genealogyTree').node());
      
      node_group.classed('row_' + d['y'], false);
      
      d['y'] = Math.round(this.y.invert(currentPos[1]))
      
      node_group.attr("transform", ()=> {
        return "translate(" + this.xPOS(d) + "," + this.yPOS(d) + ")";
      })
      
      node_group.classed('row_' + d['y'], true);
      
      const row_nodes = selectAll('.row_' + d['y']);
      
      row_nodes
      .selectAll('.lifeRect').attr('visibility','hidden');
      row_nodes.classed('aggregate', true)
	      
	      
      }));
      
    }
    
    
    
        //End of Build Function
    
	private create_phantom(){
		
		
	}
	
	private update_pos(){
		
		
	}
	
	private delete_phantom(){
		
		
	
	}
	
	
    private xPOS(node){
    if (node['sex'] == 'F')
            return this.x(node.x);
    else
            return this.x(node.x)-Config.glyphSize;
}

	private yPOS(node){
    if (node['sex'] == 'F')
            return this.y(node.y);
    else
        return this.y(node.y)-Config.glyphSize
}



    private attachListener() {

        //Fire Event when first rect is clicked
        this.$node.selectAll('.node')
            .on('mouseover', function(e) { 
                events.fire('node_hover_on', select(this).attr('id'));
            })
            .on('mouseout', function(e) { 
                events.fire('node_hover_off', select(this).attr('id'));
            });
    }

    private elbow(d, interGenerationScale, lineFunction) {
        const xdiff = d.source.x - d.target.x;
        const ydiff = d.source.y - d.target.y;
        const nx = d.source.x - xdiff * interGenerationScale(ydiff);

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
            lineFunction.curve(curveBasis);
        else
            lineFunction.curve(curveLinear);

        return lineFunction(linedata);
    }

    private parentEdge(d, lineFunction) {
        const linedata = [{
            x: d.x1,
            y: d.y1
        }, {
            x: d.x2,
            y: d.y2
        }];
        return lineFunction(linedata);
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