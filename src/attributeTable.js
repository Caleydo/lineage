import * as tslib_1 from "tslib";
import * as events from 'phovea_core/src/event';
// import * as d3 from 'd3';
import { Config } from './config';
import { select, selectAll, mouse, event } from 'd3-selection';
import { drag } from 'd3-drag';
import { scaleLinear } from 'd3-scale';
import { max, mean } from 'd3-array';
import { axisLeft } from 'd3-axis';
import { isNullOrUndefined } from 'util';
import { transition } from 'd3-transition';
import { easeLinear } from 'd3-ease';
import { curveBasis } from 'd3-shape';
import { interpolateLab } from 'd3-interpolate';
import { interpolateReds, schemeCategory10, interpolateRdBu } from 'd3-scale-chromatic';
import Histogram from './Histogram';
import { VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT, VALUE_TYPE_REAL, VALUE_TYPE_STRING } from 'phovea_core/src/datatype';
import { line } from 'd3-shape';
import * as _ from 'underscore';
import { PRIMARY_SELECTED, COL_ORDER_CHANGED_EVENT, POI_SELECTED, TABLE_VIS_ROWS_CHANGED_EVENT, HIDE_FAMILY_TREE, SHOW_TOP_100_EVENT, FAMILY_SELECTED_EVENT, SHOW_DETAIL_VIEW, HIGHLIGHT_BY_ID, CLEAR_TABLE_HIGHLIGHT, HIGHLIGHT_MAP_BY_ID, CLEAR_MAP_HIGHLIGHT } from './tableManager';
import { isUndefined } from 'util';
var sortedState;
(function (sortedState) {
    sortedState[sortedState["Ascending"] = 0] = "Ascending";
    sortedState[sortedState["Descending"] = 1] = "Descending";
    sortedState[sortedState["Unsorted"] = 2] = "Unsorted";
})(sortedState || (sortedState = {}));
/**
 * Creates the attribute table view
 */
