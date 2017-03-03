import * as events from 'phovea_core/src/event';
import {AppConstants, ChangeTypes} from './app_constants';
// import * as d3 from 'd3';
import {Config} from './config';

import {select, selectAll, mouse, event} from 'd3-selection';
import {format} from 'd3-format';
import {scaleLinear} from 'd3-scale';
import {max, min} from 'd3-array';
import {entries} from 'd3-collection';
import {axisTop} from 'd3-axis';

/**
* Creates the attribute table view
*/
class attributeTable {

  private $node;

  private width;
  private height;

  private tableAxis;


  //private margin = {top: 60, right: 20, bottom: 60, left: 40};

  private activeView;
  private colData;
  // access to all the data in our backend
  // private all_data;
  // private row_order;
  // private column_order;
  // private num_cols;
  // private col_names;
  // private row_data;
  // private columns;

  private margin = Config.margin;

  constructor(parent:Element) {
    this.$node = select(parent)
    // .append('div')
    // .classed('attributeTable', true);
  }

  /**
  * Initialize the view and return a promise
  * that is resolved as soon the view is completely initialized.
  * @returns {Promise<FilterBar>}
  */
  async init(data) {
    // this.all_data = data;
    // this.column_order = data.displayedColumnOrder;
    // this.num_cols = data.numberOfColumnsDisplayed;
    // this.col_names = data.referenceColumns;
    //
    // this.row_order = data.displayedRowOrder;
    // this.row_data = data.referenceRows;


    console.log("IN TABLE VIEW");


    this.activeView = data.activeView;
    this.colData = data.activeAttributes;

    // console.log("can I get the objects?");
    // console.log(await this.activeView.objects());
    //
    // console.log("can I get col names & types?");
    // console.log(this.colData);
    //
    console.log("col names?");
    console.log(await this.activeView.cols());



    // getting a list of names & types


    this.build();
    this.attachListener();

    console.log("LEAVING TABLE VIEW");

    // return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
  * Build the basic DOM elements and binds the change function
  */
  private async build() {


    // returns a list of column-based data
    // this.activeView.cols().map(function(col){
    //       return this.activeView.colData[col.desc.name];
    //     })

    //list with 1 object
    // let fakeData = [{id:"John", y:"2", ddate:1993, bdate:1900},
    //                 {id:"Alice", y:"4", ddate:1973, bdate:1900}];


    this.width = 450 - this.margin.left - this.margin.right
    this.height = Config.glyphSize * 3 * this.activeView.nrow - this.margin.top - this.margin.bottom;

    const darkGrey = '#4d4d4d';
    const lightGrey = '#d9d9d9';
    const mediumGrey = '#bfbfbf';
    const lightPinkGrey = '#eae1e1';
    const darkBlueGrey = '#4b6068';

    let rowData = await this.activeView.objects();
    let colData = this.colData; //just an array so no awaiting

    //rendering info
    var col_widths = await this.getDisplayedColumnWidths(this.width);
    var col_xs = await this.getDisplayedColumnXs(this.width);
    var label_xs = await this.getDisplayedColumnMidpointXs(this.width);

    var num_cols = colData.length;
    var displayedColNames = this.colData.map(function(elem)
      {return elem['name'];});
    var displayedColTypes = this.colData.map(function(elem)
      {return elem['type'];});

    // Scales
    let x = scaleLinear().range([0 , this.width]).domain([1 ,1]);
    let y = scaleLinear().range([0, this.height]).domain( //[1, 103]);
    [min(rowData,
      function(d){return +d['y']}), max(rowData,function(d){return +d['y']}) ]);

    const rowHeight = Config.glyphSize * 2.5 - 4;

    const svg = this.$node.append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)


//COLUMNS GO HERE


    /// v row
        const table = svg.append("g")
        .attr("transform", "translate(0," + this.margin.top + ")")

        let rows = table.selectAll(".row")
        .data(rowData) // TODO: aggregation
        .enter()
        .append("g")
        .attr('id', function (elem) {
          return ('row_' +  elem.id);
        })
        .attr('class', 'row')
        .attr("transform", function (elem) {
          // console.log("this was the element: ");
          // console.log(elem);
          // console.log("this was the y position: " + elem.y);
          return ('translate(0, ' +  y(elem.y)+ ' )');
        });








        //////////////////////
        // monster for loop creates all vis. encodings for rows
            const col_margin = 4;
            for (let colIndex = 0; colIndex < num_cols; colIndex++) {
              const curr_col_name = displayedColNames[colIndex];
              const curr_col_type = displayedColTypes[colIndex];
              const curr_col_width = col_widths[colIndex] - col_margin;

              if( curr_col_type == 'idtype' ){

                rows.append("rect")
                .attr("width", curr_col_width)
                .attr("height", rowHeight)
                .attr('fill', 'lightgrey')
                .attr('stroke', 'black')
                .attr('stoke-width', 1)
                .attr("transform", function () {
                  return ('translate(' + col_xs[colIndex] + ' ,0)')
                });

                rows.append("text")
                .text(function(elem) {
                  const the_text = elem[curr_col_name];
                  return the_text.toString().substring(0, 3); })
                .attr("transform", function (row_index) {
                  return ('translate(' + (label_xs[colIndex] - 10) + ' ,' + (rowHeight/2 + 5) + ')')
                });
              }

              else if( curr_col_type == 'categorical'){
                const allValues = rowData.map(function(elem){return elem[curr_col_name]});
                const uniqueValues = Array.from(new Set(allValues));


                uniqueValues.forEach(function(value) {
                  rows.append("rect")
                  .attr("width", curr_col_width)
                  .attr("height", rowHeight)
                  .attr('fill', function(elem){
                    return (elem[curr_col_name] === uniqueValues[0]) ? '#666666' : 'white';
                  })
                  .attr('stroke', 'black')
                  .attr('stoke-width', 1)
                  .attr("transform", function () {
                    return ('translate(' + col_xs[colIndex] + ' ,0)')
                  });
              });
              }

              // else if( curr_col_type == 'int' ){
              //   // how big is the range?
              //   //find min, find max
              //   const allValues = rowData.map(function(elem){return elem[curr_col_name]}).filter(function(x){return x.length != 0;});
              //
              //   // complicated min/max to avoid unspecified (zero) entries
              //   // const min = [].reduce.call(allValues, function(acc, x) {
              //   //   //console.log("in min, x is: " + x +", x.length is: " + x.length);
              //   //   return x.length == 0 ? acc : Math.min(x, acc); });
              //   const min = Math.min( ...allValues );
              //   const max = Math.max( ...allValues );
              //   const avg = allValues.reduce(function(acc, x) {
              //     return parseInt(acc) + parseInt(x);}) / (allValues.length);
              //
              //   // only rows that have data
              //   rows.filter((elem)=>{return elem[curr_col_name].toString().length > 0;})
              //
              //
              //   const radius = 2;
              //   const scaledRange = (curr_col_width-2*radius) / (max - min);
              //
              //   rows.append("ellipse")
              //   .attr("cx", function(elem){
              //     return Math.floor((elem[curr_col_name]-min) * scaledRange);})
              //   .attr("cy", rowHeight / 2)
              //   .attr("rx", radius)
              //   .attr("ry", radius)
              //   .attr('stroke', 'black')
              //   .attr('stroke-width', 1)
              //   .attr('fill', '#d9d9d9')
              //   .attr("transform", function () { //yikes these shifts!
              //     return ('translate(' + (col_xs[colIndex]+radius) + ' ,0)');
              //   });
              //
              //   // and a boundary
              //   rows.append("rect")
              //   .attr("width", curr_col_width)
              //   .attr("height", rowHeight)
              //   .attr('fill', 'transparent')
              //   .attr('stroke', 'black')
              //   .attr('stoke-width', 1)
              //   .attr("transform", function () {
              //     return ('translate(' + col_xs[colIndex] + ' ,0)');
              //   });
              //   // stick on the median
              //   rows.append("rect") //sneaky line is a rectangle
              //   .attr("width", 2)
              //   .attr("height", rowHeight)
              //   .attr("fill", 'black')
              //   .attr("transform", function () {
              //     return ('translate(' + (Math.floor((avg-min) * scaledRange)
              //     + col_xs[colIndex] - col_margin) + ',0)');
              //   });
              // }
              // else
              //   console.log("oh no, what type is this: " + curr_col_type );

        }

        // end for loop










/*
    let tableAxis = axisTop(x).tickFormat(format("d"));
    const rowHeight = Config.glyphSize * 2.5 - 4;
    const svg = this.$node.append('svg')
    .attr('width', this.width + this.margin.left + this.margin.right)
    .attr("height", this.height + this.margin.top + this.margin.bottom)
    const axis = svg.append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.axisTop / 1.5 + ")")
        .attr('id', 'axis')
    const TEMP_LEFT_FIX = 35; //TODO: what's going on here?
    // todo: refactor so each column *knows* these things about itself
    var col_widths = this.getDisplayedColumnWidths(this.width);
    var col_xs = this.getDisplayedColumnXs(this.width);
    var label_xs = this.getDisplayedColumnMidpointXs(this.width);
    var num_cols = this.getNumberDisplayedColumns();
    var displayedColNames = this.getDisplayedColumnNames();
    var displayedColTypes = this.getDisplayedColumnTypes();
  //  var displayedColOrder = this.all_data.getDisplayedColumnOrder();
  let colNames = await this.activeView.cols().map(function(col){
        return col.desc.name;
      });
      console.log("colNames: ");
      console.log(colNames);
      // this.colData
     // ^^ UPDATE THOSE ON EVENTS- IS THIS A BAD DESIGN?
    const table_header = axis.selectAll(".table_header")
    .data(colNames)
    .enter();
    table_header.append("text")
      .text(["a", "b"])//function(colName) { return colName;})
      .attr('fill', 'black')
      .attr('class', 'b')
			.attr("transform", function (name, index) { // the 5 is to bump slight left
          //return "translate(" + (label_xs[index] - 5 - TEMP_LEFT_FIX) + ", 0) rotate(-45)";
          return "translate(" + (index*10 - 5 - TEMP_LEFT_FIX) + ", 0) rotate(-45)";
      });
*/


//  throw "I got this";

/*
    const loremIpsum = ["", "", "", "M", "T", "T", "   ...", "   ..."];
    table_header.append("text")
    // did someone say stand in text?
      .text(function(index) { return loremIpsum[index]; })
      .attr('fill', 'black')
      .attr("transform", function (index) {
          return "translate(" + (col_xs[index] - TEMP_LEFT_FIX) + ", 20)";
      });
      const wholeWidth = this.width; //binding here bc "this" mess
    axis.append("rect")
    .attr('width', wholeWidth)
    .attr('height', 1)
    .attr('fill', 'black')
    .attr("transform", function (index) { //TODO: what's up with the shift?
        return "translate(" + (-1*TEMP_LEFT_FIX - 5) + ", 5)";
    })
// TODO: to sort the table by attribute
    table_header.append("rect")
      .attr('width', function(index){ return col_widths[index];})
      .attr('height', 40)
      .attr('fill', 'transparent')
      .attr("transform", function (index) { //TODO: what's up with the shift?
          return "translate(" + (col_xs[index] - TEMP_LEFT_FIX - 5) + ", 0)";
      })
      // CLICK
      .on('click', function(d) {
        //1. sort attributes, keep a hold of some row id - add row DS
        //2. update row display order
      })
*/
/// ^ columns
/*
/// v row
    const table = svg.append("g")
    .attr("transform", "translate(0," + this.margin.top + ")")
    let rows = table.selectAll(".row")
    .data(await this.activeView.objects("(0:-1)"))
    .enter();
    // .attr('id', function (elem) {
    //   return ('row_' +  elem.id);
    // })
    //.attr('class', 'row');
    // .attr("transform", function (elem) {
    //   return ('translate(0, ' +  y(elem.y)+ ' )');
    // });
    rows.append("rect")
    .attr("width", 30)
    .attr("height", rowHeight)
    .attr('fill', 'lightgrey')
    .attr('stroke', 'black')
    .attr('stoke-width', 1);
*/

/*
    let rows = table.selectAll(".row")
    .data(betterData) // TODO: aggregation
    .enter()
    .append("g")
    .attr('id', function (elem) {
      return ('row_' +  elem.id);
    })
    .attr('class', 'row')
    .attr("transform", function (elem) {
      return ('translate(0, ' +  y(elem.y)+ ' )');
    });
//////////////////////
// monster for loop creates all vis. encodings for rows
    const col_margin = 4;
    for (let colIndex = 0; colIndex < num_cols; colIndex++) {
      const curr_col_name = displayedColNames[colIndex];
      const curr_col_type = displayedColTypes[colIndex];
      const curr_col_width = col_widths[colIndex] - col_margin;
      if( curr_col_type == 'idType' ){
        rows.append("rect")
        .attr("width", curr_col_width)
        .attr("height", rowHeight)
        .attr('fill', 'lightgrey')
        .attr('stroke', 'black')
        .attr('stoke-width', 1)
        .attr("transform", function () {
          return ('translate(' + col_xs[colIndex] + ' ,0)')
        });
        rows.append("text")
        .text(function(elem) {
          const the_text = elem[curr_col_name];
          return the_text.toString().substring(0, 3); })
        .attr("transform", function (row_index) {
          return ('translate(' + (label_xs[colIndex] - 10) + ' ,' + (rowHeight/2 + 5) + ')')
        });
      }
      else if( curr_col_type == 'categorical'){
        const allValues = betterData.map(function(elem){return elem[curr_col_name]});
        const uniqueValues = Array.from(new Set(allValues));
        uniqueValues.forEach(function(value) {
          rows.append("rect")
          .attr("width", curr_col_width)
          .attr("height", rowHeight)
          .attr('fill', function(elem){
            return (elem[curr_col_name] === uniqueValues[0]) ? '#666666' : 'white';
          })
          .attr('stroke', 'black')
          .attr('stoke-width', 1)
          .attr("transform", function () {
            return ('translate(' + col_xs[colIndex] + ' ,0)')
          });
      });
      }
      else if( curr_col_type == 'int' ){
        // how big is the range?
        //find min, find max
        const allValues = betterData.map(function(elem){return elem[curr_col_name]}).filter(function(x){return x.length != 0;});
        // complicated min/max to avoid unspecified (zero) entries
        // const min = [].reduce.call(allValues, function(acc, x) {
        //   //console.log("in min, x is: " + x +", x.length is: " + x.length);
        //   return x.length == 0 ? acc : Math.min(x, acc); });
        const min = Math.min( ...allValues );
        const max = Math.max( ...allValues );
        const avg = allValues.reduce(function(acc, x) {
          return parseInt(acc) + parseInt(x);}) / (allValues.length);
        // only rows that have data
        rows.filter((elem)=>{return elem[curr_col_name].toString().length > 0;})
        const radius = 2;
        const scaledRange = (curr_col_width-2*radius) / (max - min);
        rows.append("ellipse")
        .attr("cx", function(elem){
          return Math.floor((elem[curr_col_name]-min) * scaledRange);})
        .attr("cy", rowHeight / 2)
        .attr("rx", radius)
        .attr("ry", radius)
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('fill', '#d9d9d9')
        .attr("transform", function () { //yikes these shifts!
          return ('translate(' + (col_xs[colIndex]+radius) + ' ,0)');
        });
        // and a boundary
        rows.append("rect")
        .attr("width", curr_col_width)
        .attr("height", rowHeight)
        .attr('fill', 'transparent')
        .attr('stroke', 'black')
        .attr('stoke-width', 1)
        .attr("transform", function () {
          return ('translate(' + col_xs[colIndex] + ' ,0)');
        });
        // stick on the median
        rows.append("rect") //sneaky line is a rectangle
        .attr("width", 2)
        .attr("height", rowHeight)
        .attr("fill", 'black')
        .attr("transform", function () {
          return ('translate(' + (Math.floor((avg-min) * scaledRange)
          + col_xs[colIndex] - col_margin) + ',0)');
        });
      }
      else
        console.log("oh no, what type is this: " + curr_col_type );
}
// end for loop
    const boundary = rows
    .append("rect")
    .attr("class", "boundary")
    .attr('row_pos', function (elem) {
      return elem.y;
    })
    .attr("width", this.width-col_margin)
    .attr("height", rowHeight)
    .attr('stroke', 'transparent')
    .attr('stroke-width', 1)
    .attr('fill', 'none');
  const eventListener = rows.append('rect').attr("height", rowHeight).attr("width", this.width).attr("fill", "transparent")
  // CLICK
  .on('click', function(elem) {
    selectAll('.boundary').classed('tablehovered', false);
    if (!event.metaKey){ //unless we pressed shift, unselect everything
         selectAll('.boundary').classed('tableselected',false);
    }
    selectAll('.boundary').classed('tableselected', function(){
      const rightRow = (select(this).attr('row_pos') == elem.y);
      if(rightRow)
        return (!select(this).classed('tableselected')); //toggle it
      return select(this).classed('tableselected'); //leave it be
    });
    if(event.metaKey)
      events.fire('table_row_selected', elem.id, 'multiple');
    else
      events.fire('table_row_selected', elem.id, 'singular');
  })
  // MOUSE ON
  .on('mouseover', function(elem) {
    selectAll('.boundary').classed('tablehovered', function(){
      const rightRow = (select(this).attr('row_pos') == elem.y);
      if(rightRow){ //don't hover if it's selected
        return !select(this).classed('tableselected');
      }
      return false; //otherwise don't hover
    });
    events.fire('table_row_hover_on', elem.id);
  })
  // MOUSE OFF
  .on('mouseout', function(elem) {
    selectAll('.boundary').classed('tablehovered', false);
    events.fire('table_row_hover_off', elem.id);
  });
  */

}

