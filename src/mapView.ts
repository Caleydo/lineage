import * as events from 'phovea_core/src/event';
import {event, select, selectAll} from 'd3-selection';
import {format} from 'd3-format';
import {Config} from './config';
import {scaleLinear, scaleSqrt, schemeCategory10} from 'd3-scale';
import {interpolateCividis, interpolateRdBu, interpolateReds} from 'd3-scale-chromatic';
import {curveMonotoneX, line as line_generator} from 'd3-shape';
import {max, min} from 'd3-array';
import {axisBottom, axisLeft} from 'd3-axis';
import {geoCentroid, geoConicConformal, geoPath} from 'd3-geo';
// import {geoCentroid,geoMercator,geoPath} from 'd3-geo';
import {forceCollide, forceSimulation, forceX, forceY} from 'd3-force';
import {timeout} from 'd3-timer';
import {brushX} from 'd3-brush';
import L from 'leaflet';
import {
  CLEAR_MAP_HIGHLIGHT,
  CLEAR_TABLE_HIGHLIGHT,
  CLICKHIGHLIGHT_BY_ID,
  COL_ORDER_CHANGED_EVENT,
  HIGHLIGHT_BY_ID,
  HIGHLIGHT_MAP_BY_ID,
  MAP_ATTRIBUTE_CHANGE_EVENT, OPEN_MAP_POPUP,
  SHOW_DETAIL_VIEW,
  SHOW_TOP_100_EVENT,
  TABLE_VIS_ROWS_CHANGED_EVENT
} from './tableManager';
import {VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT, VALUE_TYPE_REAL} from 'phovea_core/src/datatype';


class MapView {
    private leafMap;
    private currentCases;
    private displayfamilyCases = true;
    private circleLayer;
    private leafCircles;
    private mapManager;
    private currentSelectedMapAttribute: string = 'sex';
    private currentViewType = 'Hide';
    //private topojson_features;
    private mapCenter;
    // private svgWidth = (select('#map').node() as any).getBoundingClientRect().width;
    private svgWidth = ((select('#map').node() as any).getBoundingClientRect().width <400? 400:(select('#map').node() as any).getBoundingClientRect().width);
    private nodeCenter;
    private projection;
    private dotDataColloection;
    private margin = Config.margin;
    private svgHeight = (select('#col4').node() as any).getBoundingClientRect().height-this.margin.top - this.margin.bottom;
    private detailViewAttribute = [];
    private scaleDict = {};
  //  private detailViewAttribute = 'None'
    private graphMargin = {top: 0.1*this.svgHeight, right: 50, bottom: 0.1  *this.svgHeight, left: 50};
    private allIds = [];
    private epaColor = ['#00e400', '#ff0', '#ff7e00', '#f00','#99004c', '#7e0023'];
    private temporalDataRange = {
      pm25day: [0,12,35.4,55.4,150.4, 250.4],
      meanO3day: [0,54,70,85,105],
      meanNO2day: [0,53,100,360,649,1249]
    };
    public init(mapManager) {
      this.mapManager = mapManager;
      //document.getElementById('col4').style.display = 'none';
      this.mapCenter=geoCentroid(this.mapManager.topojsonFeatures);
      this.nodeCenter = [this.svgWidth/2,(this.svgHeight)/2];

        // for leaflet map
      const leafmaster = select('#map').append('div').attr('id', 'leafmaster')
        .style('width', this.svgWidth+'px')
        .style('height', this.svgHeight+'px')
        .style('position', 'relative');
        // .style('display':'flex');
      const mapPopup = select('#map').append('div').attr('id', 'mapPopup');
      const maplegend = leafmaster.append('div')
        .attr('id', 'maplegend')
        .style('height', '200px')
        .style('width', this.svgWidth+'px');
      const leafdiv = leafmaster.append('div')
        .attr('id', 'leafdiv')
        // .style('flex-grow', '1')
        .style('height', '600px');
      this.drawLeafletMap();

      select('#map').append('dheightiv').attr('id','mapDiv2')
        .append('svg').attr('id','map-svg').attr('width',this.svgWidth).attr('height',this.svgHeight);

      select('#col4').append('div')
          .attr('class', 'tooltip')
          .attr('id','circletip')
          .attr('opacity', 0)
          .attr('background','white');

      select('#col4').append('div')
          .attr('class','tooltip')
          .attr('id','countytip')
          .attr('opacity',0)
          .attr('background','white');
      this.initUtil();

      this.attachListener();
    }

