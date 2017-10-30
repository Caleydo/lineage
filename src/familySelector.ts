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

import {
  event
} from 'd3-selection';

import IFamilyInfo from './tableManager';

import {FAMILY_INFO_UPDATED} from './tableManager';


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

  private headerInfo =[{'header':'FamilyID','dataAttr':'id'},
  {'header':'FSIR','dataAttr':'id'},
  {'header':'# People','dataAttr':'size'},
  {'header':'#POI','dataAttr':'affected'},
  {'header':'#DNA Samples','dataAttr':'id'},
  {'header':'Maximum Meiosis','dataAttr':'id'}];

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
    this.updateTable(tableManager);

    events.on(FAMILY_INFO_UPDATED,(evt,tableManagerObject)=> {this.updateTable(tableManagerObject)});

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



    const table = select('#familySelector').append('table').attr('class','table')
      // .classed('fixed_headers', true);

    select('#collapseTableButton')
      .on('click',()=>{
        let text = select('#collapseTableButton').html();
        console.log(text)
        if (text == 'Expand Panel'){
          select('#collapseTableButton').html('Collapse Panel')
          select('#col1').attr('class','col-4');         

        } else {
           select('#collapseTableButton').html('Expand Panel')
          select('#col1').attr('class','col-2');
         
        }
          

    })

    const thead = table.append('thead');
    const tbody = table.append('tbody');

    const self = this;

    // append the header row
    thead.append('tr')
      .selectAll('th')
      .data(this.headerInfo)
      .enter()
      .append('th')
      .attr('scope','col')
      // .classed('header', true)
      .text(function (column) {
        return column.header;
      })
      .on('click', function (d) {
        const isAscending = select(this).classed('des');
        selectAll('.header').attr('class', 'header');

        if (isAscending) {
          self.rows.sort(function(a, b) {
            return b[d.dataAttr] < a[d.dataAttr];});
          select(this).classed('aes',true);
        } else {
          self.rows.sort(function(a, b) {
            return b[d.dataAttr] > a[d.dataAttr];});
          select(this).classed('des',true);
        }

      });

  }

  /**
   * Build the table and populate with list of families.
   */
  private updateTable(tableManager) {

    const self = this;

    this.familyInfo = tableManager.familyInfo;
    const data = tableManager;

    // console.log('family info is ' , data.familyInfo);

    let maxValue = max(data.familyInfo,(d:any)=> {return +d.size;});

    this.peopleScale
      .range([0,100])
      .domain([0,maxValue])

    maxValue = max(data.familyInfo,(d:any)=> {return +d.affected;});

    this.casesScale
      .range([0,50])
      .domain([0,maxValue]);

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
        return [{'id': d.id, 'value': d.id, 'type': 'id'},
        {'id': d.id, 'value': d.id, 'type': 'id'},
          {'id': d.id,'value': d.size,'type': 'size'},
          {'id': d.id, 'value': d.affected, 'type': 'affected'},
          {'id': d.id, 'value': d.id, 'type': 'id'},
          {'id': d.id, 'value': d.id, 'type': 'id'}];
      });

    const cellsEnter = cells
      .enter()
      .append('td');

    cells = cellsEnter.merge(cells);

    cells.exit().remove();



    selectAll('td').each(function(cell:any) {

      if (cell.type === 'size' || cell.type === 'affected'){
        if (select(this).selectAll('svg').size() === 0){
          let svg = select(this).append('svg');
          svg.append('rect').classed('total',true);
          svg.append('rect').classed('poi',true)
        }

        if (select(this).select('svg').selectAll('text').size() === 0){
          select(this).select('svg').append('text')
        }

          select(this).select('svg')
            .data([cell.value])
            .attr('width', () => {
              return cell.type === 'size' ? self.peopleScale.range()[1]+30 : self.casesScale.range()[1]+30;
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
              return cell.type === 'size' ? self.peopleScale(d/5) : self.casesScale(d/5);
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
            return d + ' (' + Math.floor(d/5) + ')';
          })
          .attr('fill', (d,i) => {
              return (i >3 && d>15) ? 'red' : 'gray' ;
            })

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


    selectAll('td').on('click', (d:any) => {

      //'Unselect all other families if ctrl was not pressed
      if (!event.metaKey) {
        select('tbody').selectAll('tr').classed('selected', false);
        select('tbody').selectAll('tr').classed('selected2', false);
        this.selectedFamilyIds = [];
      }

      this.selectedFamilyIds.push(d.id)

      select('tbody').selectAll('tr').filter((row) => {
        return row['id'] === d.id;
      }).attr('class',(d)=>{return d['id'] === 42623 ? 'selected2' : 'selected'})

      

      tableManager.selectFamily(this.selectedFamilyIds);

    });

    if (selectAll('.selected').size() == 0){ // or if (this.selectedFamilyIDs.length === 0)
      select('tbody').selectAll('tr').filter((row,i) => {
        return row['id'] === this.familyInfo[0].id; //select the first family as a default;
      }).classed('selected', true);

      this.selectedFamilyIds = [this.familyInfo[0].id]
      // tableManager.selectFamily(this.selectedFamilyIds);
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
