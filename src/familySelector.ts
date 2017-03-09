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


/**
 * Creates the family selector view
 */
class familySelector {

  private $node;

  private peopleScale = scaleLinear();  //yscale for # of people

  private casesScale = scaleLinear();  //yscale for cases

  constructor(parent:Element) {
    this.$node = select(parent);
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<familySelector>}
   */
  init(dataObject) {
    this.build();
    this.updateTable(dataObject)

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



    const table = select("#familySelector").append("table")
      .classed('fixed_headers',true)

    const thead = table.append("thead");
    const tbody = table.append("tbody");

    // append the header row
    thead.append("tr")
      .selectAll("th")
      .data(['FamilyID','# People','# Cases'])
      .enter()
      .append("th")
      .text(function(column) { return column; })

  }

  /**
   * Build the table and populate with list of families.
   */
  private updateTable(data) {

    this.peopleScale
      .range([0,140])
      .domain([0,800])


    // let minValue = min(data.familyInfo,(d:any)=>{return +d.size});
    // let maxValue = max(data.familyInfo,(d:any)=>{return +d.size});
    //
    // this.peopleScale
    //   .range([0,50])
    //   .domain([minValue,maxValue])
    //
    // minValue = min(data.familyInfo,(d:any)=>{return +d.affected});
    // maxValue = max(data.familyInfo,(d:any)=>{return +d.affected});


    // this.casesScale
    //   .range([0,50])
    //   .domain([minValue,maxValue]);

  // create a row for each object in the data
  var rows = select('tbody').selectAll("tr")
    .data(data.familyInfo)
    .enter()
    .append("tr");
  //
  // create a cell in each row for each column
  var cells = rows.selectAll("td")
    .data((d)=>{return [{'id':d['id'], 'value':d['id'], 'type':'id'}, {'id':d['id'], 'value':d['size'], 'type':'size'}, {'id':d['id'], 'value':d['affected'], 'type':'cases'}]})
    .enter()
    .append("td")


  selectAll('td').filter((c:any)=>{return c.type === 'size' || c.type === 'cases'})
    .append('svg')
    .attr('width',(d:any) => { return this.peopleScale.range()[1] })
    .attr('height',10)
    .append('rect')
    .attr('width',(d:any) => { return this.peopleScale(d.value)})
    .attr('height',10)

    selectAll('td').selectAll('svg').filter((c:any)=>{return c.type === 'size' || c.type === 'cases'})
      .append('text')
      .attr('dy', 10)
      .attr('dx', (d:any) => {
        return this.peopleScale(d.value) +4})
      .text((d:any) => {
        return d.value.toString();
      })
      // .attr('fill', 'white')
      // .style('font-weight', 'bold')
      // .attr('text-anchor', 'end')




    cells.filter((c:any)=>{return c.type === 'id'})
    // cells
      .html((d:any) => {
      return d.value.toString();
    })
      .style('text-align','center')


  selectAll('td').on('click',(d) => {
    select('tbody').selectAll('tr').classed('selected',false);
    select('tbody').selectAll('tr').filter((row)=>{return row['id'] === d['id']}).classed('selected',true);
    data.selectFamily(d['id'])});

    //default to 38
    select('tbody').selectAll('tr').filter((row)=>{return row['id'] === 38}).classed('selected',true);


}


}


/**
 * Factory method to create a new instance of the attributePanel
 * @param parent
 * @param options
 * @returns {attributePanel}
 */
export function create(parent:Element) {
  return new familySelector(parent);
}
