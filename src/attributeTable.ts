import * as events from 'phovea_core/src/event';
import {AppConstants, ChangeTypes} from './app_constants';
// import * as d3 from 'd3';
import {Config} from './config';

import {select, selection, selectAll, mouse, event} from 'd3-selection';
import {format} from 'd3-format';
import {scaleLinear} from 'd3-scale';
import {max, min, mean} from 'd3-array';
import {entries} from 'd3-collection';
import {axisTop, axisBottom} from 'd3-axis';
import * as range from 'phovea_core/src/range';
import {isNullOrUndefined} from 'util';
import {active} from 'd3-transition';
import {transition} from 'd3-transition';
import {easeLinear} from 'd3-ease';

import {line} from 'd3-shape';

import {range as d3Range} from 'd3-array';
import {isUndefined} from 'util';

/**
 * Creates the attribute table view
 */
class attributeTable {

  private $node;

  private width;
  private height;
  private buffer = 10; //pixel dist between columns

  private tableAxis;

  //for entire Table
  private y = scaleLinear();

  //for Cell Renderers
  private yScale =scaleLinear();
  private xScale = scaleLinear();

// RENDERING THINGS
  private table;
  private tableHeader;
  private columnSummaries;


  //private margin = {top: 60, right: 20, bottom: 60, left: 40};

  private tableManager;
  private colData;    // <- everything we need to bind

  private rowHeight = Config.glyphSize * 2.5 - 4;
  private colWidths = {'categorical':this.rowHeight, 'int':this.rowHeight*4, 'string':this.rowHeight*5, 'id':this.rowHeight*4};

  private colOffsets = [0];

  private idScale = scaleLinear(); //used to size the bars in the first col of the table;



  private margin = Config.margin;

  constructor(parent: Element) {
    this.$node = select(parent);
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<FilterBar>}
   */
  async init(data) {

    this.tableManager = data;

    this.build(); //builds the DOM

    // sets up the data & binds it to svg groups
    await this.update();

    this.attachListener();

    // return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  public async update() {
    await this.initData();
    this.render();
  }

  /**
   * Build the basic DOM elements and binds the change function
   */
  private async build() {

    //Height is a function of the current view and so is set in initData();
    this.width = 1000 - this.margin.left - this.margin.right
    this.height = Config.glyphSize * 3 * this.tableManager.graphTable.nrow //- this.margin.top - this.margin.bottom;



    let t = transition('t').duration(500).ease(easeLinear);

    //Exctract y values from dict.
    const svg = this.$node.append('svg')
      .classed('tableSVG', true)
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)


//HEADERS
    this.tableHeader = svg.append("g")
      .attr("transform", "translate(0," + this.margin.axisTop + ")");

    this.columnSummaries = svg.append("g")
      .attr("transform", "translate(0," + (this.margin.top - 50) + ")");

// TABLE

    svg.append("g")
      .attr("transform", "translate(0," + this.margin.top + ")")
      .attr('id','highlightBarsGroup')