  //private update(data){

  //}


  private getDisplayedColumnWidths(width){
    var displayedColNames = this.colData.map(function(elem)
      {return elem['name'];});
    var displayedColTypes = this.colData.map(function(elem)
      {return elem['type'];});

    //console.log("how many cols?? " + this.colData.length);

    return [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240];
  }
  private getDisplayedColumnXs(width){
    return [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240];
  }
  private getDisplayedColumnMidpointXs(width){
    return [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240];
  }



  // console.log("can I get the objects?");
  // console.log(await this.activeView.objects());
  //
  // console.log("can I get col names & types?");
  // console.log(this.colData);
  //
  // console.log("col names?");
  // console.log(await this.activeView.cols());





  private attachListener() {
    //NODE BEGIN HOVER
    events.on('row_mouseover', (evt, item)=> {
      selectAll('.boundary').classed('tablehovered', function (d) {
        return (!select(this).classed('tablehovered') && !select(this).classed('tableselected') &&
        select(this).attr('row_pos') == item);
      });
    });

    //NODE END HOVER
    events.on('row_mouseout', (evt, item)=> {
      return selectAll('.boundary').classed('tablehovered',false);
    });


    // NODE CLICK
    events.on('row_selected', (evt, row, multipleSelection)=> {
        selectAll('.boundary').classed('tablehovered', false); //don't hover
        console.log(multipleSelection);
        selectAll('.boundary').classed('tableselected', function(a){
          // if it's the right row, toggle it
          // if it's the wrong row, leave the selection the same
          const rightRow = (select(this).attr('row_pos') == row);
          if(rightRow)
            return (!select(this).classed('tableselected')); //toggle it
          else{
            if (multipleSelection == 'single'){ //unless we pressed shift, unselect everything else
                 select(this).classed('tableselected',false);
            }
            return select(this).classed('tableselected'); //leave it be
          }




        });
    });


    //TODO
    events.on('rows_aggregated', (evt, item)=> {
      //this.all_the_data.aggregateRows();

      // Things that need to happen here:
      // change rows to be joined w. the displayRows instead of displayData- then we have to index each time for every attribute.
      // update the displayedRows datastructure
      //


    });


  }

}

/**
* Factory method to create a new instance of the Table
* @param parent
* @param options
* @returns {attributeTable}
*/
export function create(parent:Element) {
  return new attributeTable(parent);
}
