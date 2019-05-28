import * as events from 'phovea_core/src/event';
import { select, selection, selectAll, mouse, event } from 'd3-selection';
import { format } from 'd3-format';
import {Config} from './config';
import { scaleLinear, scaleOrdinal, schemeCategory10 } from 'd3-scale';
import { max, min, mean } from 'd3-array';
import {zoom, zoomIdentity} from 'd3-zoom';
import {axisBottom,axisLeft } from 'd3-axis';
import {geoCentroid,geoMercator,geoPath} from 'd3-geo'
import {forceSimulation,forceCollide} from 'd3-force'
import {timeout} from 'd3-timer'
import {feature as topofeature} from 'topojson';
import * as MapManager from './mapManager';
import {
  TABLE_VIS_ROWS_CHANGED_EVENT,
  MAP_ATTRIBUTE_CHANGE_EVENT,
  SHOW_TOP_100_EVENT,
  SHOW_DETAIL_VIEW,
  COL_ORDER_CHANGED_EVENT,
  HIGHLIGHT_BY_ID,
  CLEAR_TABLE_HIGHLIGHT
} from './tableManager';
import { VALUE_TYPE_CATEGORICAL,
        VALUE_TYPE_INT,
        VALUE_TYPE_REAL,
        VALUE_TYPE_STRING } from 'phovea_core/src/datatype';


class MapView{
    private mapManager;
    private currentSelectedMapAttribute: string = 'sex';
    private currentViewType = 'Hide';
    //private topojson_features;
    private map_center;
    private svgWidth = (select('#map').node() as any).getBoundingClientRect().width;
    private node_center;
    private projection;
    private dotDataColloection;
    private margin = Config.margin;
    private svgHeight = (select('#col4').node() as any).getBoundingClientRect().height-this.margin.top - this.margin.bottom;
    private detailViewAttribute: string = 'None';
    private graphMargin = {top: 50, right: 50, bottom: 50, left: 50}

    public init(mapManager){
      this.mapManager = mapManager;
      //document.getElementById('col4').style.display = 'none';


      this.map_center=geoCentroid(this.mapManager.topojson_features);
      this.node_center = [this.svgWidth/2,(this.svgHeight-195)/2];
      select('#map').append('div').attr('id','mapDiv1')
          .append('svg').attr('width',this.svgWidth).attr('height',195).attr('id','util');

      select('#map').append('div').attr('id','mapDiv2')
          .append('svg').attr('id','map-svg').attr('width',this.svgWidth).attr('height',this.svgHeight-195);

      select('#util').append('g').attr('id','graph-util');
      select('#util').append('g').attr('id','map-util')
                                 .attr('transform','translate('+0.75*this.svgWidth+',0)')
      select('#map-svg').append('g').attr('id',"mapLayer");
      select('#map-svg').append('g').attr('id','drawLayer');

      select('#map-svg').append('g').attr('id','graphLayer')
                                    .attr('transform','translate('+this.graphMargin.left+','+this.graphMargin.top+')');
      select("#col4").append("div")
          .attr("class", "tooltip")
          .attr('id','circletip')
          .attr("opacity", 0)
          .attr('background','white');

      select('#col4').append('div')
          .attr('class','tooltip')
          .attr('id','countytip')
          .attr('opacity',0)
          .attr('background','white');
      this.initUtil();

      this.attachListener();
    }

