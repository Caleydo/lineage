

import * as events from 'phovea_core/src/event';
import {AppConstants, ChangeTypes} from './app_constants';
import * as d3 from 'd3';

/**
 * Shows a bar with buttons to filter other views
 */
class FilterBar{

  private $node;

  constructor(parent: Element, private options: any) {
    this.$node = d3.select(parent)
      .append('div')
      .classed('filter_bar', true);
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

    this.$node.html(` <div id="nav-bar">  
      <div class="btn-group change" role="group" aria-label="...">
         <button type="button" class="btn btn-default active" id="btn-nochange" data-change-type="${ChangeTypes.NO_CHANGE.type}">No changes</button>
         <button type="button" class="btn btn-default active" id="btn-removed" data-change-type="${ChangeTypes.REMOVED.type}">Removed</button>
         <button type="button" class="btn btn-default active" id="btn-added" data-change-type="${ChangeTypes.ADDED.type}">Added</button>
         <button type="button" class="btn btn-default active" id="btn-content" data-change-type="${ChangeTypes.CONTENT.type}">Content</button>        
      </div>  
         
      <div class="btn-group filter" role="group" aria-label="...">
        <button type="button" class="btn btn-default toggleTimeline" id="btn-timeline" data-change-type="timefilter">Show/Hide Timeline</button> 
        <!--<button type="button" class="btn btn-default toggleGroup" id="btn-group">Group Changes</button> 
        <button type="button" class="btn btn-default" id="btn-stacked">Show as stacked bars</button>-->
     </div>
     </div>`);

  }

  private attachListener() {

    this.$node.select('.toggleTimeline')
      .on('click', function (e) {
        events.fire(AppConstants.EVENT_TOGGLE_TIMELINE);
      });

    this.$node.select('.toggleGroup')
      .on('click', function (e) {
        events.fire(AppConstants.EVENT_TOGGLE_GROUP);
      });

    this.$node.selectAll('.btn-group.change button')
      .on('click', function (e) {
        const button = d3.select(this);
        const selectedType = ChangeTypes.TYPE_ARRAY.filter((d) => d.type === button.attr('data-change-type'))[0];

        if (button.classed('active')) {
          selectedType.isActive = false;
          events.fire(AppConstants.EVENT_HIDE_CHANGE, selectedType);

        } else {
          selectedType.isActive = true;
          events.fire(AppConstants.EVENT_SHOW_CHANGE, selectedType);
        }

        button.classed('active', selectedType.isActive);
      });
  }

}

/**
 * Factory method to create a new Histogram2D instance
 * @param parent
 * @param options
 * @returns {FilterBar}
 */
export function create(parent: Element, options: any) {
  return new FilterBar(parent, options);
}
