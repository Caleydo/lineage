import * as tslib_1 from "tslib";
import { select, selectAll, event } from 'd3-selection';
import { scaleLinear, scaleBand } from 'd3-scale';
import { max, min } from 'd3-array';
import { axisTop, axisBottom } from 'd3-axis';
import { VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT, VALUE_TYPE_REAL } from 'phovea_core/src/datatype';
import * as events from 'phovea_core/src/event';
import { transition } from 'd3-transition';
import { easeLinear } from 'd3-ease';
import { format } from 'd3-format';
import { brushX, brushSelection } from 'd3-brush';
import { isNull } from 'util';
import { isNullOrUndefined } from 'util';
var Histogram = /** @class */ (function () {
    function Histogram(parent) {
        //settings
        this.margin = { top: 40, right: 30, bottom: 5, left: 65 };
        // categories specified in the data desc
        this.categories = [];
        this.node = parent;
    }
    /**
     * initalize the histogram and return a promise
     * that is resolved as soon the view is completely initialized
     */
    Histogram.prototype.init = function (name, dataVec, type, width, height) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.attrName = name;
                        this.dataVec = dataVec;
                        this.type = type;
                        this.categories = dataVec.desc.value.categories;
                        _a = this;
                        return [4 /*yield*/, this.dataVec.data()];
                    case 1:
                        _a.data = _b.sent();
                        this.xScale = scaleLinear()
                            .range([0, this.width])
                            .domain([0, 1]);
                        this.yScale = scaleLinear()
                            .range([0, this.height])
                            .domain([0, 1]);
                        this.update(dataVec);
                        this.width = width;
                        this.height = height;
                        // this.attachListener();
                        //return the promise
                        return [2 /*return*/, Promise.resolve(this)];
                }
            });
        });
    };
    Histogram.prototype.update = function (dataVec) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.type === VALUE_TYPE_CATEGORICAL)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.renderCategoricalHistogram(dataVec)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        if (!(this.type === VALUE_TYPE_INT || this.type === VALUE_TYPE_REAL)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.renderNumHistogram(dataVec)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Removes all interaction from the  histogram. (brushes and selecting bars)
     */
    Histogram.prototype.clearInteraction = function () {
        this.removeBrush();
        this.removeCategorySelection();
    };
    /**
     * Adds ability to hover and click to select histogram bars.
     */
    Histogram.prototype.addCategorySelection = function () {
        var attrName = this.attrName;
        this.node.selectAll('.catBar').on('click', function (d) {
            if (select(this).classed('picked')) {
                select(this).classed('picked', false);
                events.fire('poi_selected', {
                    name: attrName,
                    callback: function (attr) {
                        return false;
                    }
                }); //if a bar is unclicked affected State is false for all
            }
            else {
                selectAll('.picked').classed('picked', false);
                select(this).classed('picked', true);
            }
            events.fire('poi_selected', {
                name: attrName,
                callback: function (attr) {
                    return attr.toLowerCase() === d.key.toLowerCase();
                }
            });
        });
    };
    /**
     * Set categorical bar as selected.
     */
    Histogram.prototype.setSelected = function (category) {
        if (this.type !== VALUE_TYPE_CATEGORICAL) {
            return;
        }
        //Bars are not clickable
        if (isNullOrUndefined(this.node.select('.catBar').on('click'))) {
            this.addCategorySelection();
        }
        this.node.selectAll('.catBar').attr('fill', '#5f6262');
        //select right bar and set classed to picked.
        this.node
            .selectAll('.catBar')
            .filter(function (bar) {
            return bar.key.toLowerCase() === category.toLowerCase();
        })
            .classed('picked', true);
    };
    /**
     * Set categorical bar as primary or secondary.
     */
    Histogram.prototype.setPrimarySecondary = function (attributeObj) {
        var _this = this;
        //Only need to set colors for categorical type
        if (this.type === VALUE_TYPE_INT || this.type === VALUE_TYPE_REAL) {
            this.node.selectAll('.numBar').attr('fill', attributeObj.color);
        }
        if (this.type === VALUE_TYPE_CATEGORICAL) {
            //Color Bars appropriately.
            attributeObj.categories.forEach(function (category, i) {
                _this.node
                    .selectAll('.catBar')
                    .filter(function (bar) {
                    return bar.key === category;
                })
                    .attr('fill', attributeObj.color[i]);
            });
        }
    };
    /**
     * Clear coloring for categorical bar as primary or secondary.
     */
    Histogram.prototype.clearPrimarySecondary = function () {
        //Only need to set colors for categorical type
        if (this.type === VALUE_TYPE_INT || this.type === VALUE_TYPE_REAL) {
            this.node.selectAll('.numBar').attr('fill', '#5f6262');
        }
        if (this.type === VALUE_TYPE_CATEGORICAL) {
            //Set Bars back to original color.
            this.node.selectAll('.catBar').attr('fill', '#5f6262');
        }
    };
    /**
     * Remove ability to select categories.
     */
    Histogram.prototype.removeCategorySelection = function () {
        this.node.selectAll('.catBar').classed('picked', false);
        this.node.selectAll('.catBar').on('click', null);
    };
    /**
     * Adds a brush to this histogram.
     */
    Histogram.prototype.addBrush = function () {
        var attrName = this.attrName;
        var element = this.node;
        var xScale = this.xScale;
        var topAxis = element
            .select('g')
            .append('g')
            .attr('class', 'axis brushAxis')
            // .attr('transform', 'translate(0,-20)')
            .classed('hist_xscale', true)
            .attr('id', 'brushScale');
        // .attr('transform', 'translate(0,' + this.height + ')');
        // element.select('#brushScale')
        // .call(axisBottom(xScale))
        // .ticks(0);
        // .call(axisTop(xScale)
        //   .ticks(0));
        var brushGroup = element
            .select('.barContainer')
            .append('g')
            .attr('class', 'brush');
        var brush = brushX()
            .extent([[0, 0], [this.width, this.height]])
            .handleSize(4)
            .on('brush', brushed)
            .on('end', fireEvent);
        brushGroup.call(brush).call(brush.move, xScale.range());
        this.brush = brush; //save as class variable since we will need to modify it later when user clicks on POI
        function brushed() {
            var extent = brushSelection(brushGroup.node());
            var lowerBound = xScale.invert(extent[0]);
            var upperBound = xScale.invert(extent[1]);
            var domain = xScale.domain();
            // let allTicks = Array.from(new Set([lowerBound,upperBound].concat(domain)));
            var allTicks = [];
            if (lowerBound !== domain[0] || upperBound !== domain[1]) {
                allTicks = [lowerBound, upperBound];
            }
            //Create a tick mark at the edges of the brush
            topAxis.call(axisTop(xScale)
                .tickSize(0)
                .tickValues(allTicks)
                .tickFormat(format('.0f')));
        }
        function fireEvent() {
            var extent = brushSelection(brushGroup.node());
            if (isNull(extent)) {
                //user cleared brush entirely
                topAxis.call(axisTop(xScale).ticks(0));
                if (!isNull(event.sourceEvent)) {
                    //user cleared brush, nobody is 'affected'
                    events.fire('poiSelected', {
                        name: attrName,
                        callback: function (attr) {
                            return false;
                        }
                    });
                }
            }
            else {
                if (!isNull(event.sourceEvent)) {
                    events.fire('poiSelected', {
                        name: attrName,
                        callback: function (attr) {
                            return (attr >= xScale.invert(extent[0]) &&
                                attr <= xScale.invert(extent[1]));
                        }
                    });
                }
            }
        }
    };
    /**
     * Sets the brush extent for this histogram.
     */
    Histogram.prototype.setBrush = function (threshold) {
        if (!this.brush) {
            //no brush exists. define default
            this.addBrush();
            this.node
                .select('.brush')
                .call(this.brush.move, [
                this.xScale(threshold),
                this.xScale.range()[1]
            ]);
        }
    };
    /**
     * Removes the brush from this histogram
     */
    Histogram.prototype.removeBrush = function () {
        this.node.select('.brush').remove();
        this.node.select('.brushAxis').remove();
        this.brush = undefined;
    };
    /**
     * This function renders the histogram for categorical attribute in the attribute panel
     *
     */
    Histogram.prototype.renderCategoricalHistogram = function (dataVec) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var currentHist, categoricalDataVec, numElements, histData, catData, t, xScale, yScale, bandwidth, element, bars, barsEnter;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentHist = this.node;
                        categoricalDataVec = dataVec;
                        numElements = categoricalDataVec.length;
                        return [4 /*yield*/, categoricalDataVec.hist()];
                    case 1:
                        histData = _a.sent();
                        catData = [];
                        histData.forEach(function (d, i) {
                            catData.push({ key: histData.categories[i], value: d });
                        });
                        t = transition('t')
                            .duration(500)
                            .ease(easeLinear);
                        xScale = scaleBand();
                        yScale = scaleLinear();
                        //scales
                        xScale
                            .rangeRound([0, this.width])
                            .padding(0.2)
                            .domain(catData.map(function (d) {
                            return d.key;
                        }));
                        yScale.rangeRound([this.height, 0]).domain([
                            0,
                            max(catData, function (d) {
                                return d.value;
                            })
                        ]);
                        bandwidth = min([xScale.bandwidth(), 40]);
                        if (currentHist.selectAll('.svg-g').size() === 0) {
                            currentHist.append('g').attr('class', 'svg-g');
                            element = currentHist.selectAll('.svg-g');
                            element
                                .append('g')
                                .attr('class', 'axis axis--x')
                                .call(axisBottom(xScale).tickFormat(function (d) {
                                return d[0];
                            }));
                            element.append('g').classed('barContainer', true);
                        }
                        bars = currentHist
                            .select('.barContainer')
                            .selectAll('.catBar')
                            .data(catData);
                        barsEnter = bars
                            .enter()
                            .append('rect')
                            .classed('catBar', true)
                            .classed('bar', true)
                            .attr('fill', '#5f6262');
                        bars = barsEnter.merge(bars);
                        bars.exit().remove();
                        bars
                            .attr('x', function (d) {
                            return xScale(d.key) + (xScale.bandwidth() - bandwidth) / 2; //potential offset created from making bars skinnier
                        })
                            .attr('y', function (d) {
                            return yScale(d.value);
                        })
                            .attr('width', bandwidth)
                            .attr('height', function (d) {
                            return _this.height - yScale(d.value);
                        })
                            .attr('attribute', this.attrName);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * This function renders the histogram for numerical attribute in the attribute panel
     *
     */
    Histogram.prototype.renderNumHistogram = function (dataVec) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var histData, range, data, cols, total, binWidth, acc, bin2value, xScale, yScale, currentHist, element, totalLabel, bars, barsEnter;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, dataVec.hist(10)];
                    case 1:
                        histData = _a.sent();
                        range = [0, this.width];
                        data = [], cols = scaleLinear()
                            .domain([, 0])
                            .range(['#111111', '#999999']), total = histData.validCount, binWidth = (range[1] - range[0]) / histData.bins;
                        acc = 0;
                        histData.forEach(function (b, i) {
                            data[i] = {
                                v: b,
                                acc: acc,
                                ratio: b / total,
                                valueRange: histData.valueRange,
                                name: 'Bin ' +
                                    (i + 1) +
                                    ' (center: ' +
                                    Math.round((i + 0.5) * binWidth) +
                                    ')',
                                binIndex: i,
                                // color: cols((i + 0.5) * binWidth);
                                color: cols(b)
                            };
                            acc += b;
                        });
                        bin2value = scaleLinear()
                            .range(histData.valueRange)
                            .domain([0, histData.bins]);
                        xScale = scaleLinear()
                            .range([0, this.width])
                            .domain(histData.valueRange)
                            .nice();
                        yScale = scaleLinear()
                            .range([0, this.height * 0.8])
                            .domain([
                            0,
                            max(data, function (d) {
                                return d.v;
                            })
                        ]);
                        this.xScale = xScale;
                        this.yScale = yScale;
                        currentHist = this.node;
                        if (currentHist.select('.elementGroup').size() === 0) {
                            element = currentHist.append('g').classed('elementGroup', true);
                            element.append('text').classed('maxValue', true);
                            //Axis Group
                            element
                                .append('g')
                                .attr('class', 'axis axis--x')
                                .classed('hist_xscale', true)
                                .attr('id', 'histAxis')
                                .attr('transform', 'translate(0,' + this.height + ')');
                            element.append('g').attr('class', 'barContainer');
                        }
                        this.node.select('#histAxis').call(axisBottom(xScale)
                            .tickSize(5)
                            .tickValues(xScale.domain())
                            .tickFormat(format('.0f')));
                        //Position tick labels to be 'inside' the axis bounds. avoid overlap
                        this.node
                            .select('.hist_xscale')
                            .selectAll('.tick')
                            .each(function (cell) {
                            var xtranslate = +select(this)
                                .attr('transform')
                                .split('translate(')[1]
                                .split(',')[0];
                            if (xtranslate === 0) {
                                //first label in the axis
                                select(this)
                                    .select('text')
                                    .style('text-anchor', 'start');
                            }
                            else {
                                //last label in the axis
                                select(this)
                                    .select('text')
                                    .style('text-anchor', 'end');
                            }
                        });
                        totalLabel = data[data.length - 1].acc + data[data.length - 1].v;
                        bars = currentHist
                            .select('.barContainer')
                            .selectAll('.numBar')
                            .data(data);
                        barsEnter = bars
                            .enter()
                            .append('rect')
                            .classed('numBar', true)
                            .classed('bar', true)
                            .attr('fill', '#5f6262');
                        bars = barsEnter.merge(bars);
                        bars.exit().remove();
                        bars
                            .attr('width', binWidth * 0.8)
                            .attr('height', function (d) {
                            return yScale(d.v);
                        })
                            .attr('y', function (d) {
                            return _this.height - yScale(d.v);
                        })
                            .attr('x', function (d, i) {
                            return xScale(bin2value(i));
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    return Histogram;
}());
export default Histogram;
/**
 * Factory method to create a new instance of the histogram
 * @param parent
 * @param options
 * @returns {Histogram}
 */
export function create(parent) {
    return new Histogram(parent);
}
//# sourceMappingURL=Histogram.js.map