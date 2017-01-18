/**
 * Created by cnobre on 12/11/16.
 */

import * as d3 from 'd3';
import {elbow, uniqueID, relationshipEdges, relationshipNodes, parentEdge, yPOS, xPOS} from './graph';


export const glyphSize = 14;
export const spaceBetweenGenerations = 4;
export const tableWidth = 150;

//TODO fix this bad style, because of late instantiation
export let minX, maxX, minY, maxY, margin, width, height, y, x, connectorScale;

export function renderGraph(g) {

    //Render Genealogy Graph to the Screen

    minX = d3.min(g.nodes, function (d) {
        return d.x
    });
    maxX = d3.max(g.nodes, function (d) {
        return d.x
    });

    minY = 0;
    maxY = g.nodes.length;

    margin = {top: 40, right: 120, bottom: 20, left: 20},
    width = (maxX - minX) * spaceBetweenGenerations ,
    height = (glyphSize + 5) * g.nodes.length * 2;

    // Scales
    x = d3.scaleLinear().range([0, width - 50]).domain([minX, maxX]);
    y = d3.scaleLinear().range([0, height]).domain([minY, maxY]);

    connectorScale = d3.scaleLinear().range([.75, .25]).domain([2, g.nodes.length])


    var svg1 = d3.select("#graphDiv").append("svg")
        .attr("width", width + tableWidth + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)


    var svg = svg1.append("g")
        .attr('id', 'allVis')


    var graph = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + (margin.top + glyphSize) + ")")
        .attr('id','graph');

    // //append grid
    // var grid = svg.append("g")
    //     .attr("class", "grid")
    //     .attr("transform", "translate(" + margin.left + "," + margin.top  + ")")
    //     .call(d3.axisTop(x).tickFormat("").tickSize(-height));

    //append axis
    svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(d3.axisTop(x).tickFormat(d3.format("d")));


    var edges = graph.selectAll(".edges")
        .data(relationshipEdges)
        .enter().append("path")
        .attr("class", "edges")
        // .style("stroke", function (d) {
        //     return d.color
        // })
        // .style("fill", 'none')
        .attr("d", elbow)
        .attr("stroke-width", 3)
        .on('click',function(d){console.log(d)})


    var parentEdges = graph.selectAll(".parentEdges")
        .data(relationshipNodes)
        .enter().append("path")
        .attr("class", "parentEdges")
        // .style("stroke", function (d) {
        //     return d.color
        // })
        .style("stroke-width", 4)
        .style("fill", 'none')
        .attr("d", parentEdge);

    //Add life line groups
    var lifeRects = graph.selectAll(".lifeSpan")
        .data(g.nodes)
        .enter()
        .append("g")
        .attr('class', 'lifeRect')
        .attr("transform", function (d) {
            return d.sex == 'M' ? "translate(" + (x(d['bdate'])) + "," + yPOS(d) + ")" : "translate(" + (x(d['bdate'])) + "," + (yPOS(d) - glyphSize) + ")";
        })

    //Add actual life lines
    lifeRects.filter(function (d) {
        return (+d.deceased == 1)
    })
        .append("rect")
        .attr('y', glyphSize)
        .attr("width", function (d) {
            return Math.abs(x(d['ddate']) - x(d['bdate']))
        })
        .attr("height", glyphSize / 4)
        .style('fill', function (d) {
            return (+d.affection == 100) ? "black" : "#e0dede"
        })
        .style('opacity', .8)

    //Add label to lifelines
    lifeRects
        .append("text")
        // .attr("y", glyphSize )
        .attr("dy", glyphSize * 0.8)
        .attr("dx", function (d) {
            return Math.abs(x(d['ddate']) - x(d['bdate']))
        })
        .attr("text-anchor", 'end')
        .text(function (d) {
            return Math.abs(+d['ddate'] - +d['bdate'])
        })
        .attr('fill', function (d) {
            return (+d.affection == 100) ? "black" : "#e0dede"
        })
        .style('font-size', glyphSize * 1.8)
        .style('font-weight','bold')

    //Add Male Node Glyphs
    graph.selectAll(".node .male")
        .data(g.nodes.filter(function (d) {
            return d['sex'] == 'M'
        }))
        .enter()
        .append("g")
        .attr("class", "node")
        .append("rect")
        .attr("width", glyphSize * 2)
        .attr("height", glyphSize * 2)



    //Add female node glyphs
    graph.selectAll(".node .female")
        .data(g.nodes.filter(function (d) {
            return d['sex'] == 'F'
        }))
        .enter()
        .append("g")
        .attr("class", "node")
        .append("circle")
        .attr("r", glyphSize)


    //Position and Color all Nodes
    var allNodes = graph.selectAll(".node")
        .attr("transform", function (d) {
            return "translate(" + xPOS(d) + "," + yPOS(d) + ")";
        })
        .style("fill", function (d) {
            return (+d.affection == 100) ? "black" : "white"
        })
        // .style('stroke', function (d) {
        //     return d.color
        // })
        .style("stroke-width", 3)
        .on("click",function(d){
            if(!d3.select(this).classed('selected')){
                edges.classed('selected',false);
                allNodes.classed('selected',false);
                highlightPath(d)
            }
            else {
                edges.classed('selected', false);
                allNodes.classed('selected', false);
            }
        });

        allNodes.call(d3.drag()
            .on("start",started)
            .on("drag", dragged)
            .on("end",ended));


