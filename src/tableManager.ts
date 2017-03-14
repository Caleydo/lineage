import {ITable} from 'phovea_core/src/table';
import {list as listData, getFirstByName, get as getById} from 'phovea_core/src/data';
import {VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT} from 'phovea_core/src/datatype';
import * as range from 'phovea_core/src/range';
import * as events from 'phovea_core/src/event';
import {max, min, mean} from 'd3-array';

interface IFamilyInfo {
  id: number;
  range: number[];
  size: number;
  affected: number;
}

//Interface for the 'affected' state. Contains variable chosen to determine the 'affected' people and the threshold/value for 'affected' === true. Drives tree layout.
interface IAffectedState {
  var: string;
  type: string;
  value: number;
}

//Interface for the primary or secondary Categorical Attributes.
interface IPrimaryCatAttribute {
  primary:boolean; //true for primary; false for secondary;
  var: string; //attribute Name
  type: string; //Binary or MultiCategory *Should not be strings or idtypes.*
  categories: string[]; //Array of categories
  color: string []; // array of colors (1 to n).
  //For binary categorical data there will be only one color for the 'Y', 1, or 'M' category. The second category will be encoded in white.
  //for more than two categories, each category gets their own color.
}

//Interface for the primary or secondary Categorical Attributes.
interface IPrimaryQuantAttribute {
  primary:boolean; //true for primary; false for secondary;
  var: string; //attribute Name
  type: string; //Ints, floats, etc  *Should not be strings or idtypes.*
  range: Number []; //max and min of the data. used to set the yscale in the attribute bar;
  color: string ; // single color.  value is encoded by the height of the attribute bar.
}


//Interfaces describing objects that describe a selected attribute and the associated ranges

interface ISelectedCatAttribute {
  name: string;//Attribute Name
  values: string []; //Array of categories selected (strings) that define a positive affected state
  type: string; //Attribute Type. May be redundant if the interface is only for categorical data.
  range: range.Range []; //Array of ranges representing people who match any of the categories in the value field.
}

interface ISelectedQuantAttribute {
  name: string;//Attribute Name
  values: number []; //Array of tuples (start and end values) that define a positive affected state
  type: string; //Attribute Type. Within quantitative data this could be ints, floats, etc..
  range: range.Range []; //Array of ranges representing people who match the interval defined in the value field.
}

//Create new type that encompasses both types of selectedAttributes
export type selectedAttribute = ISelectedCatAttribute | ISelectedQuantAttribute;

//Create new type that encompasses both types of primary attributes
export type attribute = IPrimaryCatAttribute | IPrimaryQuantAttribute;

const IndexOfKindredIDColumn = 1;

export const VIEW_CHANGED_EVENT = 'view_changed_event';
export const TABLE_VIS_ROWS_CHANGED_EVENT = 'table_vis_rows_changed_event';
export const PRIMARY_SECONDARY_SELECTED = 'primary_secondary_attribute_event';
export const POI_SELECTED = 'affected_attribute_event';

export const PRIMARY_COLOR = '#4472CA';
export const SECONDARY_COLOR = '#345e61';

export const PRIMARY_CATEGORICAL_COLORS = ['#D77A61', '#223843', '#D8B4A0', '#393E41'];
export const SECONDARY_CATEGORICAL_COLORS = ['#D77A61', '#223843', '#D8B4A0', '#393E41']; //need to pick different colors

/**
 * This class manages the data structure for the graph, the table visualization and the attribute selection panel.
 */
export default class TableManager {

  /** The master table that contains the graph and some attribute information */
  table: ITable;

  /** The table that contains attribute information */
  attributeTable: ITable;

  /** The table view (of attributeTable) used in the table visualization */
  public tableTable: ITable; // table view
  /** The columns currently displayed in the table */
  private activeTableColumns: range.Range = range.all(); //default value;;
  /** The rows currently shown in the table, a subset of the activeGraphRows */
  private _activeTableRows: range.Range = range.all(); //default value;


  /** The table view (of table) used for the graph */
  public graphTable: ITable; // table view
  /** All rows that are used in the graph - corresponds to a family */
  private _activeGraphRows: range.Range = range.all();
  /** The columns currently displayed in the graph  */
  private activeGraphColumns: range.Range;


  /**Array of Selected Attributes in the Panel*/
  private _selectedAttributes: selectedAttribute [];


