import {select, selectAll, event} from 'd3-selection';
import {scaleLinear, scaleBand} from 'd3-scale';
import {max, min, ticks, range, extent} from 'd3-array';
import {axisTop, axisLeft, axisRight, axisBottom} from 'd3-axis';
import {set} from 'd3-collection';
import {VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT, VALUE_TYPE_REAL} from 'phovea_core/src/datatype';
import {ICategoricalVector, INumericalVector} from 'phovea_core/src/vector/IVector';
import {IAnyVector} from 'phovea_core/src/vector';
import * as events from 'phovea_core/src/event';
import {transition} from 'd3-transition';
import {easeLinear} from 'd3-ease';
import {format} from 'd3-format';
import {brushX, brushSelection} from 'd3-brush';

import {IHistogram, rangeHist} from 'phovea_core/src/math';
import {line} from 'd3-shape';

import {Config} from './config';
import {isNull} from 'util';


class Histogram {
  //DOM elements
  private $node;
  private attrName;
  private type;
  private $histogram;
  private $histogramCols;
  //settings

  private margin = {top: 40, right: 30, bottom: 5, left: 50};
  private width = Config.panelSVGwidth;
  private height = Config.panelAttributeHeight*0.8;

  //data vector is of type IVector
  private dataVec;
  // array of data
  private data;
  // categories specified in the data desc
  private categories = [];
  //histogram data
  private histData = [];


  constructor(parent: Element) {
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


  private async update(dataVec) {
    if (this.type === VALUE_TYPE_CATEGORICAL) {
      await this.renderCategoricalHistogram(dataVec);
      // await this.renderCategoricalBar(dataVec);
    } else if (this.type === VALUE_TYPE_INT || this.type === VALUE_TYPE_REAL) {
      await this.renderNumHistogram(dataVec);
    } else if (this.type === 'string') {

    }

    selectAll('.bar').on('click', function (d) {
      if (select(this).classed('picked')) {
        select(this).classed('picked', false);
      } else {
        selectAll('.picked').classed('picked', false);
        select(this).classed('picked', true);
      }
    });


  }


  /**
   * This function renders the histogram for categorical attribute in the attribute panel
   *
   */
  private async renderCategoricalBar(dataVec) {

    const categoricalDataVec = <ICategoricalVector>dataVec;

    const numElements = categoricalDataVec.length;

    const histData: IHistogram = await categoricalDataVec.hist();
    // console.log(histData)
    const catData = [];
    histData.forEach((d, i) => catData.push({key: histData['categories'][i], value: d}));
    // console.log('Cate', catData);

    //scales
    let xScale = scaleBand();
    let yScale = scaleLinear();

    //scales
    xScale.rangeRound([0, this.width]).padding(0.6)
      .domain(catData.map(function (d) {
        return d.key;
      }));

    yScale.rangeRound([this.height, 0])
    // .domain([0, numElements]);
      .domain([0, max(catData, function (d) {
        return d.value;
      })]);

    if (this.$node.selectAll('.svg-g').size() === 0) {
      this.$node.append('g')
        .attr('transform', 'scale(0.8,0.6) translate(' + this.margin.left + ',' + this.margin.top + ')')
        .attr('class', 'svg-g');
    }

    const element = this.$node.selectAll('.svg-g');

    //axis
    const xAxis = element.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.height + ')')
      .call(axisTop(xScale));

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
      .attr('transform', 'translate(' + this.margin.left + ',0)')

    barContainer
      .selectAll('.catBar')
      .data(catData)
      .enter().append('rect')
      .classed('catBar', true)
      .classed('bar', true)
      .attr('x', (d) => {
        return xScale(d.key);
      })
      .attr('y', (d) => {
        return yScale(d.value);
      })
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => {
        return this.height - yScale(d.value);
      })
      // .attr('fill', 'rgb(226, 225, 224)')
      .attr('attribute', this.attrName);

    // barContainer
    //   .selectAll('.barLabel')
    //   .data(catData)
    //   .enter()
    //   .append('text')
    //   .attr('class','barLabel')
    //   .text((d)=>{
    //     return Math.round(d.value/numElements *100 ) + '%';
    //   })
    //   .attr('x', (d)=> {
    //     return xScale(d.key)+xScale.bandwidth()/2;
    //   })
    //   .attr('y',(d)=> {
    //     return yScale(d.value)-2;
    //   })
    //   .attr('opacity',1)
    //   .attr('text-anchor','middle');