let startYPos;

    function started(d){
        //var node = d3.select(this).data()[0];
        startYPos = y.invert(d3.mouse(d3.select('#graph').node())[1]);

    }
    function ended(d){
        //var node = d3.select(this).data()[0];
        var ypos2 = y.invert(d3.mouse(d3.select('#graph').node())[1]);
        console.log('started dragging at position ', Math.round(startYPos))
        console.log('ended dragging at position ', Math.round(ypos2))

    }

    function dragged(d) {
        var node = d3.select(this).data()[0];
        node.y = y.invert(d3.mouse(d3.select('#graph').node())[1]);
        //currentY = Math.round(y.invert(d3.mouse(d3.select('#graph').node())[1]));

        d3.select(this).attr("transform", function () {
            return "translate(" + xPOS(node) + "," + yPOS(node) + ")";
        })
    }



    function highlightPath(d){

        edges.filter(function(e){return e.target.id == d.id}).classed('selected',true)
        var maID = uniqueID.indexOf(d['ma']);
        var paID = uniqueID.indexOf(d['pa']);

        allNodes.filter(function (n) {
            return n.id == d.id
        }).classed('selected', true);

        if (maID>-1) {
            allNodes.filter(function (n) {
                return n.id == d['ma']
            }).classed('selected', true);
            highlightPath(g.nodes[maID]);
        }
        if (paID>-1) {
            allNodes.filter(function (n) {
                return n.id == d['ma']
            }).classed('selected', true);
            highlightPath(g.nodes[paID]);
        }
};

    //Add cross through lines for deceased people
    allNodes.filter(function (d) {
        return (+d.deceased == 1 & +d.affection != 100) // TODO consider using `&&` instead
    })
        .append("line")
        .attr("x1", function (d) {
            return d.sex == 'F' ? -glyphSize : -glyphSize / 2
        })
        .attr("y1", function (d) {
            return d.sex == 'F' ? -glyphSize : -glyphSize / 2
        })
        .attr("x2", function (d) {
            return d.sex == 'F' ? glyphSize : glyphSize * 2.5
        })
        .attr("y2", function (d) {
            return d.sex == 'F' ? glyphSize : glyphSize * 2.5
        })
        .attr("stroke-width", 3)
        .attr("stroke", "black");


    graph.selectAll('g.node')
        .append('text')
        .attr('class', 'ageLabel')
        // .attr('visibility','hidden')
        .text(function (d) {
            if (+d.ddate > 0) {
                return Math.abs(d['ddate'] - d['bdate'])
            }
            else
                return Math.abs(2016 - d['bdate'])
        })
        .attr('dx', function (d) {
            return d['sex'] == 'M' ? glyphSize / 2 : -glyphSize / 2
        })
        .attr('dy', function (d) {
            return d['sex'] == 'M' ? 1.5 * glyphSize : glyphSize / 2
        })
        .attr('fill', function (d) {
            return (+d.affection == 100) ? "white" : "black"
        })
        .attr('stroke', 'none')

}

export function renderTable(g) {

    var table = d3.select('svg').append("g")
        .attr("transform", "translate(" + (2 * margin.left + width ) + "," + margin.top + ")");

    var rect = table.selectAll(".rect")
        .data(g.nodes)
        .enter()
        .append("rect")
        .attr("width", 10 * glyphSize)
        .attr("height", 2 * glyphSize)
        .attr("x", function (d) {
            return x(minX)
        })
        .attr("y", function (d) {
            return y(d.y)
        })
        .style("stroke", 'gray')
        .style("fill", function (d) {
            return (+d.affection == 100) ? "black" : "white"
        })
        .style('stroke-width', 2)


}
