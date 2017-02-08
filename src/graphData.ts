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
                'type':'parent',
                'id':Math.random()
            };
			
// 			console.log(rnode)
            this.parentParentEdges.push(rnode);
            this.parentChildEdges.push({
                source: rnode,
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
    let collapseCols = ind2 - ind1 -1;
    let collapsed = [];
    this.nodes.forEach(function(d)
    {
      if (d.y <= ind2 && d.y >=ind1){
        d['visible'] = false;
        collapsed.push(d);
      }
      if (d.y >ind2){
        d['y'] = d['y'] - collapseCols;
      }
    });

    let aggregateNode =  {
      'id': Math.random(),
      'name': 'A',
      'sex': 'F',
      'dob':undefined
    }

    this.nodes.push(aggregateNode)

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


