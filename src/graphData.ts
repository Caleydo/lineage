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

class GraphData {

  public nodes;
  public table;

  //Array of Parent Child Edges
  public parentChildEdges = [];

  //Array of Parent Parent Edges
  public parentParentEdges = [];


  constructor(data) {
    this.table = data.table;
  };

  /**
   * This function loads genealogy data from lineage-server
   * and builds the genealogy tree
   * @param: name of the dataset
   * returns a promise of table
   *
   */
  public async createTree() {

    this.nodes = [];
    let columns = this.table.cols();
    let rows = await this.table.col(1).data('0:-1');

    for (let row of range(0, rows.length, 1)) {
      let personObj = {};
      for (let col of columns) {
        let data = await this.table.colData(col.desc.name);
        personObj[col.desc.name] = data[row];
      }
      this.nodes.push(personObj);
    }


  //Sort nodes by y value, always starting at the founder (largest y) ;
  this.nodes.sort(function (a, b) {
    return b.y - a.y;
  });

  //Initially set all nodes to visible (i.e, not hidden)  and of type 'single' (vs aggregate)
  this.nodes.forEach((d) => {
    d.type = 'single';
    d.hidden = false;
    d.aggregated = false;
    d.bdate = +d.bdate;
    d.deceased = d.deceased === 'Y'; //transform to boolean values
    d.generation = -1; //indicator that generation has not been set
    d.descendant = false; //flag for blood descendants of founders - not in use yet (2/23/17)
    d.x = +d.bdate; //set year as x attribute
    d.Y = +d.y; //keeps track of nodes original y position
    d.X = +d.x; //keeps track of nodes original x position - can change for kid grids on hide.
    d.family_ids = []; //keeps track of nuclear families a given node belongs to.
    d.clicked = false; //used to keep track of clicked nodes even when they are removed from the visible area. May not need if nodes are not removed and simply scroll out of view.
    d.primary = undefined; //Keep track of primary attribute and what 'affected' means for this attribute data.
    d.secondary = undefined; //Keep track of secondary attribute and what 'affected' means for this attribute data.
    //For Tree structure
    d.hasChildren = false;
    d.children = []; //Array of children
    d.spouse = []; //Array of spouses (some have more than one)
  });

  //Define attribute that defines 'affected' state
  this.definePrimary('suicide', 'Y');
  this.buildTree();

  };



  /**
   *
   * This function defined the 'affected' state based on a user defined attribute.
   *
   * @param attribute attribute to be used to define 'affected' state of nodes.
   * @param value threshold value to apply to attribute when defining 'affected'.
   * Currently has a single value that indicates true.
   */
  private definePrimary(attribute, value) {
    console.log('calling definePrimary', attribute, value);
    this.nodes.forEach((node) => {
      node.affected = node[attribute] === value;
      console.log(node.affected);
      //node.affected = +d["affection"] === 100;
      // node.affected= false;
      node.primary = {'Attribute': attribute, 'Threshold': value};
      // node.affected = Math.random() > 0.7;
    });

  }

