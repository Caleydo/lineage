import * as events from 'phovea_core/src/event';
import {AppConstants, ChangeTypes} from './app_constants';
import datasets, {IDataSetSpec} from './data/datasets';
import {csv} from 'd3-request';
import * as Sortable from 'sortablejs';
import * as $ from 'jquery';
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

    // list that holds primary attributes
    // a user can populate this list by dragging elements from the active list
    const primary_menu_content = menu_list.append('ul')
      .attr('id', 'primary-menu-content')
      .classed('menu-content sub-menu collapse in fade', true)
      .html(`
      <li class='placeholder'>Pick your primary attribute</li>`);

     // list that holds secondry attributes
    // a user can populate this list by dragging elements from the active list
    const secondry_menu_content = menu_list.append('ul')
      .attr('id', 'secondry-menu-content')
      .classed('menu-content sub-menu collapse in fade', true)
      .html(`
      <li class='placeholder'>Pick your secondry attribute</li>`);

    // list that holds data attribute
    // initially all attributes are active
    const active_menu_content = menu_list.append('ul')
      .attr('id', 'active-menu-content')
      .classed('menu-content collapse in', true);

    menu_list.append('ul')
      .html(`
       <li class="inactive collapsed active" data-target="#inactive-menu-content" data-toggle="collapse">
                                  <i class=""></i><strong>Inactive attributes</strong> <span class="arrow"></span>
                                </li>`);





    // list that holds inactive attributes
    // a user can populate this list by dragging elements from the active list
    const inactive_menu_content = menu_list.append('ul')
      .attr('id', 'inactive-menu-content')
      .classed('menu-content sub-menu collapse in fade', true)
      .html(`
      <li class='placeholder'>DRAG AND DROP ATTRIBUTES HERE TO MAKE THEM INACTIVE</li>`);


    // primary sortable list
    Sortable.create(document.getElementById('primary-menu-content'), {
       group: 'menu-content',
      ghostClass: 'ghost',
      animation: 150,
      pull: true,
      put: true,
       onAdd: function (evt) {
        select('#primary-menu-content .placeholder')
          .style('display', 'none');
       // events.fire('attribute_removed', [item, oldIndex]);
      },
    });

    // secondry sortable list
    Sortable.create(document.getElementById('secondry-menu-content'), {
       group: 'menu-content',
      ghostClass: 'ghost',
      animation: 150,
      pull: true,
      put: true,
      onAdd: function (evt) {
        select('#secondry-menu-content .placeholder')
          .style('display', 'none');
       // events.fire('attribute_removed', [item, oldIndex]);
      },

    });

    // Active sortable list
    Sortable.create(document.getElementById('active-menu-content'), {
      group: 'menu-content',
      ghostClass: 'ghost',
      animation: 150,
      pull: true,
      put: true,
      onAdd: function (evt) {
        let item = evt.item.getElementsByTagName("strong")[0].innerHTML;
        let newIndex = evt.newIndex;
        events.fire('attribute_added', [item, newIndex]);

      },
      onUpdate: function (evt) {
        let item = evt.item.getElementsByTagName("strong")[0].innerHTML;
        let newIndex = evt.newIndex;
        let oldIndex = evt.oldIndex;
        events.fire('attribute_reordered', [item, newIndex, oldIndex]);
      },

    });

    //inactive sortable list
    Sortable.create(document.getElementById('inactive-menu-content'), {
      group: 'menu-content',
      ghostClass: 'ghost',
      animation: 150,
      pull: true,
      put: true,
      onAdd: function (evt) {
        let item = evt.item.getElementsByTagName("strong")[0].innerHTML;
        let newIndex = evt.newIndex;
        let oldIndex = evt.oldIndex;

        select('.placeholder')
          .style('display', 'none');

        events.fire('attribute_removed', [item, oldIndex]);
      },

    });


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
    let dataDesc = ['key', 'date', 'categorical', 'string', 'string', 'string', 'number', 'date', 'number', 'date'];

    csv(data_url, (_data) => {
      //"personid", "byr", "sex", "Archivepersonid", "OMEID", "LabID", "FirstBMI", "FirstBMIYr", "MaxBMI", "MaxBMIYr"]
      headers = keys(_data[0])
      _data.forEach((d, i) => {
        d.FirstBMI = +d['FirstBMI']
        d.MaxBMI = +d['MaxBMI']
        this.data.push(d);
      })
      headers.forEach((h)=> {
        this.addHeader(h, dataDesc[headers.indexOf(h)])
      })
    })
  }


  private addHeader(header, desc) {

    //append the header as a menu option
    let data_attr = select('#active-menu-content').append('li')
      .classed('collapsed active', true)
      .attr('data-target', '#' + header)
      .attr('data-toggle', 'collapse');

    data_attr.append('a').attr('href', '#')
      .html('<i class=\"glyphicon glyphicon-move sort_handle\"></i>')
      .append('strong').html(header)
      .append('span').attr('class', desc);

    data_attr.on('mouseover', function () {
      select(this).select('.sort_handle').classed('focus', true)
    });

    data_attr.on('mouseout', function () {
      select(this).select('.sort_handle').classed('focus', false)
    });

  }

  private populateData() {
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
