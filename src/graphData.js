import * as tslib_1 from "tslib";
/**
 * Created by Carolina Nobre on 01.22.2017
 */
/**
 * Data structure for the genealogy graph.
 */
import { max, min } from 'd3-array';
import { Config } from './config';
import * as events from 'phovea_core/src/event';
import { FAMILY_SELECTED_EVENT } from './tableManager';
import { isUndefined } from 'util';
import Node from './Node';
import { Sex } from './Node';
import { layoutState } from './Node';
import { CURRENT_YEAR } from './genealogyTree';
var GraphData = /** @class */ (function () {
    function GraphData(tableManager) {
        //Array of Parent Child Edges
        this.parentChildEdges = [];
        //Array of Parent Parent Edges
        this.parentParentEdges = [];
        this.graphTable = tableManager.graphTable;
        this.tableManager = tableManager;
        this.setListeners();
    }
    GraphData.prototype.setListeners = function () {
        var _this = this;
        events.on(FAMILY_SELECTED_EVENT, function () {
            _this.graphTable = _this.tableManager.graphTable;
            //Once tree has been created for the new family, fire redraw tree event.
            _this.createTree()
                .then(function () {
                _this.aggregateTreeWrapper(undefined, layoutState.Hidden); //default to aggregated state;
            })
                .catch(function (error) {
                console.log('Error: ' + error);
            });
        });
    };
    /**
     * This function removesCycles from a tree by building duplicate nodes as necessary.
     *
     */
    GraphData.prototype.removeCycles = function () {
        var toDecycle = this.nodes.filter(function (n) {
            return !n.visited && n.ma && n.pa;
        });
        if (toDecycle.length === 0) {
            return;
        }
        var startNode = toDecycle.find(function (n) {
            return (n.bdate ===
                min(toDecycle, function (n) {
                    return n.bdate;
                }));
        });
        this.removeCyclesHelper(startNode);
        this.removeCycles();
    };
    GraphData.prototype.removeCyclesHelper = function (node) {
        //  console.log('visiting node ', node.id, node.visited);
        var _this = this;
        if (node.visited && node.spouse.length > 0) {
            console.log('found child cycle with ', node.id, node.spouse);
            node.visited = false;
            [node].concat(node.spouse).map(function (n) {
                _this.clearVisitedBranch(n);
            });
            //Create Duplicate Node in the 'child' role and leave the current one as the parent/spouse
            var duplicateNode = Object.assign(Object.create(node), node);
            duplicateNode.id = node.id;
            duplicateNode.uniqueID = node.uniqueID.toString() + '_2';
            duplicateNode.visited = false;
            this.clearVisitedBranch(duplicateNode);
            //Add each node to the other's 'duplicate' array
            node.duplicates.push(duplicateNode);
            duplicateNode.duplicates.push(node);
            //Remove node from parent's 'children' array
            var childIndex = node.ma.children.indexOf(node);
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
            var parentChildEdge = this.parentChildEdges.filter(function (e) {
                return e.target === node;
            })[0];
            parentChildEdge.target = duplicateNode;
            //clear parent references
            node.maID = '';
            node.paID = '';
            node.ma = undefined;
            node.pa = undefined;
            this.nodes.push(duplicateNode);
        }
        else {
            // console.log('setting node ', node.id, ' visited status to true')
            node.visited = true;
            node.spouse.forEach(function (s) {
                // console.log('visiting spouse',s.id,s.visited);
                if (s.visited) {
                    console.log('found spouse cycle between  ', node.id, ' and ', s.id);
                    //choose the person who is part of the blood family (i.e, who have a mom and dad in this family) and duplicate them.
                    var toDuplicate_1;
                    if (node.ma) {
                        toDuplicate_1 = node;
                    }
                    else if (s.ma) {
                        toDuplicate_1 = s;
                    }
                    else {
                        console.log('neither person has parents in this family!', node.id, s.id);
                    }
                    if (!isUndefined(toDuplicate_1)) {
                        var duplicateNode = Object.assign({}, toDuplicate_1);
                        duplicateNode.id = toDuplicate_1.id;
                        duplicateNode.uniqueID = Math.random().toString();
                        duplicateNode.visited = false;
                        //Add each node to the other's 'duplicate' array
                        toDuplicate_1.duplicates.push(duplicateNode);
                        duplicateNode.duplicates.push(toDuplicate_1);
                        //Remove node from parent's 'children' array
                        var childIndex = toDuplicate_1.ma.children.indexOf(node);
                        toDuplicate_1.ma.children.splice(childIndex, 1);
                        childIndex = toDuplicate_1.pa.children.indexOf(toDuplicate_1);
                        toDuplicate_1.pa.children.splice(childIndex, 1);
                        // Clear child/spousal links from duplicate node;
                        duplicateNode.hasChildren = false;
                        duplicateNode.children = [];
                        duplicateNode.spouse = [];
                        duplicateNode.ma.children.push(duplicateNode);
                        duplicateNode.pa.children.push(duplicateNode);
                        //Replace node with 'duplicateNode' in the parentChild edge.
                        var parentChildEdge = _this.parentChildEdges.filter(function (e) {
                            return e.target === toDuplicate_1;
                        })[0];
                        parentChildEdge.target = duplicateNode;
                        //clear parent references
                        toDuplicate_1.maId = 0;
                        toDuplicate_1.paID = 0;
                        toDuplicate_1.ma = undefined;
                        toDuplicate_1.pa = undefined;
                        _this.nodes.push(duplicateNode);
                        //clear visited status of this persons spouse(s) and the branch starting at this couple;
                        // console.log('clearing visited of', toDuplicate.id)
                        toDuplicate_1.visited = false;
                        _this.clearVisitedBranch(toDuplicate_1);
                    }
                }
                // console.log('setting spouse of ', node.id, ': ', s.id , ' visited status to true');
                s.visited = true;
            });
        }
        if (node.ma || node.pa) {
            node.children.forEach(function (c) {
                // console.log('applying RCH on ', c.uniqueID ,'/',c.id,  ' from ', node.uniqueID,'/',node.id);
                _this.removeCyclesHelper(c);
            });
        }
        if (!node.hasChildren) {
            return;
        }
    };
    /**
     * This function sets the 'visited' state of the remainder of this branch to false.
     *
     */
    GraphData.prototype.clearVisitedBranch = function (node) {
        var _this = this;
        if (!node.hasChildren) {
            return;
        }
        //set all spouses to false
        node.spouse.forEach(function (s) {
            s.visited = false;
            // console.log('clearing node ', s.id)
        });
        //recursively call this function on the children
        node.children.forEach(function (c) {
            c.visited = false;
            // console.log('clearing node ', c.id);
            _this.clearVisitedBranch(c);
        });
    };
    /**
     * This function loads genealogy data from lineage-server
     * and builds the genealogy tree
     * @param: name of the dataset
     * returns a promise of table
     *
     */
    GraphData.prototype.createTree = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var columns, peopleIDs, idRanges, kindredRanges, columnDesc, columnNameToIndex, allData, i_1, name_1, i, _i, allData_1, row, node;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.nodes = [];
                        columns = this.graphTable.cols();
                        return [4 /*yield*/, columns[0].names()];
                    case 1:
                        peopleIDs = _a.sent();
                        return [4 /*yield*/, columns[0].ids()];
                    case 2:
                        idRanges = _a.sent();
                        return [4 /*yield*/, columns[1].data()];
                    case 3:
                        kindredRanges = _a.sent();
                        this.ids = idRanges
                            .dim(0)
                            .asList()
                            .map(function (d) {
                            return d.toString();
                        });
                        this.uniqueIDs = idRanges
                            .dim(0)
                            .asList()
                            .map(function (d, i) {
                            return d.toString() + kindredRanges[i].toString();
                        });
                        columnDesc = this.graphTable.desc.columns;
                        columnNameToIndex = {};
                        return [4 /*yield*/, this.graphTable.data()];
                    case 4:
                        allData = _a.sent();
                        for (i_1 = 0; i_1 < columnDesc.length; i_1++) {
                            name_1 = columnDesc[i_1].name;
                            columnNameToIndex[name_1] = i_1;
                        }
                        i = 0;
                        for (_i = 0, allData_1 = allData; _i < allData_1.length; _i++) {
                            row = allData_1[_i];
                            node = new Node(this.ids[i]);
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
                        //remove people w/o a mother/father or children (stragglers)
                        this.nodes = this.nodes.filter(function (node) {
                            return node.ma || node.pa || node.hasChildren;
                        });
                        do {
                            //Create fake birthdays for people w/o a bdate or ddate.
                            this.nodes.forEach(function (n) {
                                if (n.bdate === 0 || isNaN(n.bdate)) {
                                    //random number
                                    n.inferredBdate = true;
                                    // subtract 20 from the age of the first kid
                                    if (n.hasChildren) {
                                        n.bdate = n.children[0].bdate && n.children[0].bdate - 20;
                                        n.x = n.children[0].bdate && n.bdate;
                                    }
                                    else {
                                        // The not-so-nice case when we don't have an age and no children
                                        n.x = CURRENT_YEAR - 3;
                                        n.bdate = CURRENT_YEAR - 3;
                                    }
                                }
                            });
                        } while (this.nodes.filter(function (node) {
                            return isNaN(node.bdate);
                        }).length > 0);
                        //Remove cycles by creating duplicate nodes where necessary
                        this.removeCycles();
                        //Linearize Tree and pass y values to the attributeData Object
                        this.linearizeTree();
                        //Create dictionary of person to y values
                        this.exportYValues();
                        //After linear order has been computed:
                        this.nodes.forEach(function (d) {
                            d.originalX = +d.x; //keeps track of nodes original x position
                            d.originalY = +d.y; //keeps track of nodes original y position - can change for kid grids on hide.
                        });
                        return [2 /*return*/];
                }
            });
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
    GraphData.prototype.getAttribute = function (attribute, personID) {
        return this.tableManager.getAttribute(attribute, personID);
    };
    /**
     *
     * This function passes the newly computed y values to the tableManager
     *
     */
    GraphData.prototype.exportYValues = function () {
        //Create hashmap of personID to y value;
        var dict = {};
        this.nodes.forEach(function (node) {
            if (node.id + '_' + node.kindredID in dict) {
                dict[node.id + '_' + node.kindredID].push(Math.round(node.y));
            }
            else {
                dict[node.id + '_' + node.kindredID] = [Math.round(node.y)];
            }
        });
        //Assign y values to the tableManager object
        this.tableManager.yValues = dict;
        this.yValues = dict; //store dict for tree to use when creating slope chart
    };
    /**
     *
     * This function linearizes all nodes in the tree.
     *
     */
    GraphData.prototype.linearizeTree = function () {
        //Only look at nodes who have not yet been assigned a y value
        var nodeList = this.nodes.filter(function (n) {
            return n.y === undefined;
        });
        // console.log('node list still has ', nodeList.length , ' items')
        if (nodeList.length === 0) {
            return;
        }
        //Find oldest person in this set of nodes and set as founder
        var founder = nodeList.find(function (n) {
            return (n.bdate ===
                min(nodeList, function (n) {
                    return n.bdate;
                }));
        });
        founder.y = nodeList.length; //Set first y index;
        this.linearizeHelper(founder);
        //Recursively call linearizeTree to handle any nodes that were not assigned a y value.
        this.linearizeTree();
    };
    /**
     *
     * This is a recursive helper function for linearizeTree()
     * @param node - node at the start of branch that needs to be linearized;
     *
     */
    GraphData.prototype.linearizeHelper = function (node) {
        var _this = this;
        this.linearizeLogic(node);
        node.children.map(function (child) {
            _this.linearizeHelper(child);
        });
        //Base case are leaf nodes. Reached end of this branch.
        if (!node.hasChildren) {
            return;
        }
    };
    /**
     *
     * This is the logic behind linearizing a single node and it's spouses.
     * @param node - node that needs to be linearized;
     *
     */
    GraphData.prototype.linearizeLogic = function (node) {
        var _this = this;
        if (node.y === undefined) {
            node.y =
                min(this.nodes, function (n) {
                    return n.y;
                }) + -1;
        }
        //Assign y position of all spouses.
        if (node.spouse.length > 0) {
            // console.log('node ', node.id , ' has ',  node.spouse.length , ' spouses')
            node.spouse.forEach(function (s) {
                if (s.y === undefined) {
                    s.y =
                        min(_this.nodes, function (n) {
                            return n.y;
                        }) + -1;
                }
                s.spouse.forEach(function (ss) {
                    if (ss.y === undefined) {
                        ss.y =
                            min(_this.nodes, function (n) {
                                return n.y;
                            }) + -1;
                    }
                });
                if (s.id === '652900') {
                    console.log(node.id, node.y, s.y);
                }
            });
            //If person has two spouses, put this one in the middle.
            if (node.spouse.length === 2) {
                var ys = [node.y].concat(node.spouse.map(function (s) {
                    return s.y;
                }));
                ys.sort();
                //sort spouses by mean child age:
                node.spouse.sort(function (s1, s2) {
                    return (min(s1.children, function (child) {
                        return child.bdate;
                    }) -
                        min(s2.children, function (child) {
                            return child.bdate;
                        }));
                });
                node.y = ys[1];
                node.spouse[0].y = ys[0];
                node.spouse[1].y = ys[2];
            }
            //sort kids by spouse order, then by age;
            node.spouse.sort(function (a, b) {
                return b.y - a.y;
            });
            var allKids_1 = [];
            node.spouse.forEach(function (s) {
                // console.log('spouse for ', node.id, ' ',  s.y)
                s.children.sort(function (a, b) {
                    return b.bdate - a.bdate;
                });
                allKids_1 = allKids_1.concat(s.children);
            });
            //Add back in kids that don't have a father;
            node.children = node.children
                .filter(function (c) {
                return c.paID === '0';
            })
                .concat(allKids_1);
        }
    };
    /**
     *
     * This function prepares the tree for aggregation, cleans up the results and updates the tableManager.
     * @param nodeID, starting node for the aggregate/hide/expand operation. If undefined, apply to entire tree.
     * @pram state, defines operation as one of the three enums: state.expanded, state.aggregated, state.hidden.
     */
    GraphData.prototype.aggregateTreeWrapper = function (nodeID, state) {
        if (!isUndefined(nodeID) && !isUndefined(state)) {
            //find node
            var node = this.nodes.find(function (n) {
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
            }
            //Toggle layout state of this node;
            node.state = state;
            //perpetuate state to the rest of this branch;
            this.perpetuateState(node);
        }
        //Clear tree of y values and aggregated and hidden flags;
        this.nodes.forEach(function (n) {
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
        var minY = min(this.nodes, function (n) {
            return n.y;
        }) - 1;
        this.nodes.forEach(function (n) {
            n.y = n.y - minY;
        });
        //Adjust y position for non affected nodes in the tree;
        this.nodes.forEach(function (n) {
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
        this.nodes.forEach(function (n) {
            if (n.state === layoutState.Hidden) {
                if (n.hidden &&
                    !n.affected &&
                    n.hasChildren &&
                    n.spouse.find(function (s) {
                        return s.affected;
                    })) {
                    n.x = n.x - Config.glyphSize * 0.6;
                }
            }
        });
        var idRange = [];
        this.nodes.forEach(function (n) {
            if (!(!n.aggregated && n.hidden)) {
                idRange.push(n.uniqueID);
            }
        });
        this.exportYValues();
        this.tableManager.activeGraphRows = idRange;
        //  console.log(idRange)
    };
    /**
     *
     * This function recursively applies the layout state of the seed node to the rest of this branch.
     * @param node, starting point of the branch
     *
     */
    GraphData.prototype.perpetuateState = function (n) {
        var _this = this;
        if (!n.hasChildren) {
            return;
        }
        //apply state to spouses
        n.spouse.forEach(function (s) {
            s.state = n.state;
        });
        //recursively call function on children.
        n.children.forEach(function (child) {
            child.state = n.state;
            _this.perpetuateState(child);
        });
    };
    /**
     *
     * This function aggregates all nodes in the branch starting at a given node X.
     * @param applyToAll, boolean flag indicating if operation should be apply to entire tree;
     * @param aggregate, true for aggregation, false for hiding, undefined for expand.
     *
     */
    GraphData.prototype.aggregateTree = function () {
        //Only look at nodes who have not yet been assigned a y value
        var nodeList = this.nodes.filter(function (n) {
            return n.y === undefined;
        });
        if (nodeList.length === 0) {
            return;
        }
        //Find oldest person in this set of nodes and set as founder
        var startNode = nodeList.find(function (n) {
            return (n.bdate ===
                min(nodeList, function (n) {
                    return n.bdate;
                }));
        });
        //If starting node is not the 'center' of the founding spouses or is not a direct descendant
        if (startNode.spouse.length === 1 &&
            (startNode.spouse[0].spouse.length > 1 || isUndefined(startNode.ma))) {
            startNode = startNode.spouse[0];
        }
        var minY = min(this.nodes, function (n) {
            return n.y;
        });
        if (isUndefined(minY)) {
            startNode.y = nodeList.length; //Set first y index;
        }
        else {
            startNode.y = minY - 1; //Set first y index;
        }
        if (!startNode.affected &&
            startNode.hasChildren &&
            startNode.state !== layoutState.Expanded) {
            startNode.hidden = true;
            startNode.aggregated = startNode.state === layoutState.Aggregated;
        }
        this.aggregateHelper(startNode);
        //Recursively call aggregateTree to handle any nodes that were not assigned a y value.
        this.aggregateTree();
    };
    /**
     *
     * This is a recursive helper function for aggregateTree()
     * @param node - node that needs to be aggregated;
     * @param aggregate - boolean that indicates whether to aggregate (true) or hide (false);
     *
     */
    GraphData.prototype.aggregateHelper = function (node) {
        var _this = this;
        if (node.state === layoutState.Expanded) {
            this.linearizeLogic(node);
            node.children.forEach(function (child) {
                _this.aggregateHelper(child);
            });
        }
        else {
            //Base case are leaf nodes. Reached end of this branch.
            if (!node.affected && !node.hasChildren) {
                return;
            }
            //If node is affected and has not yet been assigned a row, give it's own row
            if (isUndefined(node.y) && node.affected) {
                //find any affected nodes in the last row
                var isLastNodeAffected = this.nodes
                    .filter(function (n) {
                    return (n.y ===
                        min(_this.nodes, function (nd) {
                            return nd.y;
                        }));
                })
                    .find(function (n) {
                    return n.affected;
                });
                if (node.state === layoutState.Aggregated ||
                    !isUndefined(isLastNodeAffected)) {
                    node.y =
                        min(this.nodes, function (n) {
                            return n.y;
                        }) + -1;
                }
                else {
                    node.y = min(this.nodes, function (n) {
                        return n.y;
                    });
                }
            }
            var minY_1 = min(this.nodes, function (n) {
                return n.y;
            });
            //Handle spouses
            // If any spouse are affected, give them their own row.
            node.spouse.map(function (s) {
                if (isUndefined(s.y) && s.affected) {
                    s.y = min(_this.nodes, function (n) {
                        return n.y;
                    });
                    if (node.state === layoutState.Aggregated) {
                        s.y = s.y - 1;
                    }
                    else {
                        node.y = minY_1;
                        node.hidden = true;
                        node.aggregated = false;
                    }
                }
            });
            //find any unaggregated nodes in the last row
            var isLastNodeHidden = this.nodes
                .filter(function (n) {
                return (n.y ===
                    min(_this.nodes, function (nd) {
                        return nd.y;
                    }));
            })
                .find(function (n) {
                return !n.hidden;
            });
            if (!isUndefined(isLastNodeHidden) && isUndefined(node.y)) {
                node.y =
                    min(this.nodes, function (n) {
                        return n.y;
                    }) - 1;
                node.hidden = true;
                node.aggregated = node.state === layoutState.Aggregated;
            }
            //If node has any affected spouses, place node above them.
            if (node.state === layoutState.Aggregated &&
                isUndefined(node.y) &&
                node.spouse.filter(function (n) {
                    return n.affected;
                }).length > 0) {
                node.y = min(this.nodes, function (n) {
                    return n.y;
                });
                if (node.state === layoutState.Aggregated) {
                    node.y = node.y - 1;
                }
                node.hidden = true;
                node.aggregated = node.state === layoutState.Aggregated;
            }
            //find all nodes in the last row, will only be one if it is affected
            var lastAssignedNodes_1 = this.nodes.filter(function (n) {
                return (n.y ===
                    min(_this.nodes, function (nd) {
                        return nd.y;
                    }));
            });
            //of all the nodes in the last row, find either the affect one, or the one at the far right (latest bdate)
            var lastAssignedNode = lastAssignedNodes_1.find(function (n) {
                return n.affected;
            });
            if (isUndefined(lastAssignedNode)) {
                lastAssignedNode = lastAssignedNodes_1.find(function (n) {
                    return (n.bdate ===
                        max(lastAssignedNodes_1, function (nd) {
                            return nd.bdate;
                        }));
                });
            }
            if (isUndefined(lastAssignedNode)) {
                console.log(lastAssignedNodes_1);
            }
            //check if lastFamily is the end of the branch
            var parentLastFamily = lastAssignedNode.ma || lastAssignedNode.pa;
            var isTerminal = parentLastFamily &&
                parentLastFamily.children.filter(function (child) {
                    return child.hasChildren;
                }).length === 0;
            //if the last assigned Node is affected or if it is an unaffected leaf, start a new row; This does not apply when hiding.
            if (isUndefined(node.y) && (lastAssignedNode.affected || isTerminal)) {
                node.y =
                    min(this.nodes, function (n) {
                        return n.y;
                    }) - 1;
                node.hidden = true;
                node.aggregated = node.state === layoutState.Aggregated;
            }
            else if (isUndefined(node.y)) {
                node.y = min(this.nodes, function (n) {
                    return n.y;
                });
                node.hidden = true;
                node.aggregated = node.state === layoutState.Aggregated;
            }
            minY_1 = min(this.nodes, function (n) {
                return n.y;
            });
            //Iterate through spouses again and assign any undefined y values to the current y
            node.spouse.map(function (s) {
                if (isUndefined(s.y) && !s.affected) {
                    //If current node is affected, place spouses above it:
                    if (node.affected && node.state === layoutState.Aggregated) {
                        s.y = minY_1 - 1;
                        //place spouses spouses above it as well.
                        s.spouse.map(function (ss) {
                            if (!ss.affected) {
                                ss.y = s.y;
                                ss.hidden = true;
                                ss.aggregated =
                                    !ss.affected && node.state === layoutState.Aggregated;
                            }
                        });
                    }
                    else {
                        //place spouses alongside it;
                        s.y = node.y;
                        //place spouses spouses alongside it as well.
                        s.spouse.map(function (ss) {
                            if (!ss.affected) {
                                ss.y = node.y;
                                ss.hidden = true;
                                ss.aggregated =
                                    !ss.affected && node.state === layoutState.Aggregated;
                            }
                        });
                    }
                    s.hidden = true;
                    s.aggregated = node.state === layoutState.Aggregated;
                }
            });
            //Assign all spouses to the x level of either the affected spouse or if not, a token male in the couple.
            //Align node's x value to youngest affected spouse:
            var affectedSpouseXValue = max([node].concat(node.spouse).filter(function (n) {
                return n.affected;
            }), function (n) {
                return n.x;
            });
            var xValue_1 = affectedSpouseXValue;
            //No affected spouse or node is a duplicate (must preserve x values for duplicates)
            if (isUndefined(affectedSpouseXValue)) {
                xValue_1 = node.x;
            }
            //Align all spouses along a same X;
            [node].concat(node.spouse).forEach(function (n) {
                n.x = xValue_1;
            });
            //Assign Child Y and X Values
            var childY_1;
            //If node is affected, find unaffected spouse
            if (node.affected) {
                var unaffectedSpouse = node.spouse.find(function (n) {
                    return !n.affected;
                });
                if (!isUndefined(unaffectedSpouse)) {
                    childY_1 = unaffectedSpouse.y;
                }
                else {
                    childY_1 = min(this.nodes, function (n) {
                        return n.y;
                    });
                    if (node.state === layoutState.Aggregated) {
                        childY_1 = childY_1 - 1;
                    }
                }
            }
            else {
                childY_1 = node.y;
            }
            //Assign y levels to leaf children;
            node.children.map(function (child) {
                if (isUndefined(child.y) && !child.affected && !child.hasChildren) {
                    child.y = childY_1;
                    child.x = xValue_1;
                    child.hidden = true;
                    child.aggregated = node.state === layoutState.Aggregated;
                }
                else {
                    _this.aggregateHelper(child);
                }
            });
        }
    };
    /**
     *
     * This function defined the 'affected' state based on a user defined attribute.
     *
     * @param attribute attribute to be used to define 'affected' state of nodes.
     * @param value threshold value to apply to attribute when defining 'affected'.
     * Currently has a single value that indicates true.
     */
    GraphData.prototype.defineAffected = function (affectedState) {
        var _this = this;
        this.nodes.forEach(function (node) {
            var data = _this.tableManager.getAttribute(affectedState.name, node.id);
            node.affected = affectedState.isAffected(data);
        });
    };
    /**
     *
     * This function creates edges objects and adds the references between parents and children to create a tree.
     * It creates two types of edges:
     * 1) between parents and their children -> parent child edges.
     * 2) between couples -> parent parent edges
     *
     * It populates the class attributes parentParentEdges and parentChildEdges.
     */
    GraphData.prototype.buildTree = function () {
        var _this = this;
        this.parentChildEdges = [];
        this.parentParentEdges = [];
        this.nodes.forEach(function (node) {
            //Check if there are mother and father nodes in this family (founder won't have them for example)
            var maNode = _this.nodes.find(function (d) {
                return d.id === node.maID && d.kindredID === node.kindredID; //Make sure to get the person from the right family
            });
            // if (maNode)
            // console.log(maNode, node )
            var paNode = _this.nodes.find(function (d) {
                return d.id === node.paID && d.kindredID === node.kindredID;
            });
            // if (paNode)
            //   console.log(paNode, node)
            //No parents found
            if ((maNode === undefined || paNode === undefined) &&
                (maNode !== node && paNode !== node)) {
                node.ma = maNode;
                node.pa = paNode;
                if (maNode) {
                    maNode.hasChildren = true;
                    //Add child to array of children of each parent
                    maNode.children.push(node);
                    // console.log('pushing ' , node.id , ' as child of ', maNode.id);
                    _this.parentChildEdges.push({
                        ma: maNode,
                        pa: maNode,
                        target: node,
                        id: node.id //id of parentChild Edge is the id of the child.
                    });
                }
                else if (paNode) {
                    paNode.hasChildren = true;
                    //Add child to array of children of each parent
                    paNode.children.push(node);
                    // console.log('pushing ' , node.id , ' as child of ', maNode.id);
                    _this.parentChildEdges.push({
                        ma: paNode,
                        pa: paNode,
                        target: node,
                        id: node.id //id of parentChild Edge is the id of the child.
                    });
                }
                //  console.log('no parents :( for ',node.id);
            }
            else {
                //If found parents, create edges between parent and children, spouses, and add references to build tree
                // console.log('found parents :) ')
                //Replace ma and pa fields with reference to actual ma/pa nodes
                node.ma = maNode;
                node.pa = paNode;
                //relationship node. Used to build parent child edges
                var rnode_1 = {
                    ma: maNode,
                    pa: paNode,
                    type: 'parent',
                    id: Math.random() //Create random id or each parentParent Edge.
                };
                //Only add parent parent Edge if it's not already there;
                if (!_this.parentParentEdges.some(function (d) {
                    return d.ma === rnode_1.ma && d.pa === rnode_1.pa;
                })) {
                    _this.parentParentEdges.push(rnode_1);
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
                _this.parentChildEdges.push({
                    ma: maNode,
                    pa: paNode,
                    target: node,
                    id: node.id //id of parentChild Edge is the id of the child.
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
    GraphData.prototype.findLastLeaf = function (node) {
        var _this = this;
        //will have to add case if there are ever leaf nodes with spouses but no children. 2/23/2017
        //Base case -> leaf node w/ no spouse
        if (node.spouse.length === 0 && !node.hasChildren) {
            return node.originalY;
        }
        else {
            //Search through spouse and all of spouses relationships to find last child leaf
            return min(node.spouse.map(function (spouse) {
                return min(spouse.spouse.map(function (otherSpouse) {
                    return min(otherSpouse.children.map(function (child) {
                        return _this.findLastLeaf(child);
                    }));
                }));
            }));
        }
    };
    return GraphData;
}());
/**
 * Method to create a new graphData instance
 * @param data
 * @returns {GraphData}
 */
export function create(data) {
    return new GraphData(data);
}
//# sourceMappingURL=graphData.js.map