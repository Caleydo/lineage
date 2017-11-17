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
  private colData;    // <- everything we need to bind
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
    this.width = 1200 - this.margin.left - this.margin.right;
    this.height = Config.glyphSize * 3 * this.tableManager.graphTable.nrow; //- this.margin.top - this.margin.bottom;


    this.$node.append('nav').attr('class', 'navbar navbar-expand-lg navbar-light bg-light')
      .append('div').attr('id', 'tableNav');

    this.$node.select('#tableNav')
      .append('a').attr('class', 'navbar-brand')
      .html('Attribute Table');

    const dropdownMenu = this.$node.select('.navbar')
      .append('ul').attr('class', 'nav navbar-nav').attr('id', 'attributeMenu');

      this.$node.select('.navbar')
      .append('ul').attr('class', 'nav navbar-nav').attr('id', 'Sort by Tree')
      .append('li')
      .append('a')
      .attr('class', 'btn-link')
      .attr('id','exportIDs')
      .attr('role', 'button')
      .html('Export')
      .on('click',()=> {

        let csvContent = 'data:text/csv;charset=utf-8,';

           //Export csv file with selected ids.
           selectAll('.checkbox').filter('.checked').each((element:any) => {
            csvContent += element.id + '\r\n'; // add carriage return
          });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'lineage_export.csv');
        document.body.appendChild(link); // Required for FF

        link.click();
      });




    this.$node.select('.navbar')
      .append('ul').attr('class', 'nav navbar-nav').attr('id', 'Sort by Tree')
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


        animated(select('#columns').selectAll('.cell'))
          .attr('transform', (cell: any) => {
            return ('translate(0, ' + this.y(this.rowOrder[cell.ind]) + ' )');
          });

        //translate tableGroup to make room for the slope lines.
        animated(select('#tableGroup'))
          // .transition(t2)
          .attr('transform', () => {
            return ('translate(' + Config.collapseSlopeChartWidth + ' ,0)');
          });

        animated(select('#headerGroup'))
          // .transition(t2)
          .attr('transform', () => {
            return ('translate(' + Config.collapseSlopeChartWidth + ' ,80)');
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
      .html('Add Attributes')
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
      .html((d) => { return d; })
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
      .html((d) => { return d; })
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
      .attr('transform', 'translate(' + Config.collapseSlopeChartWidth + ',80)')
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
      .attr('transform', 'translate(' + Config.collapseSlopeChartWidth + ' , 0)')
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
    select('#marginGroup').append('g')
      // .attr('transform', 'translate(0, ' + this.margin.top + ')')
      .attr('id', 'slopeChart');

    select('#slopeChart').append('g')
      .attr('id', 'firstCol');

    select('#slopeChart').append('g')
      .attr('id', 'slopeLines');


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
      .attr('x',this.colWidths.dataDensity + this.buffer + this.colWidths.dataDensity) //to make room for checkboxes;
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

    // selectAll('.slopeLine')
    // .attr('d', (d: any) => {
    //   return this.slopeChart(d);
    // });

    // console.log('updating SlopeLines');
    // const divHeight = document.getElementById('graphDiv').clientHeight;
    // const scrollOffset = document.getElementById('graphDiv').scrollTop;

    // selectAll('.slopeLine').classed('test',false);

    // const hiddenLines = selectAll('.slopeLine')
    // .filter((d:any,i)=> {
    //   const start = this.y(d.y);
    //   const end = this.y(this.rowOrder[this.sortedRowOrder.indexOf(d.ind)]);
    //   return ((start < scrollOffset) || (start > (divHeight + scrollOffset))
    //  || (end < scrollOffset) || (end> (divHeight + scrollOffset)));
    // });

    // hiddenLines
    // .classed('test',true);

    // hiddenLines
    // .attr('d', ()=> { return 'M0.571 4.571h12.571q0.232 0 0.402 0.17t0.17 0.42v15.411h3.429q0.714 0 1.036 0.661t-0.161 1.232l-5.714 6.857q-0.321 0.393-0.875 0.393t-0.875-0.393l-5.714-6.857q-0.464-0.554-0.161-1.232 0.321-0.661 1.036-0.661h3.429v-11.429h-5.714q-0.25 0-0.446-0.196l-2.857-3.429q-0.232-0.25-0.071-0.607 0.161-0.339 0.518-0.339z';});

    // M18.179 10.768q-0.321 0.661-1.036 0.661h-3.429v15.429q0 0.25-0.161 0.411t-0.411 0.161h-12.571q-0.375 0-0.518-0.321-0.143-0.357 0.071-0.625l2.857-3.429q0.161-0.196 0.446-0.196h5.714v-11.429h-3.429q-0.714 0-1.036-0.661-0.304-0.661 0.161-1.214l5.714-6.857q0.321-0.393 0.875-0.393t0.875 0.393l5.714 6.857q0.482 0.571 0.161 1.214z
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
    const uniqueIDs = idVector.dim(0).asList().map((i)=> {return i.toString();});

    const ids = uniqueIDs.map((id,i)=> {return id+'_'+kindredIDs[i];});

    //Create a dictionary of y value to people
    const y2personDict = {};
    const yDict = this.tableManager.yValues;
    ids.forEach((person,ind) => {
      // console.log(person,KindredIDs[ind]);
      if (person in yDict) { //may not be if dangling nodes were removed
        // console.log(person,yDict[person]);
        //Handle Duplicate Nodes
        yDict[person].forEach((y) => {
          if (y in y2personDict) {
            // y2personDict[y].push({'uniqueID':person,'id':graphIDs[ind]});
            y2personDict[y].push(person); //create uniqueID from uniqueID and kindredID

          } else {
            y2personDict[y] = [person];
          }
        });
      }
    });



    //Find y indexes of all rows
    const allRows = Object.keys(y2personDict).map(Number);

    //Set height and width of svg
    this.height = Config.glyphSize * 4 * (max(allRows) - min(allRows) + 1);
    // select('.tableSVG').attr('viewBox','0 0 ' + this.width + ' ' + (this.height + this.margin.top + this.margin.bottom))

    select('.tableSVG').attr('height', this.height);
    select('.tableSVG').attr('width', this.tableManager.colOrder.length * 100);

    this.y.range([0, this.height * .8]).domain([1, max(allRows)]);
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
      // console.log(y2personDict[row]);
      return y2personDict[row]; //.map((d)=> {return d.id;});
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
      const phoveaIDs = finishedPromises[index * 5 + 2].dim(0).asList().map((i)=> {return i.toString();});

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
            return y2personDict[row];
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
            // .filter(function (value, index, self) {
            //   return self.indexOf(value.id) === index;
            // });

            // console.log(people,ids);
            // console.log('about to call people.map()');
            people.map((person) => {
              // console.log(col.name, person.split('_')[0]);
              const ind = (col.name === 'KindredID' ? ids.indexOf(person) : phoveaIDs.indexOf(person.split('_')[0])); //find this person in the attribute data
              //If there are only two categories, save both category values in this column. Else, only save the ones that match the category at hand.
              if (ind > -1 && (allCategories.length < 3 || ind > -1 && (allCategories.length > 2 && data[ind] === cat))) {
                // console.log('person:',person, 'value:',data[ind])
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
          return y2personDict[row].filter(function (value, index, self) {
            return self.indexOf(value) === index;
          });
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
            const ind = (col.name === 'KindredID' ? ids.lastIndexOf(person) : phoveaIDs.lastIndexOf(person.split('_')[0])); //find this person in the attribute data
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
          return y2personDict[row];
        });

        col.name = name;

        col.data = allRows.map((row) => {
          const colData = [];
          const people = y2personDict[row];
          // .filter(function (value, index, self) {
          //   return self.indexOf(value.id) === index;
          // });
          people.map((person) => {
            const ind = (col.name === 'KindredID' ? ids.lastIndexOf(person) : phoveaIDs.lastIndexOf(person.split('_')[0])); //find this person in the attribute data
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
          return y2personDict[row];
          // .filter(function (value, index, self) {
          //   return self.indexOf(value) === index;
          // });
        });

        col.name = name;


        col.data = allRows.map((row) => {
          const colData = [];
          const people = y2personDict[row];
          // .filter(function (value, index, self) {
          //   return self.indexOf(value.id) === index;
          // });
          // console.log(data,ids,people);
          people.map((person,i) => {
            const ind = (col.name === 'KindredID' ? ids.lastIndexOf(person) : phoveaIDs.lastIndexOf(person.split('_')[0])); //find this person in the attribute data
            // const ind = ids.indexOf(person); //find this person in the attribute data
            // console.log(person,ind,peopleIDs[i],peopleIDs[ind],data[ind]);
            if (ind > -1 ) {
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
    this.colOffsets = [this.colWidths.dataDensity+this.buffer];

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

      // console.log(index)
      const maxOffset = max(this.colOffsets);
      // console.log(maxOffset)
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
          'max': d.max, 'min': d.min, 'mean': d.mean, 'allCategories':d.allCategories, 'category': d.category, 'isSorted': d.isSorted
        };
      }), (d: any) => {
        return d.name;
      });

    headers.exit().attr('opacity', 0).remove(); // should remove headers of removed col's

    const headerEnter = headers
      .enter()
      .append('text')
      .classed('header', true)
      .classed('poi',((d)=> {return this.tableManager.affectedState.name === d.name;}))
      .attr('id', (d) => { return d.name + '_header'; });

    headers = headerEnter.merge(headers);

    headers
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
        const offset = this.colOffsets[i] + ((this.customColWidths[d.name] || this.colWidths[d.type]) / 2);
        return d.type === VALUE_TYPE_CATEGORICAL ? 'translate(' + offset + ',0) rotate(-40)' : 'translate(' + offset + ',0)';
        // return (d.type === VALUE_TYPE_CATEGORICAL || d.type === 'dataDensity' || d.name.length>10) ? 'translate(' + offset + ',0) rotate(-40)' : 'translate(' + offset + ',0)';
      })
      .attr('text-anchor', (d) => {
        return d.type === VALUE_TYPE_CATEGORICAL ? 'start' : 'middle';
        // return (d.type === VALUE_TYPE_CATEGORICAL || d.type === 'dataDensity' || d.name.length>10) ? 'start' : 'middle';
      });

    headers
      .on('mouseover', (d) => this.addTooltip('header', d))
      .on('mouseout', (d) => {
        select('#tooltipMenu').select('.menu').remove();
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
      .attr('id', (d) => { return d.name + '_summary'; });

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
      .attr('id', (d) => { return d.name + '_data'; });

        console.log(this.rowOrder.length)
        //Append background rect
        colsEnter.append('rect')
        .attr('width', (d)=> {return this.colWidths[d.type] + 20;})
        .attr('height', (this.rowHeight+this.buffer-3)*this.rowOrder.length)
        .attr('x',-10)
        .attr('y',-this.buffer+3)
        .attr('class',(d) => {return 'starRect_'+d.name;})
        .attr('fill','coral')
        .attr('opacity',((d)=> {
          const header = select('#'+d.name+'_header');
          return (!header.empty() && header.classed('star')) ? .3 : 0;
        }));
      


    cols = colsEnter.merge(cols);//;

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
      select('#' + d.name.replace(/\./g, '\\.') + '_summary').attr('opacity', 1);
      select('#' + d.name.replace(/\./g, '\\.') + '_data').attr('opacity', 1);

      //Escape any periods with backslash
      const header = select('#' + d.name.replace(/\./g, '\\.') + '_header');

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
      const summary = select('#' + d.name + '_summary');
      const dataCol = select('#' + d.name + '_data');
      const header = select('#' + d.name + '_header');

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
      .on('mouseover', (d) => {
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
      })
      .on('mouseout', () => {

        selectAll('.slopeLine').classed('selectedSlope', false);

        //Hide all the highlightBars
        selectAll('.highlightBar').attr('opacity', 0);

        // events.fire('row_mouseout', d.y);
      })
      .on('click', (d: any) => {

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
      });

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
      })
      .on('click', (d, i) => { console.log(d, this.y(this.rowOrder[d.ind])); });

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
      .data(this.rowOrder, (d: any) => {
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

    cells.exit().remove();

    const cellsEnter = cells.enter()
      .append('g')
      .attr('class', 'cell');

    cells = cellsEnter.merge(cells);

    // console.log('there are a total of ', cells.size() , 'cells')

    cellsEnter.attr('opacity', 0);

    cells
      // .transition(t)
      .attr('transform', (cell: any, i) => {
        return ('translate(0, ' + y(this.rowOrder[i]) + ' )'); //the x translation is taken care of by the group this cell is nested in.
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

    select('#revertTreeOrder')
      // .transition(t2.transition().duration(500).ease(easeLinear))
      .attr('visibility', 'visible');

    // sorting the mapped array containing the reduced values
    if (sortOrder === sortedState.Ascending) {
      mapped.sort(function (a, b) {
        if (a.value === b.value) { return 0; }
        if (b.value === undefined || a.value < b.value) { return -1; }
        if (a.value === undefined || a.value > b.value) { return 1; }

      });
    } else {
      mapped.sort(function (a, b) {
        if (a.value === b.value) { return 0; }
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
        return ('translate(' + Config.slopeChartWidth + ' ,0)');
      });


    animated(select('#headerGroup'))
      // .transition(t2)
      .attr('transform', (cell: any) => {
        return ('translate(' + (Config.slopeChartWidth) + ' ,80)');
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
      // .text('\uf078')
      .attr('y', this.rowHeight * 1.8 + 20)
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

    //Add 'remove col icon'
    icon.enter().append('text')
      .classed('icon', true)
      .classed('deleteIcon', true)
      .text(' \uf057');

    element.select('.deleteIcon')
      // .text('\uf077')
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
      // .text('\uf077')
      .attr('y', this.rowHeight * 2 + 40)
      .attr('x', (d) => {
        return colWidth / 2 + 5;
      })
      .on('click',((d)=> {this.addMenu(d);}));

    icon = iconEnter.merge(icon);

    icon
      .text('\uf0de')
      // .text('\uf077')
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

        //Update menu
        selectAll('.dropdown-item').filter((item: any) => { console.log(item); return item === d.name; })
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
        } else if (d.type === 'categorical' && d.allCategories.length <3) {
          option1 = 'Show ' + d.allCategories[0];
          option2 = 'Show ' + d.allCategories[1];
        } else if (d.type === 'categorical' && d.allCategories.length >3) {
          option1 = 'Show ' + d.category;
          option2 = 'Show NOT ' + d.category;
        }

        const menuLabels = (d.type === 'categorical' ? [option1,option2, 'Set as POI','Star'] : ['Set as POI','Star']);

        const container = document.getElementById('app');
        const coordinates = mouse(container);

        let menuWidth = 90; //default Value. Will update
        const menuItemHeight = 25;
        const menuHeight = 15 + menuLabels.length*menuItemHeight;

        const menu = select('#treeMenu')
          .append('svg')
          .attr('class', 'menu')
          .attr('height', menuHeight)
          .append('g')
          .attr('transform','translate(0,10)');

          select('.menu').select('g')
          .append('g')
          .classed('tooltipTriangle',true).append('rect');

        let menuItems = menu.selectAll('text').data(menuLabels);

        const menuItemsEnter = menuItems.enter()
          .append('g').attr('class','menuItem');

        menuItemsEnter.append('rect').classed('menuItemBackground',true);
        menuItemsEnter.append('text').classed('icon', true);
        menuItemsEnter.append('text').classed('label', true);
        menuItemsEnter.append('line').classed('menuDivider', true);

        menuItems = menuItemsEnter.merge(menuItems);

        menuItems
        .select('.label')
        .attr('x', 10)
        .attr('y', menuItemHeight/2+3)
        .text((d: any) => d)
        .classed('tooltipTitle', true)
        .on('click', (d: any) => {
          select('#treeMenu').select('.menu').remove();
        });

        let longestLabelLength = 0;

        menu.selectAll('.menuItem').each(function(element:any,i){
          const textNode = <SVGTSpanElement>select(this).select('.label').node();
          const labelWidth = textNode.getComputedTextLength();
          longestLabelLength = (labelWidth > longestLabelLength) ? labelWidth : longestLabelLength;
        });

        menuWidth = longestLabelLength + 50;

        select('.menu').attr('transform', 'translate(' + (coordinates[0] - menuWidth/2) + ',' + (coordinates[1] + 3) + ')');

        select('.tooltipTriangle')
        .attr('transform','translate(' + (menuWidth/2-3) + ',-2)')
        .select('rect')
        .attr('width',10)
        .attr('fill', 'rgb(232, 108, 55)')
        .attr('height', 10)
        .attr('opacity', 1)
        .attr('transform','rotate(45)')
        .attr('transform-origin','center');


        menuItems.select('.menuItemBackground')
          .attr('width',menuWidth)
          .attr('fill', '#f7f7f7')
          .attr('height', menuItemHeight)
          .attr('opacity', 1)
          .on('click',(e)=> {
            if (e.includes('Star')) {
              // select('#'+d.name+'_summary')
              // .classed('star',!select('#'+d.name+'_header').classed('star'));
              select('#'+d.name+'_header')
              .classed('star',!select('#'+d.name+'_header').classed('star'));

              if (select('#'+d.name+'_header').classed('star')) {
                this.tableManager.addStar(d.name,d.category);
                selectAll('.starRect_' + d.name).attr('opacity',.3);
              } else {
                this.tableManager.removeStar(d.name);
                selectAll('.starRect_' + d.name).attr('opacity',0);
              };


            };

            select('#treeMenu').select('.menu').remove();
          });

          menuItems.attr('transform', ((d,i)=> {return 'translate(0,' + (5 + i*menuItemHeight) + ')';}));

        menuItems
          .select('.icon')
          .attr('x', menuWidth - 20)
          .attr('y', menuItemHeight/2+5)
          .attr('class', 'icon')
          .text((d: any,i)=> {
            if (i === 0 && d.includes('Show')) {
              return '\uf111';
            } else if (i === 1 && d.includes('Show')) {
              return '\uf22d';
            } else if (i === 0 || i === 2) {
              return '\uf007';
            } else if (i === 1 || i === 3) {
              return '\uf005';
            } else {
              return '';
            }
          })
          .classed('tooltipTitle', true)
          .classed('star',(e)=> {return e.includes('Star') && select('#'+d.name+'_header').classed('star');})
          .classed('poi',(e)=> {return e.includes('POI') && select('#'+d.name+'_header').classed('poi');});

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
      .on('mouseover', (d) => this.addTooltip('header', d))
      .on('mouseout', (d) => {
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

  private renderIntHeaderHist(element, headerData) {

    // let t = transition('t').duration(500).ease(easeLinear);
    //Check for custom column width value, if none, use default
    const colWidth = this.customColWidths[headerData.name] || this.colWidths.int;



    // const colWidth = this.colWidths.int;
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

    const hist = headerData.hist;

    const range = [0, colWidth];

    // var data = [],
    // cols = scaleLinear<string,string>().domain([hist.largestFrequency, 0]).range(['#111111', '#999999']),
    let total = hist.validCount;
    const binWidth = (range[1] - range[0]) / hist.bins;
    let acc = 0;

    const data = [];

    hist.forEach((b, i) => {
      data[i] = {
        v: b,
        acc,
        ratio: b / total,
        range: hist.range(i),
      };
      acc += b;


    });

    const xScale = scaleLinear().range([0, colWidth]).domain(hist.valueRange).nice();
    const bin2value = scaleLinear().range(hist.valueRange).domain([0, hist.bins]);
    const yScale = scaleLinear().range([0, height * 0.8]).domain([0, max(data, (d) => {
      return d.v;
    })]);


    const bars = element.selectAll('.histogram')
      .data(data);

    const barsEnter = bars.enter();

    barsEnter
      .append('rect')
      .classed('histogram', true);

    bars.exit().remove();

    //bars = barsEnter.merge(bars);

    element.select('.hist_xscale').remove();

    const xAxis = axisBottom(xScale)
      .tickSize(5)
      .tickValues(xScale.domain())
      .tickFormat(format('.0f'));

    if (element.selectAll('.hist_xscale').size() === 0) {
      // console.log('creating new axis');

      element.append('text').classed('maxValue', true);
      element.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .classed('hist_xscale', true)
        .call(xAxis);
    }



    this.addSortingIcons(element, headerData);

    element.selectAll('.histogram')
      .attr('width', binWidth * 0.8)
      // .transition(t)
      .attr('height', (d) => {
        return yScale(d.v);
      })
      .attr('y', (d) => {
        return (height - yScale(d.v));
      })
      .attr('x', (d, i) => {
        return xScale(bin2value(i));
      })
      .attr('fill', () => {
        let attr = this.tableManager.primaryAttribute;
        if (attr && attr.name === headerData.name) {
          return attr.color;
        } else {
          attr = this.tableManager.affectedState;
          if (attr && attr.attributeInfo.name === headerData.name) {
            return attr.attributeInfo.color;
          }
        }
      }
      );


    //Position tick labels to be 'inside' the axis bounds. avoid overlap
    element.selectAll('.tick').each(function (cell) {
      const xtranslate = +select(this).attr('transform').split('translate(')[1].split(',')[0];
      if (xtranslate === 0) {//first label in the axis
        select(this).select('text').style('text-anchor', 'start');
      } else { //last label in the axis
        select(this).select('text').style('text-anchor', 'end');
      }
    });

    total = (data[data.length - 1]).acc + (data[data.length - 1]).v;
    element.select('.maxValue')
      .text('Total:' + total)

      .attr('x', colWidth / 2)
      .attr('y', -height * 0.08)
      .attr('text-anchor', 'middle');


  };


  private addTooltip(type, data = null) {

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
        // if (data.data.length>1) {
        content = data.name + ' : ' + data.data.sort((a, b) => { return (a - b); }); //display sorted values
        // } else {

        // }
      } else { //data.type === 'string'
        content = data.name + ' : ' + data.data[0].toLowerCase();
      }
    } else if (type === 'header') {
      content = (data.type === 'categorical' ? (data.name + '(' + data.category + ') ') : data.name);
    };

    let menuWidth = 10; //dummy value. to be updated;
    const menuHeight = 30;


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
      .attr('transform', 'translate(' + (coordinates[0] - menuWidth) + ',' + (coordinates[1] - menuHeight / 2) + ')');

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




    // menu
    // .append('text')
    // .attr('x', 10)
    // .attr('y', menuHeight*0.4)
    // .text('Content')
    // .classed('tooltipContent',true);

    select('.menu')
      .transition()
      .delay(500)
      .attr('opacity', 1);

    // .attr('fill', '#4e4e4e');

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
        .classed('frame', true)
        .on('mouseover', (d) => { this.addTooltip('cell', cellData); })
        .on('mouseout', () => {
          select('#tooltipMenu').select('.menu').remove();
        });

      element.append('rect')
        .classed(VALUE_TYPE_CATEGORICAL, true)
        .on('mouseover', (d) => { this.addTooltip('cell', cellData); })
        .on('mouseout', () => {
          select('#tooltipMenu').select('.menu').remove();
        });
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
    .data([cellData].filter((c)=> {return c.type === 'dataDensity';}))
    .enter()
    .append('rect')
    .classed('checkbox', true)
    .on('click',function() {
      //toggle visibility of both checkbox icon and checkbox color;
      element.select('.checkboxIcon').classed('checked',!select(this).classed('checked'));
      select(this).classed('checked',!select(this).classed('checked'));
    });


    if (element.selectAll('.dataDens').size() === 0) {
      element
        .append('rect')
        .classed('dataDens', true);

      element.append('text')
        .classed('label', true)
        .on('click', ()=> {return console.log(cellData.data);});

        if (cellData.type === 'dataDensity') {
          element.append('text').text('\uf00c')
          .classed('checkboxIcon',true)
          .attr('x',11)
          .attr('y',12);
        }

    }

    const colorScale = scaleLinear<string, string>().domain(this.idScale.domain()).range(['#c0bfbb', '#373838']);

    element
      .select('.dataDens')
      .attr('width', colWidth)
      .attr('height', rowHeight)
      .attr('x',(cellData.type === 'dataDensity' ? (this.colWidths.dataDensity+this.buffer) : 0))
      .attr('y', 0)
      .attr('opacity', .4)
      .attr('fill', (d, i) => { return this.colorScale[0]; });

      element
      .select('.checkbox')
      .attr('width', colWidth)
      .attr('height', rowHeight)
      .attr('x',3)
      .attr('y', 0);


    element
      .select('.label')
      .attr('x',(cellData.type === 'dataDensity' ? (colWidth/2 + this.colWidths.dataDensity+this.buffer) : colWidth/2))
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
    const numValues = cellData.data.reduce((a, v) => v ? a + 1 : a, 0);

    if (numValues === 0) {
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
      .attr('height', rowHeight)
      .on('mouseover', (d) => { this.addTooltip('cell', cellData); })
      .on('mouseout', () => {
        select('#tooltipMenu').select('.menu').remove();
      });

    element.selectAll('.quant_ellipse').remove(); //Hack. don't know why ellipsis.exit().remove() isn' removing the extra ones.

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

    ellipses = ellipsesEnter.merge(ellipses);

    ellipses.exit().remove(); //Dont'know why these is not removing ellipses. :-/


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

      textLabel = cellData.data[0].toLowerCase().slice(0, numChar);
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
    element
      .on('mouseover', () => this.addTooltip('cell', cellData))
      .on('mouseout', () => select('#tooltipMenu').select('.menu').remove());
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
        .classed('string', true)
        .on('click', ()=> {return console.log(cellData.data);});
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

    // if (!highlightedRow.empty()) {
    //   highlightedRow.filter((b)=> {console.log(b); return true;})
    //   console.log(d,this.sortedRowOrder[d.ind]);
    // }

    if (highlightedRow.empty() && (start < scrollOffset) || (start > (divHeight + scrollOffset))
      || (end < scrollOffset) || (end > (divHeight + scrollOffset))) {
      return '';
    } else {
      return this.lineFunction(linedata);
    }
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

    const self = this;

    //
    // events.on('redraw_tree', () => {
    //   console.log(' redraw_tree calling self.update()')
    //   self.update();
    //
    // });

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
