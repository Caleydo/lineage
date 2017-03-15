import {ITable} from 'phovea_core/src/table';
import {list as listData, getFirstByName, get as getById} from 'phovea_core/src/data';
import {VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT, VALUE_TYPE_REAL, INumberValueTypeDesc} from 'phovea_core/src/datatype';
import * as range from 'phovea_core/src/range';
import * as events from 'phovea_core/src/event';
import {max, min, mean} from 'd3-array';
import {IStatistics} from 'phovea_core/src/math';

interface IFamilyInfo {
  id: number;
  range: number[];
  size: number;
  affected: number;
}

//Interface for the 'affected' state. Contains variable chosen to determine the 'affected' people and the threshold/value for 'affected' === true. Drives tree layout.
interface IAffectedState {
  name: string;
  type: string;
  value: number;
}

interface IPrimaryAttribute {
  primary: boolean; //true for primary; false for secondary;
  name: string; //attribute Name
  type: string; //Binary or MultiCategory *Should not be strings or idtypes.*
}

/**
 * Interface for the primary or secondary Categorical Attributes
 */
interface IPrimaryCatAttribute extends IPrimaryAttribute {
  categories: string[]; //Array of categories
  //For binary categorical data there will be only one color for the 'Y', 1, or 'M' category. The second category will be encoded in white.
  //for more than two categories, each category gets their own color.
  color: string []; // array of colors (1 to n).
}

//Interface for the primary or secondary Categorical Attributes.
interface IPrimaryQuantAttribute extends IPrimaryAttribute {
  range: Number []; //max and min of the data. used to set the yscale in the attribute bar;
  color: string ; // single color.  value is encoded by the height of the attribute bar.
  stats: IStatistics;
}


/**
 * Interfaces describing objects that describe a selected attribute and the associated ranges
 */
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

const indexOfKindredIDColumn = 1;

export const VIEW_CHANGED_EVENT = 'view_changed_event';
export const TABLE_VIS_ROWS_CHANGED_EVENT = 'table_vis_rows_changed_event';
export const PRIMARY_SECONDARY_SELECTED = 'primary_secondary_attribute_event';
export const POI_SELECTED = 'affected_attribute_event';

export const PRIMARY_COLOR = '#20567c';
export const PRIMARY_COLOR_2 = '#a3ccf0';

