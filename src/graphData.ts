/**
 * Created by Carolina Nobre on 01.22.2017
 */

/**
 * Class that represents the genealogy data
 */
 
 import {
    max,
    min,
    mean
} from 'd3-array';

class graphData {

  public nodes;
  
  private uniqueID;
  
  public parentChildEdges =[];
  
  public parentParentEdges = [];
  
  private nuclearFamilyCounter = 1;
  


  constructor(data) {

    this.nodes = data;
    
    this.uniqueID =[]; 
    //Initially set all nodes to visible and of type 'single' (vs aggregate)
    this.nodes.forEach(d=>
    {
      // d['index'] = d.id;
      d['type']  = 'single';
      d['visible']=true;
      d['collapsed']=false;
      d['bdate']=+d['bdate'];
      d['color']= +d['affection'] == 1 ? 'black' : 'white'
      d['generation'] = -1;
      d['descendant']=false; //flag for blood descendants of founders
      d['Y']=+d['y']; //keeps track of nodes original y position
      d['family_ids']=[]; //keeps track of nuclear families
      d['clicked']=false;
      
      
      this.uniqueID.push(+d['egoUPDBID']);

    });
    
    this.createEdges();
    this.computeGenerations();
  }  
  
  //Function that assigns a generation to each node.
  private computeGenerations(){
	//Find oldest couple and tag them as the founders
	this.nodes.sort((a,b)=>{return a['bdate'] - b['bdate']});  
	
	this.nodes[0]['generation']=0;
	this.nodes[1]['generation']=0;
	
	this.nodes[0]['family_ids']=[0,1];
	this.nodes[1]['family_ids']=[0,1];
	
	//for each couple, find all children and: 1) assign their generation 2)Tag them as 'descendants'
	this.nodes.forEach((n)=>{
		this.parentChildEdges.forEach((edge)=>{
			if (n == edge['ma'] || n == edge['pa']){
				
				 //If not already created, create new nuclear family
				 if (n['family_ids'].length>0){
					 
					 if (n['family_ids'].length==1){
						 this.nuclearFamilyCounter = this.nuclearFamilyCounter+1;
						 n['family_ids'].push(this.nuclearFamilyCounter)
					 }
					 	
					 if (n == edge['ma'] && edge['target']['family_ids'].length == 0){
						 edge['target']['family_ids'].push(n['family_ids'][1]);
					 }
					 if(n == edge['pa'] && edge['target']['family_ids'].length == 0){
						 edge['target']['family_ids'].push(n['family_ids'][1]);
					 }
				 }

				 if (n['generation'] >= 0){
					edge['target']['generation'] = n['generation']+1;
					edge['target']['descendant'] = true;	 
				 }

			}			
		})
		
	})
	//Iterate through all nodes and for any without generation: 1)Copy the generation of their spouse  
	this.nodes.filter(function(d){return d['generation']<0}).forEach((n)=>{
		//Iterate through parent-parent edges to find spouses generation and copy it
		this.parentParentEdges.forEach((edge)=>{
			if (n == edge['pa']){
				n['generation'] = edge['ma']['generation']; 
			}			
			else if (n == edge['ma']){
				n['generation'] = edge['pa']['generation'];	
			}
		})	
	})
	
	//Iterate through all nodes and for any without a family id: 1) Copy the family id of their spouse 
	this.nodes.filter(function(d){return d['family_ids'].length<1}).forEach((n)=>{
		//Iterate through parent-parent edges to find spouses generation and copy it
		this.parentParentEdges.forEach((edge)=>{
			if (n['family_ids'].length == 0){
				if (n == edge['pa'] ){
					n['family_ids'].push(edge['ma']['family_ids'][1]); 
				}			
				else if (n == edge['ma']){
					n['family_ids'].push(edge['pa']['family_ids'][1]);	
				}	
			}
			
		})	
	})
	

  }
  
  //Function that hides attributes for all non direct descendants of founder. 
  private hideNonDescendants(){
	  
	  
  }
    /**
   * Compute Parent/Children edges and Parent-Parent Edges
   */
  private createEdges() {

//Create relationship nodes
    this.nodes.filter((d)=>{return d.visible}).forEach(node=>{
        const maID = this.uniqueID.indexOf(node['ma']);
        const paID = this.uniqueID.indexOf(node['pa']);

        if (maID >-1 && paID >-1){

            const rnode={
                'x':(this.nodes[maID].x + this.nodes[paID].x)/2,
                'y':(this.nodes[maID].y + this.nodes[paID].y)/2,
                'y1':this.nodes[maID].y,
                'y2':this.nodes[paID].y,
                'x1':this.nodes[maID].x,
                'x2':this.nodes[paID].x,
                'color':this.nodes[maID].color,
                'ma':this.nodes[maID],
                'pa':this.nodes[paID],
                'type':'parent',
                'id':this.nodes[maID]['id']
            };
            
            //Only add parent parent Edge if it's not already there; 
            if (!this.parentParentEdges.some((d)=>{return d['id'] == rnode['id']})){
	            this.parentParentEdges.push(rnode);
            }
		
            this.parentChildEdges.push({
                ma: this.nodes[maID],
                pa: this.nodes[paID],
                target: node,
                'color':this.nodes[maID].color,
                'id':node.id
            });
        }
    });


  }
 
  /**
   * Aggregates Nodes
   */
  public aggregateNodes(indexes) {
	  
	  let minInd = Math.min.apply(null,indexes);
	  let maxInd = Math.max.apply(null,indexes);
	  
	  //User clicked and released on the same node;
	  if (indexes.length == 1){
		  return;
	  }
	  
	  let collapsedNodes = [];
	
    let collapseCols = indexes.length-1;
   

    this.nodes.forEach(function(d)
    {
      if (indexes.includes(d['y'])){
        d['visible'] = true;
        d['collapsed'] = true;
        d['y']= minInd
        collapsedNodes.push(d);
        
      }
    });
       
    this.nodes.forEach(function(d)
    {
	    if (d['y'] > maxInd){
        d['y'] = d['y'] - collapseCols;
      }
	 });

	 //write function that given an array of nodes, returns an "average" node 

    let aggregateNode =
	{
      "sex":undefined,
      "deceased":"0",
      "egoUPDBID":"1495566",
      "paUPDBID":"57",
      "maUPDBID":"59",
      "affection":"1",
      "bdate":"1899",
      "ddate":"1965",
      "id":1495566,
      "ma":59,
      "pa":57,
      "spouse":undefined,
      "children":true,
      "x":1899,
      "y":80,
      "generation":1899,
      "hide":false,
      "type":"individual",
      "color":"#e7cb94",
      "maxBMI":3
   };


    aggregateNode['y'] = indexes[0];
    aggregateNode['x'] = mean(collapsedNodes,(d)=>{return d['x']});
    aggregateNode['collapsedNodes'] = collapsedNodes;
    aggregateNode['collapsed']=false
    aggregateNode['type']= 'aggregate';
    aggregateNode['visible']=true;
    aggregateNode['family_ids']=collapsedNodes[0]['family_ids'];
    
    
    this.nodes.push(aggregateNode)
    
    this.collapseEmptyRows();
  };
  
  //Function that iterates through genealogy graph and removes empty rows; 
  public collapseEmptyRows(){
	  
  };
  
  

};




/**
 * Method to create a new graphData instance
 * @param data
 * @returns {graphData}
 */
export function create(data) {
  return new graphData(data);
}


