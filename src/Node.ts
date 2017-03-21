
export enum Sex {
    Male,
    Female,
    Unknown
}

export default class Node {

  y: number;
  x: number;

  //keeps track of nodes original x position - can change for kid grids on hide.
  originalX: number;
  //keeps track of nodes original Y position - can change for kid grids on hide.
  originalY: number;
  /** This node's ID */
  id: number;
  type: string;
  MaID: number;
  PaID: number;
  /** Reference to the mother */
  ma: Node;
  /** Reference to the father */
  pa: Node;
  hidden: boolean;
  aggregated: boolean;
  /** Year of Birth */
  bdate: number;
    /** Year of Death */
  ddate: number;
  deceased: string;
  // d.deceased = d.deceased === 'Y'; //transform to boolean values
  generation: number; //indicator that generation has not been set
  //flag for blood descendants of founders - not in use yet (2/23/17)
  descendant?: boolean;
  /** keeps track of nuclear families a given node belongs to. */
  family_ids: string[];
  /** used to keep track of clicked nodes even when they are removed from the visible area. May not need if nodes are not removed and simply scroll out of view. */
  clicked: boolean;
  /** Is this node currently considered to be affected */
  affected: boolean;
  /** Keep track of primary attribute and what 'affected' means for this attribute data. */
  primary;
  /** Keep track of secondary attribute and what 'affected' means for this attribute data. */
  secondary;
  //For Tree structure
  hasChildren: boolean;
  /** Array of children */
  children: Node[];
  /** Array of spouses (some have more than one) */
  spouse: Node[];
  duplicates: Node[]; //keep track of any duplicates of this node
  // used for deCycling the tree
  visited: boolean;

  target: Node;

  sex: Sex;


  constructor() {
    // d.y
     this.type = 'single';
    // d.MaID = +d.MaID;
    // d.PaID = +d.PaID;
    // d.bdate = +d.bdate;
    // d.x = +d.bdate; //set year as x attribute


    this.hidden = false;
    this.aggregated = false;


    this.generation = -1;
    this.descendant = false;
    this.family_ids = [];
    this.clicked = false;
    this.primary = undefined;
    this.secondary = undefined;
    this.hasChildren = false;
    this.children = [];
    this.spouse = [];
    this.duplicates = [];
    this.visited = false; // used for deCycling the tree
    this.deceased = 'Y';
  }
}