  /** Active attribute is an attribute that is not ID. This an array of strings (column name) */
    // TODO do we really need this?
  public activeAttributes = [];

  /** Basic information about all the loaded families */
  public readonly familyInfo: IFamilyInfo[] = [];

  // TODO what is this? Should this be in this class?
  public yValues;

  /** Holds the information for the 'affectedState' including variable and threshold*/
  public affectedState: IAffectedState;

  //Keeps track of selected primary/secondary variable
  private primaryAttribute: attribute;
  private secondaryAttribute: attribute;


  public async setPrimarySecondaryAttribute(attributeName, primary_secondary) {

    let binaryColorChoice, multipleColorChoice;
    if (primary_secondary === 'primary') {
      binaryColorChoice = PRIMARY_COLOR;
      multipleColorChoice = PRIMARY_CATEGORICAL_COLORS;
    } else if (primary_secondary === 'secondary') {
      binaryColorChoice = SECONDARY_COLOR;
      multipleColorChoice = SECONDARY_CATEGORICAL_COLORS;
    }

    let Attribute = {};
    Attribute['var'] = attributeName;

    Attribute['primary'] = primary_secondary === 'primary';

    let attributeVector;
    let categories;
    let color;

    //Find Vector of that attribute in either table.
    let allColumns = this.graphTable.cols().concat(this.tableTable.cols());

    allColumns.forEach(col => {
      if (col.desc.name === attributeName) {
        attributeVector = col;
      }
    })

    Attribute['type'] = attributeVector.valuetype.type;
    let data = await attributeVector.data();
    if (Attribute['type'] === 'categorical') {

      categories = Array.from(new Set(data));

      if (categories.length === 2) {//binary categorical data
        color = [binaryColorChoice, '#ffffff'];
      } else {
        color = multipleColorChoice.slice(0, categories.length) //extract one color per category;
      }
      Attribute['categories'] = categories;
      Attribute['color'] = color;
    } else if (Attribute['type'] === 'int') {
      Attribute['stats'] = await attributeVector.stats();
      Attribute['stats'].min = min(data.filter((d)=>{return +d!==0}).map(Number)) //temporary fix since vector.stats() returns 0 for empty values;
      Attribute['stats'].mean = mean(data.filter((d)=>{return +d!==0}).map(Number)) //temporary fix since vector.stats() returns 0 for empty values;
      Attribute['color'] = binaryColorChoice;
    }
    // console.log(Attribute)

    this[primary_secondary + 'Attribute'] = Attribute;

    events.fire(PRIMARY_SECONDARY_SELECTED,Attribute);


  }

  /**
   * Loads the graph data from the server and stores it in the public table variable
   * Parses out the familySpecific information to populate the Family Selector
   * @param: id of the dataset
   */
  public async loadData(datasetID: string) {
    //retrieving the desired dataset by name
    this.table = <ITable> await getById(datasetID);
    this.setAffectedState('suicide', 'categorical', 'Y') //Default value;
    await this.parseFamilyInfo();
    return Promise.resolve(this);
  }

  /**
   * Loads the attribute data from the server and stores it in the public attributeTable variable
   * @param: name of the dataset
   */
  public async loadAttributeData(datasetID: string) {
    //retrieving the desired dataset by name
    this.attributeTable = <ITable> await getById(datasetID);
    await this.parseAttributeData();
    return Promise.resolve(this);
  }

  /**
   * This function sets the affected State.
   *
   */
  public setAffectedState(varName, varType, thresholdValue) {
    this.affectedState = ({var: varName, type: varType, 'value': thresholdValue});
    events.fire(POI_SELECTED,this.affectedState);
  }

  /**
   * This function changes the range of rows to display on the selected family.
   * @param chosenFamilyID the numeric value of the familyID, uses the first family ID when none is specified
   */
  public async selectFamily(chosenFamilyID?: number) {
    let family;


    if (chosenFamilyID == null) {
      family = this.familyInfo[0];
    } else {
      family = this.familyInfo.filter((family) => {
        return family.id === chosenFamilyID;
      })[0];
    }
    this._activeGraphRows = range.list(family.range);


    await this.refreshActiveViews();

    //Update the activeAttributeRows. This ensure that vector.stats() returns the correct values in the table.

    let familyMembers = await this.graphTable.col(0).names();
    let attributeMembers = await this.attributeTable.col(0).names();

    let attributeRows = [];

    attributeMembers.forEach((member, i) => {
      if (familyMembers.indexOf(member) > -1) {
        attributeRows.push(i)
      }

    })
    this._activeTableRows = range.list(attributeRows);

    await this.refreshActiveViews();

    events.fire(VIEW_CHANGED_EVENT);
  }


