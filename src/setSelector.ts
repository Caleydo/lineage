import * as events from 'phovea_core/src/event';
import { AppConstants, ChangeTypes } from './app_constants';
import { select, selectAll } from 'd3-selection';
import { keys } from 'd3-collection';

import { Config } from './config';

import * as menu from './menu';

import {
  DB_CHANGED_EVENT
} from './headers';

import {
  scaleLinear,
} from 'd3-scale';

import {
  max,
  min
} from 'd3-array';

import {
  event
} from 'd3-selection';

import {
  json
} from 'd3-request';

import * as _ from 'underscore';

import IFamilyInfo from './tableManager';

import { FAMILY_INFO_UPDATED, TABLE_VIS_ROWS_CHANGED_EVENT } from './tableManager';

export const SUBGRAPH_CHANGED_EVENT = 'subgraph_changed';

/**
 * Creates the family selector view
 */
class SetSelector {

  private $node;

  private menuObject = menu.create();

  private selectedDB;

  private headerInfo = [
    { 'header': 'Name', 'dataAttr': 'title' },
    { 'header': 'Degree', 'dataAttr': 'degree' }];

  constructor(parent: Element) {
    this.$node = select(parent);
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<FamilySelector>}
   */
  init() {
    // this.tableManager = tableManager;
    // this.build();
    // events.on(FAMILY_INFO_UPDATED, (evt, tableManagerObject) => { this.updateTable(); });

    events.on(DB_CHANGED_EVENT, (evt, info) => {
      this.buildTables(info.value);;
    });

    // return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
   * Build the basic DOM elements and binds the change function
   */
  private build(labels) {

    //add search box
    const panelHeading = select('#col1')
      .select('#searchBar')
      .selectAll('.panel-heading')
      .data([0]) // ensure there is only one search box
      .enter()
      .append('div')
      .attr('class', 'panel-heading');

    panelHeading.append('input')
      .attr('list', '')
      .attr('name', 'allNode')
      .attr('type', 'text')
      .attr('class', 'form-control')
      .attr('id', 'searchBoxInput')
      .attr('placeholder', 'Search for node name');

    const dataList = panelHeading.append('datalist')
      .attr('id', 'allNodes');

    //add nodeAttribute filter
    select('#nodeFilter').selectAll('.panel').remove(); //total hack.


    //creat an accordion div and a table for each label
    const p = select('#nodeFilter')
      .selectAll('.panel-default')
      .data(['Filter by Node Type']);

    p.exit().remove();

    const pEnter = p.enter();

    const pDefault1 = pEnter
      .append('div')
      .attr('class', 'panel panel-default');

    pDefault1
      .append('div')
      .attr('class', 'panel-heading')
      .append('h4')
      .attr('class', 'panel-title')
      .append('a')
      .attr('data-toggle', 'collapse')
      .attr('data-parent', '#nodeFilter')
      .attr('href', (d, i) => { return '#ncollapse_' + i; });


    const pDefault2 = pDefault1
      .append('div')
      .attr('id', (d, i) => { return 'ncollapse_' + i; })
      .attr('class', 'panel-collapse collapse')
      .classed('in', (d, i) => { return i < 1; })
      .append('div')
      .attr('class', 'panel-body')
      .attr('id', 'filterPanel');

    const cboxes = select('#filterPanel')
      .selectAll('.checkbox')
      .data(labels)
      .enter()
      .append('div');

    const label = cboxes
      .attr('class', 'checkbox')
      .append('label');

    label
      .append('input')
      .attr('type', 'checkbox')
      .attr('value', '');

    label
      .html(function (d: any) {
        return select(this).html() + d;
      });


    // Add checkboxes for each label type.

    //   <div class="checkbox">
    //   <label><input type="checkbox" value="">Option 1</label>
    // </div>
    // <div class="checkbox">
    //   <label><input type="checkbox" value="">Option 2</label>
    // </div>
    // <div class="checkbox disabled">
    //   <label><input type="checkbox" value="" disabled>Option 3</label>
    // </div>



    select('#accordion').selectAll('.panel').remove(); //total hack.


    //creat an accordion div and a table for each label
    let panels = select('#accordion')
      .selectAll('.panel-default')
      .data(labels);

    panels.exit().remove();

    const panelsEnter = panels.enter();

    const panelDefault = panelsEnter
      .append('div')
      .attr('class', 'panel panel-default');

    panelDefault
      .append('div')
      .attr('class', 'panel-heading')
      .append('h4')
      .attr('class', 'panel-title')
      .append('a')
      .attr('data-toggle', 'collapse')
      .attr('data-parent', '#accordion')
      .attr('href', (d, i) => { return '#collapse_' + i; });


    const pDefault = panelDefault
      .append('div')
      .attr('id', (d, i) => { return 'collapse_' + i; })
      .attr('class', 'panel-collapse collapse ')
      .classed('in', (d, i) => { return i < 1; })
      .append('div')
      // .attr('id',(d)=> {return d + '_body';})
      .attr('class', 'panel-body');


    pDefault
      .append('div')
      .attr('id', 'tableHead')
      .append('table')
      .attr('class', 'table')
      .append('thead').append('tr');

    pDefault.append('tbody')
      .style('background', 'rgb(155, 173, 185)');


    const tbody = pDefault
      .append('div')
      .attr('id', 'tableBody')
      .append('table')
      .attr('class', 'table');

    tbody.append('tbody');


    panels = panels.merge(panelsEnter);

    selectAll('a')
      .text((d: any) => { return d; });

    select('#accordion').selectAll('.panel-body')
      .attr('id', (d) => { return d + '_body'; });

    // Populate Headers
    labels.map((d) => { this.updateTableHeader('#' + d + '_body'); });


  }

  private updateTableHeader(parentID) {

    const tableHeaders = this.headerInfo;

    //Upate Header
    let headers = select(parentID)
      .select('#tableHead')
      .select('tr')
      .selectAll('th')
      .data(tableHeaders);

    const headerEnter = headers.enter()
      .append('th');

    headers.exit().remove();

    headers = headerEnter.merge(headers);

    headers
      .style('width', (d: any, i) => {
        const width = (i < 2 ? 10 : (90 / (tableHeaders.length - 2)));
        return width + '%';
      });
    //       .on('click', function (d) {
    //         const isAscending = select(this).classed('des');
    //         if (isAscending) {
    //           self.rows.sort(function (a, b) {
    //             if (b[d.dataAttr] > a[d.dataAttr]) {
    //               return -1;
    //             } else {
    //               return 1;
    //             }
    //           });
    //           selectAll('th').classed('des', false);
    //           selectAll('th').classed('aes', false);
    //           select(this).attr('class', 'aes');
    //         } else {
    //           self.rows.sort(function (a, b) {
    //             if (b[d.dataAttr] < a[d.dataAttr]) {
    //               return -1;
    //             } else {
    //               return 1;
    //             }
    //           });
    //           selectAll('th').classed('des', false);
    //           selectAll('th').classed('aes', false);
    //           select(this).attr('class', 'des');
    //         }
    //       });

    headers
      .text(function (column) {
        return column.header;
      })
      .style('text-align', 'center');
  }

  /**
   * Build the table and populate with list of families.
   */
  public buildTables(db) {

    this.selectedDB = db;
    const self = this;

    const url = 'api/data_api/labels/' + db;

    json(url, (error, graphData: any) => {

      //    // this.familyInfo = this.tableManager.familyInfo;
      const data = graphData.labels;

      const datalistItems = [];

      const labels = data.map((d) => { return d.name; });
      this.build(labels);

      select('#searchBoxInput').on('input', function(e) {
        const input =select('#searchBoxInput');
        if(input.property('value').length < 3) {
            input.attr('list', '');
        } else {
            input.attr('list', 'allNodes');
        }
      });

      data.map((key) => {
        key.nodes.map((el) => {
          datalistItems.push({ uuid: el.uuid, title: el.title, type: key.name });
        });
      });

      //Populate datalist for input form
      let listItems = select('datalist').selectAll('option')
        .data(datalistItems);

      const listItemsEnter = listItems.enter()
        .append('option');

      listItems.exit().remove();

      listItems = listItems.merge(listItemsEnter);

      listItems
        .attr('value', (d: any) => { return d.uuid; })
        .text((d: any) => { return d.title + ' (' + d.type + ')'; });


      data.map((d) => {
        this.populateTableRows('#' + d.name + '_body', d.nodes, this.headerInfo.length);
      });
      //     const selectedRows = rowData.filter((row) => { return this.selectedFamilyIds.indexOf(row.id)>-1; });
      //     this.populateTableRows('#tableHead', selectedRows,tableHeaders.length-2);

      //     select('#tableBody').select('tbody').selectAll('tr').classed('selected',(d:any)=> {return this.selectedFamilyIds.indexOf(d.id) > -1;});

      //     selectAll('.addRemoveIcon').on('click', ((d)=> {event.stopPropagation(); this.selectRow(d,rowData,tableHeaders.length-2);}));

      //     if (selectAll('.selected').size() === 0) {
      //       console.log('emptyFamily!');
      //       this.selectRow({'id':data.familyInfo[0].id},rowData,tableHeaders.length-2,false);
      //     }



    });

  }

  // private selectRow(familyID:any,rowData:any,numCols,update = true) {

  //   console.log(familyID);

  //   const thisIcon = select('#tableBody').select('tbody').selectAll('.addRemoveIcon').filter((row: any) => {
  //     return row.id === familyID.id;
  //   });

  //   const toRemove = thisIcon.html() ===  '\uf056';

  //   thisIcon.html( toRemove ? '\uf055' : '\uf056');

  //   if (!toRemove) {
  //     this.selectedFamilyIds.push(familyID.id);
  //   } else {
  //     this.selectedFamilyIds.splice(this.selectedFamilyIds.indexOf(familyID.id),1);
  //   }

  //   select('#tableBody').select('tbody').selectAll('tr').filter((row: any) => {
  //     return row.id === familyID.id;
  //   })
  //     .classed('selected', !toRemove);

  //   const selectedRows = rowData.filter((row) => { return this.selectedFamilyIds.indexOf(row.id)>-1; });
  //   this.populateTableRows('#tableHead', selectedRows,numCols);

  //   if (update) {
  //     this.loadFamily();
  //   };

  // }

  private populateTableRows(tableDiv, rowData, numCols) {

    //sort data alphabetically;
    console.log(rowData.sort((a,b)=> {return a.title < b.title; }));
    const tableSelector = select(tableDiv).select('#tableBody');
    // create a row for each object in the data
    let rows = tableSelector.select('tbody').selectAll('tr')
      .data(rowData);


    const rowsEnter = rows
      .enter()
      .append('tr');

    rows.exit().remove();
    rows = rowsEnter.merge(rows);


    rows.on('click', (d: any) => {
      console.log('clicked');
      const actions = [{ 'icon': 'AddSubGraph', 'string': 'Add Node + Neighbors to Tree', 'callback': ()=> {
        events.fire(SUBGRAPH_CHANGED_EVENT, { 'db': this.selectedDB, 'rootID': d.id,'replace': false }); //default values for include root and children is true;
      } },
      { 'icon': 'AddChildren', 'string': 'Add Neighbors to Tree', 'callback': ()=> {
        events.fire(SUBGRAPH_CHANGED_EVENT, { 'db': this.selectedDB, 'rootID': d.id, 'includeRoot':false, 'replace': false });
      } },
      { 'icon': 'AddNode', 'string': 'Add Node to Tree', 'callback': ()=> {
        events.fire(SUBGRAPH_CHANGED_EVENT, { 'db': this.selectedDB, 'rootID': d.id,'includeChildren':false, 'replace': false });
      } },
      { 'icon': 'Add2Matrix', 'string': 'Add to Table', 'callback': ()=> {
        return undefined;
      }}];

      this.menuObject.addMenu(d,actions);
      // events.fire(SUBGRAPH_CHANGED_EVENT, { 'db': this.selectedDB, 'rootID': d.id, 'depth': 1, 'replace': false });
    });

    //         //set all icons to +
    //       select('#tableBody').select('tbody').selectAll('.addRemoveIcon').html('\uf055');

    //       //Set this icon to -
    //        select('#tableBody').select('tbody').selectAll('.addRemoveIcon').filter((row: any) => {
    //           return row.id === d.id;
    //         }).html('\uf056');

    //         this.selectedFamilyIds = [];
    //         this.selectedFamilyIds.push(d.id);

    //         select('#tableBody').select('tbody').selectAll('tr').classed('selected', false);

    //         select('#tableBody').select('tbody').selectAll('tr').filter((row: any) => {
    //           return row.id === d.id;
    //         })
    //           .classed('selected', true);

    //         const selectedRows = rowData.filter((row) => { return this.selectedFamilyIds.indexOf(row.id)>-1; });
    //         this.populateTableRows('#tableHead', selectedRows,numCols);

    //         this.loadFamily();


    //       });



    // if (tableSelector === '#tableBody') {
    //   this.rows = rows;
    // }

    //
    // create a cell in each row for each column
    let cells = rows.selectAll('td')
      .data((d: any) => {
        const baseValues = [
          // { 'name': d.id, 'value': undefined, 'type': 'button' },
          { 'id': d.id, 'value': d.title, 'type': 'title' },
          { 'id': d.id, 'value': d.degree, 'type': 'degree' }];

        return baseValues;
      });

    const cellsEnter = cells
      .enter()
      .append('td');

    cells.exit().remove();
    cells = cellsEnter.merge(cells);

    cells
      .style('width', (d: any, i) => {
        const width = (i < 2 ? 10 : (90 / numCols));
        return width + '%';
      })
      .style('text-align', 'center');

    cells
      .filter((c: any) => {
        return c.type === 'title';
      })
      // cells
      .html((d: any) => {
        // console.log(d);
        return '<span class="title">' + d.value + '</span>';
      })
      .style('text-align', 'center');

    cells
      .filter((c: any) => {
        return c.type === 'degree';
      })
      .html((d: any) => {
        return '<span class="badge degree">' + d.value + '</span>';
      })
      .style('text-align', 'center');


  }

  // private loadFamily() {
  //   console.log('calling loadFamily');
  //   this.tableManager.selectFamily(this.selectedFamilyIds);
  // }

  // private lazyLoad = _.debounce(this.loadFamily, 300, true);


}




/**
 * Factory method to create a new instance of the attributePanel
 * @param parent
 * @param options
 * @returns {SetSelector}
 */
export function create(parent: Element) {
  return new SetSelector(parent);
}
