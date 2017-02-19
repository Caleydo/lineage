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


  // access to all the data in our backend
  private all_the_data;
  private row_order;
  private column_order;
  private num_cols;
  private col_names;
  private row_data;
  private columns;


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
  init(data) {
    this.all_the_data = data;
    this.column_order = data.displayedColumnOrder;
    this.num_cols = data.numberOfColumnsDisplayed;
    this.col_names = data.referenceColumns;

    this.row_order = data.displayedRowOrder;
    this.row_data = data.referenceRows;




    this.build();
    this.attachListener();

    // return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
  * Build the basic DOM elements and binds the change function
  */
  private build() {
    const data = this.row_data.map(function(d){
      return d["value"];
    });

    this.width = 450 - this.margin.left - this.margin.right
    this.height = Config.glyphSize * 3 * data.length - this.margin.top - this.margin.bottom;

    const darkGrey = '#4d4d4d';
    const lightGrey = '#d9d9d9';
    const mediumGrey = '#bfbfbf';
    const lightPinkGrey = '#eae1e1';
    const darkBlueGrey = '#4b6068';

    // Scales
    let x = scaleLinear().range([0 , this.width]).domain([1 ,1]);
    let y = scaleLinear().range([0, this.height]).domain([min(data,function(d){return d['y']}), max(data,function(d){return d['y']}) ])

    let tableAxis = axisTop(x).tickFormat(format("d"));

    const rowHeight = Config.glyphSize * 2.5 - 4;

    const svg = this.$node.append('svg')
    .attr('width', this.width + this.margin.left + this.margin.right)
    .attr("height", this.height + this.margin.top + this.margin.bottom)

    const axis = svg.append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top / 1.5 + ")")
        .attr('id', 'axis')

 // because `this` in js is stupid, local bindings to use in lambdas
    const num_cols = this.num_cols;
    const col_names = this.col_names;
    const totalWidth = this.width;
    const col_order = this.column_order;

    const TEMP_LEFT_FIX = 35; //TODO: what's going on here?

    // holds how wide each col is
    var col_widths = this.column_order.map(function(index){
      // TODO: weight num_cols by the TOTAL WEIGHT
      return col_names[index].width * totalWidth / num_cols;
    });

    // holds the x pos of the left-most edge of each column
    var col_xs = this.column_order.map(function(index){
      var x_dist = 0;
      for (var i = 0; i < index; i++) {
        x_dist += col_names[i].width * totalWidth / num_cols
      }
      return x_dist;
    });


    // holds the x pos of the midpoint of each column
     var label_xs = this.column_order.map(function(index){
        const label_pos =
        col_xs[index] + (col_names[index].width * totalWidth /num_cols)/2;
        return label_pos;
     });

     // ^^ UPDATE THOSE ON EVENTS- IS THIS A BAD DESIGN?
    const table_header = axis.selectAll(".table_header")
    .data(this.column_order)
    .enter();

    table_header.append("text")
      .text(function(index) { return col_names[index].name; })
      .attr('fill', 'black')
			.attr("transform", function (index) {
          return "translate(" + (label_xs[index] - TEMP_LEFT_FIX) + ", 20) rotate(-45)";
      });


// to sort the table by attribute
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

/// ^ columns

/// v row
    const table = svg.append("g")
    .attr("transform", "translate(0," + this.margin.top + ")")

    let rows = table.selectAll(".row")

    .data(this.row_order.map(function(index){
      return index[0]; //TODO! aggregation!
    }))
    .enter()
    .append("g")
    .attr('id', function (d) {
      return ('row_' + data[d].id)
    })
    .attr('class', 'row')
    .attr("transform", function (d, i) {
      return ('translate(0, ' + y(data[d].y)+ ' )')
    });




//////////////////////
// monster for loop creates all vis. encodings for rows
    for (let i = 0; i < num_cols; i++) {
      console.log("col_xs was: " + col_xs[i]);

      rows.append("rect")
      .attr("width", col_widths[i])
      .attr("height", rowHeight)
      .attr('fill', function (d) { // TODO: visual encoding based on type!
        //data[d][col_names[col_order[i]]] == 'F' ? lightPinkGrey : 'pink';
        if(data[d].y % 3 == 0)
          return 'lightcoral';
        else if(data[d].y % 3 == 1)
          return 'lightskyblue';
        else
          return 'lightgreen';
      })
      .attr("transform", function (row_index) {
        return ('translate(' + col_xs[i] + ' ,0)')
      });

///// vv TEMPORARY ENCODING  vv //////////////
      rows.append("text") // TODO: temp fix for no encoding
      .text(function(index) {
        const the_text = data[index][col_names[col_order[i]].name];
        return the_text.toString().substring(0, 3); })
      .attr("transform", function (row_index) {
        return ('translate(' + (label_xs[i] - 10) + ' ,' + (rowHeight/2 + 5) + ')')
      });
///// ^^ TEMPORARY ENCODING ^^ //////////////

      rows.append("line")
      .attr("x1", col_xs[i])
      .attr("y1", 0)
      .attr("x2", col_xs[i])
      .attr("y2", rowHeight)
      .attr("stroke-width", 1)
      .attr("stroke", "black");
    }
//////////////
// end for loop

    const boundary = rows
    .append("rect")
    .attr("class", "boundary")
    .attr('row_pos', function (d) {
      return data[d].y;
    })
    .attr("width", this.width)
    .attr("height", rowHeight)
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('fill', 'none');




  const eventListener = rows.append('rect').attr("height", rowHeight).attr("width", this.width).attr("fill", "transparent")
  // CLICK
  .on('click', function(d) {
    selectAll('.boundary').classed('tablehovered', false);
    if (!event.metaKey){ //unless we pressed shift, unselect everything
         selectAll('.boundary').classed('tableselected',false);
    }
    selectAll('.boundary').classed('tableselected', function(a){
      const rightRow = (select(this).attr('row_pos') == data[d].y);
      if(rightRow)
        return (!select(this).classed('tableselected')); //toggle it
      return select(this).classed('tableselected'); //leave it be
    });
    if(event.metaKey)
      events.fire('table_row_selected', data[d].y, 'multiple');
    else
      events.fire('table_row_selected', data[d].y, 'singular');
  })

  // MOUSE ON
  .on('mouseover', function(d) {
    selectAll('.boundary').classed('tablehovered', function(a){
      const rightRow = (select(this).attr('row_pos') == data[d].y);
      if(rightRow){ //don't hover if it's selected
        return !select(this).classed('tableselected');
      }
      return false; //otherwise don't hover
    });
    events.fire('table_row_hover_on', data[d].y);
  })

  // MOUSE OFF
  .on('mouseout', function(d) {
    selectAll('.boundary').classed('tablehovered', false);
    events.fire('table_row_hover_off', data[d].y);
  });

  }

  private update(data){

  }


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
        if (multipleSelection == 'single'){ //unless we pressed shift, unselect everything
             selectAll('.boundary').classed('tableselected',false);
        }
        selectAll('.boundary').classed('tableselected', function(a){
          // if it's the right row, toggle it
          // if it's the wrong row, leave the selection the same
          const rightRow = (select(this).attr('row_pos') == row);
          if(rightRow)
            return (!select(this).classed('tableselected')); //toggle it
          return select(this).classed('tableselected'); //leave it be
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
* Factory method to create a new instance of the genealogyTree
* @param parent
* @param options
* @returns {attributeTable}
*/
export function create(parent:Element) {
  return new attributeTable(parent);
}
