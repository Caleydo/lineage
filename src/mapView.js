import * as tslib_1 from "tslib";
import * as events from 'phovea_core/src/event';
import { select, selectAll, event } from 'd3-selection';
import { format } from 'd3-format';
import { Config } from './config';
import { scaleLinear, schemeCategory10 } from 'd3-scale';
import { interpolateReds, interpolateRdBu } from 'd3-scale-chromatic';
import { line as line_generator, curveMonotoneX } from 'd3-shape';
import { max, min } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { geoCentroid, geoMercator, geoPath } from 'd3-geo';
import { forceSimulation, forceCollide } from 'd3-force';
import { timeout } from 'd3-timer';
import { TABLE_VIS_ROWS_CHANGED_EVENT, MAP_ATTRIBUTE_CHANGE_EVENT, SHOW_TOP_100_EVENT, SHOW_DETAIL_VIEW, COL_ORDER_CHANGED_EVENT, HIGHLIGHT_BY_ID, HIGHLIGHT_MAP_BY_ID, CLEAR_TABLE_HIGHLIGHT, CLEAR_MAP_HIGHLIGHT } from './tableManager';
import { VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT, VALUE_TYPE_REAL } from 'phovea_core/src/datatype';
var MapView = /** @class */ (function () {
    function MapView() {
        this.currentSelectedMapAttribute = 'sex';
        this.currentViewType = 'Hide';
        this.svgWidth = select('#map').node().getBoundingClientRect().width;
        this.margin = Config.margin;
        this.svgHeight = select('#col4').node().getBoundingClientRect().height - this.margin.top - this.margin.bottom;
        this.detailViewAttribute = [];
        this.scaleDict = {};
        //  private detailViewAttribute = 'None'
        this.graphMargin = { top: 0.1 * this.svgHeight, right: 50, bottom: 0.1 * this.svgHeight, left: 50 };
        this.allIds = [];
        this.epaColor = ['#00e400', '#ff0', '#ff7e00', '#f00', '#99004c', '#7e0023'];
        this.temporalDataRange = {
            pm25day: [0, 12, 35.4, 55.4, 150.4, 250.4],
            meanO3day: [0, 54, 70, 85, 105],
            meanNO2day: [0, 53, 100, 360, 649, 1249]
        };
    }
    MapView.prototype.init = function (mapManager) {
        this.mapManager = mapManager;
        //document.getElementById('col4').style.display = 'none';
        this.mapCenter = geoCentroid(this.mapManager.topojson_features);
        this.nodeCenter = [this.svgWidth / 2, (this.svgHeight) / 2];
        select('#map').append('div').attr('id', 'mapDiv2')
            .append('svg').attr('id', 'map-svg').attr('width', this.svgWidth).attr('height', this.svgHeight);
        //select('#util').append('g').attr('id','graph-util');
        select('#map-svg').append('g').attr('id', 'map-util')
            .attr('transform', 'translate(' + 0.75 * this.svgWidth + ',0)');
        select('#map-svg').append('g').attr('id', 'mapLayer').attr('transform', 'translate(0,195)');
        select('#map-svg').append('g').attr('id', 'drawLayer').attr('transform', 'translate(0,195)');
        select('#map-svg').append('g').attr('id', 'graphLayer')
            .attr('transform', 'translate(' + this.graphMargin.left + ',' + this.graphMargin.top + ')');
        select('#col4').append('div')
            .attr('class', 'tooltip')
            .attr('id', 'circletip')
            .attr('opacity', 0)
            .attr('background', 'white');
        select('#col4').append('div')
            .attr('class', 'tooltip')
            .attr('id', 'countytip')
            .attr('opacity', 0)
            .attr('background', 'white');
        this.initUtil();
        this.attachListener();
    };
    MapView.prototype.initUtil = function () {
        var _this = this;
        var self = this;
        var buttondiv = select('#map').append('div').attr('id', 'button-div');
        // let resetButton = buttondiv.append('button')
        //             .attr('id','reset_button')
        //             .text('Reset zoom');
        document.getElementById('col4').style.display = 'none';
        var mapdropdownMenu = select('.navbar-collapse').append('ul')
            .attr('class', 'nav navbar-nav')
            .attr('id', 'mapOption');
        var optionList = mapdropdownMenu.append('li').attr('class', 'dropdown');
        optionList.append('a')
            .attr('class', 'dropdown-toggle')
            .attr('data-toggle', 'dropdown')
            .attr('role', 'button')
            .html('Supplement View Option')
            .append('span')
            .attr('class', 'caret');
        var mapMenu = optionList.append('ul').attr('class', 'dropdown-menu');
        var mapmenuItems = mapMenu.selectAll('.demoAttr')
            .data(['Map', 'Detail', 'Hide']);
        mapmenuItems = mapmenuItems.enter()
            .append('li')
            .append('a')
            .attr('class', 'layoutMenu')
            .classed('active', function (d) { return d === 'Expand'; })
            .html(function (d) { return d; })
            .merge(mapmenuItems);
        mapmenuItems.on('click', function (d) {
            var currSelection = selectAll('.layoutMenu').filter(function (e) { return e === d; });
            // if (currSelection.classed('active')) {
            //   return;
            // }
            selectAll('.layoutMenu').classed('active', false);
            currSelection.classed('active', true);
            if (d === 'Detail') {
                self.currentViewType = 'Detail';
            }
            else if (d === 'Map') {
                self.currentViewType = 'Map';
            }
            else {
                self.currentViewType = 'None';
            }
            self.update();
        });
        var dropdownMenu = select('.navbar-collapse')
            .append('ul')
            .attr('class', 'nav navbar-nav')
            .attr('id', 'mapAttribute');
        var list = dropdownMenu.append('li').attr('class', 'dropdown');
        list.append('a')
            .attr('class', 'dropdown-toggle')
            .attr('data-toggle', 'dropdown')
            .attr('role', 'button')
            .html('Map Attribute')
            .append('span')
            .attr('class', 'caret');
        var menu = list.append('ul').attr('class', 'dropdown-menu');
        menu.append('h4').attr('class', 'dropdown-header')
            .style('font-size', '16px')
            .html('Demographic Attributes');
        var colNames = this.mapManager.tableManager.getDemographicColumns().map(function (col) {
            return col.desc.name;
        });
        var menuItems = menu.selectAll('.demoAttr')
            .data(colNames);
        menuItems = menuItems.enter()
            .append('li')
            .append('a')
            .attr('class', 'dropdown-item-map demoAttr')
            .classed('active', function (d) { return d === _this.currentSelectedMapAttribute; })
            .html(function (d) { return d; })
            .merge(menuItems);
        menu.append('li').attr('class', 'divider').attr('role', 'separator');
        menu.append('h4').attr('class', 'dropdown-header').style('font-size', '16px')
            .html('Clinical Attributes');
        colNames = this.mapManager.tableManager.getAttrColumns().map(function (col) {
            return col.desc.name;
        });
        menuItems = menu.selectAll('.clinicalAttr')
            .data(colNames);
        menuItems = menuItems.enter()
            .append('li')
            .append('a')
            .attr('class', 'dropdown-item-map clinicalAttr')
            .classed('active', function (d) { return d === _this.currentSelectedMapAttribute; })
            .html(function (d) { return d; })
            .merge(menuItems);
        selectAll('.dropdown-item-map').on('mousedown', function (d) {
            event.preventDefault();
            //Check if is selected, if so remove from table.
            d = d.toString();
            if (self.currentSelectedMapAttribute !== d) {
                self.currentSelectedMapAttribute = d;
                selectAll('.dropdown-item-map').classed('active', false);
                select(this).classed('active', true);
                events.fire(MAP_ATTRIBUTE_CHANGE_EVENT, undefined);
            }
        });
        self.update();
    };
    MapView.prototype.update = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var self, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        self = this;
                        _a = self;
                        return [4 /*yield*/, self.mapManager.prepareData(this.currentSelectedMapAttribute)];
                    case 1:
                        _a.dotDataColloection = _b.sent();
                        //  console.log(self.dotDataColloection)
                        if (this.currentViewType === 'Map') {
                            document.getElementById('col4').style.display = 'block';
                            select('#graphLayer').attr('opacity', 0).attr('pointer-events', 'none');
                            //  select('#graph-util').attr('opacity',0)
                            select('#map-util').attr('opacity', 1);
                            select('#mapLayer').attr('opacity', 1).attr('pointer-events', 'auto');
                            select('#drawLayer').attr('opacity', 1).attr('pointer-events', 'auto');
                            self.drawGeographicalMap();
                            self.drawMapDots();
                        }
                        else if (this.currentViewType === 'Detail') {
                            document.getElementById('col4').style.display = 'block';
                            select('#graphLayer').attr('opacity', 1).attr('pointer-events', 'auto');
                            select('#mapLayer').attr('opacity', 0).attr('pointer-events', 'none');
                            select('#drawLayer').attr('opacity', 0).attr('pointer-events', 'none');
                            //  select('#graph-util').attr('opacity',1)
                            select('#map-util').attr('opacity', 0);
                            self.drawDetailView();
                        }
                        else {
                            document.getElementById('col4').style.display = 'none';
                            //do nothing
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    MapView.prototype.drawMapDots = function () {
        var self = this;
        var draw = select('#drawLayer');
        draw.selectAll('rect').remove();
        var circleTip = select('#col4').select('#circletip');
        //TODO make new legend
        // select('.legend').selectAll('.rectLegend').remove()
        //
        // let legend = svglegend.legendColor()
        // legend.scale(self.legendScale);
        // legend.shapeWidth((that.svgWidth)/8);
        // d3.select('.legend').call(legend);
        self.dotDataColloection.forEach(function (dot) {
            var _a;
            _a = self.projection([dot.longitude, dot.latitude]), dot.x = _a[0], dot.y = _a[1];
            dot.x = dot.x + Math.random() * 20;
            dot.y = dot.y + Math.random() * 20;
        });
        var simulation = forceSimulation(self.dotDataColloection)
            .force('collide', forceCollide().radius(5).iterations(10))
            .stop();
        timeout(function () {
            for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
                simulation.tick();
            }
            var circles = draw.selectAll('circle').data(self.dotDataColloection);
            circles.exit().remove();
            circles = circles.enter()
                .append('circle')
                .merge(circles);
            circles.attr('cx', function (d) { return d.x; })
                .attr('cy', function (d) { return d.y; })
                .attr('r', 4)
                .attr('fill', function (d) { return self.mapManager.scaleFunction(d.dataVal); })
                .attr('id', function (d) { return 'circle_' + d.ID; })
                .on('mouseover', function (d) {
                circleTip.style('opacity', .9);
                // .transition()
                // .duration(10)
                events.fire(HIGHLIGHT_BY_ID, d.ID);
                //TODO: this need to not ignore 0
                circleTip.html(d.dataVal ? d.dataVal : '-')
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
                .on('mouseout', function (d) {
                events.fire(CLEAR_TABLE_HIGHLIGHT);
                circleTip
                    //.transition()
                    //    .duration(10)
                    .style('opacity', 0);
                //    draw.select('#exactLocationLine').remove();
            });
        });
        //// TODO: get the array for the legend
        if (self.mapManager.selectedMapAttributeType === VALUE_TYPE_CATEGORICAL) {
            var allCategories = self.mapManager.selectedAttributeVector.desc.value.categories.map(function (c) { return c.name; });
            self.drawLegend(allCategories, schemeCategory10.slice(0, allCategories.length));
        }
        else if (self.mapManager.selectedMapAttributeType === VALUE_TYPE_REAL ||
            self.mapManager.selectedMapAttributeType === VALUE_TYPE_INT) {
            var formater = format('.0f');
            var dataScale = scaleLinear().domain([0, 1]).range(self.mapManager.selectedAttributeVector.desc.value.range);
            var dataInputs = [formater(dataScale(0.2)), formater(dataScale(0.4)), formater(dataScale(0.6)), formater(dataScale(0.8)), formater(dataScale(1))];
            var colors = dataInputs.map(function (d) { return self.mapManager.scaleFunction(d); });
            self.drawLegend(dataInputs, colors);
        }
        else if (self.currentSelectedMapAttribute === 'KindredID') {
            var allCategories = self.mapManager.tableManager.familyIDArray;
            self.drawLegend(allCategories, schemeCategory10.slice(1, allCategories.length + 1));
        }
        else {
            self.drawLegend([], 'TEXT');
        }
    };
    MapView.prototype.drawDetailView = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var self, colorRampWidth, width, height, graph, _loop_1, this_1, currentIndex;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        colorRampWidth = 50;
                        width = self.svgWidth - self.graphMargin.left - self.graphMargin.right - colorRampWidth;
                        height = self.detailViewAttribute.length === 1 ? 0.5 * self.svgHeight : (self.svgHeight - 0.7 * self.detailViewAttribute.length * self.graphMargin.top - 0.7 * self.detailViewAttribute.length * self.graphMargin.bottom) / self.detailViewAttribute.length;
                        graph = select('#graphLayer');
                        //  select('#graph-util').selectAll('text').remove();
                        if (self.detailViewAttribute.length === 0) {
                            graph.selectAll('text').remove();
                            graph.selectAll('.axis').remove();
                            graph.selectAll('.line_graph').remove();
                            graph.selectAll('.color_ramp').remove();
                            graph.selectAll('.linear_gradient').remove();
                            //  select('graph-util').selectAll('text').remove()
                            graph.append('text').text('No attribute selected')
                                .attr('transform', 'translate(' + 0.5 * (self.svgWidth - self.graphMargin.left - self.graphMargin.right) + ',' + 0.5 * (self.svgHeight - self.graphMargin.top - self.graphMargin.bottom) + ')');
                            return [2 /*return*/];
                        }
                        graph.selectAll('text').remove();
                        graph.selectAll('.axis').remove();
                        graph.selectAll('.line_graph').remove();
                        graph.selectAll('.color_ramp').remove();
                        graph.selectAll('.linear_gradient').remove();
                        _loop_1 = function (currentIndex) {
                            var attributeName, startingHeight, aqCols, allCols, _i, allCols_1, vector, aqDataAccum, allaqPromises, finishedAQPromises, aqDataDict, rangeCounter, personArrayDict, _loop_2, i, detailViewData, xLineScale, yLineScale, lineFunction, colorGradient, dataLevels, intervalRange, beginPercent, midPercent, endPercent, i, i, intervalRange, beginPercent, endPercent, i;
                            return tslib_1.__generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        attributeName = self.detailViewAttribute[currentIndex];
                                        startingHeight = currentIndex * height + currentIndex * self.graphMargin.top;
                                        graph.append('text')
                                            .text(attributeName.slice(0, attributeName.length - 3))
                                            .attr('x', (this_1.svgWidth - self.graphMargin.left - self.graphMargin.right) * 0.5)
                                            .attr('font-size', '23px')
                                            .attr('y', startingHeight)
                                            .attr('text-anchor', 'middle')
                                            .attr('alignment-baseline', 'baseline');
                                        graph.append('text')
                                            .classed('graph-icon', true)
                                            .classed('icon', true)
                                            .text(' \uf057')
                                            .attr('y', -7 + (startingHeight))
                                            .attr('x', -6)
                                            .on('click', function () {
                                            self.detailViewAttribute.splice(currentIndex, 1);
                                            self.update();
                                        });
                                        aqCols = [];
                                        return [4 /*yield*/, this_1.mapManager.tableManager.AQTable.cols()];
                                    case 1:
                                        allCols = _a.sent();
                                        for (_i = 0, allCols_1 = allCols; _i < allCols_1.length; _i++) {
                                            vector = allCols_1[_i];
                                            if (vector.desc.name.includes(attributeName)) {
                                                aqCols.push(vector);
                                            }
                                        }
                                        aqDataAccum = [];
                                        allaqPromises = [];
                                        aqCols.forEach(function (vector) {
                                            allaqPromises = allaqPromises.concat([
                                                vector.data(),
                                                vector.names(),
                                                vector.desc.name,
                                                vector.ids(),
                                                vector.desc.value.range
                                            ]);
                                        });
                                        return [4 /*yield*/, Promise.all(allaqPromises)];
                                    case 2:
                                        finishedAQPromises = _a.sent();
                                        aqDataDict = {};
                                        aqCols.forEach(function (vector, index) {
                                            aqDataDict[finishedAQPromises[index * 5 + 2]] = { 'data': finishedAQPromises[index * 5], 'ids': finishedAQPromises[index * 5 + 1],
                                                'range': finishedAQPromises[index * 5 + 4] };
                                        });
                                        rangeCounter = [];
                                        personArrayDict = {};
                                        finishedAQPromises[1].forEach(function (personID) {
                                            personArrayDict[personID] = new Array(29);
                                        });
                                        _loop_2 = function (i) {
                                            var dayentry = aqDataDict[attributeName + i.toString()];
                                            var data = dayentry.data;
                                            //console.log(dayentry)
                                            dayentry.ids.forEach(function (personID, numberIndex) {
                                                personArrayDict[personID][i + 14] = data[numberIndex];
                                            });
                                            rangeCounter = rangeCounter.concat(dayentry.range);
                                        };
                                        for (i = -14; i < 15; i++) {
                                            _loop_2(i);
                                        }
                                        detailViewData = {};
                                        detailViewData.ids = Object.keys(personArrayDict);
                                        detailViewData.data = detailViewData.ids.map(function (key) { return personArrayDict[key]; }).filter(function (d) { return d; });
                                        detailViewData.range = [min(rangeCounter), max(rangeCounter)];
                                        if (self.scaleDict[attributeName]) {
                                            detailViewData.range = [self.scaleDict[attributeName] * min(rangeCounter), max(rangeCounter) * self.scaleDict[attributeName]];
                                        }
                                        xLineScale = scaleLinear().domain([0, 29]).range([0, width]);
                                        yLineScale = scaleLinear().domain(detailViewData.range).range([height + startingHeight, startingHeight]);
                                        //add icon
                                        graph.append('text')
                                            .classed('axis-icon', true)
                                            .classed('icon', true)
                                            .classed('minus', true)
                                            .text('\uf0dd')
                                            .attr('y', -5 + (startingHeight))
                                            .attr('x', 10)
                                            .on('click', function () {
                                            if (self.scaleDict[attributeName]) {
                                                self.scaleDict[attributeName] = self.scaleDict[attributeName] === 0.1 ? 0.1 : self.scaleDict[attributeName] - 0.1;
                                            }
                                            else {
                                                self.scaleDict[attributeName] = 0.9;
                                            }
                                            self.update();
                                        });
                                        graph.append('text')
                                            .classed('axis-icon', true)
                                            .classed('icon', true)
                                            .classed('plus', true)
                                            .text('\uf0de')
                                            .attr('y', -10 + (startingHeight))
                                            .attr('x', 10)
                                            .on('click', function () {
                                            if (self.scaleDict[attributeName]) {
                                                self.scaleDict[attributeName] += 0.1;
                                            }
                                            else {
                                                self.scaleDict[attributeName] = 1.1;
                                            }
                                            self.update();
                                        });
                                        graph.append('g')
                                            .attr('class', 'axis visible_axis')
                                            .call(axisLeft(yLineScale))
                                            .attr('transform', 'translate(' + colorRampWidth + ',0)');
                                        graph.append('g')
                                            .attr('class', 'axis visible_axis')
                                            .call(axisBottom(xLineScale))
                                            .attr('transform', 'translate(' + colorRampWidth + ',' + (startingHeight + height) + ')');
                                        lineFunction = line_generator()
                                            .x(function (d) { return d.x; })
                                            .y(function (d) { return d.y; })
                                            .curve(curveMonotoneX);
                                        detailViewData.data.forEach(function (singleData, index) {
                                            //let cleanedDataArray = singleData.map(d=>isNaN(d)? 0: d)
                                            //detailViewData is the object to be visualized in the supplement view
                                            var cleanedDataArray = singleData.map(function (d, i) {
                                                if (!isNaN(d)) {
                                                    return { x: xLineScale(i), y: yLineScale(d) };
                                                }
                                            });
                                            cleanedDataArray = cleanedDataArray.filter(function (d) { return d; });
                                            graph.append('path')
                                                .datum(cleanedDataArray)
                                                .attr('d', lineFunction)
                                                .attr('stroke-width', 2)
                                                .attr('opacity', 0.75)
                                                .attr('class', 'line_graph line_graph_' + detailViewData.ids[index])
                                                .attr('stroke', '#767a7a');
                                        });
                                        graph.selectAll('.line_graph')
                                            .attr('transform', 'translate(' + colorRampWidth + ',0)')
                                            .attr('fill', 'none')
                                            .on('mouseover', function (d) {
                                            var selectedId = select(this).attr('class').split('_')[3];
                                            detailViewData.ids.forEach(function (id) {
                                                if (id !== selectedId) {
                                                    graph.selectAll('.line_graph_' + id).attr('opacity', 0.1);
                                                }
                                                else {
                                                    graph.selectAll('.line_graph_' + id).attr('opaity', 0.8);
                                                }
                                            });
                                            events.fire(HIGHLIGHT_BY_ID, selectedId);
                                        })
                                            .on('mouseout', function (d) {
                                            graph.selectAll('.line_graph').attr('opacity', 0.8);
                                            events.fire(CLEAR_TABLE_HIGHLIGHT);
                                        });
                                        //Create gradient
                                        graph.append('rect')
                                            .attr('x', 0)
                                            .attr('y', yLineScale.range()[1])
                                            .attr('width', colorRampWidth - 30)
                                            .attr('height', height)
                                            .attr('id', 'color_ramp_' + currentIndex)
                                            .attr('class', 'color_ramp');
                                        colorGradient = graph.append('linearGradient')
                                            .attr('id', 'linear_gradient_' + currentIndex)
                                            .attr('class', 'linear_gradient')
                                            .attr('x1', 0)
                                            .attr('x2', 0)
                                            .attr('y1', 1)
                                            .attr('y2', 0)
                                            .attr('color-interpolation', 'CIE-Lab');
                                        if (self.temporalDataRange[attributeName]) {
                                            dataLevels = self.temporalDataRange[attributeName];
                                            dataLevels.forEach(function (dataLevel, i) {
                                                colorGradient.append('stop')
                                                    .attr('offset', (1 - (yLineScale(dataLevel) - startingHeight) / height) * 100 + '%')
                                                    .attr('stop-color', self.epaColor[i]);
                                            });
                                        }
                                        else if (attributeName === 'AirTempday') {
                                            intervalRange = self.mapManager.tableManager.getAQRange(attributeName);
                                            beginPercent = 100 - (yLineScale(intervalRange[0]) - startingHeight) / height * 100;
                                            midPercent = 100 - (yLineScale(0) - startingHeight) / height * 100;
                                            endPercent = 100 - (yLineScale(intervalRange[1]) - startingHeight) / height * 100;
                                            for (i = 1; i < 5; i++) {
                                                colorGradient.append('stop')
                                                    .attr('offset', (beginPercent + 0.25 * i * (midPercent - beginPercent)) + '%')
                                                    .attr('stop-color', interpolateRdBu(0.5 + 0.125 * (4 - i)));
                                            }
                                            colorGradient.append('stop')
                                                .attr('offset', midPercent + '%')
                                                .attr('stop-color', interpolateRdBu(0.5));
                                            for (i = 1; i < 5; i++) {
                                                colorGradient.append('stop')
                                                    .attr('offset', (midPercent + 0.25 * i * (endPercent - midPercent)) + '%')
                                                    .attr('stop-color', interpolateRdBu(0.5 - 0.125 * i));
                                            }
                                        }
                                        else {
                                            intervalRange = self.mapManager.tableManager.getAQRange(attributeName);
                                            beginPercent = 100 - (yLineScale(intervalRange[0]) - startingHeight) / height * 100;
                                            endPercent = 100 - (yLineScale(intervalRange[1]) - startingHeight) / height * 100;
                                            for (i = 0; i < 6; i++) {
                                                colorGradient.append('stop')
                                                    .attr('offset', (beginPercent + 0.2 * i * (endPercent - beginPercent)) + '%')
                                                    .attr('stop-color', interpolateReds(0.2 * i));
                                            }
                                        }
                                        graph.select('#color_ramp_' + currentIndex).attr('fill', 'url(#linear_gradient_' + currentIndex + ')');
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        currentIndex = 0;
                        _a.label = 1;
                    case 1:
                        if (!(currentIndex < self.detailViewAttribute.length)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(currentIndex)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        currentIndex++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MapView.prototype.drawGeographicalMap = function () {
        var self = this;
        this.projection = geoMercator()
            .translate(this.nodeCenter)
            .scale(5000)
            .center(this.mapCenter);
        var pathFuction = geoPath().projection(self.projection);
        var countyTooltip = select('#countytip');
        var paths = select('#mapLayer').selectAll('path').data(self.mapManager.topojson_features.features);
        paths.exit().remove();
        paths = paths.enter().append('path').merge(paths).classed('map-paths', true);
        // paths.transition()
        //      .duration(700)
        paths.attr('id', function (d) { return d.properties.GEOID; })
            .attr('d', pathFuction);
        //  console.log(self.mapManager.topojson_features.features)
        paths.on('mouseover', function (d) {
            countyTooltip
                // .transition()
                // .duration(200)
                .style('opacity', 0.9);
            countyTooltip.html(d.properties.NAME)
                .style('left', (event.pageX) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
            .on('mouseout', function (d) {
            countyTooltip
                //  .transition()
                // .duration(200)
                .style('opacity', 0);
        });
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
    };
    MapView.prototype.drawLegend = function (dataArray, colorArray) {
        var legendContainer = select('#map-util');
        legendContainer.selectAll('text').remove();
        legendContainer.append('text')
            .text(this.currentSelectedMapAttribute)
            .attr('font-size', '20px')
            .attr('y', 25)
            .attr('x', 0.125 * this.svgWidth)
            .attr('text-anchor', 'end');
        if (colorArray === 'TEXT') {
            legendContainer.selectAll('rect').remove();
            return;
        }
        var legendRects = legendContainer.selectAll('.legend-rect').data(colorArray);
        legendRects.exit().remove();
        legendRects = legendRects.enter().append('rect').merge(legendRects);
        legendRects.attr('x', 0)
            .attr('y', function (d, i) { return i * 25 + 50; })
            .attr('width', 100)
            .attr('height', 20)
            .attr('fill', function (d) { return d; })
            .attr('class', 'legend-rect');
        var legendText = legendContainer.selectAll('.legend-text').data(dataArray);
        legendText.exit().remove();
        legendText = legendText.enter().append('text').merge(legendText);
        legendText.attr('x', 110)
            .attr('y', function (d, i) { return i * 25 + 50; })
            .attr('class', 'legend-text')
            .attr('alignment-baseline', 'hanging')
            // .attr('fill','white')
            .text(function (d) { return d; });
    };
    MapView.prototype.highlightID = function (selectedId) {
        this.dotDataColloection.forEach(function (person) {
            var id = person.ID;
            if (id !== selectedId) {
                select('#graphLayer').selectAll('.line_graph_' + id).attr('opacity', 0.1);
                select('#drawLayer').select('#circle_' + id).attr('opacity', 0.1);
            }
            else {
                select('#graphLayer').selectAll('.line_graph_' + id).attr('opaity', 0.8);
                select('#drawLayer').select('#circle_' + id).attr('opacity', 1);
            }
        });
    };
    MapView.prototype.clearAllHighlight = function () {
        select('#graphLayer').selectAll('.line_graph').attr('opacity', 0.8);
        select('#drawLayer').selectAll('circle').attr('opacity', 1);
    };
    MapView.prototype.attachListener = function () {
        var self = this;
        events.on(TABLE_VIS_ROWS_CHANGED_EVENT, function () {
            self.update();
            //   console.log('fire table row')
        });
        events.on(MAP_ATTRIBUTE_CHANGE_EVENT, function () {
            self.update();
        });
        events.on(SHOW_TOP_100_EVENT, function () {
            self.update();
            //   console.log('fire top 100')
        });
        events.on(SHOW_DETAIL_VIEW, function (evt, vector) {
            if (!self.detailViewAttribute.includes(vector.name)) {
                self.detailViewAttribute.unshift(vector.name);
            }
            if (self.detailViewAttribute.length > 3) {
                self.detailViewAttribute = self.detailViewAttribute.slice(0, 3);
            }
            self.currentViewType = 'Detail';
            self.update();
        });
        events.on(HIGHLIGHT_MAP_BY_ID, function (evt, id) {
            self.highlightID(id);
        });
        events.on(CLEAR_MAP_HIGHLIGHT, function () {
            self.clearAllHighlight();
        });
        events.on(COL_ORDER_CHANGED_EVENT, function () {
            self.update();
        });
    };
    return MapView;
}());
export function create() {
    return new MapView();
}
//# sourceMappingURL=mapView.js.map