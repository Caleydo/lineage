/**
 * Created by Carolina Nobre on 01.22.2017
 */
/**
 * Data structure for the genealogy graph.
 */
import {
  max,
  min,
  range,
} from 'd3-array';

import {
  Config
} from './config';

import * as events from 'phovea_core/src/event';
import * as Range from 'phovea_core/src/range';
import {VIEW_CHANGED_EVENT, default as TableManager} from './tableManager';
import {isUndefined} from 'util';
import Node from './Node';
import {Sex} from './Node';
import {ITable} from 'phovea_core/src/table/ITable';
import {CURRENT_YEAR} from './genealogyTree';


class GraphData {

  public nodes: Node[];
  public graphTable: ITable;
  public attributeTable: ITable;
  private tableManager: TableManager;
  private ids: string[]; //unique identifier for each person. Is used to create new range on graphView

  public yValues;

  //Array of Parent Child Edges
  public parentChildEdges = [];

  //Array of Parent Parent Edges
  public parentParentEdges = [];


  constructor(data) {
    this.graphTable = data.graphTable;
    this.tableManager = data;
    this.setListeners();
  };

  private setListeners() {

    events.on(VIEW_CHANGED_EVENT, () => {
      this.graphTable = this.tableManager.graphTable;

      //Once tree has been created for the new family, fire redraw tree event.
      this.createTree().then(() => {
        events.fire('redraw_tree', this);
      }).catch(function (error) {
        console.log('Error: ' + error);
      });
    });
  }

  /**
   * This function removesCycles from a tree by building duplicate nodes as necessary.
   *
   */

  private removeCycles() {

    const toDecycle = this.nodes.filter((n) => {
      return !n.visited;
    });

    if (toDecycle.length === 0) {
      return;
    }
    const startNode = toDecycle.find((n) => {
      return n.bdate === min(toDecycle, n => {
          return n.bdate
        })
    });

    this.removeCyclesHelper(startNode);

    this.removeCycles();
  }

  private removeCyclesHelper(node: Node) {

    if (node.visited) {
      console.log('found child cycle with ', node.id);


      //Create Duplicate Node in the 'child' role and leave the current one as the parent/spouse
      const duplicateNode = Object.assign({}, node);

      duplicateNode.id = node.id;

      //Add each node to the other's 'duplicate' array
      node.duplicates.push(duplicateNode);
      duplicateNode.duplicates.push(node);

      //Remove node from parent's 'children' array
      let childIndex = node.ma.children.indexOf(node);
      node.ma.children.splice(childIndex, 1);

      childIndex = node.pa.children.indexOf(node);
      node.pa.children.splice(childIndex, 1);

      // Clear child/spousal links from duplicate node;
      duplicateNode.hasChildren = false;
      duplicateNode.children = [];
      duplicateNode.spouse = [];

      duplicateNode.ma.children.push(duplicateNode);
      duplicateNode.pa.children.push(duplicateNode);

      //Replace node with 'duplicateNode' in the parentChild edge.
      const parentChildEdge = this.parentChildEdges.filter((e) => {
        return e.target === node;
      })[0];
      parentChildEdge.target = duplicateNode;

      //clear parent references
      node.maID = '';
      node.paID = '';

      node.ma = undefined;
      node.pa = undefined;

      this.nodes.push(duplicateNode);


      console.log('L132')
      //clear visited status of this persons spouse(s) and the branch starting at this couple;
      // console.log('clearing visited status of', node.id)
      node.visited = false;
      this.clearVisitedBranch(node);
      console.log('L136')
    }

    // console.log('visiting', node.id)
    node.visited = true;

    node.spouse.forEach((s: Node) => {
      if (s.visited) {
        console.log('found spouse cycle between  ', node.id, ' and ', s.id);
        //choose the person who is part of the blood family (i.e, who have a mom and dad in this family) and duplicate them.
        let toDuplicate;
        if (node.ma) {
          toDuplicate = node;
        } else if (s.ma) {
          toDuplicate = s;
        } else {
          console.log('neither person has parents in this family!');
        }

        if (!isUndefined(toDuplicate)) {
          const duplicateNode = Object.assign({}, toDuplicate);

          duplicateNode.id = toDuplicate.id;

          //Add each node to the other's 'duplicate' array
          toDuplicate.duplicates.push(duplicateNode);
          duplicateNode.duplicates.push(toDuplicate);

          //Remove node from parent's 'children' array
          let childIndex = toDuplicate.ma.children.indexOf(node);
          toDuplicate.ma.children.splice(childIndex, 1);

          childIndex = toDuplicate.pa.children.indexOf(toDuplicate);
          toDuplicate.pa.children.splice(childIndex, 1);

          // Clear child/spousal links from duplicate node;
          duplicateNode.hasChildren = false;
          duplicateNode.children = [];
          duplicateNode.spouse = [];

          duplicateNode.ma.children.push(duplicateNode);
          duplicateNode.pa.children.push(duplicateNode);

          //Replace node with 'duplicateNode' in the parentChild edge.
          const parentChildEdge = this.parentChildEdges.filter((e) => {
            return e.target === toDuplicate;
          })[0];
          parentChildEdge.target = duplicateNode;

          //clear parent references
          toDuplicate.maId = 0;
          toDuplicate.paID = 0;

          toDuplicate.ma = undefined;
          toDuplicate.pa = undefined;

          this.nodes.push(duplicateNode);

          //clear visited status of this persons spouse(s) and the branch starting at this couple;
          // console.log('clearing visited of', toDuplicate.id)
          toDuplicate.visited = false;
          this.clearVisitedBranch(toDuplicate);

        }

      }
      s.visited = true;
    });

    // console.log('node children for ', node.id,  ' are' , node.children.map((c) => {
    //   return (c.id)
    // }))

    node.children.forEach((c) => {
      // console.log('applying RCH on ', c.id)
      this.removeCyclesHelper(c);
    });

    if (!node.hasChildren) {
      return;
    }
  }

