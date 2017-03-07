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
  private activeRows : range.Range; // of type range
  private familyRange: range.Range;
  private attributeRange: range.Range;
  private activeColumns : range.Range; // of type range
  public activeView : ITable; // table view
  public graphView : ITable; // table view

  private ys ;



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
    await this.parseData();
    this.attachListener();
    return Promise.resolve(this);
  }

  /**
   * This function is called after loadData.
   * This function populate needed variables for attribute table and attribute panel
   *
   */
  public async parseData() {
    const columns = await this.table.cols();

    const  familyIDs = await this.table.colData('KindredID');
    const uniqueFamilyIDs = familyIDs.filter((x, i, a) => a.indexOf(x) === i);


    const familyRanges = []; //for .ids() approach
    const familyRanges2 = []; // for brute force index approach

    //.ids() approach
    const coldata = await this.table.col(0); //get vector for Kindred IDs

    for (const f of uniqueFamilyIDs) {
      const u: IAnyVector = await coldata.filter(this.filterCat.bind(this, f));

      const id = await u.ids();
      if (id.size()[0] >= 1) {
        familyRanges.push(id);
        // console.log(f, await coldata.data(),  await u.data(), id.dim(0).asList());
      }
    }

    //for brute force approach
    for (const f of uniqueFamilyIDs) {
      let fam =[];
      familyIDs.forEach((d,i)=>{
        if (d === f) {
          fam.push(i);
        }
      });
      familyRanges2.push(fam);
    }


    console.log(familyRanges)




    const colIndexAccum = [];
    let yIndex; //No need to set a value if you're going to override it in line 53.

    //populate active attribute array
    columns.forEach((col, i) => {
      const name = col.desc.name;
      const type = col.desc.value.type;
      // if the type of the column is ID then it is not in the active list

      if(name === 'y'){ //pay no attention to the man behind the curtain
        yIndex = i; //for some reason can't set the member var here. js...  //That' because you're inside an if statement. The variable wouldn't exist outside of this if statement.

      }
      else if (!(type === 'idtype' || name === 'x') ) {
        colIndexAccum.push(i);//push the index so we can get the right view
        this.activeAttributes.push(name);
      }
    }); //end for each

    // const tempRequest = await this.table.col(yIndex);
    // this.ys = await tempRequest.data(range.all());

    // this.activeRows = range.all(); // all rows to start out with
    // this.activeRows = familyRanges[1];
    this.activeRows = range.list(familyRanges2[1])
    this.activeColumns = range.list(colIndexAccum);
    // const newView = await this.table.idView(familyRanges[1]);

    this.refreshActiveView(); //updates the active View

  }

  public async refreshActiveView(){
    const key = range.join(this.activeRows, this.activeColumns);
    this.activeView = await this.table.view(key);
    this.graphView = await this.table.view(range.join(this.activeRows, range.all()));
    // console.log(this.graphView.dim);
    //
    // console.log('first col', await this.graphView.cols()[0].data(new range.Range()));
    //
    // let columns = this.graphView.cols();
    //
    // console.log('-----------');
    // console.log('A table with all columns and three rows:');
    // console.log('-----------');
    // console.log('A range based on lists:');
    // const listRange = range.list([0, 1, 2]);
    // console.log(listRange);
    //
    // const allRange = range.all();
    // console.log(allRange);
    //
    // // We join two ranges so that we can create a TableView following the convention, columns first, rows second
    // // Here we define that we want to keep all columns but only the rows 0, 1, 2
    // const mutiDimRange = range.join(listRange, allRange);
    // console.log('The multidimensional range, rows first, column second:');
    // console.log(mutiDimRange);
    //
    // console.log('This is supposed to slice the table by preserving ALL columns and the rows 0,1,2:');
    // const slicedTable = this.table.view(mutiDimRange);
    // console.log(slicedTable);
    //
    // console.log(await slicedTable.colData('KindredID'));
    //
    // let allCols = slicedTable.cols();
    //
    // for (let col of allCols) {
    //   console.log('This works: col : ', col.desc.name, '  ' ,  await slicedTable.colData(col.desc.name));
    //   console.log('This does not: col : ', col.desc.name, '  ' ,  await col.data());
    // }




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

 * @returns {AttributeData}
 */
export function create() {

  return new AttributeData();
}
