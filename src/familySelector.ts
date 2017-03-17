import * as events from 'phovea_core/src/event';
import {AppConstants, ChangeTypes} from './app_constants';
import {select, selectAll} from 'd3-selection';
import {keys} from 'd3-collection';

import {Config} from './config';

import {
  scaleLinear,
} from 'd3-scale';

import {
  max,
  min
} from 'd3-array';

import {FAMILY_INFO_UPDATED} from './tableManager';


/**
 * Creates the family selector view
 */
class FamilySelector {

  private $node;

  private peopleScale = scaleLinear();  //yscale for # of people

  private casesScale = scaleLinear();  //yscale for cases

  constructor(parent: Element) {
    this.$node = select(parent);
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<FamilySelector>}
   */
  init(dataObject) {
    this.build();
    this.updateTable(dataObject);

    events.on(FAMILY_INFO_UPDATED,(evt,tableManagerObject)=>{ this.updateTable(tableManagerObject)});

    // return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
   * Build the basic DOM elements and binds the change function
   */
  private build() {

    // this.$node.append('div')
    //   .classed('menu-list', true)
    //   .html(` <ul >
    //         <li class='brand' data-toggle='collapse'> <i class=''></i> <strong>Family Selection</strong>
    //          <span class='  toggle-btn'><i class='glyphicon glyphicon-menu-hamburger'></i></span></li>
    //            </ul>`);


    const table = select('#familySelector').append('table')
      .classed('fixed_headers', true);

    const thead = table.append('thead');
    const tbody = table.append('tbody');

    // append the header row
    thead.append('tr')
      .selectAll('th')
      .data(['FamilyID', '# People', '# Cases'])
      .enter()
      .append('th')
      .text(function (column) {
        return column;
      });

  }

  /**
   * Build the table and populate with list of families.
   */
  private updateTable(data) {

    let self = this;

    // console.log('family info is ' , data.familyInfo);

    let maxValue = max(data.familyInfo,(d:any)=>{return +d.size});

    this.peopleScale
      .range([0,100])
      .domain([0,maxValue])

    maxValue = max(data.familyInfo,(d:any)=>{return +d.affected});

    this.casesScale
      .range([0,50])
      .domain([0,maxValue]);

    // create a row for each object in the data
    let rows = select('tbody').selectAll('tr')
      .data(data.familyInfo);

    let rowsEnter = rows
      .enter()
      .append('tr');

    rows = rowsEnter.merge(rows);

    rows.exit().remove();
    //
    // create a cell in each row for each column
    let cells = rows.selectAll('td')
      .data((d) => {
        return [{'id': d['id'], 'value': d['id'], 'type': 'id'}, {
          'id': d['id'],
          'value': d['size'],
          'type': 'size'
        }, {'id': d['id'], 'value': d['affected'], 'type': 'cases'}];
      });

    let cellsEnter = cells
      .enter()
      .append('td');

    cells = cellsEnter.merge(cells);

    cells.exit().remove();



    selectAll('td').each(function(cell:any) {

      if (cell.type === 'size' || cell.type === 'cases'){
        if (select(this).selectAll('svg').size() === 0){
          select(this).append('svg').append('rect')
        }

        if (select(this).select('svg').selectAll('text').size() === 0){
          select(this).select('svg').append('text')
        }

          select(this).select('svg')
            .data([cell.value])
            .attr('width', () => {
              return cell.type === 'size' ? self.peopleScale.range()[1]+30 : self.casesScale.range()[1]+30;
            })
            .attr('height', 10);

          select(this).select('svg').select('rect')
            .data([cell.value])
            .attr('width', (d: any) => {
              return cell.type === 'size' ? self.peopleScale(d) : self.casesScale(d);
            })
            .attr('height', 10);

        select(this)
          .select('text')
          .data([cell.value])
          .attr('dy', 10)
          .attr('dx', (d: any) => {
            return cell.type === 'size' ? self.peopleScale(d)+4 : self.casesScale(d)+4;
          })
          .text((d: any) => {
            return d;
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


    selectAll('td').on('click', (d) => {
      select('tbody').selectAll('tr').classed('selected', false);
      select('tbody').selectAll('tr').filter((row) => {
        return row['id'] === d['id'];
      }).classed('selected', true);
      data.selectFamily(d['id']);
    });

    if (selectAll('.selected').size() == 0){
      select('tbody').selectAll('tr').filter((row) => {
        return row['id'] === 38;
      }).classed('selected', true);
    }



  }


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
