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

    public parentChildEdges = [];

    public parentParentEdges = [];

    private nuclearFamilyCounter = 1;



    constructor(data) {

        this.nodes = data;

        this.uniqueID = [];
        //Initially set all nodes to visible and of type 'single' (vs aggregate)
        this.nodes.forEach(d => {
            // d['index'] = d.id;
            d['type'] = 'single';
            d['visible'] = true;
            d['collapsed'] = false;
            d['bdate'] = +d['bdate'];
            d['color'] = +d['affection'] == 1 ? 'black' : 'white'
            d['generation'] = -1;
            d['descendant'] = false; //flag for blood descendants of founders
            d['Y'] = +d['y']; //keeps track of nodes original y position
            d['family_ids'] = []; //keeps track of nuclear families
            d['clicked'] = false;


            this.uniqueID.push(+d['egoUPDBID']);

        });

        this.createEdges();
        this.computeGenerations();
    }

    //Function that assigns a generation to each node.
    private computeGenerations() {
        //Find oldest couple and tag them as the founders
        this.nodes.sort((a, b) => {
            return a['bdate'] - b['bdate']
        });

        this.nodes[0]['generation'] = 0;
        this.nodes[1]['generation'] = 0;

        this.nodes[0]['family_ids'] = [0, 1];
        this.nodes[1]['family_ids'] = [0, 1];

        //for each couple, find all children and: 1) assign their generation 2)Tag them as 'descendants'
        this.nodes.forEach((n) => {
            this.parentChildEdges.forEach((edge) => {
                if (n == edge['ma'] || n == edge['pa']) {

                    //If not already created, create new nuclear family
                    if (n['family_ids'].length > 0) {

                        if (n['family_ids'].length == 1) {
                            this.nuclearFamilyCounter = this.nuclearFamilyCounter + 1;
                            n['family_ids'].push(this.nuclearFamilyCounter)
                        }

                        if (n == edge['ma'] && edge['target']['family_ids'].length == 0) {
                            edge['target']['family_ids'].push(n['family_ids'][1]);
                        }
                        if (n == edge['pa'] && edge['target']['family_ids'].length == 0) {
                            edge['target']['family_ids'].push(n['family_ids'][1]);
                        }
                    }

                    if (n['generation'] >= 0) {
                        edge['target']['generation'] = n['generation'] + 1;
                        edge['target']['descendant'] = true;
                    }

                }
            })

        })
        //Iterate through all nodes and for any without generation: 1)Copy the generation of their spouse  
        this.nodes.filter(function(d) {
            return d['generation'] < 0
        }).forEach((n) => {
            //Iterate through parent-parent edges to find spouses generation and copy it
            this.parentParentEdges.forEach((edge) => {
                if (n == edge['pa']) {
                    n['generation'] = edge['ma']['generation'];
                } else if (n == edge['ma']) {
                    n['generation'] = edge['pa']['generation'];
                }
            })
        })

        //Iterate through all nodes and for any without a family id: 1) Copy the family id of their spouse 
        this.nodes.filter(function(d) {
            return d['family_ids'].length < 1
        }).forEach((n) => {
            //Iterate through parent-parent edges to find spouses generation and copy it
            this.parentParentEdges.forEach((edge) => {
                if (n['family_ids'].length == 0) {
                    if (n == edge['pa']) {
                        n['family_ids'].push(edge['ma']['family_ids'][1]);
                    } else if (n == edge['ma']) {
                        n['family_ids'].push(edge['pa']['family_ids'][1]);
                    }
                }

            })
        })


    }

    //Function that hides attributes for all non direct descendants of founder. 
    private hideNonDescendants() {


    }
    /**
     * Compute Parent/Children edges and Parent-Parent Edges
     */
    private createEdges() {

        //Create relationship nodes
        this.nodes.filter((d) => {
            return d.visible
        }).forEach(node => {
            const maID = this.uniqueID.indexOf(node['ma']);
            const paID = this.uniqueID.indexOf(node['pa']);

            if (maID > -1 && paID > -1) {

                const rnode = {
                    'x': (this.nodes[maID].x + this.nodes[paID].x) / 2,
                    'y': (this.nodes[maID].y + this.nodes[paID].y) / 2,
                    'y1': this.nodes[maID].y,
                    'y2': this.nodes[paID].y,
                    'x1': this.nodes[maID].x,
                    'x2': this.nodes[paID].x,
                    'color': this.nodes[maID].color,
                    'ma': this.nodes[maID],
                    'pa': this.nodes[paID],
                    'type': 'parent',
                    'id': this.nodes[maID]['id']
                };

                //Only add parent parent Edge if it's not already there; 
                if (!this.parentParentEdges.some((d) => {
                        return d['id'] == rnode['id']
                    })) {
                    this.parentParentEdges.push(rnode);
                }

                this.parentChildEdges.push({
                    ma: this.nodes[maID],
                    pa: this.nodes[paID],
                    target: node,
                    'color': this.nodes[maID].color,
                    'id': node.id
                });
            }
        });


    }

	//
	public collapseFamilies(root){
		
		// 		1. find which nuclear families to aggregate
		let family_ids = root;
		
		console.log ('root is ', root[0])
		
		let allowedRoots = [2,5,6,4];
		 
		if (!allowedRoots.includes(root[0])){
			return; //can only aggregate these families for now
		}
		
		if (family_ids ==2){
			family_ids = [5,6];
		}
				
		family_ids.forEach((id)=>{
			
			//2. for each family, create a set of indexes to aggregate, (this set may be empty)
			let aggregateSet=new Set();
			
			this.nodes.forEach(function(d){
				if (+d['affection']<100 && d['family_ids'].includes(id)){
					aggregateSet.add(d['y'])
				}	
			})
			
			//problem is that rows with nodes that will still be a part of another aggregate are being overriden. 
			
			
			
/*
			//Iterate through all family members and push all non-afected members;
			if (id == 5){
				toAggregate = [65,66,68,69];
			}
			if (id == 2){
				toAggregate = [69,72,74,75];
			}
			if (id == 6){
				toAggregate = [71,72,73];
			}
*/			let toAggregate = Array.from(aggregateSet);

			toAggregate.sort(function(a,b){return a-b});
			console.log('toAggregate',toAggregate,'id',id);
			
			//Call aggregate Nodes on the non-affected
			this.aggregateNodes(toAggregate,id,family_ids)
			
		})
		
	}

    /**
     * Aggregates Nodes
     */
    public aggregateNodes(indexes,id,family_ids) {
	    
	    //Need family ids to see if a node needs to be duplicated

        //You need at least two levels to aggregate
        if (indexes.length < 2) {
            return;
        }

        let minInd = Math.min.apply(null, indexes);
        let maxInd = Math.max.apply(null, indexes);

        let collapsedNodes = [];
        let duplicateNodes=[];
        
//       filter(function(d){return !d['collapsed']}).
        
          this.nodes.forEach(function(d) {
	         
	         let node = d;
            if (indexes.includes(d['y']) && d['family_ids'].includes(id) ) { //found a node that will be collapsed
	            //check to see if this node will be aggregated in another family as well
	            if (d['family_ids'].length>1 && family_ids.includes(d['family_ids'][0]) && family_ids.includes(d['family_ids'][1] ) && id == d['family_ids'][0]){
	            node = JSON.parse(JSON.stringify(d));
	            node['id']=Math.random(); //since id is used as the key, cannot have two of the same. 
	            duplicateNodes.push(node);
	            };
	            
                node['visible'] = true;
                node['collapsed'] = true;
                node['y'] = maxInd
                collapsedNodes.push(node);

            }
        });
        
        this.nodes = this.nodes.concat(duplicateNodes);

        //write function that given an array of nodes, returns an "average" node 

        let aggregateNode = {
            "sex": undefined,
            "deceased": "0",
            "egoUPDBID": "1495566",
            "paUPDBID": "57",
            "maUPDBID": "59",
            "affection": "1",
            "bdate": "1899",
            "ddate": "1965",
            "ma": 59,
            "pa": 57,
            "spouse": undefined,
            "children": true,
            "x": 1899,
            "y": 80,
            "generation": 1899,
            "hide": false,
            "type": "individual",
            "color": "#e7cb94",
            "maxBMI": ''
        };


        aggregateNode['y'] = maxInd;
        aggregateNode['x'] = min(collapsedNodes, (d) => {
            return d['x']
        });
        aggregateNode['collapsedNodes'] = collapsedNodes;
        aggregateNode['collapsed'] = false
        aggregateNode['type'] = 'aggregate';
        aggregateNode['visible'] = true;
        aggregateNode['family_ids'] =[];
        aggregateNode['id']=Math.random()
/*
        
        aggregateNode['family_ids'] = [collapsedNodes.reduce((a,b)=>{console.log('here',a,b); 
	        return min(b['family_ids'].concat(Array.isArray(a)? a['family_ids'] : [a]))})];;
	    
*/    


        this.nodes.push(aggregateNode)
        
        
        //See if aggregate node connects to a previous family        
        let multiFamilyNode =[];
        collapsedNodes.forEach(function(d){if (d['family_ids'].length>1){multiFamilyNode.push(d)}})
        
        if (multiFamilyNode.length>0){
	         //If aggregate contains a parent that has two families, create a parent/child  edge between aggregate node and the originating family
         this.parentChildEdges.forEach(function(d){
	         if (d['target'] == multiFamilyNode[0]){
		         d['target'] = aggregateNode;
	         }
         })
        }
       
		console.log('indexes for ' , id , ' are', indexes.filter(x => [aggregateNode['y']].indexOf(x) < 0 ));
		
        this.collapseEmptyRows(indexes.filter(x => [aggregateNode['y']].indexOf(x) < 0 ));
//         this.collapseEmptyRows(indexes);
        
       
    };

    //Function that iterates through genealogy graph and removes empty rows; 
    public collapseEmptyRows(indexes) {
	    
	    let minY = min(this.nodes,function(n){return n['Y']});
	    let maxY = max(this.nodes,function(n){return n['Y']});
	    
	    //sort indexes and remove max since that is for the aggregate node
	    indexes.sort(function(a,b){return a-b}) //; .splice(-1,1);
	    
	    console.log('indexes',indexes)
	    
	    let bin = [];
	    for (let i = minY; i < maxY; i++) {
		    if (indexes.includes(i)){
		    bin.push(1)
		    }
		    else{
		    bin.push(0) 
		    }
		}
		console.log(bin);
		
		let collapse = bin.reduce(function(r, a) {
			if (r.length > 0)
				a += r[r.length - 1];
				r.push(a);
				return r;
		}, []);
		
		console.log(collapse);
   
	    
        this.nodes.forEach(function(d,i) {
// 	        console.log([d['y']-minY] , ' needs to decrease' , collapse[d['y']-minY-1] , 'rows')
            if (d['y'] >= min(indexes)) {
	            
                d['y'] = d['y'] - collapse[d['y']-minY-1];
            }
        });



    };
    
    //Function to re-expand aggregated nodes;
    private expandAggregates(indexes){
	    
	    console.log('indexes are ', indexes)
	    
	    
	    this.nodes.forEach(function(d,i) {
// 	        console.log([d['y']-minY] , ' needs to decrease' , collapse[d['y']-minY-1] , 'rows')
            
//             if (indexes.includes(d['y'])){
	            console.log('here')
	            d['collapsed']=false;
	            d['y'] = d['Y'];
//             }
/*
            if (d['y'] >= min(indexes)) {
	            
                d['y'] = d['y'] - collapse[d['y']-minY-1];
            }
*/
        });
	    
	    
	    
    }



};




/**
 * Method to create a new graphData instance
 * @param data
 * @returns {graphData}
 */
export function create(data) {
    return new graphData(data);
}