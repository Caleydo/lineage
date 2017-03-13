import {select, selectAll} from 'd3-selection';
import {scaleLinear, scaleBand} from 'd3-scale';
import {max,min,ticks,range,extent} from 'd3-array';
import {axisTop,axisLeft,axisRight,axisBottom} from 'd3-axis';
import {set} from 'd3-collection';
import {VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT, VALUE_TYPE_REAL} from 'phovea_core/src/datatype';
import {ICategoricalVector, INumericalVector} from 'phovea_core/src/vector/IVector';
import {IAnyVector} from 'phovea_core/src/vector';
import * as events from 'phovea_core/src/event';
import {transition} from 'd3-transition';
import {easeLinear} from 'd3-ease';
import {IHistogram, rangeHist} from 'phovea_core/src/math';
import {line} from 'd3-shape';


class Histogram {
  //DOM elements
  private $node;
  private attrName;
  private type;
  private $histogram;
  private $histogramCols;
  //settings
  private margin;
  private width;
  private height;

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
  async init(name, dataVec, type) {
    this.attrName = name;
    this.dataVec = dataVec;
    this.type = type;
    this.categories = dataVec.desc.value.categories;
    this.data = await this.dataVec.data();

    this.update(dataVec);
    this.attachListener();

    //return the promise
    return Promise.resolve(this);
  }


  private update(dataVec){
      if(this.type === VALUE_TYPE_CATEGORICAL){
      this.renderCategoricalHistogram(dataVec);
    } else if(this.type === VALUE_TYPE_INT){
      this.renderNumHistogram(dataVec);
    } else if(this.type === 'string'){

    }
  }


  /**
   * This function renders the histogram for categorical attribute in the attribute panel
   *
   */
  private async renderCategoricalHistogram(dataVec){

    const categoricalDataVec = await <ICategoricalVector>dataVec;
    const histData: IHistogram = await categoricalDataVec.hist();
    console.log(histData)
    const catData = [];
    histData.forEach((d, i) => catData.push({key:histData['categories'][i], value:d}));
    console.log('Cate', catData);

    let t = transition('t').duration(500).ease(easeLinear);

    const padding = 20;
    this.margin = {top: 20, right: 20, bottom: 30, left: 40};
    this.width = 300 - this.margin.left - this.margin.right - padding;
    this.height = 200 - this.margin.top - this.margin.bottom - padding;

      //scales
   let xScale = scaleBand();
   let yScale = scaleLinear();

    //scales
     xScale.rangeRound([0, this.width]).padding(0.6)
      .domain(catData.map(function (d) {
        return d.key;
      }));

     yScale.rangeRound([this.height, 0])
      //.domain([0, this.data.length]);
      .domain([0, max(catData, function (d) {
        return d.value;
      })]);

     if(this.$node.selectAll('.svg-g').size() === 0){
       this.$node.append('g')
         .attr('transform', 'scale(0.8,0.8) translate(20,20)')
         .attr('class','svg-g');
     }

    const element = this.$node.selectAll('.svg-g');

    //axis
    const xAxis = element.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(' + padding + ',' + this.height + ')')
      .call(axisBottom(xScale));
    //yaxis
   /* const yAxis = element.append('g')
      .attr('class', 'axis axis--y')
      .attr('transform', 'translate(' + padding + ',0)')
      .call(axisLeft(yScale.nice()).ticks(3))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '1.71em')
      .attr('text-anchor', 'end')
      .text('Value');*/

    const barContainer = element.append('g')
      .attr('transform', 'translate(' + padding + ',0)')

    barContainer
      .selectAll('.bar')
      .data(catData)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', (d)=> {
        return xScale(d.key);
      })
      .attr('y', (d)=> {
        return yScale(d.value);
      })
      .attr('width', xScale.bandwidth())
      .attr('height', (d)=> {
        return this.height - yScale(d.value);
      })
      .attr('fill', 'rgb(226, 225, 224)')
      .attr('attribute', this.attrName );

    barContainer
      .selectAll('.barLabel')
      .data(catData)
      .enter()
      .append('text')
      .attr('class','barLabel')
      .text((d,i)=>{
        return d.value;
      })
      .attr('x', (d)=> {
        return xScale(d.key)+10;
      })
      .attr('y',(d)=> {
        return yScale(d.value)-2;
      })
      .attr('opacity',1)


    selectAll('.bar').on('click', function (d) {
      if(select(this).classed('picked')){
        select(this).classed('picked', false);
      } else {
         select(this).classed('picked', true);

      }

      const item = {
          name: select(this).attr('attribute'),
          value: d['key']
        };
        events.fire('attribute_cat_picked', item);
    });


  }


  /**
   * This function renders the hitogram for numerical attribute in the attribute panel
   *
   */
  private async renderNumHistogram(dataVec){
    const padding = 20;
    this.margin = {top: 20, right: 20, bottom: 30, left: 40};
    this.width = 300 - this.margin.left - this.margin.right - padding;
    this.height = 200 - this.margin.top - this.margin.bottom - padding;

    let histData = await dataVec.hist(10);
    let range = [0,this.width];

     var data = [],
      cols = scaleLinear<string,string>().domain([,0]).range(['#111111', '#999999']),
      total = histData.validCount,
      binWidth = (range[1] - range[0]) / histData.bins,
      acc = 0;

     console.log(dataVec.name, dataVec.stats, dataVec.hist)
    histData.forEach((b, i) => {
      data[i] = {
        v: b,
        acc: acc,
        ratio: b / total,
        range: histData.range(i),

        name: 'Bin ' + (i + 1) + ' (center: ' + Math.round((i + 0.5) * binWidth) + ')',
        // color: cols((i + 0.5) * binWidth);
        color:cols(b)
      };
      acc += b;

    });


    let xScale = scaleLinear().range([0,this.width]).domain([0,histData.bins])
    // let yScale = scaleLinear().range([0,height*0.8]).domain([0,maxFrequency]);
    let yScale = scaleLinear().range([0,this.height*0.8]).domain([0,histData.largestFrequency]);




    const element = this.$node.append('g')
      .attr('transform', 'scale(0.8,0.8) translate(20,20)');

     //axis
    const xAxis = element.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(' + padding + ',' + this.height + ')')
      .call(axisBottom(xScale).tickSize(5).ticks(1));

    const barContainer = element.append('g')
      .attr('transform', 'translate(' + padding + ',0)')

     barContainer
      .selectAll('.bar').data(data)
       .enter().append('rect')
       .attr('class','bar')
       .attr('opacity',0)
      .attr('width', binWidth*0.8)
      .attr('height', d =>{return yScale(d.v)})
      .attr('y',d =>{return (this.height - yScale(d.v))})
      .attr('x',(d,i) =>{return xScale(i)}).attr('fill', 'rgb(226, 225, 224)')
      .attr('opacity',1)
      .attr('attribute', this.attrName );


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
