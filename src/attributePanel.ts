import * as events from 'phovea_core/src/event';
import {AppConstants, ChangeTypes} from './app_constants';
import datasets, {IDataSetSpec} from './data/datasets';
import {csv,dsv} from 'd3-request';
import {select, selectAll} from 'd3-selection';

import {Config} from './config';

/**
 * Creates the attribute table view
 */
class attributePanel {

  private $node;

  constructor(parent:Element) {
    this.$node = select(parent)
      .append('div')
      .classed('nav-side-menu', true);
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<FilterBar>}
   */
  init() {

    console.log('Hi attribute panel')
    console.log(datasets)

    this.build();
    this.loadData();
    this.attachListener();

    // return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
   * Build the basic DOM elements and binds the change function
   */
  private build() {
    // menu container container
    const menu_list = this.$node.append('div')
      .classed('menu-list', true);
    // list that holds filter items
    const menu_content = menu_list.append('ul')
      .attr('id', 'menu-content')
      .classed('menu-content collapse in',true);

    //adding an item to teh list
    let item1 = menu_content.append('li')
      .classed('collapsed active', true)
      .attr('data-target','#sublist')
      .attr('data-toggle','collapse')
      .append('a').attr('href','#')
      .html('<i><img src=\"http://megaicons.net/static/img/icons_sizes/8/178/512/charts-genealogy-icon.png\" alt=\"\"></i>')
      .append('strong').html('Filter 1')
      .append('span')
      .classed('arrow',true);


    //adding sub items to item1 notice that data-target should match
    let sublist = menu_content.append('ul')
      .classed('sub-menu collapse fade',true)
      .attr('id', 'sublist')

    sublist.append('li').attr('class','active').append('a').attr('href','#').html('sub item 1');
    sublist.append('li').append('a').attr('href','#').html('sub item 2');
    sublist.append('li').append('a').attr('href','#').html('sub item 3');

    let item2 = menu_content.append('li')
      .classed('collapsed active', true)
      .attr('data-target','#sublist')
      .attr('data-toggle','collapse')
      .append('a').attr('href','#')
      .html('<i><img src=\"http://megaicons.net/static/img/icons_sizes/8/178/512/charts-genealogy-icon.png\" alt=\"\"></i>')
      .append('strong').html('Filter 2')
      .append('span')
      .classed('arrow',true);





  }

  /**
   * load data into attribute panel
   */
  private loadData(){

    const loadDataset = (dataset: IDataSetSpec) => {
    const desc = dataset.desc;
    const file = dataset.url;
    //setBusy(true);
    dsv(desc.separator || ',', 'text/plain')(file, (_data) => {
      console.log(dataset.name)
      //lineup = initLineup(dataset.name, desc, _data, lineup);
      //setBusy(false);
    });
  };

  {
    let base = <HTMLElement>document.querySelector('#menu-content');
    datasets.forEach((d) => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="#${d.id}">${d.name}</a>`;
       loadDataset(d);
      li.firstElementChild.addEventListener('click', (event) => {
        loadDataset(d);
      });
      base.appendChild(li);
    });
  }
  }

  private attachListener() {

    //Set listener for click event on corresponding node that changes the color of that row to red
    events.on('node_clicked', (evt, item)=> {
      selectAll('.row').classed('selected', function (d) {
        return select(this).attr('id') === 'row_' + item;
      });
    });
  }

}

/**
 * Factory method to create a new instance of the attributePanel
 * @param parent
 * @param options
 * @returns {attributePanel}
 */
export function create(parent:Element) {
  return new attributePanel(parent);
}
