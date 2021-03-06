export enum Sex {
  Male,
  Female,
  Unknown
}

export enum layoutState {
  Expanded,
  Aggregated,
  Hidden
}

/**
 * This class holds all attributes of a node in the genealogy graph.
 */
export default class Node {

  /** This node's ID */
  id: string;

  /** This node's uniqueID */
  uniqueID: string;

  // TODO - what's type?
  type: string;

  /** The y index of the node as rendered currently */
  y: number;
  /** The y index of the node in the original array, independent of hiding/aggregation */
  originalY: number;

  /** The x position of the node, expressed as birth year by default, can change on aggregation */
  x: number;
  /** keeps track of nodes original x position - can change for kid grids on hide. */
  originalX: number;

  /** flag to indicate a starting point of aggregation. used to recreate aggregate states when POI is changed */
  aggregateBranch: boolean;

  // ------ Attributes of the node from the data  ------
  sex: Sex;
  /** Year of Birth */
  bdate: number;
  /** Year of Death */
  ddate: number;
  deceased: string;

  // ----- Relationship information -------

  maID: string;
  paID: string;

  kindredID: string;
  /** Reference to the mother */
  ma: Node;
  /** Reference to the father */
  pa: Node;

  /** keeps track of nuclear families a given node belongs to. */
  familyIds: string[];

  hasChildren: boolean;
  /** Array of children */
  children: Node[];
  /** Array of spouses (some have more than one) */
  spouse: Node[];


  // ----- Visible Node Attributes -----

  /** Is this node currently considered to be affected */
  affected: boolean;
  /** Keep track of primary attribute and what 'affected' means for this attribute data. */
  primary;
  /** Keep track of secondary attribute and what 'affected' means for this attribute data. */
  secondary;

  state: layoutState;

  // ----- Node State ------

  hidden: boolean;
  aggregated: boolean;
  /** used to keep track of clicked nodes even when they are removed from the visible area. May not need if nodes are not removed and simply scroll out of view. */
  clicked: boolean;

  // ----- Derived Attributes -----

  // d.deceased = d.deceased === 'Y'; //transform to boolean values
  generation: number; //indicator that generation has not been set
  //flag for blood descendants of founders - not in use yet (2/23/17)
  descendant?: boolean;

  // ----- De-cycling data -----
  //keep track of any duplicates of this node */
  duplicates: Node[];
  // used for deCycling the tree
  visited: boolean;

  //flag for bdates that are inferred.
  inferredBdate:boolean;

  //flag for whether there was death/deceased information.
  hasDdate:boolean;

  // TODO what is target?
  target: Node;

  /** Default initialization for attributes */
  constructor(id: string) {
    this.type = 'single';
    this.id = undefined;
    this.kindredID = undefined;
    this.uniqueID = id; //use phovea defined unique id
    this.hidden = false;
    this.aggregated = false;
    this.generation = -1;
    this.descendant = false;
    this.familyIds = [];
    this.clicked = false;
    this.primary = undefined;
    this.secondary = undefined;
    this.hasChildren = false;
    this.children = [];
    this.spouse = [];
    this.duplicates = [];
    this.visited = false;
    this.deceased = 'Y';
    this.affected = false;
    this.state = layoutState.Expanded;
    this.inferredBdate = false;
    this.hasDdate = true;
  }

  /** Initialize the node based on rows */
  public initialize(columnNameToIndex: any, row: any) {
    this.sex = (row[columnNameToIndex.sex] === 'M') ? Sex.Male : Sex.Female;
    this.id = row[columnNameToIndex.RelativeID].toString();
    this.bdate = +row[columnNameToIndex.bdate] ;
    this.ddate = (columnNameToIndex.ddate ? +row[columnNameToIndex.ddate] : undefined);
    this.x= +row[columnNameToIndex.bdate];
    this.maID = row[columnNameToIndex.MaID].toString();
    this.paID = row[columnNameToIndex.PaID].toString();
    this.kindredID = row[columnNameToIndex.KindredID].toString();
    this.hasDdate = columnNameToIndex.ddate ? true : false;
    // this.deceased = row[columnNameToIndex.deceased].toString();
  }
}
