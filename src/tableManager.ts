import {ITable} from 'phovea_core/src/table';
import {list as listData, getFirstByName, get as getById} from 'phovea_core/src/data';
import {VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT} from 'phovea_core/src/datatype';
import * as range from 'phovea_core/src/range';
import * as events from 'phovea_core/src/event';

interface IFamilyInfo {
  id: number;
  range: number[];
  size: number;
  affected: number;
}

export const VIEW_CHANGED_EVENT = 'view_changed_event';
export const TABLE_VIS_ROWS_CHANGED_EVENT = 'table_vis_rows_changed_event';

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
  private _activeGraphRows: range.Range = range.all() ;
  /** The columns currently displayed in the graph  */
  private activeGraphColumns: range.Range;


  /** Active attribute is an attribute that is not ID. This an array of strings (column name) */
    // TODO do we really need this?
  public activeAttributes = [];

  /** Basic information about all the loaded families */
  public readonly familyInfo: IFamilyInfo[] = [];

  // TODO what is this? Should this be in this class?
  public yValues;

  /**
   * Loads the graph data from the server and stores it in the public table variable
   * @param: name of the dataset
   */
  public async loadData(name: string) {
    //retrieving the desired dataset by name
    this.table = <ITable> await getFirstByName(name);
    await this.parseData();
    return Promise.resolve(this);
  }

  /**
   * Loads the attribute data from the server and stores it in the public attributeTable variable
   * @param: name of the dataset
   */
  public async loadAttributeData(name: string) {
    //retrieving the desired dataset by name
    this.attributeTable = <ITable> await getFirstByName(name);
    await this.parseAttributeData();
    return Promise.resolve(this);
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
    this._activeTableRows = this._activeGraphRows;
    await this.refreshActiveViews();
  }


  /**
   * This function is called after loadData.
   * This function populates needed variables for attribute table and attribute panel
   *
   */
  public async parseAttributeData() {
    const columns = await this.attributeTable.cols();

    // console.log(this.attributeTable);
    // console.log(await this.attributeTable.data());
    //
    // for(const col of await this.attributeTable.cols())
    // {
    //   console.log(await col.data());
    // }
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
  public async parseData() {

    const familyIDs: number[] = <number[]> await this.table.col(0).data(); //Assumes kindredID is the first col. Not ideal.
    // FIXME this is a strong assumption on the data. We should move this stuff to a configuration object
    const suicideCol = await this.table.colData('suicide');

    const uniqueFamilyIDs = Array.from(new Set(familyIDs));

    for (const id of uniqueFamilyIDs) {
      //Array to store the ranges for the selected family
      const familyRange = [];
      let affected = 0;

      familyIDs.forEach((d, i) => {
        if (d === id) {
          familyRange.push(i);
          if (suicideCol[i] === 'Y') {
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
    // const key = range.join(range.all(), this.activeTableColumns);
    const key = range.join(range.all(), range.list([0,1,2,3,4,5,6,7,8,9,10,11])); //temporary to debug table

    this.tableTable = await this.attributeTable.view(key); //view on attribute table
    this.graphTable = await this.table.view(range.join(this._activeGraphRows, range.all()));

    events.fire(VIEW_CHANGED_EVENT);
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
