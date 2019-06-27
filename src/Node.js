export var Sex;
(function (Sex) {
    Sex[Sex["Male"] = 0] = "Male";
    Sex[Sex["Female"] = 1] = "Female";
    Sex[Sex["Unknown"] = 2] = "Unknown";
})(Sex || (Sex = {}));
export var layoutState;
(function (layoutState) {
    layoutState[layoutState["Expanded"] = 0] = "Expanded";
    layoutState[layoutState["Aggregated"] = 1] = "Aggregated";
    layoutState[layoutState["Hidden"] = 2] = "Hidden";
})(layoutState || (layoutState = {}));
/**
 * This class holds all attributes of a node in the genealogy graph.
 */
var Node = /** @class */ (function () {
    /** Default initialization for attributes */
    function Node(id) {
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
    Node.prototype.initialize = function (columnNameToIndex, row) {
        this.sex = (row[columnNameToIndex.sex] === 'M') ? Sex.Male : Sex.Female;
        this.id = row[columnNameToIndex.RelativeID].toString();
        this.bdate = +row[columnNameToIndex.bdate];
        this.ddate = (columnNameToIndex.ddate ? +row[columnNameToIndex.ddate] : undefined);
        this.x = +row[columnNameToIndex.bdate];
        this.maID = row[columnNameToIndex.MaID].toString();
        this.paID = row[columnNameToIndex.PaID].toString();
        this.kindredID = row[columnNameToIndex.KindredID].toString();
        this.hasDdate = columnNameToIndex.ddate ? true : false;
        // this.deceased = row[columnNameToIndex.deceased].toString();
    };
    return Node;
}());
export default Node;
//# sourceMappingURL=Node.js.map