  /**
   * This function sets the 'visited' state of the remainder of this branch to false.
   *
   */
  private clearVisitedBranch(node) {

    // console.log('L220. Visiting ', node.id)

    if (!node.hasChildren) {
      return;
    }
    //set all spouses to false
    node.spouse.forEach((s) => {
      // console.log('clearing visited of spouse within CVB', s.id)
      s.visited = false;
    });

    //recursively call this function on the children
    node.children.forEach((c) => {
      c.visited = false;
      // console.log('L233')
      // console.log('clearing visited of children within CVB', c.id)
      this.clearVisitedBranch(c);
      // console.log('L235')
    });
  }

  /**
   * This function loads genealogy data from lineage-server
   * and builds the genealogy tree
   * @param: name of the dataset
   * returns a promise of table
   *
   */
  public async createTree() {

    // console.log('step1')

    this.nodes = [];
    const columns = this.graphTable.cols();
    // const nrow = this.graphTable.nrow;


    let peopleIDs = await columns[0].names();

    let idRanges = await columns[0].ids();


    this.ids = idRanges.dim(0).asList().map(d => {
      return d.toString()
    });


    const columnDesc = this.graphTable.desc.columns;
    const columnNameToIndex: {[name: string]: number} = {};

    for (let i = 0; i < columnDesc.length; i++) {
      //console.log(columns[i]);
      const name = columnDesc[i].name;
      columnNameToIndex[name] = i;
      // console.log(name,i,columnNameToIndex[name])
    }

    let i = 0;
    for (const row of await this.graphTable.data()) {
      const node = new Node(this.ids[i]);
      // const node = new Node(peopleIDs[i]);
      this.nodes.push(node);
      node.initialize(columnNameToIndex, row);
      i++;
    }

    //Sort nodes by y value, always starting at the founder (largest y) ;
    this.nodes.sort(function (a, b) {
      return b.y - a.y;
    });


    // console.log('affected state is ', this.tableManager.affectedState)
    this.defineAffected(this.tableManager.affectedState);

    // console.log('step2')

    this.buildTree();

    // console.log('step3')

    //Create fake birthdays for people w/o a bdate.
    this.nodes.forEach((n) => {
      if (n.bdate === 0 || isNaN(n.bdate)) { //random number
        // subtract 20 from the age of the first kid
        if (n.hasChildren) {
          n.bdate = n.children[0].bdate - 20;
          n.x = n.bdate;
        } else {
          // The not-so-nice case when we don't have an age and no children
          n.x = CURRENT_YEAR - 3;
          n.bdate = CURRENT_YEAR - 3;
        }
      }
    });


    // console.log('step4')
    //Remove cycles by creating duplicate nodes where necessary
    this.removeCycles();

    // console.log('step5')
    //Linearize Tree and pass y values to the attributeData Object
    this.linearizeTree();


    //Create dictionary of person to y values
    this.exportYValues();

    //After linear order has been computed:
    this.nodes.forEach((d) => {
      d.originalX = +d.x; //keeps track of nodes original x position
      d.originalY = +d.y; //keeps track of nodes original y position - can change for kid grids on hide.
    });

    // console.log('step6')
  };


  /**
   *
   * This function get the requested attribute from the tableManager (primary or secondary only) for the person requested.
   * Returns undefined if there is no value or if the requested attribute is not the primary or secondary.
   *
   * @param attribute - attribute to search for
   * @param personID - person for which to search for attribute
   */
  private getAttribute(attribute, personID) {
    return this.tableManager.getAttribute(attribute, personID);
  }

