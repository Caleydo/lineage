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
    scaleLinear
} from 'd3-scale';
import {
    max,
    min,
    ticks,
    range,
    extent
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

	private timer;
		
    private width;

    private height;

    private margin = Config.margin;

	//Time scale for visible nodes
    private x = scaleLinear();
    
    //Time scale for nodes outside the viewport
    private x2 = scaleLinear();

	
    private y = scaleLinear();

	//Axis for the visible nodes
	private visibleXAxis;
	
	//Axis for the nodes outside of the viewport
	private extremesXAxis;

    private startYPos;

    private aggregating_levels;

    private interGenerationScale = scaleLinear();

    private self;
    
//     private t = transition('t').duration(500).ease(easeLinear);

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
        this.eventHandler(); 
          

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
            
        this.y.range([0, this.height]).domain([min(nodes, function(d) {
            return d['y']
        }), max(nodes, function(d) {
            return d['y']
        })])
        
        this.visibleXAxis = axisTop(this.x).tickFormat(format("d"))
        this.extremesXAxis = axisTop(this.x2)
        
//         select(this.xAxis).selectAll('text').attr('font-size',Config.glyphSize * 1.5)
       
       
        //xrange should be defined based only on what is visible on the screen. 

        //When the user scrolls, the x (time) axis should be updated as should the position of all the elements on the screen. 
        
        this.interGenerationScale.range([.75, .25]).domain([2, nodes.length]);
        
        const svg = this.$node.append('svg')
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .attr('id', 'graph')


		
        //Create group for all axis
        const axis = svg.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top / 1.5 + ")")
            .attr('id', 'axis')
            
        axis.append("g")
        .attr('id','visible_axis')
        .call(this.visibleXAxis)
        
        axis.append("g")
        .attr('id','extremes_axis')
        .call(this.extremesXAxis)
            
		//Add scroll listener for the graph table div	
        document.getElementById('graph_table').addEventListener('scroll', () => {      
		    this.update_time_axis();  
		    /* clear the old timeout */
		    clearTimeout(this.timer);
		    /* wait until 100 ms for callback */
		    this.timer = setTimeout(()=>{this.update_visible_nodes()}, 30);
		});    
		
		//Create group for genealogy tree
        svg.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + (this.margin.top + Config.glyphSize) + ")")
            .classed('genealogyTree', true)
            .attr('id', 'genealogyTree')
          

        //Filter data to only render what is visible in the current window
        this.update_time_axis();

		//Call function that updates the position of all elements in the tree	
        this.update_graph(this.data.nodes, this.data.parentChildEdges, this.data.parentParentEdges)
    }

    //End of Build Function
    
    
    private update_graph(nodes, edges, parentEdges) {	    
	    this.update_edges(nodes,edges,parentEdges);
	    this.update_nodes(nodes,edges,parentEdges)
       }

	//Function that updates the position of all element in the genealogy tree
    private update_edges(nodes, edges, parentEdges) {
	    
	    let t = transition('t').duration(500).ease(easeLinear);

        let graph = select('#genealogyTree')
        
        let edgePaths= graph.selectAll(".edges")
            .data(edges,function(d) {return d['id'];});
            
        //remove extra paths
        edgePaths.exit().transition().duration(400).style('opacity',0).remove();
        
        let edgePathsEnter = edgePaths
        .enter()
        .append("path"); 
        
        edgePaths = edgePathsEnter.merge(edgePaths);
        
        
        edgePathsEnter.attr('opacity',0);
        
        edgePaths
        .attr("class", "edges")
        .transition(t)
        .attr("d", (d) => {
            return this.elbow(d, this.interGenerationScale, this.lineFunction)
        })
        
        
         edgePaths
            .transition(t.transition().ease(easeLinear))
            .attr('opacity',1);
            
            
	   edgePaths
        .attr("stroke-width", Config.glyphSize/4)


        let parentEdgePaths = graph.selectAll(".parentEdges")
            .data(parentEdges,function(d) {return d['id'];});
            
            
        parentEdgePaths.exit().transition().duration(400).style('opacity',0).remove();
            
        let parentEdgePathsEnter = parentEdgePaths    
            .enter()
            .append("path");
           
        parentEdgePathsEnter.attr('opacity',0)
            
            
        parentEdgePaths = parentEdgePathsEnter.merge(parentEdgePaths);
        
        parentEdgePaths
            .attr("class", "parentEdges")
            .attr("stroke-width", Config.glyphSize/4)
            .style("fill", 'none')
            .transition(t)
            .attr("d", (d) => {
                return this.parentEdge(d, this.lineFunction)
            })
            
        parentEdgePaths
            .transition(t.transition().ease(easeLinear))
            .attr('opacity',1);

    };
            
    private update_nodes(nodes, edges, parentEdges) {
		
		console.log('called update_nodes')	    
	    let t = transition('t').duration(500).ease(easeLinear);

        let graph = select('#genealogyTree')        
        
        
        let allNodes = graph.selectAll(".node")
            .data(nodes.filter((d)=>{return d['visible']}), function(d) {return d['id'];});
            
        allNodes.exit().transition().duration(400).style('opacity',0).remove();
            
            
        let allNodesEnter = allNodes
            .enter()
            .append("g");
            
        allNodes = allNodesEnter.merge(allNodes);
        
        allNodes
            .attr('class', (d) => {
                return 'row_' + d['y']
            })
            .classed("node", true)
            
            //Attach background rectangle to all rows and set to invisible (will be visible on hover)
		allNodesEnter 
		.append('rect')
		.classed('backgroundBar',true);
		
		allNodes
		.selectAll('.backgroundBar')
		.attr("width", (d)=>{return (max(this.x.range())- min(this.x.range()) + this.margin.right);})
		.attr('x',(d)=>{ return (min([- this.x(d['x']),-this.x2(d['x'])]))})
	    .attr("height", Config.glyphSize *2)
	    .attr("transform", (d: any) => {
                return d.sex == 'M' ? "translate(" + Config.glyphSize +  ",0)" : "translate("+ 0 + "," + (-Config.glyphSize) + ")";
        })
        
        allNodes
		.selectAll('.backgroundBar')
        .attr('opacity', 0)
        .on('mouseover',function(d){
	            select(this).attr('opacity',.2 )
				selectAll('.ageLabel').attr('visibility','hidden');	
	            select('.row_' + d['y']).select('.lifeRect').select('.ageLabel').attr('visibility','visible');		                   
			})
		.on('mouseout', ()=>{selectAll('.backgroundBar').attr('opacity', 0)})
		

            
		

        //Add life line groups
        let lifeRectsEnter = allNodesEnter.append("g");
        
        let lifeRects = allNodes.selectAll('g')
        
        lifeRects.exit().remove()
        
        lifeRects        
            .attr('class', 'lifeRect')
            .attr("transform", (d: any) => {
                return d.sex == 'M' ? "translate(" + Config.glyphSize + ",0)" : "translate(0," + (-Config.glyphSize) + ")";
            });

        //Add actual life lines
        lifeRectsEnter
/*
            .filter(function(d: any) {
                return (+d.deceased == 1);
            })
*/
            .append("rect")
            
        lifeRects.selectAll('rect')
            .attr('y', Config.glyphSize)
            .attr("width", (d) => {
				let year = new Date().getFullYear();

	            let ageAtDeath = Math.abs(this.x(d['ddate']) - this.x(d['bdate'])) ;
	            let ageToday = Math.abs(this.x(year) - this.x(d['bdate'])) 
		        return (+d['deceased'] == 1) ?  ageAtDeath :  ageToday;
            })
            .attr("height", Config.glyphSize / 4)
            .style('fill', (d: any) => {
                return (+d.affection == 100) ? "black" : "#9e9d9b";
            })
            .style('opacity', .8)
        //         .style('stroke','none')

        //Add label to lifelines
        lifeRectsEnter
            .append("text")
            .attr('class','ageLabel')
            
         lifeRects.selectAll('.ageLabel')   
            // .attr("y", glyphSize )
            .attr("dy", Config.glyphSize * 0.8)
            .attr("dx", (d) => {
	            let year = new Date().getFullYear();
	            
	            let ageAtDeath = Math.abs(this.x(d['ddate']) - this.x(d['bdate'])) ;
	            let ageToday = Math.abs(this.x(year) - this.x(d['bdate'])) 
	            
                return (+d['deceased'] == 1) ?  ageAtDeath :  ageToday;  
//                 return Math.abs(this.x(d['ddate']) - this.x(d['bdate']));
            })
            .attr("text-anchor", 'end')
            .text(function(d) {
	            let year = new Date().getFullYear();
	            
	            let ageAtDeath = (d['ddate']- d['bdate']) ;
	            let ageToday = (year - d['bdate']) 
	            
                return (+d['deceased'] == 1) ?  ageAtDeath :  ageToday;  
                
//                 return Math.abs(+d['ddate'] - +d['bdate']);
            })
            .attr('fill', function(d: any) {
                return (+d.affection == 100) ? "black" : "#9e9d9b";
            })
            .style('font-size', Config.glyphSize * 1.5)
            .style('font-weight', 'bold')
            .attr('visibility','hidden');
            
            
        //Add cross at the end of lifelines for deceased people
        lifeRectsEnter.filter(function(d: any) {
                return (+d.deceased == 1);
            })
            .append("line")
            .attr('class','endOfTheLine')
            
            
            
        lifeRects.selectAll('.endOfTheLine')    
            .attr("x1", (d: any)=> {
	            return (Math.abs(this.x(d['ddate']) - this.x(d['bdate']))+ Config.glyphSize / 2) ;                                 
            })
            .attr("y1", function(d: any) {
                return Config.glyphSize/2 ;
            })
            .attr("x2", (d: any)=> {
	            return Math.abs(this.x(d['ddate']) - this.x(d['bdate']) -Config.glyphSize / 2) ;    
            })
            .attr("y2", function(d: any) {
	            
                return Config.glyphSize*2 ;
            })
            .attr("stroke-width", 2)
            .attr("stroke", function(d: any) {
                return (+d.affection == 100) ? "black" : "#9e9d9b";
            })

        //Add cross through lines for deceased people
        allNodesEnter.filter(function(d: any) {
                return (+d.deceased == 1);
            })
            .append("line")
            .attr('class','nodeLine')
            
        allNodes.selectAll('.nodeLine')    
            .attr("x1", function(d: any) {
                return d.sex == 'F' ? -Config.glyphSize : -Config.glyphSize / 2;
            })
            .attr("y1", function(d: any) {
                return d.sex == 'F' ? -Config.glyphSize : -Config.glyphSize / 2;
            })
            .attr("x2", function(d: any) {
                return d.sex == 'F' ? Config.glyphSize : Config.glyphSize * 2.5;
            })
            .attr("y2", function(d: any) {
                return d.sex == 'F' ? Config.glyphSize : Config.glyphSize * 2.5;
            })
            .attr("stroke-width", 3)
            .attr("stroke", "black");


		//Add Male Node glyphs	
        allNodesEnter.filter(function(d: any) {
                return d['sex'] == 'M';
            })
            .append("rect")
            .classed('male', true)
                     
        allNodes.selectAll('.male')
//             .classed('male', true)
            .classed('nodeIcon', true)
            .attr("width", Config.glyphSize * 2)
            .attr("height", Config.glyphSize * 2);

			
        //Add female node glyphs
        allNodesEnter.filter(function(d: any) {
                return d['sex'] == 'F';
            })
            .append("circle")
            .classed('female', true);
            
        allNodes.selectAll('.female')
            .classed('nodeIcon', true)
            .attr("r", Config.glyphSize);


		allNodesEnter.attr('opacity',0);
	
		allNodes
		.on("click",function(){
			//'Unselect all other background bars if ctrl was not pressed
			if (!event.shiftKey){
			selectAll('.backgroundBar').classed('selected',false); 
			}
			
			select(this).select('.backgroundBar').classed('selected',function(){
				return (!select(this).classed('selected'));
			})
		})
        
	
        //Position and Color all Nodes
        allNodes
         	.transition(t)
            .attr("transform", (d) => {
                return "translate(" + this.xPOS(d) + "," + this.yPOS(d) + ")";
            })
            .style("fill", function(d: any) {
                return (+d.affection == 100) ? "black" : "white";
            })
            .attr('id', (d) => {
                return 'g_' + d['id']
            })
            .style("stroke-width", 3);
            
            
        allNodes
            .transition(t.transition().ease(easeLinear))
            .attr('opacity',1);


        allNodesEnter
            .append('text')
            .attr('class','nodeLabel')
            
        allNodes.selectAll('.nodeLabel')
            // .attr('visibility','hidden')
            .text(function(d: any) {
	            let year = new Date().getFullYear();
                                            if (+d.ddate > 0) {
                                return Math.abs(d['ddate'] - d['bdate']);
                            }
                            else
                                return Math.abs(year - d['bdate']);
               
            })
            .attr('dx', function(d) {
                return d['sex'] == 'M' ? Config.glyphSize / 2 : -Config.glyphSize / 2;
            })
            .attr('dy', function(d) {
                return d['sex'] == 'M' ? 1.5 * Config.glyphSize : Config.glyphSize / 2;
            })
            .attr('fill', function(d: any) {
                return (+d.affection == 100) ? "white" : "black";
            })
            .attr('stroke', 'none')
            .style('font-size', Config.glyphSize)


/*
			select('#genealogyTree')
			.on('mouseover',function(){
	            console.log('here')
// 	            select(this).select('.hovered').attr('visibility', 'visible' )	        
			})
*/
// 			.on('mouseout', ()=>{selectAll('.hovered').attr('visibility', 'hidden')})

/*
        allNodes.call(drag()
            .on("start", (d) => {
                this.startYPos = this.y.invert(mouse( < any > select('.genealogyTree').node())[1]);
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


                //this.update_pos(d)
                this.update_pos_row('.row_' + Math.round(this.startYPos))
                
                //Call function that updates the position of all elements in the tree	
				this.update_edges(this.data.nodes, this.data.parentChildEdges, this.data.parentParentEdges)

            })

            .on("end", (d) => {
                this.aggregating_levels.add(this.closestY())
                
                let indexes = Array.from(this.aggregating_levels);
                
                this.data.aggregateNodes(Math.min.apply(null,indexes),Math.max.apply(null,indexes));
                
                this.update_visible_nodes()
                
                
                //this.aggregating_levels.forEach((level) => {
                //    this.delete_phantom(this.get_row_data('.row_' + level))
                //});
                
            }));
*/

/*
			 allNodesEnter 
			 .append("svg:image")
			 .attr("xlink:href", "./icons/gear.svg")
			 .attr("width", Config.glyphSize*2)
			 .attr("height", Config.glyphSize*2)
*/



	
          
           


    }

	private update_time_axis(){
		
		
		let scrollOffset = document.getElementById('graph_table').scrollTop;
        let divHeight = document.getElementById('graph_table').offsetHeight;

        // 	          console.log(divHeight, this.y(65),this.y(72), (divHeight + scrollOffset) - 75)

        let minY = this.y.invert(scrollOffset);
        let maxY = this.y.invert(divHeight + scrollOffset - 75)

        //the 75 offset is the transform applied on the group

        //Filter data to adjust x axis to the range of nodes that are visible in the window. 

        let filtered_nodes = this.data.nodes.filter((d) => {
            return d['y'] >= Math.round(minY) && d['y'] <= Math.round(maxY)
        });

		let filtered_domain = [min(filtered_nodes, function(d) {return +d['bdate']-5}), 
        max(filtered_nodes, function(d) {return +d['ddate'] + 5}) ];
        
        
        let all_domain = [min(this.data.nodes, function(d) {return +d['bdate']-5}), 
        max(this.data.nodes, function(d) {return +d['ddate']}) + 5];
       
		//Build time axis
        
        //for visible nodes
        let x_range = [0];
        let x_domain=[all_domain[0]];
        let x_ticks=[all_domain[0]]
        
        //for out of scope nodes
        let x2_range =[0];
        let x2_domain=[all_domain[0]];
        let x2_ticks = [];
        
       
		//If there are hidden nodes older than the first visible node
		if (all_domain[0] < filtered_domain[0]){
			x_range.push(this.width*0.05);
			x_domain.push(filtered_domain[0])
			x_ticks.push(filtered_domain[0])
			
			
			x2_range.push(this.width*0.05);
			x2_domain.push(filtered_domain[0])
			
			//Add tick marks
			let left_range = range(all_domain[0],filtered_domain[0],10);
			x2_ticks = left_range;		
			
		}
		
		x_ticks = x_ticks.concat(ticks(filtered_domain[0],filtered_domain[1],10));
        		
		
		if (all_domain[1] != filtered_domain[1]){
			
			x_range.push(this.width*0.95);
			x_domain.push(filtered_domain[1])
			x_ticks.push(filtered_domain[1])
			
			x2_range.push(this.width*0.95)
			x2_domain.push(filtered_domain[1])
			
			x2_range.push(this.width)
			x2_domain.push(all_domain[1])
						
			let right_range = range(filtered_domain[1],all_domain[1],10);
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
       	.attr('opacity',.6);
       	
       select('#extremes_axis')  
//         .transition(t2)  
        .call(this.extremesXAxis)
        
      select('#extremes_axis')
      .transition(t2)
      .attr('opacity',.6)  
        
        select("#axis")
        .attr("transform", "translate(" + this.margin.left + "," + (scrollOffset + this.margin.top / 1.5) + ")")
        
        select('#visible_axis')
            .selectAll("text")	
			.attr("dx", "1.5em")
			.attr("dy", "-.15em")
			.attr("transform", "rotate(-35)");
        
    }
        
        
    private update_visible_nodes(){
        
        let scrollOffset = document.getElementById('graph_table').scrollTop;
        let divHeight = document.getElementById('graph_table').offsetHeight;

        // 	          console.log(divHeight, this.y(65),this.y(72), (divHeight + scrollOffset) - 75)

        let minY = this.y.invert(scrollOffset);
        let maxY = this.y.invert(divHeight + scrollOffset - 75)

        let filtered_nodes = this.data.nodes.filter((d) => {
            return d['y'] >= Math.round(minY) 
        });
        
        
        let filtered_parentParentEdges = this.data.parentParentEdges.filter((d) => {
            return d['y2'] >= Math.round(minY)         });
        
        let filtered_parentChildEdges = this.data.parentChildEdges.filter((d) => {
            return d.target.y >= Math.round(minY) 
        });
      
            
    //Call function that updates the position of all elements in the tree	
        this.update_graph(filtered_nodes, filtered_parentChildEdges, filtered_parentParentEdges)
        
            
	        
	}



    private create_phantom(d) {

        let phantom = selectAll('#g_' + d['id']);

        if (phantom.size() == 1) {
            //Create phantom node
            const Node = document.getElementById('g_' + d['id'])

            let phantomNode = Node.cloneNode(true)

            //phantomNode.setAttribute("class", "phantom node");   
            //document.getElementById('genealogyTree').appendChild(phantomNode)

        }
    }

    //Update position of a group based on data 
    private update_pos(d) {

        const node_group = select('#g_' + d['id']);
        const currentPos = mouse( < any > select('.genealogyTree').node());

        node_group.attr("transform", () => {
            return "translate(" + this.xPOS(d) + "," + currentPos[1] + ")";
        })
    }

    //Update position of a group based on a class
    private update_pos_row(class_id) {

        const row_nodes = select(class_id);

        const currentPos = mouse( < any > select('.genealogyTree').node());

        const node = row_nodes.data()[0];

        node['y'] = this.y.invert(currentPos[1])

        row_nodes.attr("transform", () => {
            return "translate(" + this.xPOS(node) + "," + this.yPOS(node) + ")";
        })
    }

    private get_row_data(class_id) {
        return select(class_id).data()[0];

    }



    private closestY() {
        const currentPos = mouse( < any > select('.genealogyTree').node());
        return Math.round(this.y.invert(currentPos[1]))
    }

    private ceilY() {
        const currentPos = mouse( < any > select('.genealogyTree').node());
        return Math.ceil(this.y.invert(currentPos[1]))
    }

    private floorY() {
        const currentPos = mouse( < any > select('.genealogyTree').node());
        return Math.floor(this.y.invert(currentPos[1]))
    }

    private delete_phantom(d) {
        selectAll('.phantom').remove();

        const node_group = select('#g_' + d['id']);

        // 	  node_group.select('.lifeRect').attr('visibility','hidden') 

        const closestY = this.closestY()


        if (d['y'] != closestY) {
            node_group.classed('row_' + d['y'], false);
            d['y'] = closestY;
            node_group.classed('row_' + d['y'], true);

            const row_nodes = selectAll('.row_' + d['y']);

            //Hide all life lines
            row_nodes
                .selectAll('.lifeRect').attr('visibility', 'hidden');
            row_nodes.classed('aggregate', true)
        }



        node_group.attr("transform", () => {
            return "translate(" + this.xPOS(d) + "," + this.yPOS(d) + ")";
        })


    }


    private xPOS(node) {
        if (node['sex'] == 'F')
            return this.x(node.x);
        else
            return this.x(node.x) - Config.glyphSize;
    }

    private yPOS(node) {
        if (node['sex'] == 'F')
            return this.y(node.y);
        else
            return this.y(node.y) - Config.glyphSize
    }



    private eventHandler() {
	    
        //Fire Events when a row is hovered or selected
        this.$node.selectAll('.backgroundBar')
            .on('mouseover', function(e) {
                events.fire('row_mouseover', e['id']);
            })
            .on('mouseout', function(e) {
                events.fire('row_mouseout', e['id']);
            })
            .on('click',function(e){
	            events.fire('row_selected', e['id']);
            })
    }

    private elbow(d, interGenerationScale, lineFunction) {
        const xdiff = d.ma.x - d.target.x;
        const ydiff = d.ma.y - d.target.y;
        const nx = d.ma.x - xdiff * interGenerationScale(ydiff);

        const linedata = [{
            x: (d.ma.x + d.pa.x)/2,
            y: (d.ma.y + d.pa.y)/2
        }, {
            x: nx,
            y: (d.ma.y + d.pa.y)/2
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
            x: d['ma'].x ,
            y: d['ma'].y
        }, {
            x: d['pa'].x,
            y: d['pa'].y
        }];
        return lineFunction(linedata);
    }
    
//     
    
  private menu(x, y) {
        select('#context-menu').remove();
        
        console.log(x,y)
        
        let height = Config.glyphSize*4;
        let width = height;
        let margin = 0.1;
        
		let items = ['first item', 'second option', 'whatever, man'];
		
/*
		let style = {
            'rect': {
                'mouseout': {
                    'fill': 'rgb(244,244,244)', 
                    'stroke': 'white', 
                    'stroke-width': '1px'
                }, 
                'mouseover': {
                    'fill': 'rgb(200,200,200)'
                }
            }, 
            'text': {
                'fill': 'steelblue', 
                'font-size': '13'
            }
            };
*/
        // Draw the menu
        select('#graph')
            .append('g')
            .attr('id', 'context-menu')
            .selectAll('tmp')
            .data(items).enter()
            .append('g').attr('class', 'menu-entry')
//             ./* style */({'cursor': 'pointer'})
            .on('mouseover', function(){ 
                select(this).select('rect').attr('class','rect-mouseover')}) //(style.rect.mouseover) })
            .on('mouseout', function(){ 
                select(this).select('rect').attr('class','rect-mouseover')}); //style(style.rect.mouseout) });
        
        selectAll('.menu-entry')
            .append('rect')
            .attr('x', x)
            .attr('y', function(d, i){ return y + (i * height); })
            .attr('width', width)
            .attr('height', height)
//             .style(style.rect.mouseout);
        
        selectAll('.menu-entry')
            .append('text')
            .text(function(d){ return 'test'; })
            .attr('x', x)
            .attr('y', function(d, i){ return y + (i * height); })
            .attr('dy', height - margin / 2)
            .attr('dx', margin)
//             .style(style.text);

        // Other interactions
/*
        select('body')
            .on('click', function() {
                select('#context-menu').remove();
            });
*/

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