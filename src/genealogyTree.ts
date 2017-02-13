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
    
    private colors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00'];
    
//     private colorScale = scaleLinear().domain([1,2,3,4,5,6,7,8]).range(this.colors)
    
    
    
    //Data attributes to draw hexagons for aggregate rows    
    private hexSize = Config.glyphSize*1.25;
    
    private hexData = [{x:this.hexSize, y:0}, 
    {x:this.hexSize/2, y:this.hexSize*Math.sqrt(3)/2}, 
    {x:-this.hexSize/2, y:this.hexSize*Math.sqrt(3)/2},
    {x:-this.hexSize, y:0},
    {x:-this.hexSize/2, y:-this.hexSize*Math.sqrt(3)/2},
    {x:this.hexSize/2, y:-this.hexSize*Math.sqrt(3)/2},
    {x:this.hexSize, y:0}];
    
    private hexLine = line < any > ()
    .x(function(d){ return d['x']; })
    .y(function(d){ return d['y']; });
   

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
    }

    /**
     * Initialize the view and return a promise
     * that is resolved as soon the view is completely initialized.
     * @returns {Promise<FilterBar>}
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
            
        this.y.range([0, this.height]).domain([min(nodes, function(d) {
            return d['y']
        }), max(nodes, function(d) {
            return d['y']
        })])
        
        this.visibleXAxis = axisTop(this.x).tickFormat(format("d"))
        this.extremesXAxis = axisTop(this.x2)
        
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
		    this.timer = setTimeout(()=>{this.update_visible_nodes()}, 100);
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
            .data(edges.filter(function(d){ return !d['target']['collapsed']}),function(d) {return d['id'];});
            
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


        let parentEdgePaths = graph.selectAll(".parentEdges")// only draw parent parent edges if neither parent is collapsed
            .data(parentEdges.filter(function(d){return !d['ma']['collapsed'] || !d['pa']['collapsed']}),function(d) {return d['id'];});
            
            
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
		
/* 		console.log */('called update_nodes')	    
	    let t = transition('t').duration(500).ease(easeLinear);

        let graph = select('#genealogyTree')        
        
        
        let allNodes = graph.selectAll(".node")
            .data(nodes.filter((d)=>{return d['visible']}), function(d) {return d['id'];});
            
        allNodes.exit().transition().duration(400).style('opacity',0).remove();
            
        
          
        let allNodesEnter = allNodes
            .enter()
            .append("g");
            
//             console.log('allNodesEnter has ', allNodesEnter.size()  ,  'nodes');
            

            
        allNodes = allNodesEnter.merge(allNodes);
        
        allNodes
            .attr('class', (d) => {
                return 'row_' + d['y']
            });
            
        allNodes
            .classed("node", true)
            .classed("collapsed",(d)=>{return d['collapsed']})
            
     
            
        //Attach background rectangle to all rows and set to invisible (will be visible on hover)
		allNodesEnter.filter((d)=>{return !d['collapsed']}) 
		.append('rect')
		.classed('backgroundBar',true);
	
		
/*
		//Remove backgroundBar for nodes that were collapsed
		allNodes.filter((d)=>{return d['collapsed']})
		.select('.backgroundBar').remove();
*/
		
		
		allNodes
		.selectAll('.backgroundBar')
		.attr("width", (d)=>{return (max(this.x.range())- min(this.x.range()) + this.margin.right);})
		.attr('x',(d)=>{ return -this.x(d['x'])}) 
	    .attr("height", Config.glyphSize *2)
	    .attr("transform", (d: any) => {
                return d.sex == 'M' ? "translate(" + Config.glyphSize +  ",0)" : "translate("+ 0 + "," + (-Config.glyphSize) + ")";
        })
//         .classed('selected',(d)=>{return d['clicked']}) for now
        