  /**
   *
   * This function defined the 'secondary attribute' state based on a user defined attribute.
   *
   * @param attribute attribute to be used to define 'affected' state of nodes.
   * @param value threshold value to apply to attribute when defining 'affected'.
   * Currently has a single value that indicates true.
   */
  private defineSecondary(attribute, value) {
    this.nodes.forEach((node) => {
      node.secondary = {'Attribute': attribute, 'Threshold': value};
      node.affected = node[attribute] === value;
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

    this.nodes
      .forEach((node) => {
        //Check if there are mother and father nodes in this family (founder won't have them for example)
        let maNode = this.nodes.filter((d) => {
          return d.id === node.ma;
        });
        let paNode = this.nodes.filter((d) => {
          return d.id === node.pa;
        });

        //No parents found
        if (maNode.length === 0 || paNode.length === 0) {
          node.ma = undefined;
          node.pa = undefined;
        } else { //If found parents, create edges between parent and children, spouses, and add references to build tree
          maNode = maNode[0];
          paNode = paNode[0];

          //Replace ma and pa fields with reference to actual ma/pa nodes
          node.ma = maNode;
          node.pa = paNode;

          //relationship node. Used to build parent child edges
          const rnode = {
            'ma': maNode,
            'pa': paNode,
            'type': 'parent',
            'id': Math.random() //Create random id or each parentParent Edge.
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
  };

  /**
   *
   * This function traverses down the tree to find the index of the last (upwards) leaf node in a given branch
   *
   * @param node - starting node.
   */
  public findLastLeaf(node) {

    //will have to add case if there are ever leaf nodes with spouses but no children. 2/23/2017
    //Base case -> leaf node w/ no spouse
    if (node.spouse.length === 0 && !node.hasChildren) {
      return node.Y;
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

  /**
   *
   * This function traverses finds the largestY value (increasing towards the root) for a set of parents.
   * Used to create parent Grid;
   *
   * @param node - starting node.
   */
  private findLargestY(node) {

    //Base Case
    if (node.spouse.length === 1) {
      return max([node.y, node.spouse.y]);
    } else {
      return max([node.y].concat(node.spouse.map((s) => {
        return this.findLargestY(s);
      })));
    }


  }

  /**
   *
   * This function hides all the nodes that descend from a given starting point. to the end of that branch.
   *
   * @param startIndex - y value (row number) for the starting point.
   * @param aggregate - boolean flag to indicate whether collapsed nodes should be hidden or aggregated into their own row.
   */
  public hideNodes(startIndex, aggregate) {

    let Y: number = startIndex;

    //find all nodes in that row
    const rowNodes = this.nodes.filter((node) => {
      return Math.round(node.y) === startIndex;
    });

    //find the largest original Y value
    let startYIndex: any = max(rowNodes, function (n) {
      return n['Y'];
    });

    //Find the node that has that large Y value
    let startNode = this.nodes.filter((node) => {
      return node.Y === startYIndex;
    })[0];

    //Consider Spouse
    if (startNode.spouse.length > 0) {
      //find the spouses Y values
      let spouseY = startNode.spouse.map((s) => {
        return s.Y;
      });

      startYIndex = max([startYIndex].concat(spouseY));

      //Find the node that has that large Y value
      startNode = this.nodes.filter((node) => {
        return node.Y === startYIndex;
      })[0];

      Y = startNode.y;
    }

    //Returns the Y value of the last leaf node in that branch
    const endIndex: any = this.findLastLeaf(startNode);

    const endNode = this.nodes.filter((n) => {
      return n.Y === endIndex;
    })[0];


    //Iterate through branch, if there are hidden nodes, uncollapse
    const isHidden = this.nodes.filter((node) => {
      return (node.Y <= startNode.Y && node.Y >= endIndex && node.hidden);
    });

    if (isHidden.length > 0) {
      this.expandBranch(startNode);
      return;
    }
    ;

    this.nodes.sort((a, b) => {
      return b.Y - a.Y;
    });

    //Assign a row for each affected case within the range to be collapsed;
    this.nodes.filter((node) => {
      return node.Y <= startYIndex && node.Y >= endIndex;
    }).forEach((node, i) => {

      //non affected leaf nodes
      if (!node.hasChildren && !node.affected) {

        const ma = node.ma;
        const pa = node.pa;

        //If both parents are affected
        if (ma.affected && pa.affected) {
          if (!aggregate) { //place kid grid in the middle
            if (node.sex === 'M') {
              node.y = min([ma.y, pa.y]) + 0.3;
            } else {
              node.y = max([ma.y, pa.y]) - 0.3;
            }
          } else { //aggregate mode is on
            if (node.sex === 'M') {
              node.y = Y - 0.2;
            } else {
              node.y = Y + .2;
            }
          }
          //Place node at x position of youngest parent
          node.x = max([ma.x, pa.x]);
        } else if (ma.affected) {//Only mother is affected,
          if (!aggregate) {
            if (node.sex === 'M') {
              node.y = ma.y - 0.2;
            } else {
              node.y = ma.y + .2;
            }
          } else {
            if (node.sex === 'M') {
              node.y = Y - 0.2;
            } else {
              node.y = Y + .2;
            }
          }
          node.x = pa.x; //place kidGrid in front of father icon

        } else if (pa.affected) { //Only father is affected
          if (!aggregate) {
            if (node.sex === 'M') {
              node.y = pa.y - 0.2;
            } else {
              node.y = pa.y + 0.2;
            }
          } else {
            if (node.sex === 'M') {
              node.y = Y - 0.2;
            } else {
              node.y = Y + .2;
            }
          }
          node.x = ma.x; //place kidGrid in front of mother icon
        } else {//Neither parent is affected
          if (node.sex === 'M') {
            node.y = pa.y;
          } else {
            node.y = ma.y;
          }
          node.x = pa.x; //place kid grid in front of father icon since they are both aligned
        }

      } else { //Affected nodes and non-leaf nodes
        //Non-leaf and non-affected nodes
        if (!node.affected) {

          const spouses = node.spouse;

          if (spouses.length > 0) { //they had at least one partner

            const spouse = spouses[0];
            // spouses.map((spouse) => {
            //Affected Spouse
            if (spouse.affected && !aggregate) { //what happens if person has more than one affected spouse? where to place him/her then?
              // node.y = spouse.y;
              if (node.sex === 'M') {
                node.y = spouse.y - 0.2;
              } else {
                node.y = spouse.y + 0.2;
              }
            } else { //Non affected Spouse
              if (node.sex === 'M') {
                node.y = Y - 0.2;
              } else {
                node.y = Y + 0.2;
              }
            }
            // });
          }
        } else { //Affected Nodes
          if (aggregate && i > 0 && !this.nodes[i - 1].affected) {
            Y = Y - 1;
          }
          ;
          node.y = Y;
          const spouses = node.spouse;

          if (spouses.length > 0) {
            const spouse = spouses[0];
            if (!spouse.affected && !aggregate) {
              if (spouse.sex === 'M') {
                spouse.y = Y - 0.2;
              } else {
                spouse.y = Y + 0.2;
              }
              spouse.x = node.x;
            }
          }
        }

        //Place Mom and Dad Nodes on top of Each other (at the dad's x location)
        if (node.sex === 'F' && node.spouse.length > 0 && !node.affected && !node.spouse[0].affected) {
          node.x = node.spouse[0].x; //need to figure out how to handle multi spouse situations 2/23/2017
        }

      }

      if (node.affected) {
        Y = Y - 1;
      } else {
        //Check if you are at the end of a branch w/ only unaffected leaf children.
        const unaffectedLeafChildren = !(node.spouse.reduce((acc, s) => {
          return GraphData.hasAffectedChildren(s) || acc;
        }, false));


        //If current node has only unaffected leaf children and does not have any affected spouses and is not a leaf
        const newBranch = unaffectedLeafChildren && node.hasChildren &&
          node.spouse.reduce((acc, spouse) => {
            return acc && !spouse.affected;
          }, true)
          && node.Y < max(node.spouse.map((s) => {
            return s.Y;
          }));

        if (newBranch) {
          Y = Y - 1;
        }

        node.hidden = true;
      }
    });

  }

  /**
   *
   * This function removes white rows from the tree.
   */
  private trimTree() {
    let toCollapse = 0;
    range(1, this.nodes.length, 1).forEach((y) => {

      //find any nodes that are in that row
      const rowNodes = this.nodes.filter((d) => {
        return d.y === y;
      }).length;

      if (rowNodes < 1) { //found an empty Row
        toCollapse = toCollapse + 1;
      } else {
        console.log('collapsing ', toCollapse, 'rows');
        this.nodes.forEach((node) => {
          if (Math.round(node.y) >= y) {
            node.y = node.y - toCollapse;
          }
        });
        toCollapse = 0;
      }
      ;
    });
  };


  /**
   *
   * This function uncollapses a branch from a given starting node.
   *
   * @param startNode - startingNode.
   *
   */
  private expandBranch(startNode) {

    let endIndex = this.findLastLeaf(startNode);
    let endNode;

    let startIndex = startNode['Y'];

    let toUncollapse = this.nodes.filter((node) => {
      return node.Y <= startIndex && node.Y >= endIndex;
    });

    let numRows = toUncollapse.length - (startIndex - endIndex) - 1;

    const ind = 1000;

    toUncollapse.forEach((n) => {
      if (n['Y'] < ind) {
        endNode = n;
      }
    });

    // let ydiff = endNode['Y']-endNode['y'];
    let ydiff = 0;

    this.nodes.forEach((node) => {
      if (node['Y'] > startIndex) {
        node['y'] = node['y'] + numRows;
      } else if (node['Y'] >= endIndex) {
        node['y'] = node['Y'] - ydiff;
        node['x'] = node['X'];
        node['hidden'] = false;
      }
    });
  };

  /**
   *
   * This function returns true if this node has any affected leaf children.
   *
   * @param node to query
   * @return true/false indicating whether this node has any affected leaf children
   */
  static hasAffectedChildren(node) {

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
export function create(data) {
  return new GraphData(data);
}