    this.table = svg.append("g")
      .attr("transform", "translate(0," + this.margin.top + ")");
  }


  public async initData() {

    let graphView = await this.tableManager.graphTable;
    let attributeView = await this.tableManager.tableTable;



    let allCols = graphView.cols().concat(attributeView.cols());

    //This are the rows that every col in the table should have;
    let graphIDs = await graphView.col(0).names();

    //Create a dictionary of y value to people
    let y2personDict = {};
    let yDict = this.tableManager.yValues;


    graphIDs.forEach((person) => {
      if (yDict[person] in y2personDict) {
        y2personDict[yDict[person]].push(person);
      } else {
        y2personDict[yDict[person]] = [person];
      }
    })

    //Find y indexes of all rows
    let allRows = Object.keys(y2personDict).map(Number);

    //set up first column. can't seem to get an ivector for the first col from the table
    let col: any = {};
    col.data=[];
    col.name = 'personID';
    col.ys = allRows;
    col.type = 'id';
    col.stats=[];

    //Creating a scale for the rects in the personID col in the table.
    let maxAggregates = 1;
    for (let key of allRows){
      col.data.push(y2personDict[key]);
      maxAggregates = max([maxAggregates,y2personDict[key].length ])
    }
    this.idScale.domain([1,maxAggregates]);

    col.ids = col.data;

    let maxOffset = max(this.colOffsets);
    this.colOffsets.push(maxOffset + this.buffer*2 + this.colWidths.id);

    let colDataAccum = [col];

    this.height = Config.glyphSize * 3 * (max(allRows) - min(allRows) + 1);
    // console.log('table height is ', this.height)

    select('.tableSVG').attr("height", this.height + this.margin.top + this.margin.bottom)

    this.y.range([0, this.height]).domain([1, max(allRows)]);


    for (const vector of allCols) {
      const data = await vector.data(range.all());
      const type = await vector.valuetype.type;

      let peopleIDs = await vector.names();
      // peopleIDs = peopleIDs.map(Number);
      // console.log(vector.desc.name, peopleIDs.length);



      if (type === 'categorical') {
        //Build col offsets array ;
        const categories = Array.from(new Set(data));

        for (let cat of categories) {
          // console.log('category', cat);
          let col: any = {};
          col.ids = allRows.map((row) => {
            return y2personDict[row]
          });

          const base_name = await vector.desc.name;

          col.name = base_name + '_' + cat;
          col.varName = base_name;
          //Ensure there is an element for every person in the graph, even if empty
          col.data = allRows.map((row) => {
            let colData = [];
            let people = y2personDict[row];
            people.map((person) => {
              let ind = peopleIDs.lastIndexOf(person) //find this person in the attribute data
              if (ind > -1 && data[ind] === cat) {
                colData.push(data[ind])
              } else {
                colData.push(undefined);
              }
            });
            return colData;
          });
          col.ys = allRows;
          col.type = type;
          // console.log(col.name, ' cat is ', cat)
          if (categories.length <3 && (cat === 'M' || cat ==='Y' || +cat === 1)) {

            let maxOffset = max(this.colOffsets);
            this.colOffsets.push(maxOffset + this.buffer*2 + this.colWidths.categorical);
            colDataAccum.push(col);
          }
        }
      } else if (type === 'int') { //quant

        let maxOffset = max(this.colOffsets);
        this.colOffsets.push(maxOffset + this.buffer + this.colWidths.int);


        let col: any = {};
        col.ids = allRows.map((row) => {
          return y2personDict[row]
        });

        let stats = await vector.stats();


        col.name = await vector.desc.name;


        // console.log('comparing Mins for ',  col.name, stats.min, data.filter((d)=>{console.log(d); return +d>0}).map(Number), min(data.map(Number)))
        col.data = allRows.map((row) => {
          let colData = [];
          let people = y2personDict[row];
          people.map((person) => {
            let ind = peopleIDs.lastIndexOf(person) //find this person in the attribute data
            if (ind > -1) {
              colData.push(data[ind])
            } else {
              colData.push(undefined);
            }
          });
          return colData;
        });
        col.ys = allRows
        col.vector = vector;
        col.type = type;
        col.stats = stats;
        col.hist = await vector.hist(10);
        col.stats.min = min(data.filter((d)=>{return +d>0}).map(Number)) //temporary fix since vector.stats() returns 0 for empty values;
        col.stats.mean = mean(data.filter((d)=>{return +d>0}).map(Number)) //temporary fix since vector.stats() returns 0 for empty values;
        colDataAccum.push(col);
      } else if (type === 'string') {

        let maxOffset = max(this.colOffsets);
        this.colOffsets.push(maxOffset + this.buffer + this.colWidths.string);

        let col: any = {};
        col.ids = allRows.map((row) => {
          return y2personDict[row]
        });

        col.name = await vector.desc.name;

        col.data = allRows.map((row) => {
          let colData = [];
          let people = y2personDict[row];
          people.map((person) => {
            let ind = peopleIDs.lastIndexOf(person) //find this person in the attribute data
            if (ind > -1) {
              colData.push(data[ind])
            } else {
              colData.push(undefined);
            }
          });
          return colData;
        });
        col.ys = allRows
        col.type = type;
        colDataAccum.push(col);
      }

    }
    this.colData = colDataAccum;

  }


  //renders the DOM elements
  private async render() {
    let t = transition('t').duration(500).ease(easeLinear);
    let self = this;

    //rendering info
    var col_widths = this.getDisplayedColumnWidths(this.width);
    var col_xs = this.getDisplayedColumnXs(this.width);
    var label_xs = this.getDisplayedColumnMidpointXs(this.width);

    let allys = [];
    for (var key in this.tableManager.ys) {
      allys.push(+this.tableManager.ys[key])
    }

    // Scales
    // let x = scaleLinear().range([0, this.width]).domain([0, 13]);
    let y = this.y;

//HEADERS
    //Bind data to the col headers
    let headers = this.tableHeader.selectAll(".header")
      .data(this.colData.map((d, i) => {
        return {
          'name': d.name, 'data': d, 'ind': i, 'type': d.type,
          'max': d.max, 'min': d.min, 'mean': d.mean
        }
      }));

    headers.exit().transition(t).attr('opacity', 0).remove(); // should remove headers of removed col's

    const headerEnter = headers
      .enter()
      .append('text')
      .classed('header', 'true');

    headers = headerEnter.merge(headers);

    headers
      .text((d) => {
        return d['name']
      })

      .attr("transform", (d,i) => {
      let offset = this.colOffsets[i] + (this.colWidths[d.type]/2);
        return d.type === 'categorical' ? 'translate(' + offset + ',-30) rotate(-30)' : 'translate(' + offset + ',0)' ;
      });


    //Bind data to the col header summaries
    let colSummaries = this.columnSummaries.selectAll(".colSummary")
      .data(this.colData.map((d, i) => { return d}));

    let colSummariesEnter = colSummaries.enter().append('g').classed('colSummary',true);

    colSummaries.exit().remove();

    colSummaries = colSummariesEnter.merge(colSummaries)

    //Find largest frequency among all quant columns for yScale in histograms.
    let maxFrequency = this.colData.filter(d=>{return d.type === 'int'})
      .reduce((a,v)=>{ return v.hist.largestFrequency > a ? v.hist.largestFrequency : a},0);


    colSummaries.each(function (cell) {
      if (cell.type === 'categorical') {
        self.renderCategoricalHeader(select(this), cell);
      }
      else if (cell.type === 'int') {
        self.renderIntHeaderHist(select(this), cell,maxFrequency);
      }
      else if (cell.type === 'string') {
        self.renderStringHeader(select(this), cell);
      }
    });

    colSummaries.transition(t)
      .attr("transform", (d,i) => {
        let offset = this.colOffsets[i];
        return 'translate(' + offset + ',0)';
      });


    //create backgroundHighlight Bars
    let highlightBars = select('#highlightBarsGroup').selectAll('.highlightBar')
      .data(this.colData[0].ys.map(d=>{return {'y':d}}), (d: any) => {return d});

    highlightBars.exit().remove();

    let highlightBarsEnter = highlightBars.enter().append('rect').classed('highlightBar', true);

    highlightBars = highlightBarsEnter.merge(highlightBars)

    highlightBars
      .attr('x',0 )
      .attr('y',(d:any)=>{return this.y(d.y)})
      .attr('width',max(this.colOffsets))
      .attr('height',this.rowHeight)
      .attr('opacity', 0);

// TABLE
    //Bind data to the col groups
    let cols = this.table.selectAll(".dataCols")
      .data(this.colData.map((d, i) => {
        return {
          'name': d.name, 'data': d.data, 'ind': i, 'ys': d.ys, 'type': d.type,
          'ids': d.ids, 'stats': d.stats, 'varName':d.varName
        }
      }));

    cols.exit().transition(t).attr('opacity', 0).remove(); // should remove on col remove

    const colsEnter = cols.enter()
      .append('g')
      .classed('dataCols', true);


    cols = colsEnter.merge(cols)//;

    //translate columns horizontally to their position;
    cols.transition(t)
      .attr("transform", (d,i) => {
        let offset = this.colOffsets[i];
        return 'translate(' + offset + ',0)';
      });


    //create table Lines

    // //Bind data to the cells
    let rowLines = this.table.selectAll('.rowLine')
      .data(this.colData[0].ys, (d: any) => {return d});

    rowLines.exit().remove();

    let rowLinesEnter = rowLines.enter().append('line').classed('rowLine', true);

    rowLines = rowLinesEnter.merge(rowLines)

    selectAll('.rowLine')
      .attr('x1',0 )
      .attr('y1',(d:any)=>{return this.y(d)+this.rowHeight})
      .attr('x2',max(this.colOffsets))
      .attr('y2',(d:any)=>{return this.y(d)+this.rowHeight})
      .attr('stroke','black')
      .attr('stroke-width', 1)
      .attr('stroke', '#9e9d9b')
      .attr('opacity',.4)

    //Bind data to the cells
    let cells = cols.selectAll('.cell')
      .data((d) => {
        return d.data.map((e, i) => {
          return {'id': d.ids[i], 'name': d.name, 'data': e, 'y': d.ys[i], 'type': d.type, 'stats': d.stats, 'varName':d.varName}
        })
      }, (d: any) => {return +d.id[0]});

    cells.exit().remove();

    let cellsEnter = cells.enter()
      .append("g")
      .attr('class', 'cell');


    //Add rectangle for highlighting...
    cellsEnter
      .append('rect')
      .classed("boundary", true);

    cells = cellsEnter.merge(cells);

    cellsEnter.attr('opacity',0);

    cells
      .transition(t)
      .attr("transform", function (col: any) {
        return ('translate(0, ' + y(col.y) + ' )'); //the x translation is taken care of by the group this cell is nested in.
      });

    cellsEnter.attr('opacity',1);

    cells.each(function (cell) {
      if (cell.type === 'categorical') {
        self.renderCategoricalCell(select(this), cell);
      }
      else if (cell.type === 'int') {
        self.renderIntCell(select(this), cell);
      }
      else if (cell.type === 'string') {
        self.renderStringCell(select(this), cell);
      }
      else if (cell.type === 'id') {
        self.renderIdCell(select(this), cell);
      }

    });


  }

  /**
   *
   * This function renders the column header of String columns in the Table View.
   *
   * @param element d3 selection of the current column header element.
   * @param cellData the data bound to the column header element being passed in.
   */
  private renderStringHeader(element, headerData){

    element.selectAll('rect').remove();
    element.selectAll('text').remove();
    element.selectAll('circle').remove();
  };




  /**
   *
   * This function renders the column header of Categorical columns in the Table View.
   *
   * @param element d3 selection of the current column header element.
   * @param cellData the data bound to the column header element being passed in.
   */
  private renderCategoricalHeader(element, headerData){

    let col_width = this.colWidths.categorical;
    let height = this.rowHeight*1.8;

    let numPositiveValues = headerData.data.map((singleRow)=>{return singleRow.reduce((a, v) => {return v ? a + 1 : a}, 0) }).reduce((a, v) => {return v + a}, 0);
    let totalValues = headerData.data.map((singleRow)=>{return singleRow.length}).reduce((a,v) => {return a+v},0);

    let summaryScale = scaleLinear().range([0,height]).domain([0,totalValues])

    if (element.selectAll('.histogram').size()===0){
      element.append('rect')
        .classed('histogram',true);

      element.append('text')
        .classed('histogramLabel',true)
    }

    element.select('.histogram')
      .attr('opacity',0)
      .attr('width', col_width)
      .attr('height', summaryScale(numPositiveValues))
      .attr('y',(height - summaryScale(numPositiveValues)))
      .attr('opacity',1)

    element.select('.histogramLabel')
      .attr('opacity',0)
      .text(()=>{
        let percentage = (numPositiveValues/totalValues*100);
        if (percentage<1) {
          return percentage.toFixed(1) + '%'
        } else {
          return percentage.toFixed(0) + '%'
        }
      })
      .attr('y',(height - summaryScale(numPositiveValues) - 2))
      .attr('opacity',1)

  };

  /**
   *
   * This function renders the column header of Quantitative columns as SparkLines
   *
   * @param element d3 selection of the current column header element.
   * @param cellData the data bound to the column header element being passed in.
   */
  private renderIntHeader(element, headerData){

    let col_width = this.colWidths.int;
    let height = this.rowHeight*2.5;

    let t = transition('t').duration(500).ease(easeLinear);

    let allValues =[];

    headerData.data.map((singleRow)=>{singleRow.map((element)=>{if (+element >0) {allValues.push(+element)}})});

    allValues = allValues.sort((a,b)=>{return b-a});

    let xScale = scaleLinear().range([col_width*0.2,col_width*0.8]).domain([0,allValues.length])
    let yScale = scaleLinear().range([height*0.1,height*0.75]).domain([headerData.stats.min,headerData.stats.max])

    var lineFcn = line()
      .x(function(d:any,i:any) {return xScale(i); })
      .y(function(d:any) {return yScale(d); });

    if (element.selectAll('.sparkLine').size()===0){
      element
        .append('path')
        .classed('sparkLine',true)

      element.append('text').classed('minValue',true);
      element.append('text').classed('maxValue',true);

      element.append('circle').classed('meanValue',true);
    }

    element.select('.sparkLine')
      .datum(allValues)
      .transition(t)
      .attr('d',lineFcn)

    element.select('.minValue')
      .transition(t)
      .text(Math.round(min(allValues)))
      .attr('x',col_width*0.2)
      .attr('y',height)
      .attr('text-anchor','end')

    element.select('.maxValue')
      .transition(t)
      .text(Math.round(max(allValues)))
      .attr('x',col_width*0.8)
      .attr('y',0)
      .attr('text-anchor','end')

    element.select('.meanValue')
      .attr('cx',col_width/2) //need to change to find the closest point in the read data to this value
      .attr('cy',yScale(headerData.stats.mean))
      .attr('r',3)

  };


  /**
   *
   * This function renders the column header of Quantitative columns as Histograms
   *
   * @param element d3 selection of the current column header element.
   * @param cellData the data bound to the column header element being passed in.
   */

  private renderIntHeaderHist(element, headerData,maxFrequency){

    let col_width = this.colWidths.int;
    let height = this.rowHeight*1.8;

    let hist = headerData.hist;

    let range = [0,col_width];

    var data = [],
      cols = scaleLinear<string,string>().domain([maxFrequency,0]).range(['#111111', '#999999']),
      total = hist.validCount,
      binWidth = (range[1] - range[0]) / hist.bins,
      acc = 0;

    hist.forEach((b, i) => {
      data[i] = {
        v: b,
        acc: acc,
        ratio: b / total,
        range: hist.range(i),

        name: 'Bin ' + (i + 1) + ' (center: ' + Math.round((i + 0.5) * binWidth) + ')',
        // color: cols((i + 0.5) * binWidth);
        color:cols(b)
      };
      acc += b;


    });

    let xScale = scaleLinear().range([0,col_width]).domain(hist.valueRange).nice()
    var bin2value = scaleLinear().range(hist.valueRange).domain([0,hist.bins]);
    let yScale = scaleLinear().range([0,height*0.8]).domain([0,hist.largestFrequency]);

   let xAxis = axisBottom(xScale)
     .tickSize(5)
     .tickValues(xScale.domain())
     .tickFormat(format(".0f"))


    if (element.selectAll('.histogram').size()===0){
      element.selectAll('.histogram')
        .data(data)
        .enter()
        .append('rect')
        .classed('histogram',true)

      element.append('text').classed('maxValue',true);

      element.append('g')
        .attr("transform", "translate(0," + height + ")")
        .classed('hist_xscale',true)
        .call(xAxis)
    }

    element.selectAll('.histogram')
      .attr('opacity',0)
      .attr('width', binWidth*0.8)
      .attr('height', d =>{return yScale(d.v)})
      .attr('y',d =>{return (height - yScale(d.v))})
      // .attr('y',0)
      // .attr('height', 2)
      // .attr('y',d =>{return (yScale(d.v))})
      .attr('x',(d,i) =>{return xScale(bin2value(i))})
      .attr('opacity',1)

    //Position tick labels to be 'inside' the axis bounds. avoid overlap
    element.selectAll('.tick').each(function(cell){
      let xtranslate = +select(this).attr('transform').split('translate(')[1].split(',')[0];
      if (xtranslate === 0) //first label in the axis
        select(this).select('text').style('text-anchor','start');
      else{ //last label in the axis
        select(this).select('text').style('text-anchor','end');
      }
    });

    total = (data[data.length-1]).acc +(data[data.length-1]).v
    element.select('.maxValue')
      .text('Total:' + total)

      .attr('x',col_width/2)
      .attr('y',-height*0.1)
      .attr('text-anchor','middle')

  };



  /**
   *
   * This function renders the content of Categorical Cells in the Table View.
   *
   * @param element d3 selection of the current cell element.
   * @param cellData the data bound to the cell element being passed in.
   */
  private renderCategoricalCell(element, cellData) {

    let col_width = this.colWidths.categorical;
    let rowHeight = this.rowHeight;

    let numValues = cellData.data.reduce((a, v) => v ? a + 1 : a, 0);

    element.selectAll('rect').remove(); //Hack. don't know why the height of the rects isn' being updated.

    if (numValues === 0){
      return;
    }

    if (element.selectAll('.categorical').size()===0){
      element
        .append('rect')
        .classed('frame', true)

      element.append('rect')
        .classed('categorical',true)
    }

    this.yScale
      .domain([0, cellData.data.length])
      .range([0,rowHeight]);

    element
      .select('.frame')
      .attr('width', rowHeight)
      .attr('height', rowHeight)
      .attr('y',0)
      .classed('aggregate',()=>{return cellData.data.length >1})

    element
      .select('.categorical')
      .attr('width', rowHeight)
      .attr('height', this.yScale(numValues))
      .attr('y',(rowHeight - this.yScale(numValues)))
      .classed('aggregate',()=>{return cellData.data.length >1})
      .classed('affected',()=>{return this.tableManager.affectedState.var === cellData.varName})
  }

  /**
   *
   * This function renders the content of Quantitative (type === int)  Cells in the Table View.
   *
   * @param element d3 selection of the current cell element.
   * @param cellData the data bound to the cell element being passed in.
   */
  private renderIntCell(element, cellData) {
    let col_width = this.colWidths.int; //this.getDisplayedColumnWidths(this.width).find(x => x.name === cellData.name).width
    let rowHeight = this.rowHeight;
    const radius = 3.5;

    let jitterScale =  scaleLinear()
      .domain([0,1])
      .range([rowHeight*0.3, rowHeight*0.7]);

    this.xScale
      .domain([cellData.stats.min, cellData.stats.max])
      .range([col_width*0.1,col_width*0.9]);

    //No of non-undefined elements in this array
    let numValues = cellData.data.reduce((a, v) => v ? a + 1 : a, 0);


    if (numValues === 0){
      //Add a faint cross out to indicate no data here;
      if (element.selectAll('.cross_out').size()===0){
        element
          .append('line')
          .attr('class', 'cross_out')
      }

      element.select('.cross_out')
        .attr('x1', col_width*0.3)
        .attr('y1', rowHeight/2)
        .attr('x2', col_width*0.6)
        .attr('y2', rowHeight/2)
        .attr('stroke-width', 2)
        .attr('stroke', '#9e9d9b')
        .attr('opacity',.6)

      return;
    }

    if (element.selectAll('.quant').size()===0){
      element
        .append('rect')
        .classed('quant', true)
    }

    element
      .select('.quant')
      .attr('width', (d) => {
        return col_width
      })
      .attr('height', rowHeight)
      // .attr('stroke', 'black')
      // .attr('stoke-width', 1);

    element.selectAll('.quant_ellipse').remove(); //Hack. don't know why ellipsis.exit().remove() isn' removing the extra ones.

    let ellipses =element
      .selectAll('ellipse')
      .data((d)=>{
        let cellArray = cellData.data.filter((f)=>{return !isNullOrUndefined((f))})
          .map((e,i)=>{return {'id':d.id[i],'name':d.name, 'stats':d.stats, 'value':e}})
      // console.log('ellipse data for ', d.id , ' has ', cellArray.length , 'values');
        return cellArray
    });

    let ellipsesEnter = ellipses.enter()
      .append("ellipse")
      .classed('quant_ellipse', true)

    ellipses = ellipsesEnter.merge(ellipses);

    ellipses.exit().remove(); //Dont'know why these is not removing ellipses. :-/


    element.selectAll('.quant_ellipse')
      .attr("cx",
         (d: any) => {
          return this.xScale(d.value);
          ;
        })
      .attr("cy", ()=>{ return numValues>1 ? jitterScale(Math.random()) : rowHeight/2}) //introduce jitter in the y position for multiple ellipses.
      .attr("rx", radius)
      .attr("ry", radius)


  }

  /**
   *
   * This function renders the content of String Cells in the Table View.
   *
   * @param element d3 selection of the current cell element.
   * @param cellData the data bound to the cell element being passed in.
   */
  private renderStringCell(element, cellData) {

    let col_width = this.colWidths[cellData.type];
    let rowHeight = this.rowHeight;

    let numValues = cellData.data.reduce((a, v) => v ? a + 1 : a, 0);

    if (numValues === 0){
      return;
    }

    if (element.selectAll('.string').size()===0){
      element
        .append('text')
        .classed('string', true)
    }

    let textLabel;

    if (cellData.data.length === 0 || cellData.data[0] === undefined ){
      textLabel = '';
    } else {

      textLabel = cellData.data[0].toLowerCase().slice(0, 12);
      if (cellData.data[0].length > 12) {
        textLabel = textLabel.concat(['...']);
      }

      if (numValues > 1) { //aggregate Row
        textLabel = '...'
      }

    }

    element
      .select('.string')
      .text(textLabel)
      .attr('dy',rowHeight*0.9)
      .style('stroke','none')

    //set Hover to show entire text
    element
      .on('mouseover',function(d){
        select(this).select('.string')
          .text(()=>{
          if (d.data.length === 1)
            return d.data[0].toLowerCase()
          else
            return 'Multiple'

        })
      })
      .on('mouseout',function(d){
        let textLabel = cellData.data[0].toLowerCase().slice(0,12);

        if (cellData.data[0].length>12){
          textLabel = textLabel.concat(['...']);
        }

        if (numValues > 1){ //aggregate Row
          textLabel = '...'
        }
        select(this).select('.string').text(textLabel)
        });
  }


  /**
   *
   * This function renders the content of ID Cells in the Table View.
   *
   * @param element d3 selection of the current cell element.
   * @param cellData the data bound to the cell element being passed in.
   */
  private renderIdCell(element, cellData) {

    let col_width = this.colWidths[cellData.type];
    let rowHeight = this.rowHeight;

    this.idScale.range([0,col_width*0.6]);

    let numValues = cellData.data.reduce((a, v) => v ? a + 1 : a, 0);

    if (numValues === 0){
      return;
    }

    if (numValues > 1 && element.selectAll('.idBar').size()===0){
      element
        .append('rect')
        .classed('idBar', true)
    } else{
      element.selectAll('rect').remove();
    }

    if (element.selectAll('.string').size()===0){
      element
        .append('text')
        .classed('string', true)
    }

    let textLabel;
    if (numValues === 1){

      textLabel = cellData.data[0].toLowerCase().slice(0, 12);
      element
        .select('.string')
        .text(textLabel)
        .attr('dy',rowHeight*0.9)
        .attr('dx',0)
        .style('stroke','none')
    } else{

      element
        .select('.string')
        .text(numValues)
        .attr('dy',rowHeight*0.9)
        .attr('dx',this.idScale(numValues)+2)
        .style('stroke','none')


      element
        .select('.idBar')
        .attr('width',this.idScale(numValues))
        .attr('height',rowHeight)

    }



  }