  /**
   *
   * This function uncollapses the entire tree by setting their node y values back to the originally Y Value;
   *
   */
  private uncollapseAll() {
    this.nodes.forEach((node: Node) => {
      node.y = node.originalY;
      node.x = node.originalX;
      node.hidden = false;
      node.aggregated = false;
    });
  }

  /**
   *
   * This function collapses the entire tree (using aggregation, not hiding)
   *
   */

  private collapseAll() {

    //Iterate through branch, if there are any unhidden nodes, collapse
    const isNotHidden = this.nodes.filter((node: Node) => {
      return (!node.hidden || !node.affected);
    });

    if (isNotHidden.length === 0) {
      return;
    }

    //Find oldest person in this set of nodes and set as startingPoint
    const startNode = isNotHidden.reduce((a, b) => {
      return +a.originalY > +b.originalY ? a : b;
    });
    this.hideNodes(startNode.y, true);

    //Recursively call collapseAll to handle any branches that were not collapsed.
    // this.collapseAll();
  }


  /**
   *
   * This function passes the newly computed y values to the tableManager
   *
   */
  private exportYValues() {
    //Create hashmap of personID to y value;
    const dict = {};

    this.nodes.forEach((node) => {
      //Remove danglers
      // if (node.hasChildren || (!isUndefined(node.ma) && !isUndefined(node.pa))) {
      if (node.id in dict) {
        dict[node.id].push(Math.round(node.y));
      } else {
        dict[node.id] = [Math.round(node.y)];
      }
      // }
    });

    // console.log(dict);

    //Assign y values to the tableManager object
    this.tableManager.yValues = dict;
    this.yValues = dict; //store dict for tree to use when creating slope chart
  }

  /**
   *
   * This function linearizes all nodes in the tree.
   *
   */
  private linearizeTree() {
    //Only look at nodes who have not yet been assigned a y value
    const nodeList = this.nodes.filter((n) => {
      return n.y === undefined;
    });

    // console.log('node list still has ', nodeList.length , ' items')
    if (nodeList.length === 0) {
      return;
    }

    //Find oldest person in this set of nodes and set as founder
    const founder = nodeList.find((n) => {
      return n.bdate === min(nodeList, n => {
          return n.bdate
        })
    });

    founder.y = nodeList.length; //Set first y index;
    this.linearizeHelper(founder);

    //Recursively call linearizeTree to handle any nodes that were not assigned a y value.
    this.linearizeTree();
  }

  /**
   *
   * This is a recursive helper function for linearizeTree()
   * @param node - node at the start of branch that needs to be linearized;
   *
   */
  private linearizeHelper(node: Node) {

    this.linearizeLogic(node);

    node.children
    // .filter((c)=>{return (c.ma === node && c.pa === s) || (c.pa === node && c.ma === s)})
      .map((c: any) => {
        this.linearizeHelper(c);
      });

    node.spouse.forEach((s) => {
      s.spouse.forEach((ss) => {
        //sort children by age to minimize edge crossings
        s.children.sort((a, b) => {
          return b.bdate - a.bdate;
        });
        s.children
          .filter((c) => {
            return (c.ma === ss && c.pa === s) || (c.pa === ss && c.ma === s);
          })
          .map((c: any) => {
            this.linearizeHelper(c);
          });
      });
    });

    //Base case are leaf nodes. Reached end of this branch.
    if (!node.hasChildren) {
      return;
    }

  }

  /**
   *
   * This is the logic behind linearizing a single node and it's spouses.
   * @param node - node that needs to be linearized;
   *
   */
  private linearizeLogic(node:Node){

    // console.log('calling LH')
    if (node.y === undefined) {
      node.y = min(this.nodes, (n: any) => {
          return n.y;
        }) + (-1);
      // console.log('assigning ', node.y)
    }

    //Assign y position of all spouses.
    if (node.spouse.length > 0) {
      // node.spouse[0].y = min(this.nodes,(n:any)=>{return n.y})+(-1)
      node.spouse.forEach((s) => {
        if (s.y === undefined) {
          s.y = min(this.nodes, (n: any) => {
              return n.y;
            }) + (-1);
        }
        s.spouse.forEach((ss) => {
          if (ss.y === undefined) {
            ss.y = min(this.nodes, (n: any) => {
                return n.y;
              }) + (-1);
            // console.log('assigning spouses spouse ', ss.y)
          }
        });
      });

      //If person has two spouses, put this one in the middle.
      if (node.spouse.length === 2) {
        const ys = [node.y].concat(node.spouse.map((s) => {
          return s.y;
        }));
        ys.sort();
        node.y = ys[1];
        node.spouse[0].y = ys[0];
        node.spouse[1].y = ys[2];
      }
    }

  }


