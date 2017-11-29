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
import { layoutState } from './Node';

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


    // //Add a Dataset Picker
    // const datasetPicker = select('.navbar-collapse')
    //   .append('ul').attr('class', 'nav navbar-nav navbar-left').attr('id', 'datasetPicker');

    // const dropdownList = datasetPicker.append('li').attr('class', 'dropdown');
    // dropdownList
    //   .append('a')
    //   .attr('class', 'dropdown-toggle')
    //   .attr('data-toggle', 'dropdown')
    //   .attr('role', 'button')
    //   .html('Pick Dataset')
    //   .append('span')
    //   .attr('class', 'caret');

    // const dataMenu = dropdownList.append('ul').attr('class', 'dropdown-menu');


    // let menuItems = dataMenu.selectAll('.datasetMenuItem')
    //   .data([
    //     { 'title': 'Suicide Families (Anonymized)', 'type': 'suicide_anon' },
    //     { 'title': 'Suicide Families', 'type': 'suicide' },
    //     { 'title': 'Autism Families', 'type': 'autism' }]);

    // menuItems = menuItems.enter()
    //   .append('li')
    //   .append('a')
    //   .attr('class', 'datasetMenuItem')
    //   .classed('active', false)
    //   .html((d: any) => { return d.title; })
    //   .merge(menuItems);

    return this.build();
  }

  /**
   * Load and initialize all necessary views
   * @returns {Promise<App>}
   */
  private async build() {




    const tableManager = TableManager.create();

   const parsedUrl = new URL(window.location.href);
   let dataset = parsedUrl.search.split('ds=')[1]; // suicide
    console.log(dataset);
  //  console.log(c);
    // This executes asynchronously, so you'll have to pass
    // back a promise and resolve that before you keep going
    // await tableManager.loadData('big-decent-clipped-38');


    /** =====  PUBLIC CASE ===== */

    //await tableManager.loadData('TenFamiliesDescendAnon', 'TenFamiliesAttrAnon');
    //await tableManager.loadData('TwoFamiliesDescendAnon', 'TwoFamiliesAttrAnon');

    /** =====  PRIVATE CASES - WORKS ONLY WITH THE RIGHT DATA LOCALLY ===== */

    //await tableManager.loadData('TenFamiliesDescend', 'TenFamiliesAttr');
    if (dataset === 'suicide' || !dataset) {
      dataset = 'suicide';
      const table = await tableManager.loadData('AllFamiliesDescend', 'AllFamiliesAttributes');
      if (!table) {
        console.log('loading Anonymous Dataset');
        await tableManager.loadData('TenFamiliesDescendAnon', 'TenFamiliesAttrAnon');
      }
    } else if (dataset === 'autism') {
     await tableManager.loadData('AllAutismFamiliesDescend', 'AllAutismFamiliesAttributes');
    } else if (dataset === 'suicide_anon') {
      dataset = 'suicide';
      await tableManager.loadData('TenFamiliesDescendAnon', 'TenFamiliesAttrAnon');
    }
    //await tableManager.loadData('TenFamiliesDescend', 'TenFamiliesAttr');
    //await tableManager.loadData('FiftyFamiliesDescendAnon', 'FiftyFamiliesAttributes');

    /** ============= */
    const attributePanel = panel.create(this.$node.select('#data_selection').node());

    attributePanel.build();
    attributePanel.init(tableManager,dataset);

    const graphDataObj = graphData.create(tableManager);
    await graphDataObj.createTree().then(() => {
      graphDataObj.aggregateTreeWrapper(undefined, layoutState.Hidden); //default to hidden state;
    });

    const genealogyTree = tree.create(this.$node.select('#graph').node());
    genealogyTree.init(graphDataObj, tableManager);
    genealogyTree.update();

    const attributeTable = table.create(this.$node.select('#table').node());
    attributeTable.init(tableManager);

    const familySelectorView = familySelector.create(this.$node.select('#familySelector').node());
    familySelectorView.init(tableManager);
    familySelectorView.updateTable();

    // const changeDataset = async function(d:any){

    //   //If item is already selected, do nothing;
    //   if (select(this).classed('active')) {
    //     return;
    //   }

    //   // if (d.type === 'suicide_anon') {
    //   //   await tableManager.loadData('TenFamiliesDescend', 'TenFamiliesAttr');
    //   //   tableManager.setAffectedState('suicide');
    //   // } else if (d.type === 'suicide') {
    //   //   await tableManager.loadData('AllAutismFamiliesDescend', 'AllAutismFamiliesAttributes');
    //   //   tableManager.setAffectedState('affected');
    //   //   // console.log('here')
    //   //   // return;
    //   //   // await tableManager.loadData('AllFamiliesDescend', 'AllFamiliesAttr');
    //   // } else if (d.type === 'autism') {
    //   //   // tableManager.setAffectedState('affected');
    //   //   // await tableManager.loadData('AllAutismFamiliesDescend', 'AllAutismFamiliesAttributes');
    //   // }

    //   selectAll('.datasetMenuItem').classed('active',false);
    //   select(this).classed('active',true);

    //   // attributePanel.init(tableManager);
    //   // await graphDataObj.createTree();
    //   // genealogyTree.update();
    //   // genealogyTree.init(graphDataObj, tableManager);
    //   // attributeTable.init(tableManager);
    //   // familySelectorView.updateTable();
    // };

    // selectAll('.datasetMenuItem').on('click',changeDataset);

    this.$node.select('#loading').remove();
    this.setBusy(false);

    //Set listener on document so that clicking anywhere removes the menus
    select('body').on('click', () => {
      console.log('clearing all...');
      select('#treeMenu').select('.menu').remove();
      selectAll('.highlightedNode').classed('highlightedNode', false);
      selectAll('.edges').classed('selected', false);
      selectAll('.parentEdges').classed('selected', false);
      selectAll('.clicked').classed('clicked', false);
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
