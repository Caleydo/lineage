/**
 * Created by cnobre on 12/11/16.
 */
function renderGraph(g) {
//      Render Genealogy to the Screen
    minLevel = d3.min(g.nodes, function (d) {
        return d.x
    });
    maxLevel = d3.max(g.nodes, function (d) {
        return d.x
    });

    glyphSize = 12;
    spaceBetweenGenerations = 100;

    margin = {top: 20, right: 120, bottom: 20, left: 20},
        width = (maxLevel - minLevel) * spaceBetweenGenerations,
        height = (glyphSize + 3) * g.nodes.length * 2;

    x = d3.scaleLinear().range([0, width]).domain([minLevel, maxLevel]);
    y = d3.scaleLinear().range([0, height]).domain([0, g.nodes.length + (g.nodes.length *.1)]);
    connectorScale = d3.scaleLinear().range([.75, .25]).domain([2, g.nodes.length])

    tableWidth = 150;

    var svg = d3.select("body").append("svg")
        .attr("width", width + tableWidth+ margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom);

    var table = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var graph = svg.append("g")
        .attr("transform", "translate(" + (margin.left + tableWidth) + "," + (margin.top + glyphSize) + ")");

    var rect = table.selectAll(".rect")
        .data(g.nodes)
        .enter()
        .append("rect")
        // .attr("class", "day")
        .attr("width", 10*glyphSize)
        .attr("height", 2*glyphSize)
        .attr("x", function(d) { return x(1)})
        .attr("y", function(d) { return y(d.y)})
        .style("stroke",'gray')
        .style("fill", function (d) {
            return (+d.affection == 100) ? "black" : "white"
        })
        .style('stroke-width',2)

    var edges = graph.selectAll(".edges")
        .data(relationshipEdges)
        .enter().append("path")
        .attr("class", "edges")
        .style("stroke", function (d) {
            return d.color
        })
        .style("fill", 'none')
        .attr("d", elbow)
        .attr("stroke-width", 3)


    var edges = graph.selectAll(".parentEdges")
        .data(relationshipNodes)
        .enter().append("path")
        .attr("class", "parentEdges")
        .style("stroke", function (d) {
            return d.color
        })
        .style("stroke-width", 4)
        .style("fill", 'none')
        .attr("d", parentEdge);


    var mnodes = graph.selectAll(".node .male")
        .data(g.nodes.filter(function (d) {
            return d['sex'] == 'M'
        }))
        .enter()
        .append("g")
        .attr("class", "node")
        .append("rect")
        .attr("width", glyphSize * 2)
        .attr("height", glyphSize * 2)

    var fnodes = graph.selectAll(".node .female")
        .data(g.nodes.filter(function (d) {
            return d['sex'] == 'F'
        }))
        .enter()
        .append("g")
        .attr("class", "node")
        .append("circle")
        .attr("r", glyphSize)

    // var mrnodes = svg.selectAll("g.node .mparent")
    //     .data(relationshipNodes)
    //     .enter()
    //     .append("g")
    //     .attr("class", "node")
    //     .append("rect")
    //     .attr("width", glyphSize * 2.2)
    //     .attr("height", glyphSize * 2.2)
    //     .attr('x', -glyphSize/3)
    //     .attr('y', -glyphSize/3)
    //
    // var drnodes = svg.selectAll("g.node .dparent")
    //     .data(relationshipNodes)
    //     .enter()
    //     .append("g")
    //     .attr("class", "node")
    //     .append("circle")
    //     .attr("r", glyphSize)
    //     .attr('cx',glyphSize/3)
    //     .attr('cy',glyphSize/3)


    var allNodes = graph.selectAll(".node")
        .attr("transform", function (d) {
            return "translate(" + xPOS(d) + "," + yPOS(d) + ")";
        })
        .style("fill", function (d) {
            return (+d.affection == 100) ? "black" : "white"
        })
        .style('stroke', function (d) {
            return d.color
        })
        .style("stroke-width", 3)
//
    var nodeLabels = graph.selectAll('.node')
        .append('text')
            .text(function (d) {return d.y
        })
        .attr('dx', function(d){return d['sex']=='M' ? glyphSize/2 : -glyphSize/2} )
        .attr('dy', function(d){return d['sex']=='M' ? 1.5*glyphSize : glyphSize/2} )
        .attr('fill', function(d){return (+d.affection == 100) ? "white" : "black"})
        .attr('stroke', 'none')
}