  /**
   *
   * This function prepares the tree for aggregation, cleans up the results and updates the tableManager.
   */
  private aggregateTreeWrapper(nodeID: string, aggregate:boolean){


      //find node
      let node = this.nodes.find((n:Node)=>{return n.uniqueID === nodeID});
      node.aggregateBranch = true;

    //Clear tree of y values and aggregated and hidden flags;
    this.nodes.forEach(n=>{
      n.y = undefined
      n.aggregated = false;
      n.hidden = false;
    })

    this.aggregateTree(aggregate);

    //clean out extra rows at the top of the tree;
    let minY = min(this.nodes, (n: any) => {
      return n.y;
    }) -1;

    this.nodes.forEach(n=>{n.y = n.y - minY});

    //Adjust y position for non affected nodes in the tree;
    this.nodes.forEach((n:Node)=>{
      if (n.hidden && !n.affected){
        if (n.sex === Sex.Male){
          n.y = n.y-0.2;
        }
        if (n.sex === Sex.Female){
          n.y = n.y+0.2;
        }
      }
    });

    if (!aggregate){
      //Adjust x position for spouses of affected nodes;
      this.nodes.forEach((n:Node)=>{
        if (n.hidden && !n.affected && n.hasChildren && n.spouse.find(s=>{return s.affected})){
            n.x = n.x- Config.glyphSize*.6;
        }
      });
    }

    const idRange = [];
    this.nodes.forEach((n: any) => {
      if (!(!n.aggregated && n.hidden)) {
        const ind: number = this.ids.indexOf(n.id);
        idRange.push(n.id);
      }
    });

    this.exportYValues();
    this.tableManager.activeGraphRows = (idRange);

  }


  /**
   *
   * This function aggregates all nodes in the branch starting at a given node X.
   *@param Node to start aggregating at
   */
  private aggregateTree(aggregate:boolean) {

    //Only look at nodes who have not yet been assigned a y value
    const nodeList = this.nodes.filter((n) => {
      return n.y === undefined;
    });

    if (nodeList.length === 0) {
      return;
    }

    //Find oldest person in this set of nodes and set as founder
    let startNode = nodeList.find((n) => {
      return n.bdate === min(nodeList, n => {
          return n.bdate
        })
    });

    //If starting node is not the 'center' of the founding spouses
    if (startNode.spouse.length> 0 && startNode.spouse[0].spouse.length>1){
      startNode = startNode.spouse[0]
    }

    let minY = min(this.nodes, (n: any) => {
        return n.y;
      });

    if (isUndefined(minY)){
      startNode.y = nodeList.length; //Set first y index;
    } else{
      startNode.y = minY -1; //Set first y index;
    }

    if (!startNode.affected && startNode.hasChildren && startNode.aggregateBranch){
      startNode.hidden = true;
      startNode.aggregated = aggregate;
    }

    this.aggregateHelper(startNode, aggregate);

    //Recursively call aggregateTree to handle any nodes that were not assigned a y value.
    this.aggregateTree(aggregate);
  }