var AttributeTable = /** @class */ (function () {
    function AttributeTable(parent) {
        this.SHOWING_RANKED = false;
        this.buffer = 20; //pixel dist between columns
        //for entire Table
        this.y = scaleLinear();
        //for Cell Renderers
        this.yScale = scaleLinear();
        this.xScale = scaleLinear();
        this.averageLimit = 14;
        this.rowHeight = Config.glyphSize * 2.5 - 4;
        this.headerHeight = this.rowHeight * 2;
        this.colWidths = {
            idtype: this.rowHeight * 4,
            categorical: this.rowHeight,
            int: this.rowHeight * 4,
            real: this.rowHeight * 4,
            string: this.rowHeight * 5,
            id: this.rowHeight * 4.5,
            dataDensity: this.rowHeight,
            temporal: this.rowHeight * 7
        };
        this.epaColor = [
            '#00e400',
            '#ffff00',
            '#ff7e00',
            '#ff0000',
            '#99004c',
            '#7e0023'
        ];
        this.temporalDataRange = {
            pm25day: [0, 12, 35.4, 55.4, 150.4, 250.4],
            meanO3day: [0, 54, 70, 85, 105, 200],
            meanNO2day: [0, 53, 100, 360, 649, 1249]
        };
        //Used to store col widths if user resizes a col;
        this.customColWidths = {};
        //store histogram objects for tableHeaders
        this.histograms = [];
        this.lineFunction = line()
            .x(function (d) {
            return d.x;
        })
            .y(function (d) {
            return d.y;
        })
            .curve(curveBasis);
        this.catOffset = 30;
        //Keeps track of whether the table is sorted by a certain attribute;
        this.sortAttribute = {
            state: sortedState.Unsorted,
            data: undefined,
            name: undefined
        };
        this.idScale = scaleLinear(); //used to size the bars in the first col of the table;
        this.linelineFunction = line();
        this.colorScale = ['#969696', '#9e9ac8', '#74c476', '#fd8d3c', '#9ecae1'];
        this.margin = Config.margin;
        this.t2 = transition('t2')
            .duration(600)
            .ease(easeLinear);
        this.highlightedID = 'none';
        //To be used on drag interactions so that render is not called too many times
        this.lazyRender = _.throttle(this.render, 10);
        this.lazyScroll = _.throttle(this.updateSlopeLines, 300);
        this.$node = select(parent);
    }
    /**
     * Initialize the view and return a promise
     * that is resolved as soon the view is completely initialized.
     * @returns {Promise<FilterBar>}
     */
    AttributeTable.prototype.init = function (data) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.tableManager = data;
                        // private colorScale = scaleOrdinal(schemeCategory20c);
                        this.build(); //builds the DOM
                        return [4 /*yield*/, this.update()];
                    case 1:
                        _a.sent();
                        this.attachListener();
                        // return the promise directly as long there is no dynamical data to update
                        return [2 /*return*/, Promise.resolve(this)];
                }
            });
        });
    };
    AttributeTable.prototype.update = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initData()];
                    case 1:
                        _a.sent();
                        this.render();
                        return [2 /*return*/];
                }
            });
        });
    };
    AttributeTable.prototype.getColData = function () {
        return this.colData;
    };
    AttributeTable.prototype.getTableManager = function () {
        return this.tableManager;
    };
    /**
     * Build the basic DOM elements and binds the change function
     */
    AttributeTable.prototype.build = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var dropdownMenu, list, menu, colNames, menuItems, self, listTop, menuTop, tableDiv, headerSVG, svg, button;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                //Height is a function of the current view and so is set in initData();
                this.width = 1200 - this.margin.left - this.margin.right;
                this.height = Config.glyphSize * 3 * this.tableManager.graphTable.nrow; //- this.margin.top - this.margin.bottom;
                dropdownMenu = select('.navbar-collapse')
                    .append('ul')
                    .attr('class', 'nav navbar-nav navbar-left')
                    .attr('id', 'attributeMenu');
                select('.navbar-collapse')
                    .append('ul')
                    .attr('class', 'nav navbar-nav')
                    .attr('id', 'Export')
                    .append('li')
                    .append('a')
                    .attr('class', 'btn-link')
                    .attr('id', 'exportIDs')
                    .attr('role', 'button')
                    .html('Export')
                    .on('click', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var csvContent, labIDVector, labIDData, personIDs, encodedUri, link;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                csvContent = 'data:text/csv;charset=utf-8,';
                                csvContent += 'RelativeID,LabID\r\n'; // add carriage return
                                return [4 /*yield*/, this.tableManager.getAttributeVector('LabID', false)];
                            case 1:
                                labIDVector = _a.sent();
                                if (!!labIDVector) return [3 /*break*/, 3];
                                return [4 /*yield*/, this.tableManager.getAttributeVector('labid', false)];
                            case 2:
                                labIDVector = _a.sent();
                                _a.label = 3;
                            case 3: return [4 /*yield*/, labIDVector.data()];
                            case 4:
                                labIDData = _a.sent();
                                return [4 /*yield*/, labIDVector.names()];
                            case 5:
                                personIDs = _a.sent();
                                //Export csv file with selected ids.
                                selectAll('.checkbox')
                                    .filter('.checked')
                                    .each(function (element, ind) {
                                    element.id.map(function (personID) {
                                        var personInd = personIDs.indexOf(personID);
                                        csvContent += personID + ',' + labIDData[personInd] + '\r\n'; // add carriage return
                                    });
                                });
                                encodedUri = encodeURI(csvContent);
                                link = document.createElement('a');
                                link.setAttribute('href', encodedUri);
                                link.setAttribute('download', 'lineage_export.csv');
                                document.body.appendChild(link); // Required for FF
                                link.click();
                                return [2 /*return*/];
                        }
                    });
                }); });
                select('.navbar-collapse')
                    .append('ul')
                    .attr('class', 'nav navbar-nav navbar-left')
                    .attr('id', 'Sort by Tree')
                    .append('li')
                    .append('a')
                    .attr('class', 'btn-link')
                    .attr('role', 'button')
                    .html('Sort by Tree')
                    .on('click', function (d) {
                    var maxWidth = max(_this.colOffsets) + 50;
                    _this.$node.select('#headers').attr('width', maxWidth);
                    _this.$node.select('.tableSVG').attr('width', maxWidth);
                    var animated = _this.sortAttribute.state !== sortedState.Unsorted
                        ? function (d) { return d.transition(_this.t2); }
                        : function (d) { return d; };
                    _this.sortAttribute.state = sortedState.Unsorted;
                    selectAll('.sortIcon').classed('sortSelected', false);
                    animated(select('#col2')).style('width', 550 + Config.collapseSlopeChartWidth + 'px');
                    animated(select('#columns').selectAll('.cell')).attr('transform', function (cell) {
                        return 'translate(0, ' + _this.y(_this.rowOrder[cell.ind]) + ' )';
                    });
                    //translate tableGroup to make room for the slope lines.
                    animated(select('#tableGroup'))
                        // .transition(t2)
                        .attr('transform', function () {
                        return 'translate(0,0)';
                    });
                    animated(select('#headerGroup'))
                        // .transition(t2)
                        .attr('transform', function () {
                        return 'translate(0,80)';
                    });
                    animated(select('#colSummaries'))
                        // .transition(t2)
                        .attr('transform', function () {
                        return 'translate(0 ,15)';
                    });
                    animated(select('#tableGroup').selectAll('.highlightBar'))
                        // .transition(t2)
                        .attr('y', function (d) {
                        return _this.y(_this.rowOrder[d.i]);
                    });
                    _this.updateSlopeLines(true, false); //animate = true, expanded = false;
                });
                select('.navbar-collapse')
                    .append('ul')
                    .attr('class', 'nav navbar-nav navbar-left')
                    .attr('id', 'Toggle Tree')
                    .append('li')
                    .append('a')
                    .attr('class', 'btn-link')
                    .attr('role', 'button')
                    .html('Show/Hide tree')
                    .on('click', function (d) {
                    events.fire(HIDE_FAMILY_TREE);
                });
                list = dropdownMenu.append('li').attr('class', 'dropdown');
                list
                    .append('a')
                    .attr('class', 'dropdown-toggle')
                    .attr('data-toggle', 'dropdown')
                    .attr('role', 'button')
                    .html('Table Attributes')
                    .append('span')
                    .attr('class', 'caret');
                menu = list.append('ul').attr('class', 'dropdown-menu');
                menu
                    .append('h4')
                    .attr('class', 'dropdown-header')
                    .style('font-size', '16px')
                    .html('Demographic Attributes');
                colNames = this.tableManager.getDemographicColumns().map(function (col) {
                    return col.desc.name;
                });
                menuItems = menu.selectAll('.demoAttr').data(colNames);
                menuItems = menuItems
                    .enter()
                    .append('li')
                    .append('a')
                    .attr('class', 'dropdown-item demoAttr')
                    .classed('active', function (d) {
                    return _this.tableManager.colOrder.includes(d);
                })
                    .html(function (d) {
                    return d;
                })
                    .merge(menuItems);
                menu
                    .append('li')
                    .attr('class', 'divider')
                    .attr('role', 'separator');
                menu
                    .append('h4')
                    .attr('class', 'dropdown-header')
                    .style('font-size', '16px')
                    .html('Clinical Attributes');
                colNames = this.tableManager.getAttrColumns().map(function (col) {
                    return col.desc.name;
                });
                menuItems = menu.selectAll('.clinicalAttr').data(colNames);
                menuItems = menuItems
                    .enter()
                    .append('li')
                    .append('a')
                    .attr('class', 'dropdown-item clinicalAttr')
                    .classed('active', function (d) {
                    return _this.tableManager.colOrder.includes(d);
                })
                    .html(function (d) {
                    return d;
                })
                    .merge(menuItems);
                menu
                    .append('li')
                    .attr('class', 'divider')
                    .attr('role', 'separator');
                menu
                    .append('h4')
                    .attr('class', 'dropdown-header')
                    .style('font-size', '16px')
                    .html('Air Quality Attributes');
                colNames = this.tableManager.getAirQualityColumnsNames(this.tableManager.airqualityTable);
                menuItems = menu.selectAll('.airqualityAttr').data(colNames);
                menuItems = menuItems
                    .enter()
                    .append('li')
                    .append('a')
                    .attr('class', 'dropdown-item airqualityAttr')
                    //.classed('active', (d) => { return this.tableManager.colOrder.includes(d); })
                    .html(function (d) {
                    return d;
                })
                    .merge(menuItems);
                self = this;
                //TODO the mousedown to add/remove an item
                selectAll('.dropdown-item').on('mousedown', function (d) {
                    event.preventDefault();
                    //Check if is selected, if so remove from table.
                    if (self.tableManager.colOrder.includes(d)) {
                        self.tableManager.colOrder.splice(self.tableManager.colOrder.indexOf(d), 1);
                        select(this).classed('active', false);
                    }
                    else {
                        var lastIndex = self.tableManager.colOrder.length;
                        self.tableManager.colOrder.splice(lastIndex, 0, d);
                        select(this).classed('active', true);
                    }
                    events.fire(COL_ORDER_CHANGED_EVENT);
                });
                listTop = dropdownMenu.append('li').attr('class', 'dropdown');
                listTop
                    .append('a')
                    .attr('class', 'dropdown-toggle')
                    .attr('data-toggle', 'dropdown')
                    .attr('role', 'button')
                    .html('Rank By')
                    .append('span')
                    .attr('class', 'caret');
                menuTop = listTop.append('ul').attr('class', 'dropdown-menu');
                menuItems = menuTop
                    .selectAll('.airqualityAttr')
                    .data(self.tableManager.temporal_data);
                menuItems = menuItems
                    .enter()
                    .append('li')
                    .append('a')
                    .attr('class', 'dropdown-item-top')
                    .html(function (d) {
                    return d;
                })
                    .merge(menuItems)
                    .on('click', function (d) {
                    document.getElementById('col2').style.display = 'none';
                    self.SHOWING_RANKED = true;
                    self.findTop100(d);
                });
                tableDiv = this.$node.append('div').attr('id', 'tableDiv');
                headerSVG = tableDiv
                    .append('div')
                    .attr('id', 'tableDiv1')
                    .append('svg')
                    .attr('width', 1500)
                    .attr('height', 195)
                    // .attr('viewBox','0 0 1200 195')
                    .attr('id', 'headers');
                headerSVG
                    .append('g')
                    .attr('transform', 'translate(0,80)')
                    .attr('id', 'headerGroup');
                svg = tableDiv
                    .append('div')
                    .attr('id', 'tableDiv2')
                    .append('svg')
                    .classed('tableSVG', true)
                    // .viewBox('0 0 ' + this.width + ' ' + (this.height + this.margin.top + this.margin.bottom))
                    .attr('width', this.width + this.margin.left + this.margin.right);
                // .attr('height', this.height + this.margin.top + this.margin.bottom);
                //Link scrolling of the table and graph divs as well as the table and it's header
                select('#tableDiv2').on('scroll', function () {
                    select('#treeMenu')
                        .select('.menu')
                        .remove(); //remove any open menus
                    document.getElementById('graphDiv').scrollTop = document.getElementById('tableDiv2').scrollTop;
                    document.getElementById('tableDiv1').scrollLeft = document.getElementById('tableDiv2').scrollLeft;
                });
                select('#tableDiv1').on('scroll', function () {
                    select('#treeMenu')
                        .select('.menu')
                        .remove(); //remove any open menus
                    document.getElementById('tableDiv2').scrollLeft = document.getElementById('tableDiv1').scrollLeft;
                });
                //Link scrolling of the table and graph divs
                select('#graphDiv').on('scroll', function () {
                    if (_this.sortAttribute.state !== sortedState.Unsorted) {
                        _this.lazyScroll(false, true); //only call this if there is sorting going on;
                    }
                    document.getElementById('tableDiv2').scrollTop = document.getElementById('graphDiv').scrollTop;
                    // this.updateSlopeLines();
                });
                // TABLE (except for slope Chart and first col on the left of the slope chart)
                svg
                    .append('g')
                    .attr('id', 'marginGroup')
                    .attr('transform', 'translate(0 ,' + this.margin.top + ')');
                select('#marginGroup')
                    .append('g')
                    .attr('id', 'tableGroup');
                //HEADERS
                this.$node
                    .select('#headerGroup')
                    .append('g')
                    .attr('transform', 'translate(0, 0)')
                    .attr('id', 'tableHeaders');
                //Column Summaries
                this.$node
                    .select('#headerGroup')
                    .append('g')
                    .attr('transform', 'translate(0, 15)')
                    .attr('id', 'colSummaries');
                //Columns (except for the first)
                select('#tableGroup')
                    .append('g')
                    // .attr('transform', 'translate(0, ' + this.margin.top + ')')
                    .attr('id', 'columns');
                //Highlight Bars
                select('#columns')
                    .append('g')
                    // .attr('transform', 'translate(0, ' + this.margin.top + ')')
                    .attr('id', 'highlightBars');
                button = select('#headers')
                    .append('g')
                    .attr('transform', 'translate(635,70)')
                    .attr('id', 'revertTreeOrder')
                    .attr('visibility', 'hidden')
                    .append('svg');
                button
                    .append('rect')
                    .attr('width', 120)
                    .attr('height', 25)
                    .attr('rx', 10)
                    .attr('ry', 20)
                    .attr('fill', '#b4b3b1')
                    .attr('y', 0)
                    .attr('opacity', 0.1)
                    .on('click', function (d) {
                    _this.sortAttribute.state = sortedState.Unsorted;
                    selectAll('.sortIcon').classed('sortSelected', false);
                    select('#revertTreeOrder').attr('visibility', 'hidden');
                    // const t2 = transition('test').duration(600).ease(easeLinear);
                    select('#columns')
                        .selectAll('.cell')
                        // .transition(t2)
                        .attr('transform', function (cell) {
                        return 'translate(0, ' + _this.y(_this.rowOrder[cell.ind]) + ' )';
                    });
                    //translate tableGroup to make room for the slope lines.
                    select('#tableGroup')
                        // .transition(t2)
                        .attr('transform', function () {
                        return 'translate(' + Config.collapseSlopeChartWidth + ' ,0)';
                    });
                    select('#headerGroup')
                        // .transition(t2)
                        .attr('transform', function () {
                        return 'translate(' + Config.collapseSlopeChartWidth + ' ,95)';
                    });
                    select('#colSummaries')
                        // .transition(t2)
                        .attr('transform', function () {
                        return 'translate(0 ,15)';
                    });
                    selectAll('.slopeLine')
                        // .transition(t2)
                        .attr('d', function (d) {
                        return _this.slopeChart({
                            y: d.y,
                            ind: d.ind,
                            width: Config.collapseSlopeChartWidth
                        });
                    });
                    select('#tableGroup')
                        .selectAll('.highlightBar')
                        // .transition(t2)
                        .attr('y', function (d) {
                        return _this.y(_this.rowOrder[d.i]);
                    });
                });
                button
                    .append('text')
                    .classed('histogramLabel', true)
                    .attr('x', 60)
                    .attr('y', 15)
                    .attr('fill', '#757472')
                    .text('Sort by Tree')
                    .attr('text-anchor', 'middle');
                return [2 /*return*/];
            });
        });
    };
    AttributeTable.prototype.updateSlopeLines = function (animate, expanded) {
        var _this = this;
        if (animate === void 0) { animate = false; }
        if (expanded === void 0) { expanded = false; }
        var animated = animate ? function (d) { return d.transition(_this.t2); } : function (d) { return d; };
        var divHeight = document.getElementById('graphDiv').clientHeight;
        var scrollOffset = document.getElementById('graphDiv').scrollTop;
        selectAll('.slopeIcon')
            .text(function (d, i) {
            var start = _this.y(d.y);
            var end = _this.sortedRowOrder
                ? _this.y(_this.rowOrder[_this.sortedRowOrder.indexOf(d.ind)])
                : _this.y(_this.rowOrder[d.ind]);
            if (_this.sortAttribute.state === sortedState.Unsorted) {
                return '';
            }
            if (start >= scrollOffset && start <= divHeight + scrollOffset) {
                if (end >= divHeight + scrollOffset) {
                    return '\uf149';
                }
                else if (end < scrollOffset) {
                    return '\uf148';
                }
            }
            return ''; //for all other cases, return 0;
        })
            // .attr('x', 15)
            .attr('x', this.colWidths.dataDensity + this.buffer + this.colWidths.dataDensity) //to make room for checkboxes;
            .attr('y', function (d) {
            var start = _this.y(d.y);
            var end = _this.sortedRowOrder
                ? _this.y(_this.rowOrder[_this.sortedRowOrder.indexOf(d.ind)])
                : _this.y(_this.rowOrder[d.ind]);
            if (start >= scrollOffset && start <= divHeight + scrollOffset) {
                if (end >= divHeight + scrollOffset) {
                    return _this.y(d.y) + _this.rowHeight;
                }
                else if (end < scrollOffset) {
                    return _this.y(d.y) + _this.rowHeight / 2;
                }
            }
        })
            .on('click', function (d) {
            var end = _this.y(_this.rowOrder[_this.sortedRowOrder.indexOf(d.ind)]);
            document.getElementById('graphDiv').scrollTop = end;
        });
        animated(selectAll('.slopeLine')).attr('d', function (d) {
            //don't bother drawing slope lines if the graph is unsorted.
            if (_this.sortAttribute.state === sortedState.Unsorted) {
                return '';
            }
            else {
                var ind = d.ind;
                var width = Config.collapseSlopeChartWidth;
                if (expanded) {
                    ind = _this.sortedRowOrder.indexOf(d.ind);
                    width = Config.slopeChartWidth;
                }
                return _this.slopeChart({ y: d.y, ind: ind, width: width });
            }
        });
    };
    AttributeTable.prototype.findTop100 = function (attributeName) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var self, allAQCols, allFamilyIDCol, familyIDPromises, allaqPromises, finishedAQPromises, finishedFamilyIDPromises, kindredIDDict, aqDataDict, personChangeAbsDict, yDict, rank, idRange;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        return [4 /*yield*/, self.tableManager.getEntireAirQualityColumns(attributeName)];
                    case 1:
                        allAQCols = _a.sent();
                        return [4 /*yield*/, self.tableManager.getAttributeVector('KindredID', true)];
                    case 2:
                        allFamilyIDCol = _a.sent();
                        familyIDPromises = [allFamilyIDCol.data(), allFamilyIDCol.names()];
                        allaqPromises = [];
                        allAQCols.forEach(function (vector) {
                            allaqPromises = allaqPromises.concat([
                                vector.data(),
                                vector.names(),
                                vector.desc.name
                            ]);
                        });
                        return [4 /*yield*/, Promise.all(allaqPromises)];
                    case 3:
                        finishedAQPromises = _a.sent();
                        return [4 /*yield*/, Promise.all(familyIDPromises)];
                    case 4:
                        finishedFamilyIDPromises = _a.sent();
                        kindredIDDict = {};
                        finishedFamilyIDPromises[1].forEach(function (personID, index) {
                            kindredIDDict[personID] = finishedFamilyIDPromises[0][index];
                        });
                        aqDataDict = {};
                        finishedAQPromises[1].forEach(function (personID, index) {
                            aqDataDict[personID] = {};
                            for (var i = 0; i < 29; i++) {
                                aqDataDict[personID][finishedAQPromises[i * 3 + 2]] =
                                    finishedAQPromises[i * 3][index];
                            }
                        });
                        personChangeAbsDict = [];
                        finishedAQPromises[1].forEach(function (personID) {
                            var dataArray = [];
                            for (var i = -14; i < 15; i++) {
                                dataArray.push(aqDataDict[personID][attributeName + i]);
                            }
                            var beforeAverage = undefined;
                            var afterAverage = undefined;
                            if (dataArray.length > 0) {
                                beforeAverage = mean(dataArray.slice(14 - self.averageLimit, 14));
                                afterAverage = mean(dataArray.slice(15, 15 + self.averageLimit));
                            }
                            //let valueToReturn = Math.abs(beforeAverage - afterAverage);
                            var valueToReturn = beforeAverage;
                            if (valueToReturn) {
                                personChangeAbsDict.push({ ID: personID, data: valueToReturn });
                                //   personChangeAbsDict[personID] = valueToReturn
                            }
                        });
                        yDict = {};
                        rank = 0;
                        idRange = [];
                        personChangeAbsDict.sort(function (a, b) {
                            return b.data - a.data;
                        });
                        personChangeAbsDict.forEach(function (person) {
                            var id = person.ID;
                            if (kindredIDDict[id]) {
                                rank += 1;
                                yDict[id + '_' + kindredIDDict[id]] = [rank];
                                idRange.push(id);
                            }
                        });
                        // while(&&idRange.length<101){
                        //
                        // }
                        // while(idRange.length<101 && Object.keys(personChangeAbsDict).length > 0){
                        // // for (let rank = 1; rank < 101; rank ++){
                        //   let id=Object.keys(personChangeAbsDict).reduce(function(a, b){ return personChangeAbsDict[a] > personChangeAbsDict[b] ? a : b })
                        //   if(kindredIDDict[id]){
                        //     rank+=1
                        //     yDict[id+'_' + kindredIDDict[id]] = [rank]
                        //     idRange.push(id)
                        //   }
                        //   // else{
                        //   //   console.log(id)
                        //   // }
                        //   delete personChangeAbsDict[id]
                        // }
                        this.tableManager.yValues = yDict;
                        // console.log(yDict,idRange)
                        return [4 /*yield*/, this.tableManager.setActiveRowsWithoutEvent(idRange)];
                    case 5:
                        // console.log(yDict,idRange)
                        _a.sent();
                        this.tableManager.tableHeight = Config.glyphSize * 4 * 100;
                        selectAll('.slopeLine').classed('clickedSlope', false);
                        selectAll('.highlightBar').classed('selected', false);
                        this.update();
                        events.fire(SHOW_TOP_100_EVENT);
                        return [2 /*return*/];
                }
            });
        });
    };
    AttributeTable.prototype.initData = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var graphView, attributeView, aqView, self, allCols, colOrder, orderedCols, aqCols, aqColNames, _i, colOrder_1, colName, _a, allCols_1, vector, graphIDs, kindredIDs, idVector, uniqueIDs, ids, y2personDict, yDict, maxRow, allRows, col, maxAggregates, _b, allRows_1, key, value, colDataAccum, allPromises, finishedPromises, aqDataAccum, allaqPromises, finishedAQPromises, aqDataDict;
            var _this = this;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.colOffsets = [0];
                        return [4 /*yield*/, this.tableManager.graphTable];
                    case 1:
                        graphView = _c.sent();
                        return [4 /*yield*/, this.tableManager.tableTable];
                    case 2:
                        attributeView = _c.sent();
                        return [4 /*yield*/, this.tableManager.AQTable];
                    case 3:
                        aqView = _c.sent();
                        self = this;
                        allCols = graphView
                            .cols()
                            .concat(attributeView.cols())
                            .concat(aqView.cols());
                        colOrder = this.tableManager.colOrder;
                        orderedCols = [];
                        aqCols = [];
                        aqColNames = new Set();
                        this.allCols = allCols;
                        for (_i = 0, colOrder_1 = colOrder; _i < colOrder_1.length; _i++) {
                            colName = colOrder_1[_i];
                            for (_a = 0, allCols_1 = allCols; _a < allCols_1.length; _a++) {
                                vector = allCols_1[_a];
                                if (vector.desc.name === colName) {
                                    orderedCols.push(vector);
                                }
                                else if (this.tableManager.temporal_data.includes(colName) &&
                                    vector.desc.name.includes(colName)) {
                                    aqCols.push(vector);
                                    aqColNames.add(colName);
                                }
                            }
                        }
                        return [4 /*yield*/, graphView.col(0).names()];
                    case 4:
                        graphIDs = _c.sent();
                        return [4 /*yield*/, graphView.col(1).data()];
                    case 5:
                        kindredIDs = _c.sent();
                        return [4 /*yield*/, graphView.col(0).ids()];
                    case 6:
                        idVector = _c.sent();
                        uniqueIDs = idVector
                            .dim(0)
                            .asList()
                            .map(function (i) {
                            return i.toString();
                        });
                        ids = graphIDs.map(function (id, i) {
                            return id + '_' + kindredIDs[i];
                        });
                        y2personDict = {};
                        yDict = this.tableManager.yValues;
                        maxRow = 0;
                        //Find max value in yDict
                        Object.keys(yDict).forEach(function (person) {
                            maxRow = yDict[person][0] > maxRow ? yDict[person][0] : maxRow;
                        });
                        ids.forEach(function (person, ind) {
                            if (person in yDict) {
                                //Handle Duplicate Nodes
                                yDict[person].forEach(function (y) {
                                    if (y in y2personDict) {
                                        y2personDict[y].push(person);
                                    }
                                    else {
                                        y2personDict[y] = [person];
                                    }
                                });
                            }
                        });
                        allRows = Object.keys(y2personDict).map(Number);
                        //Set height and width of svg
                        this.height = Config.glyphSize * 4 * maxRow;
                        // select('.tableSVG').attr('viewBox','0 0 ' + this.width + ' ' + (this.height + this.margin.top + this.margin.bottom))
                        select('.tableSVG').attr('height', this.height);
                        //  select('.tableSVG').attr('height',document.getElementById('genealogyTree').getBoundingClientRect().height);
                        select('.tableSVG').attr('width', this.tableManager.colOrder.length * 100);
                        this.y.range([0, this.height * 0.7]).domain([1, maxRow]);
                        this.rowOrder = allRows; //will be used to set the y position of each cell/row;
                        col = {};
                        col.data = [];
                        col.name = ['# People'];
                        col.type = 'dataDensity';
                        col.stats = [];
                        col.isSorted = false;
                        maxAggregates = 1;
                        for (_b = 0, allRows_1 = allRows; _b < allRows_1.length; _b++) {
                            key = allRows_1[_b];
                            value = Array.from(new Set(y2personDict[key])).length;
                            col.data.push(value);
                            maxAggregates = max([maxAggregates, y2personDict[key].length]);
                        }
                        this.idScale.domain([1, maxAggregates]);
                        col.ids = allRows.map(function (row) {
                            return y2personDict[row].map(function (d) {
                                return d.split('_')[0];
                            }); //only first part is the id
                        });
                        this.firstCol = [col];
                        colDataAccum = [];
                        allPromises = [];
                        orderedCols.forEach(function (vector, index) {
                            allPromises = allPromises.concat([
                                vector.data(),
                                vector.names(),
                                vector.ids(),
                                vector.stats().catch(function () {
                                    return null;
                                }),
                                vector.hist(10).catch(function () {
                                    return null;
                                })
                            ]);
                        });
                        return [4 /*yield*/, Promise.all(allPromises)];
                    case 7:
                        finishedPromises = _c.sent();
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
                    case 8:
                        finishedAQPromises = _c.sent();
                        aqDataDict = {};
                        aqCols.forEach(function (vector, index) {
                            aqDataDict[finishedAQPromises[index * 5 + 2]] = {
                                data: finishedAQPromises[index * 5],
                                ids: finishedAQPromises[index * 5 + 1],
                                range: finishedAQPromises[index * 5 + 4]
                            };
                        });
                        //TODO Make a scale for the each type
                        aqColNames.forEach(function (aqName, index) {
                            var personArrayDict = {};
                            finishedAQPromises[1].forEach(function (personID) {
                                personArrayDict[personID] = new Array(29);
                            });
                            var rangeCounter = [];
                            var _loop_1 = function (i) {
                                var dayentry = aqDataDict[aqName + i.toString()];
                                var data = dayentry.data;
                                dayentry.ids.forEach(function (personID, numberIndex) {
                                    personArrayDict[personID][i + 14] = data[numberIndex];
                                });
                                rangeCounter = rangeCounter.concat(dayentry.range);
                            };
                            for (var i = -14; i < 15; i++) {
                                _loop_1(i);
                            }
                            var col = {};
                            col.isSorted = false;
                            //col.averageLimit = 14
                            //if (self.colData != undefined){
                            //if (self.colData.filter(d=>d.name==aqName).length >0){
                            //col.averageLimit = self.colData.filter(d=>d.name==aqName)[0].averageLimit;
                            //}
                            //}
                            col.level_set = self.tableManager.getAQRange(aqName)[1];
                            if (self.colData !== undefined) {
                                if (self.colData.filter(function (d) { return d.name === aqName; }).length > 0) {
                                    col.level_set = self.colData.filter(function (d) { return d.name === aqName; })[0].level_set;
                                }
                            }
                            col.ids = allRows.map(function (row) {
                                return y2personDict[row].map(function (d) {
                                    return d.split('_')[0];
                                });
                            });
                            col.type = 'temporal';
                            col.name = aqName;
                            col.range = self.tableManager.getAQExtreme(aqName);
                            col.data = allRows.map(function (row) {
                                var colData = [];
                                var people = y2personDict[row];
                                people.map(function (person) {
                                    person = person.split('_')[0];
                                    if (person in personArrayDict) {
                                        colData.push(personArrayDict[person]);
                                    }
                                    else {
                                        colData.push(undefined);
                                    }
                                });
                                return colData;
                            });
                            aqDataAccum.push(col);
                        });
                        // for (const vector of orderedCols) {
                        orderedCols.forEach(function (vector, index) {
                            var data = finishedPromises[index * 5];
                            var peopleIDs = finishedPromises[index * 5 + 1];
                            var phoveaIDs = finishedPromises[index * 5 + 2]
                                .dim(0)
                                .asList()
                                .map(function (i) {
                                return i.toString();
                            });
                            var type = vector.valuetype.type;
                            var name = vector.desc.name;
                            // if(self.SHOWING_RANKED && index === 0){
                            //   const row_num = max(Object.keys(this.tableManager.yValues).map(d=>this.tableManager.yValues[d][0]))
                            // }
                            if (type === VALUE_TYPE_CATEGORICAL) {
                                //Build col offsets array ;
                                var allCategories_1 = vector.desc.value.categories.map(function (c) {
                                    return c.name;
                                }); //get categories from index.json def
                                var categories = void 0;
                                //Only need one col for binary categories
                                if (allCategories_1.length < 3) {
                                    if (allCategories_1.find(function (d) {
                                        return d === 'Y';
                                    })) {
                                        categories = ['Y'];
                                    }
                                    else if (allCategories_1.find(function (d) {
                                        return d === 'True';
                                    })) {
                                        categories = ['True'];
                                    }
                                    else if (allCategories_1.find(function (d) {
                                        return d === 'F';
                                    })) {
                                        categories = ['F'];
                                    }
                                    else {
                                        categories = [allCategories_1[0]];
                                    }
                                }
                                else {
                                    categories = allCategories_1;
                                }
                                var _loop_2 = function (cat) {
                                    var col_1 = {};
                                    col_1.isSorted = false;
                                    col_1.ids = allRows.map(function (row) {
                                        return y2personDict[row].map(function (d) {
                                            return d.split('_')[0];
                                        }); //only first part is the id
                                    });
                                    col_1.name = name;
                                    col_1.category = cat;
                                    col_1.allCategories = allCategories_1;
                                    //Ensure there is an element for every person in the graph, even if empty
                                    col_1.data = allRows.map(function (row) {
                                        var colData = [];
                                        //Only return unique personIDs.
                                        //TODO find out why there are multiple instances of a person id.
                                        var people = y2personDict[row];
                                        people.map(function (person) {
                                            var ind = col_1.name === 'KindredID'
                                                ? ids.indexOf(person)
                                                : peopleIDs.indexOf(person.split('_')[0]); //find this person in the attribute data
                                            //If there are only two categories, save both category values in this column. Else, only save the ones that match the category at hand.
                                            if (ind > -1 &&
                                                (allCategories_1.length < 3 ||
                                                    (ind > -1 && (allCategories_1.length > 2 && data[ind] === cat)))) {
                                                colData.push(data[ind]);
                                            }
                                            else {
                                                colData.push(undefined);
                                            }
                                        });
                                        return colData;
                                    });
                                    col_1.type = type;
                                    var maxOffset = max(_this.colOffsets);
                                    _this.colOffsets.push(maxOffset + _this.buffer * 2 + _this.colWidths[type]);
                                    colDataAccum.push(col_1);
                                };
                                for (var _i = 0, categories_1 = categories; _i < categories_1.length; _i++) {
                                    var cat = categories_1[_i];
                                    _loop_2(cat);
                                }
                            }
                            else if (type === VALUE_TYPE_INT || type === VALUE_TYPE_REAL) {
                                //quant
                                var col_2 = {};
                                col_2.isSorted = false;
                                col_2.ids = allRows.map(function (row) {
                                    return y2personDict[row].map(function (d) {
                                        return d.split('_')[0];
                                    }); //only first part is the id
                                });
                                var stats = finishedPromises[5 * index + 3];
                                col_2.name = name;
                                col_2.data = allRows.map(function (row) {
                                    var colData = [];
                                    var people = y2personDict[row];
                                    // .filter(function (value, index, self) {
                                    //   return self.indexOf(value) === index;
                                    // });
                                    people.map(function (person) {
                                        var ind = col_2.name === 'KindredID'
                                            ? ids.lastIndexOf(person)
                                            : peopleIDs.lastIndexOf(person.split('_')[0]); //find this person in the attribute data
                                        // const ind = ids.lastIndexOf(person); //find this person in the attribute data
                                        if (ind > -1) {
                                            colData.push(data[ind]);
                                        }
                                        else {
                                            colData.push(undefined);
                                        }
                                    });
                                    return colData;
                                });
                                col_2.vector = vector;
                                col_2.type = type;
                                col_2.stats = stats;
                                col_2.hist = finishedPromises[5 * index + 4];
                                // col.hist = await vector.hist(10);
                                colDataAccum.push(col_2);
                            }
                            else if (type === VALUE_TYPE_STRING) {
                                // const maxOffset = max(this.colOffsets);
                                // this.colOffsets.push(maxOffset + this.buffer + this.colWidths[type]);
                                var col_3 = {};
                                col_3.isSorted = false;
                                col_3.ids = allRows.map(function (row) {
                                    return y2personDict[row].map(function (d) {
                                        return d.split('_')[0];
                                    }); //only first part is the id
                                });
                                col_3.name = name;
                                col_3.data = allRows.map(function (row) {
                                    var colData = [];
                                    var people = y2personDict[row];
                                    // .filter(function (value, index, self) {
                                    //   return self.indexOf(value.id) === index;
                                    // });
                                    people.map(function (person) {
                                        var ind = col_3.name === 'KindredID'
                                            ? ids.lastIndexOf(person)
                                            : peopleIDs.lastIndexOf(person.split('_')[0]); //find this person in the attribute data
                                        // const ind = ids.lastIndexOf(person); //find this person in the attribute data
                                        if (ind > -1) {
                                            colData.push(data[ind]);
                                        }
                                        else {
                                            colData.push(undefined);
                                        }
                                    });
                                    return colData;
                                });
                                col_3.type = type;
                                colDataAccum.push(col_3);
                            }
                            else if (type === 'idtype') {
                                var col_4 = {};
                                col_4.ids = allRows.map(function (row) {
                                    return y2personDict[row].map(function (d) {
                                        return d.split('_')[0];
                                    }); //only first part is the id
                                    // .filter(function (value, index, self) {
                                    //   return self.indexOf(value) === index;
                                    // });
                                });
                                col_4.name = name;
                                col_4.data = allRows.map(function (row) {
                                    var colData = [];
                                    var people = y2personDict[row];
                                    people.map(function (person, i) {
                                        var ind = col_4.name === 'KindredID'
                                            ? ids.lastIndexOf(person)
                                            : peopleIDs.lastIndexOf(person.split('_')[0]); //find this person in the attribute data
                                        if (ind > -1) {
                                            if (isUndefined(data[ind])) {
                                                console.log('problem');
                                                console.log(name, data.size(), peopleIDs.size());
                                            }
                                            colData.push(data[ind].toString());
                                        }
                                        else {
                                            colData.push(undefined);
                                        }
                                    });
                                    return colData;
                                });
                                col_4.ys = allRows;
                                col_4.type = type;
                                colDataAccum.push(col_4);
                            }
                        });
                        aqDataAccum.forEach(function (aqDataCol, index) {
                            var indexToInsert = colOrder.indexOf(aqDataCol.name);
                            colDataAccum.splice(indexToInsert, 0, aqDataCol);
                        });
                        this.colData = colDataAccum;
                        this.calculateOffset();
                        return [2 /*return*/];
                }
            });
        });
    };
    AttributeTable.prototype.calculateOffset = function () {
        var _this = this;
        this.colOffsets = [this.colWidths.dataDensity + this.buffer];
        var colOrder = this.tableManager.colOrder;
        this.colData.forEach(function (dataEntry, index) {
            var type = dataEntry.type;
            var name = dataEntry.name;
            var maxOffset = max(_this.colOffsets);
            if (type === VALUE_TYPE_CATEGORICAL) {
                //Build col offsets array ;
                var allCategories = dataEntry.allCategories;
                var categories = void 0;
                //Only need one col for binary categories
                if (allCategories.length < 3) {
                    if (allCategories.find(function (d) {
                        return d === 'Y';
                    })) {
                        categories = ['Y'];
                    }
                    else if (allCategories.find(function (d) {
                        return d === 'True';
                    })) {
                        categories = ['True'];
                    }
                    else if (allCategories.find(function (d) {
                        return d === 'F';
                    })) {
                        categories = ['F'];
                    }
                    else {
                        categories = [allCategories[0]];
                    }
                }
                else {
                    categories = allCategories;
                }
                for (var _i = 0, categories_2 = categories; _i < categories_2.length; _i++) {
                    var cat = categories_2[_i];
                    maxOffset = max(_this.colOffsets);
                    if (_this.customColWidths[name]) {
                        _this.colOffsets.push(maxOffset + _this.buffer * 2 + _this.customColWidths[name]);
                    }
                    else {
                        _this.colOffsets.push(maxOffset + _this.buffer * 2 + _this.colWidths[type]);
                    }
                }
            }
            else {
                // const maxOffset = max(this.colOffsets);
                if (_this.customColWidths[name]) {
                    _this.colOffsets.push(maxOffset + _this.buffer + _this.customColWidths[name]);
                }
                else {
                    _this.colOffsets.push(maxOffset + _this.buffer + _this.colWidths[type]);
                }
            }
        });
    };
    //function that removes spaces and periods to be used as ids and selectors. Also includes categories for categorical data.
    AttributeTable.prototype.deriveID = function (d) {
        return d.type === 'categorical'
            ? d.name.replace(/ /g, '_').replace(/\./g, '') +
                '_' +
                d.category
                    .replace(/ /g, '_')
                    .replace(/\(/g, '')
                    .replace(/\)/g, '')
            : d.name.replace(/ /g, '_').replace(/\./g, '');
    };
    //renders the DOM elements
    //The big method TODO need to change for temporal
    AttributeTable.prototype.render = function () {
        var _this = this;
        // const t = transition('t').ease(easeLinear);
        // let t= this.tableManager.t;
        var self = this;
        var y = this.y;
        //HEADERS
        //Bind data to the col headers
        var headers = select('#tableHeaders')
            .selectAll('.header')
            .data(this.colData.map(function (d, i) {
            return {
                name: d.name,
                data: d,
                ind: i,
                type: d.type,
                max: d.max,
                min: d.min,
                mean: d.mean,
                allCategories: d.allCategories,
                category: d.category,
                isSorted: d.isSorted,
                //  'averageLimit':d.averageLimit,
                level_set: d.level_set
            };
        }), function (d) {
            return d.name;
        });
        headers
            .exit()
            .attr('opacity', 0)
            .remove(); // should remove headers of removed col's
        var headerEnter = headers
            .enter()
            .append('g')
            .classed('header', true);
        headerEnter
            .append('rect')
            .attr('class', 'titleBackground')
            .attr('height', 20)
            .on('dblclick', function (d) {
            //reset this col width.
            _this.customColWidths[d.name] = _this.colWidths[d.type];
            _this.update();
        });
        headerEnter.append('text').classed('headerTitle', true);
        headers = headerEnter.merge(headers);
        headers
            .select('.titleBackground')
            .attr('width', function (d) {
            var colWidth = _this.customColWidths[d.name] || _this.colWidths[d.type];
            return d.type === 'categorical'
                ? colWidth + d.name.length * 7
                : colWidth;
        })
            .attr('transform', function (d, i) {
            return 'translate(0,-20)';
        });
        headers
            .attr('id', function (d) {
            return _this.deriveID(d) + '_header';
        })
            .attr('transform', function (d, i) {
            var offset = _this.colOffsets[i];
            return d.type === VALUE_TYPE_CATEGORICAL
                ? 'translate(' + offset + ',0) rotate(-40)'
                : 'translate(' + offset + ',0)';
        });
        headers
            .select('.headerTitle')
            .text(function (d) {
            if (d.category &&
                d.category.toLowerCase() !== 'true' &&
                d.category.toLowerCase() !== 'y') {
                return d.name + ' (' + d.category + ')';
            }
            else if (d.category) {
                return d.name;
            }
            else if (d.type === 'temporal') {
                return d.name.slice(0, d.name.length - 3);
            }
            else {
                return d.name.slice(0, 8);
            }
        })
            .attr('transform', function (d, i) {
            var offset = (_this.customColWidths[d.name] || _this.colWidths[d.type]) / 2;
            return d.type === VALUE_TYPE_CATEGORICAL
                ? 'translate(' + offset + ',0)'
                : 'translate(' + offset + ',0)';
        })
            .attr('text-anchor', function (d) {
            return d.type === VALUE_TYPE_CATEGORICAL ? 'start' : 'middle';
            // return (d.type === VALUE_TYPE_CATEGORICAL || d.type === 'dataDensity' || d.name.length>10) ? 'start' : 'middle';
        });
        headers
            .on('mouseover', function (d) {
            _this.addTooltip('header', d);
        })
            .on('mouseout', function (d) {
            select('.menu').remove();
        });
        //Bind data to the col header summaries
        var colSummaries = select('#colSummaries')
            .selectAll('.colSummary')
            .data(this.colData.map(function (d) {
            return d;
        }), function (d) {
            return d.name;
        });
        var colSummariesEnter = colSummaries
            .enter()
            .append('g')
            .classed('colSummary', true)
            .attr('id', function (d) {
            return _this.deriveID(d) + '_summary';
        });
        colSummariesEnter
            .append('rect')
            .attr('class', 'backgroundRect')
            .attr('x', -5)
            .attr('y', -11)
            .on('mouseover', function (d) {
            select(this).classed('hoverRect', true);
            selectAll('.resizeBar')
                .filter(function (dd) {
                return dd === d;
            })
                .attr('stroke', '#909090');
        })
            .on('mouseout', function (d) {
            selectAll('.hoverRect').classed('hoverRect', false);
            selectAll('.resizeBar').attr('stroke', 'white');
        });
        colSummariesEnter
            .append('line')
            .classed('resizeBar', true)
            .on('mouseover', function (d) {
            select(this).attr('stroke', '#909090');
            selectAll('.backgroundRect')
                .filter(function (dd) {
                return dd === d;
            })
                .classed('hoverRect', true);
            // .style('fill','#e9e9e9');
        })
            .on('mouseout', function (d) {
            select(this).attr('stroke', 'white');
            selectAll('.backgroundRect').classed('.hoverRect', false);
        });
        // const resizeStarted = (d,i)=> {
        // };
        var resized = function (d, i) {
            var delta = event.x - _this.colWidths[d.type];
            _this.customColWidths[d.name] = _this.colWidths[d.type] + delta;
            _this.calculateOffset();
            _this.lazyRender();
            selectAll('.resizeBar')
                .filter(function (dd) {
                return dd === d;
            })
                .attr('stroke', '#909090');
            selectAll('.backgroundRect')
                .filter(function (dd) {
                return dd === d;
            })
                .classed('hoverRect', true);
        };
        var resizeEnded = function (d, i) {
            selectAll('.resizeBar').attr('stroke', 'white');
            selectAll('.hoverRect').classed('hoverRect', false);
        };
        selectAll('.resizeBar').call(drag()
            // .on('start', resizeStarted)
            .on('drag', resized)
            .on('end', resizeEnded));
        colSummaries.exit().remove();
        colSummaries = colSummariesEnter.merge(colSummaries);
        // TABLE
        //Bind data to the col groups
        var cols = select('#columns')
            .selectAll('.dataCols')
            .data(this.colData.map(function (d, i) {
            return {
                name: d.name,
                data: d.data,
                ind: i,
                type: d.type,
                range: d.range,
                //'averageLimit':d.averageLimit,
                level_set: d.level_set,
                ids: d.ids,
                stats: d.stats,
                varName: d.name,
                category: d.category,
                vector: d.vector
            };
        }), function (d) {
            return d.varName;
        });
        cols.exit().remove(); // should remove on col remove
        var colsEnter = cols
            .enter()
            .append('g')
            .classed('dataCols', true)
            .attr('id', function (d) {
            return _this.deriveID(d) + '_data';
        });
        //Append background rect
        colsEnter.append('rect').classed('starRect', true);
        cols = colsEnter.merge(cols); //;
        cols
            .select('.starRect')
            .attr('width', function (d) {
            var width = _this.customColWidths[d.name] || _this.colWidths[d.type];
            return width + 10;
        })
            .attr('height', this.y.range()[1] + 40)
            .attr('x', -5)
            .attr('y', -this.buffer + 3)
            .attr('class', function (d) {
            return 'starRect_' + _this.deriveID(d);
        })
            .classed('starRect', true)
            .attr('opacity', function (d) {
            var header = select('#' + _this.deriveID(d) + '_header');
            return (!header.empty() && header.classed('star')) ||
                _this.tableManager.affectedState.name === d.name
                ? 0.2
                : 0;
        });
        //translate columns horizontally to their position;
        cols
            // .transition(t)
            .attr('transform', function (d, i) {
            var offset = _this.colOffsets[i];
            return 'translate(' + offset + ',0)';
        });
        //Add frame for highlighting starred cols
        // Implement Drag and Drop
        var offset, titleOffset, titleTransform, currIndex, currPos;
        var dragstarted = function (d, i) {
            selectAll('.colSummary').attr('opacity', 0.3);
            selectAll('.dataCols').attr('opacity', 0.3);
            select('#' + _this.deriveID(d) + '_summary').attr('opacity', 1);
            select('#' + _this.deriveID(d) + '_data').attr('opacity', 1);
            //Escape any periods with backslash
            var header = select('#' + _this.deriveID(d) + '_header');
            var currTransform = header
                .attr('transform')
                .split('translate(')[1]
                .split(',');
            var xpos = +currTransform[0];
            titleTransform = currTransform[1];
            titleOffset = event.x - xpos;
            offset = event.x - _this.colOffsets[i];
            currIndex = i;
        };
        var updateRender = function (closestIndex, currIndex, d) {
            //Remove current col from colOrder
            _this.tableManager.colOrder.splice(currIndex, 1);
            //Reinsert in correct order
            _this.tableManager.colOrder.splice(closestIndex, 0, d.name);
            //Remove current colData from colDAta
            var colData = _this.colData.splice(currIndex, 1);
            //Reinsert in correct order
            _this.colData.splice(closestIndex, 0, colData[0]);
            currIndex = closestIndex;
            //Calculate new col offests;
            _this.calculateOffset();
            //Re render table
            _this.render();
        };
        var lazyUpdate = _.throttle(updateRender, 100);
        var dragged = function (d, i) {
            //Select col summary for this col
            var summary = select('#' + _this.deriveID(d) + '_summary');
            var dataCol = select('#' + _this.deriveID(d) + '_data');
            var header = select('#' + _this.deriveID(d) + '_header');
            currPos = event.x - offset;
            summary.attr('transform', 'translate(' + currPos + ',0)');
            dataCol.attr('transform', 'translate(' + currPos + ',0)');
            header.attr('transform', 'translate(' + (event.x - titleOffset) + ',' + titleTransform);
            //Find closest column
            var closest = _this.colOffsets.reduce(function (prev, curr) {
                return Math.abs(curr - currPos) < Math.abs(prev - currPos)
                    ? curr
                    : prev;
            });
            var closestIndex = _this.colOffsets.indexOf(closest);
            if (currIndex !== closestIndex) {
                //Remove current col from colOrder
                _this.tableManager.colOrder.splice(currIndex, 1);
                //Reinsert in correct order
                _this.tableManager.colOrder.splice(closestIndex, 0, d.name);
                //Remove current colData from colDAta
                var colData = _this.colData.splice(currIndex, 1);
                //Reinsert in correct order
                _this.colData.splice(closestIndex, 0, colData[0]);
                currIndex = closestIndex;
                //Calculate new col offests;
                _this.calculateOffset();
                //Re render table
                _this.render();
            }
        };
        var lazyDrag = _.throttle(dragged, 300);
        var dragended = function (d, i) {
            selectAll('.colSummary').attr('opacity', 1);
            selectAll('.dataCols').attr('opacity', 1);
            _this.render();
        };
        headers.call(drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));
        //TODO self.renderTemporalHeader
        //each cell is an object, that contains data
        colSummaries.each(function (cell) {
            if (cell.type === VALUE_TYPE_CATEGORICAL) {
                self.renderCategoricalHeader(select(this), cell);
            }
            else if (cell.type === VALUE_TYPE_INT ||
                cell.type === VALUE_TYPE_REAL) {
                self.renderIntHeaderHist(select(this), cell);
            }
            else if (cell.type === VALUE_TYPE_STRING) {
                self.renderStringHeader(select(this), cell);
            }
            else if (cell.type === 'id' || cell.type === 'idtype') {
                self.renderIDHeader(select(this), cell);
            }
            else if (cell.type === 'temporal') {
                self.renderTemporalHeader(select(this), cell);
            }
        });
        colSummaries
            // .transition(t)
            .attr('transform', function (d, i) {
            var offset = _this.colOffsets[i];
            return 'translate(' + offset + ',0)';
        });
        //create backgroundHighlight Bars
        var highlightBars = this.$node
            .select('#highlightBars')
            .selectAll('.highlightBar')
            .data(this.rowOrder.map(function (d, i) {
            return { y: d, i: i };
        }), function (d) {
            return d.y;
        });
        highlightBars.exit().remove();
        var highlightBarsEnter = highlightBars
            .enter()
            .append('rect')
            .classed('highlightBar', true);
        highlightBars = highlightBarsEnter.merge(highlightBars);
        highlightBars
            .attr('x', 0)
            .attr('y', function (d) {
            return _this.y(_this.rowOrder[d.i]);
        })
            .attr('width', max(this.colOffsets))
            .attr('height', this.rowHeight)
            .attr('opacity', 0)
            // .attr('fill', 'transparent')
            .on('mouseover', function (d) {
            _this.highlightRow(d);
            _this.tableHighlightToMap(d);
        })
            .on('mouseout', function (d) {
            _this.clearHighlight();
            events.fire(CLEAR_MAP_HIGHLIGHT);
        })
            .on('click', this.clickHighlight);
        //create slope Lines
        // //Bind data to the cells
        var slopeLines = select('#slopeLines')
            .selectAll('.slopeLine')
            .data(this.rowOrder.map(function (d, i) {
            return { y: d, ind: i, width: Config.collapseSlopeChartWidth };
        }), function (d) {
            return d.y;
        });
        slopeLines.exit().remove();
        var slopeLinesEnter = slopeLines.enter().append('path');
        slopeLines = slopeLinesEnter.merge(slopeLines);
        slopeLines
            // .append('path')
            .classed('slopeLine', true)
            .attr('d', function (d) {
            return _this.slopeChart(d);
        });
        var slopeIcons = select('#slopeLines')
            .selectAll('.slopeIcon')
            .data(this.rowOrder.map(function (d, i) {
            return { y: d, ind: i, width: Config.collapseSlopeChartWidth };
        }), function (d) {
            return d.y;
        });
        slopeIcons.exit().remove();
        var slopeIconsEnter = slopeIcons
            .enter()
            .append('text')
            .classed('slopeIcon', true);
        slopeIcons = slopeIconsEnter.merge(slopeIcons);
        //Bind data to the first col group
        var firstCol = select('#slopeChart')
            .selectAll('.dataCols')
            .data(this.firstCol.map(function (d, i) {
            var out = {
                name: d.name,
                data: d.data,
                ind: i,
                type: d.type,
                range: d.range,
                ids: d.ids,
                stats: d.stats,
                varName: d.name,
                category: d.category,
                vector: d.vector
            };
            return out;
        }), function (d) {
            return d.varName;
        });
        firstCol
            .exit()
            .attr('opacity', 0)
            .remove(); // should remove on col remove
        var firstColEnter = firstCol
            .enter()
            .append('g')
            .classed('dataCols', true);
        firstCol = firstColEnter.merge(firstCol); //;
        //Bind data to the cells
        var firstCells = firstCol.selectAll('.cell').data(function (d) {
            return d.data.map(function (e, i) {
                return {
                    id: d.ids[i],
                    name: d.name,
                    data: e,
                    ind: i,
                    type: d.type,
                    stats: d.stats,
                    varName: d.name,
                    range: d.range,
                    category: d.category,
                    vector: d.vector,
                    //  'averageLimit': d.averageLimit,
                    level_set: d.level_set
                };
            });
        }, function (d) {
            return d.id[0];
        });
        firstCells.exit().remove();
        var firstCellsEnter = firstCells
            .enter()
            .append('g')
            .attr('class', 'cell');
        firstCells = firstCellsEnter.merge(firstCells);
        firstCellsEnter.attr('opacity', 0);
        firstCells.attr('transform', function (cell, i) {
            return 'translate(0, ' + y(_this.rowOrder[i]) + ' )'; //the x translation is taken care of by the group this cell is nested in.
        });
        firstCellsEnter.attr('opacity', 1);
        firstCells.each(function (cell) {
            self.renderDataDensCell(select(this), cell);
        });
        //  console.log(this.colData,this.firstCol,this.allCols,this.tableManager.yValues)
        var rowNum = this.colData[0].data.length;
        //create table Lines
        // //Bind data to the cells
        // let rowLines = select('#columns').selectAll('.rowLine')
        //   .data(Array.apply(null, {length: this.y.range()[1]}).map(function(value, index){
        //     return index + 1;
        //   }), (d: any) => {
        //     console.log(d)
        //     return d;
        //   });
        var rowLines = select('#columns')
            .selectAll('.rowLine')
            .data(Array.apply(null, { length: rowNum }).map(function (value, index) {
            return index + 1;
        }), function (d) {
            return d;
        });
        rowLines.exit().remove();
        var rowLinesEnter = rowLines
            .enter()
            .append('line')
            .classed('rowLine', true);
        rowLines = rowLinesEnter.merge(rowLines);
        selectAll('.rowLine')
            .attr('x1', 0)
            .attr('y1', function (d) {
            return _this.y(d) + _this.rowHeight;
        })
            .attr('x2', max(this.colOffsets))
            .attr('y2', function (d) {
            return _this.y(d) + _this.rowHeight;
        });
        //Bind data to the cells
        var cells = cols.selectAll('.cell').data(function (d) {
            return d.data.map(function (e, i) {
                return {
                    y: _this.rowOrder[i],
                    id: d.ids[i],
                    name: d.name,
                    data: e,
                    ind: i,
                    type: d.type,
                    stats: d.stats,
                    varName: d.name,
                    range: d.range,
                    category: d.category,
                    vector: d.vector,
                    //      'averageLimit': d.averageLimit,
                    level_set: d.level_set
                };
            });
        }, function (d) {
            return d.id[0];
        });
        var cellsEnter = cells
            .enter()
            .append('g')
            .attr('class', 'cell')
            .on('mouseover', this.highlightRow)
            .on('mouseout', this.clearHighlight)
            .on('click', this.clickHighlight);
        selectAll('.cell')
            .on('mouseover', function (cellData) {
            self.highlightRow(cellData);
            events.fire(HIGHLIGHT_MAP_BY_ID, cellData.id[0]);
            self.addTooltip('cell', cellData);
            if (cellData.type === 'temporal') {
                if (cellData.level_set === undefined) {
                    select(this)
                        .selectAll('.average_marker')
                        .attr('opacity', 0.5);
                    select(this)
                        .selectAll('.line_graph')
                        .attr('opacity', 0.1);
                    //select(this).selectAll('.line_polygones').attr('opacity',0.1)
                }
                select(this)
                    .selectAll('.line_graph')
                    .attr('opacity', 0);
                var yLineScale_1;
                if (cellData.level_set) {
                    yLineScale_1 = scaleLinear()
                        .domain([
                        self.tableManager.getAQRange(cellData.name)[0],
                        cellData.level_set
                    ])
                        .range([0, self.rowHeight])
                        .clamp(false);
                }
                else {
                    yLineScale_1 = scaleLinear()
                        .domain(self.tableManager.getAQRange(cellData.name))
                        .range([0, self.rowHeight])
                        .clamp(false);
                }
                var colWidth = self.customColWidths[cellData.name] || self.colWidths.temporal;
                var xLineScale_1 = scaleLinear()
                    .domain([0, 28])
                    .range([0, colWidth]);
                var cleanedDataArray_1 = cellData.data[0].map(function (d) {
                    return isNaN(d) ? 0 : d;
                });
                var dataArray_1 = cellData.data[0];
                var newQuantHeight = yLineScale_1(parseInt(max(cleanedDataArray_1), 10)) + 2;
                newQuantHeight =
                    newQuantHeight > self.rowHeight
                        ? newQuantHeight
                        : self.rowHeight;
                select(this)
                    .selectAll('.quant')
                    .attr('height', newQuantHeight)
                    .attr('transform', 'translate(0, ' + (self.rowHeight - newQuantHeight) + ')');
                select(this)
                    .selectAll('.line_polygones')
                    // .data(cellData.data[0])
                    // .enter()
                    // .append('polygon')
                    .attr('points', function (d, i) {
                    var x1, x2, y1, y2, x3, y3;
                    var rowHeight = self.rowHeight;
                    if (i === 0) {
                        x1 = xLineScale_1(0);
                        x2 = xLineScale_1(0.5);
                        y1 = rowHeight - yLineScale_1(cleanedDataArray_1[i]);
                        y2 = isNaN(cellData.data[0][i + 1])
                            ? rowHeight - yLineScale_1(cleanedDataArray_1[i])
                            : rowHeight -
                                yLineScale_1((cleanedDataArray_1[i] + cleanedDataArray_1[i + 1]) / 2);
                        x3 = xLineScale_1(0.5);
                        y3 = isNaN(cellData.data[0][i + 1])
                            ? rowHeight - yLineScale_1(cleanedDataArray_1[i])
                            : rowHeight -
                                yLineScale_1((cleanedDataArray_1[i] + cleanedDataArray_1[i + 1]) / 2);
                    }
                    else if (i === 28) {
                        x1 = xLineScale_1(27.5);
                        x2 = xLineScale_1(28);
                        y1 = isNaN(cellData.data[0][i - 1])
                            ? rowHeight - yLineScale_1(cleanedDataArray_1[i])
                            : rowHeight -
                                yLineScale_1((cleanedDataArray_1[i] + cleanedDataArray_1[i - 1]) / 2);
                        y2 = rowHeight - yLineScale_1(cleanedDataArray_1[i]);
                        x3 = xLineScale_1(28);
                        y3 = rowHeight - yLineScale_1(cleanedDataArray_1[i]);
                    }
                    else {
                        x1 = xLineScale_1(i - 0.5);
                        x2 = xLineScale_1(i + 0.5);
                        x3 = xLineScale_1(i);
                        y3 = rowHeight - yLineScale_1(cleanedDataArray_1[i]);
                        if (isNaN(cellData.data[0][i - 1])) {
                            y1 = rowHeight - yLineScale_1(cleanedDataArray_1[i]);
                        }
                        else {
                            y1 =
                                rowHeight -
                                    yLineScale_1((cleanedDataArray_1[i] + cleanedDataArray_1[i - 1]) / 2);
                        }
                        if (isNaN(cellData.data[0][i + 1])) {
                            y2 = rowHeight - yLineScale_1(cleanedDataArray_1[i]);
                        }
                        else {
                            y2 =
                                rowHeight -
                                    yLineScale_1((cleanedDataArray_1[i] + cleanedDataArray_1[i + 1]) / 2);
                        }
                    }
                    return (x1 +
                        ',' +
                        rowHeight +
                        ' ' +
                        x1 +
                        ',' +
                        y1 +
                        ' ' +
                        x3 +
                        ',' +
                        y3 +
                        ' ' +
                        x2 +
                        ',' +
                        y2 +
                        ' ' +
                        x2 +
                        ',' +
                        rowHeight);
                });
                select(this)
                    .selectAll('.full_line_graph')
                    .data(cellData.data[0])
                    .enter()
                    .append('polyline')
                    .attr('points', function (d, i) {
                    var x1, x2, y1, y2, x3, y3;
                    if (i === 0) {
                        x1 = xLineScale_1(0);
                        x2 = xLineScale_1(0.5);
                        y1 = self.rowHeight - yLineScale_1(cleanedDataArray_1[i]);
                        y2 = isNaN(cellData.data[0][i + 1])
                            ? self.rowHeight - yLineScale_1(cleanedDataArray_1[i])
                            : self.rowHeight -
                                yLineScale_1((cleanedDataArray_1[i] + cleanedDataArray_1[i + 1]) / 2);
                        x3 = xLineScale_1(0.5);
                        y3 = isNaN(cellData.data[0][i + 1])
                            ? self.rowHeight - yLineScale_1(cleanedDataArray_1[i])
                            : self.rowHeight -
                                yLineScale_1((cleanedDataArray_1[i] + cleanedDataArray_1[i + 1]) / 2);
                    }
                    else if (i === 28) {
                        x1 = xLineScale_1(27.5);
                        x2 = xLineScale_1(28);
                        y1 = isNaN(cellData.data[0][i - 1])
                            ? self.rowHeight - yLineScale_1(cleanedDataArray_1[i])
                            : self.rowHeight -
                                yLineScale_1((cleanedDataArray_1[i] + cleanedDataArray_1[i - 1]) / 2);
                        y2 = self.rowHeight - yLineScale_1(cleanedDataArray_1[i]);
                        x3 = xLineScale_1(28);
                        y3 = self.rowHeight - yLineScale_1(cleanedDataArray_1[i]);
                    }
                    else {
                        x1 = xLineScale_1(i - 0.5);
                        x2 = xLineScale_1(i + 0.5);
                        x3 = xLineScale_1(i);
                        y3 = self.rowHeight - yLineScale_1(cleanedDataArray_1[i]);
                        if (isNaN(cellData.data[0][i - 1])) {
                            y1 = self.rowHeight - yLineScale_1(cleanedDataArray_1[i]);
                        }
                        else {
                            y1 =
                                self.rowHeight -
                                    yLineScale_1((cleanedDataArray_1[i] + cleanedDataArray_1[i - 1]) / 2);
                        }
                        if (isNaN(cellData.data[0][i + 1])) {
                            y2 = self.rowHeight - yLineScale_1(cleanedDataArray_1[i]);
                        }
                        else {
                            y2 =
                                self.rowHeight -
                                    yLineScale_1((cleanedDataArray_1[i] + cleanedDataArray_1[i + 1]) / 2);
                        }
                    }
                    return (x1 + ',' + y1 + ' ' + x3 + ',' + y3 + ' ' + x2 + ',' + y2 + ' ');
                })
                    .classed('full_line_graph', true)
                    .attr('fill', 'none')
                    .attr('stroke', function (d, i) {
                    if (isNaN(dataArray_1[i])) {
                        return 'none';
                    }
                    else {
                        return '#767a7a';
                    }
                });
            }
        })
            .on('mouseout', function (cellData) {
            self.clearHighlight();
            select('.menu').remove();
            events.fire(CLEAR_MAP_HIGHLIGHT);
            if (cellData.type === 'temporal') {
                select(this)
                    .selectAll('.full_line_graph')
                    .remove();
                var colWidth = self.customColWidths[cellData.name] || self.colWidths.temporal;
                var xLineScale_2 = scaleLinear()
                    .domain([0, 28])
                    .range([0, colWidth]);
                var yLineScale_2;
                if (cellData.level_set) {
                    yLineScale_2 = scaleLinear()
                        .domain([
                        self.tableManager.getAQRange(cellData.name)[0],
                        cellData.level_set
                    ])
                        .range([0, self.rowHeight])
                        .clamp(true);
                }
                else {
                    yLineScale_2 = scaleLinear()
                        .domain(self.tableManager.getAQRange(cellData.name))
                        .range([0, self.rowHeight])
                        .clamp(true);
                }
                var cleanedDataArray_2 = cellData.data[0].map(function (d) {
                    return isNaN(d) ? 0 : d;
                });
                var dataArray = cellData.data[0];
                select(this)
                    .selectAll('.line_polygones')
                    .attr('points', function (d, i) {
                    var x1, x2, y1, y2, x3, y3;
                    var rowHeight = self.rowHeight;
                    if (i === 0) {
                        x1 = xLineScale_2(0);
                        x2 = xLineScale_2(0.5);
                        y1 = rowHeight - yLineScale_2(cleanedDataArray_2[i]);
                        y2 = isNaN(cellData.data[0][i + 1])
                            ? rowHeight - yLineScale_2(cleanedDataArray_2[i])
                            : rowHeight -
                                yLineScale_2((cleanedDataArray_2[i] + cleanedDataArray_2[i + 1]) / 2);
                        x3 = xLineScale_2(0.5);
                        y3 = isNaN(cellData.data[0][i + 1])
                            ? rowHeight - yLineScale_2(cleanedDataArray_2[i])
                            : rowHeight -
                                yLineScale_2((cleanedDataArray_2[i] + cleanedDataArray_2[i + 1]) / 2);
                    }
                    else if (i === 28) {
                        x1 = xLineScale_2(27.5);
                        x2 = xLineScale_2(28);
                        y1 = isNaN(cellData.data[0][i - 1])
                            ? rowHeight - yLineScale_2(cleanedDataArray_2[i])
                            : rowHeight -
                                yLineScale_2((cleanedDataArray_2[i] + cleanedDataArray_2[i - 1]) / 2);
                        y2 = rowHeight - yLineScale_2(cleanedDataArray_2[i]);
                        x3 = xLineScale_2(28);
                        y3 = rowHeight - yLineScale_2(cleanedDataArray_2[i]);
                    }
                    else {
                        x1 = xLineScale_2(i - 0.5);
                        x2 = xLineScale_2(i + 0.5);
                        x3 = xLineScale_2(i);
                        y3 = rowHeight - yLineScale_2(cleanedDataArray_2[i]);
                        if (isNaN(cellData.data[0][i - 1])) {
                            y1 = rowHeight - yLineScale_2(cleanedDataArray_2[i]);
                        }
                        else {
                            y1 =
                                rowHeight -
                                    yLineScale_2((cleanedDataArray_2[i] + cleanedDataArray_2[i - 1]) / 2);
                        }
                        if (isNaN(cellData.data[0][i + 1])) {
                            y2 = rowHeight - yLineScale_2(cleanedDataArray_2[i]);
                        }
                        else {
                            y2 =
                                rowHeight -
                                    yLineScale_2((cleanedDataArray_2[i] + cleanedDataArray_2[i + 1]) / 2);
                        }
                    }
                    return (x1 +
                        ',' +
                        rowHeight +
                        ' ' +
                        x1 +
                        ',' +
                        y1 +
                        ' ' +
                        x3 +
                        ',' +
                        y3 +
                        ' ' +
                        x2 +
                        ',' +
                        y2 +
                        ' ' +
                        x2 +
                        ',' +
                        rowHeight);
                });
                //  select(this).selectAll('.full_line_polygones').remove()
                select(this)
                    .selectAll('.quant')
                    .attr('height', self.rowHeight)
                    .attr('y', 0)
                    .attr('transform', 'translate(0,0)');
                select(this)
                    .selectAll('.line_graph')
                    .attr('opacity', 1);
                if (cellData.level_set === undefined) {
                    select(this)
                        .selectAll('.average_marker')
                        .attr('opacity', 0);
                    select(this)
                        .selectAll('.line_polygones')
                        .attr('opacity', 0.4);
                }
            }
        })
            .on('click', function (d) {
            if (d.name === 'KindredID') {
                self.tableManager.selectFamily([parseInt(d.data, 10)]);
                self.highlightedID = d.id[0];
                document.getElementById('col2').style.display = 'block';
            }
            else {
                self.clickHighlight(d);
            }
        });
        cells.exit().remove();
        cells = cellsEnter.merge(cells);
        cellsEnter.attr('opacity', 0);
        cells.attr('transform', function (cell, i) {
            return _this.rowOrder[i]
                ? 'translate(0, ' + y(_this.rowOrder[i]) + ' )'
                : ''; //the x translation is taken care of by the group this cell is nested in.
        });
        cellsEnter.attr('opacity', 1);
        cells.each(function (cell) {
            if (cell.type === VALUE_TYPE_CATEGORICAL) {
                self.renderCategoricalCell(select(this), cell);
            }
            else if (cell.type === VALUE_TYPE_INT ||
                cell.type === VALUE_TYPE_REAL) {
                self.renderIntCell(select(this), cell);
                //  console.log(cell)
            }
            else if (cell.type === VALUE_TYPE_STRING) {
                self.renderStringCell(select(this), cell);
            }
            else if (cell.name === 'KindredID') {
                self.renderFamilyIDCell(select(this), cell);
            }
            else if (cell.type === 'id' || cell.type === 'idtype') {
                self.renderIdCell(select(this), cell);
            }
            else if (cell.type === 'dataDensity') {
                self.renderDataDensCell(select(this), cell);
            }
            else if (cell.type === 'temporal') {
                self.renderTemporalCell(select(this), cell);
            }
        });
        // If a sortAttribute has been set, sort by that attribute
        if (this.sortAttribute.state !== sortedState.Unsorted) {
            this.sortRows(this.sortAttribute.data, this.sortAttribute.state, false);
        }
        this.updateSlopeLines(false, this.sortAttribute.state !== sortedState.Unsorted);
        //recalculate size of svgs:
        var maxWidth = max(this.colOffsets) +
            50 +
            (this.sortAttribute.state === sortedState.Unsorted
                ? 0
                : Config.slopeChartWidth);
        this.$node.select('#headers').attr('width', maxWidth);
        this.$node.select('.tableSVG').attr('width', maxWidth);
        if (this.highlightedID !== 'none') {
            this.clickHighlightRowByID(this.highlightedID);
            this.highlightedID = 'none';
        }
    };
    AttributeTable.prototype.clickHighlight = function (d) {
        // event.stopPropagation();
        if (event.defaultPrevented) {
            return;
        } // dragged
        var wasSelected = selectAll('.highlightBar')
            .filter(function (e) {
            return e.y === d.y || e.y === Math.round(d.y);
        })
            .classed('selected');
        //'Unselect all other background bars if ctrl was not pressed
        if (!event.metaKey) {
            selectAll('.slopeLine').classed('clickedSlope', false);
            selectAll('.highlightBar').classed('selected', false);
        }
        selectAll('.slopeLine')
            .filter(function (e) {
            return e.y === d.y || e.y === Math.round(d.y);
        })
            .classed('clickedSlope', function () {
            return !wasSelected;
        });
        selectAll('.highlightBar')
            .filter(function (e) {
            return e.y === d.y || e.y === Math.round(d.y);
        })
            .classed('selected', function () {
            return !wasSelected;
        });
    };
    AttributeTable.prototype.clearHighlight = function () {
        // event.stopPropagation();
        selectAll('.slopeLine').classed('selectedSlope', false);
        //Hide all the highlightBars
        selectAll('.highlightBar').attr('opacity', 0);
    };
    AttributeTable.prototype.clickHighlightRowByID = function (id) {
        var _this = this;
        var allRows = Object.keys(this.tableManager.yValues);
        allRows.forEach(function (key) {
            if (key.includes(id)) {
                var d_1 = { y: _this.tableManager.yValues[key] };
                selectAll('.slopeLine')
                    .filter(function (e) {
                    return e.y === d_1.y || e.y === Math.round(d_1.y);
                })
                    .classed('clickedSlope', true);
                selectAll('.highlightBar')
                    .filter(function (e) {
                    return e.y === d_1.y || e.y === Math.round(d_1.y);
                })
                    .classed('selected', true);
            }
        });
    };
    AttributeTable.prototype.highlightRowByID = function (id) {
        var _this = this;
        var allRows = Object.keys(this.tableManager.yValues);
        allRows.forEach(function (key) {
            if (key.includes(id)) {
                _this.highlightRow({ y: _this.tableManager.yValues[key] });
            }
        });
    };
    AttributeTable.prototype.tableHighlightToMap = function (yVal) {
        var _this = this;
        var allRows = Object.keys(this.tableManager.yValues);
        allRows.forEach(function (key) {
            if (_this.tableManager.yValues[key] === yVal) {
                events.fire(HIGHLIGHT_MAP_BY_ID, key.split('_')[0]);
            }
        });
    };
    AttributeTable.prototype.highlightRow = function (d) {
        // event.stopPropagation();
        function selected(e) {
            var returnValue = false;
            //Highlight the current row in the graph and table
            if (e.y === Math.round(d.y)) {
                returnValue = true;
            }
            return returnValue;
        }
        selectAll('.slopeLine').classed('selectedSlope', false);
        selectAll('.slopeLine')
            .filter(function (e) {
            return e.y === Math.round(d.y);
        })
            .classed('selectedSlope', true);
        //Set opacity of corresponding highlightBar
        selectAll('.highlightBar')
            .filter(selected)
            .attr('opacity', 0.2);
    };
    /**
     *
     * This function sorts the table by the current Attribute
     * TODO add temporal sort
     * @param d data to be sorted
     * @param ascending, boolean flag set to true if sort order is ascending
     */
    AttributeTable.prototype.sortRows = function (d, sortOrder, animate) {
        var _this = this;
        var self = this;
        var maxWidth = max(this.colOffsets) + 50 + Config.slopeChartWidth;
        this.$node.select('#headers').attr('width', maxWidth);
        this.$node.select('.tableSVG').attr('width', maxWidth);
        var animated = animate ? function (d) { return d.transition(_this.t2); } : function (d) { return d; };
        //get data from colData array
        var toSort = this.colData.find(function (c) {
            return c.name === d.name;
        }).data;
        // temporary array holds objects with position and sort-value
        var mapped = toSort.map(function (el, i) {
            if (d.type === VALUE_TYPE_REAL || d.type === VALUE_TYPE_INT) {
                return isNaN(+mean(el))
                    ? { index: i, value: undefined }
                    : { index: i, value: +mean(el) };
            }
            else if (d.type === VALUE_TYPE_STRING) {
                return isUndefined(el[0]) || el[0].length === 0
                    ? { index: i, value: undefined }
                    : {
                        index: i,
                        value: el[0].toLowerCase()
                    };
            }
            else if (d.type === VALUE_TYPE_CATEGORICAL) {
                return {
                    index: i,
                    value: +(el.filter(function (e) {
                        return e === d.category;
                    }).length / el.length)
                };
            }
            else if (d.type === 'idtype') {
                var equalValues_1 = el.reduce(function (a, b) {
                    return a === b ? a : NaN;
                }); //check for array that has all equal values in an aggregate (such as KindredId);
                return isNaN(equalValues_1)
                    ? { index: i, value: undefined }
                    : { index: i, value: equalValues_1 };
            }
            else if (d.type === 'temporal') {
                var dataArray = el[0];
                var beforeAverage = undefined;
                var afterAverage = undefined;
                if (dataArray !== undefined) {
                    beforeAverage = mean(dataArray.slice(14 - self.averageLimit, 14));
                    afterAverage = mean(dataArray.slice(15, 15 + self.averageLimit));
                }
                //let valueToReturn = Math.abs(beforeAverage - afterAverage);
                var valueToReturn = beforeAverage ? beforeAverage : 0;
                return {
                    index: i,
                    value: valueToReturn
                };
            }
        });
        var equalValues = mapped.reduce(function (a, b) {
            return a.value === b.value ? a : NaN;
        }); //check for array that has all equal values in an aggregate (such as KindredId);
        //All values are the same, no sorting needed;
        if (!isNaN(equalValues.value)) {
            return;
        }
        if (sortOrder === sortedState.Ascending) {
            mapped.sort(function (a, b) {
                if (a.value === b.value) {
                    if (a.index === b.index) {
                        return 0;
                    }
                    if (a.index < b.index) {
                        return -1;
                    }
                    if (a.index > b.index) {
                        return 1;
                    }
                }
                if (b.value === undefined || a.value < b.value) {
                    return -1;
                }
                if (a.value === undefined || a.value > b.value) {
                    return 1;
                }
            });
        }
        else {
            mapped.sort(function (a, b) {
                if (a.value === b.value) {
                    if (a.index === b.index) {
                        return 0;
                    }
                    if (a.index < b.index) {
                        return -1;
                    }
                    if (a.index > b.index) {
                        return 1;
                    }
                }
                if (a.value < b.value) {
                    return 1;
                }
                if (a.value === undefined ||
                    b.value === undefined ||
                    a.value > b.value) {
                    return -1;
                }
            });
        }
        // container for the resulting order
        var sortedIndexes = mapped.map(function (el) {
            return el.index;
        });
        var sortedArray = mapped.map(function (el) {
            return toSort[el.index];
        });
        //need to save as class variable to later decide which slope lines are visible.
        this.sortedRowOrder = sortedIndexes;
        // let cellSelection = select('#columns').selectAll('.cell');
        animated(select('#col2')).style('width', 550 + Config.slopeChartWidth + 'px');
        animated(select('#columns').selectAll('.cell'))
            // .transition(t2)
            .attr('transform', function (cell) {
            return ('translate(0, ' +
                _this.y(_this.rowOrder[sortedIndexes.indexOf(cell.ind)]) +
                ' )'); //the x translation is taken care of by the group this cell is nested in.
        });
        d.ind = sortedIndexes.indexOf(d.ind);
        //translate tableGroup to make room for the slope lines.
        animated(select('#tableGroup'))
            // .transition(t2)
            .attr('transform', function (cell) {
            return 'translate(0,0)';
        });
        animated(select('#headerGroup'))
            // .transition(t2)
            .attr('transform', function (cell) {
            return 'translate(0,80)';
        });
        animated(select('#colSummaries'))
            //  .transition(t2)
            .attr('transform', function (cell) {
            return 'translate(0,15)';
        });
        //Not needed since the slopeLines are updated within this.updateSlopeLines;
        // animated(selectAll('.slopeLine'))
        //   //  .transition(t2)
        //   .attr('d', (d: any) => {
        //     return this.slopeChart({y: d.y, ind: sortedIndexes.indexOf(d.ind), width: Config.slopeChartWidth});
        //   });
        animated(select('#tableGroup'))
            .selectAll('.highlightBar')
            //  .transition(t2)
            .attr('y', function (d) {
            return _this.y(_this.rowOrder[sortedIndexes.indexOf(d.i)]);
        });
    };
    /**
     *
     * This function adds the 'sorting' glyphs to the top of the columns in the table.
     *
     * @param element d3 selection of the current column header element.
     * @param cellData the data bound to the column header element being passed in.
     */
    AttributeTable.prototype.addSortingIcons = function (element, cellData) {
        var _this = this;
        //Check for custom column width value, if none, use default
        var colWidth = this.customColWidths[cellData.name] || this.colWidths[cellData.type];
        var icon = element.selectAll('.descending').data([cellData]);
        var iconEnter = icon
            .enter()
            .append('text')
            .classed('sortIcon', true)
            .classed('icon', true)
            .classed('descending', true);
        icon = iconEnter.merge(icon);
        icon
            .text('\uf0dd')
            .attr('y', this.rowHeight * 1.8 + 24)
            .attr('x', function (d) {
            return colWidth / 2 - 5;
        });
        icon = element.selectAll('.ascending').data([cellData]);
        iconEnter = icon
            .enter()
            .append('text')
            .classed('sortIcon', true)
            .classed('icon', true)
            .classed('ascending', true);
        icon.attr('y', this.rowHeight * 1.8 + 24).attr('x', function (d) {
            return colWidth / 2 - 5;
        });
        //Add 'remove col icon'
        icon
            .enter()
            .append('text')
            .classed('icon', true)
            .classed('deleteIcon', true)
            .text(' \uf057');
        element
            .select('.deleteIcon')
            .attr('y', this.rowHeight * 2 + 40)
            .attr('x', function (d) {
            return colWidth / 2 - 8;
        });
        //append menu ellipsis
        icon
            .enter()
            .append('text')
            .classed('icon', true)
            .classed('menuIcon', true)
            .text('\uf141');
        element
            .select('.menuIcon')
            .attr('y', this.rowHeight * 2 + 40)
            .attr('x', function (d) {
            return colWidth / 2 + 5;
        })
            .on('click', function (d) {
            _this.addMenu(d);
        });
        icon = iconEnter.merge(icon);
        icon
            .text('\uf0de')
            .attr('y', this.rowHeight * 1.8 + 30)
            .attr('x', function (d) {
            return colWidth / 2 + 5;
        });
        var self = this;
        selectAll('.sortIcon').on('click', function (d) {
            // Set 'sortAttribute'
            if (select(this).classed('ascending')) {
                self.sortAttribute.state = sortedState.Ascending;
            }
            else {
                self.sortAttribute.state = sortedState.Descending;
            }
            self.sortAttribute.data = d;
            selectAll('.sortIcon').classed('sortSelected', false);
            select(this).classed('sortSelected', true);
            self.sortRows(d, self.sortAttribute.state, true);
            self.updateSlopeLines(true, true);
        });
        selectAll('.deleteIcon').on('click', function (d) {
            _this.tableManager.colOrder.splice(_this.tableManager.colOrder.indexOf(d.name), 1);
            _this.tableManager.removeStar(d.name);
            //Update menu
            selectAll('.dropdown-item')
                .filter(function (item) {
                return item === d.name;
            })
                .classed('active', false);
            events.fire(COL_ORDER_CHANGED_EVENT);
        });
    };
    AttributeTable.prototype.addMenu = function (d) {
        var _this = this;
        select('#treeMenu')
            .select('.menu')
            .remove();
        var self = this;
        event.stopPropagation();
        var option1, option2, option3;
        if (d.type === 'categorical' &&
            (d.category.toLowerCase() === 'true' || d.category.toLowerCase() === 'y')) {
            option1 = 'Show ' + d.name;
            option2 = 'Show NOT ' + d.name;
        }
        else if (d.type === 'categorical' && d.allCategories.length < 3) {
            option1 = 'Show ' + d.allCategories[0];
            option2 = 'Show ' + d.allCategories[1];
        }
        else if (d.type === 'categorical' && d.allCategories.length > 3) {
            option1 = 'Show ' + d.category;
            option2 = 'Show NOT ' + d.category;
        }
        else if (d.type === 'temporal') {
            option1 = 'Set Average Limit';
            option2 = 'Change Axis Cap';
            option3 = 'View in Detail';
        }
        var menuLabels;
        if (d.type === 'categorical') {
            menuLabels = [
                option1,
                option2,
                'Set as POI',
                'Set as Primary Attribute',
                'Star'
            ];
        }
        else if ((d.type = 'temporal')) {
            menuLabels = [option1, option2, option3];
        }
        else {
            menuLabels = ['Set as POI', 'Set as Primary Attribute', 'Star'];
        }
        var menuObjects = menuLabels.map(function (m) {
            return { label: m, attr: d.name };
        });
        var container = document.getElementById('app');
        var coordinates = mouse(container);
        var menuWidth = 90; //default Value. Will update
        var menuItemHeight = 25;
        var menuHeight = 15 + menuLabels.length * menuItemHeight;
        var menu = select('#treeMenu')
            .append('svg')
            .attr('class', 'menu')
            .attr('height', menuHeight)
            .append('g')
            .attr('transform', 'translate(0,10)');
        select('.menu')
            .select('g')
            .append('g')
            .classed('tooltipTriangle', true)
            .append('rect');
        var menuItems = menu.selectAll('text').data(menuObjects);
        var menuItemsEnter = menuItems
            .enter()
            .append('g')
            .attr('class', 'menuItem');
        menuItemsEnter.append('rect').classed('menuItemBackground', true);
        menuItemsEnter.append('text').classed('icon', true);
        menuItemsEnter.append('text').classed('label', true);
        menuItemsEnter.append('line').classed('menuDivider', true);
        menuItems = menuItemsEnter.merge(menuItems);
        menuItems
            .select('.label')
            .attr('x', 10)
            .attr('y', menuItemHeight / 2 + 3)
            .text(function (d) { return d.label; })
            .classed('tooltipTitle', true)
            .on('click', function (d) {
            select('#treeMenu')
                .select('.menu')
                .remove();
        });
        var longestLabelLength = 0;
        menu.selectAll('.menuItem').each(function (element, i) {
            var textNode = select(this)
                .select('.label')
                .node();
            var labelWidth = textNode.getComputedTextLength();
            longestLabelLength =
                labelWidth > longestLabelLength ? labelWidth : longestLabelLength;
        });
        menuWidth = longestLabelLength + 50;
        select('.menu').attr('transform', 'translate(' +
            (coordinates[0] - menuWidth / 2) +
            ',' +
            (coordinates[1] + 3) +
            ')');
        select('.tooltipTriangle')
            .attr('transform', 'translate(' + (menuWidth / 2 - 3) + ',-2)')
            .select('rect')
            .attr('width', 10)
            .attr('fill', 'rgb(232, 108, 55)')
            .attr('height', 10)
            .attr('opacity', 1)
            .attr('transform', 'rotate(45)')
            .attr('transform-origin', 'center');
        menuItems
            .select('.menuItemBackground')
            .attr('width', menuWidth)
            .attr('fill', '#f7f7f7')
            .attr('height', menuItemHeight)
            .attr('opacity', 1)
            .on('click', function (e) {
            if (e.label.includes('Star')) {
                var header = select('#' + _this.deriveID(d) + '_header');
                var starBackground = select('.starRect_' + _this.deriveID(d));
                header.classed('star', !header.classed('star'));
                if (header.classed('star')) {
                    _this.tableManager.addStar(d.name, d.category);
                    starBackground.attr('opacity', 0.2);
                }
                else {
                    _this.tableManager.removeStar(d.name);
                    starBackground.attr('opacity', 0);
                }
            }
            else if (e.label.includes('POI')) {
                _this.tableManager.setAffectedState(d.name).then(function (obj) {
                    //find histogram with this name and set the brush extent
                    var hist = _this.histograms.filter(function (h) {
                        return h.attrName === d.name;
                    })[0];
                    if (obj.threshold !== undefined) {
                        //setAffectedState returned a default value. Was not set by user brushing or selecting bar;
                        //New POI has been set, remove all other brush and rect selection interactions;
                        _this.histograms.map(function (hist) {
                            hist.clearInteraction();
                        });
                        if (hist && obj.type === VALUE_TYPE_CATEGORICAL) {
                            hist.setSelected(obj.threshold);
                        }
                        else if ((hist && obj.type === VALUE_TYPE_REAL) ||
                            obj.type === VALUE_TYPE_INT) {
                            hist.setBrush(obj.threshold);
                        }
                    }
                });
                selectAll('.icon')
                    .filter('.tooltipTitle')
                    .classed('poi', function (ee) {
                    return (ee.label.includes('POI') &&
                        _this.tableManager.affectedState.name === d.name);
                });
            }
            else if (e.label.includes('Primary')) {
                var currentMenuIcon = selectAll('.icon')
                    .filter('.tooltipTitle')
                    .filter(function (ee) {
                    return (ee.label.includes('Primary') &&
                        _this.tableManager.primaryAttribute &&
                        _this.tableManager.primaryAttribute.name === d.name);
                });
                var isSelected = !currentMenuIcon.empty() &&
                    currentMenuIcon.classed('primaryAttribute');
                var currentMenuLabel = selectAll('.label')
                    .filter('.tooltipTitle')
                    .filter(function (ee) {
                    return ee.label.includes('Primary') && ee.attr === d.name;
                });
                if (isSelected) {
                    events.fire('primarySelected', { name: undefined });
                    currentMenuIcon.classed('primaryAttribute', false);
                    currentMenuLabel.text('Set as Primary Attribute');
                    return;
                }
                else {
                    events.fire('primarySelected', { name: d.name });
                }
                selectAll('.icon')
                    .filter('.tooltipTitle')
                    .classed('primaryAttribute', function (ee) {
                    return (ee.label.includes('Primary') &&
                        _this.tableManager.primaryAttribute &&
                        _this.tableManager.primaryAttribute.name === d.name);
                });
            }
            else if (e.label.includes('Average')) {
                var newLimit = parseInt(prompt('Please set average limit for column ' + d.name, self.averageLimit.toString()), 10);
                if (!isNaN(newLimit) && newLimit > 0 && newLimit <= 14) {
                    //this.colData.filter(col=>col.name === d.name)[0].averageLimit = newLimit;
                    self.averageLimit = newLimit;
                    _this.update();
                }
                else {
                    alert('Invalid Input');
                }
            }
            else if (e.label.includes('Axis Cap')) {
                var oldLevels = (d.level_set === undefined
                    ? NaN
                    : d.level_set).toString();
                var newLevels = parseInt(prompt('Please input the y-value cap. If to change back to normal view, leave it empty', oldLevels), 10);
                if (!isNaN(newLevels) && newLevels > 0) {
                    _this.colData.filter(function (col) { return col.name === d.name; })[0].level_set = newLevels;
                }
                else {
                    _this.colData.filter(function (col) { return col.name === d.name; })[0].level_set = undefined;
                }
                _this.update();
            }
            else if (e.label.includes('Detail')) {
                events.fire(SHOW_DETAIL_VIEW, d);
            }
            select('#treeMenu')
                .select('.menu')
                .remove();
        });
        menuItems.attr('transform', function (d, i) {
            return 'translate(0,' + (5 + i * menuItemHeight) + ')';
        });
        menuItems
            .select('.icon')
            .attr('x', menuWidth - 20)
            .attr('y', menuItemHeight / 2 + 5)
            .attr('class', 'icon')
            .text(function (d, i) {
            if (i === 0 && d.label.includes('Show')) {
                return '\uf111';
            }
            else if (i === 1 && d.label.includes('Show')) {
                return '\uf22d';
            }
            else if (d.label.includes('POI')) {
                return '\uf007';
            }
            else if (d.label.includes('Attribute')) {
                return '\uf012';
            }
            else if (d.label.includes('Star')) {
                return '\uf005';
            }
            else {
                return '';
            }
        })
            .classed('tooltipTitle', true)
            .classed('star', function (e) {
            var header = select('#' + _this.deriveID(d) + '_header');
            return e.label.includes('Star') && header.classed('star');
        })
            .classed('poi', function (e) {
            return (e.label.includes('POI') &&
                _this.tableManager.affectedState.name === d.name);
        })
            .classed('primaryAttribute', function (e) {
            return (e.label.includes('Primary') &&
                _this.tableManager.primaryAttribute &&
                _this.tableManager.primaryAttribute.name === d.name);
        });
        menuItems
            .select('.menuDivider')
            .attr('x1', 0)
            .attr('x2', menuWidth)
            .attr('y1', menuItemHeight)
            .attr('y2', menuItemHeight)
            .attr('stroke-width', '1px')
            .attr('stroke', 'white');
        select('#treeMenu').attr('width', menuWidth);
        menu
            .append('line')
            .attr('x1', 0)
            .attr('x2', menuWidth)
            .attr('y1', 5)
            .attr('y2', 5)
            .attr('stroke-width', '5px')
            .attr('stroke', '#e86c37');
    };
    /**
     *
     * This function renders the column header of String columns in the Table View.
     *
     * @param element d3 selection of the current column header element.
     * @param cellData the data bound to the column header element being passed in.
     */
    AttributeTable.prototype.renderStringHeader = function (element, headerData) {
        //Check for custom column width value, if none, use default
        var colWidth = this.customColWidths[headerData.name] || this.colWidths.string;
        // const colWidth = this.colWidths.string;
        var height = this.headerHeight;
        element
            .select('.backgroundRect')
            .attr('width', colWidth + 10)
            .attr('height', height + 11);
        element
            .select('.resizeBar')
            .attr('x1', colWidth + this.buffer / 2)
            .attr('x2', colWidth + this.buffer / 2)
            .attr('y1', -11)
            .attr('y2', height)
            .attr('stroke-width', '4px')
            .attr('stroke', 'white');
        // element.selectAll('rect').remove();
        // element.selectAll('text').remove();
        // element.selectAll('circle').remove();
        this.addSortingIcons(element, headerData);
    };
    /**
     *
     * This function renders the column header of String columns in the Table View.
     *
     * @param element d3 selection of the current column header element.
     * @param cellData the data bound to the column header element being passed in.
     */
    AttributeTable.prototype.renderIDHeader = function (element, headerData) {
        //Check for custom column width value, if none, use default
        var colWidth = this.customColWidths[headerData.name] || this.colWidths.id;
        // const colWidth = this.colWidths.id;
        var height = this.headerHeight;
        element
            .select('.backgroundRect')
            .attr('width', colWidth + 10)
            .attr('height', height + 11);
        element
            .select('.resizeBar')
            .attr('x1', colWidth + this.buffer / 2)
            .attr('x2', colWidth + this.buffer / 2)
            .attr('y1', -11)
            .attr('y2', height)
            .attr('stroke-width', '4px')
            .attr('stroke', 'white');
        // element.selectAll('rect').remove();
        element.selectAll('text').remove();
        element.selectAll('circle').remove();
        this.addSortingIcons(element, headerData);
    };
    AttributeTable.prototype.renderTemporalHeader = function (element, headerData) {
        var _this = this;
        //TODO Make it only appear the current family VS entire dataSets
        var self = this;
        var colWidth = this.customColWidths[headerData.name] || this.colWidths.temporal;
        var attributeName = headerData.name;
        var kindredIDData = self.colData.filter(function (d) { return d.name === 'KindredID'; })[0]
            .data;
        //  console.log(kindredIDData,self.colData)
        var beforeFamilyAverageSet = {};
        var afterFamilyAverageSet = {};
        var temporalMeans = headerData.data.map(function (d, i) {
            //  console.log(d)
            if (d.length === 1 && d[0]) {
                var dataArray = d[0];
                var beforeAverage = mean(dataArray.slice(14 - self.averageLimit, 14));
                beforeAverage = !beforeAverage ? NaN : beforeAverage;
                var afterAverage = mean(dataArray.slice(15, 15 + self.averageLimit));
                afterAverage = !afterAverage ? NaN : afterAverage;
                var familyID = kindredIDData[i][0];
                if (beforeFamilyAverageSet[familyID]) {
                    beforeFamilyAverageSet[familyID].push(beforeAverage);
                    afterFamilyAverageSet[familyID].push(afterAverage);
                }
                else {
                    beforeFamilyAverageSet[familyID] = [beforeAverage];
                    afterFamilyAverageSet[familyID] = [afterAverage];
                }
            }
        });
        var height = this.headerHeight;
        var xLineScale = scaleLinear()
            .domain([-14, 14])
            .range([0, colWidth]);
        var yLineScale = scaleLinear()
            .domain(headerData.range)
            .range([height, 0]);
        element
            .select('.backgroundRect')
            .attr('width', colWidth + 10)
            .attr('height', height + 11);
        element
            .select('.resizeBar')
            .attr('x1', colWidth + this.buffer / 2)
            .attr('x2', colWidth + this.buffer / 2)
            .attr('y1', -11)
            .attr('y2', height)
            .attr('stroke-width', '4px')
            .attr('stroke', 'white');
        this.addSortingIcons(element, headerData);
        var familyIDArray = self.tableManager.familyIDArray;
        if (self.SHOWING_RANKED) {
            familyIDArray = [];
        }
        //  const lineLength = 0.5*colWidth/(familyIDArray.length+1)
        var lineLength = colWidth / 4;
        //Add family seperator
        element.selectAll('.family_seperator').remove();
        element.selectAll('.header_average_line').remove();
        element.selectAll('.header_summuary_line').remove();
        element
            .append('line')
            .attr('class', 'family_seperator')
            .attr('x1', xLineScale(0))
            .attr('y1', 0)
            .attr('x2', xLineScale(0))
            .attr('y2', height)
            .attr('transform', 'translate(' + lineLength + ',0)');
        element
            .append('line')
            .attr('class', 'family_seperator')
            .attr('x1', xLineScale(0))
            .attr('y1', 0)
            .attr('x2', xLineScale(0))
            .attr('y2', height)
            .attr('transform', 'translate(' + -1 * lineLength + ',0)');
        var beforeAverageCacher = [];
        var afterAverageCacher = [];
        familyIDArray.forEach(function (familyID, i) {
            var beforeAverage = mean(beforeFamilyAverageSet[familyID]);
            var afterAverage = mean(afterFamilyAverageSet[familyID]);
            beforeAverageCacher.push(beforeAverage);
            afterAverageCacher.push(afterAverage);
            element
                .append('line')
                .attr('class', 'header_summuary_line')
                .attr('x1', xLineScale(0))
                .attr('x2', xLineScale(0) + lineLength)
                .attr('y1', yLineScale(beforeAverage))
                .attr('y2', yLineScale(beforeAverage))
                .attr('stroke', schemeCategory10[i + 1])
                .attr('transform', 'translate(' + -1 * lineLength + ',0)');
            element
                .append('line')
                .attr('class', 'header_summuary_line')
                .attr('x1', xLineScale(0))
                .attr('x2', xLineScale(0) + lineLength)
                .attr('y1', yLineScale(afterAverage))
                .attr('y2', yLineScale(afterAverage))
                .attr('stroke', schemeCategory10[i + 1]);
            //.attr('transform', 'translate(' + (i) * lineLength + ',0)')
        });
        //Add overall average
        element
            .append('line')
            .attr('class', 'header_summuary_line')
            .attr('x1', xLineScale(0))
            .attr('x2', xLineScale(0) + lineLength)
            .attr('y1', yLineScale(self.tableManager.temporal_data_means[headerData.name][0]))
            .attr('y2', yLineScale(self.tableManager.temporal_data_means[headerData.name][0]))
            .attr('stroke', schemeCategory10[0])
            .attr('transform', 'translate(' + -2 * lineLength + ',0)');
        element
            .append('rect')
            .attr('class', 'mouse_helper')
            .attr('x', xLineScale(0))
            .attr('y', 0)
            .attr('width', lineLength)
            .attr('height', height)
            .attr('transform', 'translate(' + -2 * lineLength + ',0)')
            .attr('opacity', 0)
            .attr('pointer-events', 'bounding-box')
            .on('mouseover', function (d) {
            return _this.addTooltip('header', d, 'Before Average: ' +
                self.tableManager.temporal_data_means[headerData.name][0]
                    .toFixed(2)
                    .toString());
        })
            .on('mouseleave', function (d) {
            select('#tooltipMenu')
                .select('.menu')
                .remove();
        });
        //  .attr('transform', 'translate(' + (-familyIDArray.length-1) * lineLength + ',0)')
        element
            .append('line')
            .attr('class', 'header_summuary_line')
            .attr('x1', xLineScale(0))
            .attr('x2', xLineScale(0) + lineLength)
            .attr('y1', yLineScale(self.tableManager.temporal_data_means[headerData.name][1]))
            .attr('y2', yLineScale(self.tableManager.temporal_data_means[headerData.name][1]))
            .attr('stroke', schemeCategory10[0])
            .attr('transform', 'translate(' + lineLength + ',0)');
        element
            .append('rect')
            .attr('class', 'mouse_helper')
            .attr('x', xLineScale(0))
            .attr('y', 0)
            .attr('width', lineLength)
            .attr('height', height)
            .attr('opacity', 0)
            .attr('pointer-events', 'bounding-box')
            .attr('transform', 'translate(' + lineLength + ',0)')
            .on('mouseover', function (d) {
            return _this.addTooltip('header', d, 'After Average: ' +
                self.tableManager.temporal_data_means[headerData.name][1]
                    .toFixed(2)
                    .toString());
        })
            .on('mouseleave', function (d) {
            select('#tooltipMenu')
                .select('.menu')
                .remove();
        });
        //.attr('transform', 'translate(' + (familyIDArray.length) * lineLength + ',0)')
        //add Family ID
        //   //Add X-Axis and Y-Axis
        element.selectAll('.axis').remove();
        element.selectAll('.color_ramp').remove();
        element.selectAll('.linear_gradient').remove();
        element
            .append('rect')
            .attr('x', -5)
            .attr('y', 0)
            .attr('width', 5)
            .attr('height', height)
            .attr('class', 'color_ramp');
        element
            .append('g')
            .attr('class', 'axis axis--y')
            .call(axisLeft(yLineScale)
            .tickArguments([4, 'd'])
            .tickSize(5));
        element.select('.deathMarker').remove();
        var deathMarker = element
            .append('line')
            .attr('class', 'deathMarker')
            .attr('x1', xLineScale(0))
            .attr('y1', 0)
            .attr('x2', xLineScale(0))
            .attr('y2', height);
        element.select('.baseLine').remove();
        var baseLine = element
            .append('line')
            .attr('class', 'baseLine')
            .attr('x1', 0)
            .attr('x2', colWidth)
            .attr('y1', height)
            .attr('y2', height);
        element.select('.clipLine').remove();
        if (headerData.name !== 'AirTempday') {
            var clipLine = element
                .append('line')
                .attr('class', 'clipLine')
                .attr('x1', 0)
                .attr('x2', colWidth)
                .attr('y1', yLineScale(headerData.level_set))
                .attr('y2', yLineScale(headerData.level_set));
        }
        var colorGradient = element
            .append('linearGradient')
            .attr('class', 'linear_gradient')
            .attr('id', 'linear_gradient_' + headerData.name)
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', 1)
            .attr('y2', 0)
            .attr('color-interpolation', 'CIE-Lab');
        if (self.temporalDataRange[attributeName]) {
            var dataLevels = self.temporalDataRange[attributeName];
            dataLevels.forEach(function (dataLevel, i) {
                colorGradient
                    .append('stop')
                    .attr('offset', (1 - yLineScale(dataLevel) / height) * 100 + '%')
                    .attr('stop-color', self.epaColor[i]);
            });
        }
        else if (attributeName === 'AirTempday') {
            var intervalRange = self.tableManager.getAQExtreme(attributeName);
            var beginPercent = 100 - (yLineScale(intervalRange[0]) / height) * 100;
            var midPercent = 100 - (yLineScale(0) / height) * 100;
            var endPercent = 100 - (yLineScale(intervalRange[1]) / height) * 100;
            for (var i = 1; i < 5; i++) {
                colorGradient
                    .append('stop')
                    .attr('offset', beginPercent + 0.25 * i * (midPercent - beginPercent) + '%')
                    .attr('stop-color', interpolateRdBu(0.5 + 0.125 * (4 - i)));
            }
            colorGradient
                .append('stop')
                .attr('offset', midPercent + '%')
                .attr('stop-color', interpolateRdBu(0.5));
            for (var i = 1; i < 5; i++) {
                colorGradient
                    .append('stop')
                    .attr('offset', midPercent + 0.25 * i * (endPercent - midPercent) + '%')
                    .attr('stop-color', interpolateRdBu(0.5 - 0.125 * i));
            }
        }
        else {
            var intervalRange = headerData.range;
            var beginPercent = 100 - (yLineScale(intervalRange[0]) / height) * 100;
            var endPercent = 100 - (yLineScale(intervalRange[1]) / height) * 100;
            for (var i = 0; i < 6; i++) {
                colorGradient
                    .append('stop')
                    .attr('offset', beginPercent + 0.2 * i * (endPercent - beginPercent) + '%')
                    .attr('stop-color', interpolateReds(0.2 * i));
            }
        }
        element
            .select('.color_ramp')
            .attr('fill', 'url(#linear_gradient_' + attributeName + ')');
    };
    /**
     *
     * This function renders the column header of Categorical columns in the Table View.
     *
     * @param element d3 selection of the current column header element.
     * @param cellData the data bound to the column header element being passed in.
     */
    AttributeTable.prototype.renderCategoricalHeader = function (element, headerData) {
        var _this = this;
        //There can't be custom colWidths for categorical data
        var colWidth = this.colWidths.categorical;
        var height = this.headerHeight;
        element
            .select('.backgroundRect')
            .attr('width', colWidth + 10)
            .attr('height', height + 11);
        var numPositiveValues = headerData.data
            .map(function (singleRow) {
            return singleRow.reduce(function (a, v) {
                return v === headerData.category ? a + 1 : a;
            }, 0);
        })
            .reduce(function (a, v) {
            return v + a;
        }, 0);
        var totalValues = headerData.data
            .map(function (singleRow) {
            return singleRow.length;
        })
            .reduce(function (a, v) {
            return a + v;
        }, 0);
        var summaryScale = scaleLinear()
            .range([0, height])
            .domain([0, totalValues]);
        if (element.selectAll('.histogram').size() === 0) {
            element.append('rect').classed('histogram', true);
            element.append('text').classed('histogramLabel', true);
            element.append('span').attr('class', 'oi oi-menu');
        }
        this.addSortingIcons(element, headerData);
        var self = this;
        element
            .select('.histogram')
            .attr('opacity', 0)
            .attr('width', colWidth)
            .attr('height', summaryScale(numPositiveValues))
            .attr('y', height - summaryScale(numPositiveValues))
            .attr('opacity', 1)
            .attr('fill', function () {
            var attr = _this.tableManager.primaryAttribute;
            if (attr && attr.name === headerData.name) {
                var index = attr.categories.indexOf(headerData.category);
                return attr.color[index];
            }
            else {
                attr = _this.tableManager.affectedState;
                if (attr) {
                    var poi = attr;
                    attr = attr.attributeInfo;
                    if (attr.name === headerData.name) {
                        if (poi.isAffected(headerData.category)) {
                            var index = attr.categories.indexOf(headerData.category);
                            return attr.color[index];
                        }
                    }
                }
            }
        })
            .on('mouseenter', function (d) { return _this.addTooltip('header', d); })
            .on('mouseleave', function (d) {
            select('#tooltipMenu')
                .select('.menu')
                .remove();
        });
        element
            .select('.histogramLabel')
            .attr('opacity', 0)
            .text(function () {
            var percentage = (numPositiveValues / totalValues) * 100;
            if (percentage < 1) {
                return percentage.toFixed(1) + '%';
            }
            else {
                return percentage.toFixed(0) + '%';
            }
        })
            .attr('y', height - summaryScale(numPositiveValues) - 2)
            .attr('opacity', 1);
    };
    /**
     *
     * This function renders the column header of Quantitative columns as Histograms
     *
     * @param element d3 selection of the current column header element.
     * @param cellData the data bound to the column header element being passed in.
     */
    AttributeTable.prototype.renderIntHeaderHist = function (element, headerData) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var colWidth, height, attributeHistogram, graphView, attributeView, allCols, dataVec;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        colWidth = this.customColWidths[headerData.name] || this.colWidths.int;
                        height = this.headerHeight;
                        element
                            .select('.backgroundRect')
                            .attr('width', colWidth + 10)
                            .attr('height', height + 11);
                        element
                            .select('.resizeBar')
                            .attr('x1', colWidth + this.buffer / 2)
                            .attr('x2', colWidth + this.buffer / 2)
                            .attr('y1', -11)
                            .attr('y2', height)
                            .attr('stroke-width', '4px')
                            .attr('stroke', 'white');
                        this.addSortingIcons(element, headerData);
                        attributeHistogram = this.histograms.filter(function (hist) {
                            return hist.attrName === headerData.name;
                        })[0];
                        if (!attributeHistogram) {
                            attributeHistogram = new Histogram(element);
                            this.histograms.push(attributeHistogram);
                        }
                        return [4 /*yield*/, this.tableManager.graphTable];
                    case 1:
                        graphView = _a.sent();
                        return [4 /*yield*/, this.tableManager.tableTable];
                    case 2:
                        attributeView = _a.sent();
                        allCols = graphView.cols().concat(attributeView.cols());
                        dataVec = allCols.filter(function (col) {
                            return col.desc.name === headerData.name;
                        })[0];
                        // initiate this object
                        return [4 /*yield*/, attributeHistogram.init(headerData.name, dataVec, dataVec.desc.value.type, colWidth, this.headerHeight)];
                    case 3:
                        // initiate this object
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AttributeTable.prototype.removeTooltip = function () {
        // select('#tooltipMenu').html(''); //select('.menu').remove();
    };
    AttributeTable.prototype.addTooltip = function (type, data, specialText) {
        if (data === void 0) { data = null; }
        if (specialText === void 0) { specialText = null; }
        var container = document.getElementById('app');
        var coordinates = mouse(container);
        var self = this;
        var content;
        if (type === 'cell') {
            if (data.type === 'categorical') {
                content = data.name + ' : ';
                var categories_3 = data.data.filter(function (value, index, self) {
                    return self.indexOf(value) === index;
                });
                categories_3.map(function (category) {
                    var count = data.data.reduce(function (accumulator, currentValue) {
                        return currentValue === category ? accumulator + 1 : accumulator;
                    }, 0);
                    content = content.concat((categories_3.length > 1 ? count : '') + category + '  ');
                });
            }
            else if (data.type === 'int') {
                content =
                    data.name +
                        ' : ' +
                        data.data.sort(function (a, b) {
                            return a - b;
                        }); //display sorted values
            }
            else if (data.type === 'string') {
                content = data.name + ' : ' + data.data[0].toString().toLowerCase();
            }
            else if (data.type === 'dataDensity') {
                content =
                    data.name +
                        ' : ' +
                        (data.data[0] ? data.data[0].toLowerCase() : data.data);
            }
            else if (data.type === 'idtype') {
                content = data.name + ' : ' + data.data;
            }
            else if (data.type === 'temporal' && data.data[0] !== undefined) {
                //  content = data.data[0].map(d=>d.toFixed(1));
                var dataArray = data.data[0];
                var beforeAverage = mean(dataArray.slice(14 - self.averageLimit, 14));
                beforeAverage = beforeAverage === undefined ? NaN : beforeAverage;
                var afterAverage = mean(dataArray.slice(15, 15 + self.averageLimit));
                afterAverage = afterAverage === undefined ? NaN : afterAverage;
                content =
                    'Before Average: ' +
                        beforeAverage.toFixed(2).toString() +
                        ' After Average: ' +
                        afterAverage.toFixed(2).toString();
            }
        }
        else if (type === 'header') {
            if (data.type === 'categorical') {
                content = data.name + '(' + data.category + ') ';
            }
            else if (data.type === 'temporal' && specialText) {
                content = specialText;
            }
            else {
                content = data.name;
            }
        }
        var menuWidth = 10; //dummy value. to be updated;
        var menuHeight = 30;
        select('#tooltipMenu')
            .select('svg')
            .remove();
        var menu = select('#tooltipMenu')
            .append('svg')
            .attr('class', 'menu')
            .attr('height', menuHeight)
            .attr('opacity', 0)
            .append('g');
        menu
            .append('rect')
            .attr('fill', '#f7f7f7')
            .attr('height', menuHeight)
            .attr('opacity', 1);
        menu
            .append('text')
            .attr('x', 10)
            .attr('y', 20)
            .text(content)
            .classed('tooltipTitle', true);
        var textNode = menu.select('text').node();
        menuWidth = textNode.getComputedTextLength() + 20;
        select('#tooltipMenu')
            .select('.menu')
            .attr('transform', 'translate(' +
            (coordinates[0] - menuWidth - 20) +
            ',' +
            (coordinates[1] - menuHeight / 2) +
            ')');
        select('#tooltipMenu').attr('width', menuWidth);
        select('#tooltipMenu')
            .select('rect')
            .attr('width', menuWidth);
        select('#tooltipMenu')
            .select('svg')
            .attr('width', menuWidth);
        menu
            .append('line')
            .attr('x1', 0)
            .attr('x2', menuWidth)
            .attr('y1', menuHeight * 0.3)
            .attr('y2', menuHeight * 0.3)
            .attr('y1', 0)
            .attr('y2', 0)
            .attr('stroke-width', '5px')
            .attr('stroke', '#e86c37');
        select('.menu')
            //  .transition()
            //  .delay(500)
            .attr('opacity', 1);
    };
    /**
     *
     * This function renders the content of Categorical Cells in the Table View.
     *
     * @param element d3 selection of the current cell element.
     * @param cellData the data bound to the cell element being passed in.
     */
    AttributeTable.prototype.renderCategoricalCell = function (element, cellData) {
        // let t = transition('t').duration(500).ease(easeLinear);
        var _this = this;
        var colWidth = this.colWidths.categorical;
        var rowHeight = this.rowHeight;
        //Add up the undefined values;
        var numValidValues = cellData.data.reduce(function (a, v) {
            return v ? a + 1 : a;
        }, 0);
        var numValues = cellData.data.filter(function (c) {
            return c === cellData.category;
        }).length;
        element.selectAll('rect').remove(); //Hack. don't know why the height of the rects isn' being updated.
        if (numValidValues < 1) {
            //Add a faint cross out to indicate no data here;
            if (element.selectAll('.cross_out').size() === 0) {
                element.append('line').attr('class', 'cross_out');
            }
            element
                .select('.cross_out')
                .attr('x1', colWidth * 0.3)
                .attr('y1', rowHeight / 2)
                .attr('x2', colWidth * 0.6)
                .attr('y2', rowHeight / 2)
                .attr('stroke-width', 2)
                .attr('stroke', '#9e9d9b')
                .attr('opacity', 0.6);
            return;
        }
        if (element.selectAll('.categorical').size() === 0) {
            element.append('rect').classed('frame', true);
            // .on('mouseover', (d) => {this.addTooltip('cell', cellData); })
            // .on('mouseout', () => {
            //   select('#tooltipMenu').select('.menu').remove();
            // });
            element.append('rect').classed(VALUE_TYPE_CATEGORICAL, true);
            // .on('mouseover', (d) => { this.addTooltip('cell', cellData); })
            // .on('mouseout', () => {
            //   select('#tooltipMenu').select('.menu').remove();
            // });
        }
        this.yScale.domain([0, cellData.data.length]).range([0, rowHeight]);
        element
            .select('.frame')
            .attr('width', rowHeight)
            .attr('height', rowHeight)
            // .attr('y', 0)
            .attr('fill', function (d) {
            var attr;
            var primary = _this.tableManager.primaryAttribute;
            var poi = _this.tableManager.affectedState;
            if (primary && primary.name === cellData.varName) {
                attr = primary;
            }
            else if (poi && poi.name === cellData.varName) {
                attr = poi;
                attr = attr.attributeInfo;
            }
            if (attr) {
                var ind = attr.categories.indexOf(cellData.category);
                if ((poi &&
                    poi.name === cellData.varName &&
                    poi.isAffected(cellData.data[0])) ||
                    (primary && primary.name === cellData.varName)) {
                    if (ind === 0) {
                        return attr.color[1];
                    }
                    else {
                        return attr.color[0];
                    }
                }
            }
            return '#dfdfdf';
        });
        element
            .select('.categorical')
            .attr('width', rowHeight)
            .attr('height', this.yScale(numValues))
            .attr('y', rowHeight - this.yScale(numValues))
            .classed('aggregate', function () {
            return cellData.data.length > 1;
        })
            .attr('fill', function () {
            var attr;
            var primary = _this.tableManager.primaryAttribute;
            var poi = _this.tableManager.affectedState;
            if (primary && primary.name === cellData.varName) {
                attr = primary;
            }
            else if (poi && poi.name === cellData.varName) {
                attr = poi;
                attr = attr.attributeInfo;
            }
            if (attr) {
                var ind = attr.categories.indexOf(cellData.category);
                if (ind > -1) {
                    if ((poi &&
                        poi.name === cellData.varName &&
                        poi.isAffected(cellData.data[0])) ||
                        (primary && primary.name === cellData.varName)) {
                        return attr.color[ind];
                    }
                }
            }
            return '#767a7a';
        });
    };
    /**
     *
     * This function renders the content of Categorical Cells in the Table View.
     *
     * @param element d3 selection of the current cell element.
     * @param cellData the data bound to the cell element being passed in.
     */
    AttributeTable.prototype.renderDataDensCell = function (element, cellData) {
        var _this = this;
        var self = this;
        //Check for custom column width value, if none, use default
        var colWidth = this.customColWidths[cellData.name] || this.colWidths[cellData.type];
        // const colWidth = this.colWidths[cellData.type];
        var rowHeight = this.rowHeight;
        //append data to checkbox for easy export
        //only add checkboxes for the dataDensity col;
        element
            .selectAll('.checkbox')
            .data([cellData].filter(function (c) {
            return c.type === 'dataDensity';
        }))
            .enter()
            .append('rect')
            .classed('checkbox', true)
            .on('click', function () {
            event.stopPropagation();
            //toggle visibility of both checkbox icon and checkbox color;
            element
                .select('.checkboxIcon')
                .classed('checked', !select(this).classed('checked'));
            select(this).classed('checked', !select(this).classed('checked'));
        });
        if (element.selectAll('.dataDens').size() === 0) {
            element.append('rect').classed('dataDens', true);
            element.append('text').classed('label', true);
            if (cellData.type === 'dataDensity') {
                element
                    .append('text')
                    .text('\uf00c')
                    .classed('checkboxIcon', true)
                    .attr('x', 11)
                    .attr('y', 12);
            }
        }
        var colorScale = scaleLinear()
            .domain(this.idScale.domain())
            .range(['#c0bfbb', '#373838']);
        element
            .select('.dataDens')
            .attr('width', colWidth)
            .attr('height', rowHeight)
            .attr('x', cellData.type === 'dataDensity'
            ? this.colWidths.dataDensity + this.buffer
            : 0)
            .attr('y', 0)
            .attr('opacity', 0.4)
            .attr('fill', function (d, i) {
            return _this.colorScale[0];
        });
        element
            .select('.checkbox')
            .attr('width', colWidth)
            .attr('height', rowHeight)
            .attr('x', 3)
            .attr('y', 0);
        element
            .select('.label')
            .attr('x', cellData.type === 'dataDensity'
            ? colWidth / 2 + this.colWidths.dataDensity + this.buffer
            : colWidth / 2)
            // .attr('x', colWidth / 2)
            .attr('y', rowHeight * 0.8)
            .text(function () {
            return cellData.data;
        })
            .attr('text-anchor', 'middle')
            .attr('fill', '#4e4e4e');
    };
    AttributeTable.prototype.renderFamilyIDCell = function (element, cellData) {
        var equalValues = cellData.data.reduce(function (a, b) {
            return a === b ? a : NaN;
        }); //check for array that has all equal values in an aggregate (such as KindredId);
        if (isNaN(equalValues)) {
            console.log('Found Duplicate KindredIDs in aggregate row!');
            return;
        }
        cellData.data = equalValues; //set the value of this cell as the KindredID
        this.renderDataDensCell(element, cellData);
    };
    AttributeTable.prototype.renderTemporalCell = function (element, cellData) {
        var colWidth = this.customColWidths[cellData.name] || this.colWidths.temporal;
        var rowHeight = this.rowHeight;
        element.selectAll('.line_polygones').remove();
        var self = this;
        element.selectAll('.average_marker').remove();
        //make a scale for the data
        if (cellData.data[0] === undefined ||
            cellData.data[0].filter(function (d) { return d; }).length === 0) {
            if (element.selectAll('.cross_out').size() === 0) {
                element.append('line').attr('class', 'cross_out');
            }
            element
                .select('.cross_out')
                .attr('x1', colWidth * 0.3)
                .attr('y1', rowHeight / 2)
                .attr('x2', colWidth * 0.6)
                .attr('y2', rowHeight / 2)
                .attr('stroke-width', 2)
                .attr('stroke', '#9e9d9b')
                .attr('opacity', 0.6);
            return;
        }
        else {
            if (cellData.level_set === undefined) {
                var xLineScale_3 = scaleLinear()
                    .domain([0, 28])
                    .range([0, colWidth]);
                var yLineScale_3 = scaleLinear()
                    .domain(self.tableManager.getAQRange(cellData.name))
                    .range([0, rowHeight]);
                var dataArray_2 = cellData.data[0];
                var cleanedDataArray_3 = dataArray_2.map(function (d) { return (isNaN(d) ? 0 : d); });
                var beforeAverage = mean(cleanedDataArray_3.slice(14 - self.averageLimit, 14));
                var afterAverage = mean(cleanedDataArray_3.slice(15, 15 + self.averageLimit));
                if (element.selectAll('.quant').size() === 0) {
                    element.append('rect').classed('quant', true);
                }
                element
                    .select('.quant')
                    .attr('width', function (d) {
                    return colWidth;
                })
                    .attr('height', rowHeight);
                element.selectAll('.deathMarker').remove();
                var beforeLine = element
                    .append('line')
                    .attr('class', 'average_marker')
                    .attr('x1', xLineScale_3(14 - self.averageLimit))
                    .attr('x2', xLineScale_3(14))
                    .attr('y1', rowHeight - yLineScale_3(beforeAverage))
                    .attr('y2', rowHeight - yLineScale_3(beforeAverage))
                    .attr('opacity', 0);
                var afterLine = element
                    .append('line')
                    .attr('class', 'average_marker')
                    .attr('x1', xLineScale_3(14))
                    .attr('x2', xLineScale_3(14 + self.averageLimit))
                    .attr('y1', rowHeight - yLineScale_3(afterAverage))
                    .attr('y2', rowHeight - yLineScale_3(afterAverage))
                    .attr('opacity', 0);
                var deathMarker = element
                    .append('line')
                    .attr('class', 'deathMarker')
                    .attr('x1', xLineScale_3(14))
                    .attr('y1', 0)
                    .attr('x2', xLineScale_3(14))
                    .attr('y2', rowHeight);
                element.selectAll('.line_graph').remove();
                element
                    .selectAll('.line_graph')
                    .data(dataArray_2)
                    .enter()
                    .append('polyline')
                    .attr('points', function (d, i) {
                    var x1, x2, y1, y2, x3, y3;
                    if (i === 0) {
                        x1 = xLineScale_3(0);
                        x2 = xLineScale_3(0.5);
                        y1 = rowHeight - yLineScale_3(cleanedDataArray_3[i]);
                        y2 = isNaN(cellData.data[0][i + 1])
                            ? rowHeight - yLineScale_3(cleanedDataArray_3[i])
                            : rowHeight -
                                yLineScale_3((cleanedDataArray_3[i] + cleanedDataArray_3[i + 1]) / 2);
                        x3 = xLineScale_3(0.5);
                        y3 = isNaN(cellData.data[0][i + 1])
                            ? rowHeight - yLineScale_3(cleanedDataArray_3[i])
                            : rowHeight -
                                yLineScale_3((cleanedDataArray_3[i] + cleanedDataArray_3[i + 1]) / 2);
                    }
                    else if (i === 28) {
                        x1 = xLineScale_3(27.5);
                        x2 = xLineScale_3(28);
                        y1 = isNaN(cellData.data[0][i - 1])
                            ? rowHeight - yLineScale_3(cleanedDataArray_3[i])
                            : rowHeight -
                                yLineScale_3((cleanedDataArray_3[i] + cleanedDataArray_3[i - 1]) / 2);
                        y2 = rowHeight - yLineScale_3(cleanedDataArray_3[i]);
                        x3 = xLineScale_3(28);
                        y3 = rowHeight - yLineScale_3(cleanedDataArray_3[i]);
                    }
                    else {
                        x1 = xLineScale_3(i - 0.5);
                        x2 = xLineScale_3(i + 0.5);
                        x3 = xLineScale_3(i);
                        y3 = rowHeight - yLineScale_3(cleanedDataArray_3[i]);
                        if (isNaN(cellData.data[0][i - 1])) {
                            y1 = rowHeight - yLineScale_3(cleanedDataArray_3[i]);
                        }
                        else {
                            y1 =
                                rowHeight -
                                    yLineScale_3((cleanedDataArray_3[i] + cleanedDataArray_3[i - 1]) / 2);
                        }
                        if (isNaN(cellData.data[0][i + 1])) {
                            y2 = rowHeight - yLineScale_3(cleanedDataArray_3[i]);
                        }
                        else {
                            y2 =
                                rowHeight -
                                    yLineScale_3((cleanedDataArray_3[i] + cleanedDataArray_3[i + 1]) / 2);
                        }
                    }
                    return (x1 + ',' + y1 + ' ' + x3 + ',' + y3 + ' ' + x2 + ',' + y2 + ' ');
                })
                    .classed('line_graph', true)
                    .attr('stroke', function (d, i) {
                    if (isNaN(dataArray_2[i]) ||
                        dataArray_2[i] > self.tableManager.getAQRange(cellData.name)[1] ||
                        dataArray_2[i] < self.tableManager.getAQRange(cellData.name)[0]) {
                        return 'none';
                    }
                    else {
                        return '#767a7a';
                    }
                });
            }
            else {
                var xLineScale_4 = scaleLinear()
                    .domain([0, 28])
                    .range([0, colWidth]);
                var yLineScale_4 = scaleLinear()
                    .domain([
                    self.tableManager.getAQRange(cellData.name)[0],
                    cellData.level_set
                ])
                    .range([0, rowHeight])
                    .clamp(true);
                var colorScale_1 = scaleLinear()
                    .domain(cellData.range)
                    .range([0, 1]);
                var dataArray_3 = cellData.data[0];
                var cleanedDataArray_4 = dataArray_3.map(function (d) {
                    return isNaN(d) ? 0 : parseInt(d, 10);
                });
                var beforeAverage = mean(cleanedDataArray_4.slice(14 - self.averageLimit, 14));
                var afterAverage = mean(cleanedDataArray_4.slice(15, 15 + self.averageLimit));
                // const data_max = parseInt(max(cleanedDataArray));
                element.append('rect').classed('quant', true);
                element
                    .select('.quant')
                    .attr('width', function (d) {
                    return colWidth;
                })
                    .attr('height', rowHeight);
                element.selectAll('.deathMarker').remove();
                element
                    .selectAll('.line_polygones')
                    .data(dataArray_3)
                    .enter()
                    .append('polygon')
                    .attr('points', function (d, i) {
                    var x1, x2, y1, y2, x3, y3;
                    if (i === 0) {
                        x1 = xLineScale_4(0);
                        x2 = xLineScale_4(0.5);
                        y1 = rowHeight - yLineScale_4(cleanedDataArray_4[i]);
                        y2 = isNaN(cellData.data[0][i + 1])
                            ? rowHeight - yLineScale_4(cleanedDataArray_4[i])
                            : rowHeight -
                                yLineScale_4((cleanedDataArray_4[i] + cleanedDataArray_4[i + 1]) / 2);
                        x3 = xLineScale_4(0.5);
                        y3 = isNaN(cellData.data[0][i + 1])
                            ? rowHeight - yLineScale_4(cleanedDataArray_4[i])
                            : rowHeight -
                                yLineScale_4((cleanedDataArray_4[i] + cleanedDataArray_4[i + 1]) / 2);
                    }
                    else if (i === 28) {
                        x1 = xLineScale_4(27.5);
                        x2 = xLineScale_4(28);
                        y1 = isNaN(cellData.data[0][i - 1])
                            ? rowHeight - yLineScale_4(cleanedDataArray_4[i])
                            : rowHeight -
                                yLineScale_4((cleanedDataArray_4[i] + cleanedDataArray_4[i - 1]) / 2);
                        y2 = rowHeight - yLineScale_4(cleanedDataArray_4[i]);
                        x3 = xLineScale_4(28);
                        y3 = rowHeight - yLineScale_4(cleanedDataArray_4[i]);
                    }
                    else {
                        x1 = xLineScale_4(i - 0.5);
                        x2 = xLineScale_4(i + 0.5);
                        x3 = xLineScale_4(i);
                        y3 = rowHeight - yLineScale_4(cleanedDataArray_4[i]);
                        if (isNaN(cellData.data[0][i - 1])) {
                            y1 = rowHeight - yLineScale_4(cleanedDataArray_4[i]);
                        }
                        else {
                            y1 =
                                rowHeight -
                                    yLineScale_4((cleanedDataArray_4[i] + cleanedDataArray_4[i - 1]) / 2);
                        }
                        if (isNaN(cellData.data[0][i + 1])) {
                            y2 = rowHeight - yLineScale_4(cleanedDataArray_4[i]);
                        }
                        else {
                            y2 =
                                rowHeight -
                                    yLineScale_4((cleanedDataArray_4[i] + cleanedDataArray_4[i + 1]) / 2);
                        }
                    }
                    return (x1 +
                        ',' +
                        rowHeight +
                        ' ' +
                        x1 +
                        ',' +
                        y1 +
                        ' ' +
                        x3 +
                        ',' +
                        y3 +
                        ' ' +
                        x2 +
                        ',' +
                        y2 +
                        ' ' +
                        x2 +
                        ',' +
                        rowHeight);
                })
                    .classed('line_polygones', true)
                    .attr('fill', function (d, i) {
                    if (self.temporalDataRange.hasOwnProperty(cellData.name)) {
                        var dataLevel = self.temporalDataRange[cellData.name];
                        if (isNaN(dataArray_3[i])) {
                            return 'none';
                        }
                        else {
                            return self.getCorrespondColor(dataArray_3[i], cellData.name);
                        }
                    }
                    else if (cellData.name === 'AirTempday') {
                        if (isNaN(dataArray_3[i])) {
                            return 'none';
                        }
                        else {
                            if (dataArray_3[i] === 0) {
                                return interpolateRdBu(0.5);
                            }
                            else if (dataArray_3[i] > 0) {
                                var interpolateVal = 0.5 + (dataArray_3[i] / cellData.range[1]) * 0.5;
                                return interpolateRdBu(1 - interpolateVal);
                            }
                            else {
                                var interpolateVal = 0.5 - (dataArray_3[i] / cellData.range[0]) * 0.5;
                                return interpolateRdBu(1 - interpolateVal);
                            }
                        }
                    }
                    else {
                        if (isNaN(dataArray_3[i])) {
                            return 'none';
                        }
                        else {
                            return interpolateReds(colorScale_1(dataArray_3[i]));
                        }
                        // if (isNaN(dataArray[i]) || isNaN(dataArray[i+1]))
                        // { return 'none';}
                        // else if (dataArray[i] >= cellData.level_set[2] && dataArray[i+1] >= cellData.level_set[2])
                        // { return '#7E0023'}
                        // else if (dataArray[i] >= cellData.level_set[1] && dataArray[i+1] >= cellData.level_set[1])
                        // {return '#FF0000'}
                        // else if (dataArray[i] >= cellData.level_set[0]&& dataArray[i+1]>=cellData.level_set[0])
                        // {return '#FFFF00'}
                        // else
                        // {return 'none'}
                    }
                });
                element
                    .append('line')
                    .attr('class', 'average_marker')
                    .attr('x1', xLineScale_4(14 - self.averageLimit))
                    .attr('x2', xLineScale_4(14))
                    .attr('y1', rowHeight - yLineScale_4(beforeAverage))
                    .attr('y2', rowHeight - yLineScale_4(beforeAverage))
                    .attr('opacity', 0);
                element
                    .append('line')
                    .attr('class', 'average_marker')
                    .attr('x1', xLineScale_4(14))
                    .attr('x2', xLineScale_4(14 + self.averageLimit))
                    .attr('y1', rowHeight - yLineScale_4(afterAverage))
                    .attr('y2', rowHeight - yLineScale_4(afterAverage))
                    .attr('opacity', 0);
                element.selectAll('.line_graph').remove();
                element
                    .selectAll('.line_graph')
                    .data(dataArray_3)
                    .enter()
                    .append('polyline')
                    .attr('points', function (d, i) {
                    var x1, x2, y1, y2, x3, y3;
                    if (i === 0) {
                        x1 = xLineScale_4(0);
                        x2 = xLineScale_4(0.5);
                        y1 = rowHeight - yLineScale_4(cleanedDataArray_4[i]);
                        y2 = isNaN(cellData.data[0][i + 1])
                            ? rowHeight - yLineScale_4(cleanedDataArray_4[i])
                            : rowHeight -
                                yLineScale_4((cleanedDataArray_4[i] + cleanedDataArray_4[i + 1]) / 2);
                        x3 = xLineScale_4(0.5);
                        y3 = isNaN(cellData.data[0][i + 1])
                            ? rowHeight - yLineScale_4(cleanedDataArray_4[i])
                            : rowHeight -
                                yLineScale_4((cleanedDataArray_4[i] + cleanedDataArray_4[i + 1]) / 2);
                    }
                    else if (i === 28) {
                        x1 = xLineScale_4(27.5);
                        x2 = xLineScale_4(28);
                        y1 = isNaN(cellData.data[0][i - 1])
                            ? rowHeight - yLineScale_4(cleanedDataArray_4[i])
                            : rowHeight -
                                yLineScale_4((cleanedDataArray_4[i] + cleanedDataArray_4[i - 1]) / 2);
                        y2 = rowHeight - yLineScale_4(cleanedDataArray_4[i]);
                        x3 = xLineScale_4(28);
                        y3 = rowHeight - yLineScale_4(cleanedDataArray_4[i]);
                    }
                    else {
                        x1 = xLineScale_4(i - 0.5);
                        x2 = xLineScale_4(i + 0.5);
                        x3 = xLineScale_4(i);
                        y3 = rowHeight - yLineScale_4(cleanedDataArray_4[i]);
                        if (isNaN(cellData.data[0][i - 1])) {
                            y1 = rowHeight - yLineScale_4(cleanedDataArray_4[i]);
                        }
                        else {
                            y1 =
                                rowHeight -
                                    yLineScale_4((cleanedDataArray_4[i] + cleanedDataArray_4[i - 1]) / 2);
                        }
                        if (isNaN(cellData.data[0][i + 1])) {
                            y2 = rowHeight - yLineScale_4(cleanedDataArray_4[i]);
                        }
                        else {
                            y2 =
                                rowHeight -
                                    yLineScale_4((cleanedDataArray_4[i] + cleanedDataArray_4[i + 1]) / 2);
                        }
                    }
                    return (x1 + ',' + y1 + ' ' + x3 + ',' + y3 + ' ' + x2 + ',' + y2 + ' ');
                })
                    .classed('line_graph', true)
                    .attr('stroke', function (d, i) {
                    if (isNaN(dataArray_3[i]) ||
                        dataArray_3[i] > cellData.level_set ||
                        dataArray_3[i] < self.tableManager.getAQRange(cellData.name)[0]) {
                        return 'none';
                    }
                    else {
                        return '#767a7a';
                    }
                });
                var deathMarker = element
                    .append('line')
                    .attr('class', 'deathMarker')
                    .attr('x1', xLineScale_4(14))
                    .attr('y1', 0)
                    .attr('x2', xLineScale_4(14))
                    .attr('y2', rowHeight);
            }
        }
    };
    AttributeTable.prototype.getCorrespondColor = function (val, name) {
        var levelArray = this.temporalDataRange[name];
        var capIndex = 6;
        var lowerIndex = 5;
        for (var i = 0; i < levelArray.length; i++) {
            if (levelArray[i] > val) {
                capIndex = i;
                lowerIndex = i - 1;
                break;
            }
        }
        var lowerColor = this.epaColor[lowerIndex];
        var capColor = this.epaColor[capIndex];
        var normalizedVal = (val - levelArray[lowerIndex]) /
            (levelArray[capIndex] - levelArray[lowerIndex]);
        return interpolateLab(lowerColor, capColor)(normalizedVal);
    };
    /**
     *
     * This function renders the content of Quantitative (type === int)  Cells in the Table View.
     *
     * @param element d3 selection of the current cell element.
     * @param cellData the data bound to the cell element being passed in.
     */
    AttributeTable.prototype.renderIntCell = function (element, cellData) {
        var _this = this;
        var colWidth = this.customColWidths[cellData.name] || this.colWidths.int;
        var rowHeight = this.rowHeight;
        var radius = 3.5;
        var jitterScale = scaleLinear()
            .domain([0, 1])
            .range([rowHeight * 0.3, rowHeight * 0.7]);
        this.xScale
            .domain(cellData.vector.desc.value.range)
            .range([colWidth * 0.1, colWidth * 0.9])
            .clamp(true);
        //No of non-undefined elements in this array
        var numValues = cellData.data.filter(function (v) {
            return v !== undefined;
        }).length;
        // console.log(numValues);
        if (numValues === 0) {
            // console.log(cellData.name, cellData.data);
            //Add a faint cross out to indicate no data here;
            if (element.selectAll('.cross_out').size() === 0) {
                element.append('line').attr('class', 'cross_out');
            }
            element
                .select('.cross_out')
                .attr('x1', colWidth * 0.3)
                .attr('y1', rowHeight / 2)
                .attr('x2', colWidth * 0.6)
                .attr('y2', rowHeight / 2)
                .attr('stroke-width', 2)
                .attr('stroke', '#9e9d9b')
                .attr('opacity', 0.6);
            return;
        }
        if (element.selectAll('.quant').size() === 0) {
            element.append('rect').classed('quant', true);
        }
        element
            .select('.quant')
            .attr('width', function (d) {
            return colWidth;
        })
            .attr('height', rowHeight);
        var ellipses = element.selectAll('ellipse').data(function (d) {
            var cellArray = cellData.data
                .filter(function (f) {
                return !isNaN(f) && !isNullOrUndefined(f);
            })
                .map(function (e, i) {
                return { id: d.id[i], name: d.name, stats: d.stats, value: e };
            });
            return cellArray;
        });
        var ellipsesEnter = ellipses
            .enter()
            .append('ellipse')
            .classed('quant_ellipse', true);
        ellipses.exit().remove();
        ellipses = ellipsesEnter.merge(ellipses);
        element
            .selectAll('.quant_ellipse')
            .attr('cx', function (d) {
            if (!isNaN(d.value)) {
                return _this.xScale(d.value);
            }
        })
            .attr('cy', function () {
            return numValues > 1 ? jitterScale(Math.random()) : rowHeight / 2;
        }) //introduce jitter in the y position for multiple ellipses.
            .attr('rx', radius)
            .attr('ry', radius)
            .attr('fill', function () {
            var attr;
            // const ind;
            var primary = _this.tableManager.primaryAttribute;
            var poi = _this.tableManager.affectedState;
            if (primary && primary.name === cellData.varName) {
                attr = primary;
            }
            else if (poi && poi.name === cellData.varName) {
                attr = poi;
                attr = attr.attributeInfo;
            }
            if ((poi &&
                poi.name === cellData.varName &&
                poi.isAffected(cellData.data[0])) ||
                (primary && primary.name === cellData.varName)) {
                return attr.color;
            }
        });
    };
    /**
     *
     * This function renders the content of String Cells in the Table View.
     *
     * @param element d3 selection of the current cell element.
     * @param cellData the data bound to the cell element being passed in.
     */
    AttributeTable.prototype.renderStringCell = function (element, cellData) {
        //Check for custom column width value, if none, use default
        var colWidth = this.customColWidths[cellData.name] || this.colWidths[cellData.type];
        // const colWidth = this.colWidths[cellData.type];
        var rowHeight = this.rowHeight;
        var numValues = cellData.data.reduce(function (a, v) { return (v ? a + 1 : a); }, 0);
        if (numValues === 0) {
            return;
        }
        if (element.selectAll('.string').size() === 0) {
            element.append('text').classed('string', true);
        }
        var textLabel;
        var numChar = colWidth / 8;
        if (cellData.data.length === 0 || cellData.data[0] === undefined) {
            textLabel = '';
        }
        else {
            textLabel = cellData.data[0]
                .toString()
                .toLowerCase()
                .slice(0, numChar);
            if (cellData.data[0].length > numChar) {
                textLabel = textLabel.concat(['...']);
            }
            if (numValues > 1) {
                //aggregate Row
                textLabel = '...';
            }
        }
        element
            .select('.string')
            .text(textLabel)
            .attr('dy', rowHeight * 0.9)
            .style('stroke', 'none');
        //set Hover to show entire text
        // element
        //   .on('mouseover', () => this.addTooltip('cell', cellData))
        //   .on('mouseout', () => select('#tooltipMenu').select('.menu').remove());
        // .on('mouseover', function (d) {
        //   select(this).select('.string')
        //     .text(() => {
        //       if (d.data.length === 1) {
        //         return d.data[0].toLowerCase();
        //       } else {
        //         return 'Multiple';
        //       }
        //     });
        // })
        // .on('mouseout', function (d) {
        //   let textLabel = cellData.data[0].toLowerCase().slice(0, 12);
        //   if (cellData.data[0].length > 12) {
        //     textLabel = textLabel.concat(['...']);
        //   }
        //   if (numValues > 1) { //aggregate Row
        //     textLabel = '...';
        //   }
        //   select(this).select('.string').text(textLabel);
        // });
    };
    /**
     *
     * This function renders the content of ID Cells in the Table View.
     *
     * @param element d3 selection of the current cell element.
     * @param cellData the data bound to the cell element being passed in.
     */
    AttributeTable.prototype.renderIdCell = function (element, cellData) {
        //Check for custom column width value, if none, use default
        var colWidth = this.customColWidths[cellData.name] || this.colWidths[cellData.type];
        // const colWidth = this.colWidths[cellData.type];
        var rowHeight = this.rowHeight;
        this.idScale.range([0, colWidth * 0.6]);
        var numValues = cellData.data.reduce(function (a, v) { return (v ? a + 1 : a); }, 0);
        var equalValues = cellData.data.reduce(function (a, b) {
            return a === b ? a : NaN;
        }); //check for array that has all equal values in an aggregate (such as KindredId)
        if (numValues === 0) {
            return;
        }
        if (numValues > 1 && element.select('.idBar').size() === 0) {
            element.append('rect').classed('idBar', true);
        }
        if (numValues === 1) {
            element.select('rect').remove();
        }
        if (element.selectAll('.string').size() === 0) {
            element.append('text').classed('string', true);
        }
        var textLabel;
        if (numValues === 1 || !isNaN(equalValues)) {
            textLabel = '#' + cellData.data[0];
            element
                .select('.string')
                .text(textLabel)
                .attr('dy', rowHeight * 0.9)
                .attr('dx', 0)
                .style('stroke', 'none');
        }
        else {
            element
                .select('.string')
                .text('...')
                // .style('font-style', 'bold')
                .attr('dy', rowHeight * 0.9)
                // .attr('dx', this.idScale(numValues) + 2)
                .style('stroke', 'none');
        }
        // element.selectAll('text')
        //   .attr('dx', col_width/2)
        //   .attr('text-anchor','middle')
    };
    AttributeTable.prototype.slopeChart = function (d) {
        var _this = this;
        var slopeWidth = d.width;
        var nx = slopeWidth * 0.2;
        var width = slopeWidth;
        var startingX = this.colWidths.dataDensity + this.buffer + this.colWidths.dataDensity;
        var linedata = [
            {
                x: startingX,
                y: this.y(d.y) + this.rowHeight / 2
            },
            {
                x: startingX + nx,
                y: this.y(d.y) + this.rowHeight / 2
            },
            {
                x: width - nx,
                y: this.y(this.rowOrder[d.ind]) + this.rowHeight / 2
            },
            {
                x: width,
                y: this.y(this.rowOrder[d.ind]) + this.rowHeight / 2
            }
        ];
        var divHeight = document.getElementById('graphDiv').clientHeight;
        var scrollOffset = document.getElementById('graphDiv').scrollTop;
        var start = this.y(d.y);
        var end = this.y(this.rowOrder[d.ind]);
        var highlightedRow = selectAll('.highlightBar')
            .filter('.selected')
            .filter(function (bar) {
            return (bar.y === d.y ||
                (_this.sortedRowOrder && bar.i === _this.sortedRowOrder[d.ind]));
        });
        if ((highlightedRow.empty() && start < scrollOffset) ||
            start > divHeight + scrollOffset ||
            end < scrollOffset ||
            end > divHeight + scrollOffset) {
            return '';
        }
        else {
            return this.lineFunction(linedata);
        }
    };
    AttributeTable.prototype.attachListener = function () {
        var _this = this;
        var self = this;
        events.on('poiSelected', function (evt, info) {
            _this.tableManager.setAffectedState(info.name, info.callback);
        });
        events.on('primarySelected', function (evt, item) {
            // const attribute = this.tableManager[item.primary_secondary + 'Attribute'];
            // //A primary or secondary attribute had been previously defined
            // if (attribute) {
            //   //Clear previously colored histogram for primary/secondary
            //   const previousHist = this.histograms.filter((h) => {
            //     return h.attrName === attribute.name;
            //   });
            //   if (previousHist.length > 0) {
            //     previousHist[0].clearPrimarySecondary();
            //   }
            // }
            // const otherAttributePrimarySecondary = ['primary', 'secondary'].filter((a) => { return a !== item.primary_secondary; });
            // const otherAttribute = this.tableManager[otherAttributePrimarySecondary + 'Attribute'];
            // //If the attribute you are setting as secondary is the same as the one you had as primary, (or vice versa) set the primary (secondary) to undefined;
            // if (otherAttribute && item.name === otherAttribute.name) {
            //   this.tableManager[otherAttributePrimarySecondary + 'Attribute'] = undefined;
            // }
            _this.tableManager.setPrimaryAttribute(item.name);
            // .then((obj) => {
            //   // const hist = this.histograms.filter((h) => { return h.attrName === item.name; })[0];
            //   // hist.setPrimarySecondary(obj);
            // });
        });
        events.on(TABLE_VIS_ROWS_CHANGED_EVENT, function () {
            self.update();
        });
        events.on(PRIMARY_SELECTED, function (evt, item) {
            self.render();
        });
        events.on(POI_SELECTED, function (evt, item) {
            self.render();
        });
        events.on(COL_ORDER_CHANGED_EVENT, function (evt, item) {
            self.update();
        });
        events.on(HIGHLIGHT_BY_ID, function (evt, item) {
            self.highlightRowByID(item);
        });
        events.on(CLEAR_TABLE_HIGHLIGHT, function () {
            self.clearHighlight();
        });
        events.on(FAMILY_SELECTED_EVENT, function () {
            self.SHOWING_RANKED = false;
        });
    };
    return AttributeTable;
}());
/**
 * Factory method to create a new instance of the Table
 * @param parent
 * @param options
 * @returns {attributeTable}
 */
export function create(parent) {
    return new AttributeTable(parent);
}
//# sourceMappingURL=attributeTable.js.map