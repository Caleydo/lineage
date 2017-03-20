import * as events from 'phovea_core/src/event';
import {AppConstants, ChangeTypes} from './app_constants';
// import * as d3 from 'd3';
import {Config} from './config';

import {select, selection, selectAll, mouse, event} from 'd3-selection';
import {format} from 'd3-format';
import {scaleLinear} from 'd3-scale';
import {max, min, mean} from 'd3-array';
import {axisTop, axisBottom} from 'd3-axis';
import * as range from 'phovea_core/src/range';
import {isNullOrUndefined} from 'util';
import {transition} from 'd3-transition';
import {easeLinear} from 'd3-ease';

import {VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT, VALUE_TYPE_REAL, VALUE_TYPE_STRING} from 'phovea_core/src/datatype';

import {line} from 'd3-shape';

import {
  PRIMARY_SECONDARY_SELECTED,
  COL_ORDER_CHANGED_EVENT,
  POI_SELECTED,
  VIEW_CHANGED_EVENT,
  TABLE_VIS_ROWS_CHANGED_EVENT
} from './tableManager';
import {isUndefined} from 'util';

/**
 * Creates the attribute table view
 */
class attributeTable {

  private $node;

  private width;
  private height;
  private buffer = 10; //pixel dist between columns

  //for entire Table
  private y = scaleLinear();

  //for Cell Renderers
  private yScale = scaleLinear();
  private xScale = scaleLinear();

// RENDERING THINGS
  private table;
  private tableHeader;
  private columnSummaries;

  //private margin = {top: 60, right: 20, bottom: 60, left: 40};

  private tableManager;
  private colData;    // <- everything we need to bind

  private rowHeight = Config.glyphSize * 2.5 - 4;
  private colWidths = {
    idtype: this.rowHeight * 4,
    categorical: this.rowHeight,
    int: this.rowHeight * 4,
    real: this.rowHeight * 4,
    string: this.rowHeight * 5,
    id: this.rowHeight * 4.5,
    dataDensity: this.rowHeight
  };

  private colOffsets;
  private catOffset = 30;

  private idScale = scaleLinear(); //used to size the bars in the first col of the table;

  private margin = Config.margin;

  private rowOrder: Number[]; //keeps track of the order of rows (changes when a column is sorted)

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
    this.width = 1200 - this.margin.left - this.margin.right
    this.height = Config.glyphSize * 3 * this.tableManager.graphTable.nrow //- this.margin.top - this.margin.bottom;


    // let t = transition('t').duration(500).ease(easeLinear);

    //Exctract y values from dict.
    const svg = this.$node.append('svg')
      .classed('tableSVG', true)
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)


//HEADERS
    this.tableHeader = svg.append('g')
      .attr('transform', 'translate(0,' + this.margin.axisTop + ')');

    this.columnSummaries = svg.append('g')
      .attr('transform', 'translate(0,' + (this.margin.top - 70) + ')');

