import {select, selectAll, event} from 'd3-selection';
import {scaleLinear, scaleBand} from 'd3-scale';
import {max, min, ticks, range, extent, histogram} from 'd3-array';
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


export default class Histogram {
  //DOM elements
  private node;
  public attrName;
  private type;
  private $histogram;
  private $histogramCols;
  //settings

  private margin = {top: 40, right: 30, bottom: 5, left: 65};
  private width;
  private height;

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
    this.node = parent;
  }

  /**
   * initalize the histogram and return a promise
   * that is resolved as soon the view is completely initialized
   */
  async init(name, dataVec, type,width,height) {
    this.attrName = name;
    this.dataVec = dataVec;
    this.type = type;
    this.categories = dataVec.desc.value.categories;
    this.data = await this.dataVec.data();
    this.xScale = scaleLinear().range([0, this.width]).domain([0,1]);
    this.yScale = scaleLinear().range([0, this.height]).domain([0,1]);

    this.width = width;
    this.height = height;

    this.update(dataVec);


    // this.attachListener();

    //return the promise
    return Promise.resolve(this);
  }


  private async update(dataVec) {
    if (this.type === VALUE_TYPE_CATEGORICAL) {
      await this.renderCategoricalHistogram(dataVec);
    } else if (this.type === VALUE_TYPE_INT || this.type === VALUE_TYPE_REAL) {
      await this.renderNumHistogram(dataVec);
    };
    // else if (this.type === 'string') {}
  }

  /**
   * Removes all interaction from the  histogram. (brushes and selecting bars)
   */
  public clearInteraction() {
    this.removeBrush();
    this.removeCategorySelection();
  }

  /**
   * Adds ability to hover and click to select histogram bars.
   */
  private addCategorySelection() {

    const attrName = this.attrName;

    this.node.selectAll('.catBar').on('click', function (d:any) {
      if (select(this).classed('picked')) {
        select(this).classed('picked', false);
        events.fire('poi_selected',{'name':attrName, 'callback':(attr:String) => {return false;}}); //if a bar is unclicked affected State is false for all
      } else {
        selectAll('.picked').classed('picked', false);
        select(this).classed('picked', true);
      }

      events.fire('poi_selected',{'name':attrName, 'callback':(attr:String) => {return attr.toLowerCase() === d.key.toLowerCase();}});

    });

  }

  /**
   * Set categorical bar as selected.
   */
  public setSelected(category) {
    if (this.type !== VALUE_TYPE_CATEGORICAL) {
      return;
    }
    //Bars are not clickable
    if (isNullOrUndefined(this.node.select('.catBar').on('click'))) {
      this.addCategorySelection();
    }

    this.node.selectAll('.catBar').attr('fill','#5f6262');
    //select right bar and set classed to picked.
    this.node.selectAll('.catBar').filter((bar)=> { return bar.key.toLowerCase() === category.toLowerCase(); }).classed('picked',true);
    }


  /**
   * Set categorical bar as primary or secondary.
   */
  public setPrimarySecondary(attributeObj) {

    //Only need to set colors for categorical type
    if (this.type === VALUE_TYPE_INT || this.type === VALUE_TYPE_REAL) {
      this.node.selectAll('.numBar').attr('fill',attributeObj.color);

    }

    if (this.type === VALUE_TYPE_CATEGORICAL) {
      //Color Bars appropriately.
      attributeObj.categories.forEach((category, i) => {
        this.node.selectAll('.catBar').filter((bar) => {
          return bar.key === category;
        }).attr('fill', attributeObj.color[i]);
      });
    }
  }

  /**
   * Clear coloring for categorical bar as primary or secondary.
   */
  public clearPrimarySecondary() {

    //Only need to set colors for categorical type
    if (this.type === VALUE_TYPE_INT || this.type === VALUE_TYPE_REAL) {
      this.node.selectAll('.numBar').attr('fill','#5f6262');
    }

    if (this.type === VALUE_TYPE_CATEGORICAL) {
      //Set Bars back to original color.
      this.node.selectAll('.catBar').attr('fill', '#5f6262');
    }
  }





  /**
   * Remove ability to select categories.
   */
  private removeCategorySelection() {
    this.node.selectAll('.catBar').classed('picked',false);
    this.node.selectAll('.catBar').on('click', null);
  }

  /**
   * Adds a brush to this histogram.
   */
  private addBrush() {

    const attrName = this.attrName;

    const element = this.node;
    const xScale = this.xScale;

    const topAxis = element.select('g').append('g')
      .attr('class', 'axis brushAxis')
      // .attr('transform', 'translate(0,-20)')
      .classed('hist_xscale', true)
      .attr('id','brushScale');

    const brushGroup = element.select('.barContainer').append('g')
      .attr('class', 'brush');

    const brush = brushX()
      .extent([[0, 0], [this.width, this.height]])
      .handleSize(2)
      .on('brush', brushed)
      .on('end', fireEvent);

    brushGroup
      .call(brush);
      // .call(brush.move, xScale.range());

    this.brush = brush; //save as class variable since we will need to modify it later when user clicks on POI

    function brushed() {
      const extent = brushSelection(brushGroup.node());
      const lowerBound = xScale.invert(<Number>extent[0]);
      const upperBound = xScale.invert(<Number>extent[1]);

      const domain = xScale.domain();
      // let allTicks = Array.from(new Set([lowerBound,upperBound].concat(domain)));

      let allTicks=[];
      if (lowerBound !== domain[0] || upperBound !== domain[1]) {
        allTicks = [lowerBound,upperBound];
      }

      //Create a tick mark at the edges of the brush
      topAxis.call(axisTop(xScale)
        .tickSize(0)
        .tickValues(allTicks)
        .tickFormat(format('.0f')));
    }

    function fireEvent() {
      const extent = brushSelection(brushGroup.node());

      if (isNull(extent)) { //user cleared brush entirely
        topAxis.call(axisTop(xScale)
          .ticks(0));
        if (!isNull(event.sourceEvent)) { //user cleared brush, nobody is 'affected'
          events.fire('doiSet',{'name':attrName, 'threshold':undefined });
        }
      }else {
        if (!isNull(event.sourceEvent)) {
          events.fire('doiSet',{'name':attrName, 'threshold':[xScale.invert(extent[0]),xScale.invert(extent[1])]});
        }

      }

    }

  }

  /**
   * Sets the brush extent for this histogram.
   */
  public setBrush(threshold) {

    if (!this.brush) { //no brush exists. define default
      this.addBrush();
      this.node.select('.brush')
        .call(this.brush.move, [this.xScale(threshold), this.xScale.range()[1]]);
    }

  }

  /**
   * Removes the brush from this histogram
   */
  public removeBrush() {
      this.node.select('.brush').remove();
      this.node.select('.brushAxis').remove();
      this.brush = undefined;
  }

  /**
   * This function renders the histogram for categorical attribute in the attribute panel
   *
   */
  private async renderCategoricalHistogram(dataVec) {

    const currentHist = this.node;

    const categoricalDataVec = <ICategoricalVector>dataVec;

    const numElements = categoricalDataVec.length;

    const histData: any = await categoricalDataVec.hist();
    // console.log(histData)
    const catData = [];
    histData.forEach((d, i) => {catData.push({key: histData.categories[i], value: d});});

    const t = transition('t').duration(500).ease(easeLinear);


    //scales
    const xScale = scaleBand();
    const yScale = scaleLinear();

    //scales
    xScale.rangeRound([0, this.width]).padding(0.2)
      .domain(catData.map(function (d) {
        return d.key;
      }));

    yScale.rangeRound([this.height, 0])
      .domain([0, max(catData, function (d) {
        return d.value;
      })]);


    const bandwidth = min([xScale.bandwidth(),40]);
    if (currentHist.selectAll('.svg-g').size() === 0) {
      currentHist.append('g')
     .attr('class', 'svg-g');

      const element = currentHist.selectAll('.svg-g');

      element.append('g')
        .attr('class', 'axis axis--x')
        .call(axisBottom(xScale).tickFormat((d)=> {return d[0];}));

      element.append('g')
        .classed('barContainer',true);
    }

    let bars = currentHist
      .select('.barContainer')
      .selectAll('.catBar')
      .data(catData);

    const barsEnter = bars
      .enter().append('rect')
      .classed('catBar', true)
      .classed('bar', true)
      .attr('fill','#5f6262');

    bars = barsEnter.merge(bars);

    bars.exit().remove();

    bars
      .attr('x', (d) => {
        return xScale(d.key) + (xScale.bandwidth() - bandwidth)/2; //potential offset created from making bars skinnier
      })
      .attr('y', (d) => {
        return yScale(d.value);
      })
      .attr('width', bandwidth)
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


    const data = dataVec.dataValues.filter((d)=>d!== undefined).map((d)=>+d.value);
    const dom = extent(data);

    let domain;
    domain = +dom[0] === +dom[1] ? [+dom[0]-1,+dom[1]+1] : [+dom[0],+dom[1]+1];

    const xScale = scaleLinear().range([0, this.width]).domain(domain).nice();
    const hist = histogram()
    .domain(domain)
    .thresholds(xScale.ticks(10))
    (data);

    const binWidth = (+xScale.range()[1] - +xScale.range()[0]) / hist.length;

    const yScale = scaleLinear().range([0, this.height * 0.8]).domain([0, max(hist, (d) => {
      return d.length;
    })]);

    this.xScale = xScale;
    this.yScale = yScale;


    const currentHist = this.node;

    if (currentHist.select('.elementGroup').size() === 0) {

      const element = currentHist.append('g')
        .classed('elementGroup',true);

      element.append('text').classed('maxValue', true);

      //Axis Group
      element.append('g')
        .attr('class', 'axis axis--x')
        .classed('hist_xscale', true)
        .attr('id','histAxis')
        .attr('transform', 'translate(0,' + this.height + ')');

     element.append('g')
        .attr('class','barContainer');

    }

    this.node.select('#histAxis')
    .call(axisBottom(xScale)
    .tickSize(5)
    .tickValues(xScale.domain())
    .tickFormat(format('.0f')));



     //Position tick labels to be 'inside' the axis bounds. avoid overlap
    this.node.select('.hist_xscale').selectAll('.tick').each(function (cell) {
      const xtranslate = +select(this).attr('transform').split('translate(')[1].split(',')[0];
      if (xtranslate < 1) {//first label in the axis
        select(this).select('text').style('text-anchor', 'start');
      } else { //last label in the axis
        select(this).select('text').style('text-anchor', 'end');
      }
    });

    // const totalLabel = (data[data.length - 1]).acc + (data[data.length - 1]).v;
    // this.node.select('.maxValue')
    //   .text('Total:' + total)

    //   .attr('x', this.width / 2)
    //   .attr('y', -this.height * 0.08)
    //   .attr('text-anchor', 'middle');

    let bars = currentHist
      .select('.barContainer')
      .selectAll('.numBar')
      .data(hist);


    const barsEnter = bars
      .enter()
      .append('rect')
      .classed('numBar', true)
      .classed('bar', true)
      .attr('fill','#5f6262');

    bars = barsEnter.merge(bars);

    bars.exit().remove();

    bars
      .attr('width', binWidth * 0.8)
      .attr('height', (d) => {
        return yScale(d.length);
      })
      .attr('y', (d) => {
        return (this.height - yScale(d.length));
      })
      .attr('x', (d, i) => {
        return xScale(d.x0);
      });

    // this.addBrush(); //For now only add brush when the POI button is clicked
  }

  // private attachListener() {

  // }


}


/**
 * Factory method to create a new instance of the histogram
 * @param parent
 * @param options
 * @returns {Histogram}
 */
export function create(parent: Element) {
  return new Histogram(parent);
}
