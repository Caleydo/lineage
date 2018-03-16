import * as events from 'phovea_core/src/event';
import { AppConstants, ChangeTypes } from './app_constants';
import { select, selectAll } from 'd3-selection';
import { keys } from 'd3-collection';

import * as arrayVec from './ArrayVector';

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
  event,
  mouse
} from 'd3-selection';

import {
  json
} from 'd3-request';

import * as _ from 'underscore';

import IFamilyInfo from './tableManager';

import { FAMILY_INFO_UPDATED, TABLE_VIS_ROWS_CHANGED_EVENT, ADJ_MATRIX_CHANGED, ATTR_COL_ADDED } from './tableManager';

export const SUBGRAPH_CHANGED_EVENT = 'subgraph_changed';
export const FILTER_CHANGED_EVENT = 'filter_changed_event';

/**
 * Creates the family selector view
 */
class SetSelector {

  private $node;

  private tableManager;

  private menuObject = menu.create();

  private selectedDB;

  //class attribute to be able to sort from header
  private rows={};

  private labelProperties={};

  private headerInfo = [
    { 'header': 'Name', 'dataAttr': 'title' },
    { 'header': 'Degree', 'dataAttr': 'degree' }];

  constructor(parent: Element, tmanager) {
    this.$node = select(parent);
    this.tableManager = tmanager;

    //add nodeFilter div to header
    select('#caleydoHeader')
      .append('div')
      .attr('id', 'nodeFilter');

    //add dropdown menu for table attributes

    const dropdownMenu = select('#nodeFilter')
      .append('div')
      .append('g')
      .attr('class', 'open')
      .style('visibility','hidden');

    const menuList = dropdownMenu.append('ul').attr('class', 'dropdown-menu');

    menuList.append('tspan').attr('class', 'dropdown-header')
      .style('font-size', '16px')
      .html('Attributes');

    menuList.append('li').attr('class', 'divider').attr('role', 'separator');

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
      this.buildTables(info.value);
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

      //Add set Selector toolbar
      const toolBar = select('#col1')
      .select('#toolBar')
      .selectAll('.panel-heading')
      .data([0]) // ensure there is only one toolbar
      .enter()
      .append('div')
      .attr('class', 'panel-heading');

      const tools = ['AddNode', 'AddSubGraph', 'AddChildren', 'Add2Matrix'];


      toolBar.selectAll('button')
      .data(tools)
      .enter()
      .append('button')
      .attr('class','btn btn-default')
      .text((d)=>Config.icons[d]);

      // <button class="btn btn-default" type="submit">Button</button>


    // const dataList = panelHeading.append('datalist')
    //   .attr('id', 'allNodes');

    //add nodeAttribute filter
    select('#nodeFilter').selectAll('.panel').remove(); //total hack.


    //creat an accordion div and a table for each label
    const p = select('#nodeFilter')
      .selectAll('.panel-default')
      .data(['Exclude Node Types']);



    p.exit().remove();

    const pEnter = p.enter();

    const pDefault1 = pEnter
      .append('div')
      .attr('class', 'panel panel-default');

    //Filter Panel Heading
    // pDefault1
    //   .append('div')
    //   .attr('class', 'panel-heading')
    //   .append('h4')
    //   .attr('class', 'panel-title')
    //   .append('a')
    //   .attr('data-toggle', 'collapse')
    //   .attr('data-parent', '#nodeFilter')
    //   .attr('href', (d, i) => { return '#ncollapse_' + i; });


    const pDefault2 = pDefault1
      .append('div')
      .attr('id', (d, i) => { return 'ncollapse_' + i; })
      .attr('class', 'panel-collapse collapse')
      .classed('in', (d, i) => { return i < 1; })
      .append('div')
      .attr('class', 'panel-body')
      .attr('id', 'filterPanel');

    const cboxes =
      select('#filterPanel')
        .selectAll('.checkbox')
        .data(labels)
        .enter()
        .append('div');

    const label = cboxes
      .attr('class', 'checkbox')
      .append('label');


    label
      .html(function (d: any) {
        return select(this).html() + '<g class="dropdownMenu"><tspan class="icon">' + Config.icons[d.name] + '</tspan> ' + d.name + ' [0]</g> ' +  '<tspan class="filter icon">' + Config.icons.filter + '</tspan> '; //+  Config.icons.menu;
      });

      label.select('.filter')
      .on('click',function (d:any) {
        const parentElement = select('#filterPanel').selectAll('label').filter((l:any)=> {
          return l.name === d.name;});
        events.fire(FILTER_CHANGED_EVENT, { 'label': d.name, 'exclude': !parentElement.classed('exclude') });
        parentElement.classed('exclude', !parentElement.classed('exclude'));
      });

      label.select('.dropdownMenu')
      .on('click', (d: any) => {

        event.stopPropagation();

        const container = document.getElementById('app');
        const coordinates = mouse(container);

        select('#nodeFilter').select('.dropdown-menu')
        .style('transform','translate(' + (coordinates[0] - 10) + 'px,35px)');

        select('#nodeFilter').select('.open').style('visibility','visible');

          let menuItems = select('#nodeFilter').select('.dropdown-menu').selectAll('.demoAttr')
            .data(this.labelProperties[d.name]);

          const menuItemsEnter = menuItems.enter()
            .append('li')
            .append('a')
            .attr('class', 'dropdown-item demoAttr');


          menuItems.exit().remove();

          menuItems = menuItems.merge(menuItemsEnter);

          menuItems
          .html((d: any) => { return d; })
          .classed('active', (d) => {
            return this.tableManager.colOrder.includes(d); })
          .on('click',(d)=> {
            const removeAttr = this.tableManager.colOrder.indexOf(d) > -1;
              events.fire(ATTR_COL_ADDED, { 'db': this.selectedDB, 'name': d, 'remove': removeAttr });
          });
      });
      this.updateSetSelector(labels);

  }

