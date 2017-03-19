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
import {isNullOrUndefined} from 'util';


class Histogram {
  //DOM elements
  private $node;
  public attrName;
  private type;
  private $histogram;
  private $histogramCols;
  //settings

  private margin = {top: 40, right: 30, bottom: 5, left: 65};
  private width = Config.panelSVGwidth;
  private height = Config.panelAttributeHeight*0.8;

  private xScale;
  private yScale;

  private brush;

  //data vector is of type IVector
  private dataVec;
  // array of data
  private data;
  // categories specified in the data desc
  private categories = [];


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

    this.xScale = scaleLinear().range([0, this.width]).domain([0,1]);
    this.yScale = scaleLinear().range([0, this.height]).domain([0,1]);
    this.update(dataVec);
    this.attachListener();

    //return the promise
    return Promise.resolve(this);
  }


  private async update(dataVec) {
    if (this.type === VALUE_TYPE_CATEGORICAL) {
      await this.renderCategoricalHistogram(dataVec);
    } else if (this.type === VALUE_TYPE_INT || this.type === VALUE_TYPE_REAL) {
      await this.renderNumHistogram(dataVec);
    } else if (this.type === 'string') {
    }
  }

  /**
   * Removes all interaction from the  histogram. (brushes and selecting bars)
   */
  public clearInteraction(){
    this.removeBrush();
    this.removeCategorySelection();
  }

  /**
   * Adds ability to hover and click to select histogram bars.
   */
  private addCategorySelection() {

    let attrName = this.attrName;

    this.$node.selectAll('.catBar').on('click', function (d:any) {
      if (select(this).classed('picked')) {
        select(this).classed('picked', false);
        events.fire('poi_selected',{'name':attrName, 'callback':(attr:String) => {return false}}) //if a bar is unclicked affected State is false for all
      } else {
        selectAll('.picked').classed('picked', false);
        select(this).classed('picked', true);
      }

      events.fire('poi_selected',{'name':attrName, 'callback':(attr:String) => {return attr === d.key}})

    });

  }

  /**
   * Set categorical bar as selected.
   */
  public setSelected(category){

    if (this.type !== 'categorical'){
      return;
    }
    //Bars are not clickable
    if (isNullOrUndefined(this.$node.select('.catBar').on('click'))) {
      this.addCategorySelection();
    }
    //select right bar and set classed to picked.
    this.$node.selectAll('.catBar').filter((bar)=>{ return bar.key === category; }).classed('picked',true);
    }


  /**
   * Set categorical bar as primary or secondary.
   */
  public setPrimarySecondary(attributeObj){

    //Only need to set colors for categorical type
    if (this.type !== 'categorical') {
      return;
    }

    //Color Bars appropriately.
    attributeObj.categories.forEach((category,i)=>{
      console.log(category)
      this.$node.selectAll('.catBar').filter((bar)=>{ return bar.key === category; }).attr('fill',attributeObj.color[i]);
    });
  }

  /**
   * Clear coloring for categorical bar as primary or secondary.
   */
  public clearPrimarySecondary(){

    //Only need to set colors for categorical type
    if (this.type !== 'categorical') {
      return;
    }
    //Set Bars back to original color.
      this.$node.selectAll('.catBar').attr('fill','#5f6262');
  }





  /**
   * Remove ability to select categories.
   */
  private removeCategorySelection(){
    this.$node.selectAll('.catBar').classed('picked',false)
    this.$node.selectAll('.catBar').on('click', null);
  }

  /**
   * Adds a brush to this histogram.
   */
  private addBrush(){

    let attrName = this.attrName;

    let element = this.$node;
    let xScale = this.xScale;

    const topAxis = element.select('g').append('g')
      .attr('class', 'axis brushAxis')
      .attr('transform', 'translate(' + this.margin.left + ',0)')
      .call(axisTop(xScale)
        .ticks(0))

    let brushGroup = element.select('.barContainer').append("g")
      .attr("class", "brush")


    let brush = brushX()
      .extent([[0, 0], [this.width, this.height]])
      .handleSize(8)
      .on("brush", brushed)
      .on("end", fireEvent)

    brushGroup
      .call(brush)
      .call(brush.move, xScale.range());

    this.brush = brush; //save as class variable since we will need to modify it later when user clicks on POI

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
    }

    function fireEvent() {
      let extent = brushSelection(brushGroup.node());

      if (isNull(extent)) { //user cleared brush entirely
        topAxis.call(axisTop(xScale)
          .ticks(0))
        if (!isNull(event.sourceEvent)){ //user cleared brush, nobody is 'affected'
          events.fire('poi_selected',{'name':attrName, 'callback':(attr:Number) => {return false} })
        }
      }else{
        console.log('extent is ', extent);
        if (!isNull(event.sourceEvent)){ //ideally will check if sourceEvent === MouseEvent but that check doesn' work...
          events.fire('poi_selected',{'name':attrName, 'callback':(attr:Number) => {return attr >= xScale.invert(extent[0]) && attr <= xScale.invert(extent[1])} })
        }

      }

    }

  }

  /**
   * Sets the brush extent for this histogram.
   */
  public setBrush(threshold) {

    if (!this.brush){ //no brush exists. define default
      console.log('threshold is ', threshold)
      this.addBrush();
      this.$node.select('.brush')
        .call(this.brush.move, [this.xScale(threshold), this.xScale.range()[1]]);
    }

  }

  /**
   * Removes the brush from this histogram
   */
  private removeBrush() {
      this.$node.select('.brush').remove()
      this.$node.select('.brushAxis').remove();
      this.brush = undefined;
  }

    /**
   * This function renders the histogram for categorical attribute in the attribute panel
   *
   */
  private async renderCategoricalHistogram(dataVec) {

    let currentHist = this.$node;

    const categoricalDataVec = <ICategoricalVector>dataVec;

    const numElements = categoricalDataVec.length;

    const histData: IHistogram = await categoricalDataVec.hist(10);
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


    if (currentHist.selectAll('.svg-g').size() === 0) {
      currentHist.append('g')
        .attr('transform', 'scale(0.6,0.6) translate(' + this.margin.left + ',' + this.margin.top + ')')

          .attr('class', 'svg-g');

      let element = currentHist.selectAll('.svg-g');

      element.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(' + this.margin.left + ',' + this.height + ')')
        .call(axisBottom(xScale).tickFormat((d)=>{return d[0]}));


      element.append('g')
        .classed('barContainer',true)
        .attr('transform', 'translate(' + this.margin.left + ',0)')



    }


    let bars = currentHist
      .select('.barContainer')
      .selectAll('.catBar')
      .data(catData);

    let barsEnter = bars
      .enter().append('rect')
      .classed('catBar', true)
      .classed('bar', true)
      .attr('fill','#5f6262');

    bars = barsEnter.merge(bars);

    bars.exit().remove();

    bars
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
      .attr('attribute', this.attrName);

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

    //let xScale = scaleLinear().range([0,this.width]).domain([0,histData.bins])
    this.xScale.domain(histData.valueRange);//.nice();
    // let yScale = scaleLinear().range([0,height]).domain([0,maxFrequency]);
    let bin2value = scaleLinear().range(histData.valueRange).domain([0, histData.bins]);
    this.yScale.domain([0, histData.largestFrequency]);

    const xScale = this.xScale;

    const currentHist = this.$node;

    if (currentHist.select('.elementGroup').size() === 0){

      let element = currentHist.append('g')
        .classed('elementGroup',true)
        .attr('transform', 'scale(0.6,0.6) translate(' + this.margin.left + ',' + this.margin.top + ')')

      //axis
      element.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(' + this.margin.left + ',' + this.height + ')')
        .call(axisBottom(xScale)
          .tickSize(5)
          .tickValues(xScale.domain())
          .tickFormat(format(".0f")));


     element.append('g')
        .attr('transform', 'translate(' + this.margin.left + ',0)')
        .attr('class','barContainer')

    }

    let bars = currentHist
      .select('.barContainer')
      .selectAll('.numBar')
      .data(data);


    let barsEnter = bars
      .enter()
      .append('rect')
      .classed('numBar', true)
      .classed('bar', true);

    bars = barsEnter.merge(bars);

    bars.exit().remove();

    bars
      .attr('width', binWidth * 0.8)
      .attr('height', d => {
        return this.yScale(d.v)
      })
      .attr('y', d => {
        return (this.height - this.yScale(d.v))
      })
      .attr('x', (d, i) => {
        return xScale(bin2value(i))
      })

    // this.addBrush(); //For now only add brush when the POI button is clicked
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
