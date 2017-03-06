import * as events from 'phovea_core/src/event';
import {AppConstants, ChangeTypes} from './app_constants';
// import * as d3 from 'd3';
import {Config} from './config';

import {select, selection, selectAll, mouse, event} from 'd3-selection';
import {format} from 'd3-format';
import {scaleLinear} from 'd3-scale';
import {max, min} from 'd3-array';
import {entries} from 'd3-collection';
import {axisTop} from 'd3-axis';
import * as range from 'phovea_core/src/range';

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
  private colData;    // <- everything we need to bind

  private margin = Config.margin;

  constructor(parent: Element) {
    this.$node = select(parent)
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<FilterBar>}
   */
  async init(data) {

    this.activeView = data.activeView;


    let colDataAccum = [];
    for (const vector of this.activeView.cols()) {
      const temp = await vector.data(range.all());
      const type = await vector.valuetype.type;
      if(type === 'categorical'){
        const categories = Array.from(new Set(temp));
        for(const cat of categories){
          var col: any = {};
          const base_name = await vector.column;
          col.name = base_name + '_' + cat;
          col.data = temp.map(
            (d)=>{if(d === cat) return d;
                  else return undefined;});
          col.ys = data.ys;
          col.type = type;
          colDataAccum.push(col);
        }
      }
      else{ //quant
        var col: any = {};
        col.name = await vector.column;
        col.data = temp;
        col.ys = data.ys;
        col.type = type;
        //compute some stats, but first get rid of non-entries
        const filteredData = temp.filter((d)=>{return d.length != 0;});
        col.min = Math.min( ...filteredData );
        col.max = Math.max( ...filteredData );     //parse bc otherwise might be a string because parsing is hard
        col.mean = filteredData.reduce(function(a, b) { return parseInt(a) + parseInt(b); }) / filteredData.length;

        colDataAccum.push(col);
      }
    }


    this.colData = colDataAccum;

    this.build();
    this.attachListener();


    // return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
   * Build the basic DOM elements and binds the change function
   */
  private async build() {

    this.width = 450 - this.margin.left - this.margin.right
    // this.height = Config.glyphSize * 3 * this.activeView.nrow - this.margin.top - this.margin.bottom;
    this.height = 2504;

    const darkGrey = '#4d4d4d';
    const lightGrey = '#d9d9d9';
    const mediumGrey = '#bfbfbf';
    const lightPinkGrey = '#eae1e1';
    const darkBlueGrey = '#4b6068';


    //rendering info
    var col_widths = this.getDisplayedColumnWidths(this.width);
    var col_xs = this.getDisplayedColumnXs(this.width);
    var label_xs = this.getDisplayedColumnMidpointXs(this.width);


    // Scales
    let x = scaleLinear().range([0, this.width]).domain([0, 13]);
    let y = scaleLinear().range([0, this.height]).domain([1, 98]); // TODO
    // [min(rowData,
    //   function(d){return +d['y']}), max(rowData,function(d){return +d['y']}) ]);

    const rowHeight = Config.glyphSize * 2.5 - 4;

    const svg = this.$node.append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)


//HEADERS
    const tableHeader = svg.append("g")
      .attr("transform", "translate(0," + this.margin.top / 2 + ")");

    //Bind data to the col headers
    let headers = tableHeader.selectAll(".header")
      .data(this.colData.map((d,i) => {return {'name':d.name, 'data':d, 'ind':i, 'type':d.type,
                                               'max':d.max, 'min':d.min, 'mean':d.mean}}));

    const headerEnter = headers
      .enter()
      .append('text')
      .classed('header', 'true')
    //.attr("transform", (d) => {return 'translate(' + x(d['ind']) + ',0) rotate(-45)';});
    .attr("transform",(d) => {
      const x_translation = label_xs.find(x => x.name === d.name).x;
      return 'translate(' + x_translation + ',0) rotate(-45)';});



    selectAll('.header')
      .text((d) => {return d['name']})


// TABLE
    const table = svg.append("g")
      .attr("transform", "translate(0," + this.margin.top + ")");

    //Bind data to the col groups
    let cols = table.selectAll(".column")
      .data(this.colData.map((d,i) => {return {'name':d.name, 'data':d.data, 'ind':i, 'ys':d.ys, 'type':d.type,
                                               'max':d.max, 'min':d.min, 'mean':d.mean}}));

    const colsEnter = cols.enter()
      .append('g')
      .classed('dataCols', true)
      .attr("transform", (d) => {
        const x_translation = col_xs.find(x => x.name === d.name).x;
        return 'translate(' + x_translation + ',0)';});


    cols = colsEnter.merge(cols);

    //Bind data to the cells
    let cells = cols.selectAll('.cell')
      .data((d) => {
        return d.data.map((e, i) => {return {'name': d.name, 'data': e, 'y': d.ys[i], 'type':d.type,
                                              'max':d.max, 'min':d.min, 'mean':d.mean}})})
      .enter()
      .append("g")
      .attr('class', 'cell');



      //Add rectangle for highlighting...
      const boundary = cells.filter((d)=> //only append onto the first cell of each row
      { return col_xs.find(x => x.name === d['name']).x === 0;})
      .append('rect')
      .attr("classed", "boundary")
      .classed('tablehovered', false) //TODO maybe get rid of?
      .classed('tableselected',false)
      .attr("row_pos", (d)=>{return d["y"];})
      .attr('width', this.width + 2)
      .attr('height', 20 + 4)
      .attr('fill', 'pink')//'transparent')
      .attr("transform", function (d) {
        return ('translate(' + -2 + ',' + (-2) + ')');
      });


      const categoricals = cells.filter((e)=>{return (e.type === 'categorical')})
                            .attr('classed', 'categorical');
      const quantatives  = cells.filter((e)=>{return (e.type === 'int')})
                            .attr('classed', 'quantitative');
      const idCells      = cells.filter((e)=>{return (e.type === 'idtype')})
                            .attr('classed', 'idtype');


////////// RENDER CATEGORICAL COLS /////////////////////////////////////////////

      categoricals
      .append('rect')
      .attr('width', (d)=> {return col_widths.find(x => x.name === d.name).width;})
      .attr('height', 20)
      .attr('stroke', 'black')
      .attr('stoke-width', 1)
      .attr('fill', (d)=>{
        if(d.data !== undefined)
          return '#474747'; //dark grey
        return '#d9dbdb'; //light grey
      });

////////// RENDER QUANT COLS /////////////////////////////////////////////
      const radius = 2;

      quantatives
      .append('rect')
      .attr('width', (d)=> {return col_widths.find(x => x.name === d.name).width;})
      .attr('height', 20)
      .attr('fill', '#eef2f2') //VERY light grey
      .attr('stroke', 'black')
      .attr('stoke-width', 1);

      quantatives
      .append("ellipse")
        .attr("cx",
        function(d){
          const width = col_widths.find(x => x.name === d.name).width;
          const scaledRange = (width-2*radius) / (d.max - d.min);
          return Math.floor((d.data-d.min) * scaledRange);})
        .attr("cy", 20 / 2)
        .attr("rx", radius)
        .attr("ry", radius)
        .attr('stroke', '#474747')
        .attr('stroke-width', 1)
        .attr('fill', '#d9d9d9'); // TODO: translate off of boundaries

        // stick on the median
        quantatives
        .append("rect") //sneaky line is a rectangle
        .attr("width", 2)
        .attr("height", 20)
        .attr("fill", 'black')
        .attr("transform", function (d) {
          const width = col_widths.find(x => x.name === d.name).width;
          const scaledRange = (width-2*radius) / (d.max - d.min);
          return ('translate(' + ((d.mean -d.min) * scaledRange) + ',0)');
        });


    //Move cells to their correct y position
    selectAll('.cell')
      .attr("transform", function (col) {
        return ('translate(0, ' + y(col['y']) + ' )'); //the x translation is taken care of by the group this cell is nested in.
      });


    selection.prototype.moveToFront = function() {
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };


   // CLICK

  // const listener =
  //  boundary.on('click', function(elem) {
  //    console.log("REGISTERED CLICK!!");
  //  });

   cells.on('click', function(elem) {
     console.log("REGISTERED CLICK!!");
     selectAll('.boundary').classed('tablehovered', false);
     if (!event.metaKey){ //unless we pressed shift, unselect everything
       selectAll('.boundary').classed('tableselected',false);
     }

     console.log("all boundary?")
     console.log(selectAll('.boundary'))

     console.log("live");
     selectAll('.boundary').classed('tableselected', function(){
       console.log("IN THE FIRST BOUNDARY THING");
       console.log("select(this).attr('row_pos')");
       console.log(select(this).attr('row_pos'));
       const rightRow = (select(this).attr('row_pos') === elem['y']);
       if(rightRow)
          return (!select(this).classed('tableselected')); //toggle it
       return select(this).classed('tableselected'); //leave it be
     });
     console.log("still live?");
     if(event.metaKey)
        events.fire('table_row_selected', elem['y'], 'multiple');
     else
        events.fire('table_row_selected', elem['y'], 'singular');
     });

     console.log("made it out");



    //  // MOUSE ON
    //  .on('mouseover', function(elem) {
    //     selectAll('.boundary').classed('tablehovered', function(){
    //       const rightRow = (select(this).attr('row_pos') === elem['y']);
    //       if(rightRow){ //don't hover if it's selected
    //         return !select(this).classed('tableselected');
    //       }
    //       return false; //otherwise don't hover
    //  });
    //  events.fire('table_row_hover_on', elem['y']);
    //  })
    //  // MOUSE OFF
    //  .on('mouseout', function(elem) {
    //    selectAll('.boundary').classed('tablehovered', false);
    //    events.fire('table_row_hover_off', elem['y']);
    //  });


 }

  //private update(data){

  //}


  private getWeight(data_elem){
	    if(data_elem.type === 'int')
	      return 3;
	    else if(data_elem.type === 'categorical'){ //make sure to account for # cols
        return 1;
      }
	    return 2;
	  }

 private getTotalWeights(){
      const getWeightHandle = this.getWeight;
	    const weights = this.colData.map(function(elem)
	    { return getWeightHandle(elem);});
      return weights.reduce(function(a, b) { return a + b; }, 0);
	}


