import {ITable} from 'phovea_core/src/table';
import {list as listData, getFirstByName, get as getById} from 'phovea_core/src/data';
import {VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT, VALUE_TYPE_REAL, VALUE_TYPE_STRING} from 'phovea_core/src/datatype';
import * as range from 'phovea_core/src/range';
import * as events from 'phovea_core/src/event';
import {max, min, mean} from 'd3-array';
import {IStatistics} from 'phovea_core/src/math';
import {__awaiter} from 'tslib';

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
  data: any [];
  personIDs: Number [];
  isAffected(b: string | Number): boolean;
}

interface IPrimaryAttribute {
  primary: boolean; //true for primary; false for secondary;
  name: string; //attribute Name
  type: string; //Binary or MultiCategory *Should not be strings or idtypes.*
  data: any [];
  personIDs: Number [];
}

/**
 * Interface for the primary or secondary Categorical Attributes
 */
interface IPrimaryCatAttribute extends IPrimaryAttribute {
  categories: string[]; //Array of categories
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
export const FAMILY_INFO_UPDATED = 'family_stats_updated';
export const COL_ORDER_CHANGED_EVENT = 'col_ordering_changed';


export const PRIMARY_COLOR = '#335b8e';
export const PRIMARY_COLOR_2 = '#b5b867';

export const SECONDARY_COLOR = '#9f295d';
export const SECONDARY_COLOR_2 = '#e7a396';

export const PRIMARY_CATEGORICAL_COLORS = ['#b5b867', '#ffea59', '#b7dbdb', '#335b8e', '#6ca18f'];
export const SECONDARY_CATEGORICAL_COLORS = ['#e7a396', '#9f295d', '#d9a34b', '#ecd1ca', '#430e00']; //

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
  private activeTableColumns: range.Range = range.all(); //default value;
  /** The rows currently shown in the table, a subset of the activeGraphRows */
  private _activeTableRows: range.Range = range.all(); //default value;


  /** The table view (of table) used for the graph */
  public graphTable: ITable; // table view
  /** All rows that are used in the graph - corresponds to a family */
  private _activeGraphRows: range.Range = range.all();
  /** The columns currently displayed in the graph  */
  private activeGraphColumns: range.Range = range.all(); //default value
  /** Array of Selected Attributes in the Panel */
  private _selectedAttributes: selectedAttribute [];

  // private defaultCols: String[] =
  //   ['KindredID','PersonID', 'Asthma', 'Bipolar', 'sex', 'deceased', 'suicide', 'gen', 'Age', 'FirstBMI', 'AgeFirstBMI', 'race', 'cause_death', 'weapon']; //set of default cols to read in, minimizes load time for large files;

  private defaultCols: String[] =
    ['RelativeID','KindredID', 'Asthma', 'Bipolar', 'sex', 'deceased', 'suicide', 'gen', 'Age', 'FirstBMI', 'AgeFirstBMI', 'cause_death', 'weapon']; //set of default cols to read in, minimizes load time for large files;


  public colOrder: String[]; //array that keeps track which attributes are displayed in the panel and in the table and their correct order.

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

    await this.parseFamilyInfo(); //this needs to come first because the setAffectedState sets default values based on the data for a selected family.

    await this.setAffectedState('suicide'); //Default value;

    await this.updateFamilyStats();

    //For panel attribute add/remove/ordering
    this.attachListeners();

