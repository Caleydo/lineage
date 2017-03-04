import {select, selectAll} from 'd3-selection';
import {scaleLinear, scaleBand} from 'd3-scale';
import {nest} from 'd3-collection';
import {ICategoricalVector, INumericalVector} from 'phovea_core/src/vector/IVector';
import {IAnyVector} from 'phovea_core/src/vector';


class Histogram {
  //DOM elements
  private $node;
  private $histogram;
  private $histogramCols;
  //settings
  private margin;
  private width;
  private height;
  //scales
  private xScale = scaleBand();
  private yScale = scaleLinear();
  //data vector is of type IVector
  private dataVec ;
  // array of data
  private data ;
  // categories
  private categories;
  //histogram data
  private histData;



  constructor(parent:Element) {
    this.$node = select(parent);
  }

  /**
   * initalize the histogram and return a promise
   * that is resolved as soon the view is completely initialized
   */
  async init(dataVec) {
    console.log('init histogram')
    this.dataVec = dataVec;
    this.categories = dataVec.desc.value.categories;
    this.data = await this.dataVec.data();
    await this.prepData();
    this.build();
    this.attachListener();
    //return the promise
    return Promise.resolve(this);
  }

  /**
   * prepare data for histogram
   * This function aggregiate the sum of elements for each category
   * to populate the histogram data variable histData
   */
  private async prepData() {
    for(const cat of this.categories) {
      const fdata =  await this.dataVec.filter(function(c){
        return c === cat.name;
      });
      console.log(await fdata.data());
    }

    return Promise.resolve(this);
  }

  /**
   * Build the basic DOM elements and binds the change function
   */
  private async build() {
    //console.log(typeof this.dataVecStats);
    //console.log(await this.dataVecStats.stats());
    /*
    this.margin = {top: 20, right: 20, bottom: 30, left: 40};
    this.width = 300 - this.margin.left - this.margin.right;
    this.height = 200 - this.margin.top - this.margin.bottom;
    //scales
    this.xScale.rangeRound([0, this.width]).padding(0.1)
        .domain(this.data.map(function(d) { console.log(d); }));
    this.yScale.rangeRound([this.height, 0]);
*/
  }

  private attachListener() {

  }


}


/**
 * Factory method to create a new instance of the histogram
 * @param parent
 * @param options
 * @returns {histogram}
 */
export function create(parent:Element) {
  return new Histogram(parent);
}
