/**
 * Created by Caleydo Team on 31.08.2016.
 */

import * as d3 from 'd3';

// bundle data file and get URL
import * as csvUrl from 'file-loader!./data/genealogy.csv';
import {Config} from './config';
import {createGraph, arrangeLayout, setCallbacks} from './graph';
import {renderGraph} from './renderGraph';



/**
 * The main class for the App app
 */
export class App {

  private $node;

  constructor(parent:Element) {
    this.$node = d3.select(parent);
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<App>}
   */
  init() {
    this.loadData();
    return this.build();
  }

  private loadData() {

    const n = 100;

    d3.csv(csvUrl, function (error, data) {

      //Create Graph
      const graph = createGraph(data,n);

      //Create Layout
      arrangeLayout(graph);

      //Render Graph
      renderGraph(graph);

      //Set callbacks for user interaction buttons
      setCallbacks();

      //Render table;
      //renderTable(graph);

    });
  }

  /**
   * Load and initialize all necessary views
   * @returns {Promise<App>}
   */
  private build() {
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