    private initUtil() {
      const self = this;
      const buttondiv = select('#map').append('div').attr('id','button-div');
      // let resetButton = buttondiv.append('button')
      //             .attr('id','reset_button')
      //             .text('Reset zoom');


    document.getElementById('col4').style.display = 'none';
    const mapdropdownMenu = select('.navbar-collapse').append('ul')
                                                      .attr('class','nav navbar-nav')
                                                      .attr('id','mapOption');

    const optionList = mapdropdownMenu.append('li').attr('class','dropdown');

    optionList.append('a')
              .attr('class','dropdown-toggle')
              .attr('data-toggle','dropdown')
              .attr('role','button')
              .html('Supplement View Option')
              .append('span')
              .attr('class', 'caret');

    const mapMenu = optionList.append('ul').attr('class', 'dropdown-menu');


      let mapmenuItems = mapMenu.selectAll('.demoAttr')
      .data(['Map','Detail','Hide']);
      mapmenuItems = mapmenuItems.enter()
        .append('li')
        .append('a')
        .attr('class', 'layoutMenu')
        .classed('active', function(d) { return d === 'Expand';})
        .html((d:any) => { return d; })
        .merge(mapmenuItems);

    mapmenuItems.on('click',(d)=> {
      const currSelection = selectAll('.layoutMenu').filter((e)=> {return e === d;});
      // if (currSelection.classed('active')) {
      //   return;
      // }
      selectAll('.layoutMenu').classed('active',false);
      currSelection.classed('active',true);

      if (d === 'Detail') {
          self.currentViewType = 'Detail';
      } else if (d === 'Map') {
          self.currentViewType = 'Map';
      } else {
         self.currentViewType = 'None';
      }
      self.update();
      }
    );
    const dropdownMenu = select('.navbar-collapse')
                        .append('ul')
                        .attr('class', 'nav navbar-nav')
                        .attr('id', 'mapAttribute');

      const list = dropdownMenu.append('li').attr('class', 'dropdown');
      list.append('a')
        .attr('class', 'dropdown-toggle')
        .attr('data-toggle', 'dropdown')
        .attr('role', 'button')
        .html('Map Attribute')
        .append('span')
        .attr('class', 'caret');

      const menu = list.append('ul').attr('class', 'dropdown-menu');
      menu.append('h4').attr('class', 'dropdown-header')
        .style('font-size', '16px')
        .html('Demographic Attributes');

      let colNames = this.mapManager.tableManager.getDemographicColumns().map((col) => {
        return col.desc.name;
      });
      let menuItems = menu.selectAll('.demoAttr')
        .data(colNames);
      menuItems = menuItems.enter()
        .append('li')
        .append('a')
        .attr('class', 'dropdown-item-map demoAttr')
        .classed('active', (d) => d===this.currentSelectedMapAttribute)
        .html((d:any) => { return d; })
        .merge(menuItems);

      menu.append('li').attr('class', 'divider').attr('role', 'separator');
      menu.append('h4').attr('class', 'dropdown-header').style('font-size', '16px')
        .html('Clinical Attributes');
      colNames = this.mapManager.tableManager.getAttrColumns().map((col) => {
        return col.desc.name;
      });
      menuItems = menu.selectAll('.clinicalAttr')
        .data(colNames);
      menuItems = menuItems.enter()
        .append('li')
        .append('a')
        .attr('class', 'dropdown-item-map clinicalAttr')
        .classed('active', (d)=> d === this.currentSelectedMapAttribute)
        .html((d:any) => { return d; })
        .merge(menuItems);

      selectAll('.dropdown-item-map').on('mousedown', function (d) {
          event.preventDefault();
          //Check if is selected, if so remove from table..
          d = d.toString();

          if (self.currentSelectedMapAttribute !== d) {
            self.currentSelectedMapAttribute = d as string;
            selectAll('.dropdown-item-map').classed('active',false);
            select(this).classed('active', true);
            events.fire(MAP_ATTRIBUTE_CHANGE_EVENT,undefined);
          }
        });
      // MAP VIEW

      const lmapLegend = select('.navbar-collapse').append('div').attr('id','lmaplegend-div')
        .append('ul')
        // .attr('class', 'nav navbar-nav navbar-left')
        .attr('class', 'nav navbar-nav')
        .attr('id', 'mapAttribute');

      const legendlist = lmapLegend.append('li').attr('class','dropdown');
      legendlist.append('a')
        .attr('class','dropdown-toggle')
        .attr('data-toggle','dropdown')
        .attr('role','button')
        .html('Map View')
        .append('span')
        .attr('class', 'caret');

      const legendMenu = legendlist.append('ul').attr('class', 'dropdown-menu');
      let maplegendItems = legendMenu.selectAll('.demoAttr')
        .data(['All Tracts', 'Family Selection']);
      maplegendItems = maplegendItems.enter()
        .append('li')
        .append('a')
        .attr('class', 'layoutMenu')
        .classed('active', function(d) { return d === 'Expand';})
        .html((d:any) => { return d; })
        .merge(maplegendItems);
      maplegendItems.on('click',(d)=> {
        self.leafMap.closePopup();
        const currSelection = selectAll('.layoutMenu').filter((e)=> {return e === d;});
        selectAll('.layoutMenu').classed('active',false);
        currSelection.classed('active',true);
        if (d === 'All Tracts') {
          self.displayfamilyCases = false;
          console.log('All Tracts');
        } else if (d === 'Family Selection') {
          self.displayfamilyCases = true;
          console.log('Family Selection');
        }
        self.update();
      });




      self.update();
    }
    async update() {
      console.log('UPDATE');
      const self = this;

      self.dotDataColloection = await self.mapManager.prepareData(this.currentSelectedMapAttribute);
      // if self.mapView === 'All Cases'... else if === 'Family Cases'::
      // console.log('dotDataColloection', self.dotDataColloection);
      if (this.currentViewType === 'Map') {
        self.leafMap.closePopup();
        document.getElementById('col4').style.display = 'block';
        select('#graphLayer').attr('opacity',0).attr('pointer-events','none');
      //  select('#graph-util').attr('opacity',0)
        select('#map-util').attr('opacity',1);
        select('#mapLayer').attr('opacity',1).attr('pointer-events','auto');
        select('#drawLayer').attr('opacity',1).attr('pointer-events','auto');
        console.log('map functions currently suppressed');

        await self.drawCases();
        // self.updateCircles();
        // self.drawGeographicalMap();
        // self.drawMapDots();
      } else if(this.currentViewType === 'Detail') {
        document.getElementById('col4').style.display = 'block';
        select('#graphLayer').attr('opacity',1).attr('pointer-events','auto');
        select('#mapLayer').attr('opacity',0).attr('pointer-events','none');
        select('#drawLayer').attr('opacity',0).attr('pointer-events','none');
      //  select('#graph-util').attr('opacity',1)
        select('#map-util').attr('opacity',0);

        self.drawDetailView();
      } else {
        document.getElementById('col4').style.display = 'none';
        //do nothing
      }
    }

