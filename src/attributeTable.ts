import * as events from 'phovea_core/src/event';
import { AppConstants, ChangeTypes } from './app_constants';
// import * as d3 from 'd3';
import { Config } from './config';

import { select, selection, selectAll, mouse, event } from 'd3-selection';
import { drag } from 'd3-drag';
import { format } from 'd3-format';
import { scaleLinear, scaleOrdinal, schemeCategory20c } from 'd3-scale';
import { max, min, mean } from 'd3-array';
import { axisTop, axisBottom } from 'd3-axis';
import * as range from 'phovea_core/src/range';
import { isNullOrUndefined } from 'util';
import { transition } from 'd3-transition';
import { easeLinear } from 'd3-ease';
import { curveBasis, curveLinear } from 'd3-shape';

import Histogram from './Histogram';

import { VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT, VALUE_TYPE_REAL, VALUE_TYPE_STRING } from 'phovea_core/src/datatype';

import { line } from 'd3-shape';

import * as _ from 'underscore';

import {
  PRIMARY_SELECTED,
  COL_ORDER_CHANGED_EVENT,
  POI_SELECTED,
  UPDATE_TABLE_EVENT,
  VIEW_CHANGED_EVENT,
  TABLE_VIS_ROWS_CHANGED_EVENT
} from './tableManager';
import { isUndefined } from 'util';


enum sortedState {
  Ascending,
  Descending,
  Unsorted
}



/**
 * Creates the attribute table view
 */
class AttributeTable {

  private $node;

  private width;
  private height;
  private buffer = 13; //pixel dist between columns

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

  public colData;    // <- everything we need to bind
  private firstCol; //bind separetly on the left side of the slope chart.

  private allCols; //array of col vectors (needed for re-ordering, does not contain dadta)

  private rowHeight = Config.glyphSize * 2.5 - 4;
  private headerHeight = this.rowHeight * 2;
  private colWidths = {
    idtype: this.rowHeight * 4,
    categorical: this.rowHeight,
    int: this.rowHeight * 4,
    real: this.rowHeight * 4,
    string: this.rowHeight * 5,
    id: this.rowHeight * 4.5,
    dataDensity: this.rowHeight
  };

  //Used to store col widths if user resizes a col;
  private customColWidths = {};


  //store histogram objects for tableHeaders
  private histograms: Histogram[]=[];

  private lineFunction = line<any>()
    .x((d: any) => {
      return d.x;
    }).y((d: any) => {
      return d.y;
    })
    .curve(curveBasis);


  private colOffsets;
  private catOffset = 30;

  //Keeps track of whether the table is sorted by a certain attribute;
  private sortAttribute = { state: sortedState.Unsorted, data: undefined, name: undefined };

  private idScale = scaleLinear(); //used to size the bars in the first col of the table;

  private colorScale = ['#969696', '#9e9ac8', '#74c476', '#fd8d3c', '#9ecae1'];

  private margin = Config.margin;

  private rowOrder: number[]; //keeps track of the order of rows (changes when a column is sorted)
  private sortedRowOrder: number[]; //keeps track of the sorted order of rows (defined when a column is sorted)

  private t2 = transition('t2').duration(600).ease(easeLinear);

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

    // private colorScale = scaleOrdinal(schemeCategory20c);


    this.build(); //builds the DOM

    await this.update();

    this.attachListener();