/*
        let mouseoverCallback = 
        let mouseOutCallback = 
        let clickCallback = 
*/
        allNodes
		.selectAll('.backgroundBar')
        .attr('opacity', 0);
        
        selectAll('.backgroundBar')
        .on('mouseover',function(d:any){
	            select(this).attr('opacity',.2)
	            select('.row_' + d['y']).filter((d)=>{return !d['collapsed']}).select('.lifeRect').select('.ageLabel').attr('visibility','visible');
	            selectAll('.row_' + d['y']).filter('.collapsed').attr('opacity',1)
	            selectAll('.row_' + d['y']).select('.hex').attr('opacity',0)	
	            	
	            
	        events.fire('row_mouseover', d['y']);                   
			})
		.on('mouseout', (d)=>{
			selectAll('.collapsed').attr('opacity',0)
			selectAll('.backgroundBar').attr('opacity', 0)
			selectAll('.ageLabel').attr('visibility','hidden');	
			selectAll('.row_' + d['y']).select('.hex').attr('opacity',1)			
			events.fire('row_mouseout', d['y']);
			})
		
			
		//Move all node icons to the front. 	
// 		allNodes.selectAll('.nodeIcon').select(this).parentNode.appendChild(this)});
            
		

        //Add life line groups
        let lifeRectsEnter = allNodesEnter.filter((d)=>{return d['type'] == 'single'}).append("g");
        
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

			
		//Add Aggregate Node glyphs	
        allNodesEnter.filter(function(d: any) {
                return d['type'] == 'aggregate';
            })
            .append("path")
            .attr("d", this.hexLine(this.hexData))
            .classed('hex', true)
                     
        allNodes.selectAll('.hex')
//             .classed('male', true)
            .classed('nodeIcon', true)

		//Add Male Node glyphs	
        allNodesEnter.filter(function(d: any) {
                return d['sex'] == 'M';
            })
            .append("rect")
            .classed('male', true)
            
/*
           console.log('allNodesEnter has ', allNodesEnter.filter(function(d: any) { console.log('looking at ', d)
                return d['sex'] == 'M';
            }).size() , ' male nodes'  );
*/
                     
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
// 		.on("click",function(d){console.log('clicked')});
		
        //Position and Color all Nodes
        allNodes
         	.transition(t)
            .attr("transform", (d) => {
                return "translate(" + this.xPOS(d) + "," + this.yPOS(d) + ")";
            })
            .style("fill", (d: any)=> {
	            return (+d.affection == 100) ? "black" : "white" 
//                 return interpolateViridis(d['maxBMI'][0]/6);
            })
            .attr('id', (d) => {
                return 'g_' + d['id']
            })
            .style("stroke-width", 3);
//             .style("stroke-width", 3);
            
        let tran = t.transition().ease(easeLinear)
        allNodes.filter((d)=> {return !d['collapsed']})
            .transition(tran)
            .attr('opacity',1);

            
        allNodes.filter((d)=> {return d['collapsed']})
            .transition(tran.duration(100))
            .attr('opacity',0);


        allNodesEnter
            .append('text')
            .attr('class','nodeLabel')
            
        allNodes.selectAll('.nodeLabel')
            // .attr('visibility','hidden')
            .text(function(d: any) {
	            
	            return d['maxBMI'].toString() 
/*
	            let year = new Date().getFullYear();
                                            if (+d.ddate > 0) {
                                return Math.abs(d['ddate'] - d['bdate']);
                            }
                            else
                                return Math.abs(year - d['bdate']);
*/
               
            })
            .attr('dx', function(d) {
                return d['sex'] == 'M' ? Config.glyphSize / 2 : -Config.glyphSize / 2;
            })
            .attr('dy', function(d) {
                return d['sex'] == 'M' ? 1.3 * Config.glyphSize : Config.glyphSize / 2.75;
            })
            .attr('fill', function(d: any) {
                return (+d.affection == 100) ? "white" : "black";
            })
            .attr('stroke', 'none')
            .style('font-size', Config.glyphSize)


		let dragged = drag()
            .on("start", (d) => {
	            
	            
	            console.log('started drag')
	            
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

                this.update_pos_row('.row_' + Math.round(this.startYPos))
                
                //Call function that updates the position of all elements in the tree	
				this.update_edges(this.data.nodes, this.data.parentChildEdges, this.data.parentParentEdges)
// 				event.stopPropagation()
            })

            .on("end", (d) => {
	            
	            this.update_pos_row('.row_' + Math.round(this.startYPos))
                this.aggregating_levels.add(this.closestY())
                
                let indexes = Array.from(this.aggregating_levels);
				
				console.log('aggregating ' , indexes , 'on click')
                this.data.aggregateNodes(indexes,[],[])   
                
                selectAll('.phantom').remove();
                
                if (indexes.length == 1){
					return;
	  			}

                this.update_visible_nodes()
                
                
            });
        
        
		allNodes
		.on('contextmenu',(d)=>{
			
			console.log(d['family_ids'].slice(-1));
			
			this.data.collapseFamilies(d['family_ids'].slice(-1))   
			this.update_visible_nodes()

			
			event.preventDefault(); console.log('right menu clicked')
			
			})
			
		.on("dblclick",(d)=>{
			
			if(d['collapsedNodes']){
				//clicked on an Aggregate Node
				console.log('double clicked on an aggregate')
				this.data.expandAggregates(d['collapsedNodes'].map((n)=>{return n['y']}))
				this.update_visible_nodes()   
			}
			
// 			this.update_visible_nodes()
			
			
		})
		
		.on('click',function(d){
	    	if (event.defaultPrevented) return; // dragged
	
		    let wasSelected = select(this).select('.backgroundBar').classed('selected');	
		    
			//'Unselect all other background bars if ctrl was not pressed
			if (!event.metaKey){
			selectAll('.backgroundBar').classed('selected',false); 
// 			console.log(selectAll('.selected').data())
			}
			
			select(this).select('.backgroundBar').classed('selected',function(){
				return (!wasSelected);
			})
			
// 			d['clicked'] = !wasSelected;
			
			if (!event.metaKey){
				events.fire('row_selected', d['y'],'multiple');
			}
			else{
				events.fire('row_selected', d['y'],'single');
			}
			
			
		})
