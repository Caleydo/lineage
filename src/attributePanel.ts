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

  // access to all the data in our backend
  private all_the_data;
  private columns;
  private activeColumns;


  // attributes lists
  private active_attribute_list;
  private inactive_attribute_list;

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
  init(attributeDataObj) {
    this.columns = attributeDataObj.columns;
    this.activeColumns = attributeDataObj.activeAttributes;

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


    // list that holds data attribute
    // initially all attributes are active
    this.active_attribute_list = menu_list.append('ul')
      .attr('id', 'active-menu-content')
      .classed('menu-content collapse in', true);

    menu_list.append('ul')
      .html(`
       <li class="inactive collapsed active" data-target="#inactive-menu-content" data-toggle="collapse">
                                  <i class=""></i><strong>Inactive attributes</strong> <span class="arrow"></span>
                                </li>`);


    // list that holds inactive attributes
    // a user can populate this list by dragging elements from the active list
    this.inactive_attribute_list = menu_list.append('ul')
      .attr('id', 'inactive-menu-content')
      .classed('menu-content sub-menu collapse in fade', true)
     // .html(`
     // <li class='placeholder'>DRAG AND DROP ATTRIBUTES HERE TO MAKE THEM INACTIVE</li>`);


    // Active sortable list
    Sortable.create(document.getElementById('active-menu-content'), {
      group: 'menu-content',
      ghostClass: 'ghost',
      animation: 150,
      pull: true,
      put: true,
      onAdd: function (evt) {
        let item  = {
          name: evt.item.getElementsByTagName("strong")[0].textContent,
          newIndex: evt.newIndex
        };
        events.fire('attribute_added', item);

      },
      onUpdate: function (evt) {
        let item  = {
          name: evt.item.getElementsByTagName("strong")[0].textContent,
          newIndex: evt.newIndex,
          oldIndex: evt.oldIndex
        };
        events.fire('attribute_reordered', item);
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
        let item = {
          name: evt.item.getElementsByTagName("strong")[0].textContent,
          newIndex: evt.newIndex,
          oldIndex: evt.oldIndex
        };

        select('.placeholder')
          .style('display', 'none');

        events.fire('attribute_removed', item);
      },

    });

    this.columns.forEach((column)=> {
      console.log('col',column)
      this.addAttribute(column.desc.name, column.desc.value.type)
    })


  }

  /***
   *
   * @param column_name
   * @param column_desc
     */
  private addAttribute(column_name, column_desc) {


    //if this is an active attribute then add it to the active list otherwise add it to the inactive list
    let list = "";
    if(this.activeColumns.indexOf(column_name) > -1){
      list= "#active-menu-content";
    } else {
      list = "#inactive-menu-content";
    }

    //append the header as a menu option
    let data_attr = select(list).append('li')
      .classed('collapsed active', true)
      .attr('data-target', '#' + column_name)
      .attr('data-toggle', 'collapse');

    data_attr.append('a').attr('href', '#')
      .html('<i class=\"glyphicon glyphicon-move sort_handle\"></i>')
      .append('strong').html(column_name)
      .append('span').attr('class', column_desc)
      .html(`<div class=" attr_badges pull-right">
<span class=" badge" >primary</span>
<span class=" badge" >secondary</span>
</div>
      `);
    data_attr.on('mouseover', function () {
      select(this).select('.sort_handle').classed('focus', true);
      if (list === '#active-menu-content'){
        select(this).select('.attr_badges').classed('focus', true);
      }
    });

    data_attr.on('mouseout', function () {
      select(this).select('.sort_handle').classed('focus', false)
      select(this).select('.attr_badges').classed('focus', false)
    });

    $(document).on('click', '.badge', function () {
      let badge = $(this).text();
      let attribute = $(this).closest('strong').contents()[0];
      //reset badge dispaly for previously clicked badges
      $(".checked_"+badge).parent().css( "display", "");
      $(".checked_"+badge).parent().children().css( "display", "");
      $(".checked_"+badge).removeClass(".checked_"+badge);

        $(this).parent().css( "display", "inline");
        $(this).parent().children().css( "display", "none");
        $(this).addClass( "checked_"+badge);
        $(this).css( "display", "inline");

       events.fire('attribute_selected',{attribute, badge});

    });

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
