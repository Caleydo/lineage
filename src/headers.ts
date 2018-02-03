import * as events from 'phovea_core/src/event';

export const DB_CHANGED_EVENT = 'db_changed';

import {
  select,
  selectAll,
  selection,
  mouse,
  event
} from 'd3-selection';

/** Class implementing the Header Menus */
class HeaderMenus {

  /**
   * Creates a Header Object
   */
  constructor() {


    // select('.navbar-collapse')
    // .append('div')
    // .attr('class', 'nav navbar-nav navbar-left')
    // .append('label')
    // .text('Select a Dataset:');

    function onchange() {
      const selectValue = select('#sel').property('value');
      events.fire(DB_CHANGED_EVENT,{'value':selectValue});
    };

    const dropdownMenu = select('.navbar-collapse')
    .append('div')
    .attr('class', 'nav navbar-nav navbar-left form-group')
    .attr('id', 'dbSelector');

    const selectMenu = dropdownMenu
    .append('select')
    .attr('class','form-control')
    .attr('id','sel')
    .on('change', onchange);

    selectMenu.append('option')
    .attr('value','got')
    .text('Game of Thrones');

    selectMenu.append('option')
    .attr('value','coauth')
    .text('Co-author Network');

    selectMenu.append('option')
    .attr('value','path')
    .text('KEG Pathways');

  }
}



/**
 * Factory method to create a new instance of the genealogyTree
 * @param parent
 * @param options
 * @returns {graph}
 */
export function create() {
  return new HeaderMenus();
}