// TABLE

    svg.append('g')
      .attr('transform', 'translate(0,' + this.margin.top + ')')
      .attr('id', 'highlightBarsGroup');


    this.table = svg.append('g')
      .attr('transform', 'translate(0,' + this.margin.top + ')');
  }

  public async initData() {

    this.colOffsets = [0];

    let graphView = await this.tableManager.graphTable;
    let attributeView = await this.tableManager.tableTable;

    let allCols = graphView.cols().concat(attributeView.cols());
    let colOrder = this.tableManager.colOrder;
    let orderedCols = [];

    for (const colName of colOrder) {
      for (const vector of allCols) {
        if (vector.desc.name === colName) {
          orderedCols.push(vector)
        }
      }
    }

    //This are the rows that every col in the table should have;
    let graphIDs = await graphView.col(0).names();

    //Create a dictionary of y value to people
    let y2personDict = {};
    let yDict = this.tableManager.yValues;

    // console.log('yDict', yDict)
    graphIDs.forEach((person) => {
      if (person in yDict) { //may not be if dangling nodes were removed
        //Handle Duplicate Nodes
        yDict[person].forEach((y) => {
          if (y in y2personDict) {
            y2personDict[y].push(person);
          } else {
            y2personDict[y] = [person];
          }
        })
      }
    });

    //Find y indexes of all rows
    let allRows = Object.keys(y2personDict).map(Number);


    //Set height of svg
    this.height = Config.glyphSize * 3 * (max(allRows) - min(allRows) + 1);
    select('.tableSVG').attr('height', this.height + this.margin.top + this.margin.bottom);

    this.y.range([0, this.height]).domain([1, max(allRows)]);
    this.rowOrder = allRows; //will be used to set the y position of each cell/row;


    //set up first column with #People per row.
    let col: any = {};
    col.data = [];
    col.name = ['# People'];
    // col.ys = allRows;
    col.type = 'dataDensity';
    col.stats = [];
    col.isSorted = false;

    //Creating a scale for the rects in the personID col in the table.
    let maxAggregates = 1;
    for (let key of allRows) {
      col.data.push(y2personDict[key].length.toString());
      maxAggregates = max([maxAggregates, y2personDict[key].length])
    }
    this.idScale.domain([1, maxAggregates]);

    col.ids = allRows.map((row) => {
      return y2personDict[row]
    });

    let maxOffset = max(this.colOffsets);
    this.colOffsets.push(maxOffset + this.buffer * 2 + this.colWidths[col.type]);

    //Set first col as the number of people per row. Can't move this col's  position.
    let colDataAccum = [col];

    for (const vector of orderedCols) {
      const data = await vector.data(range.all());
      const type = vector.valuetype.type;
      const name = vector.desc.name;

      // console.log(name,data)


      let peopleIDs = await vector.names()

      if (type === VALUE_TYPE_CATEGORICAL) {
        //Build col offsets array ;
        let allCategories = vector.desc.value.categories.map(c => {
          return c.name
        }); //get categories from index.json def
        let categories;

        //Only need one col for binary categories
        if (allCategories.length < 3) {
          categories = [allCategories[0]];
        } else {
          categories = allCategories;
        }


        if(categories.length > 2){ //Add spacing around multicolumn categories
          let numColsBefore = this.colOffsets.length-1;
          this.colOffsets[numColsBefore] += this.catOffset;
        }

        for (let cat of categories) {

          let col: any = {};
          col.isSorted = false;
          col.ids = allRows.map((row) => {
            return y2personDict[row]
          });

          col.name = name;
          col.category = cat;

          //Ensure there is an element for every person in the graph, even if empty
          col.data = allRows.map((row) => {
            let colData = [];
            let people = y2personDict[row];
            people.map((person) => {
              let ind = peopleIDs.indexOf(person) //find this person in the attribute data
              //If there are only two categories, save both category values in this column. Else, only save the ones that match the category at hand.
              if (ind > -1 && (allCategories.length < 3 || (allCategories.length > 2 && data[ind] === cat))) {
                colData.push(data[ind])
              } else {
                colData.push(undefined);
              }
            });
            return colData;
          });
          col.type = type;

          let maxOffset = max(this.colOffsets);


          this.colOffsets.push(maxOffset + this.buffer * 2 + this.colWidths.categorical);

          colDataAccum.push(col);
        }


        if(categories.length > 2){ //Add spacing around multicolumn categories
          let numColsAfter = this.colOffsets.length-1;
          this.colOffsets[numColsAfter] += this.catOffset;
        }


      } else if (type === VALUE_TYPE_INT || type === VALUE_TYPE_REAL) { //quant

        let maxOffset = max(this.colOffsets);
        this.colOffsets.push(maxOffset + this.buffer + this.colWidths[type]);


        let col: any = {};
        col.isSorted = false;
        col.ids = allRows.map((row) => {
          return y2personDict[row]
        });

        const stats = await vector.stats();
        col.name = name;
        col.data = allRows.map((row) => {
          let colData = [];
          let people = y2personDict[row];
          people.map((person) => {
            const ind = peopleIDs.lastIndexOf(person); //find this person in the attribute data
            if (ind > -1) {
              colData.push(data[ind]);
            } else {
              colData.push(undefined);
            }
          });
          return colData;
        });
        col.vector = vector;
        col.type = type;
        col.stats = stats;
        col.hist = await vector.hist(10);
        colDataAccum.push(col);
      } else if (type === VALUE_TYPE_STRING) {

        const maxOffset = max(this.colOffsets);
        this.colOffsets.push(maxOffset + this.buffer + this.colWidths[type]);

        const col: any = {};
        col.isSorted = false;
        col.ids = allRows.map((row) => {
          return y2personDict[row]
        });

        col.name = name;

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
        col.type = type;
        colDataAccum.push(col);
      } else if (type === 'idtype') {

        const maxOffset = max(this.colOffsets);
        this.colOffsets.push(maxOffset + this.buffer + this.colWidths[type]);

        const col: any = {};
        col.ids = allRows.map((row) => {
          return y2personDict[row]
        });

        col.name = name;

        col.data = allRows.map((row) => {
          let colData = [];
          let people = y2personDict[row];
          people.map((person) => {
            let ind = peopleIDs.indexOf(person) //find this person in the attribute data
            if (ind > -1) {
              colData.push(data[ind].toString())
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

    let y = this.y;


//HEADERS
    //Bind data to the col headers
    let headers = this.tableHeader.selectAll('.header')
      .data(this.colData.map((d, i) => {
        return {
          'name': d.name, 'data': d, 'ind': i, 'type': d.type,
          'max': d.max, 'min': d.min, 'mean': d.mean, 'category': d.category, 'isSorted':d.isSorted
        }
      }), (d) => {
        return d.name
      });

    headers.exit().attr('opacity', 0).remove(); // should remove headers of removed col's

    const headerEnter = headers
      .enter()
      .append('text')
      .classed('header', 'true');

    headers = headerEnter.merge(headers);

    headers
      .text((d: any) => {
        if (d.category)
          return d.name + ' (' + d.category + ')'
        else
          return d.name

      })

      .attr('transform', (d, i) => {
        let offset = this.colOffsets[i] + (this.colWidths[d.type] / 2);
        return (d.type === VALUE_TYPE_CATEGORICAL || d.type === 'dataDensity') ? 'translate(' + offset + ',0) rotate(-30)' : 'translate(' + offset + ',0)';
      })
      .attr('text-anchor', (d) => {
        return (d.type === VALUE_TYPE_CATEGORICAL || d.type === 'dataDensity') ? 'start' : 'middle'
      })


    //Bind data to the col header summaries
    let colSummaries = this.columnSummaries.selectAll('.colSummary')
      .data(this.colData.map((d) => {
        return d
      }), (d) => {
        return d.name
      });

    let colSummariesEnter = colSummaries.enter().append('g').classed('colSummary', true);

    colSummaries.exit().remove();

    colSummaries = colSummariesEnter.merge(colSummaries)


    colSummaries.each(function (cell) {
      if (cell.type === VALUE_TYPE_CATEGORICAL) {
        self.renderCategoricalHeader(select(this), cell);
      }
      else if (cell.type === VALUE_TYPE_INT || cell.type === VALUE_TYPE_REAL) {
        self.renderIntHeaderHist(select(this), cell);
      }
      else if (cell.type === VALUE_TYPE_STRING) {
        self.renderStringHeader(select(this), cell);
      }
      else if (cell.type === 'id' || cell.type === 'idtype') {
        self.addSortingIcons(select(this),cell);
      }
    });


    colSummaries.transition(t)
      .attr('transform', (d, i) => {
        let offset = this.colOffsets[i];
        return 'translate(' + offset + ',0)';
      });


    //create backgroundHighlight Bars
    let highlightBars = select('#highlightBarsGroup').selectAll('.highlightBar')
      .data(this.rowOrder.map(d => {
        return {'y': d}
      }), (d: any) => {
        return d.y
      });

    highlightBars.exit().remove();

    let highlightBarsEnter = highlightBars.enter().append('rect').classed('highlightBar', true);

    highlightBars = highlightBarsEnter.merge(highlightBars)

    highlightBars
      .attr('x', 0)
      .attr('y', (d: any) => {
        return this.y(d.y)
      })
      .attr('width', max(this.colOffsets))
      .attr('height', this.rowHeight)
      .attr('opacity', 0);

// TABLE
    //Bind data to the col groups
    let cols = this.table.selectAll('.dataCols')
      .data(this.colData.map((d, i) => {
        return {
          'name': d.name, 'data': d.data, 'ind': i, 'type': d.type,
          'ids': d.ids, 'stats': d.stats, 'varName': d.name, 'category': d.category, 'vector':d.vector
        }
      }), (d) => {
        return d.varName
      });

    cols.exit().transition(t).attr('opacity', 0).remove(); // should remove on col remove

    const colsEnter = cols.enter()
      .append('g')
      .classed('dataCols', true);


    cols = colsEnter.merge(cols)//;

    //translate columns horizontally to their position;
    cols.transition(t)
      .attr('transform', (d, i) => {
        let offset = this.colOffsets[i];
        return 'translate(' + offset + ',0)';
      });


    //create table Lines

    // //Bind data to the cells
    let rowLines = this.table.selectAll('.rowLine')
      .data(this.rowOrder, (d: any) => {
        return d
      });

    rowLines.exit().remove();

    let rowLinesEnter = rowLines.enter().append('line').classed('rowLine', true);

    rowLines = rowLinesEnter.merge(rowLines)

    selectAll('.rowLine')
      .attr('x1', 0)
      .attr('y1', (d: any) => {
        return this.y(d) + this.rowHeight
      })
      .attr('x2', max(this.colOffsets))
      .attr('y2', (d: any) => {
        return this.y(d) + this.rowHeight
      })
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr('stroke', '#9e9d9b')
      .attr('opacity', .4)

    //Bind data to the cells
    let cells = cols.selectAll('.cell')
      .data((d) => {
        return d.data.map((e, i) => {
          return {
            'id': d.ids[i],
            'name': d.name,
            'data': e,
            'ind':i,
            'type': d.type,
            'stats': d.stats,
            'varName': d.name,
            'category': d.category,
            'vector':d.vector
          }
        })
      }, (d: any) => {
        return +d.id[0]
      });

    cells.exit().remove();

    let cellsEnter = cells.enter()
      .append('g')
      .attr('class', 'cell');

    cells = cellsEnter.merge(cells);

    cellsEnter.attr('opacity', 0);

    cells
      .transition(t)
      .attr('transform', (cell: any,i) => {
        return ('translate(0, ' + y(this.rowOrder[i]) + ' )'); //the x translation is taken care of by the group this cell is nested in.
      });

    cellsEnter.attr('opacity', 1);

    cells.each(function (cell) {
      if (cell.type === VALUE_TYPE_CATEGORICAL) {
        self.renderCategoricalCell(select(this), cell);
      }
      else if (cell.type === VALUE_TYPE_INT || cell.type === VALUE_TYPE_REAL) {
        self.renderIntCell(select(this), cell);
      }
      else if (cell.type === VALUE_TYPE_STRING) {
        self.renderStringCell(select(this), cell);
      }
      else if (cell.type === 'id' || cell.type === 'idtype') {

        self.renderIdCell(select(this), cell);
      }
      else if (cell.type === 'dataDensity') {
        self.renderDataDensCell(select(this), cell);
      }

    });

  selectAll('.sortIcon')
    .on('click',function(d:any){

      selectAll('.sortIcon')
        .classed('sortSelected',false)

      select(this)
        .classed('sortSelected',true)

      // the array to be sorted
      const toSort  = d.data;

       // temporary array holds objects with position and sort-value
      const mapped = toSort.map(function(el, i) {
        if (d.type === VALUE_TYPE_REAL || d.type === VALUE_TYPE_INT){
          return isNaN(+mean(el)) ? { index: i, value:undefined} :  { index: i, value: +mean(el)};
        } else if (d.type === VALUE_TYPE_STRING){
          return (isUndefined(el[0]) || el[0].length === 0) ? { index: i, value: undefined} : { index: i, value: el[0].toLowerCase()};
        } else if (d.type === VALUE_TYPE_CATEGORICAL){
        return { index: i, value: +(el.filter(e=>{return e === d.category}).length /el.length) };
      } else if (d.type == 'idtype'){
        return el.length> 1 ? { index: i, value: undefined} : {index: i, value: +el};
      }

      })

      // console.log(mapped.map(e=>{return e.value}));

      // sorting the mapped array containing the reduced values
      if (select(this).classed('ascending')){
        mapped.sort(function(a, b) {
          if (a.value == b.value) return 0;
          if (b.value == undefined || a.value<b.value) return -1;
          if (a.value == undefined || a.value>b.value) return  1;

        });
      } else{
        mapped.sort(function(a, b) {
          if (a.value == b.value) return 0;
          if (b.value == undefined || a.value<b.value) return 1;
          if (a.value == undefined || a.value>b.value) return -1;
        });
      }


// container for the resulting order
      const sortedIndexes = mapped.map(function(el){
        return el.index;
      });

      // console.log(sortedIndexes)

      const sortedArray = mapped.map(function(el){
        return toSort[el.index];
      });

      // console.log(d, sortedArray)

      cells
        .transition(t)
        .attr('transform',(cell: any) => {
          return ('translate(0, ' + self.y(self.rowOrder[sortedIndexes.indexOf(cell.ind)]) + ' )'); //the x translation is taken care of by the group this cell is nested in.
        });

    })




  }


  /**
   *
   * This function adds the 'sorting' glyphs to the top of the columns in the table.
   *
   * @param element d3 selection of the current column header element.
   * @param cellData the data bound to the column header element being passed in.
   */
  private addSortingIcons(element,cellData){

    element.append('text')
      .attr('font-family', 'FontAwesome')
      .classed('sortIcon',true)
      .classed('descending',true)
      // .attr('font-size', function(d) { return d.size+'em'} )
      .attr('font-size',17)
      .text(function(d) { return '\uf0dd' })
      .attr('y', this.rowHeight * 1.8 + 20)
      .attr('x', (d) =>{return this.colWidths[cellData.type]/2-5})
      // .attr('x', (d) =>{return this.colWidths[cellData.type]/2})
      .attr('text-anchor', 'middle')

    element.append('text')
      .attr('font-family', 'FontAwesome')
      .classed('sortIcon',true)
      .classed('ascending',true)
      // .attr('font-size', function(d) { return d.size+'em'} )
      .attr('font-size',17)
      .text(function(d) { return '\uf0de' })
      .attr('y', this.rowHeight * 1.8 + 30)
      .attr('x', (d) =>{return this.colWidths[cellData.type]/2+5})
      // .attr('x', (d) =>{return this.colWidths[cellData.type]/2})
      .attr('text-anchor', 'middle')

  }

  /**
   *
   * This function renders the column header of String columns in the Table View.
   *
   * @param element d3 selection of the current column header element.
   * @param cellData the data bound to the column header element being passed in.
   */
  private renderStringHeader(element, headerData) {

    element.selectAll('rect').remove();
    element.selectAll('text').remove();
    element.selectAll('circle').remove();

    this.addSortingIcons(element,headerData);
  };


  /**
   *
   * This function renders the column header of String columns in the Table View.
   *
   * @param element d3 selection of the current column header element.
   * @param cellData the data bound to the column header element being passed in.
   */
  private renderIDHeader(element, headerData) {

    element.selectAll('rect').remove();
    element.selectAll('text').remove();
    element.selectAll('circle').remove();

    this.addSortingIcons(element,headerData);
  };




  /**
   *
   * This function renders the column header of Categorical columns in the Table View.
   *
   * @param element d3 selection of the current column header element.
   * @param cellData the data bound to the column header element being passed in.
   */
  private renderCategoricalHeader(element, headerData) {

    let col_width = this.colWidths.categorical;
    let height = this.rowHeight * 1.8;

    let numPositiveValues = headerData.data.map((singleRow) => {
      return singleRow.reduce((a, v) => {
        return v === headerData.category ? a + 1 : a
      }, 0)
    }).reduce((a, v) => {
      return v + a
    }, 0);

    let totalValues = headerData.data.map((singleRow) => {
      return singleRow.length
    }).reduce((a, v) => {
      return a + v
    }, 0);

    let summaryScale = scaleLinear().range([0, height]).domain([0, totalValues])

    if (element.selectAll('.histogram').size() === 0) {
      element.append('rect')
        .classed('histogram', true);

      element.append('text')
        .classed('histogramLabel', true)

      this.addSortingIcons(element,headerData);
    }

    element.select('.histogram')
      .attr('opacity', 0)
      .attr('width', col_width)
      .attr('height', summaryScale(numPositiveValues))
      .attr('y', (height - summaryScale(numPositiveValues)))
      .attr('opacity', 1)
      .attr('fill', () => {
          let attr = this.tableManager.primaryAttribute;
          if (attr)
            if (attr && attr.name === headerData.varName) {
              return attr.color[1]
            } else {
              attr = this.tableManager.secondaryAttribute;
              if (attr && attr.name === headerData.varName) {
                return attr.color[1]
              }
            }
        }
      )

    element.select('.histogramLabel')
      .attr('opacity', 0)
      .text(() => {
        let percentage = (numPositiveValues / totalValues * 100);
        if (percentage < 1) {
          return percentage.toFixed(1) + '%'
        } else {
          return percentage.toFixed(0) + '%'
        }
      })
      .attr('y', (height - summaryScale(numPositiveValues) - 2))
      .attr('opacity', 1)

  };

  /**
   *
   * This function renders the column header of Quantitative columns as Histograms
   *
   * @param element d3 selection of the current column header element.
   * @param cellData the data bound to the column header element being passed in.
   */

  private renderIntHeaderHist(element, headerData) {

    // let t = transition('t').duration(500).ease(easeLinear);

    let col_width = this.colWidths.int;
    let height = this.rowHeight * 1.8;

    let hist = headerData.hist;

    let range = [0, col_width];

    // var data = [],
    // cols = scaleLinear<string,string>().domain([hist.largestFrequency, 0]).range(['#111111', '#999999']),
    let total = hist.validCount,
      binWidth = (range[1] - range[0]) / hist.bins,
      acc = 0;

    let data = [];

    hist.forEach((b, i) => {
      data[i] = {
        v: b,
        acc: acc,
        ratio: b / total,
        range: hist.range(i),
      };
      acc += b;


    });

    let xScale = scaleLinear().range([0, col_width]).domain(hist.valueRange).nice()
    var bin2value = scaleLinear().range(hist.valueRange).domain([0, hist.bins]);
    let yScale = scaleLinear().range([0, height * 0.8]).domain([0, max(data, (d) => {
      return d.v
    })]);


    let xAxis = axisBottom(xScale)
      .tickSize(5)
      .tickValues(xScale.domain())
      .tickFormat(format('.0f'))

    let bars = element.selectAll('.histogram')
      .data(data);

    let barsEnter = bars.enter();

    barsEnter
      .append('rect')
      .classed('histogram', true)

    bars.exit().remove();

    //bars = barsEnter.merge(bars);

    if (element.selectAll('.hist xscale').size() === 0) {

      element.append('text').classed('maxValue', true);
      element.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .classed('hist_xscale', true)
        .call(xAxis)

      this.addSortingIcons(element,headerData);
    }

    element.selectAll('.histogram')
      .attr('width', binWidth * 0.8)
      // .transition(t)
      .attr('height', d => {
        return yScale(d.v)
      })
      .attr('y', d => {
        return (height - yScale(d.v))
      })
      .attr('x', (d, i) => {
        return xScale(bin2value(i))
      })
      .attr('fill', () => {
          let attr = this.tableManager.primaryAttribute;
          if (attr && attr.name === headerData.name) {
            return attr.color
          } else {
            attr = this.tableManager.secondaryAttribute;
            if (attr && attr.name === headerData.name) {
              return attr.color
            }
          }
        }
      )


    //Position tick labels to be 'inside' the axis bounds. avoid overlap
    element.selectAll('.tick').each(function (cell) {
      let xtranslate = +select(this).attr('transform').split('translate(')[1].split(',')[0];
      if (xtranslate === 0) //first label in the axis
        select(this).select('text').style('text-anchor', 'start');
      else { //last label in the axis
        select(this).select('text').style('text-anchor', 'end');
      }
    });

    total = (data[data.length - 1]).acc + (data[data.length - 1]).v
    element.select('.maxValue')
      .text('Total:' + total)

      .attr('x', col_width / 2)
      .attr('y', -height * 0.1)
      .attr('text-anchor', 'middle')



  };


  /**
   *
   * This function renders the content of Categorical Cells in the Table View.
   *
   * @param element d3 selection of the current cell element.
   * @param cellData the data bound to the cell element being passed in.
   */
  private renderCategoricalCell(element, cellData) {
    // let t = transition('t').duration(500).ease(easeLinear);

    let col_width = this.colWidths.categorical;
    let rowHeight = this.rowHeight;

    //Add up the undefined values;
    let numValidValues = cellData.data.reduce((a, v) => {
      return v ? a + 1 : a
    }, 0);
    let numValues = cellData.data.filter((c) => {
      return (c == cellData.category)
    }).length

    element.selectAll('rect').remove(); //Hack. don't know why the height of the rects isn' being updated.

    if (numValidValues < 1) {
      //Add a faint cross out to indicate no data here;
      if (element.selectAll('.cross_out').size() === 0) {
        element
          .append('line')
          .attr('class', 'cross_out')
      }

      element.select('.cross_out')
        .attr('x1', col_width * 0.3)
        .attr('y1', rowHeight / 2)
        .attr('x2', col_width * 0.6)
        .attr('y2', rowHeight / 2)
        .attr('stroke-width', 2)
        .attr('stroke', '#9e9d9b')
        .attr('opacity', .6)

      return;
    }

    if (element.selectAll('.categorical').size() === 0) {
      element
        .append('rect')
        .classed('frame', true)

      element.append('rect')
        .classed(VALUE_TYPE_CATEGORICAL, true)
    }

    this.yScale
      .domain([0, cellData.data.length])
      .range([0, rowHeight]);

    element
      .select('.frame')
      .attr('width', rowHeight)
      .attr('height', rowHeight)
      .attr('y', 0)
      .attr('fill', (d) => {
          let attr = this.tableManager.primaryAttribute;
          if (attr && attr.name === cellData.varName) {
            let ind = attr.categories.indexOf(cellData.data.filter((d) => {
              return d !== undefined
            })[0]);
            if (ind === 0) {
              return attr.color[1]
            } else {
              return attr.color[0]
            }
          } else {
            attr = this.tableManager.secondaryAttribute;
            if (attr && attr.name === cellData.varName) {
              let ind = attr.categories.indexOf(cellData.data.filter((d) => {
                return d !== undefined
              })[0]);
              if (ind === 0) {
                return attr.color[1]
              } else {
                return attr.color[0]
              }
            }
          }
          return '#dfdfdf';
        }
      )


    // .classed('aggregate',()=>{return cellData.data.length >1})

    element
      .select('.categorical')
      .attr('width', rowHeight)
      .attr('height', this.yScale(numValues))
      .attr('y', (rowHeight - this.yScale(numValues)))
      .classed('aggregate', () => {
        return cellData.data.length > 1
      })
      // .transition(t)
      .attr('fill', (d) => {
          let attr;

          let primary = this.tableManager.primaryAttribute;
          let secondary = this.tableManager.secondaryAttribute;
          if (primary && primary.name === cellData.varName) {
            attr = primary;
          } else if (secondary && secondary.name === cellData.varName) {
            attr = secondary;
          }

          if (attr) {
            let ind = attr.categories.indexOf(cellData.data.filter((d) => {
              return d !== undefined
            })[0]);
            if (ind > -1) {
              return attr.color[ind]
            }
          }

        }
      )


    // .classed('affected',()=>{return this.tableManager.affectedState.name === cellData.varName})
  }

  /**
   *
   * This function renders the content of Categorical Cells in the Table View.
   *
   * @param element d3 selection of the current cell element.
   * @param cellData the data bound to the cell element being passed in.
   */
  private renderDataDensCell(element, cellData) {

    let col_width = this.colWidths[cellData.type];
    let rowHeight = this.rowHeight;

    if (element.selectAll('.dataDens').size() === 0) {
      element
        .append('rect')
        .classed('dataDens', true)

      element.append('text')
        .classed('label', true);
    }

    var colorScale = scaleLinear<string,string>().domain(this.idScale.domain()).range(["#c0bfbb", "#373838"]);

    element
      .select('.dataDens')
      .attr('width', col_width)
      .attr('height', rowHeight)
      .attr('y', 0)
      .attr('fill', (d) => {
        return colorScale(cellData.data)
      })

    element
      .select('.label')
      .attr('x', col_width / 2)
      .attr('y', rowHeight * 0.8)
      .text(() => {
        return cellData.data
        // return (+cellData.data >1 ? cellData.data : '')
      })
      .attr('text-anchor', 'middle')

  }


  private ColorLuminance(hex, lum) {

    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;

    // convert to decimal and change luminosity
    var rgb = '#', c, i;
    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i * 2, 2), 16);
      c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
      rgb += ('00' + c).substr(c.length);
    }

    return rgb;
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

    let jitterScale = scaleLinear()
      .domain([0, 1])
      .range([rowHeight * 0.3, rowHeight * 0.7]);

    this.xScale
      .domain(cellData.vector.desc.value.range)
      .range([col_width * 0.1, col_width * 0.9]);

    //No of non-undefined elements in this array
    let numValues = cellData.data.reduce((a, v) => v ? a + 1 : a, 0);


    if (numValues === 0) {
      //Add a faint cross out to indicate no data here;
      if (element.selectAll('.cross_out').size() === 0) {
        element
          .append('line')
          .attr('class', 'cross_out')
      }

      element.select('.cross_out')
        .attr('x1', col_width * 0.3)
        .attr('y1', rowHeight / 2)
        .attr('x2', col_width * 0.6)
        .attr('y2', rowHeight / 2)
        .attr('stroke-width', 2)
        .attr('stroke', '#9e9d9b')
        .attr('opacity', .6)

      return;
    }

    if (element.selectAll('.quant').size() === 0) {
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

    let ellipses = element
      .selectAll('ellipse')
      .data((d) => {
        let cellArray = cellData.data.filter((f) => {
          return !isNullOrUndefined((f))
        })
          .map((e, i) => {
            return {'id': d.id[i], 'name': d.name, 'stats': d.stats, 'value': e}
          })
        return cellArray
      });

    let ellipsesEnter = ellipses.enter()
      .append('ellipse')
      .classed('quant_ellipse', true)

    ellipses = ellipsesEnter.merge(ellipses);

    ellipses.exit().remove(); //Dont'know why these is not removing ellipses. :-/


    element.selectAll('.quant_ellipse')
      .attr('cx',
        (d: any) => {
          return this.xScale(d.value);
          ;
        })
      .attr('cy', () => {
        return numValues > 1 ? jitterScale(Math.random()) : rowHeight / 2
      }) //introduce jitter in the y position for multiple ellipses.
      .attr('rx', radius)
      .attr('ry', radius)
      .attr('fill', () => {
          let attr = this.tableManager.primaryAttribute;
          if (attr && attr.name === cellData.name) {

            return attr.color
          } else {
            attr = this.tableManager.secondaryAttribute;
            if (attr && attr.name === cellData.name) {
              return attr.color
            }
          }
        }
      )


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

    if (numValues === 0) {
      return;
    }

    if (element.selectAll('.string').size() === 0) {
      element
        .append('text')
        .classed('string', true)
    }

    let textLabel;

    if (cellData.data.length === 0 || cellData.data[0] === undefined) {
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
      .attr('dy', rowHeight * 0.9)
      .style('stroke', 'none')

    //set Hover to show entire text
    element
      .on('mouseover', function (d) {
        select(this).select('.string')
          .text(() => {
            if (d.data.length === 1)
              return d.data[0].toLowerCase()
            else
              return 'Multiple'

          })
      })
      .on('mouseout', function (d) {
        let textLabel = cellData.data[0].toLowerCase().slice(0, 12);

        if (cellData.data[0].length > 12) {
          textLabel = textLabel.concat(['...']);
        }

        if (numValues > 1) { //aggregate Row
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

    this.idScale.range([0, col_width * 0.6]);

    let numValues = cellData.data.reduce((a, v) => v ? a + 1 : a, 0);

    if (numValues === 0) {
      return;
    }

    if (numValues > 1 && element.select('.idBar').size() === 0) {
      element
        .append('rect')
        .classed('idBar', true)
    }

    if (numValues === 1) {
      element.select('rect').remove();
    }

    if (element.selectAll('.string').size() === 0) {
      element
        .append('text')
        .classed('string', true)
    }

    let textLabel;
    if (numValues === 1) {

      textLabel = '#' + cellData.data[0];
      element
        .select('.string')
        .text(textLabel)
        .attr('dy', rowHeight * 0.9)
        .attr('dx', 0)
        .style('stroke', 'none')
    } else {

      element
        .select('.string')
        .text('...')
        // .style('font-style', 'bold')
        .attr('dy', rowHeight * 0.9)
        // .attr('dx', this.idScale(numValues) + 2)
        .style('stroke', 'none')

      // element
      //   .select('.idBar')
      //   .attr('width', this.idScale(numValues))
      //   .attr('height', rowHeight)

    }


  }


//
//     // stick on the median
//     quantitative
//       .append('rect') //sneaky line is a rectangle
//       .attr('class', 'medianLine');
//
//     cells
//       .selectAll('.medianLine')
//       .attr('width', 1.2)
//       .attr('height', rowHeight)
//       .attr('fill', 'black')
//       .attr('transform', function (d) {
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
//       //  console.log('REGISTERED CLICK');
//       //update the dataset & re-render
//
//       // const newView = await jankyAData.anniesTestUpdate();
//       // self.update(newView, [1, 2]);
//       // console.log('NEW VIEW!');
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

    const self = this;

    //
    events.on('redraw_tree', () => {
      self.update();

    });

    events.on(TABLE_VIS_ROWS_CHANGED_EVENT, () => {
      self.update();

    });

    events.on(PRIMARY_SECONDARY_SELECTED, (evt, item) => {
      self.render();
    });

    events.on(COL_ORDER_CHANGED_EVENT, (evt, item) => {
      self.update();
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
