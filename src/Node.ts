

class Node {

  y: number;
  x: number;
  type: string;
  MaID: string;
  PaID: string;
  hidden: boolean;
  aggregated: boolean;
  /** Year of Birth */
  bdate: number;
  // d.deceased = d.deceased === 'Y'; //transform to boolean values
  generation: number; //indicator that generation has not been set
  //flag for blood descendants of founders - not in use yet (2/23/17)
  descendant?:boolean;
  /** keeps track of nuclear families a given node belongs to. */
  family_ids: string[];
  /** used to keep track of clicked nodes even when they are removed from the visible area. May not need if nodes are not removed and simply scroll out of view. */
  clicked: boolean;
  /** Keep track of primary attribute and what 'affected' means for this attribute data. */
  primary;
   /** Keep track of secondary attribute and what 'affected' means for this attribute data. */
  secondary;
  //For Tree structure
  hasChildren: boolean;
  /** Array of children */
  children: string[];
  /** Array of spouses (some have more than one) */
  spouse: string[];
  duplicates: Node[]; //keep track of any duplicates of this node
  // used for deCycling the tree
  visited: boolean;
}
