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

    const dropdownMenu = select('.navbar-collapse')
    .append('div')
    .attr('class', 'nav navbar-nav navbar-left form-group')
    .attr('id', 'dbSelector');

    let selectMenu = dropdownMenu.append('select')
    .attr('class','form-control')
    .attr('id','sel')

    selectMenu.append('option')
    .text('Game of Thrones')

    selectMenu.append('option')
    .text('Co-author Network')

    selectMenu.append('option')
    .text('KEG Pathways')

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