    // selectAll('.catBar').on('click', function (d) {
    //   const item = {
    //     name: select(this).attr('attribute'),
    //     value: d['key']
    //   };
    //
    //   if (select(this).classed('picked')) {
    //     events.fire('attribute_unpicked', item);
    //   } else {
    //     events.fire('attribute_picked', item);
    //   }
    //
    // });


  }


  /**
   * This function renders the histogram for categorical attribute in the attribute panel
   *
   */
  private async renderCategoricalHistogram(dataVec) {

    const categoricalDataVec = <ICategoricalVector>dataVec;

    const numElements = categoricalDataVec.length;

    const histData: IHistogram = await categoricalDataVec.hist();
    // console.log(histData)
    const catData = [];
    histData.forEach((d, i) => catData.push({key: histData['categories'][i], value: d}));
    // console.log('Cate', catData);

    let t = transition('t').duration(500).ease(easeLinear);

    //scales
    let xScale = scaleBand();
    let yScale = scaleLinear();

    //scales
    xScale.rangeRound([0, this.width]).padding(0.6)
      .domain(catData.map(function (d) {
        return d.key;
      }));

    yScale.rangeRound([this.height, 0])
    // .domain([0, numElements]);
      .domain([0, max(catData, function (d) {
        return d.value;
      })]);

    if (this.$node.selectAll('.svg-g').size() === 0) {
      this.$node.append('g')
        .attr('transform', 'scale(0.6,0.6) translate(' + this.margin.left + ',' + this.margin.top + ')')
        .attr('class', 'svg-g');
    }

    const element = this.$node.selectAll('.svg-g');

    //axis
    const xAxis = element.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.height + ')')
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
      .attr('transform', 'translate(' + this.margin.left + ',0)')

    barContainer
      .selectAll('.catBar')
      .data(catData)
      .enter().append('rect')
      .classed('catBar', true)
      .classed('bar', true)
      .attr('x', (d) => {
        return xScale(d.key);
      })
      .attr('y', (d) => {
        return yScale(d.value);
      })
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => {
        return this.height - yScale(d.value);
      })
      // .attr('fill', 'rgb(226, 225, 224)')
      .attr('attribute', this.attrName);

    // barContainer
    //   .selectAll('.barLabel')
    //   .data(catData)
    //   .enter()
    //   .append('text')
    //   .attr('class','barLabel')
    //   .text((d)=>{
    //     return Math.round(d.value/numElements *100 ) + '%';
    //   })
    //   .attr('x', (d)=> {
    //     return xScale(d.key)+xScale.bandwidth()/2;
    //   })
    //   .attr('y',(d)=> {
    //     return yScale(d.value)-2;
    //   })
    //   .attr('opacity',1)
    //   .attr('text-anchor','middle');


    // selectAll('.catBar').on('click', function (d) {
    //   const item = {
    //     name: select(this).attr('attribute'),
    //     value: d['key']
    //   };
    //
    //   if (select(this).classed('picked')) {
    //     events.fire('attribute_unpicked', item);
    //   } else {
    //     events.fire('attribute_picked', item);
    //   }
    //
    // });


  }



  /**
   * This function renders the histogram for numerical attribute in the attribute panel
   *
   */
  private async renderNumHistogram(dataVec) {

    let histData = await dataVec.hist(10);
    let range = [0, this.width];

    var data = [],
      cols = scaleLinear<string,string>().domain([, 0]).range(['#111111', '#999999']),
      total = histData.validCount,
      binWidth = (range[1] - range[0]) / histData.bins,
      acc = 0;

    histData.forEach((b, i) => {
      data[i] = {
        v: b,
        acc: acc,
        ratio: b / total,
        valueRange: histData.valueRange,
        name: 'Bin ' + (i + 1) + ' (center: ' + Math.round((i + 0.5) * binWidth) + ')',
        binIndex: i,
        // color: cols((i + 0.5) * binWidth);
        color: cols(b)
      };
      acc += b;

    });

    // console.log(histData.valueRange);

    //let xScale = scaleLinear().range([0,this.width]).domain([0,histData.bins])
    let xScale = scaleLinear().range([0, this.width]).domain(histData.valueRange);//.nice();
    // let yScale = scaleLinear().range([0,height]).domain([0,maxFrequency]);
    let bin2value = scaleLinear().range(histData.valueRange).domain([0, histData.bins]);
    let yScale = scaleLinear().range([0, this.height]).domain([0, histData.largestFrequency]);

    const element = this.$node.append('g')
    // .attr('transform', 'scale(0.8,0.8) translate(20,20)');
      .attr('transform', 'scale(0.6,0.6) translate(' + this.margin.left + ',' + this.margin.top + ')')

    //axis
    const xAxis = element.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.height + ')')
      .call(axisBottom(xScale)
        .tickSize(5)
        .tickValues(xScale.domain())
        .tickFormat(format(".0f")));

    const topAxis = element.append('g')
      .attr('class', 'axis brushAxis')
      .attr('transform', 'translate(' + this.margin.left + ',0)')
      .call(axisTop(xScale)
        .ticks(0))


    const barContainer = element.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',0)')

    barContainer
      .selectAll('.numBar').data(data)
      .enter().append('rect')
      .classed('numBar', true)
      .classed('bar', true)
      // .attr('opacity', 0)
      .attr('width', binWidth * 0.8)
      .attr('height', d => {
        return yScale(d.v)
      })
      .attr('y', d => {
        return (this.height - yScale(d.v))
      })
      .attr('x', (d, i) => {
        return xScale(bin2value(i))
      })
      // .attr('fill', 'rgb(226, 225, 224)')
      // .attr('opacity', 1)


    let brushGroup = barContainer.append("g")
      .attr("class", "brush")


    let brush = brushX()
      .extent([[0, 0], [this.width, this.height]])
      .handleSize(8)
      .on("brush", brushed)
      .on("start end", fireEvent)

    brushGroup
      .call(brush)
      .call(brush.move, xScale.range());

    function brushed() {
      let extent = brushSelection(brushGroup.node());
      let lowerBound = xScale.invert(<Number>extent[0]);
      let upperBound = xScale.invert(<Number>extent[1]);

      let domain = xScale.domain();
      // let allTicks = Array.from(new Set([lowerBound,upperBound].concat(domain)));

      let allTicks=[];
      if (lowerBound !== domain[0] || upperBound !== domain[1]){
        allTicks = [lowerBound,upperBound];
      }

      //Create a tick mark at the edges of the brush
      topAxis.call(axisTop(xScale)
        .tickSize(5)
        .tickValues(allTicks)
        .tickFormat(format(".0f")));

      console.log(lowerBound,upperBound)
    }

    function fireEvent() {
      let extent = brushSelection(brushGroup.node());

      if (isNull(extent)) {
        topAxis.call(axisTop(xScale)
          .ticks(0))
          // .tickValues(xScale.domain())
          // .tickFormat(format(".0f")));



      }else{
        // let lowerBound = xScale.invert(<Number>extent[0]);
        // let upperBound = xScale.invert(<Number>extent[1]);
      }

    }





    // selectAll('.numBar').on('click', function (d, i) {
    //   bin2value.range(d['valueRange']);
    //   //getting the range of the selected bin
    //   const binIndex = parseInt(d['binIndex']);
    //   const diff = (d['valueRange'][1] - d['valueRange'][0]) / 10;
    //   const lowerBound = Math.floor(d['valueRange'][0] + (diff * binIndex));
    //   const upperBound = Math.floor(d['valueRange'][0] + (diff * (binIndex + 1)));
    //
    //   // console.log(bin2value.range())
    //   // console.log('selected bin range', lowerBound);
    //   // console.log('selected bin range', upperBound);
    //   // console.log('num bar', d);
    //   // console.log('num bar', i);
    //   // console.log('num bar', bin2value(binIndex));
    //
    //
    //   const item = {
    //     name: select(this).attr('attribute'),
    //     value: [lowerBound, upperBound]
    //   };
    //
    //   if (select(this).classed('picked')) {
    //     events.fire('attribute_unpicked', item);
    //   } else {
    //     events.fire('attribute_picked', item);
    //   }
    //
    // });


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
export function create(parent: Element) {
  return new Histogram(parent);
}
