import * as events from 'phovea_core/src/event';
import {AppConstants, ChangeTypes} from './app_constants';
import datasets, {IDataSetSpec} from './data/datasets';
import {csv} from 'd3-request';
import * as Sortable from 'sortablejs';
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
      .classed('nav-side-menu active', true);
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
      .classed('menu-list', true)
      .html(` <ul >
            <li class="brand" data-toggle="collapse"> <i class=""></i> <strong>Data Selection</strong>
             <span class="toggle-btn"><i class="glyphicon glyphicon-menu-hamburger"></i></span></li>

               </ul>`);

    // list that holds filter items
    const menu_content = menu_list.append('ul')
      .attr('id', 'menu-content')
      .classed('menu-content collapse in', true);

    let sortable = Sortable.create(document.getElementById('menu-content'));


    this.loadData();
    //this.populateData();


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
          .append('strong').html(header);
          //.append('span')
         // .classed('arrow', true);
  }

  private populateData(){
    let svg = select('.panel').selectAll("svg");
    let selection = svg.selectAll("rect").data([127, 61, 256])
      .enter().append("rect")
                .attr("x", 0)
                .attr("y", function (d, i) {
                    return i * 90 + 50
                })
                .attr("width", function (d, i) {
                    return d;
                })
                .attr("height", 20)
                .style("fill", "steelblue");


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