    // return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  public async update() {
    await this.initData();
    this.render();
  }

  public getColData(){
    console.log(this)
    return this.colData;
  }

  /**
   * Build the basic DOM elements and binds the change function
   */
  private async build() {

    //Height is a function of the current view and so is set in initData();
    this.width = 1200 - this.margin.left - this.margin.right;
    this.height = Config.glyphSize * 3 * this.tableManager.graphTable.nrow; //- this.margin.top - this.margin.bottom;


    // this.$node.append('nav').attr('class', 'navbar navbar-expand-lg navbar-light bg-light')
    //   .append('div').attr('id', 'tableNav');

    // this.$node.select('#tableNav')
    //   .append('a').attr('class', 'navbar-brand')
    //   .html('Attribute Table');

    const dropdownMenu = select('.navbar-collapse')
      .append('ul').attr('class', 'nav navbar-nav navbar-left').attr('id', 'attributeMenu');

    select('.navbar-collapse')
      .append('ul').attr('class', 'nav navbar-nav').attr('id', 'Export')
      .append('li')
      .append('a')
      .attr('class', 'btn-link')
      .attr('id', 'exportIDs')
      .attr('role', 'button')
      .html('Export')
      .on('click', async () => {

        let csvContent = 'data:text/csv;charset=utf-8,';

        csvContent += 'RelativeID,LabID\r\n'; // add carriage return

        let labIDVector = await this.tableManager.getAttributeVector('LabID', false);
        if (!labIDVector) {
          labIDVector = await this.tableManager.getAttributeVector('labid', false);
        }
        const labIDData = await labIDVector.data();
        const personIDs = await labIDVector.names();

        //Export csv file with selected ids.
        selectAll('.checkbox').filter('.checked').each((element: any, ind) => {

          element.id.map((personID) => {
            const personInd = personIDs.indexOf(personID);
            csvContent += personID + ',' + labIDData[personInd] + '\r\n'; // add carriage return
          });
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'lineage_export.csv');
        document.body.appendChild(link); // Required for FF

        link.click();
      });

    select('.navbar-collapse')
      .append('ul').attr('class', 'nav navbar-nav navbar-left').attr('id', 'Sort by Tree')
      .append('li')
      .append('a')
      .attr('class', 'btn-link')
      .attr('role', 'button')
      .html('Sort by Tree')
      .on('click', (d) => {

        const maxWidth = max(this.colOffsets) + 50;
        this.$node.select('#headers')
          .attr('width', maxWidth);

        this.$node.select('.tableSVG')
          .attr('width', maxWidth);

        const animated = (this.sortAttribute.state !== sortedState.Unsorted) ? (d) => d.transition(this.t2) : (d) => d;

        this.sortAttribute.state = sortedState.Unsorted;

        selectAll('.sortIcon')
          .classed('sortSelected', false);

          animated(select('#col2'))
          .style('width',(550+Config.collapseSlopeChartWidth)+'px');

        animated(select('#columns').selectAll('.cell'))
          .attr('transform', (cell: any) => {
            return ('translate(0, ' + this.y(this.rowOrder[cell.ind]) + ' )');
          });

        //translate tableGroup to make room for the slope lines.
        animated(select('#tableGroup'))
          // .transition(t2)
          .attr('transform', () => {
            return ('translate(0,0)');
          });

        animated(select('#headerGroup'))
          // .transition(t2)
          .attr('transform', () => {
            return ('translate(0,80)');
          });

        animated(select('#colSummaries'))
          // .transition(t2)
          .attr('transform', () => {
            return ('translate(0 ,15)');
          });

        animated(select('#tableGroup').selectAll('.highlightBar'))
          // .transition(t2)
          .attr('y', (d: any) => {
            return this.y(this.rowOrder[d.i]);
          });

        this.updateSlopeLines(true, false); //animate = true, expanded = false;



      });

    const list = dropdownMenu.append('li').attr('class', 'dropdown');

    list
      .append('a')
      .attr('class', 'dropdown-toggle')
      .attr('data-toggle', 'dropdown')
      .attr('role', 'button')
      .html('Table Attributes')
      .append('span')
      .attr('class', 'caret');

    const menu = list.append('ul').attr('class', 'dropdown-menu');

    menu.append('h4').attr('class', 'dropdown-header')
      .style('font-size', '16px')
      .html('Demographic Attributes');

    let colNames = this.tableManager.getDemographicColumns().map((col) => {
      return col.desc.name;
    });

    let menuItems = menu.selectAll('.demoAttr')
      .data(colNames);
    menuItems = menuItems.enter()
      .append('li')
      .append('a')
      .attr('class', 'dropdown-item demoAttr')
      .classed('active', (d) => { return this.tableManager.colOrder.includes(d); })
      .html((d:any) => { return d; })
      .merge(menuItems);

    menu.append('li').attr('class', 'divider').attr('role', 'separator');
    menu.append('h4').attr('class', 'dropdown-header').style('font-size', '16px')
      .html('Clinical Attributes');
    colNames = this.tableManager.getAttrColumns().map((col) => {
      return col.desc.name;
    });

    menuItems = menu.selectAll('.clinicalAttr').data(colNames);
    menuItems = menuItems.enter()
      .append('li')
      .append('a')
      .attr('class', 'dropdown-item clinicalAttr')
      .classed('active', (d) => { return this.tableManager.colOrder.includes(d); })
      .html((d:any) => { return d; })
      .merge(menuItems);

    const self = this;
    selectAll('.dropdown-item').on('mousedown', function (d) {
      event.preventDefault();
      //Check if is selected, if so remove from table.
      if (self.tableManager.colOrder.includes(d)) {
        self.tableManager.colOrder.splice(self.tableManager.colOrder.indexOf(d), 1);
        select(this).classed('active', false);
      } else {
        const lastIndex = self.tableManager.colOrder.length;
        self.tableManager.colOrder.splice(lastIndex, 0, d);
        select(this).classed('active', true);
      }
      events.fire(COL_ORDER_CHANGED_EVENT);

    });

    const tableDiv = this.$node.append('div')
      .attr('id', 'tableDiv');

    const headerSVG = tableDiv.append('div').attr('id', 'tableDiv1')
      .append('svg')
      .attr('width', 1500)
      .attr('height', 195)
      // .attr('viewBox','0 0 1200 195')
      .attr('id', 'headers');

    headerSVG.append('g')
      .attr('transform', 'translate(0,80)')
      .attr('id', 'headerGroup');

    //Exctract y values from dict.
    const svg = tableDiv.append('div').attr('id', 'tableDiv2').append('svg')
      .classed('tableSVG', true)
      // .viewBox('0 0 ' + this.width + ' ' + (this.height + this.margin.top + this.margin.bottom))
      .attr('width', this.width + this.margin.left + this.margin.right);
    // .attr('height', this.height + this.margin.top + this.margin.bottom);

    //Link scrolling of the table and graph divs as well as the table and it's header
    select('#tableDiv2').on('scroll', () => {
      select('#treeMenu').select('.menu').remove(); //remove any open menus
      document.getElementById('graphDiv').scrollTop = document.getElementById('tableDiv2').scrollTop;
      document.getElementById('tableDiv1').scrollLeft = document.getElementById('tableDiv2').scrollLeft;
    });

    select('#tableDiv1').on('scroll', () => {
      select('#treeMenu').select('.menu').remove(); //remove any open menus
      document.getElementById('tableDiv2').scrollLeft = document.getElementById('tableDiv1').scrollLeft;
    });

    //Link scrolling of the table and graph divs
    select('#graphDiv').on('scroll', () => {
      if (this.sortAttribute.state !== sortedState.Unsorted) {
        this.lazyScroll(false, true); //only call this if there is sorting going on;
      }
      document.getElementById('tableDiv2').scrollTop = document.getElementById('graphDiv').scrollTop;

      // this.updateSlopeLines();
    });

    // TABLE (except for slope Chart and first col on the left of the slope chart)
    svg.append('g')
      .attr('id', 'marginGroup')
      .attr('transform', 'translate(0 ,' + this.margin.top + ')');

    select('#marginGroup').append('g')
      .attr('id', 'tableGroup');

    //HEADERS
    this.$node.select('#headerGroup').append('g')
      .attr('transform', 'translate(0, 0)')
      .attr('id', 'tableHeaders');

    //Column Summaries
    this.$node.select('#headerGroup').append('g')
      .attr('transform', 'translate(0, 15)')
      .attr('id', 'colSummaries');

    //Columns (except for the first)
    select('#tableGroup').append('g')
      // .attr('transform', 'translate(0, ' + this.margin.top + ')')
      .attr('id', 'columns');

    //Highlight Bars
    select('#columns').append('g')
      // .attr('transform', 'translate(0, ' + this.margin.top + ')')
      .attr('id', 'highlightBars');

    //SlopeChart and first col
    // select('#marginGroup').append('g')
    //   // .attr('transform', 'translate(0, ' + this.margin.top + ')')
    //   .attr('id', 'slopeChart');

    // select('#slopeChart').append('g')
    //   .attr('id', 'firstCol');

    // select('#slopeChart').append('g')
    //   .attr('id', 'slopeLines');


    //Add button to slopeChart Div that says 'revert to Tree Order'
    const button = select('#headers')
      .append('g')
      .attr('transform', 'translate(635,70)')
      .attr('id', 'revertTreeOrder')
      .attr('visibility', 'hidden')
      .append('svg');

    button.append('rect')
      .attr('width', 120)
      .attr('height', 25)
      .attr('rx', 10)
      .attr('ry', 20)
      .attr('fill', '#b4b3b1')
      .attr('y', 0)
      .attr('opacity', .1)
      .on('click', (d) => {

        this.sortAttribute.state = sortedState.Unsorted;

        selectAll('.sortIcon')
          .classed('sortSelected', false);

        select('#revertTreeOrder')
          .attr('visibility', 'hidden');

        // const t2 = transition('test').duration(600).ease(easeLinear);

        select('#columns').selectAll('.cell')
          // .transition(t2)
          .attr('transform', (cell: any) => {
            return ('translate(0, ' + this.y(this.rowOrder[cell.ind]) + ' )');
          });

        //translate tableGroup to make room for the slope lines.
        select('#tableGroup')
          // .transition(t2)
          .attr('transform', () => {
            return ('translate(' + Config.collapseSlopeChartWidth + ' ,0)');
          });

        select('#headerGroup')
          // .transition(t2)
          .attr('transform', () => {
            return ('translate(' + Config.collapseSlopeChartWidth + ' ,95)');
          });



        // select('#tableHeaders')
        //   .transition(t2)
        //   .attr('transform', () => {
        //     return ('translate(0,0)');
        //   });

        select('#colSummaries')
          // .transition(t2)
          .attr('transform', () => {
            return ('translate(0 ,15)');
          });


        selectAll('.slopeLine')
          // .transition(t2)
          .attr('d', (d: any) => {
            return this.slopeChart({ y: d.y, ind: d.ind, width: Config.collapseSlopeChartWidth });
          });

        select('#tableGroup').selectAll('.highlightBar')
          // .transition(t2)
          .attr('y', (d: any) => {
            return this.y(this.rowOrder[d.i]);
          });

      });

    button.append('text')
      .classed('histogramLabel', true)
      .attr('x', 60)
      .attr('y', 15)
      .attr('fill', '#757472')
      .text('Sort by Tree')
      .attr('text-anchor', 'middle');

    // this.updateSlopeLines(false);


  }

  private updateSlopeLines(animate = false, expanded = false) {
    const animated = animate ? (d) => d.transition(this.t2) : (d) => d;

    const divHeight = document.getElementById('graphDiv').clientHeight;
    const scrollOffset = document.getElementById('graphDiv').scrollTop;


    selectAll('.slopeIcon')
      .text((d: any, i) => {

        const start = this.y(d.y);
        const end = (this.sortedRowOrder ? this.y(this.rowOrder[this.sortedRowOrder.indexOf(d.ind)]) : this.y(this.rowOrder[d.ind]));


        if (this.sortAttribute.state === sortedState.Unsorted) {
          return '';
        };

        if (start >= scrollOffset && start <= divHeight + scrollOffset) {

          if (end >= divHeight + scrollOffset) {
            return '\uf149';
          } else if (end < scrollOffset) {
            return '\uf148';
          };
        };

        return ''; //for all other cases, return 0;
      })
      // .attr('x', 15)
      .attr('x', this.colWidths.dataDensity + this.buffer + this.colWidths.dataDensity) //to make room for checkboxes;
      .attr('y', (d: any) => {

        const start = this.y(d.y);
        const end = (this.sortedRowOrder ? this.y(this.rowOrder[this.sortedRowOrder.indexOf(d.ind)]) : this.y(this.rowOrder[d.ind]));

        if (start >= scrollOffset && start <= divHeight + scrollOffset) {
          if (end >= divHeight + scrollOffset) {
            return this.y(d.y) + this.rowHeight;
          } else if (end < scrollOffset) {
            return this.y(d.y) + this.rowHeight / 2;
          };
        };
      })
      .on('click', (d: any) => {
        const end = this.y(this.rowOrder[this.sortedRowOrder.indexOf(d.ind)]);
        document.getElementById('graphDiv').scrollTop = end;
      });

    animated(selectAll('.slopeLine'))
      .attr('d', (d: any) => {
        //don't bother drawing slope lines if the graph is unsorted.
        if (this.sortAttribute.state === sortedState.Unsorted) {
          return '';
        } else {
          let ind = d.ind;
          let width = Config.collapseSlopeChartWidth;
          if (expanded) {
            ind = this.sortedRowOrder.indexOf(d.ind);
            width = Config.slopeChartWidth;
          };
          return this.slopeChart({ y: d.y, ind, width });
        }
      });
};

  public async initData() {

    this.colOffsets = [0];
    const graphView = await this.tableManager.graphTable;
    const attributeView = await this.tableManager.tableTable;

    const allCols = graphView.cols().concat(attributeView.cols());
    const colOrder = this.tableManager.colOrder;
    const orderedCols = [];

    this.allCols = allCols;

    for (const colName of colOrder) {
      for (const vector of allCols) {
        if (vector.desc.name === colName) {
          orderedCols.push(vector);
        }
      }
    }

    //This are the rows that every col in the table should have;
    const graphIDs = await graphView.col(0).names();
    const kindredIDs = await graphView.col(1).data();

    const idVector = await graphView.col(0).ids();
    const uniqueIDs = idVector.dim(0).asList().map((i) => { return i.toString(); });

    // const ids = uniqueIDs.map((id,i)=> {return id+'_'+kindredIDs[i];});
    const ids = graphIDs.map((id, i) => { return id + '_' + kindredIDs[i]; });

    //Create a dictionary of y value to people
    const y2personDict = {};
    const yDict = this.tableManager.yValues;

    let maxRow=0;
    //Find max value in yDict
    Object.keys(yDict).forEach((person)=> {
      maxRow = yDict[person][0] > maxRow ? yDict[person][0] : maxRow;
    });

    ids.forEach((person, ind) => {
      if (person in yDict) {
        //Handle Duplicate Nodes
        yDict[person].forEach((y) => {
          if (y in y2personDict) {
            y2personDict[y].push(person);

          } else {
            y2personDict[y] = [person];
          }
        });
      }
    });



    //Find y indexes of all rows
    const allRows = Object.keys(y2personDict).map(Number);
    //Set height and width of svg
    this.height = Config.glyphSize * 4 * (maxRow);
    // select('.tableSVG').attr('viewBox','0 0 ' + this.width + ' ' + (this.height + this.margin.top + this.margin.bottom))

    // select('.tableSVG').attr('height', this.height);
    select('.tableSVG').attr('height',document.getElementById('genealogyTree').getBoundingClientRect().height);
    select('.tableSVG').attr('width', this.tableManager.colOrder.length * 100);

    this.y.range([0, this.height * .7]).domain([1, maxRow]);
    this.rowOrder = allRows; //will be used to set the y position of each cell/row;


    //set up first column with #People per row.
    const col: any = {};
    col.data = [];
    col.name = ['# People'];
    col.type = 'dataDensity';
    col.stats = [];
    col.isSorted = false;

    //Creating a scale for the rects in the personID col in the table.
    let maxAggregates = 1;
    for (const key of allRows) {
      //FIXME Don't know why we're getting duplicates here.
      const value = Array.from(new Set(y2personDict[key])).length;
      col.data.push(value);
      maxAggregates = max([maxAggregates, y2personDict[key].length]);
    }
    this.idScale.domain([1, maxAggregates]);


    col.ids = allRows.map((row) => {
      return y2personDict[row].map((d) => { return d.split('_')[0]; }); //only first part is the id
    });

    this.firstCol = [col];

    const colDataAccum = [];

    let allPromises = [];
    orderedCols.forEach((vector, index) => {
      allPromises = allPromises.concat([
        vector.data(),
        vector.names(),
        vector.ids(),
        vector.stats().catch(() => { return null; }),
        vector.hist(10).catch(() => { return null; })
      ]);
    });
    const finishedPromises = await Promise.all(allPromises);

    // for (const vector of orderedCols) {
    orderedCols.forEach((vector, index) => {
      const data = finishedPromises[index * 5];
      const peopleIDs = finishedPromises[index * 5 + 1];
      const phoveaIDs = finishedPromises[index * 5 + 2].dim(0).asList().map((i) => { return i.toString(); });

      const type = vector.valuetype.type;
      const name = vector.desc.name;

      if (type === VALUE_TYPE_CATEGORICAL) {
        //Build col offsets array ;
        const allCategories = vector.desc.value.categories.map((c) => {
          return c.name;
        }); //get categories from index.json def
        let categories;

        //Only need one col for binary categories
        if (allCategories.length < 3) {
          if (allCategories.find((d) => {
            return d === 'Y';
          })) {
            categories = ['Y'];
          } else if (allCategories.find((d) => {
            return d === 'True';
          })) {
            categories = ['True'];
          } else if (allCategories.find((d) => {
            return d === 'F';
          })) {
            categories = ['F'];
          } else {
            categories = [allCategories[0]];
          }

        } else {
          categories = allCategories;
        }

        for (const cat of categories) {

          const col: any = {};
          col.isSorted = false;
          col.ids = allRows.map((row) => {
            return y2personDict[row].map((d) => { return d.split('_')[0]; }); //only first part is the id
          });

          col.name = name;
          col.category = cat;
          col.allCategories = allCategories;

          //Ensure there is an element for every person in the graph, even if empty
          col.data = allRows.map((row) => {
            const colData = [];
            //Only return unique personIDs.
            //TODO find out why there are multiple instances of a person id.
            const people = y2personDict[row];
            people.map((person) => {
              const ind = (col.name === 'KindredID' ? ids.indexOf(person) : peopleIDs.indexOf(person.split('_')[0])); //find this person in the attribute data
              //If there are only two categories, save both category values in this column. Else, only save the ones that match the category at hand.
              if (ind > -1 && (allCategories.length < 3 || ind > -1 && (allCategories.length > 2 && data[ind] === cat))) {
                colData.push(data[ind]);
              } else {
                colData.push(undefined);
              }
            });
            return colData;
          });
          col.type = type;

          const maxOffset = max(this.colOffsets);

          this.colOffsets.push(maxOffset + this.buffer * 2 + this.colWidths[type]);

          colDataAccum.push(col);

        }

      } else if (type === VALUE_TYPE_INT || type === VALUE_TYPE_REAL) { //quant

        const col: any = {};
        col.isSorted = false;
        col.ids = allRows.map((row) => {
          return y2personDict[row].map((d) => { return d.split('_')[0]; }); //only first part is the id
        });

        const stats = finishedPromises[5 * index + 3];
        col.name = name;
        col.data = allRows.map((row) => {
          const colData = [];
          const people = y2personDict[row];
          // .filter(function (value, index, self) {
          //   return self.indexOf(value) === index;
          // });
          people.map((person) => {
            const ind = (col.name === 'KindredID' ? ids.lastIndexOf(person) : peopleIDs.lastIndexOf(person.split('_')[0])); //find this person in the attribute data
            // const ind = ids.lastIndexOf(person); //find this person in the attribute data
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
        col.hist = finishedPromises[5 * index + 4];
        // col.hist = await vector.hist(10);

        colDataAccum.push(col);
      } else if (type === VALUE_TYPE_STRING) {

        // const maxOffset = max(this.colOffsets);
        // this.colOffsets.push(maxOffset + this.buffer + this.colWidths[type]);

        const col: any = {};
        col.isSorted = false;
        col.ids = allRows.map((row) => {
          return y2personDict[row].map((d) => { return d.split('_')[0]; }); //only first part is the id
        });

        col.name = name;

        col.data = allRows.map((row) => {
          const colData = [];
          const people = y2personDict[row];
          // .filter(function (value, index, self) {
          //   return self.indexOf(value.id) === index;
          // });
          people.map((person) => {
            const ind = (col.name === 'KindredID' ? ids.lastIndexOf(person) : peopleIDs.lastIndexOf(person.split('_')[0])); //find this person in the attribute data
            // const ind = ids.lastIndexOf(person); //find this person in the attribute data
            if (ind > -1) {
              colData.push(data[ind]);
            } else {
              colData.push(undefined);
            }
          });
          return colData;
        });
        col.type = type;
        colDataAccum.push(col);

      } else if (type === 'idtype') {

        const col: any = {};
        col.ids = allRows.map((row) => {
          return y2personDict[row].map((d) => { return d.split('_')[0]; }); //only first part is the id
          // .filter(function (value, index, self) {
          //   return self.indexOf(value) === index;
          // });
        });

        col.name = name;


        col.data = allRows.map((row) => {
          const colData = [];
          const people = y2personDict[row];
          people.map((person, i) => {
            const ind = (col.name === 'KindredID' ? ids.lastIndexOf(person) : peopleIDs.lastIndexOf(person.split('_')[0])); //find this person in the attribute data
            if (ind > -1) {
              if (isUndefined(data[ind])) {
                console.log('problem');
                console.log(name, data.size(), peopleIDs.size());
              }
              colData.push(data[ind].toString());
            } else {
              colData.push(undefined);
            }
          });
          return colData;
        });
        col.ys = allRows;
        col.type = type;
        colDataAccum.push(col);
      }


    });
    this.colData = colDataAccum;

    this.calculateOffset();


  }

  private calculateOffset() {
    this.colOffsets = [this.colWidths.dataDensity + this.buffer];

    const colOrder = this.tableManager.colOrder;
    const orderedCols = [];

    for (const colName of colOrder) {
      for (const vector of this.allCols) {
        if (vector.desc.name === colName) {
          orderedCols.push(vector);
        }
      }
    }

    orderedCols.forEach((vector, index) => {

      const type = vector.valuetype.type;
      const name = vector.desc.name;

      let maxOffset = max(this.colOffsets);
      if (type === VALUE_TYPE_CATEGORICAL) {

        //Build col offsets array ;
        const allCategories = vector.desc.value.categories.map((c) => {
          return c.name;
        }); //get categories from index.json def
        let categories;


        //Only need one col for binary categories
        if (allCategories.length < 3) {
          if (allCategories.find((d) => {
            return d === 'Y';
          })) {
            categories = ['Y'];
          } else if (allCategories.find((d) => {
            return d === 'True';
          })) {
            categories = ['True'];
          } else if (allCategories.find((d) => {
            return d === 'F';
          })) {
            categories = ['F'];
          } else {
            categories = [allCategories[0]];
          }

        } else {
          categories = allCategories;
        }

        for (const cat of categories) {
          maxOffset = max(this.colOffsets);
          if (this.customColWidths[name]) {
            this.colOffsets.push(maxOffset + this.buffer * 2 + this.customColWidths[name]);
          } else {
            this.colOffsets.push(maxOffset + this.buffer * 2 + this.colWidths[type]);
          }
        };
      } else {
        // const maxOffset = max(this.colOffsets);
        if (this.customColWidths[name]) {
          this.colOffsets.push(maxOffset + this.buffer + this.customColWidths[name]);
        } else {
          this.colOffsets.push(maxOffset + this.buffer + this.colWidths[type]);
        }
      }


    });
  };

  //To be used on drag interactions so that render is not called too many times
  private lazyRender = _.throttle(this.render, 10);

  //function that removes spaces and periods to be used as ids and selectors. Also includes categories for categorical data.
  private deriveID(d) {
    return (d.type === 'categorical' ?
    (d.name.replace(/ /g, '_').replace(/\./g, '')+ '_'
    + d.category.replace(/ /g, '_').replace(/\(/g, '').replace(/\)/g, '')) :
     (d.name.replace(/ /g, '_').replace(/\./g, '')));
  }

  private lazyScroll = _.throttle(this.updateSlopeLines, 300);
  //renders the DOM elements
  private render() {

    // const t = transition('t').ease(easeLinear);
    // let t= this.tableManager.t;
    const self = this;

    const y = this.y;

    //HEADERS
    //Bind data to the col headers
    let headers = select('#tableHeaders').selectAll('.header')
      .data(this.colData.map((d: any, i) => {
        return {
          'name': d.name, 'data': d, 'ind': i, 'type': d.type,
          'max': d.max, 'min': d.min, 'mean': d.mean, 'allCategories': d.allCategories, 'category': d.category, 'isSorted': d.isSorted
        };
      }), (d: any) => {
        return d.name;
      });

    headers.exit().attr('opacity', 0).remove(); // should remove headers of removed col's

    const headerEnter = headers
      .enter()
      .append('g')
      .classed('header',true);


      headerEnter
      .append('rect')
      .attr('class','titleBackground')
      .attr('height',20)
      .on('dblclick',((d)=> {
        //reset this col width.
        this.customColWidths[d.name] = this.colWidths[d.type];
        this.update();
      }));

      headerEnter.append('text')
      .classed('headerTitle', true);


    headers = headerEnter.merge(headers);

    headers.select('.titleBackground')
    .attr('width',(d)=> {
      const colWidth = this.customColWidths[d.name] || this.colWidths[d.type];
      return d.type === 'categorical' ?  colWidth + d.name.length*7 : colWidth;})
    .attr('transform', (d, i) => {
      return 'translate(0,-20)';
    });

    headers
    .attr('id', (d) => {return this.deriveID(d) + '_header'; })
    .attr('transform', (d, i) => {
      const offset = this.colOffsets[i];
      return d.type === VALUE_TYPE_CATEGORICAL ? 'translate(' + offset + ',0) rotate(-40)' : 'translate(' + offset + ',0)';
    });

    headers
      .select('.headerTitle')
      .text((d: any) => {
        if (d.category && d.category.toLowerCase() !== 'true' && d.category.toLowerCase() !== 'y') {
          return d.name + ' (' + d.category + ')';
        } else if (d.category) {
          return d.name;
        } else {
          return d.name.slice(0, 8);
        };

      })
      .attr('transform', (d, i) => {
        const offset = ((this.customColWidths[d.name] ||this.colWidths[d.type]) / 2);
        return d.type === VALUE_TYPE_CATEGORICAL ? 'translate(' + offset + ',0)' : 'translate(' + offset + ',0)';
      })
      .attr('text-anchor', (d) => {
        return d.type === VALUE_TYPE_CATEGORICAL ? 'start' : 'middle';
        // return (d.type === VALUE_TYPE_CATEGORICAL || d.type === 'dataDensity' || d.name.length>10) ? 'start' : 'middle';
      });

    headers
      .on('mouseover', (d) => {
        this.addTooltip('header', d);
      })
      .on('mouseout', (d) => {
         select('.menu').remove();
      });


    //Bind data to the col header summaries
    let colSummaries = select('#colSummaries').selectAll('.colSummary')
      .data(this.colData.map((d) => {
        return d;
      }), (d: any) => {
        return d.name;
      });

    const colSummariesEnter = colSummaries.enter()
      .append('g').classed('colSummary', true)
      .attr('id', (d) => { return this.deriveID(d) + '_summary'; });

    colSummariesEnter
      .append('rect')
      .attr('class', 'backgroundRect')
      .attr('x', -5)
      .attr('y', -11)
      .on('mouseover', function (d) {
        select(this).classed('hoverRect', true);
        selectAll('.resizeBar')
          .filter((dd) => { return dd === d; })
          .attr('stroke', '#909090');
      })
      .on('mouseout', function (d) {
        selectAll('.hoverRect').classed('hoverRect', false);
        selectAll('.resizeBar')
          .attr('stroke', 'white');
      });

    colSummariesEnter
      .append('line')
      .classed('resizeBar', true)
      .on('mouseover', function (d) {
        select(this).attr('stroke', '#909090');
        selectAll('.backgroundRect')
          .filter((dd) => { return dd === d; })
          .classed('hoverRect', true);
        // .style('fill','#e9e9e9');
      })
      .on('mouseout', function (d) {
        select(this).attr('stroke', 'white');
        selectAll('.backgroundRect')
          .classed('.hoverRect', false);
      });


    // const resizeStarted = (d,i)=> {
    // };

    const resized = (d, i) => {
      const delta = event.x - this.colWidths[d.type];

      this.customColWidths[d.name] = this.colWidths[d.type] + delta;
      this.calculateOffset();
      this.lazyRender();

      selectAll('.resizeBar')
        .filter((dd) => { return dd === d; })
        .attr('stroke', '#909090');

      selectAll('.backgroundRect')
        .filter((dd) => { return dd === d; })
        .classed('hoverRect', true);


    };
    const resizeEnded = (d, i) => {
      selectAll('.resizeBar')
        .attr('stroke', 'white');

      selectAll('.hoverRect')
        .classed('hoverRect', false);

    };


    selectAll('.resizeBar')
      .call(drag()
        // .on('start', resizeStarted)
        .on('drag', resized)
        .on('end', resizeEnded));

    colSummaries.exit().remove();

    colSummaries = colSummariesEnter.merge(colSummaries);

    // TABLE
    //Bind data to the col groups
    let cols = select('#columns').selectAll('.dataCols')
      .data(this.colData.map((d, i) => {
        return {
          'name': d.name, 'data': d.data, 'ind': i, 'type': d.type,
          'ids': d.ids, 'stats': d.stats, 'varName': d.name, 'category': d.category, 'vector': d.vector
        };
      }), (d: any) => {
        return d.varName;
      });

    cols.exit().remove(); // should remove on col remove

    const colsEnter = cols.enter()
      .append('g')
      .classed('dataCols', true)
      .attr('id', (d) => { return this.deriveID(d) + '_data'; });
    //Append background rect
    colsEnter.append('rect')
      .classed('starRect', true);




    cols = colsEnter.merge(cols);//;

    cols.select('.starRect')
    .attr('width', (d) => {
      const width  = this.customColWidths[d.name] || this.colWidths[d.type] ;
      return (width+ 10);
    })
    .attr('height', this.y.range()[1] + 40)
    .attr('x', -5)
    .attr('y', -this.buffer + 3)
    .attr('class', (d) => { return 'starRect_' + this.deriveID(d); })
    .classed('starRect', true)
    .attr('opacity', ((d) => {
      const header = select('#' + this.deriveID(d) + '_header');
      return (!header.empty() && header.classed('star')) || (this.tableManager.affectedState.name === d.name)
       ? .2 : 0;
    }));

    //translate columns horizontally to their position;
    cols
      // .transition(t)
      .attr('transform', (d, i) => {
        const offset = this.colOffsets[i];
        return 'translate(' + offset + ',0)';
      });

    //Add frame for highlighting starred cols


    // Implement Drag and Drop
    let offset, titleOffset, titleTransform, currIndex, currPos;

    const dragstarted = (d, i) => {

      selectAll('.colSummary').attr('opacity', .3);
      selectAll('.dataCols').attr('opacity', .3);
      select('#' + this.deriveID(d) + '_summary').attr('opacity', 1);
      select('#' + this.deriveID(d) + '_data').attr('opacity', 1);

      //Escape any periods with backslash
      const header = select('#' + this.deriveID(d) + '_header');

      const currTransform = header.attr('transform').split('translate(')[1].split(',');
      const xpos = +currTransform[0];
      titleTransform = currTransform[1];

      titleOffset = event.x - xpos;

      offset = event.x - this.colOffsets[i];
      currIndex = i;

    };

    const updateRender = (closestIndex, currIndex, d) => {

      //Remove current col from colOrder
      this.tableManager.colOrder.splice(currIndex, 1);
      //Reinsert in correct order
      this.tableManager.colOrder.splice(closestIndex, 0, d.name);

      //Remove current colData from colDAta
      const colData = this.colData.splice(currIndex, 1);

      //Reinsert in correct order
      this.colData.splice(closestIndex, 0, colData[0]);

      currIndex = closestIndex;

      //Calculate new col offests;
      this.calculateOffset();

      //Re render table
      this.render();

    };

    const lazyUpdate = _.throttle(updateRender, 100);


    const dragged = (d, i) => {

      //Select col summary for this col
      const summary = select('#' + this.deriveID(d) + '_summary');
      const dataCol = select('#' + this.deriveID(d) + '_data');
      const header = select('#' + this.deriveID(d) + '_header');

      currPos = event.x - offset;

      summary.attr('transform', 'translate(' + currPos + ',0)');
      dataCol.attr('transform', 'translate(' + currPos + ',0)');
      header.attr('transform', 'translate(' + (event.x - titleOffset) + ',' + titleTransform);

      //Find closest column
      const closest = this.colOffsets.reduce(function (prev, curr) {
        return (Math.abs(curr - currPos) < Math.abs(prev - currPos) ? curr : prev);
      });

      const closestIndex = this.colOffsets.indexOf(closest);

      if (currIndex !== closestIndex) {

        //Remove current col from colOrder
        this.tableManager.colOrder.splice(currIndex, 1);
        //Reinsert in correct order
        this.tableManager.colOrder.splice(closestIndex, 0, d.name);

        //Remove current colData from colDAta
        const colData = this.colData.splice(currIndex, 1);

        //Reinsert in correct order
        this.colData.splice(closestIndex, 0, colData[0]);

        currIndex = closestIndex;

        //Calculate new col offests;
        this.calculateOffset();

        //Re render table
        this.render();

      };

    };



    const lazyDrag = _.throttle(dragged, 300);

    const dragended = (d, i) => {

      selectAll('.colSummary').attr('opacity', 1);
      selectAll('.dataCols').attr('opacity', 1);

      this.render();

    };

    headers
      .call(drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // selectAll('.backgroundRect')
    // .call(drag()
    // .on('start', dragstarted)
    // .on('drag', lazyDrag)
    // .on('end', dragended));

    colSummaries.each(function (cell) {
      if (cell.type === VALUE_TYPE_CATEGORICAL) {
        self.renderCategoricalHeader(select(this), cell);
      } else if (cell.type === VALUE_TYPE_INT || cell.type === VALUE_TYPE_REAL) {
        self.renderIntHeaderHist(select(this), cell);
      } else if (cell.type === VALUE_TYPE_STRING) {
        self.renderStringHeader(select(this), cell);
      } else if (cell.type === 'id' || cell.type === 'idtype') {
        self.renderIDHeader(select(this), cell);
      }
    });


    colSummaries
      // .transition(t)
      .attr('transform', (d, i) => {
        const offset = this.colOffsets[i];
        return 'translate(' + offset + ',0)';
      });


    //create backgroundHighlight Bars
    let highlightBars = this.$node.select('#highlightBars').selectAll('.highlightBar')
      .data(this.rowOrder.map((d, i) => {
        return { 'y': d, 'i': i };
      }), (d: any) => {
        return d.y;
      });

    highlightBars.exit().remove();

    const highlightBarsEnter = highlightBars.enter().append('rect').classed('highlightBar', true);

    highlightBars = highlightBarsEnter.merge(highlightBars);

    highlightBars
      .attr('x', 0)
      .attr('y', (d: any) => {
        return this.y(this.rowOrder[d.i]);
      })
      .attr('width', max(this.colOffsets))
      .attr('height', this.rowHeight)
      .attr('opacity', 0)
    // .attr('fill', 'transparent')
    .on('mouseover', this.highlightRow)
    .on('mouseout', this.clearHighlight)
    .on('click', this.clickHighlight);

    //create slope Lines
    // //Bind data to the cells
    let slopeLines = select('#slopeLines').selectAll('.slopeLine')
      .data(this.rowOrder
        .map((d: any, i) => {
          return { y: d, ind: i, width: Config.collapseSlopeChartWidth };
        })
      , (d: any) => {
        return d.y;
      });

    slopeLines.exit().remove();

    const slopeLinesEnter = slopeLines.enter().append('path');


    slopeLines = slopeLinesEnter.merge(slopeLines);



    slopeLines
      // .append('path')
      .classed('slopeLine', true)
      .attr('d', (d: any) => {
        return this.slopeChart(d);
      });

    let slopeIcons = select('#slopeLines').selectAll('.slopeIcon')
      .data(this.rowOrder
        .map((d: any, i) => {
          return { y: d, ind: i, width: Config.collapseSlopeChartWidth };
        })
      , (d: any) => {
        return d.y;
      });

    slopeIcons.exit().remove();

    const slopeIconsEnter = slopeIcons.enter().append('text').classed('slopeIcon', true);


    slopeIcons = slopeIconsEnter.merge(slopeIcons);

    //Bind data to the first col group
    let firstCol = select('#slopeChart').selectAll('.dataCols')
      .data(this.firstCol.map((d, i) => {
        const out = {
          'name': d.name, 'data': d.data, 'ind': i, 'type': d.type,
          'ids': d.ids, 'stats': d.stats, 'varName': d.name, 'category': d.category, 'vector': d.vector
        };
        return out;
      }), (d: any) => {
        return d.varName;
      });

    firstCol.exit().attr('opacity', 0).remove(); // should remove on col remove

    const firstColEnter = firstCol.enter()
      .append('g')
      .classed('dataCols', true);


    firstCol = firstColEnter.merge(firstCol);//;

    //Bind data to the cells
    let firstCells = firstCol.selectAll('.cell')
      .data((d) => {
        return d.data.map((e, i) => {
          return {
            'id': d.ids[i],
            'name': d.name,
            'data': e,
            'ind': i,
            'type': d.type,
            'stats': d.stats,
            'varName': d.name,
            'category': d.category,
            'vector': d.vector
          };
        });
      }, (d: any) => {
        return d.id[0];
      });

    firstCells.exit().remove();

    const firstCellsEnter = firstCells.enter()
      .append('g')
      .attr('class', 'cell');

    firstCells = firstCellsEnter.merge(firstCells);

    firstCellsEnter.attr('opacity', 0);

    firstCells
      .attr('transform', (cell: any, i) => {
        return ('translate(0, ' + y(this.rowOrder[i]) + ' )'); //the x translation is taken care of by the group this cell is nested in.
      });

    firstCellsEnter.attr('opacity', 1);

    firstCells.each(function (cell) {
      self.renderDataDensCell(select(this), cell);
    });


    //create table Lines
    // //Bind data to the cells
    let rowLines = select('#columns').selectAll('.rowLine')
      .data(Array.apply(null, {length: this.y.range()[1]}).map(function(value, index){
        return index + 1;
      }), (d: any) => {
        return d;
      });

    rowLines.exit().remove();

    const rowLinesEnter = rowLines.enter().append('line').classed('rowLine', true);

    rowLines = rowLinesEnter.merge(rowLines);

    selectAll('.rowLine')
      .attr('x1', 0)
      .attr('y1', (d: any) => {
        return this.y(d) + this.rowHeight;
      })
      .attr('x2', max(this.colOffsets))
      .attr('y2', (d: any) => {
        return this.y(d) + this.rowHeight;
      });


    //Bind data to the cells
    let cells = cols.selectAll('.cell')
      .data((d) => {
        return d.data.map((e, i) => {
          return {
            'y': this.rowOrder[i],
            'id': d.ids[i],
            'name': d.name,
            'data': e,
            'ind': i,
            'type': d.type,
            'stats': d.stats,
            'varName': d.name,
            'category': d.category,
            'vector': d.vector
          };
        });
      }, (d: any) => {
        return d.id[0];
      });

    const cellsEnter = cells.enter()
      .append('g')
      .attr('class', 'cell')
      .on('mouseover', this.highlightRow)
      .on('mouseout', this.clearHighlight)
      .on('click', this.clickHighlight);

    selectAll('.cell')
      .on('mouseover', (cellData) => {
      this.highlightRow(cellData);
      this.addTooltip('cell', cellData);
    })
      .on('mouseout', (d)=> {
        this.clearHighlight();
        select('.menu').remove();
      })
      .on('click', this.clickHighlight);

    cells.exit().remove();

    cells = cellsEnter.merge(cells);

    cellsEnter.attr('opacity', 0);

    cells
      .attr('transform', (cell: any, i) => {
        return (this.rowOrder[i] ? 'translate(0, ' + y(this.rowOrder[i]) + ' )' : ''); //the x translation is taken care of by the group this cell is nested in.
      });

    cellsEnter.attr('opacity', 1);

    cells.each(function (cell) {

      if (cell.type === VALUE_TYPE_CATEGORICAL) {
        self.renderCategoricalCell(select(this), cell);
      } else if (cell.type === VALUE_TYPE_INT || cell.type === VALUE_TYPE_REAL) {
        self.renderIntCell(select(this), cell);
      } else if (cell.type === VALUE_TYPE_STRING) {
        self.renderStringCell(select(this), cell);
      } else if (cell.name === 'KindredID') {
        self.renderFamilyIDCell(select(this), cell);
      } else if (cell.type === 'id' || cell.type === 'idtype') {

        self.renderIdCell(select(this), cell);
      } else if (cell.type === 'dataDensity') {
        self.renderDataDensCell(select(this), cell);
      }

    });


    // If a sortAttribute has been set, sort by that attribute
    if (this.sortAttribute.state !== sortedState.Unsorted) {
      this.sortRows(this.sortAttribute.data, this.sortAttribute.state, false);
    }

    this.updateSlopeLines(false, this.sortAttribute.state !== sortedState.Unsorted);

    //recalculate size of svgs:
    const maxWidth = max(this.colOffsets) + 50 + (this.sortAttribute.state === sortedState.Unsorted ? 0 : Config.slopeChartWidth);
    this.$node.select('#headers')
      .attr('width', maxWidth);

    this.$node.select('.tableSVG')
      .attr('width', maxWidth);


  }

  private clickHighlight(d: any) {
    // event.stopPropagation();

    if (event.defaultPrevented) { return; } // dragged

    const wasSelected = selectAll('.highlightBar').filter((e: any) => {
      return e.y === d.y || e.y === Math.round(d.y);
    }).classed('selected');


    //'Unselect all other background bars if ctrl was not pressed
    if (!event.metaKey) {
      selectAll('.slopeLine').classed('clickedSlope', false);
      selectAll('.highlightBar').classed('selected', false);
    }

    selectAll('.slopeLine').filter((e: any) => {
      return e.y === d.y || e.y === Math.round(d.y);
    }).classed('clickedSlope', function () {
      return (!wasSelected);
    });

    selectAll('.highlightBar').filter((e: any) => {
      return e.y === d.y || e.y === Math.round(d.y);
    }).classed('selected', function () {
      return (!wasSelected);
    });
  }

  private clearHighlight() {
    // event.stopPropagation();
    selectAll('.slopeLine').classed('selectedSlope', false);
    //Hide all the highlightBars
    selectAll('.highlightBar').attr('opacity', 0);
  }

  private highlightRow(d) {
    // event.stopPropagation();
    function selected(e: any) {
      let returnValue = false;
      //Highlight the current row in the graph and table
      if (e.y === Math.round(d.y)) {
        returnValue = true;
      }

      return returnValue;
    }

    selectAll('.slopeLine').classed('selectedSlope', false);

    selectAll('.slopeLine').filter((e: any) => {
      return e.y === Math.round(d.y);
    }).classed('selectedSlope', true);

    //Set opacity of corresponding highlightBar
    selectAll('.highlightBar').filter(selected).attr('opacity', .2);
  }

  /**
   *
   * This function sorts the table by the current Attribute
   *
   * @param d data to be sorted
   * @param ascending, boolean flag set to true if sort order is ascending
   */
  private sortRows(d: any, sortOrder: sortedState, animate: boolean) {

    const maxWidth = max(this.colOffsets) + 50 + Config.slopeChartWidth;
    this.$node.select('#headers')
      .attr('width', maxWidth);

    this.$node.select('.tableSVG')
      .attr('width', maxWidth);

    const animated = animate ? (d) => d.transition(this.t2) : (d) => d;


    //get data from colData array
    const toSort = this.colData.find((c) => {
      return c.name === d.name;
    }).data;

    // temporary array holds objects with position and sort-value
    const mapped = toSort.map(function (el, i) {
      if (d.type === VALUE_TYPE_REAL || d.type === VALUE_TYPE_INT) {
        return isNaN(+mean(el)) ? { index: i, value: undefined } : { index: i, value: +mean(el) };
      } else if (d.type === VALUE_TYPE_STRING) {
        return (isUndefined(el[0]) || el[0].length === 0) ? { index: i, value: undefined } : {
          index: i,
          value: el[0].toLowerCase()
        };
      } else if (d.type === VALUE_TYPE_CATEGORICAL) {
        return {
          index: i, value: +(el.filter((e) => {
            return e === d.category;
          }).length / el.length)
        };
      } else if (d.type === 'idtype') {
        const equalValues = el.reduce(function (a, b) {
          return (a === b) ? a : NaN;
        }); //check for array that has all equal values in an aggregate (such as KindredId);
        return isNaN(equalValues) ? { index: i, value: undefined } : { index: i, value: equalValues };
      }

    });

    const equalValues = mapped.reduce(function (a, b) {
      return (a.value === b.value) ? a : NaN;
    }); //check for array that has all equal values in an aggregate (such as KindredId);

    //All values are the same, no sorting needed;
    if (!isNaN(equalValues.value)) {
      return;
    }

    // select('#revertTreeOrder')
    //   // .transition(t2.transition().duration(500).ease(easeLinear))
    //   .attr('visibility', 'visible');

    // sorting the mapped array containing the reduced values
    if (sortOrder === sortedState.Ascending) {
      mapped.sort(function (a, b) {
        if (a.value === b.value) {
          if (a.index === b.index) { return 0; }
          if (a.index < b.index) { return -1; }
          if (a.index > b.index) { return 1; }
        }
        if (b.value === undefined || a.value < b.value) { return -1; }
        if (a.value === undefined || a.value > b.value) { return 1; }

      });
    } else {
      mapped.sort(function (a, b) {
        if (a.value === b.value) {
          if (a.index === b.index) { return 0; }
          if (a.index < b.index) { return -1; }
          if (a.index > b.index) { return 1; }
        }
        if (a.value < b.value) { return 1; }
        if (a.value === undefined || b.value === undefined || a.value > b.value) { return -1; }
      });
    }

    // container for the resulting order
    const sortedIndexes = mapped.map(function (el) {
      return el.index;
    });

    const sortedArray = mapped.map(function (el) {
      return toSort[el.index];
    });

    //need to save as class variable to later decide which slope lines are visible.
    this.sortedRowOrder = sortedIndexes;

    // let cellSelection = select('#columns').selectAll('.cell');

    animated(select('#col2'))
    .style('width',(550+Config.slopeChartWidth)+'px');


    animated(select('#columns').selectAll('.cell'))
      // .transition(t2)
      .attr('transform', (cell: any) => {
        return ('translate(0, ' + this.y(this.rowOrder[sortedIndexes.indexOf(cell.ind)]) + ' )'); //the x translation is taken care of by the group this cell is nested in.
      });

    d.ind = sortedIndexes.indexOf(d.ind);

    //translate tableGroup to make room for the slope lines.
    animated(select('#tableGroup'))
      // .transition(t2)
      .attr('transform', (cell: any) => {
        return ('translate(0,0)');
      });


    animated(select('#headerGroup'))
      // .transition(t2)
      .attr('transform', (cell: any) => {
        return ('translate(0,80)');
      });

    animated(select('#colSummaries'))
      //  .transition(t2)
      .attr('transform', (cell: any) => {
        return ('translate(0,15)');
      });


    //Not needed since the slopeLines are updated within this.updateSlopeLines;
    // animated(selectAll('.slopeLine'))
    //   //  .transition(t2)
    //   .attr('d', (d: any) => {
    //     return this.slopeChart({y: d.y, ind: sortedIndexes.indexOf(d.ind), width: Config.slopeChartWidth});
    //   });

    animated(select('#tableGroup'))
      .selectAll('.highlightBar')
      //  .transition(t2)
      .attr('y', (d: any) => {
        return this.y(this.rowOrder[sortedIndexes.indexOf(d.i)]);
      });

  }

  /**
   *
   * This function adds the 'sorting' glyphs to the top of the columns in the table.
   *
   * @param element d3 selection of the current column header element.
   * @param cellData the data bound to the column header element being passed in.
   */
  private addSortingIcons(element, cellData) {

    //Check for custom column width value, if none, use default
    const colWidth = this.customColWidths[cellData.name] || this.colWidths[cellData.type];

    let icon = element.selectAll('.descending')
      .data([cellData]);


    let iconEnter = icon.enter()
      .append('text')
      .classed('sortIcon', true)
      .classed('icon', true)
      .classed('descending', true);

    icon = iconEnter.merge(icon);

    icon
      .text('\uf0dd')
      .attr('y', this.rowHeight * 1.8 + 24)
      .attr('x', (d) => {
        return colWidth / 2 - 5;
      });

    icon = element.selectAll('.ascending')
      .data([cellData]);

    iconEnter = icon.enter()
      .append('text')
      .classed('sortIcon', true)
      .classed('icon', true)
      .classed('ascending', true);

    icon
    .attr('y', this.rowHeight * 1.8 + 24)
    .attr('x', (d) => {
      return colWidth / 2 - 5;
    });

    //Add 'remove col icon'
    icon.enter().append('text')
      .classed('icon', true)
      .classed('deleteIcon', true)
      .text(' \uf057');

    element.select('.deleteIcon')
      .attr('y', this.rowHeight * 2 + 40)
      .attr('x', (d) => {
        return colWidth / 2 - 8;
      });


    //append menu ellipsis
    icon.enter().append('text')
      .classed('icon', true)
      .classed('menuIcon', true)
      .text('\uf141');

    element.select('.menuIcon')
      .attr('y', this.rowHeight * 2 + 40)
      .attr('x', (d) => {
        return colWidth / 2 + 5;
      })
      .on('click', ((d) => { this.addMenu(d); }));

    icon = iconEnter.merge(icon);

    icon
      .text('\uf0de')
      .attr('y', this.rowHeight * 1.8 + 30)
      .attr('x', (d) => {
        return colWidth / 2 + 5;
      });

    const self = this;

    selectAll('.sortIcon')
      .on('click', function (d) {

        // Set 'sortAttribute'
        if (select(this).classed('ascending')) {
          self.sortAttribute.state = sortedState.Ascending;
        } else {
          self.sortAttribute.state = sortedState.Descending;
        }
        self.sortAttribute.data = d;

        selectAll('.sortIcon')
          .classed('sortSelected', false);

        select(this)
          .classed('sortSelected', true);

        self.sortRows(d, self.sortAttribute.state, true);

        self.updateSlopeLines(true, true);

      });

    selectAll('.deleteIcon')
      .on('click', (d: any) => {
        this.tableManager.colOrder.splice(this.tableManager.colOrder.indexOf(d.name), 1);
        this.tableManager.removeStar(d.name);

        //Update menu
        selectAll('.dropdown-item').filter((item: any) => { return item === d.name; })
          .classed('active', false);
        events.fire(COL_ORDER_CHANGED_EVENT);
      });


  }

  private addMenu(d) {

    select('#treeMenu').select('.menu').remove();

    event.stopPropagation();
    let option1, option2;
    if (d.type === 'categorical' && (d.category.toLowerCase() === 'true' || d.category.toLowerCase() === 'y')) {
      option1 = 'Show ' + d.name;
      option2 = 'Show NOT ' + d.name;
    } else if (d.type === 'categorical' && d.allCategories.length < 3) {
      option1 = 'Show ' + d.allCategories[0];
      option2 = 'Show ' + d.allCategories[1];
    } else if (d.type === 'categorical' && d.allCategories.length > 3) {
      option1 = 'Show ' + d.category;
      option2 = 'Show NOT ' + d.category;
    }

    const menuLabels = (d.type === 'categorical' ? [option1, option2, 'Set as POI', 'Set as Primary Attribute', 'Star'] : ['Set as POI', 'Set as Primary Attribute',  'Star']);
    const menuObjects = menuLabels.map((m)=> {return {label:m,attr:d.name};});

    const container = document.getElementById('app');
    const coordinates = mouse(container);

    let menuWidth = 90; //default Value. Will update
    const menuItemHeight = 25;
    const menuHeight = 15 + menuLabels.length * menuItemHeight;

    const menu = select('#treeMenu')
      .append('svg')
      .attr('class', 'menu')
      .attr('height', menuHeight)
      .append('g')
      .attr('transform', 'translate(0,10)');

    select('.menu').select('g')
      .append('g')
      .classed('tooltipTriangle', true).append('rect');

    let menuItems = menu.selectAll('text').data(menuObjects);

    const menuItemsEnter = menuItems.enter()
      .append('g').attr('class', 'menuItem');

    menuItemsEnter.append('rect').classed('menuItemBackground', true);
    menuItemsEnter.append('text').classed('icon', true);
    menuItemsEnter.append('text').classed('label', true);
    menuItemsEnter.append('line').classed('menuDivider', true);

    menuItems = menuItemsEnter.merge(menuItems);

    menuItems
      .select('.label')
      .attr('x', 10)
      .attr('y', menuItemHeight / 2 + 3)
      .text((d: any) => d.label)
      .classed('tooltipTitle', true)
      .on('click', (d: any) => {
        select('#treeMenu').select('.menu').remove();
      });

    let longestLabelLength = 0;

    menu.selectAll('.menuItem').each(function (element: any, i) {
      const textNode = <SVGTSpanElement>select(this).select('.label').node();
      const labelWidth = textNode.getComputedTextLength();
      longestLabelLength = (labelWidth > longestLabelLength) ? labelWidth : longestLabelLength;
    });

    menuWidth = longestLabelLength + 50;

    select('.menu').attr('transform', 'translate(' + (coordinates[0] - menuWidth / 2) + ',' + (coordinates[1] + 3) + ')');

    select('.tooltipTriangle')
      .attr('transform', 'translate(' + (menuWidth / 2 - 3) + ',-2)')
      .select('rect')
      .attr('width', 10)
      .attr('fill', 'rgb(232, 108, 55)')
      .attr('height', 10)
      .attr('opacity', 1)
      .attr('transform', 'rotate(45)')
      .attr('transform-origin', 'center');


    menuItems.select('.menuItemBackground')
      .attr('width', menuWidth)
      .attr('fill', '#f7f7f7')
      .attr('height', menuItemHeight)
      .attr('opacity', 1)
      .on('click', (e) => {
        if (e.label.includes('Star')) {
          const header = select('#' + this.deriveID(d) + '_header');
          const starBackground = select('.starRect_' + this.deriveID(d));
          header.classed('star', !header.classed('star'));

          if (header.classed('star')) {
            this.tableManager.addStar(d.name, d.category);
            starBackground.attr('opacity', .2);
          } else {
            this.tableManager.removeStar(d.name);
            starBackground.attr('opacity', 0);
          };


        } else if (e.label.includes('POI')) {

          this.tableManager.setAffectedState(d.name).then((obj) => {

                    //find histogram with this name and set the brush extent
                    const hist = this.histograms.filter((h) => { return h.attrName === d.name; })[0];
                    if (obj.threshold !== undefined) { //setAffectedState returned a default value. Was not set by user brushing or selecting bar;

                      //New POI has been set, remove all other brush and rect selection interactions;
                      this.histograms.map((hist) => { hist.clearInteraction(); });
                      if (hist && obj.type === VALUE_TYPE_CATEGORICAL) {
                        hist.setSelected(obj.threshold);
                      } else if (hist && obj.type === VALUE_TYPE_REAL || obj.type === VALUE_TYPE_INT) {
                        hist.setBrush(obj.threshold);
                      }

                    }

          });


          selectAll('.icon').filter('.tooltipTitle').classed('poi', (ee: any) => {
            return ee.label.includes('POI') && this.tableManager.affectedState.name === d.name;
          });


        } else if (e.label.includes('Primary')) {

          const currentMenuIcon = selectAll('.icon').filter('.tooltipTitle')
          .filter((ee:any)=> {return ee.label.includes('Primary') && this.tableManager.primaryAttribute && this.tableManager.primaryAttribute.name === d.name;});

          const isSelected = !currentMenuIcon.empty() && currentMenuIcon.classed('primaryAttribute');

          const currentMenuLabel = selectAll('.label').filter('.tooltipTitle')
          .filter((ee:any)=> {return ee.label.includes('Primary') && ee.attr === d.name;});


          if (isSelected) {
            events.fire('primarySelected',{'name':undefined});
            currentMenuIcon.classed('primaryAttribute',false);
            currentMenuLabel.text('Set as Primary Attribute');
            return;
          } else {
            events.fire('primarySelected', { 'name': d.name});
          }


          selectAll('.icon').filter('.tooltipTitle').classed('primaryAttribute', (ee: any) => {
            return ee.label.includes('Primary') && this.tableManager.primaryAttribute && this.tableManager.primaryAttribute.name === d.name;
          });

        }
        select('#treeMenu').select('.menu').remove();
      });

    menuItems.attr('transform', ((d, i) => { return 'translate(0,' + (5 + i * menuItemHeight) + ')'; }));

    menuItems
      .select('.icon')
      .attr('x', menuWidth - 20)
      .attr('y', menuItemHeight / 2 + 5)
      .attr('class', 'icon')
      .text((d: any, i) => {
        if (i === 0 && d.label.includes('Show')) {
          return '\uf111';
        } else if (i === 1 && d.label.includes('Show')) {
          return '\uf22d';
        } else if (d.label.includes('POI')) {
          return '\uf007';
        } else if (d.label.includes('Attribute')) {
          return '\uf012';
        } else if (d.label.includes('Star')) {
          return '\uf005';
        } else {
          return '';
        }


      })
      .classed('tooltipTitle', true)
      .classed('star', (e) => {
        const header = select('#' + this.deriveID(d) + '_header');
        return e.label.includes('Star') && header.classed('star');
      })
      .classed('poi', (e) => {
        return e.label.includes('POI') && this.tableManager.affectedState.name === d.name;
      })
      .classed('primaryAttribute', (e) => {
        return e.label.includes('Primary') && this.tableManager.primaryAttribute && this.tableManager.primaryAttribute.name === d.name;
      });

    menuItems
      .select('.menuDivider')
      .attr('x1', 0)
      .attr('x2', menuWidth)
      .attr('y1', menuItemHeight)
      .attr('y2', menuItemHeight)
      .attr('stroke-width', '1px')
      .attr('stroke', 'white');

    select('#treeMenu')
      .attr('width', menuWidth);

    menu.append('line')
      .attr('x1', 0)
      .attr('x2', menuWidth)
      .attr('y1', 5)
      .attr('y2', 5)
      .attr('stroke-width', '5px')
      .attr('stroke', '#e86c37');
  }

  /**
   *
   * This function renders the column header of String columns in the Table View.
   *
   * @param element d3 selection of the current column header element.
   * @param cellData the data bound to the column header element being passed in.
   */
  private renderStringHeader(element, headerData) {

    //Check for custom column width value, if none, use default
    const colWidth = this.customColWidths[headerData.name] || this.colWidths.string;
    // const colWidth = this.colWidths.string;
    const height = this.headerHeight;

    element.select('.backgroundRect')
      .attr('width', colWidth + 10)
      .attr('height', height + 11);

    element.select('.resizeBar')
      .attr('x1', colWidth + this.buffer / 2)
      .attr('x2', colWidth + this.buffer / 2)
      .attr('y1', -11)
      .attr('y2', height)
      .attr('stroke-width', '4px')
      .attr('stroke', 'white');

    // element.selectAll('rect').remove();
    // element.selectAll('text').remove();
    // element.selectAll('circle').remove();

    this.addSortingIcons(element, headerData);


  };


  /**
   *
   * This function renders the column header of String columns in the Table View.
   *
   * @param element d3 selection of the current column header element.
   * @param cellData the data bound to the column header element being passed in.
   */
  private renderIDHeader(element, headerData) {

    //Check for custom column width value, if none, use default
    const colWidth = this.customColWidths[headerData.name] || this.colWidths.id;

    // const colWidth = this.colWidths.id;
    const height = this.headerHeight;

    element.select('.backgroundRect')
      .attr('width', colWidth + 10)
      .attr('height', height + 11);

    element.select('.resizeBar')
      .attr('x1', colWidth + this.buffer / 2)
      .attr('x2', colWidth + this.buffer / 2)
      .attr('y1', -11)
      .attr('y2', height)
      .attr('stroke-width', '4px')
      .attr('stroke', 'white');

    // element.selectAll('rect').remove();
    element.selectAll('text').remove();
    element.selectAll('circle').remove();

    this.addSortingIcons(element, headerData);


  };


  /**
   *
   * This function renders the column header of Categorical columns in the Table View.
   *
   * @param element d3 selection of the current column header element.
   * @param cellData the data bound to the column header element being passed in.
   */
  private renderCategoricalHeader(element, headerData) {

    //There can't be custom colWidths for categorical data
    const colWidth = this.colWidths.categorical;
    const height = this.headerHeight;

    element.select('.backgroundRect')
      .attr('width', colWidth + 10)
      .attr('height', height + 11);

    const numPositiveValues = headerData.data.map((singleRow) => {
      return singleRow.reduce((a, v) => {
        return v === headerData.category ? a + 1 : a;
      }, 0);
    }).reduce((a, v) => {
      return v + a;
    }, 0);

    const totalValues = headerData.data.map((singleRow) => {
      return singleRow.length;
    }).reduce((a, v) => {
      return a + v;
    }, 0);

    const summaryScale = scaleLinear().range([0, height]).domain([0, totalValues]);

    if (element.selectAll('.histogram').size() === 0) {
      element.append('rect')
        .classed('histogram', true);

      element.append('text')
        .classed('histogramLabel', true);

      element.append('span')
        .attr('class', 'oi oi-menu');

    }

    this.addSortingIcons(element, headerData);

    const self = this;

    element.select('.histogram')
      .attr('opacity', 0)
      .attr('width', colWidth)
      .attr('height', summaryScale(numPositiveValues))
      .attr('y', (height - summaryScale(numPositiveValues)))
      .attr('opacity', 1)
      .attr('fill', () => {
        let attr = this.tableManager.primaryAttribute;
        if (attr && attr.name === headerData.name) {
          const index = attr.categories.indexOf(headerData.category);
          return attr.color[index];
        } else {
          attr = this.tableManager.affectedState;
          if (attr) {
            const poi = attr; attr = attr.attributeInfo;
            if (attr.name === headerData.name) {
              if (poi.isAffected(headerData.category)) {
                const index = attr.categories.indexOf(headerData.category);
                return attr.color[index];
              }

            }
          }
        }
      }
      )
      .on('mouseenter', (d) => this.addTooltip('header', d))
      .on('mouseleave', (d) => {
        select('#tooltipMenu').select('.menu').remove();
      });

    element.select('.histogramLabel')
      .attr('opacity', 0)
      .text(() => {
        const percentage = (numPositiveValues / totalValues * 100);
        if (percentage < 1) {
          return percentage.toFixed(1) + '%';
        } else {
          return percentage.toFixed(0) + '%';
        }
      })
      .attr('y', (height - summaryScale(numPositiveValues) - 2))
      .attr('opacity', 1);

  };

  /**
   *
   * This function renders the column header of Quantitative columns as Histograms
   *
   * @param element d3 selection of the current column header element.
   * @param cellData the data bound to the column header element being passed in.
   */

  private async renderIntHeaderHist(element, headerData) {

    //Check for custom column width value, if none, use default
    const colWidth = this.customColWidths[headerData.name] || this.colWidths.int;

    const height = this.headerHeight;

    element.select('.backgroundRect')
      .attr('width', colWidth + 10)
      .attr('height', height + 11);

    element.select('.resizeBar')
      .attr('x1', colWidth + this.buffer / 2)
      .attr('x2', colWidth + this.buffer / 2)
      .attr('y1', -11)
      .attr('y2', height)
      .attr('stroke-width', '4px')
      .attr('stroke', 'white');

      this.addSortingIcons(element, headerData);

      //Check if histogram already exists
      let attributeHistogram = this.histograms.filter((hist)=> {return hist.attrName === headerData.name;})[0];

      if (!attributeHistogram) {
        attributeHistogram = new Histogram(element);
        this.histograms.push(attributeHistogram);
      };

    const graphView = await this.tableManager.graphTable;
    const attributeView = await this.tableManager.tableTable;
    const allCols = graphView.cols().concat(attributeView.cols());


    const dataVec = allCols.filter((col)=> {return col.desc.name === headerData.name;})[0];
    // initiate this object
    await attributeHistogram.init(headerData.name, dataVec, dataVec.desc.value.type,colWidth,this.headerHeight);



    // const hist = headerData.hist;

    // const range = [0, colWidth];

    // // var data = [],
    // // cols = scaleLinear<string,string>().domain([hist.largestFrequency, 0]).range(['#111111', '#999999']),
    // let total = hist.validCount;
    // const binWidth = (range[1] - range[0]) / hist.bins;
    // let acc = 0;

    // const data = [];

    // hist.forEach((b, i) => {
    //   data[i] = {
    //     v: b,
    //     acc,
    //     ratio: b / total,
    //     range: hist.range(i),
    //   };
    //   acc += b;


    // });

    // const xScale = scaleLinear().range([0, colWidth]).domain(hist.valueRange).nice();
    // const bin2value = scaleLinear().range(hist.valueRange).domain([0, hist.bins]);
    // const yScale = scaleLinear().range([0, height * 0.8]).domain([0, max(data, (d) => {
    //   return d.v;
    // })]);


    // const bars = element.selectAll('.histogram')
    //   .data(data);

    // const barsEnter = bars.enter();

    // barsEnter
    //   .append('rect')
    //   .classed('histogram', true);

    // bars.exit().remove();

    // //bars = barsEnter.merge(bars);

    // element.select('.hist_xscale').remove();

    // const xAxis = axisBottom(xScale)
    //   .tickSize(5)
    //   .tickValues(xScale.domain())
    //   .tickFormat(format('.0f'));

    // if (element.selectAll('.hist_xscale').size() === 0) {

    //   element.append('text').classed('maxValue', true);
    //   element.append('g')
    //     .attr('transform', 'translate(0,' + height + ')')
    //     .classed('hist_xscale', true)
    //     .call(xAxis);
    // }

    // element.selectAll('.histogram')
    //   .attr('width', binWidth * 0.8)
    //   // .transition(t)
    //   .attr('height', (d) => {
    //     return yScale(d.v);
    //   })
    //   .attr('y', (d) => {
    //     return (height - yScale(d.v));
    //   })
    //   .attr('x', (d, i) => {
    //     return xScale(bin2value(i));
    //   })
    //   .attr('fill', () => {
    //     let attr = this.tableManager.primaryAttribute;
    //     if (attr && attr.name === headerData.name) {
    //       return attr.color;
    //     } else {
    //       attr = this.tableManager.affectedState;
    //       if (attr && attr.attributeInfo.name === headerData.name) {
    //         return attr.attributeInfo.color;
    //       }
    //     }
    //   }
    //   );


    // //Position tick labels to be 'inside' the axis bounds. avoid overlap
    // element.selectAll('.tick').each(function (cell) {
    //   const xtranslate = +select(this).attr('transform').split('translate(')[1].split(',')[0];
    //   if (xtranslate === 0) {//first label in the axis
    //     select(this).select('text').style('text-anchor', 'start');
    //   } else { //last label in the axis
    //     select(this).select('text').style('text-anchor', 'end');
    //   }
    // });

    // total = (data[data.length - 1]).acc + (data[data.length - 1]).v;
    // element.select('.maxValue')
    //   .text('Total:' + total)

    //   .attr('x', colWidth / 2)
    //   .attr('y', -height * 0.08)
    //   .attr('text-anchor', 'middle');


  };

  private removeTooltip() {
    // select('#tooltipMenu').html(''); //select('.menu').remove();
  }

  private addTooltip(type, data = null) {
    // console.log('adding tooltip');
    const container = document.getElementById('app');
    const coordinates = mouse(container);

    let content;
    if (type === 'cell') {
      if (data.type === 'categorical') {

        content = data.name + ' : ';
        const categories = data.data.filter(function (value, index, self) {
          return self.indexOf(value) === index;
        });
        categories.map((category) => {
          const count = data.data.reduce(function (accumulator, currentValue) {
            return currentValue === category ? accumulator + 1 : accumulator;
          }, 0);
          content = content.concat((categories.length > 1 ? count : '') + category + '  ');

        });

      } else if (data.type === 'int') {
        content = data.name + ' : ' + data.data.sort((a, b) => { return (a - b); }); //display sorted values
      } else if (data.type === 'string') {
        content = data.name + ' : ' + data.data[0].toString().toLowerCase();
      } else if (data.type === 'dataDensity') {
      content = data.name + ' : ' + (data.data[0] ? data.data[0].toLowerCase() : data.data);
    } else if (data.type === 'idtype') {
  content = data.name + ' : ' +  data.data;
}

    } else if (type === 'header') {
      content = (data.type === 'categorical' ? (data.name + '(' + data.category + ') ') : data.name);
    };

    let menuWidth = 10; //dummy value. to be updated;
    const menuHeight = 30;


    select('#tooltipMenu')
    .select('svg').remove();

    const menu = select('#tooltipMenu')
      .append('svg')
      .attr('class', 'menu')
      .attr('height', menuHeight)
      .attr('opacity', 0)
      .append('g');


    menu.append('rect')
      .attr('fill', '#f7f7f7')
      .attr('height', menuHeight)
      .attr('opacity', 1);

    menu
      .append('text')
      .attr('x', 10)
      .attr('y', 20)
      .text(() => content)
      .classed('tooltipTitle', true);

    const textNode = <SVGTSpanElement>menu.select('text').node();

    menuWidth = textNode.getComputedTextLength() + 20;

    select('#tooltipMenu').select('.menu')
      .attr('transform', 'translate(' + (coordinates[0] - menuWidth - 20) + ',' + (coordinates[1] - menuHeight / 2) + ')');

    select('#tooltipMenu')
      .attr('width', menuWidth);

    select('#tooltipMenu')
      .select('rect')
      .attr('width', menuWidth);

    select('#tooltipMenu')
      .select('svg')
      .attr('width', menuWidth);

    menu.append('line')
      .attr('x1', 0)
      .attr('x2', menuWidth)
      .attr('y1', menuHeight * 0.3)
      .attr('y2', menuHeight * 0.3)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('stroke-width', '5px')
      .attr('stroke', '#e86c37');

    select('.menu')
      .transition()
      .delay(500)
      .attr('opacity', 1);


  }
  /**
   *
   * This function renders the content of Categorical Cells in the Table View.
   *
   * @param element d3 selection of the current cell element.
   * @param cellData the data bound to the cell element being passed in.
   */
  private renderCategoricalCell(element, cellData) {
    // let t = transition('t').duration(500).ease(easeLinear);


    const colWidth = this.colWidths.categorical;
    const rowHeight = this.rowHeight;

    //Add up the undefined values;
    const numValidValues = cellData.data.reduce((a, v) => {
      return v ? a + 1 : a;
    }, 0);

    const numValues = cellData.data.filter((c) => {
      return (c === cellData.category);
    }).length;

    element.selectAll('rect').remove(); //Hack. don't know why the height of the rects isn' being updated.

    if (numValidValues < 1) {
      //Add a faint cross out to indicate no data here;
      if (element.selectAll('.cross_out').size() === 0) {
        element
          .append('line')
          .attr('class', 'cross_out');
      }

      element.select('.cross_out')
        .attr('x1', colWidth * 0.3)
        .attr('y1', rowHeight / 2)
        .attr('x2', colWidth * 0.6)
        .attr('y2', rowHeight / 2)
        .attr('stroke-width', 2)
        .attr('stroke', '#9e9d9b')
        .attr('opacity', .6);

      return;
    }

    if (element.selectAll('.categorical').size() === 0) {
      element
        .append('rect')
        .classed('frame', true);
        // .on('mouseover', (d) => {this.addTooltip('cell', cellData); })
        // .on('mouseout', () => {
        //   select('#tooltipMenu').select('.menu').remove();
        // });

      element.append('rect')
        .classed(VALUE_TYPE_CATEGORICAL, true);
        // .on('mouseover', (d) => { this.addTooltip('cell', cellData); })
        // .on('mouseout', () => {
        //   select('#tooltipMenu').select('.menu').remove();
        // });
    }

    this.yScale
      .domain([0, cellData.data.length])
      .range([0, rowHeight]);

    element
      .select('.frame')
      .attr('width', rowHeight)
      .attr('height', rowHeight)
      // .attr('y', 0)
      .attr('fill', (d) => {
        let attr;

        const primary = this.tableManager.primaryAttribute;
        const poi = this.tableManager.affectedState;

        if (primary && primary.name === cellData.varName) {
          attr = primary;
        } else if (poi && poi.name === cellData.varName) {
          attr = poi;
          attr = attr.attributeInfo;
        }

        if (attr) {
          const ind = attr.categories.indexOf(cellData.category);

          if ((poi && poi.name === cellData.varName && poi.isAffected(cellData.data[0])) || (primary && primary.name === cellData.varName)) {
            if (ind === 0) {
              return attr.color[1];
            } else {
              return attr.color[0];
            }
          };
        }
        return '#dfdfdf';
      }
      );


    element
      .select('.categorical')
      .attr('width', rowHeight)
      .attr('height', this.yScale(numValues))
      .attr('y', (rowHeight - this.yScale(numValues)))
      .classed('aggregate', () => {
        return cellData.data.length > 1;
      })

      .attr('fill', () => {
        let attr;

        const primary = this.tableManager.primaryAttribute;
        const poi = this.tableManager.affectedState;
        if (primary && primary.name === cellData.varName) {
          attr = primary;
        } else if (poi && poi.name === cellData.varName) {
          attr = poi;
          attr = attr.attributeInfo;
        }

        if (attr) {
          const ind = attr.categories.indexOf(cellData.category);
          if (ind > -1) {
            if ((poi && poi.name === cellData.varName && poi.isAffected(cellData.data[0])) || (primary && primary.name === cellData.varName)) {
              return attr.color[ind];
            };
          }
        }
        return '#767a7a';
      }
      );
  }

  /**
   *
   * This function renders the content of Categorical Cells in the Table View.
   *
   * @param element d3 selection of the current cell element.
   * @param cellData the data bound to the cell element being passed in.
   */
  private renderDataDensCell(element, cellData) {

    //Check for custom column width value, if none, use default
    const colWidth = this.customColWidths[cellData.name] || this.colWidths[cellData.type];

    // const colWidth = this.colWidths[cellData.type];
    const rowHeight = this.rowHeight;


    //append data to checkbox for easy export
    //only add checkboxes for the dataDensity col;
    element.selectAll('.checkbox')
      .data([cellData].filter((c) => { return c.type === 'dataDensity'; }))
      .enter()
      .append('rect')
      .classed('checkbox', true)
      .on('click', function () {
        event.stopPropagation();
        //toggle visibility of both checkbox icon and checkbox color;
        element.select('.checkboxIcon').classed('checked', !select(this).classed('checked'));
        select(this).classed('checked', !select(this).classed('checked'));
      });


    if (element.selectAll('.dataDens').size() === 0) {
      element
        .append('rect')
        .classed('dataDens', true);

      element.append('text')
        .classed('label', true);

      if (cellData.type === 'dataDensity') {
        element.append('text').text('\uf00c')
          .classed('checkboxIcon', true)
          .attr('x', 11)
          .attr('y', 12);
      }

    }

    const colorScale = scaleLinear<string, string>().domain(this.idScale.domain()).range(['#c0bfbb', '#373838']);

    element
      .select('.dataDens')
      .attr('width', colWidth)
      .attr('height', rowHeight)
      .attr('x', (cellData.type === 'dataDensity' ? (this.colWidths.dataDensity + this.buffer) : 0))
      .attr('y', 0)
      .attr('opacity', .4)
      .attr('fill', (d, i) => { return this.colorScale[0]; });

    element
      .select('.checkbox')
      .attr('width', colWidth)
      .attr('height', rowHeight)
      .attr('x', 3)
      .attr('y', 0);


    element
      .select('.label')
      .attr('x', (cellData.type === 'dataDensity' ? (colWidth / 2 + this.colWidths.dataDensity + this.buffer) : colWidth / 2))
      // .attr('x', colWidth / 2)
      .attr('y', rowHeight * 0.8)
      .text(() => {
        return cellData.data;
      })
      .attr('text-anchor', 'middle')
      .attr('fill', '#4e4e4e');

  }


  private renderFamilyIDCell(element, cellData) {
    const equalValues = cellData.data.reduce(function (a, b) {
      return (a === b) ? a : NaN;
    }); //check for array that has all equal values in an aggregate (such as KindredId);

    if (isNaN(equalValues)) {
      console.log('Found Duplicate KindredIDs in aggregate row!');
      return;
    }

    cellData.data = equalValues; //set the value of this cell as the KindredID

    this.renderDataDensCell(element, cellData);

  }

  /**
   *
   * This function renders the content of Quantitative (type === int)  Cells in the Table View.
   *
   * @param element d3 selection of the current cell element.
   * @param cellData the data bound to the cell element being passed in.
   */
  private renderIntCell(element, cellData) {

    // console.log(cellData);

    // console.log(cellData)
    //Check for custom column width value, if none, use default
    const colWidth = this.customColWidths[cellData.name] || this.colWidths.int;

    // const colWidth = this.colWidths.int; //this.getDisplayedColumnWidths(this.width).find(x => x.name === cellData.name).width
    const rowHeight = this.rowHeight;
    const radius = 3.5;

    const jitterScale = scaleLinear()
      .domain([0, 1])
      .range([rowHeight * 0.3, rowHeight * 0.7]);

    this.xScale
      .domain(cellData.vector.desc.value.range)
      .range([colWidth * 0.1, colWidth * 0.9])
      .clamp(true);

    //No of non-undefined elements in this array
    const numValues = cellData.data.filter((v)=> {return v !== undefined;}).length;
    // console.log(numValues);
    if (numValues === 0) {


      // console.log(cellData.name, cellData.data);
      //Add a faint cross out to indicate no data here;
      if (element.selectAll('.cross_out').size() === 0) {
        element
          .append('line')
          .attr('class', 'cross_out');
      }

      element.select('.cross_out')
        .attr('x1', colWidth * 0.3)
        .attr('y1', rowHeight / 2)
        .attr('x2', colWidth * 0.6)
        .attr('y2', rowHeight / 2)
        .attr('stroke-width', 2)
        .attr('stroke', '#9e9d9b')
        .attr('opacity', .6);

      return;
    }

    if (element.selectAll('.quant').size() === 0) {
      element
        .append('rect')
        .classed('quant', true);
    }

    element
      .select('.quant')
      .attr('width', (d) => {
        return colWidth;
      })
      .attr('height', rowHeight);

    let ellipses = element
      .selectAll('ellipse')
      .data((d) => {
        const cellArray = cellData.data.filter((f) => {
          return !isNaN(f) && !isNullOrUndefined((f));
        })
          .map((e, i) => {
            return { 'id': d.id[i], 'name': d.name, 'stats': d.stats, 'value': e };
          });
        return cellArray;
      });

    const ellipsesEnter = ellipses.enter()
      .append('ellipse')
      .classed('quant_ellipse', true);

    ellipses.exit().remove();

    ellipses = ellipsesEnter.merge(ellipses);



    element.selectAll('.quant_ellipse')
      .attr('cx',
      (d: any) => {
        if (!isNaN(d.value)) {
          return this.xScale(d.value);
        }
        ;
      })
      .attr('cy', () => {
        return numValues > 1 ? jitterScale(Math.random()) : rowHeight / 2;
      }) //introduce jitter in the y position for multiple ellipses.
      .attr('rx', radius)
      .attr('ry', radius)
      .attr('fill', () => {

        let attr;
        // const ind;

        const primary = this.tableManager.primaryAttribute;
        const poi = this.tableManager.affectedState;

        if (primary && primary.name === cellData.varName) {
          attr = primary;
        } else if (poi && poi.name === cellData.varName) {
          attr = poi;
          attr = attr.attributeInfo;
        }

        if ((poi && poi.name === cellData.varName && poi.isAffected(cellData.data[0])) || (primary && primary.name === cellData.varName)) {
          return attr.color;
        }
        ;
      });
  }

  /**
   *
   * This function renders the content of String Cells in the Table View.
   *
   * @param element d3 selection of the current cell element.
   * @param cellData the data bound to the cell element being passed in.
   */
  private renderStringCell(element, cellData) {

    //Check for custom column width value, if none, use default
    const colWidth = this.customColWidths[cellData.name] || this.colWidths[cellData.type];

    // const colWidth = this.colWidths[cellData.type];
    const rowHeight = this.rowHeight;

    const numValues = cellData.data.reduce((a, v) => v ? a + 1 : a, 0);

    if (numValues === 0) {
      return;
    }

    if (element.selectAll('.string').size() === 0) {

      element
        .append('text')
        .classed('string', true);
    }

    let textLabel;

    const numChar = colWidth / 8;

    if (cellData.data.length === 0 || cellData.data[0] === undefined) {
      textLabel = '';
    } else {

      textLabel = cellData.data[0].toString().toLowerCase().slice(0, numChar);
      if (cellData.data[0].length > numChar) {
        textLabel = textLabel.concat(['...']);
      }

      if (numValues > 1) { //aggregate Row
        textLabel = '...';
      }

    }

    element
      .select('.string')
      .text(textLabel)
      .attr('dy', rowHeight * 0.9)
      .style('stroke', 'none');

    //set Hover to show entire text
    // element
    //   .on('mouseover', () => this.addTooltip('cell', cellData))
    //   .on('mouseout', () => select('#tooltipMenu').select('.menu').remove());
    // .on('mouseover', function (d) {
    //   select(this).select('.string')
    //     .text(() => {
    //       if (d.data.length === 1) {
    //         return d.data[0].toLowerCase();
    //       } else {
    //         return 'Multiple';
    //       }

    //     });
    // })
    // .on('mouseout', function (d) {
    //   let textLabel = cellData.data[0].toLowerCase().slice(0, 12);

    //   if (cellData.data[0].length > 12) {
    //     textLabel = textLabel.concat(['...']);
    //   }

    //   if (numValues > 1) { //aggregate Row
    //     textLabel = '...';
    //   }
    //   select(this).select('.string').text(textLabel);
    // });
  }


  /**
   *
   * This function renders the content of ID Cells in the Table View.
   *
   * @param element d3 selection of the current cell element.
   * @param cellData the data bound to the cell element being passed in.
   */
  private renderIdCell(element, cellData) {


    //Check for custom column width value, if none, use default
    const colWidth = this.customColWidths[cellData.name] || this.colWidths[cellData.type];

    // const colWidth = this.colWidths[cellData.type];
    const rowHeight = this.rowHeight;

    this.idScale.range([0, colWidth * 0.6]);

    const numValues = cellData.data.reduce((a, v) => v ? a + 1 : a, 0);

    const equalValues = cellData.data.reduce(function (a, b) {
      return (a === b) ? a : NaN;
    }); //check for array that has all equal values in an aggregate (such as KindredId)

    if (numValues === 0) {
      return;
    }

    if (numValues > 1 && element.select('.idBar').size() === 0) {
      element
        .append('rect')
        .classed('idBar', true);
    }

    if (numValues === 1) {
      element.select('rect').remove();
    }

    if (element.selectAll('.string').size() === 0) {
      element
        .append('text')
        .classed('string', true);
    }

    let textLabel;
    if (numValues === 1 || !isNaN(equalValues)) {
      textLabel = '#' + cellData.data[0];
      element
        .select('.string')
        .text(textLabel)
        .attr('dy', rowHeight * 0.9)
        .attr('dx', 0)
        .style('stroke', 'none');
    } else {

      element
        .select('.string')
        .text('...')
        // .style('font-style', 'bold')
        .attr('dy', rowHeight * 0.9)
        // .attr('dx', this.idScale(numValues) + 2)
        .style('stroke', 'none');

    }

    // element.selectAll('text')
    //   .attr('dx', col_width/2)
    //   .attr('text-anchor','middle')


  }


  private slopeChart(d) {

    const slopeWidth = d.width;

    const nx = slopeWidth * 0.2;
    const width = slopeWidth;

    const startingX = this.colWidths.dataDensity + this.buffer + this.colWidths.dataDensity;

    const linedata = [{
      x: startingX,
      y: this.y(d.y) + (this.rowHeight / 2)
    },
    {
      x: startingX + nx,
      y: this.y(d.y) + (this.rowHeight / 2)
    },
    {
      x: width - nx,
      y: this.y(this.rowOrder[d.ind]) + (this.rowHeight / 2)
    },
    {
      x: width,
      y: this.y(this.rowOrder[d.ind]) + (this.rowHeight / 2)
    }];

    const divHeight = document.getElementById('graphDiv').clientHeight;
    const scrollOffset = document.getElementById('graphDiv').scrollTop;

    const start = this.y(d.y);
    const end = this.y(this.rowOrder[d.ind]);

    const highlightedRow = selectAll('.highlightBar').filter('.selected').filter((bar: any) => { return bar.y === d.y || (this.sortedRowOrder && bar.i === this.sortedRowOrder[d.ind]); });

    if (highlightedRow.empty() && (start < scrollOffset) || (start > (divHeight + scrollOffset))
      || (end < scrollOffset) || (end > (divHeight + scrollOffset))) {
      return '';
    } else {
      return this.lineFunction(linedata);
    }
  }
  private attachListener() {
    const self = this;


    events.on('poiSelected', (evt,info) => {
      this.tableManager.setAffectedState(info.name, info.callback);
    });

    events.on('primarySelected', (evt, item) => {

            // const attribute = this.tableManager[item.primary_secondary + 'Attribute'];

            // //A primary or secondary attribute had been previously defined
            // if (attribute) {
            //   //Clear previously colored histogram for primary/secondary
            //   const previousHist = this.histograms.filter((h) => {
            //     return h.attrName === attribute.name;
            //   });

            //   if (previousHist.length > 0) {
            //     previousHist[0].clearPrimarySecondary();
            //   }
            // }

            // const otherAttributePrimarySecondary = ['primary', 'secondary'].filter((a) => { return a !== item.primary_secondary; });
            // const otherAttribute = this.tableManager[otherAttributePrimarySecondary + 'Attribute'];

            // //If the attribute you are setting as secondary is the same as the one you had as primary, (or vice versa) set the primary (secondary) to undefined;
            // if (otherAttribute && item.name === otherAttribute.name) {
            //   this.tableManager[otherAttributePrimarySecondary + 'Attribute'] = undefined;
            // }

            this.tableManager.setPrimaryAttribute(item.name);
            // .then((obj) => {

            //   // const hist = this.histograms.filter((h) => { return h.attrName === item.name; })[0];
            //   // hist.setPrimarySecondary(obj);

            // });
          });



    events.on(TABLE_VIS_ROWS_CHANGED_EVENT, () => {
      self.update();
    });

    events.on(PRIMARY_SELECTED, (evt, item) => {
      self.render();
    });

    events.on(POI_SELECTED, (evt, item) => {
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
  return new AttributeTable(parent);
}