    return Promise.resolve(this);
  }


  /**
   *
   * This function get the requested attribute for the person requested if the attribute is a POI, primary, or secondary.
   * Returns undefined if there is no value.
   *
   * @param attribute - attribute to search for
   * @param personID - person for which to search for attribute
   */
  public getAttribute(attribute, personID) {

    let selectedAttribute;

    if (attribute === this.affectedState.name) {
      selectedAttribute = this.affectedState;
    } else if (this.primaryAttribute && attribute === this.primaryAttribute.name) {
      selectedAttribute = this.primaryAttribute;
    } else if (this.secondaryAttribute && attribute === this.secondaryAttribute.name) {
      selectedAttribute = this.secondaryAttribute;
    } else { //Attribute is neither primary nor secondary nor POI;
      console.log('neither POI, primary, or secondary')
      return undefined;
    }

    const ids = selectedAttribute.personIDs;

    if (ids.indexOf(personID) > -1) {
      const index = ids.indexOf(personID);
      const value = selectedAttribute.data[index];
      return value;
    } else {
      return undefined;
    }
  }

  /**
   *
   * This function get the requested attribute vector.
   *
   * @param attribute - attribute to search for
   * @param allFamilies - boolean set to true to return the attribute vector for all families. Defaults to false.
   */
  public async getAttributeVector(attributeName, allFamilies?) {

    if (allFamilies === undefined) {
      allFamilies = false;
    }

    let allColumns;
    //Find Vector of that attribute in either table.
    if (this.graphTable && !allFamilies) { //familyView has been defined && allFamilies has not been requested)
      allColumns = this.graphTable.cols().concat(this.tableTable.cols());
    } else {
      allColumns = this.table.cols().concat(this.attributeTable.cols());
    }

    let attributeVector = undefined;
    allColumns.forEach((col) => {
      if (col.desc.name === attributeName) {
        attributeVector = col;
      }
    });

    return attributeVector;
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

    //Store data and associated personIDs for graph rendering of attribute bars
    const attributeDefinition: IPrimaryAttribute = {
      name: attributeName, primary: primarySecondary === 'primary', type: attributeVector.valuetype.type,
      'data': await attributeVector.data(), 'personIDs': (await attributeVector.names())
    };

    const data = await attributeVector.data();
    if (attributeDefinition.type === VALUE_TYPE_CATEGORICAL) {
      const categoricalDefinition = <IPrimaryCatAttribute> attributeDefinition;
      categories = attributeVector.desc.value.categories.map((c) => {
        return c.name;
      }); //get categories from index.json def
      // categories = Array.from(new Set(data)).sort(); //derive categories from data

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
      quantDefinition.color = binaryColorChoice1;
    }
    // console.log(Attribute)

    this[primarySecondary + 'Attribute'] = attributeDefinition;

    events.fire(PRIMARY_SECONDARY_SELECTED, attributeDefinition);

    return attributeDefinition; //used by the attribute Panel to set the appropriate colors;


  }

  /**
   * This function updates the data and ids for the affected State (POI), primary, and secondary attributes when a different family is selected.
   *
   */
  public async updatePOI_Primary_Secondary() {
    if (this.affectedState) {
      const attributeVector = await this.getAttributeVector(this.affectedState.name);
      const varType = attributeVector.valuetype.type;

      this.affectedState.data = await attributeVector.data();
      this.affectedState.personIDs = (await attributeVector.names());
    }

    if (this.primaryAttribute) {
      const attributeVector = await this.getAttributeVector(this.primaryAttribute.name);
      const varType = attributeVector.valuetype.type;

      this.primaryAttribute.data = await attributeVector.data();
      this.primaryAttribute.personIDs = (await attributeVector.names());

    }

    if (this.secondaryAttribute) {
      const attributeVector = await this.getAttributeVector(this.secondaryAttribute.name);
      const varType = attributeVector.valuetype.type;

      this.secondaryAttribute.data = await attributeVector.data();
      this.secondaryAttribute.personIDs = (await attributeVector.names());

    }
  }


  /**
   *
   * This function sets the affected State.
   *
   */
  public async setAffectedState(varName, isAffectedCallbackFcn?) {

    const attributeVector = await this.getAttributeVector(varName);
    const varType = attributeVector.valuetype.type;

    let threshold;

    if (typeof isAffectedCallbackFcn === 'undefined') {

      if (varType === VALUE_TYPE_INT || varType === VALUE_TYPE_REAL) {
        const stats = await attributeVector.stats();
        isAffectedCallbackFcn = (attr: Number) => {
          return attr >= stats.mean;
        }; //if threshold hasn't been defined, default to anything over the mean value
        threshold = stats.mean;
      } else if (varType === VALUE_TYPE_CATEGORICAL) {
        const categoriesVec = attributeVector.valuetype.categories;
        const categories = categoriesVec.map((c) => {
          return c.name;
        });
        let category;

        if (categories.find(d => {
            return d === 'Y'
          })) {
          category = 'Y'
        } else if (categories.find(d => {
            return d === 'TRUE'
          })) {
          category = 'TRUE'
        } else if (categories.find(d => {
            return d === 'F'
          })) {
          category = 'F'
        } else {
          category = categories[0];
        }

        isAffectedCallbackFcn = (attr: string) => {
          return attr === category;
        };
        threshold = category;
      } else if (varType === VALUE_TYPE_STRING) {
        isAffectedCallbackFcn = (attr: string) => {
          return attr !== undefined && attr.length > 0;
        }; //string is non empty
      }

    }

    const data = await attributeVector.data();
    const personIDs = (await attributeVector.names());

    this.affectedState = ({
      name: varName,
      type: varType,
      'isAffected': isAffectedCallbackFcn,
      'data': data,
      'personIDs': personIDs
    });

    //Update family selector
    this.updateFamilyStats();
    events.fire(POI_SELECTED, this.affectedState);

    return {threshold, 'type': varType};
  }


  /**
   * This function changes the range of rows to display on the selected family.
   * @param chosenFamilyID the numeric value of the familyID, uses the first family ID when none is specified
   */
  public async selectFamily(chosenFamilyIDs?: number[]) {

    // console.log('chosen Family ID is ', chosenFamilyIDs)


    if (chosenFamilyIDs == null) {
      chosenFamilyIDs = [this.familyInfo[0].id];
    }

    // let familyRange: number[] =[];

    //Temporarily only plot the first family
    let family = this.familyInfo.find((family) => {return family.id === chosenFamilyIDs[0]});
    let familyRange = range.list(family.range) //familyRange.concat(family.range);

    chosenFamilyIDs.forEach((id, i) => {
      let family = this.familyInfo.find((family) => {
        return family.id === chosenFamilyIDs[i];
      });
      // let range: number[] = family.range
      //   familyRange = familyRange.concat(range)
      if (i>0){
        familyRange = familyRange.union(range.list(family.range));
      }
    })

    //In case families were chosen out of order. Provided ranges must be in order;
    // familyRange.sort(function(a, b) {return a - b;})

    // this._activeGraphRows = range.list(familyRange);
    this._activeGraphRows = familyRange;

    await this.refreshActiveGraphView();

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

    await this.refreshActiveTableView();

    this.updatePOI_Primary_Secondary();

    events.fire(VIEW_CHANGED_EVENT);
  }


  /**
   * This function calculates the number of affected people based on the current POI selected in the panel.
   */
  public async updateFamilyStats() {

    const attributeVector = await this.getAttributeVector(this.affectedState.name, true); //get Attribute Vector for all families
    const kindredIDVector = await this.getAttributeVector('KindredID', true); //get FamilyID vector for all families

    const familyIDs: number[] = <number[]> await kindredIDVector.data();
    const attributeData = await attributeVector.data();

    const uniqueFamilyIDs = Array.from(new Set(familyIDs));

    uniqueFamilyIDs.forEach((id, index) => {
      //Return people that are in this family and are affected
      const affected = familyIDs.filter((d, i) => {
        return d === id && this.affectedState.isAffected(attributeData[i]);
      });
      this.familyInfo[index].affected = affected.length;
    });

    // //If Primary Attribute Has been defined
    // if (this.primaryAttribute){
    //
    //   const primaryAttributeVector = await this.getAttributeVector(this.primaryAttribute.name, true); //get Attribute Vector for all families
    //   const primaryAttributeData = await primaryAttributeVector.data();
    //
    //   uniqueFamilyIDs.forEach((id, index) => {
    //     //Return people that are in this family and are affected
    //     const primaryAffected = familyIDs.filter((d, i) => {
    //       return d === id && this.affectedState.isAffected(primaryAttributeData[i]);
    //     });
    //     this.familyInfo[index].affected = affected.length;
    //   });
    // }

    events.fire(FAMILY_INFO_UPDATED, this);
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
      const type = col.desc.value.type;

      if (type !== 'idtype') {
        colIndexAccum.push(i);//push the index so we can get the right view
      }
    });

    this._activeTableRows = range.all();
    this.activeTableColumns = range.list(colIndexAccum);

    await this.refreshActiveTableView();

  }

  /**
   * This function is called after loadData.
   * This function populates needed variables for family selector
   *
   */
  public async parseFamilyInfo() {

    const familyIDs: number[] = <number[]> await this.table.col(indexOfKindredIDColumn).data(); //Assumes kindredID is the first col. Not ideal.
    // const affectedColData = await this.table.colData(this.affectedState.name);

    const uniqueFamilyIDs = Array.from(new Set(familyIDs));

    for (const id of uniqueFamilyIDs) {
      //Array to store the ranges for the selected family
      const familyRange = [];
      const affected = 0;

      familyIDs.forEach((d, i) => {
        if (d === id) {
          familyRange.push(i);
        }
      });

      this.familyInfo.push({id, range: familyRange, size: familyRange.length, affected});
    }

    // //Set active graph Cols to non id-types
    const columns = await this.table.cols();

    const colIndexAccum = [];

    //populate active attribute array
    columns.forEach((col, i) => {
      const type = col.desc.value.type;

      // if (type !== 'idtype') {
      colIndexAccum.push(i);//push the index so we can get the right view
      // }
    });

    this.activeGraphColumns = range.list(colIndexAccum);

    await this.refreshActiveGraphView();

    await this.selectFamily(); //call to selectFamily is now made from the familySelector object
  }

  /**
   * Uses the active rows and cols to create new table and graph tables and fires a {VIEW_CHANGED_EVENT} event when done.
   * @return {Promise<void>}
   */
  public async refreshActiveViews() {
    await this.refreshActiveTableView();
    await this.refreshActiveGraphView();
  }

  /**
   * Uses the active rows and cols to create new table view.
   * @return {Promise<void>}
   */
  public async refreshActiveTableView() {
    // console.log('Active Table View refreshed to include rows ' , this._activeTableRows.dim(0).asList() ,  ' and  cols ',  this.activeTableColumns.dim(0).asList())
    const tableRange = range.join(this._activeTableRows, this.activeTableColumns);
    this.tableTable = await this.attributeTable.view(tableRange); //view on attribute table
  }

  /**
   * Uses the active rows and cols to create new graph view.
   * @return {Promise<void>}
   */
  public async refreshActiveGraphView() {
    // console.log('Active Graph View refreshed to include rows ' , this._activeGraphRows.dim(0).asList() ,  ' and  cols ',  this.activeGraphColumns.dim(0).asList())
    const graphRange = range.join(this._activeGraphRows, this.activeGraphColumns);
    this.graphTable = await this.table.view(graphRange); //view on graph table


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
  set activeGraphRows(newRows: string[]) {

    this.table.col(0).names().then((allIDs) => {

      const newRange = [];
      allIDs.forEach((id, i) => {
        if (newRows.indexOf(id) > -1) {
          newRange.push(i);
        }
      });

      this._activeGraphRows = range.list(newRange);
      this.refreshActiveGraphView().then(() => {
        events.fire(TABLE_VIS_ROWS_CHANGED_EVENT);
      });

    });

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

  private attachListeners() {

    // //Set listener for added attribute to the active list
    // events.on('attribute_added', (evt, item) => {
    //
    // });
    //
    // //Set listener for removed attribute from the active list
    // events.on('attribute_reordered', (evt, item) => {
    //   let currentRange = this.activeGraphColumns.dim(0).asList() //.concat(this.activeTableColumns.dim(0).asList());
    //
    //   // console.log(currentRange,item.newIndex,item.oldIndex);
    //   currentRange.splice(item.newIndex, 0,currentRange.splice(item.oldIndex,1)[0]);
    //   // console.log(currentRange)
    //   this.activeGraphColumns = range.list(currentRange);
    //
    //
    //   this.refreshActiveGraphView().then(()=>{events.fire(COL_ORDER_CHANGED_EVENT);});
    //
    // });
    // //Set listener for reordering attribute within the active list
    // events.on('attribute_removed', (evt, item) => {
    //
    //
    // });
  }
}

/**
 * Method to create a new TableManager instance
 * @returns {TableManager}
 */
export function create() {

  return new TableManager();
}
