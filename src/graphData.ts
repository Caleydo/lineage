/**
 * Created by Carolina Nobre on 01.22.2017
 */
/**
 * Data structure for the genealogy graph.
 */
import {
  max,
  min,
} from 'd3-array';

class GraphData {

  public nodes;

  //Array of Parent Child Edges
  public parentChildEdges = [];

  //Array of Parent Parent Edges
  public parentParentEdges = [];

  constructor(data) {
    this.nodes = data;
    // this.uniqueID = [];

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

      //For Tree structure
      d.hasChildren = false;
      d.children = []; //Array of children
      d.spouse = []; //Array of spouses (some have more than one)
    });

    //Define attribute that defines 'affected' state
    this.definePrimary('suicide', 'Y');
    this.buildTree();
    // this.computeGenerations();
  }


  /**
   *
   * This function defined the 'affected' state based on a user defined attribute.
   * 1) between parents and their children -> parent child edges.
   * 2) between couples -> parent parent edges
   *
   * @param attribute attribute to be used to define 'affected' state of nodes.
   * @param threshold threshold to apply to attribute when defining 'affected'.
   * Currently has a single value that indicates true.
   */
  private definePrimary(attribute, threshold) {
    this.nodes.forEach((node) => {
      node.affected = node[attribute] === threshold;
      //node.affected = +d["affection"] === 100;
      //node.affected= 0;
      // node.affected = Math.random() > 0.8;
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
      return node.y;
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
   */
  public hideNodes(startIndex) {

    let Y = startIndex;

    //Find the non hidden node in that row
    const startNode = this.nodes.filter((node) => {
      return (node.y === startIndex && !node.hidden);
    });

    if (startNode.length === 0) {
      return; //user clicked on a hidden node;
    }

    //Iterate down that branch to find the last index of this family.
    const endIndex = this.findLastLeaf(startNode[0]);

    this.nodes.sort((a, b) => {
      return b.Y - a.Y;
    });

    //Assign a row for each affected case within the range to be collapsed;
    this.nodes.filter((node) => {
      return node.y <= startIndex && node.y >= endIndex;
    }).forEach((node) => {

      //non affected leaf nodes
      if (!node.hasChildren && !node.affected) {

        const ma = node.ma;
        const pa = node.pa;

        //If both parents are affected
        if (ma.affected && pa.affected) { //place kid grid in the middle
          if (node.sex === 'M') {
            node.y = min([ma.y, pa.y]) + 0.3;
          } else {
            node.y = max([ma.y, pa.y]) - 0.3;
          }
          //Place node at x position of youngest parent
          node.x = max([ma.x,pa.x]);
          } else if (ma.affected) { //Only mother is affected,
          if (node.sex === 'M') {
            node.y = ma.y - 0.2;
          } else {
            node.y = ma.y + .2;
          }
          node.x = pa.x; //place kidGrid in front of father icon

        } else if (pa.affected) { //Only father is affected
          if (node.sex === 'M') {
            node.y = pa.y - 0.2;
          } else {
            node.y = pa.y + 0.2;
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

            // console.log('largest y for family is ', this.findLargestY(node));
            const spouse = spouses[0];
            // spouses.map((spouse) => {
            //Affected Spouse
            if (spouse.affected) { //what happens if person has more than one affected spouse? where to place him/her then?
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
          node.y = Y;
          const spouses = node.spouse;

          if (spouses.length > 0) {
            const spouse = spouses[0];
            if (!spouse.affected) {
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
        const unaffectedLeafChildren = !(node.spouse.reduce((acc,s) => {return GraphData.hasAffectedChildren(s) || acc;},false));


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


    //Get rid of blank rows;
    this.nodes.filter((d) => {
      return d.y >= endIndex;
    }).forEach((node) => {
      const offset = Y - Math.round(endIndex) + 1;
      node.y = node.y - offset;
    });
  }


  /**
   *
   * This function returns true if this node has any affected leaf children.
   *
   * @param node to query
   * @return true/false indicating whether this node has any affected leaf children
   */
  static hasAffectedChildren(node) {

    return !node.children.reduce((acc, child) => {
      // console.log('child', child.Y, ' affected: ', child.affected);
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
