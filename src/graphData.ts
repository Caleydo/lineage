/**
 * Created by Carolina Nobre on 01.22.2017
 */

import * as d3 from 'd3';
import {Config} from './config';

/**
 * Class that represents the genealogy data, including attributes that will be used to populate the table
 */
class genealogyData {

  public nodes = [];

  public edges = [];

  public uniqueID = [];

  public relationshipNodes = [];

  public relationshipEdges = [];

  public numElements = 200;


  constructor(data) {
    this.parseData(data);
    this.layout();
  }

  //Function that creates graph structure from input data
  private parseData(data) {

    data.forEach(function (d, i) {
      //Limit Size of graph and only consider entries with a valid bdate and id
      if (i < this.numElements && +d['egoUPDBID'] > 0 && +d['bdate'] > 0) {
        //Demographic Info
        d.id = +d['egoUPDBID'];
        d.ma = +d['maUPDBID'];
        d.pa = +d['paUPDBID'];
        d.spouse = undefined;
        d.children = [];

        //Position Info
        d.x = undefined;
        d.y = undefined;
        d.generation = undefined;
        d.linearOrder = undefined;

        //Display Info
        d.hide = false; //used to hide/show nodes
        d.type = 'individual'; //vs aggregate'
        d.color = 'black';

        //Skip duplicate rows
        if (this.nodes.filter(function (node) {
            return node.id == d.id
          }).length == 0) {
          this.nodes.push(d);
          this.uniqueID.push(d.id);
        }
      }

      //Store spouse and children in each node;
      this.nodes.forEach(function (node, id) {
        //Check for the existence of mother and father nodes
        const maID = this.uniqueID.indexOf(node['ma']);
        const paID = this.uniqueID.indexOf(node['pa']);

        if (maID > -1 && paID > -1) {
          this.nodes[maID].spouse = node['pa'];
          this.nodes[paID].spouse = node['ma'];
          this.nodes[maID].children.push(id);
          this.nodes[paID].children.push(id);
        }
      })

    });

    //Filter out nodes with no parents and no children
    this.nodes = this.nodes.filter(function (node) {
      return node.children.length > 0 || this.uniqueID.indexOf(node['ma']) > -1
    });
    //Create edges between individuals and their parents
    //These edges are not currently being drawn. We draw the relationship edges instead which are defined in layout()
    this.nodes.forEach(function (d) {

      if (this.uniqueID.indexOf(d['ma']) != -1) {
        this.edges.push({
          source: this.nodes[this.uniqueID.indexOf(d['id'])],
          target: this.nodes[this.uniqueID.indexOf(d['ma'])]
        });
      }
      if (this.uniqueID.indexOf(d['pa']) != -1) {
        this.edges.push({
          source: this.nodes[this.uniqueID.indexOf(d['id'])],
          target: this.nodes[this.uniqueID.indexOf(d['pa'])]
        });
      }

    });

  }

  /**
   * Defines the x position (generation) of a given person/node.
   * @param node --> pointer to node
   */
  private assignX(node) {
    node.x = +node['bdate'];
  }


  /**
   * Defines the y position of a given person/node.
   * @param node --> pointer to node
   */

  private assignY(node) {
    const maID = this.uniqueID.indexOf(node['ma']);
    const paID = this.uniqueID.indexOf(node['pa']);
    const spouseID = this.uniqueID.indexOf(node['spouse']);

    if (!node.y) {
      node.y = d3.max(this.nodes, function (d:any) {
          return d.y
        }) + 1;
    }
    //Put spouse to the left of the current node (at least in a first pass)
    if (node.spouse && !this.nodes[spouseID].y) {
      this.nodes[spouseID].y = node.y;

      if (!Config.collapseParents) {
        //Push all nodes one to the right
        this.nodes.forEach(function (d) {
          if (d.y > node.y) d.y = d.y + 1
        });
        node.y = node.y + 1;
      }
    }
    else if (node.spouse && this.nodes[spouseID].y && Config.collapseParents) {
      node.y = this.nodes[spouseID].y;
    }

    if (maID > -1 && paID > -1) {

      if (this.nodes[maID].y) {
        if (this.nodes[maID].y < node.y) {
          node.y = this.nodes[maID].y;
          this.nodes.forEach(function (d) {
            if (d.y > node.y) d.y = d.y + 1
          });
          this.nodes[maID].y = node.y + 1;

          if (!Config.collapseParents) {
            this.nodes[paID].y = this.nodes[maID].y + 1;
          }
          else
            this.nodes[paID].y = this.nodes[maID].y;

        }
      }
      else {
        if (!Config.collapseParents) {
          this.nodes.forEach(function (d) {
            if (d.y > node.y) d.y = d.y + 2
          });
          this.nodes[paID].y = node.y + 2;
        }
        else {
          this.nodes.forEach(function (d) {
            if (d.y > node.y) d.y = d.y + 1
          });
          this.nodes[paID].y = node.y + 1;
        }
        this.nodes[maID].y = node.y + 1;

      }
    }

  }


  /**
   * Calls assignX and assignY on all nodes, and creates the visual edges that connect children to their parents.
   */

  private layout() {

    this.nodes.forEach(function (node, ind) {
      this.assignX(node)
    });

    //sort by x
    this.nodes.sort(function (a, b) {
      return parseFloat(a['x']) - parseFloat(b['x']);
    });

    this.nodes.forEach(function (d) {
      this.uniqueID.push(d.id);
    });

    this.nodes[0].y = 1;
    this.nodes.forEach(function (node) {
      this.assignY(node)
    });

    this.nodes.forEach(function (thisNode) {

      if (this.nodes.filter(function (n) {
          return n.y != undefined && n.y == thisNode.y
        }).length > 1) {
        this.nodes.forEach(function (d) {
          if (d.y > thisNode.y) d.y = d.y + 1;
        });
        thisNode.y = thisNode.y + 1;
      }
    });

    const randColor = d3.scaleOrdinal(d3.schemeCategory20b);

    //Create relationship nodes
    this.nodes.forEach(function (node) {
      const maID = this.uniqueID.indexOf(node['ma']);
      const paID = this.uniqueID.indexOf(node['pa']);

      if (maID > -1 && paID > -1) {

        const rColor = randColor(node.y);

        if (this.nodes[maID].color == 'black') {
          this.nodes[maID].color = rColor;
          this.nodes[paID].color = rColor;
        }

        const rnode = {
          'x': (this.nodes[maID].x + this.nodes[paID].x) / 2,
          'y': (this.nodes[maID].y + this.nodes[paID].y) / 2,
          'y1': this.nodes[maID].y,
          'y2': this.nodes[paID].y,
          'x1': this.nodes[maID].x,
          'x2': this.nodes[paID].x,
          'color': this.nodes[maID].color,
          'type': 'parent'
        };

        this.relationshipNodes.push(rnode);
        this.relationshipEdges.push({
          source: rnode,
          target: node,
          'color': this.nodes[maID].color
        });
      }
    });

  }
}

/**
 * Method to create a new genealogyData instance
 * @param data
 * @returns {genealogyData}
 */
export function create(data) {
  return new genealogyData(data);
}


