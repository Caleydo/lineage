import {ITable, asTable} from 'phovea_core/src/table';
import {IAnyVector} from 'phovea_core/src/vector';
import {list as listData, getFirstByName, get as getById} from 'phovea_core/src/data';
import {tsv} from 'd3-request';
import {ICategoricalVector, INumericalVector} from 'phovea_core/src/vector/IVector';
import {VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT} from 'phovea_core/src/datatype';
import * as range from 'phovea_core/src/range';
import * as events from 'phovea_core/src/event';

/**
 * This class manages the data structure for the graph, the table visualization and the attribute selection panel.
 */
export default class TableManager {

  /** The master table that contains the graph and some attribute information */
  table: ITable;

  /** The table view used in the table visualization */
  public tableTable: ITable; // table view
  /** The columns currently displayed in the table */
  private activeTableColumns: range.Range;
  /** The rows currently shown in the table, a subset of the activeGraphRows */
  private activeTableRows: range.Range;


  /** The table view used for the graph */
  public graphTable: ITable; // table view
  /** All rows that are used in the graph - corresponds to a family */
  private activeGraphRows: range.Range;

  /** Active attribute is an attribute that is not ID. This an array of strings (column name) */
    // TODO do we really need this?
  public activeAttributes = [];


  // Each family has a unique ID. This stores all of those that are in the dataset.
  // TODO typing
  private familyIDs;
// TODO what is this?
  public familyInfo = [];
  // TODO what is this?
  public ys;

// FOR TESTING ONLY!  vvvvvvv
///////////////////////////////////////////////////////////////////////////////

  public async anniesTestUpdate() {

    this.activeTableRows = range.list([1, 2]);
    await this.refreshActiveViews();
    console.log('DID  Update');
    console.log(this.tableTable.dim);
    console.log('Here\'s the filtered table:');
    console.log(await this.tableTable.data());
    console.log('-----------');
    return this.tableTable;
  }

// FOR TESTING ONLY!  ^^^^^
///////////////////////////////////////////////////////////////////////////////


  /**
   * Loads the data form the server and stores it in the public table variable
   * @param: name of the dataset
   */
  public async loadData(name: string) {
    //retrieving the desired dataset by name
    this.table = <ITable> await getFirstByName(name);
    await this.parseData();
    this.attachListener();
    return Promise.resolve(this);
  }


  /**
   * This function get the array of familyInfo to populate the familySelector interface.
   */
  public getFamilyInfo() {
    return this.familyInfo;
  }


  /**
   * This function changes the range of rows to display on the selected family.
   *
   *@param chosenFamilyID the numeric value of the familyID
   */
  public async selectFamily(chosenFamilyID) {

    let family = this.familyInfo.filter((family) => {
      return family.id === chosenFamilyID
    })[0]
    this.activeGraphRows = range.list(family['range']);
    this.activeTableRows = this.activeGraphRows;
    await this.refreshActiveViews(); //updates the active views
    console.log('view changed')
    events.fire('view_changed');

  }

  /**
   * This function is called after loadData.
   * This function populate needed variables for attribute table and attribute panel
   *
   */
  public async parseData() {

    const columns = await this.table.cols();

    this.familyIDs = await this.table.col(0).data(); //Assumes kindredID is the first col. Not ideal.
    let suicideCol = await this.table.colData('suicide'); //Will have to access attribute table in the future

    let uniqueFamilyIDs = this.familyIDs.filter((x, i, a) => a.indexOf(x) === i);

    for (let i in uniqueFamilyIDs) {
      let id = uniqueFamilyIDs[i];
      //Array to store the ranges for the selected family
      const familyRange = [];
      let affected = 0;

      this.familyIDs.forEach((d, i) => {
        if (d === id) {
          familyRange.push(i);
          if (suicideCol[i] === 'Y') {
            affected = affected + 1;
          }
        }
      });

      this.familyInfo.push({'id': id, 'range': familyRange, 'size': familyRange.length, 'affected': affected});
    }

    const colIndexAccum = [];
    let yIndex; //No need to set a value if you're going to override it in line 53.

    //populate active attribute array
    columns.forEach((col, i) => {
      const name = col.desc.name;
      const type = col.desc.value.type;

      // if the type of the column is ID then it is not in the active list
      if (name === 'y') { //pay no attention to the man behind the curtain
        yIndex = i; //for some reason can't set the member var here. js...  //That' because you're inside an if statement. The variable wouldn't exist outside of this if statement.

      }
      else if (!(type === 'idtype' || name === 'x')) {
        colIndexAccum.push(i);//push the index so we can get the right view
        this.activeAttributes.push(name);
      }
    });

    this.activeTableRows = range.all();
    this.activeTableColumns = range.list(colIndexAccum);

    this.selectFamily(38);


  }

  public async refreshActiveViews() {
    const key = range.join(this.activeTableRows, this.activeTableColumns);
    this.tableTable = await this.table.view(key);
    this.graphTable = await this.table.view(range.join(this.activeGraphRows, range.all()));
  }

  public getColumns() {
    return this.table.cols();
  }

  public setActiveRows(activeRows) {
    this.activeTableRows = activeRows;
  }

  public getActiveRows() {
    return this.activeTableRows;
  }

  private filterCat(aVal, bval) {
    return aVal === bval; //Also include undefined empty strings and null values.
  }

  private attachListener() {

    //Set listener for added attribute to the active list
    events.on('attribute_added', (evt, item) => {

    });

    //Set listener for removed attribute from the active list
    events.on('attribute_reordered', (evt, item) => {

    });
    //Set listener for reordering attribute within the active list
    events.on('attribute_removed', (evt, item) => {

    });
  }


}


/**
 * Method to create a new AttributeData instance

 * @returns {TableManager}
 */
export function create() {

  return new TableManager();
}
