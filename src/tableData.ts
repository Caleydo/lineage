/**
 * Created by Annie Cherkaev on 02.11.2017


 import {max} from 'd3-array';
 import {scaleOrdinal, schemeCategory20b} from 'd3-scale';

 import {Config} from './config';

 /**
 * Class that represents the table data
 */
import * as events from 'phovea_core/src/event';

class tableData {
  public referenceColumns = []; //[Column]
  public referenceRows = [];    //[{row_id, data}
  public displayedRowOrder = [];    //[int] : list of (lists of indicies) b.c aggregation
  public displayedColumnOrder = []; //[int] : list of indicies
  public numberOfColumnsDisplayed = 0; //keep track of length bc js arrays


  constructor(data, desc) {
    this.parseData(data, desc);
    //  this.layout();
  }


  // populates referenceRows & referenceColumns
  // initializes dRO & dCO to be the references
  public parseData(data_in, desc_in) {

    this.attachListener();


    const TEMP_MAX_COLS_DISPLAYED = 8;

    // grab all the attribute names (they're the keys in the obj dict)
    desc_in.forEach(column => {
      this.referenceColumns.push(new Column(column.name, column.value.type));
    });


    /**
     * creates a row id & stashes data in a Row Obj. in the reference list.
     *
     */
    data_in.forEach(d => {
      this.referenceRows.push({
        key: 'row_' + d['id'],
        value: d
      })
    });

    // init the displayedRowOrder to be the same as the reference rows
    //     but rememeber it's LISTS of lists
    for (var index = 0; index < this.referenceRows.length; index++) {
      this.displayedRowOrder.push([index]);
    }

    // init the displayedColOrder to be the same as the reference cols
    for (var index = 0; index <
    Math.min(TEMP_MAX_COLS_DISPLAYED, this.referenceColumns.length); index++) {
      this.displayedColumnOrder.push(index);
    }

    this.numberOfColumnsDisplayed = Math.min(TEMP_MAX_COLS_DISPLAYED, this.referenceColumns.length); //init
  }

  // adds to the *displayed* columns
  public addColumn(column_name, desired_index) {
    // find ref_index of column_name in referenceColumns
    const ref_index = this.referenceColumns.indexOf(column_name);
    if (ref_index > -1) // found it- add it to disp. cols
      this.displayedColumnOrder.splice(desired_index, 0, ref_index);
    else
      console.log("ERROR ADDING COLUMN!!!");  //didn't find it
    this.numberOfColumnsDisplayed += 1; //inc count
  }

  // removes from the *displayed* columns
  public removeColumn(column_name) {
    const ref_index = this.referenceColumns.indexOf(column_name);
    if (ref_index > -1)
      this.displayedColumnOrder.splice(ref_index, 1);
    else
      console.log("ERROR REMOVING COLUMN!!!");
    this.numberOfColumnsDisplayed -= 1;
  }


  public reorderColumn(column_name, desired_index) {
    this.removeColumn(column_name);
    this.addColumn(column_name, desired_index);
  }

/////////
public getImmutableRowData(){
  return this.referenceRows.map(function(d){
    return d["value"];
  });
}

public getDisplayedRowData(){
  const rowRef = this.referenceRows;
  return this.displayedRowOrder.map(function(d){
    return rowRef[d]["value"];
  })
  // this.referenceRows.map(function(d){
  //   return d["value"];
  // });
}

public getTotalWeights(){
  const colRef = this.referenceColumns; //because `this` in js is goofed

  return this.displayedColumnOrder.map(function (index){
    return colRef[index].width
  }).reduce(function(a, b) { return a + b; }, 0);
}


public getDisplayedColumnWidths(totalWidth){
  const colRef = this.referenceColumns; //because `this` in js is goofed
  const totalWeight = this.getTotalWeights();

  return this.displayedColumnOrder.map(function(index){
    // TODO: weight num_cols by the TOTAL WEIGHT
    return colRef[index].width * totalWidth / totalWeight;
  });
}

public getDisplayedColumnXs(totalWidth){
  const colRef = this.referenceColumns; //because `this` in js is goofed
  const totalWeight = this.getTotalWeights();

  return this.displayedColumnOrder.map(function(index){
    var x_dist = 0;
    for (let i = 0; i < index; i++) {
      const accum = colRef[i].width * totalWidth / totalWeight;
      x_dist += accum;
    }
    return x_dist;
  });
}

public getDisplayedColumnMidpointXs(totalWidth){
  const colRef = this.referenceColumns;
  const totalWeight = this.getTotalWeights();
  const colXs = this.getDisplayedColumnXs(totalWidth);
  return this.displayedColumnOrder.map(function(index){
     return colXs[index] + (colRef[index].width * totalWidth /totalWeight)/2;
  });
}

//TODO: active column instead of displayed columns
public getDisplayedColumnNames(){
  const colRef = this.referenceColumns;
  return this.displayedColumnOrder.map(function(index)
    { return colRef[index].name; });
}


public getDisplayedColumnTypes(){
  const colRef = this.referenceColumns;
  return this.displayedColumnOrder.map(function(index)
    { return colRef[index].type; });
}

public getNumberDisplayedColumns(){
  return this.numberOfColumnsDisplayed;
}

public getNumberDisplayedRows(){
  return this.displayedRowOrder.length;
}

public getDisplayedColumnOrder(){
  return this.displayedColumnOrder;
}

public getDisplayedRowOrder(){
  return this.displayedRowOrder;
}


////////





//TODO
  public aggregateRows(row_index) {

  }

  private attachListener() {

    //Set listener for added attribute to the active list
    events.on('attribute_added', (evt, item) => {
      this.addColumn(item.name, item.newIndex);
    });

    //Set listener for removed attribute from the active list
    events.on('attribute_reordered', (evt, item) => {
      this.reorderColumn(item.name, item.newIndex);
    });
    //Set listener for reordering attribute within the active list
    events.on('attribute_removed', (evt, item) => {
      this.removeColumn(item.name)
    });
  }


}


// TODO once we know types of columns
function Width(column_type){ //column_name : string
  if( column_type == 'idType' )
    return 2;
  else if( column_type == 'categorical')
    return 1;
  else if( column_type == 'int' )
    return 3;
   return 1; // everything else & unknown column type
}

// columns have a name & a preferred width (s/m/l)
function Column(name, type) { //name : string
  this.name = name;
  this.width = Width(type);
  this.type = type;
}


/**
 * Method to create a new tableData instance
 * @param data
 * @returns {tableData}
 */
export function create(data, desc) {
  return new tableData(data, desc);
}