    private drawMapDots() {
      const self = this;

      const draw = select('#drawLayer');
      draw.selectAll('rect').remove();

      const circleTip = select('#col4').select('#circletip');

      //TODO make new legend
      // select('.legend').selectAll('.rectLegend').remove()
      //
      // let legend = svglegend.legendColor()
      // legend.scale(self.legendScale);
      // legend.shapeWidth((that.svgWidth)/8);
      // d3.select('.legend').call(legend);
      self.dotDataColloection.forEach((dot) => {
        [dot.x,dot.y] = self.projection([dot.longitude,dot.latitude]);
        dot.x = dot.x + Math.random()*20;
        dot.y = dot.y+Math.random()*20;
      });


      const simulation = forceSimulation(self.dotDataColloection)
                          .force('collide',forceCollide().radius(5).iterations(10))
                          .stop();

      const timeout1 = timeout(function() {
      for (let i = 0,
        n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()));
         i < n; ++i) {
          simulation.tick();}

      let circles = draw.selectAll('circle').data(self.dotDataColloection);
          circles.exit().remove();
          circles = circles.enter()
                      .append('circle')
                      .merge(circles);
          circles.attr('cx',(d:any)=>d.x)
                     .attr('cy',(d:any)=>d.y)
                     .attr('r',4)
                     .attr('fill',(d:any)=>self.mapManager.scaleFunction(d.dataVal))
                     .attr('id',(d:any)=>'circle_' + d.ID)
                      .on('mouseover', function(d:any) {
                         circleTip.style('opacity', .9);
                         // .transition()
                         // .duration(10)
                         events.fire(HIGHLIGHT_BY_ID,d.ID);
                         //TODO: this need to not ignore 0
                         circleTip.html(d.dataVal?d.dataVal:'-')
                        .style('left', (event.pageX) + 'px')
                        .style('top', (event.pageY - 28) + 'px');
                     //    draw.append('line')
                     //      .attr('id','exactLocationLine')
                     //      .attr('stroke','red')
                     //      .attr('strokeWidth',2)
                     //      .attr('x1',d.x)
                     //      .attr('y1',d.y)
                     //      .attr('x2',self.projection(d.longitude))
                     //      .attr('y2',self.projection(d.latitude))
                     //      .attr('opacity',1);
                         })
                      .on('mouseout', function(d:any) {
                        events.fire(CLEAR_TABLE_HIGHLIGHT);
                         circleTip
                         //.transition()
                     //    .duration(10)
                         .style('opacity', 0);
                     //    draw.select('#exactLocationLine').remove();
                       });
                  }
              );
              //// TODO: get the array for the legend
          if (self.mapManager.selectedMapAttributeType === VALUE_TYPE_CATEGORICAL) {
              const allCategories = self.mapManager.selectedAttributeVector.desc.value.categories.map((c)=>c.name);
              self.drawLegend(allCategories,schemeCategory10.slice(0,allCategories.length));

          } else if (self.mapManager.selectedMapAttributeType === VALUE_TYPE_REAL ||
                   self.mapManager.selectedMapAttributeType === VALUE_TYPE_INT) {
              const formater = format('.0f');
              const dataScale = scaleLinear().domain([0,1]).range(self.mapManager.selectedAttributeVector.desc.value.range);
              const dataInputs = [formater(dataScale(0.2)),formater(dataScale(0.4)),formater(dataScale(0.6)),formater(dataScale(0.8)),formater(dataScale(1))];
              const colors = dataInputs.map((d)=>self.mapManager.scaleFunction(d));
              self.drawLegend(dataInputs,colors);
          } else if (self.currentSelectedMapAttribute === 'KindredID') {
            const allCategories = self.mapManager.tableManager.familyIDArray;
            self.drawLegend(allCategories, schemeCategory10.slice(1, allCategories.length+1));
          } else {
            self.drawLegend([],'TEXT');
          }
    }

    private async drawDetailView() {

      const self = this;
      const colorRampWidth = 50;
      const width = self.svgWidth - self.graphMargin.left - self.graphMargin.right - colorRampWidth;
      const height = self.detailViewAttribute.length===1? 0.5*self.svgHeight:(self.svgHeight-0.7*self.detailViewAttribute.length*self.graphMargin.top - 0.7*self.detailViewAttribute.length*self.graphMargin.bottom) /self.detailViewAttribute.length;
      const graph = select('#graphLayer');
    //  select('#graph-util').selectAll('text').remove();
      if(self.detailViewAttribute.length===0 ) {

        graph.selectAll('text').remove();
        graph.selectAll('.axis').remove();
        graph.selectAll('.line_graph').remove();
        graph.selectAll('.color_ramp').remove();
        graph.selectAll('.linear_gradient').remove();

      //  select('graph-util').selectAll('text').remove()
        graph.append('text').text('No attribute selected')
            .attr('transform','translate('+0.5*(self.svgWidth - self.graphMargin.left - self.graphMargin.right)+','+0.5*(self.svgHeight - self.graphMargin.top - self.graphMargin.bottom)+')');
        return;
      }



      graph.selectAll('text').remove();
      graph.selectAll('.axis').remove();
      graph.selectAll('.line_graph').remove();
      graph.selectAll('.color_ramp').remove();
      graph.selectAll('.linear_gradient').remove();


      for(let currentIndex = 0;currentIndex<self.detailViewAttribute.length; currentIndex++) {
        const attributeName = self.detailViewAttribute[currentIndex];

        const startingHeight = currentIndex*height + currentIndex * self.graphMargin.top;

        graph.append('text')
             .text(attributeName.slice(0,attributeName.length-3))
             .attr('x',(this.svgWidth- self.graphMargin.left - self.graphMargin.right )*0.5)
             .attr('font-size','23px')
             .attr('y',startingHeight)
             .attr('text-anchor','middle')
             .attr('alignment-baseline','baseline');

        graph.append('text')
             .classed('graph-icon',true)
             .classed('icon',true)
             .text(' \uf057')
             .attr('y',-7+(startingHeight))
             .attr('x', -6)
             .on('click',function() {
               self.detailViewAttribute.splice(currentIndex,1);
               self.update();
             });

        const aqCols = [];
        const allCols = await this.mapManager.tableManager.aqTable.cols();

        for (const vector of allCols) {
          if (vector.desc.name.includes(attributeName)) {
            aqCols.push(vector);
          }
        }

        const aqDataAccum = [];
        let allaqPromises = [];
        aqCols.forEach((vector)=> {
          allaqPromises = allaqPromises.concat([
            vector.data(),
            vector.names(),
            vector.desc.name,
            vector.ids(),
            vector.desc.value.range
          ]);
        });
        const finishedAQPromises = await Promise.all(allaqPromises);

        const aqDataDict = {};
        aqCols.forEach((vector,index)=> {
          aqDataDict[finishedAQPromises[index*5+2]] = {'data':finishedAQPromises[index*5],'ids':finishedAQPromises[index*5+1],
          'range':finishedAQPromises[index*5+4]};
        });
        let rangeCounter = [];

        const personArrayDict = {};
        finishedAQPromises[1].forEach((personID)=> {
          personArrayDict[personID] =  new Array(29);
        });

        for (let i = -14; i < 15; i++) {
          const dayentry = aqDataDict[attributeName+i.toString()];
          const data = dayentry.data;
          //console.log(dayentry)
          dayentry.ids.forEach((personID,numberIndex)=> {
            personArrayDict[personID][i + 14] = data[numberIndex];
          });
          rangeCounter = rangeCounter.concat(dayentry.range);
        }
        const detailViewData:any = {};
        detailViewData.ids = Object.keys(personArrayDict);
        detailViewData.data = detailViewData.ids.map((key) => personArrayDict[key]).filter((d)=>d);
        detailViewData.range = [min(rangeCounter),max(rangeCounter)];
        if(self.scaleDict[attributeName]) {
          detailViewData.range = [self.scaleDict[attributeName]*min(rangeCounter),max(rangeCounter)*self.scaleDict[attributeName]];
        }
        const xLineScale = scaleLinear().domain([0,29]).range([0,width]);
        const yLineScale = scaleLinear().domain(detailViewData.range).range([height+startingHeight , startingHeight]);
        //add icon

        graph.append('text')
             .classed('axis-icon', true)
             .classed('icon', true)
             .classed('minus', true)
             .text('\uf0dd')
             .attr('y', -5+(startingHeight))
             .attr('x', 10)
             .on('click',function() {
               if(self.scaleDict[attributeName]) {
                 self.scaleDict[attributeName] = self.scaleDict[attributeName]===0.1?0.1:self.scaleDict[attributeName]-0.1;
               } else {
                 self.scaleDict[attributeName]=0.9;
               }
               self.update();
             });

       graph.append('text')
            .classed('axis-icon', true)
            .classed('icon', true)
            .classed('plus', true)
            .text('\uf0de')
            .attr('y', -10+(startingHeight))
            .attr('x', 10)
            .on('click',function() {
              if(self.scaleDict[attributeName]) {
                self.scaleDict[attributeName]+=0.1;
              } else {
                self.scaleDict[attributeName]=1.1;
              }
              self.update();
            });

        graph.append('g')
            .attr('class','axis visible_axis')
            .call(axisLeft(yLineScale))
            .attr('transform','translate('+colorRampWidth +',0)');

        graph.append('g')
            .attr('class','axis visible_axis')
            .call(axisBottom(xLineScale))
            .attr('transform', 'translate(' + colorRampWidth+',' + (startingHeight+height) + ')');
        const lineFunction =  line_generator()
                      .x((d:any)=>d.x)
                      .y((d:any)=>d.y)
                      .curve(curveMonotoneX);

        detailViewData.data.forEach((singleData,index)=> {

          //let cleanedDataArray = singleData.map(d=>isNaN(d)? 0: d)
          //detailViewData is the object to be visualized in the supplement view
          let cleanedDataArray = singleData.map((d,i)=> {
              if(!isNaN(d)) {
              return {x: xLineScale(i), y:yLineScale(d)};
              }
            });

          cleanedDataArray = cleanedDataArray.filter((d)=>d);
          // console.log('cleanedDataArray', cleanedDataArray);
          graph.append('path')
               .datum(cleanedDataArray)
               .attr('d',lineFunction)
               .attr('stroke-width',2)
               .attr('opacity', 0.75)
               .attr('class','line_graph line_graph_'+detailViewData.ids[index])
               .attr('stroke','#767a7a');
               });
               graph.selectAll('.line_graph')
                    .attr('transform','translate(' + colorRampWidth + ',0)')
                    .attr('fill', 'none')
                    .on('mouseover',function(d) {
                       const selectedId = select(this).attr('class').split('_')[3];
                       detailViewData.ids.forEach((id)=> {
                         if (id !== selectedId) {
                           graph.selectAll('.line_graph_'+id).attr('opacity',0.1);
                         } else {
                           graph.selectAll('.line_graph_'+id).attr('opaity',0.8);
                         }
                       });
                       events.fire(HIGHLIGHT_BY_ID,selectedId);
                    })
                    .on('mouseout',(d)=> {
                      graph.selectAll('.line_graph').attr('opacity',0.8);
                      events.fire(CLEAR_TABLE_HIGHLIGHT);
                    });

               //Create gradient
               graph.append('rect')
                    .attr('x',0)
                    .attr('y',yLineScale.range()[1])
                    .attr('width',colorRampWidth-30)
                    .attr('height',height)
                    .attr('id','color_ramp_'+currentIndex)
                    .attr('class','color_ramp');
               const colorGradient = graph.append('linearGradient')
                                          .attr('id','linear_gradient_'+currentIndex)
                                          .attr('class','linear_gradient')
                                          .attr('x1',0)
                                          .attr('x2',0)
                                          .attr('y1',1)
                                          .attr('y2',0)
                                          .attr('color-interpolation','CIE-Lab');

             if(self.temporalDataRange[attributeName]) {
               const dataLevels = self.temporalDataRange[attributeName];
               dataLevels.forEach((dataLevel,i)=> {
                 colorGradient.append('stop')
                   .attr('offset', (1 - (yLineScale(dataLevel)-startingHeight)/height)*100+'%')
                              .attr('stop-color',self.epaColor[i]);
               });
             } else if(attributeName === 'AirTempday') {
               const intervalRange = self.mapManager.tableManager.getAQRange(attributeName);
               const beginPercent = 100-(yLineScale(intervalRange[0])-startingHeight)/height*100;
               const midPercent = 100-(yLineScale(0)-startingHeight)/height*100;
               const endPercent = 100 - (yLineScale(intervalRange[1])-startingHeight)/height*100;
               for(let i = 1;i<5;i++) {
                 colorGradient.append('stop')
                              .attr('offset',(beginPercent+0.25*i*(midPercent-beginPercent))+'%')
                              .attr('stop-color',interpolateRdBu(0.5+0.125*(4-i)));
               }
               colorGradient.append('stop')
                            .attr('offset',midPercent+'%')
                            .attr('stop-color',interpolateRdBu(0.5));
              for(let i = 1;i<5;i++) {
                colorGradient.append('stop')
                             .attr('offset',(midPercent+0.25*i*(endPercent-midPercent))+'%')
                             .attr('stop-color',interpolateRdBu(0.5-0.125*i));
              }
             } else {
               const intervalRange = self.mapManager.tableManager.getAQRange(attributeName);
               const beginPercent = 100-(yLineScale(intervalRange[0])-startingHeight)/height*100;
               const endPercent = 100-(yLineScale(intervalRange[1])-startingHeight)/height*100;

               for (let i =0; i < 6; i++) {
                 colorGradient.append('stop')
                              .attr('offset',(beginPercent+0.2*i*(endPercent-beginPercent))+'%')
                              .attr('stop-color',interpolateReds(0.2*i));
               }

              }
             graph.select('#color_ramp_'+currentIndex).attr('fill','url(#linear_gradient_'+currentIndex+')');
      }


        // graph.selectAll('.place_holder')
        //       .data(singleData)
        //       .enter()
        //       .append('polyline')
        //       .attr('points',(d,i)=>{
        //         let x1,x2,y1,y2,x3,y3;
        //         if (i==0){
        //           x1 = xLineScale(0)
        //           x2 = xLineScale(0.5)
        //           y1 = yLineScale(cleanedDataArray[i]);
        //           y2 = isNaN(singleData[i+1])?yLineScale(cleanedDataArray[i]):yLineScale((cleanedDataArray[i] + cleanedDataArray[i+1])/2)
        //
        //           x3 = xLineScale(0.5)
        //           y3 = isNaN(singleData[i+1])? yLineScale(cleanedDataArray[i]):yLineScale((cleanedDataArray[i] + cleanedDataArray[i+1])/2)
        //
        //         }
        //         else if (i == 28){
        //           x1 = xLineScale(27.5)
        //           x2 = xLineScale(28)
        //           y1 = isNaN(singleData[i-1]) ? yLineScale(cleanedDataArray[i]): yLineScale((cleanedDataArray[i] + cleanedDataArray[i-1])/2)
        //
        //           y2 =yLineScale ( cleanedDataArray[i])
        //           x3 = xLineScale(28)
        //           y3 = yLineScale(cleanedDataArray[i])
        //         }
        //         else{
        //           x1 = xLineScale(i-0.5);
        //           x2 = xLineScale(i+0.5);
        //           x3 = xLineScale(i);
        //
        //           y3 = yLineScale(cleanedDataArray[i])
        //           if (isNaN(singleData[i-1])){
        //             y1 = yLineScale(cleanedDataArray[i])
        //           }
        //           else{
        //             y1 = yLineScale((cleanedDataArray[i] + cleanedDataArray [ i-1])/2);
        //           }
        //           if (isNaN(singleData[i+1])){
        //             y2 = yLineScale(cleanedDataArray[i])
        //           }
        //           else{
        //             y2 = yLineScale((cleanedDataArray[i] + cleanedDataArray[i+1])/2);
        //           }
        //
        //         }
        //
        //         return x1 + ',' + y1 + ' ' +
        //                x3 + ',' + y3 + ' ' +
        //                x2 + ',' + y2 + ' ' })
        //         .attr('class','line_graph line_graph_'+detailViewData.ids[index])
        //         .attr('stroke',(d,i)=>{
        //           if (isNaN(singleData[i]))
        //           { return 'none';}
        //           else
        //           {return '#767a7a';}})



    }
    private async drawLeafletMap() {
      console.log('draw leaflet map');
      const self = this;
      //Basemaps:
      const positronBasemap = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        minZoom: 4,
        maxZoom: 15
      });
      const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        // subdomains: 'abcd',
        minZoom: 4,
        maxZoom: 15
          });
      const tracts = L.geoJSON(self.mapManager.topojsonFeatures);
      tracts.setStyle({fillOpacity:0.1, weight:1.0, color: '#285880'});
      const mapObject = L.map('leafdiv',{
          center: [39.384167, -111.683500],
          zoom: 6,
          // layers: [tracts, positronBasemap]
        });
      // leafSVG is an svg layer/renderer that is added to leaflet overlay div by default
      tracts.addTo(mapObject);
      const leafSVG = L.svg({clickable: true, pane: 'markerPane'});
      // leafSVG.interactive(true);
      leafSVG.addTo(mapObject);
      leafSVG._container.setAttribute('id', 'leafSVG');
      self.leafCircles = leafSVG;
      const leafBasemaps = {
        'Grayscale': positronBasemap.addTo(mapObject),
        'OSM': osm
      };
      const leafOverlays = {
        'Census Tracts': tracts
      };
      L.control.layers(leafBasemaps, leafOverlays).addTo(mapObject);
      mapObject.on('zoomend', function() {
        // testing, remove call to get family on zoomend
        self.drawCases();
        // self.updateCircles();
        console.log('map zoom', mapObject.getZoom());
        // alert(map.getBounds())
      });
      // TODO - maybe use this object, delete the entire map on update....?
      self.leafMap = mapObject;
    //   const lmapLegend = select('#maplegend').append('div').attr('id','lmaplegend-div')
    //     .append('ul')
    //     .attr('class', 'nav navbar-nav navbar-left')
    //     .attr('id', 'mapAttribute');
    //
    //   const legendlist = lmapLegend.append('li').attr('class','dropdown');
    //   legendlist.append('a')
    //     .attr('class','dropdown-toggle')
    //     .attr('data-toggle','dropdown')
    //     .attr('role','button')
    //     .html('Map View')
    //     .append('span')
    //     .attr('class', 'caret');
    //
    //   const legendMenu = legendlist.append('ul').attr('class', 'dropdown-menu');
    //   let maplegendItems = legendMenu.selectAll('.demoAttr')
    //     .data(['All Tracts', 'Family Selection']);
    //   maplegendItems = maplegendItems.enter()
    //     .append('li')
    //     .append('a')
    //     .attr('class', 'layoutMenu')
    //     .classed('active', function(d) { return d === 'Expand';})
    //     .html((d:any) => { return d; })
    //     .merge(maplegendItems);
    // maplegendItems.on('click',(d)=> {
    //   const currSelection = selectAll('.layoutMenu').filter((e)=> {return e === d;});
    //   selectAll('.layoutMenu').classed('active',false);
    //   currSelection.classed('active',true);
    //   if (d === 'All Tracts') {
    //     self.displayfamilyCases = false;
    //     console.log('All Tracts');
    //   } else if (d === 'Family Selection') {
    //     self.displayfamilyCases = true;
    //     console.log('Family Selection');
    //   }
    //   self.update();
    //   });

    // circle brush, map legend, brush
    const mapLegend = select('#maplegend').append('svg')
      // TODO - These width and heights are strange!!
      .attr('id', 'circleBrush')
      .attr('width', self.svgWidth+'px')
      .attr('height', '100px');
    mapLegend.append('g').call(brushX().extent([[0, 0], [200,self.svgHeight]]));
    }
    private async getFamilyCases() {
      console.log('getFamilyCases');
      const self = this;
      const geographies = self.mapManager.topojsonFeatures;
      const familyCases = await self.mapManager.prepareData(this.currentSelectedMapAttribute);

      const kindredIDVector = await self.mapManager.tableManager.getAttributeVector('KindredID', true); //get FamilyID vector for all families
      const familyIDs: number[] = <number[]>await kindredIDVector.data();
      const peopleIDs: string[] = await kindredIDVector.names();
      familyCases.forEach((d) => {
        d.KindredID = familyIDs[peopleIDs.indexOf(d.ID)];
        d.personID = d.ID;
      });
      const tractGroups = familyCases.reduce((d, i) => {
        // console.log('m,i', m,i);
        const tract = i.GEOID10.toString();
        // const mapobj = new self.mapManager.mappedCase(i.GEOID10, i.dataVal, self.currentSelectedMapAttribute);
        if(!d[tract]) {
          const tractGEO = geographies.features.find((g)=>g.properties.GEOID10.toString() === tract);
          d[tract] = {cases:[]
            ,coords: {lat:tractGEO.properties.INTPTLAT10, lon: tractGEO.properties.INTPTLON10}
            ,properties: tractGEO.properties};
        }
        d[tract].cases.push(i);
        return d;
      }, {});
      self.currentCases = Object.keys(tractGroups).map((k)=> {
        const datadict: any= {};
        datadict.GEOID10 = k;
        Object.assign(datadict, tractGroups[k]);
        return datadict;
      });
    }
    private async getAllCases() {
      console.log('get all Cases');
      const self = this;
      const geographies = await self.mapManager.topojsonFeatures;
      const attributeTable = self.mapManager.tableManager.attributeTable;
       //Next few lines are testing to extract all data for map view
      const attrpromises = [];
      const attrColNames = [];
      //the ids, in this case 'personid' is accessed via the .names() method
      attrpromises.push(attributeTable.col(0).names());
      attrColNames.push(attributeTable.col(0).idtype.id);
      attributeTable.cols().forEach((vect, index)=> {
        const cname = vect.column.toString();
        attrColNames.push(cname);
        attrpromises.push(attributeTable.colData(cname));
    });
    const attrfinishedPromises = await Promise.all(attrpromises);
    let cc = attrfinishedPromises[0].map((col, i)=> {
      const datadict: any = {};
      datadict.coords = {lat:undefined, lon:undefined};
      attrfinishedPromises.forEach((ccol, ii)=> {
        let dataVal = ccol[i];
        const cname =  attrColNames[ii];
        if (cname === 'GEOID10') {
          dataVal = dataVal.toString();
          const tractGEO = geographies.features.find((g)=>g.properties.GEOID10.toString() === dataVal);
          if (typeof(tractGEO) !== 'undefined') {
            datadict.coords =  {lat:tractGEO.properties.INTPTLAT10, lon: tractGEO.properties.INTPTLON10};
            datadict.properties = tractGEO.properties;
          }
        }
        datadict[cname] = dataVal;
      });
      return datadict;
    });
    // const kindredIDVector = await self.mapManager.tableManager.getAttributeVector('KindredID', true); //get FamilyID vector for all families
    const kindredIDVector = await self.mapManager.tableManager.getAttributeVector('KindredID', true); //get FamilyID vector for all families
    const familyIDs: number[] = <number[]>await kindredIDVector.data();
    const peopleIDs: string[] = await kindredIDVector.names();
      console.log('fam', kindredIDVector);
    cc = cc.map((d)=> {
      const pID = d.personid;
      d.KindredID = familyIDs[peopleIDs.indexOf(pID)];
      d.personID = d.personid;
      return d;
    });
    // Filter out records that do not have a matching tract (GEOID10)
    //   Todo - need to make this not hardcoded with 'NaN' below
    cc = cc.filter((d)=> {
      return d.GEOID10 !== 'NaN';
    });
    const tractGroups = cc.reduce((d, i) => {
      const tract = i.GEOID10.toString();
      // const mapobj = new self.mapManager.mappedCase(i.GEOID10, i.dataVal, self.currentSelectedMapAttribute);
      if(!d[tract]) {
        const tractGEO = geographies.features.find((g)=>g.properties.GEOID10.toString() === tract);
        d[tract] = {cases:[]
          ,coords: {lat:tractGEO.properties.INTPTLAT10, lon: tractGEO.properties.INTPTLON10}
          ,properties: tractGEO.properties};
      }
      d[tract].cases.push(i);
      return d;
  }, {});

    // Group the individual cases by tract (GEOID10) and assign to self.currentCases
    self.currentCases = Object.keys(tractGroups).map((k)=> {
      const datadict: any= {};
      datadict.GEOID10 = k;
      Object.assign(datadict, tractGroups[k]);
      return datadict;
    });
      }


    private async drawCases() {
      const self = this;
      const circleTip = select('#col4').select('#circletip');
      const leafMapObject = self.leafMap;
      leafMapObject.invalidateSize();
      console.log('Draw Cases');
      const normVar = 'POP100';
      let maxRadiusVal = 0;

      const mapObject = self.leafMap;
      if (self.displayfamilyCases===true) {
        console.log('draw family cases');
        await self.getFamilyCases();
      } else {
        console.log('draw All Cases');
        await self.getAllCases();
      }
      console.log('total cases: ', self.currentCases.length);
      console.log('current cases', self.currentCases);
      let cCases = self.currentCases.filter((d)=> {return d.GEOID10 !== 'NaN';});
      cCases = cCases.map((d)=> {
        d.layerCoords = mapObject.latLngToLayerPoint([d.coords.lat, d.coords.lon]);
        d.numCases = d.cases.length;
        // d.radiusVal = d.cases.length/d.properties[normVar];
        d.radiusVal = d.cases.length/d.properties[normVar];
        maxRadiusVal = d.radiusVal > maxRadiusVal?d.radiusVal:maxRadiusVal;
        return d;
      });
      console.log('after filter cases: ', cCases.length);
      const rScale = scaleSqrt()
        .domain([0, maxRadiusVal])
        .range([2, 10]);
      const cScale = scaleLinear().domain([0, maxRadiusVal]).range([0,1]);

      const forcesim = forceSimulation(cCases)
      .force('collision', forceCollide().radius(function(d) {
        const radiusWeight = 1.2;
        // return rScale(d.radiusVal)*radiusWeight;
        return d.cases.length*5;
        // return 10;
      }))
      .force('x', forceX().x(function(d) {
        return d.layerCoords.x;}))
      .force('y', forceY().y(function(d) {
        return d.layerCoords.y;}))
      .tick(100)
      .stop();
      // plot pts

      const leafSVG = select('#leafSVG');
      leafSVG.attr('pointer-events', 'auto');
      const leafContainer = leafSVG.select('g');
      let leafCircles = leafContainer.selectAll('circle').data(cCases);
      leafCircles.exit().remove();
      leafCircles = leafCircles.enter().append('circle').merge(leafCircles)
        .attr('class', 'leaflet-interactive')
        .attr('cx', (d:any) => d.x)
        .attr('cy', (d:any) => d.y)
        // .attr('r', (d:any) => rScale(d.radiusVal))
        .attr('r', (d:any) => d.cases.length*5)
        .attr('stroke', 'black')
        // .style('fill', 'pink')
        .style('fill', (d:any) => (interpolateCividis(cScale(d.radiusVal))))
        .on('mouseover', function(d) {
          // select(this).transition()
          select(this)
            .attr('stroke-width', '5px')
            .attr('r', (d:any) => {
              return rScale(d.radiusVal)*2;
            });
          // console.log('bubble hover', d);
          return d;
          })
        .on('mouseout', function(d) {
          select(this).transition()
          .attr('stroke-width', '1px')
          .style('fill', (d:any) => (interpolateCividis(cScale(d.radiusVal))))
          .attr('r', (d:any) => d.cases.length*5);
          })
        .on('click', function(d:any) {
          const tractData = d;
          self.openPopup(tractData);
          });
      // draw brushable circles map legend maplegend
      // @ts-ignore
      const distinctVals = [...new Set(cCases.map((d)=> Math.floor(rScale(d.radiusVal))))].sort((a,b)=> a-b);
      // const legendCircles = [0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1];

      let brushCircles = select ('#circleBrush').selectAll('circle').data(distinctVals);
      brushCircles.exit().remove();
      brushCircles = brushCircles.enter().append('circle').merge(brushCircles)
      // brushCircles.enter().append('circle')
        // .attr('class', 'leaflet-interactive')
        .attr('cx', (d, i) => {
          return 10+i*40;
        })
        .attr('cy', 60)
        .attr('r', (d:any) => d)
        // .attr('r', (d:any) => Math.round(Math.random()*10))
        .attr('stroke', 'black')
        // .style('fill', 'pink')
        .style('fill', (d:any) => (interpolateCividis(rScale.invert(d)/maxRadiusVal)));
    }

  private updateCircles() {
      const self = this;
      const mapObject = self.leafMap;
      let dots;
      try {
        mapObject.removeLayer(self.circleLayer);
      } catch(e) {
        console.log(e);
      }
      // console.log('map has layer dots', mapObject.hasLayer(dots));
      // console.log('mapObject layers', mapObject._layers);
      dots = new L.LayerGroup();
      dots.id = 'circledots';

      const contpts = self.dotDataColloection.map(function(d) {
        d.containercoords = mapObject.latLngToContainerPoint([d.latitude, d.longitude]);
      return d;
      });
        const forcesim = forceSimulation(contpts)
        .force('collision', forceCollide().radius(function(d) {
          const radiusweight = 1.2;
          // return rscale(d.properties.Nnorm)*radiusweight
          return 10;
        }))
        .force('x', forceX().x(function(d) {
          return d.containercoords.x;}))
        .force('y', forceY().y(function(d) {
          return d.containercoords.y;}))
        .tick(100) //tes
        .stop();
      const circlemarkers = contpts.map(function(dot) {
      const nlatnlon = mapObject.containerPointToLatLng([dot.x, dot.y]);
      const newdot =  new L.CircleMarker(nlatnlon, {color: 'red', fillColor: 'orange', radius: 10});
        newdot.addTo(dots);
        return newdot;
      });
        // console.log('new leaf circles', dots)
      mapObject.addLayer(dots);
      self.circleLayer = dots;
        //nothing here
    }

    private drawGeographicalMap() {
      const self = this;
    //     const projection = d3.geoConicConformal()
    // .parallels([39 + 1 / 60, 40 + 39 / 60])
    // .rotate([111 + 30 / 60, 0])
    // .fitExtent([[padding, padding],[width, height]], mapdata)
      this.projection = geoConicConformal()
        .parallels([39 + 1 / 60, 40 + 39 / 60])
        .rotate([111 + 30 / 60, 0])
        .fitExtent([[10, 10],[this.svgWidth, this.svgHeight]], self.mapManager.topojsonFeatures);
      // this.projection = geoMercator()
      //       .translate(this.nodeCenter)
      //       .scale(5000)
      //       .center(this.mapCenter);
      const pathFuction = geoPath().projection(self.projection);
      const countyTooltip = select('#countytip');
      // console.log('topojsonFeatures', self.mapManager.topojsonFeatures);
    //   let paths = select('#mapLayer').selectAll('path').data(self.mapManager.topojsonFeatures.features);
    //   paths.exit().remove();
    //   paths = paths.enter().append('path').merge(paths).classed('map-paths',true);
    //   // paths.transition()
    //   //      .duration(700)
    //   paths.attr('id',(d)=>(d as any).properties.GEOID)
    //        .attr('d', pathFuction);
    // //  console.log(self.mapManager.topojson_features.features)
    //   paths.on('mouseover',function(d) {
    //            countyTooltip
    //            // .transition()
    //            // .duration(200)
    //            .style('opacity',0.9);
    //            countyTooltip.html((d as any).properties.NAME)
    //            .style('left', (event.pageX) + 'px')
    //             .style('top', (event.pageY - 28) + 'px');
    //           })
    //          .on('mouseout',function(d) {
    //            countyTooltip
    //                    //  .transition()
    //                    // .duration(200)
    //                    .style('opacity',0);});

         // select('#map-svg').call(zoom().on('zoom',function(){
         //         self.projection.scale(event.transform.k*5000).center(self.mapCenter)
         //         .translate([self.nodeCenter[0]+event.transform.x,self.nodeCenter[1]+event.transform.y]);
         //         select('#mapLayer').selectAll('path').attr('d',pathFuction);
         //         self.drawMapDots()
         //         }))

         // select('#reset_button').on('click',function(){
         //   if(self.currentViewType==='mapView'){
         //     zoom().transform(select('map-svg'),zoomIdentity)
         //     self.projection.scale(5000).translate(self.nodeCenter).center(self.mapCenter);
         //     select('#mapLayer').selectAll('path').attr('d',pathFuction);
         //     self.drawMapDots();
         //   }
         // })

       }

       private drawLegend(dataArray,colorArray) {

         const legendContainer = select('#map-util');
         legendContainer.selectAll('text').remove();
         legendContainer.append('text')
                        .text(this.currentSelectedMapAttribute)
                        .attr('font-size','20px')
                        .attr('y',25)
                        .attr('x',0.125*this.svgWidth)
                        .attr('text-anchor','end');

         if(colorArray==='TEXT') {
            legendContainer.selectAll('rect').remove();
           return;
         }
         let legendRects = legendContainer.selectAll('.legend-rect').data(colorArray);
         legendRects.exit().remove();
         legendRects = legendRects.enter().append('rect').merge(legendRects);

         legendRects.attr('x',0)
                    .attr('y',(d,i)=>i * 25+50)
                    .attr('width', 100)
                    .attr('height',20)
                    .attr('fill',(d:any)=>d)
                    .attr('class','legend-rect');
         let legendText = legendContainer.selectAll('.legend-text').data(dataArray);
         legendText.exit().remove();
         legendText = legendText.enter().append('text').merge(legendText);

         legendText.attr('x',110)
                   .attr('y',(d,i)=>i*25+50)
                   .attr('class','legend-text')
                   .attr('alignment-baseline','hanging')
                  // .attr('fill','white')
                   .text((d:any)=>d);

       }
       // console.log('this.dotDataColloection', this.dotDataColloection);

    private highlightID(selectedId) {
      console.log('HIGHLIGHT BY ID FUNCTION FROM mapView.ts');
         this.dotDataColloection.forEach((person)=> {
           const id = person.ID;
           if (id !== selectedId) {
             select('#graphLayer').selectAll('.line_graph_'+id).attr('opacity',0.1);
             select('#drawLayer').select('#circle_'+id).attr('opacity',0.1);
           } else {
             select('#graphLayer').selectAll('.line_graph_'+id).attr('opacity',0.8);
             select('#drawLayer').select('#circle_'+id).attr('opacity',1);
           }
         });
       }
    private clearAllHighlight() {
         select('#graphLayer').selectAll('.line_graph').attr('opacity',0.8);
         select('#drawLayer').selectAll('circle').attr('opacity',1);
       }
    private getTractCircleByID(personID, kindredID) {
        const pID = personID;
        const kID = kindredID;
        const selCircle = select('#col4').select('#leafSVG').selectAll('circle').filter((circ:any) => {
          const ids = circ.cases.map((ccase: any) => {
            if (ccase.personID.toString() === pID.toString() && ccase.KindredID.toString() === kID.toString()) {
              return 1;
            } else {
              return 0;
            }
          });
          if (ids.includes(1)) {
            return circ;
          }
        });
        return selCircle.data()[0];
     }
    private getIDFromY(rowY) {
      const yVal = rowY;
      const affNodes = select('#col2').select('#nodes').selectAll('g.node.affected');
      const selNode:any = affNodes.filter((dd:any) => {
        return dd.y === yVal;
      }).data()[0];
      return typeof(selNode) !== 'undefined'? [selNode.id, selNode.kindredID]: [];
      // return [selNode.id, selNode.kindredID];
    }
    private openPopup(tractData) {
    // private openPopup(selectedId, kindredID) {
      const self = this;
      const mo = self.getMapOption();
      // const tractData:any = self.getTractCircleByID(selectedId, kindredID);
      if (typeof tractData === 'undefined') {
        console.log('Record has no geospatial reference');
        return;
      //  TODO - add function to display info/error for no matching map record...
      }
      const kindredMap = new Map();
      tractData.cases.forEach((scase) => {
        if(scase.ID) {
          scase.personid = scase.ID;
        }
        const kID = scase.KindredID;
        const coll = kindredMap.get(kID);
        if (!coll) {
          kindredMap.set(kID, [scase]);
        } else {
          coll.push(scase);
        }
      });
      const kindredArray = Array.from(kindredMap.entries());
      // console.log('kindred aray', kindredArray);
      //Create this table at init, or when building the map, then no need to add and remove...
      select('#btable').remove();
      const btab = select('body').append('table')
        .attr('id', 'btable')
        .attr('class', 'popupTable');
      // const popupTable = select('#mapPopupTable');
      btab.append('caption').html('Tract: '+tractData.GEOID10+'<br>2010 Pop: '+tractData.properties.POP100);
      const popTableHeader = btab.append('thead');
      const popTableBody = btab.append('tbody');
      const tableColumns = popTableHeader.append('tr').selectAll('th').data(['Family ID', 'Person ID', self.currentSelectedMapAttribute]).enter().append('th')
        .text((d)=> {return d;});
      // PROCESS THESE DATA POINTS SO THAT THEY ARE GROUPED BY FAMILY ID
      const tableRows = popTableBody.selectAll('tr').data(tractData.cases).enter().append('tr');
      tableRows.classed('poprow', true);
      const tableCells = tableRows.selectAll('td')
        .data((d:any, i) => {
          return [d.KindredID, d.personid, d.dataVal];
        })
        .enter().append('td')
        .text((d:any, i) => {
          return d;});
      // Generate popup content and open:
      const popUp = L.popup({closeOnClick: false, keepInView: true, maxWidth: '600'})
        .setLatLng([tractData.properties.INTPTLAT10, tractData.properties.INTPTLON10])
        // .setContent('<table id=mapPopupTable></table>')
        .setContent(document.getElementById('btable'))
        .openOn(self.leafMap);
      const caseRows = select('#btable').select('tbody').selectAll('tr');
      caseRows.on('click', function(d:any) {
        const currentrow = this;
        caseRows.classed('selected', false);
        select(currentrow).classed('selected', true);
        const personID = d.personid;
        events.fire(CLEAR_TABLE_HIGHLIGHT);
        events.fire(CLICKHIGHLIGHT_BY_ID,personID);
        return d;
      });
       }
    private openPopupFromY(yVal) {
      const self = this;
      const selNode = self.getIDFromY(yVal);
      if(selNode.length===0) {
        console.log('No spatial reference for selected case');
        return;
      }
      const [pID, kID] = selNode;
      const tractData:any = self.getTractCircleByID(pID, kID);
      self.openPopup(tractData);
      // self.openPopup(pID, kID);
    }
    private getMapOption() {
      const mapOption = select('#mapOption').selectAll('a')
      const active = mapOption.select('active');
    }
    private attachListener() {
      const self = this;
      events.on(TABLE_VIS_ROWS_CHANGED_EVENT, () => {
        self.update();
      });
      events.on(MAP_ATTRIBUTE_CHANGE_EVENT,()=> {
        self.update();
     });
     events.on(SHOW_TOP_100_EVENT,()=> {
       self.update();
      //   console.log('fire top 100')
     });
     events.on(SHOW_DETAIL_VIEW, (evt, vector) => {
       if(!self.detailViewAttribute.includes(vector.name)) {
          self.detailViewAttribute.unshift(vector.name);
       }
       if(self.detailViewAttribute.length>3) {
          self.detailViewAttribute = self.detailViewAttribute.slice(0,3);
       }
       self.currentViewType = 'Detail';
       self.update();
     });
     events.on(HIGHLIGHT_MAP_BY_ID,(evt,id)=> {
      self.highlightID(id);
     });
     events.on(CLEAR_MAP_HIGHLIGHT,()=> {
       self.clearAllHighlight();
       });
     events.on(COL_ORDER_CHANGED_EVENT,()=> {
       self.update();
     });
     events.on(OPEN_MAP_POPUP,(evt, yVal)=> {
       self.openPopupFromY(yVal);
     });
   }
}
export function create() {
    return new MapView();
}