//
//     // stick on the median
//     quantitative
//       .append("rect") //sneaky line is a rectangle
//       .attr('class', 'medianLine');
//
//     cells
//       .selectAll('.medianLine')
//       .attr("width", 1.2)
//       .attr("height", rowHeight)
//       .attr("fill", 'black')
//       .attr("transform", function (d) {
//         const width = col_widths.find(x => x.name === d.name).width;
//         const scaledRange = (width - 2 * radius) / (d.stats.max - d.stats.min);
//         return ('translate(' + ((d.stats.mean - d.stats.min) * scaledRange) + ',0)');
//       });

//     cells.selectAll('rect').on('click',(c) => {console.log(c);})
//
//
// ////////////// EVENT HANDLERS! /////////////////////////////////////////////
//
//     const jankyAData = this.tableManager; ///auuughhh javascript why
//     const jankyInitHandle = this.initData; ///whywhywhywhy
//     let self = this;
//
//     cells.on('click', async function (elem) {
//       //  console.log("REGISTERED CLICK");
//       //update the dataset & re-render
//
//       // const newView = await jankyAData.anniesTestUpdate();
//       // self.update(newView, [1, 2]);
//       // console.log("NEW VIEW!");
//       // console.log(newView.cols()[0]);
//
//     });
//
//
//     //  cells.on('click', function(elem) {
//     //    selectAll('.boundary').classed('tablehovered', false);
//     //    if (!event.metaKey){ //unless we pressed shift, unselect everything
//     //      selectAll('.boundary').classed('tableselected',false);
//     //    }
//     //    selectAll('.boundary')
//     //     .classed('tableselected', function(){
//     //        const rightRow = (parseInt(select(this).attr('row_pos')) === elem['y']);
//     //        if(rightRow){
//     //           return (!select(this).classed('tableselected')); //toggle it
//     //         }
//     //        return select(this).classed('tableselected'); //leave it be
//     //      });
//     //    if(event.metaKey)
//     //       events.fire('table_row_selected', elem['y'], 'multiple');
//     //    else
//     //       events.fire('table_row_selected', elem['y'], 'singular');
//     //    })
//     //    // MOUSE ON
//     //    .on('mouseover', function(elem) {
//     //       selectAll('.boundary').classed('tablehovered', function(){
//     //         const rightRow = (select(this).attr('row_pos') == elem['y']); //== OR parseInt. Not sure which is more canonical.
//     //         if(rightRow){ //don't hover if it's selected
//     //           return !select(this).classed('tableselected');
//     //         }
//     //         return false; //otherwise don't hover
//     //    });
//     //    events.fire('table_row_hover_on', elem['y']);
//     //    })
//     //    // MOUSE OFF
//     //    .on('mouseout', function(elem) {
//     //      selectAll('.boundary').classed('tablehovered', false);
//     //      events.fire('table_row_hover_off', elem['y']);
//     //    });
//
//     console.log('done rendering')
//
//   }

  //private update(data){

  //}

