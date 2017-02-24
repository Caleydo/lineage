/**
 * Created by Caleydo Team on 31.08.2016.
 */

// import * as d3 from 'd3';
import {select, selectAll} from 'd3-selection';

//Import typescript modules for the views
import * as tree from './genealogyTree';
import * as table from './attributeTable';
import * as panel from './attributePanel';


import {csv} from 'd3-request';

//Import Data Structure for graph & table

import * as graphData from './graphData';
import * as tableData from './tableData';
import * as attributeData from './attributeData';


import * as dataExplorations from './dataExplorations';

//Import Sample Data from ./sampleData
// import {sampleData} from './sampleData'

//Import Actual Data from ./sampleData
import {realData} from './data/data_38';
// import {realData} from './data_149'
// import {realData} from './data_777721'

//Import data desc from datasets.ts
import datasets from './data/datasets';


// bundle data file and get URL
import * as csvUrl from 'file-loader!./data/sampleData.csv';


//Provenance Tracking
import {create as createCLUE} from 'phovea_clue/src/template';
import * as header from 'phovea_ui/src/header';


import {ProvenanceGraph, cat} from 'phovea_core/src/provenance';
// import {createSetCLUEHelloWorldText} from './cmds';
//import {APP_NAME} from './language';


// mark the core to work offline - comment the next two lines out if working with a server!
//import {init as initCore} from 'phovea_core/src';
//initCore({offline: true});


/**
 * The main class for the App app
 */
export class App {

  private $node;

  constructor(parent:Element) {

    // const clue = createCLUE(document.body, {
    //   id: 'clue_genealogy_vis',
    //   app: 'Genealogy VIS',
    //   appLink: new header.AppHeaderLink('Lineage'),
    //   thumbnails: false, //no server thumbnails
    // });
    //
    // // init app
    // clue.$main.html(`<div class="clue"></div>`);

    // this.$node = select('.clue');
        this.$node = select(parent);

    this.$node.append('div').attr('id','data_selection');
    this.$node.append('div').attr('id','graph_table');

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

      const genealogyTree = tree.create(this.$node.select('#graph_table').node());
      genealogyTree.init(graphData.create(realData));


      const attributeDataObj = attributeData.create('big-decent-clipped-38');

      //shared data for attributeTable and attributePanel
      const tableDataObj = tableData.create(realData, datasets[0].desc.columns);

      const attributeTable = table.create(this.$node.select('#graph_table').node());
      attributeTable.init(tableDataObj);

      const attributePanel = panel.create(this.$node.select('#data_selection').node());
      attributePanel.init(attributeDataObj);

      // const data = dataExplorations.create();
      // data.loadLocalData();
      // data.demoDatasets(null);
      // data.demoGenealogyData();


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
