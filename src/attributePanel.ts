import * as events from 'phovea_core/src/event';
import {AppConstants, ChangeTypes} from './app_constants';
import * as d3 from 'd3';
import {Config} from './config';

/**
 * Creates the attribute table view
 */
class attributePanel {

  private $node;

  constructor(parent:Element) {
    this.$node = d3.select(parent)
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
      .classed('menu-content collapse in',true);

    //adding an item to teh list
    let item1 = menu_content.append('li')
      .classed('collapsed active', true)
      .attr('data-target','#sublist')
      .attr('data-toggel','collapse')
      .append('a').attr('href','#')
      .html('<i><img src=\"http://skyrites.com/projects/spaciux/images/fa-user1.png\" alt=\"\"></i>')
      .append('strong').html('Option 1')
      .append('span')
      .classed('arrow',true);

    let item1 = menu_content.append('li')
      .classed('collapsed active', true)
      .attr('data-target','#products')
      .attr('data-toggel','collapse')
      .append('a').attr('href','#')
      .html('<i><img src=\"http://skyrites.com/projects/spaciux/images/fa-user1.png\" alt=\"\"></i>')
      .append('strong').html('Option 2')
      .append('span')
      .classed('arrow',true);

    //adding sub items to item1 notice that data-target should match
    let sublist = menu_content.append('ul')
      .classed('sub-menu collapse fade',true)
      .attr('id', 'sublist')

    sublist.append('li').attr('class','active').append('a').attr('href','#').html('sub item 1')
    sublist.append('li').append('a').attr('href','#').html('sub item 2')
    sublist.append('li').append('a').attr('href','#').html('sub item 3')






  }

  private attachListener() {

    //Set listener for click event on corresponding node that changes the color of that row to red
    events.on('node_clicked', (evt, item)=> {
      d3.selectAll('.row').classed('selected', function (d) {
        return d3.select(this).attr('id') === 'row_' + item;
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
