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

  /***
   *
   * @param column_name
   * @param column_desc
   */
  private addAttribute(column_name, column_desc) {


    //if this is an active attribute then add it to the active list otherwise add it to the inactive list
    let list = "";
    if (this.activeColumns.indexOf(column_name) > -1) {
      list = "#active-menu-content";
    } else {
      list = "#inactive-menu-content";
    }

    // we first add a div that holds the li and the svg
    let attributeElm = select(list).append('div');

    //append the header as a menu option
    let attrHeader = attributeElm.append('li')
      .classed('collapsed active', true)
      .attr('data-target', '#' + column_name)
      .attr('data-toggle', 'collapse');

    attrHeader.append('a').attr('href', '#')
      .html('<i class=\"glyphicon glyphicon-chevron-right\"></i>')
      .append('strong').html(column_name)
      .append('span').attr('class', column_desc)
      .html(`<div class=" attr_badges pull-right">
                <span class=" badge" >primary</span>
                <span class=" badge" >secondary</span>
              </div>`);
    attrHeader.on('mouseover', function () {
      select(this).select('.sort_handle').classed('focus', true);
      if (list === '#active-menu-content') {
        select(this).select('.attr_badges').classed('focus', true);
      }
    });

    attrHeader.on('mouseout', function () {
      select(this).select('.sort_handle').classed('focus', false)
      select(this).select('.attr_badges').classed('focus', false)
    });

    attrHeader.on('click', function () {
      $('.glyphicon', this).toggleClass('glyphicon-chevron-right');
      $('.glyphicon', this).toggleClass('glyphicon-chevron-down');

    });

    $(document).unbind().on('click', '.badge', function () {
      console.log('badge clicked')
      let badge = $(this).text();
      let attribute = $(this).closest('strong').contents()[0];
      //reset badge dispaly for previously clicked badges
      $(".checked_" + badge).parent().css("display", "");
      $(".checked_" + badge).parent().children().css("display", "");
      $(".checked_" + badge).removeClass(".checked_" + badge);

      $(this).parent().css("display", "inline");
      $(this).parent().children().css("display", "none");
      $(this).addClass("checked_" + badge);
      $(this).css("display", "inline");

      events.fire('attribute_selected', {attribute, badge});

    });

    // append svgs for attributes:
    const attributeSVG = attributeElm.append('ul')
      .attr('id', column_name)
      .classed('sub-menu collapse fade', true)
      .append('svg')

    this.populateData(attributeSVG, column_name);

  }

  /***
   * This function takes an svg as an input and populate it with vis element
   * for a specific attribute
   *
   */
  private async populateData(svg, attribute) {
    //console.log(await this.table.colData(attribute));
    console.log('populateData');
    console.log(await this.table.colData(attribute))


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
