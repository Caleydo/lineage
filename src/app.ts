/**
 * Created by Caleydo Team on 31.08.2016.
 */

import * as d3 from 'd3';

//Import typescript module for the genealogy Tree
import * as tree from './genealogyTree'
import * as table from './attributeTable'

/**
 * The main class for the App app
 */
export class App {

  private $node;

  constructor(parent:Element) {
    this.$node = d3.select(parent);

    this.$node.append('div').classed('graph', true);
    this.$node.append('div').classed('table', true);
    this.$node.append('div').classed('attributePanel', true);
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<App>}
   */
  init() {
    return this.build();
  }

  /**
   * Load and initialize all necessary views
   * @returns {Promise<App>}
   */
  private build() {

    let genealogyTree = tree.create(this.$node.select('.graph').node());
    genealogyTree.init();

    let attributeTable = table.create(this.$node.select('.table').node());
    attributeTable.init();

    // TODO: Build the views for the attribute panel and the table.

    this.$node.select('h3').remove();
    this.setBusy(false);

    return Promise.resolve(this);
  }

  /**
   * Show or hide the application loading indicator
   * @param isBusy
   */
  setBusy(isBusy) {
    this.$node.select('.busy').classed('hidden', !isBusy);
  }

}

/**
 * Factory method to create a new app instance
 * @param parent
 * @returns {App}
 */
export function create(parent:Element) {
  return new App(parent);
}