// 		.call(dragged)      

		


    }
    
    
//     		private clicked 
		
		

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

            phantomNode.setAttribute("class", "phantom node");   
            document.getElementById('genealogyTree').appendChild(phantomNode)
//             console.log(phantom)

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

        let nodePos ={
	        'sex':node['sex'],
	        'x':node['x'],
	        'y':this.y.invert(currentPos[1])
        }
//         node['y'] = this.y.invert(currentPos[1])

        row_nodes.attr("transform", () => {
            return "translate(" + this.xPOS(nodePos) + "," + this.yPOS(nodePos) + ")";
        })
    }
    
    //Snap row to position
    private snap_pos_row(class_id) {

        const row_nodes = select(class_id);

        const currentPos = mouse( < any > select('.genealogyTree').node());

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

    
    private xPOS(node) {
        if (node['sex'] == 'M')
            return this.x(node.x)- Config.glyphSize;
        else
            return this.x(node.x) ;
    }

    private yPOS(node) {
        if (node['sex'] == 'M')
            return this.y(node.y)- Config.glyphSize;
        else
            return this.y(node.y) 
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
    
    
    private attachListeners(){
	    
	     events.on('table_row_selected', (evt, item)=> {
		     
		      let wasSelected = selectAll('.backgroundBar').filter((d)=>{return d['y']==item}).classed('selected');	
		    
			//'Unselect all other background bars if ctrl was not pressed
			if (!event.metaKey){
			selectAll('.backgroundBar').classed('selected',false); 
			}
			
			selectAll('.backgroundBar').filter((d)=>{return d['y']==item}).classed('selected',function(){
				return (!wasSelected);
			})	     
      
    });
    
    	     events.on('table_row_hover_on', (evt, item)=> {
	    	     
	    	     
	    	    selectAll('.backgroundBar').filter((d)=>{return d['y']==item}).attr('opacity',.2)
	            select('.row_' + item).filter((d)=>{return !d['collapsed']}).select('.lifeRect').select('.ageLabel').attr('visibility','visible');
	            selectAll('.row_' + item).filter('.collapsed').attr('opacity',1)
	            selectAll('.row_' + item).select('.hex').attr('opacity',0)	
	           
     
    });
    
    	     events.on('table_row_hover_off', (evt, item)=> {
	    	    selectAll('.collapsed').attr('opacity',0)
			selectAll('.backgroundBar').attr('opacity', 0)
			selectAll('.ageLabel').attr('visibility','hidden');	
			selectAll('.row_' + item).select('.hex').attr('opacity',1)      
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