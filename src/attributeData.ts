import {ITable, asTable} from 'phovea_core/src/table';
import {IAnyVector} from 'phovea_core/src/vector';
import {list as listData, getFirstByName, get as getById} from 'phovea_core/src/data';
import {tsv} from 'd3-request';
import {ICategoricalVector, INumericalVector} from 'phovea_core/src/vector/IVector';
import {VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT} from 'phovea_core/src/datatype';
import * as range from 'phovea_core/src/range';
import * as events from 'phovea_core/src/event';

export default class AttributeData {

  table:ITable;
  public activeAttributes = [] ; // active attribute is an attribute that is not ID. This an array of strings (column name)
  private activeRows ; // of type range
  private activeColumns : range.Range; // of type range
  private activeView: range.Range; // table view


  /**
   * This function load genealogy data from lineage-server
   * and store it in the public table variable
   * @param: name of the dataset
   * returns a promise of table
   *
   */
  public async loadData(name:string) {
    //retrieving the desired dataset by name
    this.table = <ITable> await getFirstByName(name);
    this.parseData();
    this.attachListener();
    return Promise.resolve(this);
  }

  /**
   * This function is called after loadData.
   * This function populate needed variables for attribute table and attribute panel
   *
   */
  public async parseData() {
    let columns = this.table.cols();
    //populate active attribute array
    columns.forEach((col) => {
      const name = col.desc.name;
      const type = col.desc.value.type;
      // if the type of the column is ID then it is not in the active list
      if (!(type === 'idType')) {
        this.activeAttributes.push(name);
      }
    });
  }

  public getColumns(){
    return this.table.cols();
  }

  public setActiveRows(activeRows){
    this.activeRows = activeRows;
  }

  public getActiveRows(){
    return this.activeRows;
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

 * @returns {AttributeData}
 */
export function create() {

  return new AttributeData();
}