  /**
   *
   * This is a recursive helper function for aggregateTree()
   * @param node - node that needs to be aggregated;
   * @param aggregate - boolean that indicates whether to aggregate (true) or hide (false);
   *
   */
  private aggregateHelper(node: Node, aggregate:boolean) {

    if (!node.aggregateBranch){
      this.linearizeLogic(node)

      //Assign y levels to leaf children;
      node.children.map((child:Node)=>{
        if (isUndefined(child.y) && !child.affected && !child.hasChildren) {
          this.linearizeLogic(node)
        } else {
          this.aggregateHelper(child,aggregate)
        }
      });

      return
    }

    console.log('get here?')
    //Base case are leaf nodes. Reached end of this branch.
    if (!node.affected && !node.hasChildren) {
      return;
    }

    //If node is affected and has not yet been assigned a row, give it's own row
    if (isUndefined(node.y) && node.affected ) {

      //find any affected nodes in the last row
      let isLastNodeAffected: Node =  this.nodes.filter((n:Node)=>{return n.y === min(this.nodes, (nd: Node) => {return nd.y;})}).find((n:Node)=>{return n.affected})

      if (aggregate || !isUndefined(isLastNodeAffected)){
        node.y = min(this.nodes, (n: any) => {
          return n.y;
        }) + (-1);
      }
      else{
          node.y = min(this.nodes, (n: any) => {
            return n.y;
          });
      }
    }


    let minY = min(this.nodes, (n: any) => {
      return n.y;
    });

    //Handle spouses
    // If any spouse are affected, give them their own row.
    node.spouse.map(s=>{
      if (isUndefined(s.y) && s.affected) {
        s.y = min(this.nodes, (n: any) => {
            return n.y;
          })
        if (aggregate){
          s.y = s.y-1;
        } else {
          node.y = minY;
          node.hidden = true;
          node.aggregated = aggregate;
        }
      }
    });

    //If node has any affected spouses, place node above them.
    if (aggregate && isUndefined(node.y) && node.spouse.filter(n=>{return n.affected}).length>0){

      node.y = min(this.nodes, (n: any) => {
        return n.y;
      });
      if (aggregate){
        node.y = node.y -1;
      }

      node.hidden = true;
      node.aggregated = aggregate;
    }

    //find all nodes in the last row, will only be one if it is affected
    const lastAssignedNodes: Node[] = this.nodes.filter((n:Node)=>{return n.y === min(this.nodes, (nd: Node) => {return nd.y;})});

    //of all the nodes in the last row, find either the affect one, or the one at the far right (latest bdate)
    let lastAssignedNode: Node = lastAssignedNodes.find((n:Node)=>{return n.affected});

    if (isUndefined(lastAssignedNode)){
      lastAssignedNode = lastAssignedNodes.find((n:Node)=>{return n.bdate === max(lastAssignedNodes, (nd: Node) => {return nd.bdate;})});
    }

    //if the last assigned Node is affected or if it is an unaffected leaf, start a new row; This does not apply when hiding.
    if (isUndefined(node.y) && (lastAssignedNode.affected || (!lastAssignedNode.hasChildren && !lastAssignedNode.affected))){

      node.y = min(this.nodes, (n: any) => {
        return n.y;
      }) - 1;

      node.hidden = true;
      node.aggregated = aggregate;
    } else if (isUndefined(node.y)){
      node.y = min(this.nodes, (n: any) => {
        return n.y;
      })
      node.hidden = true;
      node.aggregated = aggregate;
    }

    minY = min(this.nodes, (n: any) => {
      return n.y;
    });

    //Iterate through spouses again and assign any undefined y values to the current y
    node.spouse.map(s=>{

      if (isUndefined(s.y) && !s.affected) {
        //If current node is affected, place spouses above it:
        if (node.affected && aggregate){
          s.y = minY -1;
        }else { //place spouses alongside it;
          s.y = node.y
        }
        s.hidden = true;
        s.aggregated = aggregate;
      }
    });

    //Assign all spouses to the x level of either the affected spouse or if not, a token male in the couple.

    //Align node's x value to youngest affected spouse:
    let affectedSpouseXValue = max([node,node.spouse].filter((n:Node)=>{return n.affected}),(n:Node)=>{return n.x});

    let xValue = affectedSpouseXValue;
    //No affected spouse
    if (isUndefined(affectedSpouseXValue)){
      xValue = node.x;
    }

    //Align all spouses along a same X;
    [node].concat(node.spouse).forEach((n:Node)=>{
      n.x = xValue;
    });


    //Assign Child Y and X Values
    let childY;

    //If node is affected, find unaffected spouse
    if (node.affected){
      let unaffectedSpouse = node.spouse.find((n)=>{return !n.affected})
      if (!isUndefined(unaffectedSpouse)){
        childY = unaffectedSpouse.y;
      } else{
        childY = min(this.nodes, (n: any) => {
            return n.y;
          });
        if (aggregate){
          childY = childY-1;
        }
      }
    } else {
      childY = node.y
    }

    //Assign y levels to leaf children;
    node.children.map((child:Node)=>{
      if (isUndefined(child.y) && !child.affected && !child.hasChildren) {
        child.y = childY;
        child.x = xValue;
        child.hidden = true;
        child.aggregated = aggregate;
      } else {
        this.aggregateHelper(child,aggregate)
      }
    })

  }


  /**
   *
   * This function defined the 'affected' state based on a user defined attribute.
   *
   * @param attribute attribute to be used to define 'affected' state of nodes.
   * @param value threshold value to apply to attribute when defining 'affected'.
   * Currently has a single value that indicates true.
   */
  private defineAffected(affectedState) {
    // console.log(affectedState, 'affectedState')
    this.nodes.forEach((node) => {
      const data = this.tableManager.getAttribute(affectedState.name, node.id);
      node.affected = affectedState.isAffected(data);
    });

  }

  /**
   *
   * This function creates edges objects and adds the references between parents and children to create a tree.
   * It creates two types of edges:
   * 1) between parents and their children -> parent child edges.
   * 2) between couples -> parent parent edges
   *
   * It populates the class attributes parentParentEdges and parentChildEdges.
   */