export const SECONDARY_COLOR = '#e48737';
export const SECONDARY_COLOR_2 = '#ffd6b3';

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

  /** Array of Selected Attributes in the Panel */
  private _selectedAttributes: selectedAttribute [];


  /** Active attribute is an attribute that is not ID. This an array of strings (column name) */
    // TODO do we really need this?
  public activeAttributes = [];

  /** Basic information about all the loaded families */
  public readonly familyInfo: IFamilyInfo[] = [];

  // TODO what is this? Should this be in this class?
  public yValues;

  /** Holds the information for the 'affectedState' including variable and threshold */
  public affectedState: IAffectedState;

  //Keeps track of selected primary/secondary variable
  private primaryAttribute: attribute;
  private secondaryAttribute: attribute;


  /**
   *
   * This function get the requested attribute for the person requested.
   * Returns undefined if there is no value.
   *
   * @param attribute - attribute to search for
   * @param personID - person for which to search for attribute
   */
  public async getAttribute(attribute, personID) {

    console.log('getAttribute: ' + attribute + personID);
    let attributeVector;
    //Find Vector of that attribute in either table.
    const allColumns = this.graphTable.cols().concat(this.tableTable.cols());

    allColumns.forEach((col) => {
      // console.log(col.desc.name, attribute)
      if (col.desc.name === attribute) {
        attributeVector = col;
      }
    });

    const ids = await attributeVector.names();

    if (personID in ids) {
      const index = ids.indexOf(personID);
      const value = await attributeVector.at(index);
      return value;
    } else {
      return undefined;
    }
  }


  public async setPrimarySecondaryAttribute(attributeName, primarySecondary) {

    let binaryColorChoice1, binaryColorChoice2, multipleColorChoice;
    if (primarySecondary === 'primary') {
      binaryColorChoice1 = PRIMARY_COLOR;
      binaryColorChoice2 = PRIMARY_COLOR_2;
      multipleColorChoice = PRIMARY_CATEGORICAL_COLORS;
    } else if (primarySecondary === 'secondary') {
      binaryColorChoice1 = SECONDARY_COLOR;
      binaryColorChoice2 = SECONDARY_COLOR_2;

      multipleColorChoice = SECONDARY_CATEGORICAL_COLORS;
    }


    let attributeVector;
    let categories;
    let color;

    //Find Vector of that attribute in either table.
    const allColumns = this.graphTable.cols().concat(this.tableTable.cols());

    allColumns.forEach((col) => {
      if (col.desc.name === attributeName) {
        attributeVector = col;
      }
    });

    const attributeDefinition : IPrimaryAttribute = {name: attributeName, primary: primarySecondary === 'primary', type: attributeVector.valuetype.type};

    const data = await attributeVector.data();
    if (attributeDefinition.type === VALUE_TYPE_CATEGORICAL) {
      const categoricalDefinition = <IPrimaryCatAttribute> attributeDefinition;
      categories = Array.from(new Set(data)).sort(); //sort alphabetically to ensure the correct order of attributes

      if (categories.length === 2) {//binary categorical data
        color = [binaryColorChoice2, binaryColorChoice1];
      } else {
        color = multipleColorChoice.slice(0, categories.length); //extract one color per category;
      }
      categoricalDefinition.categories = categories;
      categoricalDefinition.color = color;
    } else if (attributeDefinition.type === VALUE_TYPE_INT || attributeDefinition.type === VALUE_TYPE_REAL) {
          const quantDefinition = <IPrimaryQuantAttribute> attributeDefinition;
      quantDefinition.stats = await attributeVector.stats();
      // FIXME temporary fix since vector.stats() returns 0 for empty values
      quantDefinition.stats['min'] = min(data.filter((d) => {
        return +d !== 0;
      }).map(Number));
       // FIXME temporary fix since vector.stats() returns 0 for empty values
      quantDefinition.stats['mean'] = mean(data.filter((d) => {
        return +d !== 0;
      }).map(Number)); //temporary fix since vector.stats() returns 0 for empty values;
      quantDefinition.color = binaryColorChoice1;
    }
    // console.log(Attribute)

    this[primarySecondary + 'Attribute'] = attributeDefinition;

    events.fire(PRIMARY_SECONDARY_SELECTED, attributeDefinition);


  }

  /**
   * Loads the graph data and the attribute data from the server and stores it in the public table variable
   * Parses out the familySpecific information to populate the Family Selector
   * @param: id of the dataset
   */
  public async loadData(descendDataSetID: string, attributeDataSetID: string) {

    //retrieving the desired dataset by name
    this.attributeTable = <ITable> await getById(attributeDataSetID);
    await this.parseAttributeData();

    //retrieving the desired dataset by name
    this.table = <ITable> await getById(descendDataSetID);
    this.setAffectedState('suicide', VALUE_TYPE_CATEGORICAL, 'Y'); //Default value;
    await this.parseFamilyInfo();
    return Promise.resolve(this);
  }

  /**
   * This function sets the affected State.
   *
   */
  public setAffectedState(varName, varType, thresholdValue) {
    this.affectedState = ({name: varName, type: varType, 'value': thresholdValue});
    events.fire(POI_SELECTED, this.affectedState);
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

    const familyMembers = await this.graphTable.col(0).names();
    const attributeMembers = await this.attributeTable.col(0).names();

    const attributeRows = [];

    attributeMembers.forEach((member, i) => {
      if (familyMembers.indexOf(member) > -1) {
        attributeRows.push(i);
      }
    });
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

    const familyIDs: number[] = <number[]> await this.table.col(indexOfKindredIDColumn).data(); //Assumes kindredID is the first col. Not ideal.
    const affectedColData = await this.table.colData(this.affectedState.name);

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
    const familyView = this.table.view(range.join(this._activeGraphRows, range.all()));
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
