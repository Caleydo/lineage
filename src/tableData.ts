/**
* Created by Annie Cherkaev on 02.11.2017


import {max} from 'd3-array';
import {scaleOrdinal, schemeCategory20b} from 'd3-scale';

import {Config} from './config';

/**
* Class that represents the table data
*/
class tableData {
  public referenceColumns = []; //[Column]
  public referenceRows = [];    //[Row]

  public displayedRowOrder = [];    //[int] : list of (lists of indicies) b.c aggregation
  public displayedColumnOrder = []; //[int] : list of indicies
  public numberOfColumnsDisplayed = 0; //keep track of length bc js arrays



  constructor(data) {
    this.parseData(data);
    //  this.layout();
  }


  // populates referenceRows & referenceColumns
  // initializes dRO & dCO to be the references
  public parseData(data_in){
    var a = new Column('annie');
    return a;
  }

  // adds to the *displayed* columns
  public addColumn(column_name, desired_index){
    // find ref_index of column_name in referenceColumns
    const ref_index = this.referenceColumns.indexOf(column_name);
    if (ref_index > -1) // found it- add it to disp. cols
      this.displayedColumnOrder.splice(desired_index, 0, ref_index);
    else
      console.log("ERROR ADDING COLUMN!!!");  //didn't find it
    this.numberOfColumnsDisplayed += 1; //inc count
  }

  // removes from the *displayed* columns
  public removeColumn(column_name){
    const ref_index = this.referenceColumns.indexOf(column_name);
    if (ref_index > -1)
      this.displayedColumnOrder.splice(ref_index, 1);
    else
      console.log("ERROR REMOVING COLUMN!!!");
    this.numberOfColumnsDisplayed -= 1;
  }


  public reorderColumn(column_name, desired_index){
    this.removeColumn(column_name);
    this.addColumn(column_name, desired_index);
  }

}


function DataItem(data){
  //whatever the parse function does
  this.age = 2;
  this.bmi = 4;
  this.birth_year = 1992;
}


function Row(row_id, row_data){
  this.row_id = row_id;
  this.row_data = row_data;
}

// hard-code some prefered default sizes for our data
function Width(column_name){ //column_name : string
  if(column_name === 'bmi')
    return 2;
  else if(column_name === 'age')
    return 3;
  return 1; // everything else & unknown column type
}

// columns have a name & a preferred width (s/m/l)
function Column(name){ //name : string
  this.name = name;
  this.width = this.Width(name);
}



/**
* Method to create a new tableData instance
* @param data
* @returns {tableData}
*/
export function create(data) {
  return new tableData(data);
}
