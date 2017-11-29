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
import { VIEW_CHANGED_EVENT, FAMILY_SELECTED_EVENT, default as TableManager } from './tableManager';
import { isUndefined } from 'util';
import Node from './Node';
import { Sex } from './Node';
import { layoutState } from './Node';
import { ITable } from 'phovea_core/src/table/ITable';
import { CURRENT_YEAR } from './genealogyTree';


class GraphData {

  public nodes: Node[];
  public graphTable: ITable;
  public attributeTable: ITable;
  private tableManager: TableManager;
  private ids: string[]; //unique identifier for each person. Is used to create new range on graphView
  private uniqueIDs: string[];
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

    events.on(FAMILY_SELECTED_EVENT, () => {
      console.log('family was selected');
      this.graphTable = this.tableManager.graphTable;

      //Once tree has been created for the new family, fire redraw tree event.
      this.createTree().then(() => {
        this.aggregateTreeWrapper(undefined, layoutState.Hidden); //default to hidden state;
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
      return !n.visited && n.ma && n.pa;
    });

    if (toDecycle.length === 0) {
      return;
    }
    const startNode = toDecycle.find((n) => {
      return n.bdate === min(toDecycle, (n) => {
        return n.bdate;
      });
    });

    this.removeCyclesHelper(startNode);

    this.removeCycles();
  }

  private removeCyclesHelper(node: Node) {
    //  console.log('visiting node ', node.id, node.visited);

    if (node.visited && node.spouse.length > 0) {
      console.log('found child cycle with ', node.id, node.spouse);

      node.visited = false;
      [node].concat(node.spouse).map((n)=> {this.clearVisitedBranch(n);});


      //Create Duplicate Node in the 'child' role and leave the current one as the parent/spouse
      const duplicateNode = Object.assign(Object.create(node), node);

      duplicateNode.id = node.id;
      duplicateNode.uniqueID = node.uniqueID.toString()+'_2';
      duplicateNode.visited = false;

      this.clearVisitedBranch(duplicateNode);

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

    } else {
      // console.log('setting node ', node.id, ' visited status to true')
      node.visited = true;
      node.spouse.forEach((s: Node) => {
        // console.log('visiting spouse',s.id,s.visited);
        if (s.visited) {
          console.log('found spouse cycle between  ', node.id, ' and ', s.id);
          //choose the person who is part of the blood family (i.e, who have a mom and dad in this family) and duplicate them.
          let toDuplicate;
          if (node.ma) {
            toDuplicate = node;
          } else if (s.ma) {
            toDuplicate = s;
          } else {
            console.log('neither person has parents in this family!',node.id,s.id);
          }


          if (!isUndefined(toDuplicate)) {
            const duplicateNode = Object.assign({}, toDuplicate);


            duplicateNode.id = toDuplicate.id;
            duplicateNode.uniqueID = Math.random().toString();
            duplicateNode.visited = false;

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

        // console.log('setting spouse of ', node.id, ': ', s.id , ' visited status to true');
        s.visited = true;


      });
    }

    if (node.ma || node.pa) {
    node.children.forEach((c) => {
      // console.log('applying RCH on ', c.uniqueID ,'/',c.id,  ' from ', node.uniqueID,'/',node.id);
      this.removeCyclesHelper(c);
    });
  }

    if (!node.hasChildren) {
      return;
    }
  }

  /**
   * This function sets the 'visited' state of the remainder of this branch to false.
   *
   */
  private clearVisitedBranch(node) {

    if (!node.hasChildren) {
      return;
    }
    //set all spouses to false
    node.spouse.forEach((s) => {
      s.visited = false;
      // console.log('clearing node ', s.id)
    });

    //recursively call this function on the children
    node.children.forEach((c) => {
      c.visited = false;
      // console.log('clearing node ', c.id);
      this.clearVisitedBranch(c);
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

    this.nodes = [];
    const columns = this.graphTable.cols();
    const peopleIDs = await columns[0].names();
    const idRanges = await columns[0].ids();
    const kindredRanges = await columns[1].data();

    this.ids = idRanges.dim(0).asList().map((d) => {
      return d.toString();
    });

    this.uniqueIDs = idRanges.dim(0).asList().map((d,i) => {
      return d.toString() + kindredRanges[i].toString();
    });

    const columnDesc = this.graphTable.desc.columns;
    const columnNameToIndex: { [name: string]: number } = {};

    const allData = await this.graphTable.data();
    for (let i = 0; i < columnDesc.length; i++) {
      const name = columnDesc[i].name;
      columnNameToIndex[name] = i;
    }

    let i = 0;
    for (const row of allData) {
      const node = new Node(this.ids[i]);

      node.initialize(columnNameToIndex, row);
      this.nodes.push(node);
      i++;
    }

    //Sort nodes by y value, always starting at the founder (largest y) ;
    this.nodes.sort(function (a, b) {
      return b.y - a.y;
    });

    this.defineAffected(this.tableManager.affectedState);

    this.buildTree();

    do {
    //Create fake birthdays for people w/o a bdate or ddate.
    this.nodes.forEach((n) => {
      if (n.bdate === 0 || isNaN(n.bdate)) { //random number
        n.inferredBdate = true;
        // subtract 20 from the age of the first kid
        if (n.hasChildren) {
          n.bdate = n.children[0].bdate && n.children[0].bdate - 20;
          n.x = n.children[0].bdate &&  n.bdate;
        } else {
          // The not-so-nice case when we don't have an age and no children
          n.x = CURRENT_YEAR - 3;
          n.bdate = CURRENT_YEAR - 3;
        }
      }
      // if (n.ddate === 0 || isNaN(n.ddate)) {
      //   n.ddate = CURRENT_YEAR;
      // }
    });
  } while (this.nodes.filter((node)=> {return isNaN(node.bdate);}).length>0);

    if (this.nodes.filter((node)=> {return isNaN(node.bdate);}).length>0) {
      console.log('Houston we have a problem');
    }



    //Remove cycles by creating duplicate nodes where necessary
    this.removeCycles();

    //Linearize Tree and pass y values to the attributeData Object
    this.linearizeTree();

    //Create dictionary of person to y values
    this.exportYValues();

    //After linear order has been computed:
    this.nodes.forEach((d) => {
      d.originalX = +d.x; //keeps track of nodes original x position
      d.originalY = +d.y; //keeps track of nodes original y position - can change for kid grids on hide.
    });

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
   * This function passes the newly computed y values to the tableManager
   *
   */
  private exportYValues() {

    //Create hashmap of personID to y value;
    const dict = {};

    this.nodes.forEach((node) => {
      if (node.uniqueID in dict) {
        dict[node.id+'_'+node.kindredID].push(Math.round(node.y));
      } else {
        dict[node.id+'_'+node.kindredID] = [Math.round(node.y)];
      }
    });


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
      return n.bdate === min(nodeList, (n) => {
        return n.bdate;
      });
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

    node.children.map((child: Node) => {
      this.linearizeHelper(child);
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
  private linearizeLogic(node: Node) {

    if (node.y === undefined) {
      node.y = min(this.nodes, (n: any) => {
        return n.y;
      }) + (-1);
    }

    //Assign y position of all spouses.
    if (node.spouse.length > 0) {
      // console.log('node ', node.id , ' has ',  node.spouse.length , ' spouses')
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
          }
        });

        if (s.id === '652900') {
          console.log(node.id,node.y,s.y);
        }

      });

      //If person has two spouses, put this one in the middle.
      if (node.spouse.length === 2) {
        const ys = [node.y].concat(node.spouse.map((s) => {
          return s.y;
        }));
        ys.sort();
        //sort spouses by mean child age:
        node.spouse.sort((s1, s2) => { return (min(s1.children, (child: Node) => { return child.bdate; }) - min(s2.children, (child: Node) => { return child.bdate; })); });

        node.y = ys[1];
        node.spouse[0].y = ys[0];
        node.spouse[1].y = ys[2];
      }

      //sort kids by spouse order, then by age;
      node.spouse.sort((a, b) => { return b.y - a.y; });

      let allKids = [];

      node.spouse.forEach((s: Node) => {
        // console.log('spouse for ', node.id, ' ',  s.y)
        s.children.sort((a, b) => {
          return b.bdate - a.bdate;
        });
        allKids = allKids.concat(s.children);
      });

      //Add back in kids that don't have a father;


      node.children = node.children.filter((c:Node)=> {return c.paID === '0';}).concat(allKids);
    }

  }


  /**
   *
   * This function prepares the tree for aggregation, cleans up the results and updates the tableManager.
   * @param nodeID, starting node for the aggregate/hide/expand operation. If undefined, apply to entire tree.
   * @pram state, defines operation as one of the three enums: state.expanded, state.aggregated, state.hidden.
   */
  private aggregateTreeWrapper(nodeID: string, state: layoutState) {

    if (!isUndefined(nodeID) && !isUndefined(state)) {
      //find node
      let node = this.nodes.find((n: Node) => {
        return n.uniqueID === nodeID;
      });

      //If node is not descendant, find descendant;
      if (!node.ma && !node.pa) {
        node = node.spouse[0];
      }
      //If node is still not descendant, pick the one with the most spouses; Multi spouse founders
      if (!node.ma && !node.pa) {
        if (node.spouse.length > 1) {
          node = node.spouse[0];
        }
      };

      //Toggle layout state of this node;
      node.state = state;

      //perpetuate state to the rest of this branch;
      this.perpetuateState(node);
    }


    //Clear tree of y values and aggregated and hidden flags;
    this.nodes.forEach((n: Node) => {
      n.y = undefined;
      n.aggregated = false;
      n.hidden = false;
      n.x = n.originalX;
      //Set aggregate/hide/expand flag for each node
      if (isUndefined(nodeID) && !isUndefined(state)) {
        n.state = state;
      }

    });

    this.aggregateTree();

    //clean out extra rows at the top of the tree;
    const minY = min(this.nodes, (n: any) => {
      return n.y;
    }) - 1;

    this.nodes.forEach((n) => { n.y = n.y - minY; });

    //Adjust y position for non affected nodes in the tree;
    this.nodes.forEach((n: Node) => {
      if (n.hidden && !n.affected) {
        if (n.sex === Sex.Male) {
          n.y = n.y - 0.2;
        }
        if (n.sex === Sex.Female) {
          n.y = n.y + 0.2;
        }
      }
    });

    //Hide Mode

    //Adjust x position for spouses of affected nodes;
    this.nodes.forEach((n: Node) => {
      if (n.state === layoutState.Hidden) {
        if (n.hidden && !n.affected && n.hasChildren && n.spouse.find((s) => {
          return s.affected;
        })) {
          n.x = n.x - Config.glyphSize * .6;
        }
      }
    });


    const idRange = [];
    this.nodes.forEach((n: any) => {
      if (!(!n.aggregated && n.hidden)) {
        // const ind: number = this.uniqueIDs.indexOf(n.uniqueID);
        idRange.push(n.uniqueID);
      }
    });


    this.exportYValues();
    this.tableManager.activeGraphRows = idRange;

  }


  /**
   *
   * This function recursively applies the layout state of the seed node to the rest of this branch.
   * @param node, starting point of the branch
   *
   */
  private perpetuateState(n: Node) {

    if (!n.hasChildren) {
      return;
    }

    //apply state to spouses
    n.spouse.forEach((s: Node) => { s.state = n.state; });

    //recursively call function on children.
    n.children.forEach((child: Node) => {
      child.state = n.state;
      this.perpetuateState(child);
    });

  };

  /**
   *
   * This function aggregates all nodes in the branch starting at a given node X.
   * @param applyToAll, boolean flag indicating if operation should be apply to entire tree;
   * @param aggregate, true for aggregation, false for hiding, undefined for expand.
   *
   */
  private aggregateTree() {

    //Only look at nodes who have not yet been assigned a y value
    const nodeList = this.nodes.filter((n) => {
      return n.y === undefined;
    });

    if (nodeList.length === 0) {
      return;
    }

    //Find oldest person in this set of nodes and set as founder
    let startNode = nodeList.find((n) => {
      return n.bdate === min(nodeList, (n) => {
        return n.bdate;
      });
    });

    //If starting node is not the 'center' of the founding spouses or is not a direct descendant
    if (startNode.spouse.length === 1 && (startNode.spouse[0].spouse.length > 1 || isUndefined(startNode.ma))) {
      startNode = startNode.spouse[0];
    }

    const minY = min(this.nodes, (n: any) => {
      return n.y;
    });

    if (isUndefined(minY)) {
      startNode.y = nodeList.length; //Set first y index;
    } else {
      startNode.y = minY - 1; //Set first y index;
    }

    if (!startNode.affected && startNode.hasChildren && startNode.state !== layoutState.Expanded) {
      startNode.hidden = true;
      startNode.aggregated = startNode.state === layoutState.Aggregated;
    }

    this.aggregateHelper(startNode);

    //Recursively call aggregateTree to handle any nodes that were not assigned a y value.
    this.aggregateTree();
  }


  /**
   *
   * This is a recursive helper function for aggregateTree()
   * @param node - node that needs to be aggregated;
   * @param aggregate - boolean that indicates whether to aggregate (true) or hide (false);
   *
   */
  private aggregateHelper(node: Node) {

    if (node.state === layoutState.Expanded) {
      this.linearizeLogic(node);
      node.children.forEach((child: Node) => {
        this.aggregateHelper(child);
      });
    } else {
      //Base case are leaf nodes. Reached end of this branch.
      if (!node.affected && !node.hasChildren) {
        return;
      }

      //If node is affected and has not yet been assigned a row, give it's own row
      if (isUndefined(node.y) && node.affected) {

        //find any affected nodes in the last row
        const isLastNodeAffected: Node = this.nodes.filter((n: Node) => {
          return n.y === min(this.nodes, (nd: Node) => {
            return nd.y;
          });
        }).find((n: Node) => {
          return n.affected;
        });

        if (node.state === layoutState.Aggregated || !isUndefined(isLastNodeAffected)) {
          node.y = min(this.nodes, (n: any) => {
            return n.y;
          }) + (-1);
        } else {
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
      node.spouse.map((s) => {
        if (isUndefined(s.y) && s.affected) {
          s.y = min(this.nodes, (n: any) => {
            return n.y;
          });
          if (node.state === layoutState.Aggregated) {
            s.y = s.y - 1;
          } else {
            node.y = minY;
            node.hidden = true;
            node.aggregated = false;
          }
        }
      });

      //find any unaggregated nodes in the last row
      const isLastNodeHidden: Node = this.nodes.filter((n: Node) => {
        return n.y === min(this.nodes, (nd: Node) => {
          return nd.y;
        });
      }).find((n: Node) => {
        return !n.hidden;
      });

      if (!isUndefined(isLastNodeHidden) && isUndefined(node.y)) {
        node.y = min(this.nodes, (n: any) => {
          return n.y;
        }) - 1;

        node.hidden = true;
        node.aggregated = node.state === layoutState.Aggregated;
      };


      //If node has any affected spouses, place node above them.
      if (node.state === layoutState.Aggregated && isUndefined(node.y) && node.spouse.filter((n) => {
        return n.affected;
      }).length > 0) {

        node.y = min(this.nodes, (n: any) => {
          return n.y;
        });
        if (node.state === layoutState.Aggregated) {
          node.y = node.y - 1;
        }

        node.hidden = true;
        node.aggregated = node.state === layoutState.Aggregated;
      }

      //find all nodes in the last row, will only be one if it is affected
      const lastAssignedNodes: Node[] = this.nodes.filter((n: Node) => {
        return n.y === min(this.nodes, (nd: Node) => {
          return nd.y;
        });
      });

      //of all the nodes in the last row, find either the affect one, or the one at the far right (latest bdate)
      let lastAssignedNode: Node = lastAssignedNodes.find((n: Node) => {
        return n.affected;
      });

      if (isUndefined(lastAssignedNode)) {
        lastAssignedNode = lastAssignedNodes.find((n: Node) => {
          return n.bdate === max(lastAssignedNodes, (nd: Node) => {
            return nd.bdate;
          });
        });
      }

      if (isUndefined(lastAssignedNode)) {
        console.log(lastAssignedNodes);
      }

      //check if lastFamily is the end of the branch
      const parentLastFamily = lastAssignedNode.ma || lastAssignedNode.pa;

      const isTerminal = parentLastFamily && parentLastFamily.children.filter((child)=> {return child.hasChildren;}).length === 0;

      //if the last assigned Node is affected or if it is an unaffected leaf, start a new row; This does not apply when hiding.
      if (isUndefined(node.y) &&
      (lastAssignedNode.affected || isTerminal)) {
        node.y = min(this.nodes, (n: any) => {
          return n.y;
        }) - 1;

        node.hidden = true;
        node.aggregated = node.state === layoutState.Aggregated;
      } else if (isUndefined(node.y)) {
        node.y = min(this.nodes, (n: any) => {
          return n.y;
        });
        node.hidden = true;
        node.aggregated = node.state === layoutState.Aggregated;
      }

      minY = min(this.nodes, (n: any) => {
        return n.y;
      });

      //Iterate through spouses again and assign any undefined y values to the current y
      node.spouse.map((s) => {


        if (isUndefined(s.y) && !s.affected) {
          //If current node is affected, place spouses above it:
          if (node.affected && node.state === layoutState.Aggregated) {
            s.y = minY - 1;
            //place spouses spouses above it as well.
            s.spouse.map((ss)=> {
              if (!ss.affected) {
                ss.y = s.y;
                ss.hidden = true;
                ss.aggregated = !ss.affected && node.state === layoutState.Aggregated;
              }
            });
          } else { //place spouses alongside it;
            s.y = node.y;
            //place spouses spouses alongside it as well.
            s.spouse.map((ss)=> {
              if (!ss.affected) {
                ss.y = node.y;
                ss.hidden = true;
                ss.aggregated = !ss.affected && node.state === layoutState.Aggregated;
              }
            });
          }
          s.hidden = true;
          s.aggregated = node.state === layoutState.Aggregated;
        }

      });

      //Assign all spouses to the x level of either the affected spouse or if not, a token male in the couple.

      //Align node's x value to youngest affected spouse:
      const affectedSpouseXValue = max([node].concat(node.spouse).filter((n: Node) => {
        return n.affected;
      }), (n: Node) => {
        return n.x;
      });

      let xValue = affectedSpouseXValue;

      //No affected spouse or node is a duplicate (must preserve x values for duplicates)
      if (isUndefined(affectedSpouseXValue)) {
        xValue = node.x;
      }

      //Align all spouses along a same X;
      [node].concat(node.spouse).forEach((n: Node) => {
        n.x = xValue;
      });


      //Assign Child Y and X Values
      let childY;

      //If node is affected, find unaffected spouse
      if (node.affected) {
        const unaffectedSpouse = node.spouse.find((n) => {
          return !n.affected;
        });
        if (!isUndefined(unaffectedSpouse)) {
          childY = unaffectedSpouse.y;
        } else {
          childY = min(this.nodes, (n: any) => {
            return n.y;
          });
          if (node.state === layoutState.Aggregated) {
            childY = childY - 1;
          }
        }
      } else {
        childY = node.y;
      }

      //Assign y levels to leaf children;
      node.children.map((child: Node) => {
        if (isUndefined(child.y) && !child.affected && !child.hasChildren) {
          child.y = childY;
          child.x = xValue;
          child.hidden = true;
          child.aggregated = node.state === layoutState.Aggregated;
        } else {
          this.aggregateHelper(child);
        }
      });
    }

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
      .forEach((node: Node) => {
        //Check if there are mother and father nodes in this family (founder won't have them for example)
        const maNode = this.nodes.find((d) => {
          return d.id === node.maID && d.kindredID === node.kindredID; //Make sure to get the person from the right family
        });
        // if (maNode)
        // console.log(maNode, node )
        const paNode = this.nodes.find((d) => {
          return d.id === node.paID && d.kindredID === node.kindredID;
        });
        // if (paNode)
        //   console.log(paNode, node)


        //No parents found
        if ((maNode === undefined || paNode === undefined) && (maNode !== node && paNode !== node)) {
          node.ma = maNode;
          node.pa = paNode;

         if (maNode) {
          maNode.hasChildren = true;
          //Add child to array of children of each parent
          maNode.children.push(node);
          // console.log('pushing ' , node.id , ' as child of ', maNode.id);

          this.parentChildEdges.push({
            ma: maNode,
            pa: maNode,
            target: node,
            'id': node.id //id of parentChild Edge is the id of the child.
          });
         } else if (paNode) {
          paNode.hasChildren = true;
          //Add child to array of children of each parent
          paNode.children.push(node);
          // console.log('pushing ' , node.id , ' as child of ', maNode.id);

          this.parentChildEdges.push({
            ma: paNode,
            pa: paNode,
            target: node,
            'id': node.id //id of parentChild Edge is the id of the child.
          });
         }



          //  console.log('no parents :( for ',node.id);
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
  };
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