  private buildTree() {

    this.parentChildEdges = [];
    this.parentParentEdges = [];

    this.nodes
      .forEach((node:Node) => {
        //Check if there are mother and father nodes in this family (founder won't have them for example)
        const maNode = this.nodes.find((d) => {
          return d.id === node.maID;
        });
        // if (maNode)
        // console.log(maNode, node )
        const paNode = this.nodes.find((d) => {
          return d.id === node.paID;
        });
        // if (paNode)
        //   console.log(paNode, node)


        //No parents found
        if ((maNode === undefined || paNode === undefined) && (maNode !== node && paNode !== node)) {
          node.ma = undefined;
          node.pa = undefined;
          // console.log('no parents :( ')
        } else { //If found parents, create edges between parent and children, spouses, and add references to build tree
          // console.log('found parents :) ')
          //Replace ma and pa fields with reference to actual ma/pa nodes
          node.ma = maNode;
          node.pa = paNode;

          //relationship node. Used to build parent child edges
          const rnode = {
            ma: maNode,
            pa: paNode,
            type: 'parent',
            id: Math.random() //Create random id or each parentParent Edge.
          };

          //Only add parent parent Edge if it's not already there;
          if (!this.parentParentEdges.some((d) => {
              return d.ma === rnode.ma && d.pa === rnode.pa;
            })) {
            this.parentParentEdges.push(rnode);

            //Set spouse fields
            maNode.spouse.push(paNode);
            paNode.spouse.push(maNode);
          }

          //Set flag for people with children so they are not placed in the kidGrid
          maNode.hasChildren = true;
          paNode.hasChildren = true;

          // console.log(node.id ,  ' is a child of ', maNode.id , ' and ', paNode.id)


          //Add child to array of children of each parent
          maNode.children.push(node);
          paNode.children.push(node);


          this.parentChildEdges.push({
            ma: maNode,
            pa: paNode,
            target: node,
            'id': node.id //id of parentChild Edge is the id of the child.
          });
        }
      });


    //sort children by age to minimize edge crossings
    this.nodes.forEach((node:Node)=>{
      node.children.sort((a, b) => {
        return b.bdate - a.bdate;
      });
    })

  }
  ;

  /**
   *
   * This function traverses down the tree to find the index of the last (upwards) leaf node in a given branch
   *
   * @param node - starting node.
   */
  public findLastLeaf(node: Node) {

    //will have to add case if there are ever leaf nodes with spouses but no children. 2/23/2017
    //Base case -> leaf node w/ no spouse
    if (node.spouse.length === 0 && !node.hasChildren) {
      return node.originalY;
    } else {//Search through spouse and all of spouses relationships to find last child leaf
      return min(node.spouse.map((spouse) => {
        return min(spouse.spouse.map((otherSpouse) => {
          return min(otherSpouse.children.map((child) => {
            return this.findLastLeaf(child);
          }));
        }));
      }));
    }
  }
  ;

