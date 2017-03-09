import * as events from 'phovea_core/src/event';
import {AppConstants, ChangeTypes} from './app_constants';
import * as Sortable from 'sortablejs';
import * as $ from 'jquery';
import {select, selectAll} from 'd3-selection';
import {keys} from 'd3-collection';
import {IAnyVector} from 'phovea_core/src/vector';
import {ICategoricalVector, INumericalVector} from 'phovea_core/src/vector/IVector';
import * as histogram from './histogram';
import {VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT, VALUE_TYPE_REAL} from 'phovea_core/src/datatype';


import {Config} from './config';


/**
 * Creates the attribute table view
 */
class AttributePanel {

  private $node;

  // access to all the data in our backend
  private table;
  private columns;
  private activeColumns;


  constructor(parent: Element) {

    select(parent)
      .append('div')
      .attr('id', 'familySelector');

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
    this.table = attributeDataObj.attributeTable;
    this.columns = this.table.cols();
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
    const menuList = this.$node.append('div')
      .classed('menu-list', true)
      .html(` <ul >
            <li class='brand' data-toggle='collapse'> <i class=''></i> <strong>Data Selection</strong>
             <span class='toggle-btn'><i class='glyphicon glyphicon-menu-hamburger'></i></span></li>
               </ul>`);


    // list that holds data attribute
    // initially all attributes are active
    const activeAttributeList = menuList.append('div')
      .attr('id', 'active-menu-content')
      .classed('menu-content collapse in', true);

    menuList.append('ul')
      .html(`
       <li class='inactive collapsed active' data-target='#inactive-menu-content' data-toggle='collapse'>
                                  <i class=''></i><strong>Inactive attributes</strong> <span class='arrow'></span>
                                </li>`);


    // list that holds inactive attributes
    // a user can populate this list by dragging elements from the active list
    const inactiveAttributeList = menuList.append('div')
      .attr('id', 'inactive-menu-content')
      .classed('menu-content sub-menu collapse in fade', true);
    // .html(`
    // <li class='placeholder'>DRAG AND DROP ATTRIBUTES HERE TO MAKE THEM INACTIVE</li>`);


    // Active sortable list
    Sortable.create(document.getElementById('active-menu-content'), {
      group: 'menu-content',
      ghostClass: 'ghost',
      animation: 150,
      pull: true,
      put: true,
      onAdd(evt) {
        const item = {
          name: evt.item.getElementsByTagName('strong')[0].textContent,
          newIndex: evt.newIndex
        };
        events.fire('attribute_added', item);

      },
      onUpdate(evt) {
        const item = {
          name: evt.item.getElementsByTagName('strong')[0].textContent,
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
      onAdd(evt) {
        const item = {
          name: evt.item.getElementsByTagName('strong')[0].textContent,
          newIndex: evt.newIndex,
          oldIndex: evt.oldIndex
        };

        select('.placeholder')
          .style('display', 'none');

        events.fire('attribute_removed', item);
      },

    });

    this.columns.forEach((column) => {
      this.addAttribute(column.desc.name, column.desc.value.type);
    });


  }

  /***
   *
   * @param columnName
   * @param columnDesc
   */
  private addAttribute(columnName, columnDesc) {


    //if this is an active attribute then add it to the active list otherwise add it to the inactive list
    let list = '';
    if (this.activeColumns.indexOf(columnName) > -1) {
      list = '#active-menu-content';
    } else {
      list = '#inactive-menu-content';
    }

    // we first add a div that holds the li and the svg
    const attributeElm = select(list).append('div');

    //append the header as a menu option
    const attrHeader = attributeElm.append('li')
      .classed('collapsed active', true)
      .attr('data-target', '#' + columnName)
      .attr('data-toggle', 'collapse');

    attrHeader.append('a').attr('href', '#')
      .html('<i class=\'glyphicon glyphicon-chevron-right\'></i>')
      .append('strong').html(columnName)
      .append('span').attr('class', columnDesc)
      .html(`<div class=' attr_badges pull-right'>
                <span class=' badge' >primary</span>
                <span class=' badge' >secondary</span>
              </div>`);
    attrHeader.on('mouseover', function () {
      select(this).select('.sort_handle').classed('focus', true);
      if (list === '#active-menu-content') {
        select(this).select('.attr_badges').classed('focus', true);
      }
    });

    attrHeader.on('mouseout', function () {
      select(this).select('.sort_handle').classed('focus', false);
      select(this).select('.attr_badges').classed('focus', false);
    });

    attrHeader.on('click', function () {
      $('.glyphicon', this).toggleClass('glyphicon-chevron-right');
      $('.glyphicon', this).toggleClass('glyphicon-chevron-down');

    });

    selectAll('.badge').on('click', function () {
      console.log('badge clicked');
      const badge = $(this).text();
      const attribute = $(this).closest('strong').contents()[0];
      //reset badge dispaly for previously clicked badges
      $('.checked_' + badge).parent().css('display', '');
      $('.checked_' + badge).parent().children().css('display', '');
      $('.checked_' + badge).removeClass('.checked_' + badge);

      $(this).parent().css('display', 'inline');
      $(this).parent().children().css('display', 'none');
      $(this).addClass('checked_' + badge);
      $(this).css('display', 'inline');

      events.fire('attribute_selected', {attribute, badge});

    });

    // append svgs for attributes:
    const attributeSVG = attributeElm.append('ul')
      .attr('id', columnName)
      .classed('sub-menu collapse fade', true)
      .append('svg')
      .attr('id', columnName + '_svg')
      .classed('attribute_svg', true);

    this.populateData(this.$node.select('#' + columnName + '_svg').node(), columnName, columnDesc);

  }

  /***
   * This function takes an svg as an input and populate it with vis element
   * for a specific attribute
   *
   */
  private async populateData(svg, attributeName, attributeType) {
    //console.log(await this.table.colData(attribute));

    console.log('populateData');
    let dataVec: IAnyVector;
    // getting data as IVector for attributeName
    // we need to use col(index) so we can get IVector object
    // since we don't have indices for columns, we are iterating though
    // columns and get the matched one
    for (const col in this.columns) {
      if (this.columns[col].desc.name === attributeName) {
        dataVec = await this.table.col(col);
      }
    }

    if (dataVec.desc.value.type === VALUE_TYPE_CATEGORICAL) {
      const catVector = <ICategoricalVector> dataVec;
      const attributeHistogram = histogram.create(svg);
      await attributeHistogram.init(attributeName, dataVec);
    } else {
      const numVector = <INumericalVector> dataVec;
      console.log('Stats on a vector:');
      console.log(await numVector.stats());
    }

    /*

     const dataVec = await this.table.colData(attributeName);
     if(attributeType === 'categorical'){
     //catVector = <ICategoricalVector> this.table.colData(4);
     //console.log('The histogram:');
     console.log(await catVector.hist());
     } else {
     /*numVector = <INumericalVector> this.table.colData(attributeName);
     console.log('Stats on a vector:');
     console.log(await numVector.stats());
     }

     if(attributeType === VALUE_TYPE_INT) {
     // const attributeHistogram = histogram.create(svg);
     // attributeHistogram.init(dataVec);

     const numVector = <INumericalVector> this.table.col(5);
     console.log('3rd value from the 5th vector:' + await numVector.at(3));
     console.log('Stats on a vector:');
     console.log(await numVector.stats());
     }
     */


  }


  private attachListener() {

    //Set listener for click event on corresponding node that changes the color of that row to red
    events.on('node_clicked', (evt, item) => {
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
 * @returns {AttributePanel}
 */
export function create(parent: Element) {
  return new AttributePanel(parent);
}
