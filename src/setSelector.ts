import * as events from 'phovea_core/src/event';
import { AppConstants, ChangeTypes } from './app_constants';
import { select, selectAll } from 'd3-selection';
import { keys } from 'd3-collection';

import { Config } from './config';

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


/**
 * Creates the family selector view
 */
class SetSelector {

  private $node;

  // private peopleScale = scaleLinear();  //yscale for # of people

  // private casesScale = scaleLinear();  //yscale for cases

  // private selectedFamilyIds: Number[] = []; //array of selected families

  // private familyInfo: IFamilyInfo;

  // private rows;

  // private tableManager;

  private headerInfo = [
    {'header': 'Name', 'dataAttr': 'title' },
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
    this.build();
    // events.on(FAMILY_INFO_UPDATED, (evt, tableManagerObject) => { this.updateTable(); });

    // return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
   * Build the basic DOM elements and binds the change function
   */
  private build() {
    // select('#collapseTableButton')
    //   .on('click', () => {
    //     const text = select('#collapseTableButton').html();
    //     if (text === 'Expand') {
    //       select('#collapseTableButton').html('Collapse');
    //       select('#col1').attr('id', 'col1-expanded');

    //     } else {
    //       select('#collapseTableButton').html('Expand');
    //       select('#col1-expanded').attr('id', 'col1');
    //     }
    //   });

    const table = this.$node
      .append('div')
      .attr('id', 'tableHead')
      .append('table')
      .attr('class', 'table');

    table.append('thead').append('tr');
    table.append('tbody')
    .style('background','rgb(155, 173, 185)');


    const tbody = this.$node
      .append('div')
      .attr('id', 'tableBody')
      .append('table')
      .attr('class', 'table');

    // tbody.append('thead').append('tr');
    tbody.append('tbody');
  }

  /**
   * Build the table and populate with list of families.
   */
  public  updateTable(db = 'got') {

    const self = this;

    const url = 'api/data_api/labels/' + db

    json(url, (error, graphData) => {

    //    // this.familyInfo = this.tableManager.familyInfo;
    const data = graphData['labels'];
    
    //     const attrCols = this.tableManager.familyInfo[0].starCols.map((attr) => { return { header: attr.attribute, dataAttr: attr.attribute }; });
        const tableHeaders = this.headerInfo
    
    //     let maxValue = max(data.familyInfo, (d: any) => { return +d.size; });
    
    //     this.peopleScale
    //       .range([0, 100])
    //       .domain([0, maxValue]);
    
    //     maxValue = max(data.familyInfo, (d: any) => { return +d.affected; });
    
    //     this.casesScale
    //       .range([0, 50])
    //       .domain([0, maxValue]);
    
        //Upate Header
        let headers = this.$node.select('#tableHead')
          .select('tr')
          .selectAll('th')
          .data(tableHeaders);
    
    
        const headerEnter = headers.enter()
          .append('th');
    
        headers.exit().remove();
    
        headers = headerEnter.merge(headers);
    
        headers
          .style('width', (d: any, i) => {
            const width = (i <2 ? 10 : (90 / (tableHeaders.length - 2)));
            return width + '%';
          })
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
    
    //     const rowData = this.tableManager.familyInfo.map((d) => {
    //       const baseObject = {
    //         'id': d.id,
    //         'size': d.size,
    //         // 'selected': false,
    //         'affected': d.affected,
    //         'percentage': Math.round(d.percentage * 1000) / 10,
    //         'starCols': d.starCols
    //       };
    
    //       d.starCols.map((attr) => {
    //         baseObject[attr.attribute] = attr.percentage;
    //       });
    //       return baseObject;
    //     });
          console.log(data,graphData);
    
        this.populateTableRows('#tableBody', data[0].nodes,tableHeaders);
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

  private populateTableRows(tableSelector, rowData,numCols) {


    // create a row for each object in the data
    let rows = select(tableSelector).select('tbody').selectAll('tr')
      .data(rowData);


    const rowsEnter = rows
      .enter()
      .append('tr');

      rows.exit().remove();
      rows = rowsEnter.merge(rows);


      // rows.on('click', (d: any) => {

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
        { 'title': d.title, 'value': d.title, 'type': 'title' },
        { 'degree': d.degree, 'value': d.degree, 'type': 'degree' }];

        return baseValues;
      });

    const cellsEnter = cells
      .enter()
      .append('td');

    cells.exit().remove();
    cells = cellsEnter.merge(cells);

    cells
      .style('width', (d: any, i) => {
        const width = (i <2 ? 10 : (90 /numCols));
        return width + '%';
      })
      .style('text-align', 'center');

    cells
      .filter((c: any) => {
        return c.type === 'title';
      })
      // cells
      .html((d: any) => {
        console.log(d);
        return d.value;
      })
      .style('text-align', 'center');

      cells
      .filter((c: any) => {
        return c.type === 'degree';
      })
      .html((d: any) => {
        return d.value;
      })
      .style('text-align', 'center')
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
