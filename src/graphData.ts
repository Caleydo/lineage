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
      
      
      this.uniqueID.push(+d['egoUPDBID']);

    });
    
    this.createEdges();
    this.computeGenerations();
  }  
  
  //Function that assigns a generation to each node.
  private computeGenerations(){
	//Find oldest couple and tag them as the founders
	let sorted_nodes = this.nodes.sort((a,b)=>{return a['bdate'] - b['bdate']});  
	
	let founder1 = sorted_nodes[0];
	let founder2 = sorted_nodes[1];
	 
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
                'id':Math.random()
            };
			
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


