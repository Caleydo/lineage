/**
 * Created by Caleydo Team on 31.08.2016.
 */

import * as d3 from 'd3';

//Import typescript module for the genealogy Tree
import * as tree from './genealogyTree'
import * as table from './attributeTable'

import * as graphData from './graphData'
// import {ProvenanceGraph, cat} from 'phovea_core/src/provenance';
// import {createSetCLUEHelloWorldText} from './cmds';
import {init as initCore} from 'phovea_core/src';
//import {APP_NAME} from './language';

// mark the core to work offline
initCore({ offline: true });


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

    let tableData = [
      {'id':1,'age':32, 'BMI':19},
      {'id':2,'age':40,'BMI':19},
      {'id':3,'age':15,'BMI':19},
      {'id':4,'age':24,'BMI':19},
      {'id':5,'age':4,'BMI':19},
      {'id':6,'age':66,'BMI':19}];



    let genealogyTree = tree.create(this.$node.select('.graph').node());
    genealogyTree.init(graphData.create());

    let attributeTable = table.create(this.$node.select('.table').node());
    attributeTable.init(tableData);

    // TODO: Build the view for the attribute panel

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
