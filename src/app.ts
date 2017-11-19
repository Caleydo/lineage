/**
 * Created by Caleydo Team on 31.08.2016.
 */

// import * as d3 from 'd3';
import { select, selectAll } from 'd3-selection';

//Import typescript modules for the views
import * as tree from './genealogyTree';
import * as table from './attributeTable';
import * as panel from './attributePanel';
import * as familySelector from './familySelector';

//Import Data Structure for graph & table
import * as graphData from './graphData';
import * as TableManager from './tableManager';


/**
 * The main class for the Lineage app
 */
export class App {

  private $node;

  constructor(parent: Element) {
    // console.log(parent)
    // console.log(select(parent),select('#app'))
    this.$node = select(parent);

    // this.$node = select('#col1');

    this.$node.select('#col1').append('div').attr('id', 'data_selection');
    this.$node.select('#col2').append('div').attr('id', 'graph');
    this.$node.select('#col3').append('div').attr('id', 'table');

    //Add div for tooltip that sits on top of all other divs.
    select('#app').append('div').attr('id', 'tooltipMenu');
    select('#app').append('div').attr('id', 'treeMenu');

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

    const tableManager = TableManager.create();
    // This executes asynchronously, so you'll have to pass
    // back a promise and resolve that before you keep going
    // await tableManager.loadData('big-decent-clipped-38');


    /** =====  PUBLIC CASE ===== */

    //await tableManager.loadData('TenFamiliesDescendAnon', 'TenFamiliesAttrAnon');
    //await tableManager.loadData('TwoFamiliesDescendAnon', 'TwoFamiliesAttrAnon');



    /** =====  PRIVATE CASES - WORKS ONLY WITH THE RIGHT DATA LOCALLY ===== */

    //await tableManager.loadData('TenFamiliesDescend', 'TenFamiliesAttr');
    await tableManager.loadData('AllFamiliesDescend', 'AllFamiliesAttributes');

    //await tableManager.loadData('TenFamiliesDescend', 'TenFamiliesAttr');
    //await tableManager.loadData('FiftyFamiliesDescendAnon', 'FiftyFamiliesAttributes');

    /** ============= */

    const attributePanel = panel.create(this.$node.select('#data_selection').node());
    attributePanel.init(tableManager);

    const graphDataObj = graphData.create(tableManager);
    await graphDataObj.createTree();

    const genealogyTree = tree.create(this.$node.select('#graph').node());
    genealogyTree.init(graphDataObj,tableManager);

    const attributeTable = table.create(this.$node.select('#table').node());
    attributeTable.init(tableManager);

    const familySelectorView = familySelector.create(this.$node.select('#familySelector').node());
    familySelectorView.init(tableManager);


    this.$node.select('#loading').remove();
    this.setBusy(false);

    //temporary hack. to do: remove properly
    select('.menu-list').remove();

    //Set listener on document so that clicking anywhere removes the menus
    select('body').on('click',() => {
      select('#treeMenu').select('.menu').remove();
    });


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
