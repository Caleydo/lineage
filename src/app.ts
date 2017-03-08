/**
 * Created by Caleydo Team on 31.08.2016.
 */

// import * as d3 from 'd3';
import {select, selectAll} from 'd3-selection';

//Import typescript modules for the views
import * as tree from './genealogyTree';
import * as table from './attributeTable';
import * as panel from './attributePanel';
import * as familySelector from './familySelector';


import {csv} from 'd3-request';

//Import Data Structure for graph & table

import * as graphData from './graphData';
import * as tableData from './tableData';
import * as attributeData from './tableManager';


/**
 * The main class for the App app
 */
export class App {

  private $node;

  constructor(parent: Element) {
    this.$node = select(parent);

    this.$node.append('div').attr('id', 'data_selection');
    this.$node.append('div').attr('id', 'graph_table');

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
  private async build() {

    const attributeDataObj = attributeData.create();
    // This executes asynchronously, so you'll have to pass
    // back a promise and resolve that before you keep going
    // await attributeDataObj.loadData('big-decent-clipped-38');
    await attributeDataObj.loadData('SmallDescend');

    const graphDataObj = graphData.create(attributeDataObj);
    await graphDataObj.createTree();


    const genealogyTree = tree.create(this.$node.select('#graph_table').node());
    genealogyTree.init(graphDataObj);

    const attributeTable = table.create(this.$node.select('#graph_table').node());
    attributeTable.init(attributeDataObj);

    const attributePanel = panel.create(this.$node.select('#data_selection').node());
    attributePanel.init(attributeDataObj);

    const familySelectorView = familySelector.create(this.$node.select('#familySelector').node());
    familySelectorView.init(attributeDataObj);

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
export function create(parent: Element) {
  return new App(parent);
}