    private initUtil(){
      const self = this;
      let buttondiv = select('#map').append('div').attr('id','button-div');
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

          self.currentViewType = 'Detail'


      } else if (d === 'Map') {

          self.currentViewType = 'Map'

      } else {
         self.currentViewType = 'None'

      }
      self.update();
      }
    )



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
        .classed('active', d => d===this.currentSelectedMapAttribute)
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
        .classed('active', d=>d== this.currentSelectedMapAttribute)
        .html((d:any) => { return d; })
        .merge(menuItems);

      selectAll('.dropdown-item-map').on('mousedown', function (d) {
          event.preventDefault();
          //Check if is selected, if so remove from table.
          d = d.toString()

          if (self.currentSelectedMapAttribute!=d) {
            self.currentSelectedMapAttribute = d as string;
            selectAll('.dropdown-item-map').classed('active',false);
            select(this).classed('active', true);
            events.fire(MAP_ATTRIBUTE_CHANGE_EVENT,undefined)
          }
        });

      self.update();
    }

    deleteHighlight(){

    }

    async update(){
      const self = this;
      self.dotDataColloection = await self.mapManager.prepareData(this.currentSelectedMapAttribute);
    //  console.log(this.dotDataColloection)
      if (this.currentViewType == 'Map'){
        document.getElementById('col4').style.display = 'block';
        select('#graphLayer').attr('opacity',0).attr('pointer-events','none')
        select('#graph-util').attr('opacity',0)
        select('#map-util').attr('opacity',1)
        select('#mapLayer').attr('opacity',1).attr('pointer-events','auto')
        select('#drawLayer').attr('opacity',1).attr('pointer-events','auto')
        self.drawGeographicalMap();
        self.drawMapDots();
      }
      else if(this.currentViewType == 'Detail'){
        document.getElementById('col4').style.display = 'block';
        select('#graphLayer').attr('opacity',1).attr('pointer-events','auto')
        select('#mapLayer').attr('opacity',0).attr('pointer-events','none')
        select('#drawLayer').attr('opacity',0).attr('pointer-events','none')
        select('#graph-util').attr('opacity',1)
        select('#map-util').attr('opacity',0)

        self.drawDetailView();
      }
      else{
        document.getElementById('col4').style.display = 'none';
        //do nothing
      }
    }

    private drawMapDots(){
      let self = this;

      let draw = select("#drawLayer");
      draw.selectAll('rect').remove()

      let circle_tip = select('#col4').select('#circletip');

      //TODO make new legend
      // select('.legend').selectAll('.rectLegend').remove()
      //
      // let legend = svglegend.legendColor()
      // legend.scale(self.legendScale);
      // legend.shapeWidth((that.svgWidth)/8);
      // d3.select('.legend').call(legend);
      self.dotDataColloection.forEach(dot =>{
        [dot.x,dot.y] = self.projection([dot.longitude,dot.latitude])
      })

      let simulation = forceSimulation(self.dotDataColloection)
                          .force('collide',forceCollide().radius(5).iterations(10))
                          .stop();

      timeout(function(){
      for (var i = 0,
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
                      .on("mouseover", function(d:any) {
                         circle_tip.style("opacity", .9);
                         // .transition()
                         // .duration(10)
                         events.fire(HIGHLIGHT_BY_ID,d.ID)
                         circle_tip.html(d.dataVal)
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY - 28) + "px");
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
                      .on("mouseout", function(d:any) {
                        events.fire(CLEAR_TABLE_HIGHLIGHT)
                         circle_tip
                         //.transition()
                     //    .duration(10)
                         .style("opacity", 0);
                     //    draw.select('#exactLocationLine').remove();
                       });
                  }
              )
              //// TODO: get the array for the legend
          if (self.mapManager.selectedMapAttributeType === VALUE_TYPE_CATEGORICAL){
              const allCategories = self.mapManager.selectedAttributeVector.desc.value.categories.map(c=>c.name)
              self.drawLegend(allCategories,schemeCategory10.slice(0,allCategories.length))

          }
          else if (self.mapManager.selectedMapAttributeType === VALUE_TYPE_REAL ||
                   self.mapManager.selectedMapAttributeType === VALUE_TYPE_INT){
              const formater = format('.0f')
              const dataScale = scaleLinear().domain([0,1]).range(self.mapManager.selectedAttributeVector.desc.value.range)
              const dataInputs = [formater(dataScale(0.2)),formater(dataScale(0.4)),formater(dataScale(0.6)),formater(dataScale(0.8)),formater(dataScale(1))]
              const colors = dataInputs.map(d=>self.mapManager.scaleFunction(d))
              self.drawLegend(dataInputs,colors)
          }
          else if (self.currentSelectedMapAttribute === 'KindredID'){
            const allCategories = self.mapManager.tableManager.familyIDArray
            self.drawLegend(allCategories, schemeCategory10.slice(1, allCategories.length+1))
          }
          else{
            self.drawLegend([],'TEXT')
          }
    }

    private async drawDetailView(){

      const self = this;
      const width = self.svgWidth - self.graphMargin.left - self.graphMargin.right
      const height = self.svgHeight - self.graphMargin.top - self.graphMargin.bottom-195

      const graph = select('#graphLayer');
      if(self.detailViewAttribute === 'None'  || !self.mapManager.tableManager.colOrder.includes(self.detailViewAttribute)){
        self.detailViewAttribute = 'None'
        graph.selectAll('text').remove()
        graph.selectAll('.axis').remove()
        graph.selectAll('.line_graph').remove();
        select('graph-util').selectAll('text').remove()
        graph.append('text').text('No attribute selected').attr('transform','translate('+0.5*width+','+0.5*height+')');
        return;
      }

      select('#graph-util').append('text')
                          .text(self.detailViewAttribute.slice(0,self.detailViewAttribute.length-3))
                          .attr('x',this.svgWidth*0.5)
                          .attr('font-size','23px')
                          .attr('y','95%')
                          .attr('text-anchor','middle')
                          .attr('alignment-baseline','baseline')

      const aqCols = [];
      const allCols = await this.mapManager.tableManager.AQTable.cols();

      for (const vector of allCols){
        if (vector.desc.name.includes(self.detailViewAttribute)){
          aqCols.push(vector)
        }
      }

      if (aqCols.length === 0){
        graph.selectAll('text').remove()
        graph.selectAll('.axis').remove()
        graph.selectAll('.line_graph').remove();
        select('graph-util').selectAll('text').remove()
        graph.append('text').text('No attribute selected').attr('transform','translate('+0.5*width+','+0.5*height+')');
        self.detailViewAttribute = 'None'
        return;
      }

      const aqDataAccum = [];
      let allaqPromises = [];
      aqCols.forEach((vector)=>{
        allaqPromises = allaqPromises.concat([
          vector.data(),
          vector.names(),
          vector.desc.name,
          vector.ids(),
          vector.desc.value.range
        ]);
      });
      const finishedAQPromises = await Promise.all(allaqPromises);

      let aqDataDict = {}
      aqCols.forEach((vector,index)=>{
        aqDataDict[finishedAQPromises[index*5+2]] = {'data':finishedAQPromises[index*5],'ids':finishedAQPromises[index*5+1],
        'range':finishedAQPromises[index*5+4]}
      });
      let range_counter = []

      let personArrayDict = {};
      finishedAQPromises[1].forEach((personID)=>{
        personArrayDict[personID] =  new Array(29)
      });


      for (let i = -14; i < 15; i++){
        const dayentry = aqDataDict[self.detailViewAttribute+i.toString()]
        const data = dayentry.data;
        dayentry.ids.forEach((personID,number_index)=>{
          personArrayDict[personID][i+14]=data[number_index];
        })
        range_counter = range_counter.concat(dayentry.range)
      }
      const detailViewData:any = {}
      detailViewData.ids = Object.keys(personArrayDict)
      detailViewData.data = detailViewData.ids.map(key => personArrayDict[key]).filter(d=>d);
      detailViewData.range = [min(range_counter),max(range_counter)]
      graph.selectAll('text').remove()
      graph.selectAll('.axis').remove()
      graph.selectAll('.line_graph').remove();

      const xLineScale = scaleLinear().domain([0,29]).range([0,width])
      const yLineScale = scaleLinear().domain(detailViewData.range).range([height,0])

      graph.append('g')
          .attr('class','axis visible_axis')
          .call(axisLeft(yLineScale))

      graph.append('g')
          .attr('class','axis visible_axis')
          .call(axisBottom(xLineScale))
          .attr('transform', 'translate(0,' + height + ')');

      detailViewData.data.forEach((singleData,index)=>{

        let cleaned_dataArray = singleData.map(d=>isNaN(d)? 0: d)
        //detailViewData is the object to be visualized in the supplement view

        graph.selectAll('.place_holder')
              .data(singleData)
              .enter()
              .append('polyline')
              .attr('points',(d,i)=>{
                let x1,x2,y1,y2,x3,y3;
                if (i==0){
                  x1 = xLineScale(0)
                  x2 = xLineScale(0.5)
                  y1 = yLineScale(cleaned_dataArray[i]);
                  y2 = isNaN(singleData[i+1])?yLineScale(cleaned_dataArray[i]):yLineScale((cleaned_dataArray[i] + cleaned_dataArray[i+1])/2)

                  x3 = xLineScale(0.5)
                  y3 = isNaN(singleData[i+1])? yLineScale(cleaned_dataArray[i]):yLineScale((cleaned_dataArray[i] + cleaned_dataArray[i+1])/2)

                }
                else if (i == 28){
                  x1 = xLineScale(27.5)
                  x2 = xLineScale(28)
                  y1 = isNaN(singleData[i-1]) ? yLineScale(cleaned_dataArray[i]): yLineScale((cleaned_dataArray[i] + cleaned_dataArray[i-1])/2)

                  y2 =yLineScale ( cleaned_dataArray[i])
                  x3 = xLineScale(28)
                  y3 = yLineScale(cleaned_dataArray[i])
                }
                else{
                  x1 = xLineScale(i-0.5);
                  x2 = xLineScale(i+0.5);
                  x3 = xLineScale(i);

                  y3 = yLineScale(cleaned_dataArray[i])
                  if (isNaN(singleData[i-1])){
                    y1 = yLineScale(cleaned_dataArray[i])
                  }
                  else{
                    y1 = yLineScale((cleaned_dataArray[i] + cleaned_dataArray [ i-1])/2);
                  }
                  if (isNaN(singleData[i+1])){
                    y2 = yLineScale(cleaned_dataArray[i])
                  }
                  else{
                    y2 = yLineScale((cleaned_dataArray[i] + cleaned_dataArray[i+1])/2);
                  }

                }

                return x1 + ',' + y1 + ' ' +
                       x3 + ',' + y3 + ' ' +
                       x2 + ',' + y2 + ' ' })
                .attr('class','line_graph line_graph_'+detailViewData.ids[index])
                .attr('stroke',(d,i)=>{
                  if (isNaN(singleData[i]))
                  { return 'none';}
                  else
                  {return '#767a7a';}})
                .attr('stroke-width',3)
                .attr('opacity', 0.8)
      })
      graph.selectAll('.line_graph')
           .on('mouseover',function(d){
              const selected_id = select(this).attr('class').split('_')[3]
              detailViewData.ids.forEach((id)=>{
                if (id !== selected_id){
                  graph.selectAll('.line_graph_'+id).attr('opacity',0.2)
                }
                else{
                  graph.selectAll('.line_graph_'+id).attr('opaity',0.8)
                }
              })
              events.fire(HIGHLIGHT_BY_ID,selected_id)
           })
           .on('mouseout',d=>{
             graph.selectAll('.line_graph').attr('opacity',0.8)
             events.fire(CLEAR_TABLE_HIGHLIGHT)
           })


    }

    private drawGeographicalMap(){
      const self = this;
      this.projection = geoMercator()
            .translate(this.node_center)
            .scale(5000)
            .center(this.map_center);
      const path_fuction = geoPath().projection(self.projection);
      const county_tooltip = select('#countytip');

      let paths = select('#mapLayer').selectAll('path').data(self.mapManager.topojson_features.features);
      paths.exit().remove();
      paths = paths.enter().append('path').merge(paths).classed('map-paths',true);
      // paths.transition()
      //      .duration(700)
      paths.attr("id",(d)=>(d as any).properties.GEOID)
           .attr("d", path_fuction);
    //  console.log(self.mapManager.topojson_features.features)
      paths.on('mouseover',function(d){
               county_tooltip
               // .transition()
               // .duration(200)
               .style('opacity',0.9);
               county_tooltip.html((d as any).properties.NAME)
               .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
              })
             .on('mouseout',function(d){
               county_tooltip
                       //  .transition()
                       // .duration(200)
                       .style('opacity',0)});

         // select('#map-svg').call(zoom().on('zoom',function(){
         //         self.projection.scale(event.transform.k*5000).center(self.map_center)
         //         .translate([self.node_center[0]+event.transform.x,self.node_center[1]+event.transform.y]);
         //         select('#mapLayer').selectAll('path').attr('d',path_fuction);
         //         self.drawMapDots()
         //         }))

         // select('#reset_button').on('click',function(){
         //   if(self.currentViewType==='mapView'){
         //     zoom().transform(select('map-svg'),zoomIdentity)
         //     self.projection.scale(5000).translate(self.node_center).center(self.map_center);
         //     select('#mapLayer').selectAll('path').attr('d',path_fuction);
         //     self.drawMapDots();
         //   }
         // })

       }

       private drawLegend(dataArray,colorArray){

         const legendContainer = select('#map-util')
         legendContainer.selectAll('text').remove()
         legendContainer.append('text')
                        .text(this.currentSelectedMapAttribute)
                        .attr('font-size','20px')
                        .attr('y',25)
                        .attr('x',0.125*this.svgWidth)
                        .attr('text-anchor','middle')

         if(colorArray==='TEXT'){
            legendContainer.selectAll('rect').remove()
           return
         }
         let legendRects = legendContainer.selectAll('.legend-rect').data(colorArray);
         legendRects.exit().remove();
         legendRects = legendRects.enter().append('rect').merge(legendRects)

         legendRects.attr('x',0)
                    .attr('y',(d,i)=>i * 25+50)
                    .attr('width', 100)
                    .attr('height',20)
                    .attr('fill',(d:any)=>d)
                    .attr('class','legend-rect')
         let legendText = legendContainer.selectAll('.legend-text').data(dataArray);
         legendText.exit().remove();
         legendText = legendText.enter().append('text').merge(legendText)

         legendText.attr('x',110)
                   .attr('y',(d,i)=>i*25+50)
                   .attr('class','legend-text')
                   .attr('alignment-baseline','hanging')
                  // .attr('fill','white')
                   .text((d:any)=>d)

       }


       private attachListener() {
         const self = this;
         events.on(TABLE_VIS_ROWS_CHANGED_EVENT, () => {
           self.update();
        //   console.log('fire table row')
         })
         events.on(MAP_ATTRIBUTE_CHANGE_EVENT,()=>{
           self.update();
         })
         events.on(SHOW_TOP_100_EVENT,()=>{
           self.update();
        //   console.log('fire top 100')
         })
         events.on(SHOW_DETAIL_VIEW, (evt, vector) => {
           self.detailViewAttribute = vector.name;
           self.currentViewType = 'Detail';
           self.update();

         })

         events.on(COL_ORDER_CHANGED_EVENT,()=>{
           self.update()
         })
       }


}
export function create(){
    return new MapView();
}
