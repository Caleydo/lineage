import * as events from 'phovea_core/src/event';
import {AppConstants, ChangeTypes} from './app_constants';
import datasets, {IDataSetSpec} from './data/datasets';
import {csv} from 'd3-request';
//import {dsv} from 'd3-request';
import {select, selectAll} from 'd3-selection';
import {keys} from 'd3-collection';

import {Config} from './config';

/**
 * Creates the attribute table view
 */
class attributePanel {

  private $node;

  public data = [];

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

    this.build();
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
      .classed('menu-content collapse in', true);


    this.loadData();


  }

  /**
   * load data into attribute panel
   */
  private loadData() {

    const data_desc = datasets[0].desc;
    const data_url = datasets[0].url;
    let headers = []

    csv(data_url, (_data) => {
      //"personid", "byr", "sex", "Archivepersonid", "OMEID", "LabID", "FirstBMI", "FirstBMIYr", "MaxBMI", "MaxBMIYr"]
      headers = keys(_data[0])
      _data.forEach( (d, i) => {
        d.FirstBMI = +d['FirstBMI']
        d.MaxBMI = +d['MaxBMI']
        this.data.push(d);
      })
       headers.forEach((h)=> {
       this.addHeader(h)
     })
    })
  }


  private addHeader(header) {
        //append the header as a menu option
        select('#menu-content').append('li')
          .classed('collapsed active', true)
          .attr('data-target', '#' + header)
          .attr('data-toggle', 'collapse')
          .append('a').attr('href', '#')
          .html('<i><img src=\"http://megaicons.net/static/img/icons_sizes/8/178/512/charts-genealogy-icon.png\" alt=\"\"></i>')
          .append('strong').html(header)
          .append('span')
          .classed('arrow', true);

    // adding collapsible svg for each header
    select('#menu-content').append('ul')
      .classed('sub-menu collapse fade',true)
      .attr('id', header)

    select('#'+header).append('li')
      .attr('class','active')
      .append('svg');


  }

/*
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

    sublist.append('li').attr('class','active').append('svg');
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

/*
    const loadDataset = (dataset: IDataSetSpec) => {
    const desc = dataset.desc;
    const file = dataset.url;
    //setBusy(true);
    d3.dsv(desc.separator || ',', 'text/plain')(file, (_data) => {
      console.log(dataset.name)
      console.log(_data)
      //lineup = initLineup(dataset.name, desc, _data, lineup);
      //setBusy(false);
    });
  };

  {
    let base = <HTMLElement>document.querySelector('#menu-content');
    datasets.forEach((d) => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="#${d.id}">${d.name}</a>`;
      li.firstElementChild.addEventListener('click', (event) => {
        loadDataset(d);
      });
      base.appendChild(li);
    });
  }

  */


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
