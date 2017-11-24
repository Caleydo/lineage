import * as events from 'phovea_core/src/event';
import { AppConstants, ChangeTypes } from './app_constants';
import * as Sortable from 'sortablejs';
import * as $ from 'jquery';
import { select, selectAll, event } from 'd3-selection';
import { keys } from 'd3-collection';
import { IAnyVector } from 'phovea_core/src/vector';
import { ICategoricalVector, INumericalVector } from 'phovea_core/src/vector/IVector';
import * as histogram from './histogram';
import { VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT, VALUE_TYPE_REAL } from 'phovea_core/src/datatype';
import * as range from 'phovea_core/src/range';

import { COL_ORDER_CHANGED_EVENT, FAMILY_SELECTED_EVENT } from './tableManager';


import { Config } from './config';
import { isNullOrUndefined } from 'util';

/**
 * Creates the attribute table view
 */
class AttributePanel {

  private $node;

  // access to all the data in our backend
  private table;
  private columns;
  private activeColumns = [];
  private histograms = [];
  private attributeState = [];

  private allColumns;

  private tableManager;

  private collapsed = false;


  constructor(parent: Element) {

    //toggle btn
    // select(parent).append('span')
    //   .attr('id', 'toggle-btn')
    //   .append('i')
    //   .classed('glyphicon glyphicon-menu-hamburger', true);


    this.$node = select(parent);
    // .append('div')
    // .attr('id', 'panelContent')
    // .classed('nav-side-menu active', true);
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<FilterBar>}
   */
  init(attributeDataObj) {

    this.tableManager = attributeDataObj;
    this.tableManager.colOrder = this.tableManager.defaultCols;
    this.activeColumns = this.tableManager.defaultCols;

    const allCols = this.tableManager.graphTable.cols().concat(this.tableManager.tableTable.cols());

    //Order columns according to 'defaultCols' order;
    const orderedCols = [];
    this.tableManager.colOrder.forEach((col) => {
      orderedCols.push(allCols.find((el) => { return el.desc.name === col; }));
    });

    // console.log(orderedCols);

    this.columns = orderedCols.concat(allCols.filter((c) => { return orderedCols.indexOf(c) < 0; }));
    this.allColumns = orderedCols.concat(allCols.filter((c) => { return orderedCols.indexOf(c) < 0; }));

    // this.update();
    this.build();
    this.attachListener();

    //this.tableManager.setAffectedState('suicide');
     this.tableManager.setAffectedState('affected');

    // select('.suicide').select('#poi').each(function () {
    //   const onClickFunc = select(this).on('click');
    //   onClickFunc.apply(this);
    // });

    // return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
   * Build the basic DOM elements and binds the change function
   */
  private build() {
    // family selector

    this.$node.append('nav').attr('class', 'navbar navbar-expand-lg navbar-light bg-light')
      .append('div').attr('id', 'tableNav');

    this.$node.select('#tableNav')
      .append('a').attr('class', 'navbar-brand')
      .html('Family Selector');

    const dropdownMenu = this.$node.select('.navbar')
      .append('ul').attr('class', 'nav navbar-nav');

    const list = dropdownMenu
      .append('li')
      .append('a')
      .attr('class', 'btn-link')
      .attr('role', 'button')
      .html('Expand')
      .attr('id', 'collapseTableButton');




    const familySelector = this.$node.append('div')
      .attr('id', 'familySelector');
    // .classed('menu-list', true)
    // .html(` <ul >
    //       <li class='brand' data-toggle='collapse'> <i class=''></i> <strong>Family and Data Selection</strong></li>
    //          </ul>`);

    //<span class='toggle-btn'><i class='glyphicon glyphicon-menu-hamburger'></i></span>

    // menu container container
    const menuList = this.$node.append('div')
      .classed('menu-list', true);


    menuList.append('ul').html(`<li class='inactive collapsed active' data-target='#active-menu-content' data-toggle='collapse'>
    <strong>Data Selection</strong><span class='arrow'></span></li>`);


    // list that holds data attribute
    // initially all attributes are active
    const activeAttributeList = menuList.append('div')
      .attr('id', 'active-menu-content')
      .classed('menu-content sub-menu collapse in fade', true);

    menuList.append('ul')
      .html(`<li class='inactive collapsed active' data-target='#inactive-menu-content' data-toggle='collapse'>
       <strong>Inactive attributes</strong> <span class='arrow'></span></li>`);



    // list that holds inactive attributes
    // a user can populate this list by dragging elements from the active list
    const inactiveAttributeList = menuList.append('div')
      .attr('id', 'inactive-menu-content')
      .classed('menu-content sub-menu collapse in fade', true);


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

    // populate the panel with attributes
    this.allColumns.forEach((column) => {
      this.addAttribute(column.desc.name, column.desc.value.type);
    });

    events.on('primary_secondary_selected', (evt, item) => {

      const attribute = this.tableManager[item.primary_secondary + 'Attribute'];

      //A primary or secondary attribute had been previously defined
      if (attribute) {
        //Clear previously colored histogram for primary/secondary
        const previousHist = this.histograms.filter((h) => {
          return h.attrName === attribute.name;
        });

        if (previousHist.length > 0) {
          previousHist[0].clearPrimarySecondary();
        }
      }

      const otherAttributePrimarySecondary = ['primary', 'secondary'].filter((a) => { return a !== item.primary_secondary; });
      const otherAttribute = this.tableManager[otherAttributePrimarySecondary + 'Attribute'];

      //If the attribute you are setting as secondary is the same as the one you had as primary, (or vice versa) set the primary (secondary) to undefined;
      if (otherAttribute && item.name === otherAttribute.name) {
        this.tableManager[otherAttributePrimarySecondary + 'Attribute'] = undefined;
      }

      this.tableManager.setPrimaryAttribute(item.name, item.primary_secondary).then((obj) => {

        const hist = this.histograms.filter((h) => { return h.attrName === item.name; })[0];
        hist.setPrimarySecondary(obj);

      });
    });

    events.on('poi_selected', (evt, item) => {

      this.tableManager.setAffectedState(item.name, item.callback).then((obj) => {

        //find histogram with this name and set the brush extent
        const hist = this.histograms.filter((h) => { return h.attrName === item.name; })[0];
        if (obj.threshold !== undefined) { //setAffectedState returned a default value. Was not set by user brushing or selecting bar;

          //New POI has been set, remove all other brush and rect selection interactions;
          this.histograms.map((hist) => { hist.clearInteraction(); });
          // if (obj.type === VALUE_TYPE_CATEGORICAL) {
          //   hist.setSelected(obj.threshold);
          // } else if (obj.type === VALUE_TYPE_REAL || obj.type === VALUE_TYPE_INT) {
          //   hist.setBrush(obj.threshold);
          // }

        }

      });
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
    const attributeElm = select(list).append('div')
      .classed('attrDiv', true)
      .attr('id', columnName);

    //append the header as a menu option
    const attrHeader = attributeElm.append('li')
      .classed('collapsed active', true)
      .style('background', 'none')
      .attr('data-target', '#' + columnName);
    // .attr('data-toggle', 'collapse');

    const header = attrHeader.append('a').attr('href', '#')
      //.html('<i class=\'glyphicon glyphicon-chevron-right\'></i>')
      .append('strong').html(columnName)
      .append('span')
      .classed(columnDesc, true)
      .classed(columnName, true) //used to later programatically select and trigger the onClick callbacks of these badges
      .html(`<div class=' attr_badges pull-right'>
                <!--<span class=' badge' id ='add_remove'>-</span> -->
                        
                <span class='badge' id ='primary'>A</span>
                <span class='badge' id ='poi'>POI</span>
                 
              </div>`);


    attrHeader.selectAll('.sort_handle').classed('focus', true);
    // attrHeader.selectAll('.attr_badges').classed('focus', true);
    attrHeader.on('mouseover', function () {
      select(this).select('.sort_handle').classed('focus', true);
      if (list === '#active-menu-content') {
        select(this).selectAll('.badge').classed('focus', true);
      }
    });

    attrHeader.on('mouseout', function () {
      select(this).select('.sort_handle').classed('focus', false);
      select(this).selectAll('.badge').classed('focus', false);
    });

    attrHeader.on('click', function () {
      $('.glyphicon', this).toggleClass('glyphicon-chevron-right');
      $('.glyphicon', this).toggleClass('glyphicon-chevron-down');

    });

    selectAll('.badge').on('click', function () {
      const badge = select(this).attr('id');
      const attribute = $(this).closest('strong').contents()[0];
      //reset badge display for previously clicked badges
      $('.checked_' + badge).css('display', '');
      $('.checked_' + badge).parent().children().css('display', '');
      $('.checked_' + badge).removeClass().addClass('badge');


      // check if siblings has checked badge
      $(this).parent().children().each(function () {
        if (select(this).attr('class').indexOf('checked_') > -1) { //&& (badge == 'primary' || badge === 'secondary')) {
          if (!$(this).hasClass('checked_poi')) {
            $(this).removeClass().addClass('badge');
            $(this).css('display', '');
          }
        }
      });

      $(this).parent().css('display', 'inline');
      //$(this).parent().children().css('display', 'none');
      $(this).addClass('checked_' + badge);
      $(this).css('display', 'inline');
      $(this).css('margin-right', '10px');

      if (!isNullOrUndefined(event)) {
        event.stopPropagation();
      }


      if (badge === 'primary' || badge === 'secondary') {
        events.fire('primary_secondary_selected', { 'name': attribute.nodeValue, 'primary_secondary': badge });
      } else if (badge === 'poi') {
        selectAll('.attrDiv').classed('selectedDIV', false);

        //set class to this div to color appropriately.
        select('#' + attribute.nodeValue).classed('selectedDIV', true);
        events.fire('poi_selected', { 'name': attribute.nodeValue });
      }
    });

    /**
     * Generate SVG for these type only
     */
    if ([VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT, VALUE_TYPE_REAL].indexOf(columnDesc) > -1) {

      // append svgs for attributes:
      const attributeSVG = attributeElm
        // .select('li')
        .append('ul')
        .attr('id', columnName);

      //Only append new svg if there isn't already one there
      if (attributeElm.select('.attribute_svg').size() === 0) {
        // .classed('sub-menu collapse fade in', true)
        attributeElm
          .append('svg')
          .style('margin-top', '-50px')
          .attr('height', Config.panelAttributeHeight)
          .attr('width', Config.panelSVGwidth)
          .attr('id', columnName + '_svg')
          .classed('attribute_svg', true);
      }

      // this.populateData(this.$node.select('#' + columnName + '_svg').node(), columnName, columnDesc);
    }

  }


  /***
   * This function takes an svg as an input and populate it with vis element
   * for a specific attribute
   *
   */
  private async populateData(svg, attributeName, attributeType) {
    //console.log(await this.table.colData(attribute));

    // console.log('populateData');
    let dataVec: IAnyVector;
    // getting data as IVector for attributeName
    // we need to use col(index) so we can get IVector object
    // since we don't have indices for columns, we are iterating though
    // columns and get the matched one


    this.allColumns.forEach((col) => {
      if (col.desc.name === attributeName) {
        dataVec = col;
      }
    });

    // creat a histogram object if one does not already exist for this attribute
    const currentHist = this.histograms.filter((hist) => { return hist.attrName === attributeName; });
    let attributeHistogram;
    if (currentHist.length === 0) {
      attributeHistogram = histogram.create(svg);
      // add this object to the histogram array
      this.histograms.push(attributeHistogram);

    } else {
      attributeHistogram = currentHist[0];
    }

    // initiate this object
    await attributeHistogram.init(attributeName, dataVec, dataVec.desc.value.type);

    // console.log('initializing ', attributeName, dataVec, dataVec.desc.value.type)

  }

  private update() {
    //get updated data from the tableManager
    const allCols = this.tableManager.graphTable.cols().concat(this.tableManager.tableTable.cols());

    //Order columns according to 'defaultCols' order;
    const orderedCols = [];
    this.tableManager.colOrder.forEach((col) => {
      orderedCols.push(allCols.find((el) => { return el.desc.name === col; }));
    });

    this.columns = orderedCols;

    // const dataVec: IAnyVector;


    this.histograms.forEach((singleHistogram) => {
      this.columns.forEach((col) => {
        if (col.desc.name === singleHistogram.attrName) {
          // console.log(col);
          singleHistogram.update(col);
        }
      });

    });

  }

  /**
   * This function is called when an attribute value is selected
   * it keep track of selected attributes in an array
   * @param attrName
   * @param value
   */
  private updateAttrState(attrName, value) {
    let found = null;
    this.attributeState.forEach(function (item) {
      if (item.name === attrName) {
        found = item;
      }
    });
    if (found) {
      found.value.push(value);
    } else {
      this.attributeState.push({ name: attrName, value: [value] });
    }
  }

  /**
   * This function update the attributestate array when a user deselect an attribute
   *
   */
  private removeFromAttrState(attrName, value) {
    let found = null;

    this.attributeState.forEach(function (item) {
      if (item.name === attrName) {
        found = item;
      }
    });

    if (found) {
      found.value.splice(found.value.indexOf(value), 1);
    }

  }

  private toggle() {
    const sidePanel = document.getElementById('data_selection');
    const sidePanelContent = document.getElementById('panelContent');
    const graphNtable = document.getElementById('graph_table');
    const toggleBtn = document.getElementById('toggle-btn');

    // if the attribute panel is expanded
    if (!this.collapsed) {
      // collapse attribute panel
      sidePanel.style.width = Config.colPanelWidth;
      sidePanel.style.border = 'none';
      toggleBtn.style.marginRight = '-10px';
      //Hide attribute panel content
      sidePanelContent.style.display = 'none';

      // resize graph div
      graphNtable.style.width = Config.expGraphTableWidth;
      //update flag value
      this.collapsed = true;
    } else {
      // expand attribute panel
      sidePanel.style.width = Config.expPanelWidth;
      sidePanel.style.borderRight = 'solid lightgrey';
      toggleBtn.style.marginLeft = '-30px';
      // show attribute panel content
      sidePanelContent.style.display = 'inline';
      // resize graph div
      graphNtable.style.width = Config.colGraphTableWidth;
      //update flag value
      this.collapsed = false;
    }
  }

  private attachListener() {
    // listen to toggle panel event
    select('#toggle-btn').on('click', () => {
      this.toggle();
    });

    //Set listener for click event on corresponding node that changes the color of that row to red
    events.on('node_clicked', (evt, item) => {
      selectAll('.row').classed('selected', function (d) {
        return select(this).attr('id') === 'row_' + item;
      });
    });

    // events.on(FAMILY_SELECTED_EVENT, () => {
    //   this.update();

    // });

    events.on('attribute_picked', (evt, item) => {
      this.updateAttrState(item.name, item.value);
    });

    events.on('attribute_reordered', (evt, item) => {
      this.tableManager.colOrder.splice(item.newIndex, 0, this.tableManager.colOrder.splice(item.oldIndex, 1)[0]);
      events.fire(COL_ORDER_CHANGED_EVENT);

    });

    events.on('attribute_removed', (evt, item) => {
      this.tableManager.colOrder.splice(item.oldIndex, 1);
      events.fire(COL_ORDER_CHANGED_EVENT);

    });

    events.on('attribute_added', (evt, item) => {
      this.tableManager.colOrder.splice(item.newIndex, 0, item.name.split(/\r|\n/)[0]);
      events.fire(COL_ORDER_CHANGED_EVENT);

    });


    events.on('attribute_unpicked', (evt, item) => {
      this.removeFromAttrState(item.name, item.value);

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
