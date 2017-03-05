import {select, selectAll} from 'd3-selection';
import {scaleLinear, scaleBand} from 'd3-scale';
import {max,min,ticks,range,extent} from 'd3-array';
import {axisTop,axisLeft,axisRight,axisBottom} from 'd3-axis';
import {set} from 'd3-collection';
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
  private dataVec;
  // array of data
  private data;
  // categories specified in the data desc
  private categories = [];
  //histogram data
  private histData = [];


  constructor(parent:Element) {
    this.$node = select(parent);
  }

  /**
   * initalize the histogram and return a promise
   * that is resolved as soon the view is completely initialized
   */
  async init(dataVec) {
    this.dataVec = dataVec;
    this.categories = dataVec.desc.value.categories;
    this.data = await this.dataVec.data();
    this.prepData();
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
  private prepData() {
    const categories = set(this.data).values();// return array of unique values
    for(const cat of categories){
      const val = this.data.filter(function(elm){
        return elm === cat;
      });
      this.histData.push({key: cat, value:val.length});
    }
/*
    for (const d of this.data) {
      if (this.histData.length === 0) {
        this.histData.push({name: d, value: 1});
      } else {
        for (const c of this.histData) {
          if (c.name === d) {
            c.value = c.value + 1;
          } else {
            this.histData.push({name: d, value: 1});
          }
        }
      }
    }
*/

  }

  /**
   * Build the basic DOM elements and binds the change function
   */
  private async build() {
    const padding = 20;
     this.margin = {top: 20, right: 20, bottom: 30, left: 40};
     this.width = 300 - this.margin.left - this.margin.right - padding ;
     this.height = 200 - this.margin.top - this.margin.bottom - padding;
     //scales
     this.xScale.rangeRound([0, this.width]).padding(0.6)
     .domain(this.histData.map(function(d) { return d.key; }));
     this.yScale.rangeRound([this.height, 0])
       .domain([0, this.data.length]);
       //.domain([0, max(this.histData, function(d){return d.value;})]);
     const g = this.$node.append('g')
    .attr('transform', 'scale(0.8,0.8) translate(20,20)');
    //axis
    const xAxis = g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate('+ padding +',' + this.height + ')')
      .call(axisBottom(this.xScale));
    const yAxis = g.append('g')
    .attr('class', 'axis axis--y')
      .attr('transform', 'translate('+ padding +',0)')
      .call(axisLeft(this.yScale.nice()).ticks(3));
    /*.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('Value');*/

     g.append('g')
       .attr('transform', 'translate('+ padding +',0)')
       .selectAll('.bar')
    .data(this.histData)
    .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', (d)=> { return this.xScale(d.key); })
      .attr('y', (d)=> { return this.yScale(d.value); })
      .attr('width', this.xScale.bandwidth())
      .attr('height', (d)=> { return this.height - this.yScale(d.value); })
       .attr('fill', 'rgb(226, 225, 224)');


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