////////////// RENDERING FUNCTIONS! /////////////////////////////////////////////
  private getWeight(data_elem) {
    if (data_elem.type === 'int')
      return 3;
    else if (data_elem.type === 'categorical') { //make sure to account for # cols
      return 1;
    }
    return 2;
  }

  private getTotalWeights() {
    const getWeightHandle = this.getWeight;
    const weights = this.colData.map(function (elem) {
      return getWeightHandle(elem);
    });
    return weights.reduce(function (a, b) {
      return a + b;
    }, 0);
  }

  private getDisplayedColumnWidths(width) {
    const buffer = this.buffer;
    const totalWeight = this.getTotalWeights();
    const getWeightHandle = this.getWeight;
    const availableWidth = width - (buffer * this.colData.length);
    const toReturn = this.colData.map(function (elem, index) {
      const elemWidth = getWeightHandle(elem) * availableWidth / totalWeight;
      return {'name': elem['name'], 'width': elemWidth}
    });
    return toReturn;
  }

  private getDisplayedColumnXs(width) {
    const buffer = this.buffer;
    const totalWeight = this.getTotalWeights();
    const colWidths = this.getDisplayedColumnWidths(width);
    const toReturn = colWidths.map(function (elem, index) {
      var x_dist = 0;
      for (let i = 0; i < index; i++) {
        x_dist += colWidths[i].width + buffer;
      }
      return {'name': elem['name'], 'x': x_dist};
    });
    //
    // console.log("Full width was: " + width);
    // console.log("this.colData: ");
    // console.log(this.colData);
    // colWidths.map((d, i)=>{
    //   console.log("col width: " + colWidths[i]['width'] + ", col x: " + toReturn[i]['x']);
    // })

    return toReturn;
  }


  private getDisplayedColumnMidpointXs(width) {
    const buffer = this.buffer + 2;
    const totalWeight = this.getTotalWeights();
    const colXs = this.getDisplayedColumnXs(width);
    const colWidths = this.getDisplayedColumnWidths(width);
    return this.colData.map(function (elem, index) {
      const midPoint = colXs[index].x + (colWidths[index].width / 2);//+ 40; //TODO WHY
      return {'name': elem['name'], 'x': midPoint};
    });

  }


  private attachListener() {
    // //NODE BEGIN HOVER
    // events.on('row_mouseover', (evt, item) => {
    //   let cell = selectAll('.cell').filter((d:any)=> {return d.y === item}).select('.boundary')
    //     // .classed('tablehovered', function (d: any) {return (d.y === item);});
    //     .classed('tablehovered', true);
    // });
    //
    // //NODE END HOVER
    // events.on('row_mouseout', (evt, item) => {
    //   return selectAll('.boundary').classed('tablehovered', false);
    // });


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

    const self = this;
    const VIEW_CHANGED_EVENT = 'view_changed_event';
    const TABLE_VIS_ROWS_CHANGED_EVENT = 'table_vis_rows_changed_event';

    //
    events.on('redraw_tree', () => {
      self.update();

    });

    events.on(TABLE_VIS_ROWS_CHANGED_EVENT, () => {
      //self.ys = self.tableManager.ys; //regrab the y's
      //  console.log("registered event!!");
      // console.log('calling update from TABLE_VIS_ROWS_CHANGED EVENT')
      self.update();

    });


//

    // //TODO
    // events.on('rows_aggregated', (evt, item) => {
    //   //this.all_the_data.aggregateRows();
    //
    //   // Things that need to happen here:
    //   // change rows to be joined w. the displayRows instead of displayData- then we have to index each time for every attribute.
    //   // update the displayedRows datastructure
    //   //
    //
    //
    // });


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