  /**
   * This function is called after loadData.
   * This function populates needed variables for attribute table and attribute panel
   *
   */
  public async parseAttributeData() {
    const columns = await this.attributeTable.cols();

    const colIndexAccum = [];
    let yIndex; //No need to set a value if you're going to override it in line 53.

    //populate active attribute array
    columns.forEach((col, i) => {
      const name = col.desc.name;
      const type = col.desc.value.type;

      if (type !== 'idtype') {
        colIndexAccum.push(i);//push the index so we can get the right view
        this.activeAttributes.push(name);
      }
    });

    this._activeTableRows = range.all();
    this.activeTableColumns = range.list(colIndexAccum);
  }

  /**
   * This function is called after loadData.
   * This function populates needed variables for family selector
   *
   */
  public async parseFamilyInfo() {

    const familyIDs: number[] = <number[]> await this.table.col(IndexOfKindredIDColumn).data(); //Assumes kindredID is the first col. Not ideal.
    const affectedColData = await this.table.colData(this.affectedState.var);

    const uniqueFamilyIDs = Array.from(new Set(familyIDs));

    for (const id of uniqueFamilyIDs) {
      //Array to store the ranges for the selected family
      const familyRange = [];
      let affected = 0;

      familyIDs.forEach((d, i) => {
        if (d === id) {
          familyRange.push(i);
          if (affectedColData[i] === this.affectedState.value) {
            affected = affected + 1;
          }
        }
      });

      this.familyInfo.push({id, range: familyRange, size: familyRange.length, affected});
    }
    await this.selectFamily();
  }

  /**
   * Uses the active rows and cols to create new table and graph tables and fires a {VIEW_CHANGED_EVENT} event when done.
   * @return {Promise<void>}
   */
  public async refreshActiveViews() {
    const key = range.join(this._activeTableRows, range.all());
    // const key = range.join(this._activeTableRows, range.list([0,1,2,3,4,5,6,7,8,10,11,19,20,21,22,23,24,25,26,27,28,29])); //temporary since there are too many attributes in the table

    this.tableTable = await this.attributeTable.view(key); //view on attribute table
    this.graphTable = await this.table.view(range.join(this._activeGraphRows, range.all()));

    // events.fire(VIEW_CHANGED_EVENT);
  }

  /**
   * Updates the active rows for the table visualization, creates a new table view and fires a {TABLE_VIS_ROWS_CHANGED} event.
   * @param newRows
   */
  set activeTableRows(newRows: range.Range) {
    this._activeTableRows = newRows;
    this.tableTable = this.table.view(range.join(this._activeTableRows, this.activeTableColumns));
    events.fire(TABLE_VIS_ROWS_CHANGED_EVENT);
  }

  /**
   * Updates the active rows for the table visualization, creates a new table view and fires a {TABLE_VIS_ROWS_CHANGED} event.
   * @param newRows
   */
  set activeGraphRows(newRows: range.Range) {
    // this._activeGraphRows = newRows;
    let familyView = this.table.view(range.join(this._activeGraphRows, range.all()))
    this.graphTable = familyView.view(range.join(newRows, range.all()));
    events.fire(TABLE_VIS_ROWS_CHANGED_EVENT);
  }


  /**
   * Updates the array of selectedAttributes in the panel.
   * @param newRows
   */
  set selectedAttributes(attributes: selectedAttribute []) {
    this._selectedAttributes = attributes;
  }


  public getColumns() {
    return this.table.cols();
  }

  // private attachListener() {
  //
  //   //Set listener for added attribute to the active list
  //   events.on('attribute_added', (evt, item) => {
  //
  //   });
  //
  //   //Set listener for removed attribute from the active list
  //   events.on('attribute_reordered', (evt, item) => {
  //
  //   });
  //   //Set listener for reordering attribute within the active list
  //   events.on('attribute_removed', (evt, item) => {
  //
  //   });
  // }
}

/**
 * Method to create a new TableManager instance
 * @returns {TableManager}
 */
export function create() {

  return new TableManager();
}
