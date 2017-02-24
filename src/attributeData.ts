import {ITable, asTable} from 'phovea_core/src/table';
import {IAnyVector} from 'phovea_core/src/vector';
import {list as listData, getFirstByName, get as getById} from 'phovea_core/src/data';
import {tsv} from 'd3-request';
import {ICategoricalVector, INumericalVector} from 'phovea_core/src/vector/IVector';
import {VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT} from 'phovea_core/src/datatype';
import * as events from 'phovea_core/src/event';

export default class AttributeData {

  table:ITable;
  public columns = []; // This holds headers as object {name,type}
  public activeAttributes = [] ; // active attribute is an attribute that is not ID. This an array of strings (column name)


  constructor(dataset_name) {
    // load data into public variable table, after loading we can call different function that access data
    this.loadData(dataset_name).then(()=> {
        this.parseData()
      })
      .catch(function (error) {
        console.log('Error: ' + error);
      })

    this.attachListener();

  }

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

    console.log('=============================');
    console.log('RETRIEVING DATA');
    console.log('=============================');
    console.log(this.table);

    return Promise.resolve(this.table);
  }

  /**
   * This function is called after loadData.
   * This function populate needed variables for attribute table and attribute panel
   *
   */
  public async parseData() {

    // all_columns hold columns as TableVector
    // we want to populate the public variable columns
    const  all_columns = this.table.cols();

    all_columns.forEach(col =>{
      console.log(col);
      let name = col.desc.name;
      let type = col.desc.value.type;

      //adding a column object that has :
      // column name, type
      this.columns.push({
        name: name,
        type: type
      })

      // if the type of the column is ID then it is not in the active list
      if(!(type === 'idType'))
        this.activeAttributes.push(name);
    })

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
export function create(dataset_name) {

  return new AttributeData(dataset_name);
}