  /**
   *
   * This function hides all the nodes that descend from a given starting point. to the end of that branch.
   *
   * @param startIndex - y value (row number) for the starting point.
   * @param aggregate - boolean flag to indicate whether collapsed nodes should be hidden or aggregated into their own row.
   */
  public hideNodes(startIndex: number, aggregate: boolean) {

    startIndex = Math.round(startIndex);
    let Y: number = startIndex;

    //find all nodes in that row
    const rowNodes = this.nodes.filter((node) => {
      return Math.round(node.y) === startIndex;
    });


    //find the largest original Y value
    let startYIndex: any = max(rowNodes, function (n) {
      return n.originalY;
    });

    //Find the node that has that large Y value
    let startNode = this.nodes.find((node) => {
      return node.originalY === startYIndex;
    });

    //Consider Spouse
    if (startNode !== undefined && startNode.spouse.length > 0) {
      //find the spouses Y values
      const spouseY = startNode.spouse.map((s) => {
        return s.originalY;
      });

      startYIndex = max([startYIndex].concat(spouseY));

      //Find the node that has that large Y value
      startNode = this.nodes.filter((node) => {
        return node.originalY === startYIndex;
      })[0];

      Y = startNode.y;
    }

    //Returns the Y value of the last leaf node in that branch
    const endIndex: any = this.findLastLeaf(startNode);

    const endNode = this.nodes.filter((n) => {
      return n.originalY === endIndex;
    })[0];


    //Iterate through branch, if there are only hidden nodes, uncollapse
    const isNotHidden = this.nodes.filter((node) => {
      return (node.originalY <= startNode.originalY && node.originalY >= endIndex && !node.hidden && !node.affected);
    });

    if (isNotHidden.length === 0) {
      this.expandBranch(startNode);
      return;
    }

    this.nodes.sort((a, b) => {
      return b.originalY - a.originalY;
    });

    //Assign a row for each affected case within the range to be collapsed;
    let filteredNodes = this.nodes.filter((node) => {
      return node.originalY <= startYIndex && node.originalY >= endIndex;
    });

    // TODO Find a better way of doing this!

    //re_order couples so affected people have higher ys. This ensure correct positioning of parent and kid grids;
    filteredNodes.forEach((n: Node) => {
      if (n.affected) {

        let allYs = [n].concat(n.spouse).map(n => {
          return n.y
        }).sort((a, b) => {
          return b - a
        });

        let affectedSpouses = n.spouse.filter(n => {
          return n.affected
        });
        let unaffectedSpouses = n.spouse.filter(n => {
          return !n.affected
        });
        let allSpouses = [n].concat(affectedSpouses).concat(unaffectedSpouses);

        // allYs.forEach((y,i)=>{console.log('setting y of ' , allSpouses[i].id , ' to ' , y ); allSpouses[i].y = y});
      }
    })

    filteredNodes.sort((a, b) => {
      return b.y - a.y;
    });

    // TODO end

    filteredNodes.forEach((node, i) => {

      //non affected leaf nodes that have a mother and father
      if (!node.hasChildren && !node.affected && node.ma && node.pa) {

        const ma = node.ma;
        const pa = node.pa;

        //If both parents are affected
        if (ma.affected && pa.affected) {
          if (!aggregate) { //place kid grid in the middle
            if (node.sex === Sex.Male) {
              node.y = min([ma.y, pa.y]) + 0.3;
            } else {
              node.y = max([ma.y, pa.y]) - 0.3;
            }
          } else { //aggregate mode is on
            if (node.sex === Sex.Male) {
              node.y = Y - 0.2;
            } else {
              node.y = Y + .2;
            }
          }
          //Place node at x position of youngest parent
          node.x = max([ma.x, pa.x]);
        } else if (ma.affected) {//Only mother is affected,
          if (!aggregate) {
            if (node.sex === Sex.Male) {
              node.y = ma.y - 0.2;
            } else {
              node.y = ma.y + .2;
            }
          } else {
            if (node.sex === Sex.Male) {
              node.y = Math.round(pa.y) - 0.2;
            } else {
              node.y = Math.round(pa.y) + .2;
            }
          }
          node.x = ma.x; //align kidGrid with affected node (in this case ma)

        } else if (pa.affected) { //Only father is affected
          if (!aggregate) {
            if (node.sex === Sex.Male) {
              node.y = pa.y - 0.2;
            } else {
              node.y = pa.y + 0.2;
            }
          } else {
            if (node.sex === Sex.Male) {
              node.y = Math.round(ma.y) - 0.2;
            } else {
              node.y = Math.round(ma.y) + .2;
            }
          }
          node.x = pa.x; //align kidGrid with affected node (in this case pa)
        } else {//Neither parent is affected
          if (node.sex === Sex.Male) {
            node.y = pa.y;
          } else {
            node.y = ma.y;
          }
          console.log('ma is ', ma.y)
          console.log('setting node y for ', node.id, ' to ', node.y)
          node.x = pa.x; //place kid grid in front of father icon since they are both aligned
        }

      } else { //Affected nodes and non-leaf nodes
        //Non-leaf and affected nodes
        if (node.affected) {
          //previous node
          let previousNode = this.nodes.find(n => {
            return n.y === min(this.nodes.filter(n => {
                return n.y > Y
              }), n => {
                return n.y
              })
          });

          if (aggregate && previousNode && !previousNode.affected) {
            Y = Y - 1;
          }

          node.y = Y;
          const spouses = node.spouse;

          spouses.map((spouse) => {
            // const spouse = spouses[0];
            if (!spouse.affected && aggregate) {
              if (spouse.sex === Sex.Male) {
                spouse.y = Y - 0.2;
              } else {
                // console.log('setting spouses y to ', Y + 0.2)
                spouse.y = Y + 0.2;
              }
              // console.log('setting spouses x to ', node.x)
              spouse.x = node.x;
            }
          });
          // }


        } else { //Non Affected Nodes
          const spouses = node.spouse;

          //determine if there is an affected spouse in this group.
          let affectedSpouse = spouses.find(s => {
            return s.affected
          });

          if (affectedSpouse) {
            //set this entire family' x position to the affected spouse
            //if there is more than one affected spouse we're setting all the non affected spouses to the x value of the first one.
            spouses.map((spouse) => {
              spouse.x = affectedSpouse.x
            })
            //Set this nodes y position to affected spouse -1;
            if (node.sex === Sex.Male) {
              node.y = affectedSpouse.y - 1.2;
            } else {
              node.y = affectedSpouse.y - 0.8;
            }

          } else { //set this entire family' x position to the first dad;
            let firstDad = [node].concat(spouses).find(s => {
              return s.sex === Sex.Male
            });
            spouses.map((spouse) => {
              spouse.x = firstDad.x
            })


            // const spouse = spouses[0];
            spouses.map((spouse) => {
              //Affected Spouse
              if (spouse.affected && !aggregate) { //what happens if person has more than one affected spouse? where to place him/her then?
                // node.y = spouse.y;
                if (node.sex === Sex.Male) {
                  node.y = spouse.y - 0.2;
                } else {
                  node.y = spouse.y + 0.2;
                }
                // console.log('1. setting y to ', node.y)
              } else { //Non affected Spouse

                if (node.sex === Sex.Male) {
                  node.y = Y - 0.2;
                } else {
                  node.y = Y + 0.2;
                }
                // console.log('2. setting y to ', node.y)
              }
            });
          }
          // }

          // Ensure there are no affected parents in this family, then set all the spouses to the x position of one of the dads.
          //Place Mom and Dad Nodes on top of Each other (at the dad's x location)
          // if (node.sex === Sex.Female && node.spouse.length > 0 && !node.affected && !node.spouse[0].affected) {
          //   node.x = node.spouse[0].x; //need to figure out how to handle multi spouse situations 2/23/2017
          // }


        }


      }

      if (node.affected) {
        // console.log('Y shift L886', node.id)
        Y = Y - 1;
      } else {
        //Check if you are at the end of a branch w/ only unaffected leaf children.
        const unaffectedLeafChildren = !(node.spouse.reduce((acc, s) => {
          return GraphData.hasAffectedChildren(s) || acc;
        }, false));

        // let hasAffectedSpouse = node.spouse.reduce((acc, spouse) => {
        //   return acc && !spouse.affected;
        // }, true);

        let hasAffectedSpouse = node.spouse.find(n => {
          return n.affected
        })

        //If current node has only unaffected leaf children and does not have any affected spouses and is not a leaf
        const newBranch = unaffectedLeafChildren && node.hasChildren
          // && isUndefined(hasAffectedSpouse)
          && node.originalY < max(node.spouse.map((s) => {
            return s.originalY;
          }));

        if (newBranch) {
          console.log('newBranch for ', node.id)
          Y = Y - 1;
        }

        node.hidden = true;
        node.aggregated = aggregate; //set aggregate status according to input parameter of to aggregate (true) or not (false);
      }
    });

    this.trimTree();

    const idRange = [];
    this.nodes.forEach((n: any) => {
      if (!(!n.aggregated && n.hidden)) {
        const ind: number = this.ids.indexOf(n.id);
        idRange.push(n.id);
      }
    });

    this.exportYValues();
    this.tableManager.activeGraphRows = (idRange);
  }

