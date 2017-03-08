import * as events from 'phovea_core/src/event';
import {AppConstants, ChangeTypes} from './app_constants';
import * as Sortable from 'sortablejs';
import * as $ from 'jquery';
import {select, selectAll} from 'd3-selection';
import {keys} from 'd3-collection';

import {Config} from './config';


/**
 * Creates the family selector view
 */
class familySelector {

  private $node;


  // access to all the data in our backend
  private table;
  private columns;
  private activeColumns;


  constructor(parent:Element) {
    this.$node = select(parent);
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<familySelector>}
   */
  init() {
    this.build();
    this.attachListener();

    // return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
   * Build the basic DOM elements and binds the change function
   */
  private build() {

    const table = select("#familySelector").append("table")
        .attr("style", "margin-top: 30px,  margin-left: 10px,  margin-right: 10px");

    const thead = table.append("thead");
    const tbody = table.append("tbody");

    // append the header row
    thead.append("tr")
      .selectAll("th")
      .data(['FamilyID','# People','% Cases'])
      .enter()
      .append("th")
      .text(function(column) { return column; });
  }

  /**
   * Build the table and populate with list of families.
   */
  private  updateTable(data) {


  // create a row for each object in the data
  var rows = select('tbody').selectAll("tr")
    .data(data)
    .enter()
    .append("tr");
  //
  // // create a cell in each row for each column
  // var cells = rows.selectAll("td")
  //   .data(function(row) {
  //     return columns.map(function(column) {
  //       return {column: column, value: row[column]};
  //     });
  //   })
  //   .enter()
  //   .append("td")
  //   .attr("style", "font-family: Courier") // sets the font style
  //   .html(function(d) { return d.value; });


}



  private attachListener() {

    //Set listener for click event on corresponding node that changes the color of that row to red
    events.on('node_clicked', (evt, item)=> {
      selectAll('.row').classed('selected', function (d) {
        return select(this).attr('id') === 'row_' + item;
      });
    });
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
