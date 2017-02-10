import * as events from 'phovea_core/src/event';
import {AppConstants, ChangeTypes} from './app_constants';
// import * as d3 from 'd3';
import {Config} from './config';

import {select, selectAll} from 'd3-selection';
import {scaleLinear} from 'd3-scale';
import {max, min} from 'd3-array';
import {entries} from 'd3-collection';

/**
* Creates the attribute table view
*/
class attributeTable {

  private $node;

  private width;
  private height;

 
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

    this.build(data);
    this.attachListener();

    // return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
  * Build the basic DOM elements and binds the change function
  */
  private build(data) {

    this.width = 150 - this.margin.left - this.margin.right
    this.height = Config.glyphSize * 3 * data.length - this.margin.top - this.margin.bottom;

    const darkGrey = '#4d4d4d';
    const lightGrey = '#d9d9d9';
    const mediumGrey = '#bfbfbf';
    const lightPinkGrey = '#eae1e1';
    const darkBlueGrey = '#4b6068';

    // Scales
    let x = scaleLinear().range([0 , this.width]).domain([1 ,1]);
    let y = scaleLinear().range([0, this.height]).domain([min(data,function(d){return d['y']}), max(data,function(d){return d['y']}) ])

    const rowHeight = Config.glyphSize * 2.5 - 2;
    const genderWidth = 20;
    const ageWidth = 50; // TODO!
    const bmiWidth = 30;

    const svg = this.$node.append('svg')
    .attr('width', this.width + this.margin.left + this.margin.right)
    .attr("height", this.height + this.margin.top + this.margin.bottom)

    const table = svg.append("g")
    .attr("transform", "translate(0," + this.margin.top + ")")

    let rows = table.selectAll(".row")
    .data(data)
    .enter()
    .append("g")
    .attr('id', function (d) {
      return ('row_' + d.id)
    })
    .attr('class', 'row')
    .attr("transform", function (d, i) {
      return ('translate(0, ' + y(d['y'])+ ' )')
    })//;
    //.attr("transform", function(d, i) { return "scale(0," + i * 20 + ")"; })
    .on('click', function(d) {
      console.log(d)
    });



    const genderCell = rows
    .append("rect")
    .attr("class", "ageCell")
    .attr("width", genderWidth) //Config.glyphSize * 10)
    .attr("height", rowHeight)
    .attr('fill', function (d) {
      return d.sex == 'F' ? lightPinkGrey : darkBlueGrey;
    });


    const ageCell = rows
    .append("rect")
    .attr("class", "ageCell")
    .attr("width", function (d) {
      if(d.ddate - d.bdate > 0)
      return (d.ddate - d.bdate)* ageWidth / 100;
      else
      return 15;  // TODO
    })
    .attr("height", rowHeight)
    .attr('fill', mediumGrey) //light grey
    .attr('stroke', '#a6a6a6') //slightly darker grey
    .attr('stroke-width', 1)
    .attr("transform", function (d, i) {
      return ('translate(' + genderWidth + ' )')
    });




//// BMI

  const medianBMI = ageWidth + genderWidth + (bmiWidth/2);

// central ref line
    rows.append("line")
    .attr("x1", medianBMI) //ageWidth + genderWidth)
    .attr("y1", 0)
    .attr("x2", medianBMI) //)
    .attr("y2", rowHeight)
    .attr("stroke-width", 1)
    //  .attr("stroke-dasharray", "2, 3")
    .attr("stroke", "#cccccc");



    const circleCell = rows.append("ellipse")
    .attr("cx",      function(d){
                        if(d.maxBMI)
                          return medianBMI + d.maxBMI;
                        else
                          return medianBMI;
                      })


    //ageWidth + genderWidth + (bmiWidth/2))
    .attr("cy", rowHeight / 2)
//
    // .attr("cy", function (d) {
    //   if(d.ddate - d.bdate > 0)
    //     return 70 + d.ddate - d.bdate;
    //   else
    //     return 50;
    // })
    .attr("rx", 2)
    .attr("ry", 2)
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('fill', '#d9d9d9');
    //.attr("fill", 'red');

//// END BMI

    const deceasedWidth = this.width - (ageWidth + genderWidth + bmiWidth);



    const deceasedCell = rows
    .append("rect")
    .attr("class", "deceasedCell")
    .attr("width", deceasedWidth) //Config.glyphSize * 10)
    .attr("height", rowHeight)
    .attr('fill', function (d) {    // dk grey   lt grey
      return d.deceased == 1 ? lightGrey : darkGrey;
    })
    .attr("transform", function (d, i) {
      return ('translate(' + (genderWidth + ageWidth + bmiWidth) + ' )')
    });





    const boundary = rows
    .append("rect")
    .attr("class", "boundary")
    .attr("width", this.width)
    .attr("height", rowHeight)
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('fill', 'none');   //;

// seperate out gender
    rows.append("line")
    .attr("x1", genderWidth)
    .attr("y1", 0)
    .attr("x2", genderWidth)
    .attr("y2", rowHeight)
    .attr("stroke-width", 1)
    .attr("stroke", "black");


// seperate out age
    rows.append("line")
    .attr("x1", ageWidth + genderWidth)
    .attr("y1", 0)
    .attr("x2", ageWidth + genderWidth)
    .attr("y2", rowHeight)
    .attr("stroke-width", 1)
    .attr("stroke", "black");

// seperate out bmi
    rows.append("line")
    .attr("x1", ageWidth + genderWidth + bmiWidth)
    .attr("y1", 0)
    .attr("x2", ageWidth + genderWidth + bmiWidth)
    .attr("y2", rowHeight)
    .attr("stroke-width", 1)
    .attr("stroke", "black");




  //  .attr("transform", function (d, i) {
  //    return ('translate(40 )')
  //  });

    /*
    rows
    // .select('.cell')
    //   .data(function (d) {
    //     return entries(d)
    //   })
    //   .enter()
    .append('rect')
    // .attr('id', function (d) {
    //   return ('cell_' + d.key) //or d.value
    // })
    .attr("width", Config.glyphSize * 10)
    //  function (d) {
    //   return d.id/1000+14;
    // })
    .attr("height", Config.glyphSize * 2.5)
    .attr('stroke', 'grey')
    .attr('stroke-width', 3)
    .attr('fill', 'none');
    // .attr("transform", function (d, i) {
    //   return ('translate(' + (Config.glyphSize * (3 * i)) + ' , 0)')
    // });

    */



  }

  private attachListener() {

    //Set listener for hover event on corresponding node that changes the color of that row to red
    events.on('node_hover_on', (evt, item)=> {
      selectAll('.row').classed('selected', function (d) {
        return (!select(this).classed('selected') && select(this).attr('id') === 'row_' + item);
      });
    });

    //Set listener for hover off event on corresponding node that changes the color back to black
    events.on('node_hover_off', (evt, item)=> {
      selectAll('.row').classed('selected',false);
    });

    //Set listener for hover event on corresponding node that changes the color of that row to red
    events.on('rows_aggregated', (evt, item)=> {
      selectAll('.row').classed('selected', function (d) {
        return (!select(this).classed('selected') && select(this).attr('id') === 'row_' + item);
      });
    });


  }

}

/**
* Factory method to create a new instance of the genealogyTree
* @param parent
* @param options
* @returns {genealogyTree}
*/
export function create(parent:Element) {
  return new attributeTable(parent);
}