  /**
   *
   * This function removes white rows from the tree.
   */
  private trimTree() {
    let toCollapse = 0;
    range(1, this.nodes.length, 1).forEach((y) => {
      // console.log(y);
      //find any nodes that are in that row
      const rowNodes = this.nodes.find((d) => {
        return Math.round(d.y) === y;
      });

      if (!rowNodes) { //found an empty Row
        // console.log('row ', y , ' is empty')
        toCollapse = toCollapse + 1;
      } else if (toCollapse > 0) {
        // console.log('will collapse', toCollapse)
        this.nodes.forEach((node) => {
          if (Math.round(node.y) >= y) {
            node.y = node.y - toCollapse;

          }
        });
        toCollapse = 0;
      }
    });
  }


  /**
   *
   * This function uncollapses a branch from a given starting node.
   *
   * @param startNode - startingNode.
   *
   */
  private expandBranch(startNode) {

    const endIndex = this.findLastLeaf(startNode);
    let endNode;

    const startIndex = startNode.originalY;

    const toUncollapse = this.nodes.filter((node) => {
      return node.originalY <= startIndex && node.originalY >= endIndex;
    });

    const numRows = toUncollapse.length - 1;
    const ind = 1000;

    toUncollapse.forEach((n) => {
      if (n.originalY < ind) {
        endNode = n;
      }
    });

    const ydiff = Math.round(endNode.originalY - endNode.y);

    this.nodes.forEach((node) => {
      if (node.originalY > startIndex) {
        node.y = node.y + numRows;
      } else if (node.originalY >= endIndex) {
        node.y = node.originalY - ydiff;
        node.x = node.originalX;
        node.hidden = false;
        node.aggregated = false;
      }
    });

    this.trimTree();

    const idRange = [];
    this.nodes.forEach((n: any) => {
      if (!(!n.aggregated && n.hidden)) {
        const ind: number = this.ids.indexOf(n.id);
        idRange.push(n.id);
      }
    });

    this.exportYValues();
    this.tableManager.activeGraphRows = idRange;

//    this.tableManager.activeGraphRows = Range.list(idRange);
  }

  /**
   *
   * This function returns true if this node has any affected leaf children.
   *
   * @param node to query
   * @return true/false indicating whether this node has any affected leaf children
   */
  static
  hasAffectedChildren(node) {

    return !node.children.reduce((acc, child) => {
      return acc && !child.affected && !child.hasChildren;
    }, true);
  }

}

/**
 * Method to create a new graphData instance
 * @param data
 * @returns {GraphData}
 */
export function

create(data) {
  return new GraphData(data);
}