// returns a function that takes a column name & returns the width of that column (single category width for cat columns)
	  private getDisplayedColumnWidths(width){
        const buffer = 4;
	      const totalWeight = this.getTotalWeights();
        const getWeightHandle = this.getWeight;
        const availableWidth = width - (buffer * this.colData.length);
	      const toReturn = this.colData.map(function(elem, index){
	          const elemWidth = getWeightHandle(elem) * availableWidth / totalWeight;
            return {'name':elem['name'], 'width':elemWidth}
	      });
        return toReturn;
	  }

	  private getDisplayedColumnXs(width){
      const buffer = 4;
	    const totalWeight = this.getTotalWeights();
      const colWidths = this.getDisplayedColumnWidths(width);
      return colWidths.map(function(elem, index){
        var x_dist = 0;
        for(let i = 0; i < index; i++){
          x_dist += colWidths[i].width + buffer;
        }
        return {'name':elem['name'], 'x':x_dist};
      });
	  }


	  private getDisplayedColumnMidpointXs(width){
      const buffer = 6;
	    const totalWeight = this.getTotalWeights();
	    const colXs = this.getDisplayedColumnXs(width);
      const colWidths = this.getDisplayedColumnWidths(width);
	    return this.colData.map(function(elem, index){
	        const midPoint = colXs[index].x + (colWidths[index].width/2) ;//+ 40; //TODO WHY
          return {'name':elem['name'], 'x':midPoint};
	    });

	  }


  private attachListener() {
    //NODE BEGIN HOVER
    events.on('row_mouseover', (evt, item) => {
      selectAll('.boundary').classed('tablehovered', function (d) {
        return (!select(this).classed('tablehovered') && !select(this).classed('tableselected') &&
        select(this).attr('row_pos') == item);
      });
    });

    //NODE END HOVER
    events.on('row_mouseout', (evt, item) => {
      return selectAll('.boundary').classed('tablehovered', false);
    });


    // NODE CLICK
    events.on('row_selected', (evt, row, multipleSelection) => {
      selectAll('.boundary').classed('tablehovered', false); //don't hover
      //  console.log(multipleSelection);
      selectAll('.boundary').classed('tableselected', function (a) {
        // if it's the right row, toggle it
        // if it's the wrong row, leave the selection the same
        const rightRow = (select(this).attr('row_pos') == row);
        if (rightRow)
          return (!select(this).classed('tableselected')); //toggle it
        else {
          if (multipleSelection == 'single') { //unless we pressed shift, unselect everything else
            select(this).classed('tableselected', false);
          }
          return select(this).classed('tableselected'); //leave it be
        }


      });
    });


    //TODO
    events.on('rows_aggregated', (evt, item) => {
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
export function create(parent: Element) {
  return new attributeTable(parent);
}