  private updateSetSelector(labels) {
    select('#col1').select('#accordion').selectAll('.panel').remove(); //total hack.


        //creat an accordion div and a table for each label
        let panels = select('#col1').select('#accordion')
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


        // pDefault
        //   .append('div')
        //   .attr('id', 'tableHead')
        //   .append('table')
        //   .attr('class', 'table')
        //   .append('thead').append('tr');

        // pDefault.append('tbody')
        //   .style('background', 'rgb(155, 173, 185)');


        const tbody = pDefault
          .append('div')
          .attr('id', 'tableBody')
          .append('table')
          .attr('class', 'table');

        tbody.append('tbody');


        panels = panels.merge(panelsEnter);

        select('#col1')
          .selectAll('a')
          .html((d: any) => { return '<tspan class="icon">' + Config.icons[d.name] + '</tspan> ' + d.name + ' (' + d.size + ')'; });

        // select('#nodeFilter')
        //   .selectAll('a')
        //   .text((d: any) => { return d; });

        select('#col1')
          .select('#accordion').selectAll('.panel-body')
          .attr('id', (d: any) => { return d.name + '_body'; });

        // Populate Headers
        // labels.map((d: any) => { this.updateTableHeader('#' + d.name + '_body',d.name); });
  }

  private updateTableHeader(parentID,name) {

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

    const self = this;
    headers
      .style('width', (d: any, i) => {
        const width = (i < 2 ? 10 : (90 / (tableHeaders.length - 2)));
        return width + '%';
      })
          .on('click', function (d) {
            const isAscending = select(this).classed('des');
            if (isAscending) {
               self.rows[name].sort(function (a, b) {
                if (b[d.dataAttr] > a[d.dataAttr]) {
                  return -1;
                } else {
                  return 1;
                }
              });
              selectAll('th').classed('des', false);
              selectAll('th').classed('aes', false);
              select(this).attr('class', 'aes');
            } else {
              self.rows[name].sort(function (a, b) {
                if (b[d.dataAttr] < a[d.dataAttr]) {
                  return -1;
                } else {
                  return 1;
                }
              });
              selectAll('th').classed('des', false);
              selectAll('th').classed('aes', false);
              select(this).attr('class', 'des');
            }
          });

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

      console.log(url, graphData);

      const data = graphData.labels;

      const datalistItems = [];
      const labels = data.map((d) => {return { name: d.name, size: d.nodes.length }; });


      //Add highly connected nodes to the adj Matrix:
        // allNodes.sort((a,b)=> {return a.degree>b.degree ? -1 : 1; });

        // const connectedNodes = allNodes.slice(0,7);

        // const queue = [];
        // connectedNodes.map((cNode)=> {
        //   const arrayVector = arrayVec.create(undefined);
        //   arrayVector.desc.name = cNode.title;
        //   const id = encodeURIComponent(cNode.id);
        //   queue.push({vec:arrayVector,id});
        // });

        // while (queue.length>0) {

        // const nextVec =queue.splice(0, 1)[0];

        //  const url = 'api/data_api/edges/' + this.selectedDB + '/' + nextVec.id;

        // //  console.log('edge url is ', url);
        //         json(url, (error, edges: any) => {
        //           if (error) {
        //             throw error;
        //           }

        //           const arrayVector = nextVec.vec;

        //           arrayVector.dataValues = edges.nodes.map((e)=> {return e;});
        //           arrayVector.idValues = edges.nodes.map((e)=> {return e.uuid;});

        //           //if it's not already in there:
        //           if (this.tableManager.adjMatrixCols.filter((a:any )=> {return a.desc.name === arrayVector.desc.name; }).length<1) {
        //             this.tableManager.adjMatrixCols =this.tableManager.adjMatrixCols.concat(arrayVector); //store array of vectors
        //           }

        //           //if it's not already in there:
        //           if (this.tableManager.colOrder.filter((a:any )=> {return a === arrayVector.desc.name; }).length<1) {
        //             this.tableManager.colOrder = [arrayVector.desc.name].concat(this.tableManager.colOrder); // store array of names
        //           }

        //         });
        // }





      this.build(labels);

      // this.updateFilterPanel(labels);
      let timer;
      select('#searchBoxInput').on('input', (e)=> {
        const input = select('#searchBoxInput');
        if (input.property('value').length < 1) {
          clearTimeout(timer);
        } else {
          clearTimeout(timer);
          timer = setTimeout(()=> {

          const url = 'api/data_api/filter/' + this.selectedDB;
          console.log('url is ', url);

          const postContent = JSON.stringify({ 'searchString':input.property('value')});


          json(url)
            .header('Content-Type', 'application/json')
            .post(postContent, (error, graph: any) => {
              if (error) {
                throw error;
              }
              console.log(graph);

              const data = graph.labels;
              const labels = data.map((d) => {return { name: d.name, size: d.nodes.length }; });


              this.updateSetSelector(labels);
              data.map((d) => {
                this.populateTableRows('#' + d.name + '_body', d.nodes.splice(0,50), this.headerInfo.length,d.name);
              });




            });

          },500);
        }


      });

      data.map((d) => {
        this.populateTableRows('#' + d.name + '_body', d.nodes.splice(0,50), this.headerInfo.length,d.name);
      });

      const url2 = 'api/data_api/properties/' + this.selectedDB;

              json(url2, (error, resultObj: any) => {
                if (error) {
                  throw error;
                }

                resultObj.properties.map((prop) => {
                    if (this.labelProperties[prop.label]) {
                      this.labelProperties[prop.label].push(prop.property);
                    } else {
                      this.labelProperties[prop.label]=[prop.property];
                    }

                });

              });

    });

  }

  private populateTableRows(tableDiv, rowData, numCols,name) {

    //sort data alphabetically;
    // console.log(rowData.sort((a,b)=> {return a.title < b.title; }));


    //sort alphabetically
    rowData.sort((a,b)=> {return a.title<b.title ? -1 : 1;});

    const tableSelector = select(tableDiv).select('#tableBody');


    tableSelector.select('.table')
    .attr('id',name + '_table');


    // create a row for each object in the data
    let rows = tableSelector.select('tbody').selectAll('tr')
      .data(rowData);


    const rowsEnter = rows
      .enter()
      .append('tr');

    rows.exit().remove();
    rows = rowsEnter.merge(rows);

    this.rows[name] =  rows;
    rows.on('click', (d: any) => {
      const removeAdjMatrix = this.tableManager.colOrder.indexOf(d.title) > -1;
      const actions = [{
        'icon': 'AddSubGraph', 'string': 'Add Node + Neighbors to Tree', 'callback': () => {
          events.fire(SUBGRAPH_CHANGED_EVENT, { 'db': this.selectedDB, 'rootID': d.id, 'replace': false }); //default values for include root and children is true;
        }
      },
      {
        'icon': 'AddChildren', 'string': 'Add Neighbors to Tree', 'callback': () => {
          events.fire(SUBGRAPH_CHANGED_EVENT, { 'db': this.selectedDB, 'rootID': d.id, 'includeRoot': false, 'replace': false });
        }
      }
        ,
      {
        'icon': 'AddNode', 'string': 'Add Node to Tree', 'callback': () => {
          events.fire(SUBGRAPH_CHANGED_EVENT, { 'db': this.selectedDB, 'rootID': d.id, 'includeChildren': false, 'replace': false });
        }
      },
      {
        'icon': 'Add2Matrix', 'string': removeAdjMatrix ? 'Remove from Table' : 'Add to Table', 'callback': () => {
          events.fire(ADJ_MATRIX_CHANGED, { 'db': this.selectedDB, 'name': d.title, 'uuid': d.id, 'remove': removeAdjMatrix });
        }
      }
      ];

      this.menuObject.addMenu(d, actions);
    })
      .on('mouseover', function (d: any) {
        select(this).select('td').html(() => {
          return '<span class="title">' + d.title + '</span>';
        });
      })
      .on('mouseout', function (d: any) {
        select(this).select('td').html(() => {
          const cellString = d.title.length > 14 ? d.title.slice(0, 12) + '...' : d.title.slice(0, 12);
          return '<span class="title">' + cellString + '</span>';
        });
      });

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
      });
    // .style('text-align', 'center');

    cells
      .filter((c: any) => {
        return c.type === 'title';
      })
      // cells
      .html((d: any) => {
        // console.log(d);
        const cellString = d.value.length > 14 ? d.value.slice(0, 12) + '...' : d.value.slice(0, 12);
        return '<span class="title">' + cellString + '</span>';
      });


    cells
      .filter((c: any) => {
        return c.type === 'degree';
      })
      .html((d: any) => {
        return '<span class="degree">' + d.value + '</span> <span class="addNode">' + Config.icons.AddNode + '</span>';
      })
      .style('text-align', 'center');

      //adjust height of table body
      // document.getElementById('genealogyTree').getBoundingClientRect().height

      // select('#'+ name + '_body').style('height',document.getElementById(name + '_table').getBoundingClientRect().height+ 'px');


  }


}




/**
 * Factory method to create a new instance of the attributePanel
 * @param parent
 * @param options
 * @returns {SetSelector}
 */
export function create(parent: Element, tmanager) {
  return new SetSelector(parent, tmanager);
}
