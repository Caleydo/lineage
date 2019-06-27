import * as tslib_1 from "tslib";
/**
 * Created by Holger Stitz on 19.12.2016.
 */
import * as events from 'phovea_core/src/event';
// import * as d3 from 'd3';
import icon from '!raw-loader!./treeLegend.svg';
import { select, selectAll, mouse, event } from 'd3-selection';
import { scaleLinear, scalePow } from 'd3-scale';
import { max, min, ticks, range } from 'd3-array';
import { axisTop, } from 'd3-axis';
import { format } from 'd3-format';
import { line } from 'd3-shape';
import { curveBasis, curveLinear } from 'd3-shape';
import { Config } from './config';
// import{
//   legendSymbol,
//   legendColor
// } from 'd3-svg-legend';
import { PRIMARY_SELECTED, POI_SELECTED, TABLE_VIS_ROWS_CHANGED_EVENT, HIDE_FAMILY_TREE } from './tableManager';
import { VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT, VALUE_TYPE_REAL } from 'phovea_core/src/datatype';
import { Sex } from './Node';
import { layoutState } from './Node';
import { isUndefined } from 'util';
// import legend from './treeLegend.svg'
export var CURRENT_YEAR = 2017;
/**
 * The visualization showing the genealogy graph
 */
var GenealogyTree = /** @class */ (function () {
    function GenealogyTree(parent) {
        var _this = this;
        this.margin = Config.margin;
        //Time scale for visible nodes
        this.x = scalePow().exponent(10);
        //Time scale for nodes outside the viewport
        this.x2 = scalePow().exponent(10);
        this.y = scaleLinear();
        this.attributeBarY = scaleLinear().range([0, Config.glyphSize * 2]);
        this.kidGridSize = 4;
        //Scale to place siblings on kid grid
        this.kidGridXScale = scaleLinear().domain([1, this.kidGridSize]).range([0, Config.glyphSize * 2]);
        this.kidGridYScale = scaleLinear()
            .domain([1, this.kidGridSize / 2])
            .range([-Config.hiddenGlyphSize / 3, Config.hiddenGlyphSize]);
        this.parentGridScale = scaleLinear()
            .domain([1, 8])
            .range([0, Config.glyphSize * 8]);
        this.interGenerationScale = scaleLinear();
        // private t = transition('t').duration(500).ease(easeLinear); //transition
        this.colors = ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00'];
        //     private colorScale = scaleLinear().domain([1,2,3,4,5,6,7,8]).range(this.colors)
        //Data attributes to draw hexagons for aggregate rows
        this.hexSize = Config.glyphSize * 1.25;
        this.hexData = [{ x: this.hexSize, y: 0 },
            { x: this.hexSize / 2, y: this.hexSize * Math.sqrt(3) / 2 },
            { x: -this.hexSize / 2, y: this.hexSize * Math.sqrt(3) / 2 },
            { x: -this.hexSize, y: 0 },
            { x: -this.hexSize / 2, y: -this.hexSize * Math.sqrt(3) / 2 },
            { x: this.hexSize / 2, y: -this.hexSize * Math.sqrt(3) / 2 },
            { x: this.hexSize, y: 0 }];
        this.hexLine = line()
            .x(function (d) {
            return d.x;
        })
            .y(function (d) {
            return d.y;
        });
        this.lineFunction = line()
            .x(function (d) {
            return _this.x(d.x);
        }).y(function (d) {
            return _this.y(d.y);
        })
            .curve(curveBasis);
        this.slopeLineFunction = line()
            .x(function (d) {
            return d.x;
        }).y(function (d) {
            return d.y;
        })
            .curve(curveBasis);
        this.colorScale = ['#969696', '#9e9ac8', '#74c476', '#fd8d3c', '#9ecae1'];
        this.$node = select(parent);
        this.self = this;
    }
    /**
     * Initialize the view and return a promise
     * that is resolved as soon the view is completely initialized.
     * @returns {Promise<genealogyTree>}
     */
    GenealogyTree.prototype.init = function (data, tableManager) {
        this.data = data;
        this.tableManager = tableManager;
        this.build();
        // this.update();
        this.attachListeners();
        // return the promise directly as long there is no dynamical data to update
        return Promise.resolve(this);
    };
    /**
     * Updates the view when the input data changes
     */
    GenealogyTree.prototype.update = function () {
        //Filter data to only render what is visible in the current window
        this.update_time_axis();
        //Call function that updates the position of all elements in the tree
        this.update_graph();
    };
    /**
     * Build the basic DOM elements and binds the change function
     */
    GenealogyTree.prototype.build = function () {
        var _this = this;
        this.width = 550;
        this.visibleXAxis = axisTop(this.x).tickFormat(format('d'));
        this.extremesXAxis = axisTop(this.x2);
        select('#col2')
            .style('width', (this.width + Config.collapseSlopeChartWidth) + 'px');
        var dropdownMenu = select('.navbar-collapse')
            .append('ul').attr('class', 'nav navbar-nav navbar-left').attr('id', 'treeLayoutMenu');
        var list = dropdownMenu.append('li').attr('class', 'dropdown');
        list
            .append('a')
            .attr('class', 'dropdown-toggle')
            .attr('data-toggle', 'dropdown')
            .attr('role', 'button')
            .html('Tree Layout')
            .append('span')
            .attr('class', 'caret');
        var menu = list.append('ul').attr('class', 'dropdown-menu');
        var menuItems = menu.selectAll('.demoAttr')
            .data(['Aggregate', 'Hide', 'Expand']);
        menuItems = menuItems.enter()
            .append('li')
            .append('a')
            .attr('class', 'layoutMenu')
            .classed('active', function (d) { return d === 'Expand'; })
            .html(function (d) { return d; })
            .merge(menuItems);
        menuItems.on('click', function (d) {
            var currSelection = selectAll('.layoutMenu').filter(function (e) { return e === d; });
            // if (currSelection.classed('active')) {
            //   return;
            // }
            selectAll('.layoutMenu').classed('active', false);
            currSelection.classed('active', true);
            if (d === 'Aggregate') {
                selectAll('.slopeLine').classed('clickedSlope', false);
                selectAll('.highlightBar').classed('selected', false);
                _this.data.aggregateTreeWrapper(undefined, layoutState.Aggregated);
            }
            else if (d === 'Hide') {
                selectAll('.slopeLine').classed('clickedSlope', false);
                selectAll('.highlightBar').classed('selected', false);
                _this.data.aggregateTreeWrapper(undefined, layoutState.Hidden);
            }
            else {
                selectAll('.slopeLine').classed('clickedSlope', false);
                selectAll('.highlightBar').classed('selected', false);
                _this.data.aggregateTreeWrapper(undefined, layoutState.Expanded);
            }
        });
        // this.$node.append('nav').attr('class', 'navbar navbar-expand-lg navbar-light bg-light')
        //   .append('div').attr('id', 'tableNav');
        // this.$node.select('#tableNav')
        //   .append('a').attr('class', 'navbar-brand')
        //   .html('Genealogy Tree');
        var buttonMenu = select('.navbar-collapse')
            .append('ul').attr('class', 'nav navbar-nav navbar-left');
        buttonMenu
            .append('li')
            .append('a')
            .attr('class', 'btn-link')
            .attr('role', 'button')
            .attr('id', 'LegendPersonView')
            .html('View Person Details')
            .on('click', function (d) {
            var text = select('#LegendPersonView').html();
            if (text === 'View Legend') {
                select('#personView').style('display', 'none');
                select('#legendSVG').style('display', 'inherit');
                select('#LegendPersonView').html('View Person Details');
            }
            else {
                select('#personView').style('display', 'inherit');
                select('#legendSVG').style('display', 'none');
                select('#LegendPersonView').html('View Legend');
            }
        });
        var headerDiv = this.$node.append('div').attr('id', 'graphHeaders');
        //Add svg legend
        headerDiv.append('g')
            .style('display', 'inherit')
            .attr('id', 'legendSVG')
            .html(String(icon));
        headerDiv.append('g').append('svg')
            .style('display', 'none')
            .attr('id', 'personView')
            .attr('width', this.width + Config.collapseSlopeChartWidth)
            .attr('height', 120);
        select('#personView')
            .append('rect')
            .attr('width', this.width + Config.collapseSlopeChartWidth)
            .attr('height', 30)
            .attr('fill', 'white')
            .attr('opacity', .5);
        select('#personView')
            .append('rect')
            .attr('width', this.width + Config.collapseSlopeChartWidth)
            .attr('height', 60)
            .attr('fill', 'white')
            .attr('opacity', .5);
        select('#personView')
            .append('text')
            .classed('personViewStaticLabel', true)
            .attr('x', 10)
            .attr('y', 20)
            .text('RelativeID: ')
            .style('font-weight', 'bolder');
        select('#personView')
            .append('text')
            .style('font-weight', 'bolder')
            .attr('x', 80)
            .attr('y', 20)
            .attr('id', 'person')
            .classed('personViewLabel', true);
        select('#personView')
            .append('text')
            .classed('personViewStaticLabel', true)
            .attr('x', 10)
            .attr('y', 50)
            .text('Family ID(s): ');
        select('#personView')
            .append('g')
            .attr('transform', 'translate(' + 90 + ',' + 50 + ')')
            .attr('id', 'kindredLabel')
            .classed('personViewLabel', true);
        select('#personView')
            .append('text')
            .classed('personViewStaticLabel', true)
            .attr('x', 150)
            .attr('y', 20)
            .text('MotherID: ');
        select('#personView')
            .append('text')
            .attr('x', 210)
            .attr('y', 20)
            .attr('id', 'motherLabel')
            .classed('personViewLabel', true);
        select('#personView')
            .append('text')
            .classed('personViewStaticLabel', true)
            .attr('x', 280)
            .attr('y', 20)
            .text('FatherID: ');
        select('#personView')
            .append('text')
            .attr('x', 335)
            .attr('y', 20)
            .attr('id', 'fatherLabel')
            .classed('personViewLabel', true);
        select('#personView')
            .append('text')
            .classed('personViewStaticLabel', true)
            .attr('x', 10)
            .attr('y', 80)
            .text('Spouse(s): ');
        select('#personView')
            .append('g')
            .attr('id', 'spouseLabels')
            .classed('personViewLabel', true)
            .attr('transform', 'translate(' + 80 + ',' + 80 + ')');
        select('#personView')
            .append('text')
            .classed('personViewStaticLabel', true)
            .attr('x', 10)
            .attr('y', 110)
            .text('Child(ren): ');
        select('#personView')
            .append('g')
            .attr('id', 'childrenLabels')
            .classed('personViewLabel', true)
            .attr('transform', 'translate(' + 80 + ',' + 110 + ')');
        headerDiv.append('svg')
            .attr('width', this.width)
            .attr('height', 170)
            .attr('id', 'headers');
        var svg = this.$node
            .append('div')
            .attr('id', 'graphDiv')
            .append('svg')
            .attr('id', 'graph')
            .on('click', function () {
            select('#treeMenu').select('.menu').remove();
            selectAll('.edges').classed('selected', false);
            selectAll('.parentEdges').classed('selected', false);
            selectAll('.clicked').classed('clicked', false);
        });
        //Add scroll listener for the graph table div
        document.getElementById('graph').addEventListener('scroll', function () {
            _this.update_time_axis();
            /* clear the old timeout */
            clearTimeout(_this.timer);
            /* wait until 100 ms for callback */
            _this.timer = setTimeout(function () {
                _this.update_graph();
            }, 100);
        });
        //Create group for genealogy tree
        svg.append('g')
            .attr('transform', 'translate(' + this.margin.left + ',' + (Config.glyphSize + this.margin.top) + ')')
            .attr('id', 'genealogyTree');
        //Create group for slope chart
        svg.append('g')
            .attr('transform', 'translate(' + this.width + ',' + this.margin.top + ')')
            .attr('id', 'slopeChart');
        select('#slopeChart').append('g')
            .attr('id', 'firstCol');
        select('#slopeChart').append('g')
            .attr('id', 'slopeLines');
        //Ensure the right order of all the elements by creating seprate groups
        //create a group in the background for edges
        select('#genealogyTree')
            .append('g')
            .attr('id', 'familyBars');
        //create a group in the background for edges
        select('#genealogyTree')
            .append('g')
            .attr('id', 'edges');
        //create a group for highlight bars
        select('#genealogyTree')
            .append('g')
            .attr('id', 'allBars');
        //create a group for highlight bars of hidden nodes
        select('#allBars')
            .append('g')
            .attr('id', 'hiddenHighlightBars');
        //create a group for highlight bars of non hidden nodes
        select('#allBars')
            .append('g')
            .attr('id', 'highlightBars');
        //create a group in the foreground for nodes
        select('#genealogyTree')
            .append('g')
            .attr('id', 'nodes');
        //create a group in the fore-foreground for menus
        select('#genealogyTree')
            .append('g')
            .attr('id', 'menus');
        var button = select('#menus')
            .append('g')
            .attr('id', 'nodeActions')
            .attr('visibility', 'hidden');
        button.append('rect')
            .classed('nodeButton', true)
            .attr('id', 'menuOption1')
            .attr('y', -18);
        button.append('text')
            .classed('nodeButtonText', true)
            .attr('id', 'menuLabel1')
            .attr('y', -8)
            .attr('x', 5);
        button.append('rect')
            .classed('nodeButton', true)
            .attr('id', 'menuOption2')
            .attr('y', 0);
        button.append('text')
            .classed('nodeButtonText', true)
            .attr('id', 'menuLabel2')
            .attr('y', 10)
            .attr('x', 5);
        selectAll('.nodeButtonText')
            .attr('text-anchor', 'start')
            .attr('fill', 'white')
            .attr('font-size', 12);
        selectAll('.nodeButton')
            .attr('width', 60)
            .attr('height', 15)
            .attr('fill', '#393837')
            .attr('opacity', .8)
            .attr('x', 0)
            .attr('rx', 2)
            .attr('ry', 10);
        //Create group for all time axis
        var axis = select('#headers').append('g')
            .attr('transform', 'translate(' + this.margin.left + ',30)')
            .attr('id', 'axis');
        //Create group for legend
        var legend = select('#headers').append('g')
            .attr('id', 'legend');
        axis.append('g')
            .attr('id', 'visible_axis')
            .call(this.visibleXAxis);
        axis.append('g')
            .attr('id', 'extremes_axis')
            .call(this.extremesXAxis);
    };
    //End of Build Function
    GenealogyTree.prototype.update_legend = function () {
        var legendIcons = select('#legendIcons').selectAll('.icons')
            .data([this.primaryAttribute, this.secondaryAttribute]);
        var legendIconsEnter = legendIcons.enter().append('rect').classed('icons', true);
        legendIcons = legendIconsEnter.merge(legendIcons);
        legendIcons.selectAll('.icons')
            .attr('width', 50)
            .attr('fill', 'white')
            .attr('height', Config.legendHeight * 0.65);
    };
    /**
     *
     * This function updates the genealogy tree by calling the update_edges
     * and update_nodes functions.
     *
     * @param nodes array of node to update the tree with
     * @param childParentEdges array of child parent edges to update the tree with
     * @param parentParentEdges array of parent parent edges to update the tree with
     */
    GenealogyTree.prototype.update_graph = function () {
        var nodes = this.data.nodes;
        var yrange = [min(nodes, function (d) {
                return Math.round(+d.y);
            }), max(nodes, function (d) {
                return Math.round(+d.y);
            })];
        this.height = Config.glyphSize * 4 * (yrange[1] - yrange[0] + 1); // - this.margin.top - this.margin.bottom;
        //  console.log(this.height)
        this.tableManager.tableHeight = this.height;
        this.y.range([0, this.height * .7]).domain(yrange);
        this.interGenerationScale.range([.75, .25]).domain([2, nodes.length]);
        this.$node.select('#graph')
            // .attr('viewBox','0 0 ' + this.width +  ' ' +  (this.height + this.margin.top + this.margin.bottom))
            // .attr('preserveAspectRatio','none');
            .attr('width', this.width + Config.slopeChartWidth)
            .attr('height', this.height);
        this.update_edges();
        this.update_nodes();
        this.addFamilyBars();
        // this.$node.select('#graph')
        // .attr('height',document.getElementById('genealogyTree').getBoundingClientRect().height);
    };
    GenealogyTree.prototype.addFamilyBars = function () {
        var _this = this;
        var self = this;
        var nodes = this.data.nodes;
        // const t = transition('t').duration(500).ease(easeLinear);
        //Separate groups for separate layers
        var familyBarsGroup = select('#genealogyTree').select('#familyBars');
        var familyDict = {};
        nodes.map(function (node) {
            if (familyDict[node.kindredID]) {
                familyDict[node.kindredID].push(node.y);
            }
            else {
                familyDict[node.kindredID] = [node.y];
            }
        });
        var familyArray = new Array();
        for (var key in familyDict) {
            if (familyDict.hasOwnProperty(key)) {
                //reduce indexes to sequence of continuous values.
                var sortedIndexes = familyDict[key].sort(function (a, b) { return (b - a); });
                var min_1 = sortedIndexes.reduce(function (accumulator, currentValue) {
                    return accumulator - currentValue <= 1 ? currentValue : accumulator;
                });
                familyArray.push({ 'id': key, 'min': min_1, 'max': max(familyDict[key]) });
            }
        }
        // // Attach node groups
        var allFamilyBars = familyBarsGroup.selectAll('.familyBar')
            .data(familyArray, function (d) {
            return d.id;
        });
        allFamilyBars.exit().remove();
        var allFamilyBarsEnter = allFamilyBars
            .enter()
            .append('line')
            .classed('familyBar', true);
        allFamilyBars = allFamilyBarsEnter.merge(allFamilyBars);
        allFamilyBars
            // .attr('x1',-15)
            // .attr('x2',-15)
            // .attr('y1',(d)=> {return (this.y(d.min)-5);}) //add buffer between bars;
            // .attr('y2',(d)=> {return this.y(d.max);})
            .attr('x1', -30)
            .attr('x2', 500)
            .attr('y1', function (d) { return (_this.y(d.max) + Config.glyphSize); }) //add buffer between bars;
            .attr('y2', function (d) { return (_this.y(d.max) + Config.glyphSize); })
            .attr('opacity', .4);
        var allFamilyLabels = familyBarsGroup.selectAll('.familyLabel')
            .data(familyArray, function (d) {
            return d.id;
        });
        allFamilyLabels.exit().remove();
        var allFamilyLabelsEnter = allFamilyLabels
            .enter()
            .append('text')
            .classed('familyLabel', true);
        allFamilyLabels = allFamilyLabelsEnter.merge(allFamilyLabels);
        allFamilyLabels
            .attr('x', -20)
            .attr('y', function (d) { return _this.y(Math.round(d.max)); })
            .text(function (d) { return 'Family ' + d.id; })
            // .attr("font-family", "sans-serif")
            .attr('font-size', '20px')
            .attr('font-weight', 'bold')
            .attr('fill', '#4e4e4e')
            .attr('transform', function (d) { return 'rotate(-90,-20,' + _this.y(Math.round(d.max)) + ')'; })
            .attr('text-anchor', 'start');
    };
    /**
     *
     * This function updates the edges in the genealogy tree
     *
     * @param childParentEdges array of child parent edges to update the tree with
     * @param parentParentEdges array of parent parent edges to update the tree with
     */
    //Function that updates the position of all edges in the genealogy tree
    GenealogyTree.prototype.update_edges = function () {
        var _this = this;
        var childParentEdges = this.data.parentChildEdges;
        var parentParentEdges = this.data.parentParentEdges;
        // const t = transition('t').duration(500).ease(easeLinear);
        var edgeGroup = select('#genealogyTree').select('#edges');
        //Only draw parentedges if target node is not hidden
        var edgePaths = edgeGroup.selectAll('.edges')
            .data(childParentEdges.filter(function (d) {
            return (!(d.target.hidden && !d.target.hasChildren));
        }), function (d) {
            return d.id;
        });
        //remove extra paths
        edgePaths.exit().remove();
        var edgePathsEnter = edgePaths
            .enter()
            .append('path');
        edgePaths = edgePathsEnter.merge(edgePaths);
        edgePathsEnter.attr('opacity', 0);
        // edgePaths.attr('opacity',0)
        edgePaths
            .attr('class', 'edges')
            // .transition(t)
            .attr('d', function (d) {
            var maY = Math.round(d.ma.y);
            var paY = Math.round(d.pa.y);
            var nodeY = Math.round(d.target.y);
            if ((maY === nodeY) && (paY === nodeY)) {
                return _this.elbow(d, _this.interGenerationScale, _this.lineFunction, false);
            }
            else {
                return _this.elbow(d, _this.interGenerationScale, _this.lineFunction, true);
            }
        });
        edgePaths
            // .transition(t.transition().duration(1000).ease(easeLinear))
            // .transition('t')
            .attr('opacity', 1)
            .attr('stroke-width', Config.glyphSize / 5);
        var parentEdgePaths = edgeGroup.selectAll('.parentEdges') // only draw parent parent edges if neither parent is aggregated
            .data(parentParentEdges
            .filter(function (d) {
            return (!d.ma.hidden && !d.pa.hidden) || (!d.ma.affected && !d.pa.affected);
        }), function (d) {
            return d.id;
        });
        parentEdgePaths.exit().style('opacity', 0).remove();
        var parentEdgePathsEnter = parentEdgePaths
            .enter()
            .append('path');
        parentEdgePathsEnter.attr('opacity', 0);
        parentEdgePaths = parentEdgePathsEnter.merge(parentEdgePaths);
        parentEdgePaths
            .attr('class', 'parentEdges')
            .attr('stroke-width', Config.glyphSize / 5)
            .style('fill', 'none')
            // .transition(t)
            .attr('d', function (d) {
            return GenealogyTree.parentEdge(d, _this.lineFunction);
        });
        parentEdgePaths
            // .transition(t.transition().ease(easeLinear))
            .attr('opacity', 1);
    };
    GenealogyTree.prototype.addHightlightBars = function () {
        // const t = transition('t').duration(500).ease(easeLinear);
        var _this = this;
        var highlightBarGroup = select('#genealogyTree').select('#highlightBars');
        var yRange = [min(this.data.nodes, function (d) {
                return Math.round(d.y);
            }), max(this.data.nodes, function (d) {
                return Math.round(d.y);
            })];
        //Create data to bind to highlightBars
        var yData = [];
        var _loop_1 = function (i) {
            //find all nodes in this row
            var yNodes = this_1.data.nodes.filter(function (n) {
                return Math.round(n.y) === i;
            });
            // console.log(yNodes[0])
            // if (yNodes.length>0) {
            yData.push({
                y: i, x: min(yNodes, function (d) {
                    return d.x;
                }),
                id: yNodes[0].uniqueID
            });
            // }
        };
        var this_1 = this;
        for (var i = yRange[0]; i <= yRange[1]; i++) {
            _loop_1(i);
        }
        //Create data to bind to aggregateBars
        var aggregateBarData = [];
        var _loop_2 = function (i) {
            //find all nodes in this row
            var yNodes = this_2.data.nodes.filter(function (n) {
                return Math.round(n.y) === i && n.aggregated;
            });
            if (yNodes.length > 0) {
                aggregateBarData.push({
                    y: i, x: min(yNodes, function (d) {
                        return d.x;
                    })
                });
            }
        };
        var this_2 = this;
        for (var i = yRange[0]; i <= yRange[1]; i++) {
            _loop_2(i);
        }
        // Attach aggregateBars
        var aggregateBars = highlightBarGroup.selectAll('.aggregateBar')
            .data(aggregateBarData, function (d) { return d.y; });
        aggregateBars.exit().remove();
        var aggregateBarsEnter = aggregateBars
            .enter()
            .append('rect')
            .classed('aggregateBar', true)
            .attr('opacity', 0);
        aggregateBars = aggregateBarsEnter.merge(aggregateBars);
        aggregateBars
            // .transition(t)
            .attr('transform', function (row) {
            return 'translate(0,' + (_this.y(row.y) - Config.glyphSize * 1.25) + ')';
        })
            .attr('width', function (row) {
            return (max(_this.x.range()) - _this.x(row.x) + _this.margin.right);
        })
            .attr('x', function (row) {
            return _this.x(row.x);
        })
            .attr('height', Config.glyphSize * 2.5);
        aggregateBars
            // .transition(t.transition().duration(500).ease(easeLinear))
            .attr('opacity', 1);
        // Attach highlight Bars
        var allBars = highlightBarGroup.selectAll('.bars')
            .data(yData, function (d) { return d.id; });
        allBars.exit().remove();
        var allBarsEnter = allBars
            .enter()
            .append('g')
            .classed('bars', true);
        allBarsEnter
            .append('rect')
            .classed('backgroundBar', true);
        allBarsEnter
            .append('rect')
            .classed('highlightBar', true);
        allBars = allBarsEnter.merge(allBars);
        //Position all bars:
        allBars
            .attr('transform', function (row) {
            return 'translate(0,' + (_this.y(row.y) - Config.glyphSize) + ')';
        });
        allBars
            .select('.backgroundBar')
            .attr('width', function () {
            return (max(_this.x.range()) - min(_this.x.range()) + _this.margin.right);
        })
            .attr('height', Config.glyphSize * 2);
        allBars
            .select('.highlightBar')
            .attr('width', function (row) {
            return (max(_this.x.range()) - _this.x(row.x) + _this.margin.right);
        })
            .attr('x', function (row) {
            return _this.x(row.x);
        })
            .attr('height', Config.glyphSize * 2);
        //Set both the background bar and the highlight bar to opacity 0;
        selectAll('.bars')
            .selectAll('.backgroundBar')
            .attr('opacity', 0);
        selectAll('.bars')
            .selectAll('.highlightBar')
            .attr('opacity', 0);
        function highlightRows(d) {
            function selected(e) {
                var returnValue = false;
                //Highlight the current row in the graph and table
                if (e.y === Math.round(d.y)) {
                    returnValue = true;
                }
                return returnValue;
            }
            selectAll('.slopeLine').classed('selectedSlope', false);
            selectAll('.slopeLine').filter(function (e) {
                return e.y === Math.round(d.y);
            }).classed('selectedSlope', true);
            //Set opacity of corresponding highlightBar
            selectAll('.highlightBar').filter(selected).attr('opacity', .2);
            //Set the age label on the lifeLine of this row to visible
            selectAll('.ageLineGroup').filter(function (e) {
                return e.y === Math.round(d.y);
            }).filter(function (d) {
                return !d.aggregated && !d.hidden;
            }).select('.ageLabel').attr('visibility', 'visible');
            // selectAll('.duplicateLine').filter(selected).attr('visibility', 'visible');
        }
        function clearHighlights() {
            // selectAll('.duplicateLine').attr('visibility', 'hidden');
            selectAll('.slopeLine').classed('selectedSlope', false);
            //Hide all the highlightBars
            selectAll('.highlightBar').attr('opacity', 0);
            selectAll('.ageLabel').attr('visibility', 'hidden');
        }
        selectAll('.highlightBar')
            .on('mouseover', highlightRows)
            .on('mouseout', clearHighlights)
            .on('click', function (d, i) {
            if (event.defaultPrevented) {
                return;
            } // dragged
            var wasSelected = selectAll('.highlightBar').filter(function (e) {
                return e.y === d.y || e.y === Math.round(d.y);
            }).classed('selected');
            //'Unselect all other background bars if ctrl was not pressed
            if (!event.metaKey) {
                selectAll('.slopeLine').classed('clickedSlope', false);
                selectAll('.highlightBar').classed('selected', false);
            }
            selectAll('.slopeLine').filter(function (e) {
                return e.y === d.y || e.y === Math.round(d.y);
            }).classed('clickedSlope', function () {
                return (!wasSelected);
            });
            selectAll('.highlightBar').filter(function (e) {
                return e.y === d.y || e.y === Math.round(d.y);
            }).classed('selected', function () {
                return (!wasSelected);
            });
        });
        selectAll('.bars')
            .selectAll('.backgroundBar')
            .on('mouseover', highlightRows)
            .on('mouseout', clearHighlights);
    };
    //Function that returns the x and y position for the couples line and kid grid of a given family.
    GenealogyTree.prototype.getFamilyPos = function (n) {
        //Not a direct ancestor
        if (isUndefined(n.ma) && isUndefined(n.pa) && !n.aggregated) {
            return undefined;
        }
        // //no couples lines for affected person/couple
        // if (n.affected) {
        //   // console.log('returning undefined for node ', n.id);
        //   return undefined;
        // }
        // //no couples lines for affected person/couple
        // if ((n.affected || n.spouse.reduce(function (accumulator, currentValue) {
        //   return currentValue.affected || accumulator;
        // }, false))) {
        //   return undefined;
        // };
        // if (n.affected && !isUndefined(n.spouse.find((s: Node) => { return !s.aggregated && !s.affected; }))) {
        //   return undefined;
        // }
        //return undefined for couples without a kid grid
        if (n.hasChildren && n.children.reduce(function (accumulator, currentValue) {
            return (currentValue.hasChildren || currentValue.affected) && accumulator;
        }, true)) {
            return undefined;
        }
        var parents = [n].concat(n.spouse);
        if (isUndefined(parents.find(function (p) { return p.hidden; })) && isUndefined(n.children.find(function (p) { return p.hidden; }))) {
            return undefined;
        }
        //All parents are affected and they have at least one aggregated child
        if (isUndefined(parents.find(function (p) { return !p.affected; }))) {
            if (n.hasChildren && !isUndefined(n.children.find(function (child) { return !child.hasChildren && !child.affected; }))) {
                // return {'x':max(parents,(p:Node)=>{return p.x}), 'y':min(parents,(p:Node)=>{return p.y})-1};
                var girls = n.children.filter(function (child) { return child.sex === Sex.Female; });
                var boys = n.children.filter(function (child) { return child.sex === Sex.Male; });
                var maxKidGridRows = max([girls.length, boys.length]);
                return {
                    'x': n.children.find(function (c) { return !c.affected; }).x,
                    'y': Math.round(n.children.find(function (c) { return !c.affected; }).y),
                    'id': n.uniqueID,
                    'extend': true,
                    'kids': min([4, maxKidGridRows])
                };
            }
        }
        else { //There is at least one unaffected parent;
            var unaffectedParent = parents.find(function (p) { return !p.affected; });
            var affectedParent = parents.find(function (p) { return p.affected; });
            var girls = n.children.filter(function (child) { return child.sex === Sex.Female; });
            var boys = n.children.filter(function (child) { return child.sex === Sex.Male; });
            var maxKidGridRows = max([girls.length, boys.length]);
            if (unaffectedParent.hidden) {
                if (isUndefined(affectedParent) && unaffectedParent.aggregated) {
                    return {
                        'x': unaffectedParent.x, 'y': Math.round(unaffectedParent.y), 'id': n.uniqueID, 'extend': false,
                        'kids': min([4, maxKidGridRows])
                    };
                }
                else {
                    if (unaffectedParent.aggregated) {
                        return {
                            'x': unaffectedParent.x, 'y': Math.round(unaffectedParent.y), 'id': n.uniqueID, 'extend': true,
                            'kids': min([4, maxKidGridRows])
                        };
                    }
                    else {
                        return {
                            'x': unaffectedParent.x, 'y': Math.round(unaffectedParent.y), 'id': n.uniqueID, 'extend': false,
                            'kids': min([4, maxKidGridRows])
                        };
                    }
                }
            }
            else {
                return undefined;
            }
        }
    };
    GenealogyTree.prototype.addFamilyElements = function () {
        // const t = transition('t').duration(500).ease(easeLinear);
        var _this = this;
        var couplesLinesGroup = select('#genealogyTree').select('#nodes');
        var couplesData = [];
        var familyNodes = this.data.nodes
            .filter(function (n) {
            return !n.affected &&
                (n.spouse.filter(function (spouse) { return spouse.affected; }).length < 1 || n.aggregated)
                && n.hasChildren;
        });
        familyNodes.forEach(function (n) {
            var familyPos = _this.getFamilyPos(n);
            if (!isUndefined(familyPos)) {
                couplesData.push(familyPos);
            }
        });
        // Attach Couples Lines
        var couplesLines = couplesLinesGroup.selectAll('.couplesLine')
            .data(couplesData, function (d) { return d.id; });
        couplesLines.exit().remove();
        var couplesLinesEnter = couplesLines
            .enter()
            .append('line')
            .attr('class', 'couplesLine');
        // .attr('visibility', 'hidden');
        couplesLines = couplesLinesEnter.merge(couplesLines);
        couplesLines.attr('opacity', 0);
        couplesLines
            .attr('x1', function (d) {
            return _this.x(d.x) + Config.glyphSize * .9;
        })
            .attr('y1', function (d) {
            return _this.y(d.y - 0.4);
        })
            .attr('x2', function (d) {
            return _this.x(d.x) + Config.glyphSize * .9;
        })
            .attr('y2', function (d) {
            if (d.extend) {
                return _this.y(d.y + 1);
            }
            return _this.y(d.y + 0.4);
        })
            .attr('stroke-width', 2);
        couplesLines.attr('opacity', 1);
        var kidGridsGroup = select('#genealogyTree').select('#kidGrids');
        // Attach backgroundRects
        var backgroundRects = kidGridsGroup.selectAll('.kidGrids')
            .data(couplesData, function (d) { return d.id; });
        backgroundRects.exit().remove();
        var backgroundRectsEnter = backgroundRects
            .enter()
            .append('rect')
            .attr('class', 'kidGrids');
        backgroundRects = backgroundRectsEnter.merge(backgroundRects);
        backgroundRects
            .attr('x', function (d) {
            return _this.x(d.x) - Config.glyphSize * 1.2;
        })
            .attr('y', function (d) {
            return _this.y(d.y - 0.4);
        })
            .attr('width', function (d) { return Config.glyphSize * 2 + d.kids * Config.glyphSize; })
            .attr('height', Config.glyphSize * 2.6)
            .style('fill', 'url(#kidGridGradient)');
    };
    GenealogyTree.prototype.addNodes = function () {
        var _this = this;
        var self = this;
        var nodes = this.data.nodes; //.filter(d=>{return !d.hasChildren && !d.hidden});
        // const t = transition('t').duration(500).ease(easeLinear);
        //Separate groups for separate layers
        var nodeGroup = select('#genealogyTree').select('#nodes');
        // Attach node groups
        var allNodes = nodeGroup.selectAll('.node')
            .data(nodes, function (d) {
            return d.uniqueID;
        });
        allNodes.exit().remove();
        var allNodesEnter = allNodes
            .enter()
            .append('g');
        allNodes = allNodesEnter.merge(allNodes);
        allNodesEnter.attr('opacity', 0);
        //Position and Color all Nodes
        allNodes
            .filter(function (d) {
            return !(d.hidden && !d.hasChildren);
        })
            .attr('transform', function (node) {
            var xpos = _this.xPOS(node);
            var ypos = _this.yPOS(node);
            var xoffset = 0;
            //Position Parent Grid;
            if (node.hidden && node.hasChildren && node.spouse[0] && (node.spouse.length > 1 || node.spouse[0].spouse.length > 1)) {
                var parentCount_1 = 0;
                var searchSpouse_1;
                var ind_1;
                _this.data.parentParentEdges.forEach(function (d) {
                    var ss = node.spouse.find(function (n) {
                        return n === d.ma;
                    });
                    if (ss && node.sex === Sex.Male) {
                        if (!searchSpouse_1) {
                            searchSpouse_1 = ss;
                            parentCount_1 = parentCount_1 + 1;
                        }
                        else {
                            if (ss === searchSpouse_1) {
                                parentCount_1 = parentCount_1 + 1;
                            }
                        }
                        if (d.pa === node && node.sex === Sex.Male) {
                            ind_1 = parentCount_1;
                        }
                    }
                    else {
                        var ss_1 = node.spouse.find(function (n) {
                            return n === d.pa;
                        });
                        if (ss_1 && node.sex === Sex.Female) {
                            if (!searchSpouse_1) {
                                searchSpouse_1 = ss_1;
                                parentCount_1 = parentCount_1 + 1;
                            }
                            else {
                                if (ss_1 === searchSpouse_1) {
                                    parentCount_1 = parentCount_1 + 1;
                                }
                            }
                            if (d.ma === node && node.sex === Sex.Female) {
                                ind_1 = parentCount_1;
                            }
                        }
                    }
                });
                if (ind_1 > 1) {
                    xoffset = _this.parentGridScale(ind_1);
                }
            }
            return 'translate(' + (xpos - xoffset) + ',' + ypos + ')';
        });
        //Position  Kid Grid Nodes (i.e leaf siblings)
        allNodes.filter(function (d) {
            return d.hidden && !d.hasChildren && (d.ma || d.pa);
        })
            .attr('transform', function (node) {
            var xpos = _this.xPOS(node);
            var ypos = _this.yPOS(node);
            var childCount = 0;
            var ma = node.ma;
            var pa = node.pa;
            var xind;
            var yind;
            var gender = node.sex;
            _this.data.parentChildEdges.forEach(function (d, i) {
                if (d.ma === ma || d.pa === pa) {
                    //Only count unaffected children that do not have children of their own so as to avoid gaps in the kid Grid
                    if (!d.target.affected && d.target.sex === gender && !d.target.hasChildren) {
                        childCount = childCount + 1;
                    }
                    if (d.target === node) {
                        yind = childCount % (_this.kidGridSize / 2);
                        if (yind === 0) {
                            yind = _this.kidGridSize / 2;
                        }
                        xind = Math.ceil(childCount / 2);
                    }
                }
            });
            var xoffset = 0;
            if (node.ma && node.ma.affected && node.pa && node.pa.affected) {
                xoffset = Config.glyphSize * 2;
            }
            else {
                xoffset = Config.glyphSize * 1.5;
            }
            return 'translate(' + (xpos + xoffset + _this.kidGridXScale(xind)) + ',' + (ypos + +_this.kidGridYScale(yind)) + ')';
        });
        allNodes
            // .transition(t.transition().ease(easeLinear))
            .attr('opacity', 1);
        //AllNodes
        allNodes
            .classed('node', true)
            .classed('collapsed', function (d) {
            return d.hidden;
        });
        allNodes.each(function (cell) {
            self.renderNodeGroup(select(this), cell);
        });
    };
    /**
     *
     * This function highlights (on, or off) all the edges in a branch
     *
     * @param starting node
     * @param on true to turn the highlighting on, false to turn it off
     */
    GenealogyTree.prototype.highlightBranch = function (node, on) {
        var _this = this;
        if (!node.hasChildren) {
            return;
        }
        // start by highlighting spouse edges
        var selectedEdges = selectAll('.edges').filter(function (d) {
            return ((d.ma && d.ma === node || d.pa && d.pa === node) || (!isUndefined(node.spouse[0]) && !isUndefined(node.spouse[0].spouse.find(function (s) { return d.ma === s || d.pa === s; }))));
        });
        var selectedParentEdges = selectAll('.parentEdges').filter(function (d) {
            return ((d.ma && d.ma === node || d.pa && d.pa === node) || (!isUndefined(node.spouse[0]) && !isUndefined(node.spouse[0].spouse.find(function (s) { return d.ma === s || d.pa === s; }))));
        });
        if (on) {
            selectedEdges.classed('selected', true);
            selectedParentEdges.classed('selected', true);
        }
        else {
            selectedEdges.classed('selected', false);
            selectedParentEdges.classed('selected', false);
        }
        node.children.forEach(function (child) { _this.highlightBranch(child, on); });
    };
    GenealogyTree.prototype.renderPersonView = function (d) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var kindredIDVector, peopleIDs, kindredIDs, familyIDs, offset;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        event.stopPropagation();
                        if (!d) {
                            select('#personView')
                                .append('text')
                                .attr('id', 'error')
                                .text('No Data found for this person!')
                                .attr('fill', 'red')
                                .attr('x', 550 / 2)
                                .attr('y', 110);
                            return [2 /*return*/];
                        }
                        else {
                            select('#personView').select('#error').remove();
                        }
                        select('#person')
                            .text(d.id)
                            .attr('fill', function () { return d.affected ? '#285880' : 'black'; })
                            .on('mouseover', function () {
                            //Find node for this person in tree (if current visible)
                            var selectNode = selectAll('.node')
                                .filter(function (node) { return node.id === d.id; });
                            selectNode.select('.nodeIcon').classed('highlightedNode', true);
                        })
                            .on('click', function () { _this.renderPersonView(d); });
                        select('#motherLabel')
                            .text(d.maID)
                            .style('font-weight', function () { return d.ma && d.ma.affected ? 'bolder' : 'normal'; })
                            .attr('fill', function () { return (d.ma && d.ma.affected) ? '#285880' : 'black'; })
                            .on('mouseover', function () {
                            //Find node for this person in tree (if current visible)
                            var selectNode = selectAll('.node')
                                .filter(function (node) { return d.ma && node.id === d.ma.id; });
                            selectNode.select('.nodeIcon').classed('highlightedNode', true);
                        })
                            .on('click', function () { _this.renderPersonView(d.ma); });
                        select('#fatherLabel')
                            .text(d.paID)
                            .style('font-weight', function () { return d.pa && d.pa.affected ? 'bolder' : 'normal'; })
                            .attr('fill', function () { return (d.pa && d.pa.affected) ? '#285880' : 'black'; })
                            .on('mouseover', function () {
                            //Find node for this person in tree (if current visible)
                            var selectNode = selectAll('.node')
                                .filter(function (node) { return d.pa && node.id === d.pa.id; });
                            selectNode.select('.nodeIcon').classed('highlightedNode', true);
                        })
                            .on('click', function () { _this.renderPersonView(d.pa); });
                        //clear all spouses, siblings, and children;
                        select('#spouseLabels').selectAll('text').remove();
                        // select('#siblingLabels').selectAll('text').remove();
                        select('#childrenLabels').selectAll('text').remove();
                        select('#kindredLabel').selectAll('text').remove();
                        return [4 /*yield*/, this.tableManager.getAttributeVector('KindredID', true)];
                    case 1:
                        kindredIDVector = _a.sent();
                        return [4 /*yield*/, kindredIDVector.names()];
                    case 2:
                        peopleIDs = _a.sent();
                        return [4 /*yield*/, kindredIDVector.data()];
                    case 3:
                        kindredIDs = _a.sent();
                        familyIDs = [];
                        peopleIDs.map(function (person, ind) {
                            // console.log(person)
                            if (person === d.id) {
                                familyIDs.push(kindredIDs[ind]);
                            }
                        });
                        offset = [0];
                        //One text element per kindredID
                        familyIDs.map(function (s, i) {
                            select('#kindredLabel')
                                .append('text')
                                .text((i === familyIDs.length - 1 ? s : s + ','))
                                .attr('x', function () { offset.push((offset[i] + 5 + (s.toString().length * 7.5))); return offset[i]; })
                                .on('click', function () { console.log(s); });
                        });
                        //One text element per spouse
                        d.spouse.map(function (s, i) {
                            select('#spouseLabels')
                                .append('text')
                                .text(s.id)
                                .style('font-weight', function () { return s.affected ? 'bolder' : 'normal'; })
                                .attr('x', i * 75)
                                .attr('fill', function () { return s.affected ? '#285880' : 'black'; })
                                .on('mouseover', function () {
                                //Find node for this person in tree (if current visible)
                                var selectNode = selectAll('.node')
                                    .filter(function (node) { return node.id === s.id; });
                                selectNode.select('.nodeIcon').classed('highlightedNode', true);
                            })
                                .on('click', function () { _this.renderPersonView(s); });
                        });
                        //One text element per child
                        d.children.map(function (c, i) {
                            select('#childrenLabels')
                                .append('text')
                                .text(c.id)
                                .attr('x', i * 75)
                                .style('font-weight', function () { return c.affected ? 'bolder' : 'normal'; })
                                .attr('fill', function () { return c.affected ? '#285880' : 'black'; })
                                .on('mouseover', function () {
                                //Find node for this person in tree (if current visible)
                                var selectNode = selectAll('.node')
                                    .filter(function (node) { return node.id === c.id; });
                                selectNode.select('.nodeIcon').classed('highlightedNode', true);
                            })
                                .on('click', function () { _this.renderPersonView(c); });
                        });
                        select('#personView')
                            .selectAll('.personViewLabel')
                            .on('mouseout', function () {
                            selectAll('.nodeIcon').classed('highlightedNode', false);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    GenealogyTree.prototype.renderNodeGroup = function (element, d) {
        // const t = transition('t').duration(500).ease(easeLinear);
        var _this = this;
        element
            .classed('affected', function (n) {
            return n.affected;
        });
        //Add ageLine first to ensure it goes behind the node;
        if (element.selectAll('.ageLineGroup').size() === 0 && !d.inferredBdate && d.hasDdate) {
            var ageLineGroup = element
                .append('g')
                .classed('ageLineGroup', true);
            ageLineGroup.append('rect')
                .classed('ageLine', true);
            ageLineGroup
                .append('text')
                .attr('class', 'ageLabel');
            //Add cross at the end of lifelines for deceased people
            if (d.ddate) {
                ageLineGroup
                    .append('line')
                    .attr('class', 'endOfTheLine');
            }
        }
        //Add cross through lines for deceased people
        if (d.ddate && element.selectAll('.nodeLine').size() === 0) {
            element
                .append('line')
                .attr('class', 'nodeLine');
        }
        var m1, m2, f1, f2, strokeWidth, glyphSize, radius, lineGlyphSize;
        if (d.hidden && !d.hasChildren) {
            f1 = 2 / 3;
            m1 = 1 / 3;
            f2 = 2 / 3;
            m2 = 1.3;
            strokeWidth = 1;
            lineGlyphSize = Config.hiddenGlyphSize;
            glyphSize = Config.hiddenGlyphSize;
            radius = Config.hiddenGlyphSize / 2;
        }
        else if (d.hidden && d.hasChildren) {
            f1 = 1;
            m1 = 1 / 3;
            f2 = 1;
            m2 = 1.8;
            strokeWidth = 1;
            lineGlyphSize = Config.hiddenGlyphSize;
            glyphSize = Config.glyphSize * .75;
            radius = Config.glyphSize * .45;
        }
        else {
            f1 = 1;
            m1 = 1 / 3;
            f2 = 1;
            m2 = 2.3;
            strokeWidth = 3;
            lineGlyphSize = Config.glyphSize;
            glyphSize = Config.glyphSize * 2;
            radius = Config.glyphSize;
        }
        //Node lines for deceased and uncollapsed nodes
        element.selectAll('.nodeLine')
            .attr('x1', function (d) {
            return d.sex === Sex.Female ? -lineGlyphSize * f1 : -lineGlyphSize * m1;
        })
            .attr('y1', function (d) {
            return d.sex === Sex.Female ? -lineGlyphSize * f1 : -lineGlyphSize * m1;
        })
            .attr('x2', function (d) {
            return d.sex === Sex.Female ? lineGlyphSize * f2 : lineGlyphSize * m2;
        })
            .attr('y2', function (d) {
            return d.sex === Sex.Female ? lineGlyphSize * f2 : lineGlyphSize * m2;
        })
            .attr('stroke-width', strokeWidth);
        if (d.duplicates.length > 0 && !d.hidden && element.selectAll('.duplicateIcon').size() === 0) {
            element
                .append('text')
                .classed('duplicateIcon', true);
            element
                .append('line')
                .classed('duplicateLine', true);
        }
        //Add nodes
        if (element.selectAll('.nodeIcon').size() === 0) {
            if (d.sex === Sex.Male) {
                element
                    .append('rect')
                    .classed('male', true)
                    .classed('nodeIcon', true);
            }
            else {
                element
                    .append('circle')
                    .classed('female', true)
                    .classed('nodeIcon', true);
            }
            //Add Attribute Bars next to node glyphs
            element
                .append('rect')
                .classed('attributeFrame', true)
                .classed('primary', true);
            element
                .append('rect')
                .classed('attributeBar', true)
                .classed('primary', true);
        }
        element.selectAll('.nodeIcon')
            .on('contextmenu', function (d) {
            event.preventDefault();
            //TODO add menu for show menu to add to personal view
        });
        element.selectAll('.nodeIcon')
            .on('click', function (d) {
            //  console.log(d);
            _this.renderPersonView(d);
            if (d.affected) {
                //this.tableManager.mapView.highlightSelected(d.id);
            }
            event.stopPropagation();
            selectAll('.nodeIcon').classed('hover', false);
            selectAll('.edges').classed('selected', false);
            _this.highlightBranch(d, true);
            function selected(e) {
                var returnValue = false;
                //Highlight the current row in the graph and table
                if (e.y === Math.round(d.y)) {
                    returnValue = true;
                }
                //Highlight any duplicates for this node
                d.duplicates.forEach(function (dup) {
                    if (Math.round(dup.y) === Math.round(e.y)) {
                        returnValue = true;
                    }
                });
                return returnValue;
            }
            if (d.hasChildren) {
                select('#treeMenu').select('.menu').remove();
                var actions = void 0;
                if (d.state === layoutState.Expanded) {
                    actions = [{ 'state': layoutState.Aggregated, 'string': 'Aggregate', 'offset': 5 }, { 'state': layoutState.Hidden, 'string': 'Hide', 'offset': 20 }];
                }
                else if (d.state === layoutState.Aggregated) {
                    actions = [{ 'state': layoutState.Expanded, 'string': 'Expand', 'offset': 13 }, { 'state': layoutState.Hidden, 'string': 'Hide', 'offset': 20 }];
                }
                else if (d.state === layoutState.Hidden) {
                    actions = [{ 'state': layoutState.Expanded, 'string': 'Expand', 'offset': 13 }, { 'state': layoutState.Aggregated, 'string': 'Aggregate', 'offset': 5 }];
                }
                _this.addMenu(d, actions);
            }
            selectAll('.slopeLine').classed('selectedSlope', false);
            selectAll('.slopeLine').filter(function (e) {
                return e.y === Math.round(d.y);
            }).classed('selectedSlope', true);
            //Set opacity of corresponding highlightBar
            selectAll('.highlightBar').filter(selected).attr('opacity', .2);
            //Set the age label on the lifeLine of this row to visible
            selectAll('.ageLineGroup').filter(function (e) {
                return e.y === Math.round(d.y);
            }).filter(function (d) {
                return !d.aggregated && !d.hidden;
            }).select('.ageLabel').attr('visibility', 'visible');
            // selectAll('.duplicateLine').filter(selected).attr('visibility', 'visible');
        })
            .on('mouseover', function () {
            if (d.hasChildren) {
                select(this).classed('hovered', true);
            }
        })
            .on('mouseout', function () {
            select(this).classed('hovered', false);
            selectAll('.slopeLine').classed('selectedSlope', false);
            //Hide all the highlightBars
            selectAll('.highlightBar').attr('opacity', 0);
            selectAll('.ageLabel').attr('visibility', 'hidden');
        });
        //Size hidden nodes differently
        //regular nodes
        element.selectAll('.male')
            // .transition(t)
            .attr('width', glyphSize)
            .attr('height', glyphSize);
        //unhidden nodes
        element.selectAll('.female')
            // .transition(t)
            .attr('r', radius);
        //attribute frames
        element.select('.attributeFrame')
            .attr('width', Config.glyphSize)
            .attr('y', function () {
            return d.sex === Sex.Female ? (-Config.glyphSize) : 0;
        })
            .attr('fill', 'white')
            .attr('height', function () {
            var height = 0;
            var attr = _this.primaryAttribute;
            if (attr) {
                var data = _this.data.getAttribute(attr.name, d.id);
                if (data) {
                    height = Config.glyphSize * 2;
                }
            }
            return height;
        });
        //attribute Bars
        element.select('.attributeBar')
            .attr('y', function () {
            return d.sex === Sex.Female ? (-Config.glyphSize) : 0;
        })
            .attr('width', Config.glyphSize)
            .attr('height', function () {
            var height = 0;
            var attr = _this.primaryAttribute;
            if (attr) {
                var data = _this.data.getAttribute(attr.name, d.id);
                if (attr && data && attr.type === VALUE_TYPE_CATEGORICAL) {
                    height = Config.glyphSize * 2;
                }
                else if (attr && data && (attr.type === VALUE_TYPE_INT || attr.type === VALUE_TYPE_REAL)) {
                    _this.attributeBarY.domain(attr.range).clamp(true);
                    height = _this.attributeBarY(data);
                }
            }
            return height;
        })
            .attr('y', function () {
            var y = 0;
            var attr = _this.primaryAttribute;
            if (attr) {
                var data = _this.data.getAttribute(attr.name, d.id);
                if (attr && data && (attr.type === VALUE_TYPE_INT || attr.type === VALUE_TYPE_REAL)) {
                    _this.attributeBarY.domain(attr.range).clamp(true);
                    y = Config.glyphSize * 2 - _this.attributeBarY(data);
                }
                return d.sex === Sex.Female ? (-Config.glyphSize) + y : y;
            }
        })
            .attr('fill', function () {
            var attr = _this.primaryAttribute;
            if (attr) {
                var data = _this.data.getAttribute(attr.name, d.id);
                if (attr && data && attr.type === VALUE_TYPE_CATEGORICAL) {
                    var ind = attr.categories.indexOf(data);
                    return attr.color[ind];
                }
                else if (attr && data && (attr.type === VALUE_TYPE_INT || attr.type === VALUE_TYPE_REAL)) {
                    return attr.color;
                }
            }
        });
        element.selectAll('.primary')
            .attr('x', function () {
            // console.log(this.x.range()[1] - this.xPOS(d) -20)
            // return this.x.range()[1] - this.xPOS(d);
            return d.sex === Sex.Female ? Config.glyphSize * 2 + 8 : Config.glyphSize * 3 + 8;
        });
        element.select('.ageLineGroup')
            .attr('transform', function () {
            return d.sex === Sex.Male ? 'translate(' + Config.glyphSize + ',0)'
                : 'translate(0,' + (-Config.glyphSize) + ')';
        });
        element.selectAll('.ageLine')
            .attr('y', Config.glyphSize)
            .attr('width', function () {
            var ageAtDeath = Math.abs(_this.x(d.ddate) - _this.x(d.bdate));
            var ageToday = Math.abs(_this.x(CURRENT_YEAR) - _this.x(d.bdate));
            if (isNaN(ageAtDeath) && isNaN(ageToday)) {
                return 0;
            }
            return (d.ddate) ? ageAtDeath : ageToday;
        })
            .attr('height', Config.glyphSize / 8);
        element.select('.endOfTheLine')
            .attr('x1', function () {
            return (Math.abs(_this.x(d.ddate) - _this.x(d.bdate)) + Config.glyphSize / 3);
        })
            .attr('y1', function () {
            return Config.glyphSize * 1.5;
        })
            .attr('x2', function () {
            return Math.abs(_this.x(d.ddate) - _this.x(d.bdate) - Config.glyphSize / 3);
        })
            .attr('y2', function () {
            return (Config.glyphSize / 2);
        });
        element.select('.ageLabel')
            .attr('dy', Config.glyphSize * 0.8)
            .attr('dx', function () {
            var ageAtDeath = Math.abs(_this.x(d.ddate) - _this.x(d.bdate));
            var ageToday = Math.abs(_this.x(CURRENT_YEAR) - _this.x(d.bdate));
            if (isNaN(ageAtDeath) && isNaN(ageToday)) {
                return '';
            }
            return (+d.ddate) ? ageAtDeath : ageToday;
        })
            .attr('text-anchor', 'end')
            .text(function () {
            var ageAtDeath = (d.ddate - d.bdate);
            var ageToday = (CURRENT_YEAR - d.bdate);
            if (isNaN(ageAtDeath) && isNaN(ageToday)) {
                return '';
            }
            return (+d.ddate) ? ageAtDeath : ageToday;
        })
            .attr('fill', function (d) {
            return (d.affected) ? 'black' : '#9e9d9b';
        })
            .style('font-size', Config.glyphSize * 1.5)
            .style('font-weight', 'bold')
            .attr('visibility', 'hidden');
        element.select('.duplicateLine')
            .attr('x1', function () {
            var n = d;
            var dupNode = n.duplicates.find(function (d) { return d.y !== n.y; });
            if (dupNode.y > n.y) {
                return;
            }
            var glyphSize;
            var offset = 0;
            if (n.hidden) {
                glyphSize = Config.hiddenGlyphSize;
            }
            else {
                glyphSize = Config.glyphSize;
            }
            //Add offset for kid grids
            if (!n.hasChildren && n.hidden) {
                offset = glyphSize * 3;
            }
            if (dupNode.x <= n.x) {
                if (n.sex === Sex.Male) {
                    return glyphSize;
                }
                else {
                    return 0;
                }
            }
            // return glyphSize + offset
        })
            .attr('y1', function () {
            var n = d;
            var dupNode = n.duplicates.find(function (d) { return d.y !== n.y; });
            if (dupNode.y > n.y) {
                return;
            }
            var glyphSize;
            if (n.hidden) {
                glyphSize = Config.hiddenGlyphSize;
            }
            else {
                glyphSize = Config.glyphSize;
                if (dupNode.y < n.y) {
                    if (n.sex === Sex.Male) {
                        return -glyphSize;
                    }
                    else {
                        return -glyphSize * 2;
                    }
                }
            }
            // return +3*glyphSize
        })
            .attr('x2', function () {
            var n = d;
            var dupNode = n.duplicates.find(function (d) { return d.y !== n.y; });
            if (dupNode.y > n.y) {
                return;
            }
            var glyphSize;
            var offset = 0;
            if (n.hidden) {
                glyphSize = Config.hiddenGlyphSize;
            }
            else {
                glyphSize = Config.glyphSize;
            }
            //Add offset for kid grids
            if (!dupNode.hasChildren && dupNode.hidden) {
                offset = glyphSize * 3;
            }
            // if (dupNode.x <=n.x){
            //   return this.x(dupNode.x)- this.x(n.x) +glyphSize + offset
            // } else {
            //   return  this.x(dupNode.x) - this.x(n.x) +glyphSize - offset;
            // }
            if (dupNode.x <= n.x) {
                if (n.sex === Sex.Male) {
                    return _this.x(dupNode.x) - _this.x(n.x) + glyphSize + offset;
                }
                else {
                    return 0;
                }
            }
        })
            .attr('y2', function (n) {
            var dupNode = n.duplicates.find(function (d) { return d.y !== n.y; });
            if (dupNode.y > n.y) {
                return;
            }
            var glyphSize;
            if (n.hidden) {
                glyphSize = Config.hiddenGlyphSize;
            }
            else {
                glyphSize = Config.glyphSize;
            }
            if (n.sex === Sex.Male) {
                return _this.y(n.duplicates.find(function (d) { return d.y !== n.y; }).y) - _this.y(n.y) + glyphSize * 3;
            }
            else {
                return _this.y(n.duplicates.find(function (d) { return d.y !== n.y; }).y) - _this.y(n.y) + glyphSize * 2;
            }
        });
        // .attr('visibility', 'hidden')
        element.select('.duplicateIcon')
            .text('\uf0dd')
            .attr('y', function (n) {
            var glyphSize;
            if (n.hidden) {
                glyphSize = Config.hiddenGlyphSize * .75;
            }
            else {
                glyphSize = Config.glyphSize;
            }
            if (n.sex === Sex.Male) {
                if (n.y > n.duplicates.find(function (d) { return d.y !== n.y; }).y) {
                    return glyphSize - 1;
                }
                else {
                    return glyphSize * 3 - 1;
                }
            }
            else {
                return glyphSize * 2 - 1;
            }
        })
            .attr('x', function (n) {
            var glyphSize;
            if (n.hidden) {
                glyphSize = Config.hiddenGlyphSize * .75;
            }
            else {
                glyphSize = Config.glyphSize;
            }
            if (n.sex === Sex.Male) {
                if (n.y > n.duplicates.find(function (d) { return d.y !== n.y; }).y) {
                    return -glyphSize;
                }
                else {
                    return glyphSize;
                }
            }
            else {
                return 0;
            }
        })
            // .attr('y',0)
            // .attr('x',0)
            .attr('font-family', 'FontAwesome')
            .attr('font-size', function (d) {
            if (d.hidden) {
                return Config.hiddenGlyphSize * 2;
            }
            else {
                return Config.glyphSize * 2.5;
            }
        })
            .attr('text-anchor', 'middle')
            // .attr('text-anchor','start')
            .attr('transform', function (n) {
            if (n.y > (n.duplicates.find(function (d) { return d.y !== n.y; }).y)) {
                return 'rotate(' + 180 + ')';
            }
        });
        element.select('.duplicateIcon')
            .on('mouseover', function () {
            select(this).classed('hovered', true);
            //show duplicate rows
            function selected(e) {
                var returnValue = false;
                //Highlight the current row in the graph and table
                if (e.y === Math.round(d.y)) {
                    returnValue = true;
                }
                //Highlight any duplicates for this node
                d.duplicates.forEach(function (dup) {
                    if (Math.round(dup.y) === Math.round(e.y)) {
                        returnValue = true;
                    }
                });
                return returnValue;
            }
            selectAll('.duplicateLine').filter(selected).classed('hovered', true);
        })
            .on('mouseout', function () {
            select(this).classed('hovered', false);
            selectAll('.duplicateLine').classed('hovered', false);
            //show duplicate rows
        })
            .on('click', function () {
            event.stopPropagation();
            function selected(e) {
                var returnValue = false;
                //Highlight the current row in the graph and table
                if (e.y === Math.round(d.y)) {
                    returnValue = true;
                }
                //Highlight any duplicates for this node
                d.duplicates.forEach(function (dup) {
                    if (Math.round(dup.y) === Math.round(e.y)) {
                        returnValue = true;
                    }
                });
                return returnValue;
            }
            selectAll('.duplicateLine').filter(selected).classed('clicked', true);
            select(this).classed('clicked', true);
            select(this).classed('hovered', false);
        });
    };
    /**
     *
     * This function updates the nodes in the genealogy tree
     *
     * @param nodes array of nodes to update the tree with
     */
    GenealogyTree.prototype.update_nodes = function () {
        this.addHightlightBars();
        this.addFamilyElements();
        this.addNodes();
        // this.addKidGrids();
    };
    GenealogyTree.prototype.update_time_axis = function () {
        var width = this.width - this.margin.left - this.margin.right;
        var scrollOffset = document.getElementById('graph').scrollTop;
        var divHeight = document.getElementById('graph').offsetHeight;
        var minY = this.y.invert(scrollOffset);
        var maxY = this.y.invert(divHeight + scrollOffset - 75);
        //Filter data to adjust x axis to the range of nodes that are visible in the window.
        var filteredNodes = this.data.nodes.filter(function (d) {
            return d.y >= Math.round(minY) && d.y <= Math.round(maxY);
        });
        if (filteredNodes.length === 0) {
            return; //no visible nodes on the screen;
        }
        var filteredDomain = [min(filteredNodes, function (d) {
                return +d.bdate - 5;
            }),
            max(filteredNodes, function (d) {
                return d.ddate ? +d.ddate + 5 : +d.bdate + 5; //account for datasets without a death date
            })];
        var allDomain = [min(this.data.nodes, function (d) {
                return +d.bdate - 5;
            }),
            max(this.data.nodes, function (d) {
                return d.ddate ? +d.ddate : +d.bdate; //account for datasets without a death date
            })];
        //Temporary cap @ 2016. Not sure why the axis are scaling to 2025 automatically.
        if (allDomain[1] > CURRENT_YEAR) {
            allDomain[1] = CURRENT_YEAR;
        }
        if (filteredDomain[1] > CURRENT_YEAR) {
            filteredDomain[1] = CURRENT_YEAR;
        }
        //Build time axis
        //for visible nodes
        var xRange = [0];
        var xDomain = [allDomain[0]];
        var xTicks = [allDomain[0]];
        //for out of scope nodes
        var x2Range = [0];
        var x2Domain = [allDomain[0]];
        var x2Ticks = [];
        //If there are hidden nodes older than the first visible node
        if (allDomain[0] < filteredDomain[0]) {
            xRange.push(width * 0.05);
            xDomain.push(filteredDomain[0]);
            xTicks.push(filteredDomain[0]);
            x2Range.push(width * 0.05);
            x2Domain.push(filteredDomain[0]);
            //Add tick marks
            var leftRange = range(allDomain[0], filteredDomain[0], 10);
            x2Ticks = leftRange;
        }
        xTicks = xTicks.concat(ticks(filteredDomain[0], filteredDomain[1], 10));
        if (allDomain[1] !== filteredDomain[1]) {
            xRange.push(width * 0.95);
            xDomain.push(filteredDomain[1]);
            xTicks.push(filteredDomain[1]);
            xRange.push(width * 0.95);
            xDomain.push(filteredDomain[1]);
            xRange.push(width);
            xDomain.push(allDomain[1]);
            var rightRange = range(filteredDomain[1], allDomain[1], 10);
            xTicks = xTicks.concat(rightRange);
        }
        xRange.push(width);
        xDomain.push(allDomain[1]);
        xTicks.push(allDomain[1]);
        this.x.domain(xDomain);
        this.x.range(xRange);
        this.x2.domain(xDomain);
        this.x2.range(xRange);
        this.visibleXAxis.tickValues(xTicks);
        this.extremesXAxis.tickValues(xTicks);
        select('#visible_axis')
            .call(this.visibleXAxis);
        select('#extremes_axis')
            .attr('opacity', .6);
        select('#extremes_axis')
            .call(this.extremesXAxis);
        select('#extremes_axis')
            .attr('opacity', .6);
        select('#visible_axis')
            .selectAll('text')
            //Offsets for axisBottom
            // .attr('dx', '-.1em')
            // .attr('dy', '.65em')
            //Offsets for axisTop
            .attr('dx', '1.2em')
            .attr('transform', 'rotate(-15)')
            .attr('text-anchor', 'end');
    };
    /**
     *
     * This function returns the x position for a given node.
     *
     * @param node node to position
     * @param offset optional flag to only return the offset for male/female and not the position in the whole svg.
     */
    GenealogyTree.prototype.xPOS = function (node, offset) {
        if (offset === void 0) { offset = false; }
        if (node.sex === Sex.Male) {
            if (node.hidden && node.hasChildren) {
                return !offset ? this.x(node.x) - Config.hiddenGlyphSize * .8 : -Config.hiddenGlyphSize * .8;
            }
            if (!node.hidden) {
                return !offset ? this.x(node.x) - Config.glyphSize : -Config.glyphSize;
            }
            if (node.hidden && !node.hasChildren) {
                return !offset ? this.x(node.x) - Config.hiddenGlyphSize / 2 : -Config.hiddenGlyphSize / 2;
            }
        }
        else {
            return !offset ? this.x(node.x) : 0;
        }
    };
    /**
     *
     * This function returns the x position for a given node.
     *
     * @param node node to position
     * @param offset optional flag to only return the offset for male/female and not the position in the whole svg.
     */
    GenealogyTree.prototype.yPOS = function (node, offset) {
        if (offset == null) {
            offset = false;
        }
        if (node.sex === Sex.Male) {
            if (node.hidden && node.hasChildren) {
                return !offset ? this.y(node.y) - Config.hiddenGlyphSize : -Config.hiddenGlyphSize;
            }
            if (!node.hidden) {
                return !offset ? this.y(node.y) - Config.glyphSize : -Config.glyphSize;
            }
            if (node.hidden && !node.hasChildren) {
                return !offset ? this.y(node.y) - Config.hiddenGlyphSize : -Config.hiddenGlyphSize;
            }
        }
        else {
            return !offset ? this.y(node.y) : 0;
        }
    };
    GenealogyTree.prototype.elbow = function (d, interGenerationScale, lineFunction, curves) {
        var xdiff = d.ma.x - d.target.x;
        var ydiff = d.ma.y - d.target.y;
        var nx = d.ma.x - xdiff - 4; //* interGenerationScale(ydiff)
        var linedata;
        if (curves) {
            nx = d.ma.x - xdiff * interGenerationScale(ydiff);
            linedata = [{
                    x: (d.ma.x + d.pa.x) / 2,
                    y: (d.ma.y + d.pa.y) / 2
                },
                {
                    x: nx,
                    y: (d.ma.y + d.pa.y) / 2
                },
                {
                    x: nx,
                    y: d.target.y
                },
                {
                    x: d.target.x,
                    y: d.target.y
                }];
        }
        else {
            linedata = [{
                    x: (d.ma.x + d.pa.x) / 2,
                    y: (d.ma.y + d.pa.y) / 2
                },
                {
                    x: nx,
                    y: (d.ma.y + d.pa.y) / 2
                },
                {
                    x: nx,
                    y: d.target.y
                },
                {
                    x: d.target.x,
                    y: d.target.y
                }];
        }
        if (curves) {
            lineFunction.curve(curveBasis);
        }
        else {
            lineFunction.curve(curveLinear);
        }
        return lineFunction(linedata);
    };
    GenealogyTree.parentEdge = function (d, lineFunction) {
        var linedata = [{
                x: d.ma.x,
                y: d.ma.y
            }, {
                x: d.pa.x,
                y: d.pa.y
            }];
        return lineFunction(linedata);
    };
    GenealogyTree.prototype.addMenu = function (data, actions) {
        var _this = this;
        if (actions === void 0) { actions = null; }
        select('#treeMenu').select('.menu').remove();
        var menuLabels = ['Set as POI', 'Star', 'Other Option', 'Another Option'];
        var container = document.getElementById('app');
        var coordinates = mouse(container);
        var menuWidth = 90;
        var menuItemHeight = 25;
        var menuHeight = 5 + actions.length * menuItemHeight;
        var menu = select('#treeMenu')
            .append('svg')
            .attr('class', 'menu')
            .attr('height', menuHeight)
            .attr('transform', 'translate(' + (coordinates[0] + 10) + ',' + (coordinates[1] - menuHeight / 2) + ')')
            .append('g')
            .attr('transform', 'translate(10,0)');
        select('.menu')
            .select('g')
            .append('g')
            .classed('tooltipTriangle', true).append('rect');
        var menuItems = menu.selectAll('text').data(actions);
        var menuItemsEnter = menuItems.enter()
            .append('g').attr('class', 'menuItem');
        menuItemsEnter.append('rect').classed('menuItemBackground', true);
        menuItemsEnter.append('text').classed('icon', true);
        menuItemsEnter.append('text').classed('label', true);
        menuItemsEnter.append('line').classed('menuDivider', true);
        menuItems = menuItemsEnter.merge(menuItems);
        menuItems.select('.menuItemBackground')
            .attr('width', menuWidth)
            .attr('fill', '#f7f7f7')
            .attr('height', menuItemHeight)
            .attr('opacity', 1)
            .on('click', function (d) {
            select('#treeMenu').select('.menu').remove();
            _this.data.aggregateTreeWrapper(data.uniqueID, d.state);
            _this.update_graph();
        });
        select('.tooltipTriangle')
            .attr('transform', 'translate(-5,' + (menuItemHeight) + ')')
            .select('rect')
            .attr('width', 10)
            .attr('fill', '#909090')
            .attr('height', 10)
            .attr('opacity', 1)
            .attr('transform', ' rotate(45)')
            .attr('transform-origin', 'center');
        menuItems.attr('transform', (function (d, i) { return 'translate(0,' + (5 + i * menuItemHeight) + ')'; }));
        menuItems
            .select('.label')
            .attr('x', 10)
            .attr('y', menuItemHeight / 2 + 5)
            .text(function (d) { return d.string; })
            .classed('tooltipTitle', true);
        menuItems
            .select('.icon')
            .attr('x', menuWidth - 20)
            .attr('y', menuItemHeight / 2 + 5)
            .attr('class', 'icon')
            .text(function (d) { return d.state === 1 ? '\uf0c9' : (d.state === 2 ? '\uf0ca' : '\uf0cb'); })
            .classed('tooltipTitle', true);
        menuItems
            .select('.menuDivider')
            .attr('x1', 0)
            .attr('x2', menuWidth)
            .attr('y1', menuItemHeight)
            .attr('y2', menuItemHeight)
            .attr('stroke-width', '1px')
            .attr('stroke', 'white');
        select('#treeMenu')
            .attr('width', menuWidth);
        menu.append('line')
            .attr('x1', 0)
            .attr('x2', menuWidth)
            .attr('y1', 5)
            .attr('y2', 5)
            .attr('stroke-width', '5px')
            .attr('stroke', '#e86c37');
    };
    GenealogyTree.prototype.attachListeners = function () {
        var _this = this;
        events.on(TABLE_VIS_ROWS_CHANGED_EVENT, function (evt, item) {
            _this.update();
        });
        events.on(PRIMARY_SELECTED, function (evt, attribute) {
            _this.primaryAttribute = attribute;
            _this.update_graph();
            // this.update_visible_nodes();
            _this.update_legend();
        });
        events.on(POI_SELECTED, function (evt, affectedState) {
            _this.data.defineAffected(affectedState);
            _this.data.aggregateTreeWrapper(undefined, undefined);
            _this.update_time_axis();
            _this.update_graph();
        });
        events.on(HIDE_FAMILY_TREE, function (evt, item) {
            var treeComponent = document.getElementById('col2');
            if (treeComponent.style.display === 'none') {
                treeComponent.style.display = 'block';
                _this.update();
            }
            else {
                treeComponent.style.display = 'none';
            }
        });
    };
    return GenealogyTree;
}());
/**
 * Factory method to create a new instance of the genealogyTree
 * @param parent
 * @param options
 * @returns {genealogyTree}
 */
export function create(parent) {
    return new GenealogyTree(parent);
}
//# sourceMappingURL=genealogyTree.js.map