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

import * as _ from 'underscore';

import IFamilyInfo from './tableManager';

import { FAMILY_INFO_UPDATED } from './tableManager';


/**
 * Creates the family selector view
 */
class FamilySelector {

  private $node;

  private peopleScale = scaleLinear();  //yscale for # of people

  private casesScale = scaleLinear();  //yscale for cases

  private selectedFamilyIds: Number[] = []; //array of selected families

  private familyInfo: IFamilyInfo;

  private rows;

  private tableManager;

  private headerInfo = [{ 'header': 'FamilyID', 'dataAttr': 'id' },
  { 'header': 'FSIR', 'dataAttr': 'id' },
  { 'header': '# People', 'dataAttr': 'size' },
  {'header':'#POI','dataAttr':'percentage'},
  { 'header': '#DNA Samples', 'dataAttr': 'id' },
  { 'header': 'Maximum Meiosis', 'dataAttr': 'id' }];

  constructor(parent: Element) {
    this.$node = select(parent);
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<FamilySelector>}
   */
  init(tableManager) {
    this.build();
    this.tableManager = tableManager;
    this.updateTable();

    events.on(FAMILY_INFO_UPDATED, (evt, tableManagerObject) => { this.updateTable(); });

    // return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
   * Build the basic DOM elements and binds the change function
   */
  private build() {
    select('#collapseTableButton')
      .on('click', () => {
        const text = select('#collapseTableButton').html();
        if (text === 'Expand') {
          select('#collapseTableButton').html('Collapse');
          select('#col1').attr('id', 'col1-expanded');

        } else {
          select('#collapseTableButton').html('Expand');
          select('#col1-expanded').attr('id', 'col1');
        }
      });

    const table = select('#familySelector').append('div').append('table').attr('class', 'table');
    const thead = table.append('thead');


    const tbody = select('#familySelector').append('div').attr('id', 'tableBody').append('table').attr('class', 'table').append('tbody');

    const self = this;

    // append the header row
    thead.append('tr')
      .selectAll('th')
      .data(this.headerInfo)
      .enter()
      .append('th')
      .attr('scope', 'col')
      // .classed('header', true)
      .text(function (column) {
        return column.header;
      })
      .on('click', function (d) {
        const isAscending = select(this).classed('des');

        console.log('sorting based on ', d.dataAttr);

        if (isAscending) {
          self.rows.sort(function (a, b) {
            return b[d.dataAttr] < a[d.dataAttr];
          });
          select(this).attr('class','aes');
        } else {
          self.rows.sort(function (a, b) {
            return b[d.dataAttr] > a[d.dataAttr];
          });
          select(this).attr('class','des');
        }

        selectAll('.header').classed('header', true);

      });

  }

  /**
   * Build the table and populate with list of families.
   */
  private updateTable() {

    const self = this;

    this.familyInfo = this.tableManager.familyInfo;
    const data = this.tableManager;

    let maxValue = max(data.familyInfo, (d: any) => { return +d.size; });

    this.peopleScale
      .range([0, 100])
      .domain([0, maxValue]);

    maxValue = max(data.familyInfo, (d: any) => { return +d.affected; });

    this.casesScale
      .range([0, 50])
      .domain([0, maxValue]);

    // create a row for each object in the data
    this.rows = select('tbody').selectAll('tr')
      .data(data.familyInfo);

    const rowsEnter = this.rows
      .enter()
      .append('tr');

    this.rows = rowsEnter.merge(this.rows);

    this.rows.exit().remove();
    //
    // create a cell in each row for each column
    let cells = this.rows.selectAll('td')
      .data((d) => {
        return [{ 'id': d.id, 'value': d.id, 'type': 'id' },
        { 'id': d.id, 'value': Math.round(Math.random()), 'type': 'id' },
        { 'id': d.id, 'value': d.size, 'type': 'size' },
        {'id': d.id, 'value': {'affected':d.affected,'percentage':d.percentage}, 'type': 'affected'},
        { 'id': d.id, 'value': d.id, 'type': 'id' },
        { 'id': d.id, 'value': d.id, 'type': 'id' }];
      });

    const cellsEnter = cells
      .enter()
      .append('td');

    cells = cellsEnter.merge(cells);

    cells.exit().remove();



    selectAll('td').each(function (cell: any) {

      if (cell.type === 'size') {
        if (select(this).selectAll('svg').size() === 0) {
          const svg = select(this).append('svg');
          svg.append('rect').classed('total', true);
          svg.append('rect').classed('poi', true);
        }

        if (select(this).select('svg').selectAll('text').size() === 0) {
          select(this).select('svg').append('text');
        }

        select(this).select('svg')
          .data([cell.value])
          .attr('width', () => {
            return self.peopleScale.range()[1] + 70;
          })
          .attr('height', 12);

        select(this).select('svg').select('.total')
          .data([cell.value])
          .attr('width', (d: any) => {
            return cell.type === 'size' ? self.peopleScale(d) : self.casesScale(d);
          })
          .attr('height', 10);

        select(this).select('svg').select('.poi')
          .data([cell.value])
          .attr('width', (d: any) => {
            return cell.type === 'size' ? self.peopleScale(d / 5) : self.casesScale(d / 5);
          })
          .attr('height', 10);



        select(this)
          .select('text')
          .data([cell.value])
          .attr('dy', 10)
          .attr('dx', (d: any) => {
            return cell.type === 'size' ? self.peopleScale(d) + 4 : self.casesScale(d) + 4;
          })
          .text((d: any) => {
            return d + ' (' + Math.floor(d / 5) + ')';
          })
          .attr('fill', (d, i) => {
            return (i > 3 && d > 15) ? 'red' : 'gray';
          });

      } else if (cell.type === 'affected') {
        if (select(this).selectAll('svg').size() === 0) {
          const svg = select(this).append('svg');
          svg.append('rect').classed('poi', true);
        }

        if (select(this).select('svg').selectAll('text').size() === 0) {
          select(this).select('svg').append('text');
        }

        select(this).select('svg')
          .data([cell.value])
          .attr('width', () => {return self.casesScale.range()[1] + 100;})
          .attr('height', 12);

        select(this).select('svg').select('.poi')
          .data([cell.value])
          .attr('width', (d: any) => {
            return self.casesScale(d.affected);
          })
          .attr('height', 10);



        select(this)
          .select('text')
          .data([cell.value])
          .attr('dy', 10)
          .attr('dx', (d: any) => {
            return self.casesScale(d.affected) + 4;
          })
          .text((d: any) => {
            return d.affected + ' (' + Math.round(d.percentage*1000)/10 + '%)';
          })
          .attr('fill', (d, i) => {
            return (i > 3 && d > 15) ? 'red' : 'gray';
          });

      }


    });

    cells.filter((c: any) => {
      return c.type === 'id';
    })
      // cells
      .html((d: any) => {
        return d.value.toString();
      })
      .style('text-align', 'center');


    selectAll('td').on('click', (d: any) => {
      //'Unselect all other families if ctrl was not pressed
      if (!event.metaKey) {
        select('tbody').selectAll('tr').classed('selected', false);
        select('tbody').selectAll('tr').classed('selected2', false);
        this.selectedFamilyIds = [];
      }

      this.selectedFamilyIds.push(d.id);

      select('tbody').selectAll('tr').filter((row: any) => {
        return row.id === d.id;
      })
        .classed('selected', true);
      // .attr('class',(d:any)=> {return d.id === 42623 ? 'selected2' : 'selected';});

      //call debounced function
      // this.lazyLoad();

      this.loadFamily();


    });

    if (selectAll('.selected').size() === 0) { // or if (this.selectedFamilyIDs.length === 0)
      select('tbody').selectAll('tr').filter((row: any, i) => {
        return row.id === this.familyInfo[0].id; //select the first family as a default;
      }).classed('selected', true);

      this.selectedFamilyIds = [this.familyInfo[0].id];
      // tableManager.selectFamily(this.selectedFamilyIds);
    }



  }

  private loadFamily() {
    this.tableManager.selectFamily(this.selectedFamilyIds);
  }

  private lazyLoad = _.debounce(this.loadFamily, 300, true);


}




/**
 * Factory method to create a new instance of the attributePanel
 * @param parent
 * @param options
 * @returns {attributePanel}
 */
export function create(parent: Element) {
  return new FamilySelector(parent);
}
