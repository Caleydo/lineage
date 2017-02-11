/**
 * Created by Carolina Nobre on 01.22.2017
 */

/**
 * Class that represents the genealogy data
 */
class graphData {

  public nodes;
  
  private uniqueID;
  
  public parentChildEdges =[];
  
  public parentParentEdges = [];
  


  constructor(data) {

    this.nodes = data;
    
    this.uniqueID =[]; 
    //Initially set all nodes to visible and of type 'single' (vs aggregate)
    this.nodes.forEach(d=>
    {
      // d['index'] = d.id;
      d['type']  = 'single';
      d['visible']=true;
      d['bdate']=+d['bdate'];
      d['color']= +d['affection'] == 1 ? 'black' : 'white'
      d['generation'] = -1;
      d['descendant']=false; //flag for blood descendants of founders
      
      
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
	
	//for each couple, find all children and: 1) assign their generation 2)Tag them as 'descendants'
	this.nodes.forEach((n)=>{
		this.parentChildEdges.forEach((edge)=>{
			if (n == edge['ma'] || n == edge['pa']){
				 if (n['generation'] >= 0){
					edge['target']['generation'] = n['generation']+1;
					edge['target']['descendant'] = true;	 
				 }

			}			
		})
		
	})
	
	console.log('there are ', this.parentParentEdges.length , 'still parentEdges');
	console.log('there are ', this.parentChildEdges.length , 'parentChildEdges');
	console.log('there are ', this.nodes.length , 'nodes');
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
	

  }
    /**
   * Compute Parent/Children edges and Parent-Parent Edges
   */
  private createEdges() {

//Create relationship nodes
    this.nodes.filter((d)=>{return d.visible}).forEach(node=>{
        const maID = this.uniqueID.indexOf(node['ma']);
        const paID = this.uniqueID.indexOf(node['pa']);

// 		console.log(maID, paID)
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
                'id':this.nodes[maID]
            };
			console.log(rnode)
			
// 			console.log(rnode)
            this.parentParentEdges.push(rnode);
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
  public aggregateNodes(ind1,ind2) {
	  
	  //User clicked and released on the same node;
	  if (ind1 == ind2){
		  return;
	  }
	
	  
	  console.log(ind1,ind2)
    let collapseCols = ind2 - ind1;
    
    console.log('collapse ' , collapseCols  ,  'rows');
    let collapsed = [];
    this.nodes.forEach(function(d)
    {
      if (d['y'] <= ind2 && d['y'] >=ind1){
	      console.log('set to invisible')
        d['visible'] = false;
        collapsed.push(d);
      }
    });
    
    this.nodes.forEach(function(d)
    {
    if (d['y'] > ind2){
	      console.log('set to invisible2')
        d['y'] = d['y'] - collapseCols;
      }
	 });


    let aggregateNode =  {
      'id': Math.random(),
      'name': 'A',
      'sex': 'F',
      'dob':undefined
    }

//     this.nodes.push(aggregateNode)

    aggregateNode['y'] = ind1;
    aggregateNode['collapsed'] = collapsed;
    aggregateNode['type']= 'aggregate';
    aggregateNode['visible']=true;
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


