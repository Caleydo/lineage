import * as events from 'phovea_core/src/event';
import { AppConstants, ChangeTypes } from './app_constants';
import * as Sortable from 'sortablejs';
import * as $ from 'jquery';
import { select, selectAll, event } from 'd3-selection';
import { keys } from 'd3-collection';
import { IAnyVector } from 'phovea_core/src/vector';
import { ICategoricalVector, INumericalVector } from 'phovea_core/src/vector/IVector';
import * as histogram from './histogram';
import { VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT, VALUE_TYPE_REAL } from 'phovea_core/src/datatype';
import * as range from 'phovea_core/src/range';

import { COL_ORDER_CHANGED_EVENT, FAMILY_SELECTED_EVENT } from './tableManager';


import { Config } from './config';
import { isNullOrUndefined } from 'util';

/**
 * Creates the attribute table view
 */
class AttributePanel {

  private $node;

  private tableManager;

  constructor(parent: Element) {
    this.$node = select(parent);
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<FilterBar>}
   */
  init(tableManager,dataset) {

    if (dataset === 'suicide') {
      tableManager.setAffectedState('suicide');
    } else {
      tableManager.setAffectedState('affected');
    }

    // tableManager.setAffectedState('affected');

    // return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
   * Build the basic DOM elements and binds the change function
   */
  public build() {

    //Add Family Selector Nav Bar
    this.$node.append('nav').attr('class', 'navbar navbar-expand-lg navbar-light bg-light')
      .append('div').attr('id', 'tableNav');

    this.$node.select('#tableNav')
      .append('a').attr('class', 'navbar-brand')
      .html('Family Selector');

    const dropdownMenu = this.$node.select('.navbar')
      .append('ul').attr('class', 'nav navbar-nav');

    const list = dropdownMenu
      .append('li')
      .append('a')
      .attr('class', 'btn-link')
      .attr('role', 'button')
      .html('Expand')
      .attr('id', 'collapseTableButton');

    //Append div for Family Selector
    const familySelector = this.$node.append('div')
      .attr('id', 'familySelector');


  }
}


/**
 * Factory method to create a new instance of the attributePanel
 * @param parent
 * @param options
 * @returns {AttributePanel}
 */
export function create(parent: Element) {
  return new AttributePanel(parent);
}
