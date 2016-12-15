/**
 * Created by cnobre on 12/10/16.
 */

function createGraph(data,numElements){

    var g = {
            nodes: [],
            edges: []
        };
         uniqueID=[];

    data.forEach(function (d, i) {
        //Limit Size of graph and only consider entries with a valid bdate and id
        if (i <numElements && +d['egoUPDBID']>0 & +d['bdate']>0) {
            //Demographic Info
            d.id = +d['egoUPDBID']
            d.ma = +d['maUPDBID']
            d.pa= +d['paUPDBID']
            d.spouse = undefined
            d.children = [];

            //Position Info
            d.x = undefined;
            d.y = undefined
            d.generation = undefined;
            d.linearOrder = undefined;

            //Display Info
            d.hide = false; //used to hide/show nodes
            d.type = 'individual' //vs aggregate'
            d.color = 'black'

            //Skip duplicate rows
            if (g.nodes.filter(function(node){return node.id == d.id}).length == 0){
                g.nodes.push(d);
                uniqueID.push(d.id);
            }
        }

        //Store spouse and children in each node;
        g.nodes.forEach(function(node,id){
            //Check for the existence of mother and father nodes
            var maID = uniqueID.indexOf(node['ma']);
            var paID = uniqueID.indexOf(node['pa']);

            if (maID >-1 && paID >-1){
                g.nodes[maID].spouse = node['pa'];
                g.nodes[paID].spouse = node['ma'];
                g.nodes[maID].children.push(id);
                g.nodes[paID].children.push(id);
            }
        })

    });

    //Filter out nodes with no parents and no children
    g.nodes = g.nodes.filter(function(node){return node.children.length>0 || uniqueID.indexOf(node['ma'])>-1})
    //Create edges between individuals and their parents
    g.nodes.forEach(function(d,i){

        if (uniqueID.indexOf(d['ma']) != -1){
            g.edges.push({
                source: g.nodes[uniqueID.indexOf(d['id'])],
                target: g.nodes[uniqueID.indexOf(d['ma'])]
            });
        }
        if (uniqueID.indexOf(d['pa']) != -1) {
            g.edges.push({
                source: g.nodes[uniqueID.indexOf(d['id'])],
                target: g.nodes[uniqueID.indexOf(d['pa'])]
            })
        }

    });
    return g

}

function assignLinearOrder(node){
    var maID = uniqueID.indexOf(node['ma']);
    var paID = uniqueID.indexOf(node['pa']);
    var spouseID = uniqueID.indexOf(node['spouse']);

    if (!node.y) {
        node.y = d3.max(g.nodes,function(d){return d.y})+1;
        // console.log('assigning', node.y)
    }
    //Put spouse to the left of the current node (at least in a first pass)
    if (node.spouse && !g.nodes[spouseID].y) {
        g.nodes[spouseID].y = node.y;
        // console.log('assigning', node.y , 'to spouse')

        if (!collapseParents){
            //Push all nodes one to the right
            g.nodes.forEach(function (d) {
                if (d.y > node.y) d.y = d.y + 1
            })
            node.y = node.y + 1;
            // console.log('assigning', node.y+1 ,'to', node.y)
        }
    }
    else if (node.spouse && g.nodes[spouseID].y && collapseParents){
        node.y = g.nodes[spouseID].y;
        // console.log('assigning', g.nodes[spouseID].y , 'from spouse')
    }

    if (maID >-1 && paID >-1){

        if (g.nodes[maID].y) {
            if (g.nodes[maID].y < node.y){
                node.y = g.nodes[maID].y;
                g.nodes.forEach(function (d) {if (d.y > node.y) d.y = d.y + 1})
                g.nodes[maID].y = node.y + 1;

                if (!collapseParents){
                    g.nodes[paID].y = g.nodes[maID].y+1;
                }
                else
                    g.nodes[paID].y = g.nodes[maID].y;

            }
        }
        else{
            if (!collapseParents){
                g.nodes.forEach(function (d) {if (d.y > node.y) d.y = d.y + 2 })
                g.nodes[paID].y = node.y + 2;
            }
            else{
                g.nodes.forEach(function (d) {if (d.y > node.y) d.y = d.y + 1 })
                g.nodes[paID].y = node.y + 1;
            }
            g.nodes[maID].y = node.y + 1;

        }
    }

}

function arrangeLayout(g){
    g.nodes.forEach(function(node,ind){assignGeneration(node,ind)});

    g.nodes.forEach(function(node){node.x = node.generation});

    //sort by x
    g.nodes.sort(function(a, b) {
        return parseFloat(a['x']) - parseFloat(b['x']);
    });

    uniqueID=[];
    g.nodes.forEach(function(d){
        uniqueID.push(d.id);
    });

    g.nodes[0].y = 1;
    g.nodes.forEach(function(node){assignLinearOrder(node)});

    g.nodes.forEach(function(thisNode){

        if (g.nodes.filter(function(n){return n.y!=undefined & n.y == thisNode.y }).length>1) {
            g.nodes.forEach(function (d) {
                if (d.y > thisNode.y) d.y = d.y + 1
            })
            thisNode.y = thisNode.y + 1;
        }
    })

    relationshipNodes=[];
    relationshipEdges=[];

    randColor = d3.scaleOrdinal(d3.schemeCategory20b);

    //Create relationship nodes
    g.nodes.forEach(function(node){
        var maID = uniqueID.indexOf(node['ma']);
        var paID = uniqueID.indexOf(node['pa']);

        if (maID >-1 && paID >-1){

            rColor = randColor(node.y);

            if (g.nodes[maID].color == 'black') {
                g.nodes[maID].color = rColor
                g.nodes[paID].color = rColor
            }

            var rnode={
                'x':(g.nodes[maID].x + g.nodes[paID].x)/2,
                'y':(g.nodes[maID].y + g.nodes[paID].y)/2,
                'y1':g.nodes[maID].y,
                'y2':g.nodes[paID].y,
                'x1':g.nodes[maID].x,
                'x2':g.nodes[paID].x,
                'color':g.nodes[maID].color,
                'type':'parent'
            }

            relationshipNodes.push(rnode);
            relationshipEdges.push({
                source: rnode,
                target: node,
                'color':g.nodes[maID].color
            })
        }
    })

    return g;
}

function assignGeneration(node,ind){

    node.generation = +node['bdate']
    //
    // if (node.generation == undefined) {
    //     node.generation = getParentGeneration(ind);
    //     if (node.generation == undefined)
    //         node.generation = 1;
    //     setParentGeneration(ind, node.generation)
    // }
}

function setParentGeneration(nodeID,generation){
    var node = g.nodes[nodeID]

    var maID = uniqueID.indexOf(node['ma']);
    var paID = uniqueID.indexOf(node['pa']);

    //Mother exists in array of nodes and does not have a generation assigned
    if (maID > -1 && g.nodes[maID].generation == undefined) {
        g.nodes[maID].generation = generation + 1;
        setParentGeneration(maID,generation+1)
    }

    //Father exists in array of nodes and does not have a generation assigned
    if (paID > -1 && g.nodes[paID].generation == undefined) {
        g.nodes[paID].generation = generation + 1;
        setParentGeneration(paID,generation+1)
    }

}
function getParentGeneration(nodeID){

    var node = g.nodes[nodeID]
    var maID = uniqueID.indexOf(node['ma']);
    var paID = uniqueID.indexOf(node['pa']);


    if (maID >-1) { //Mother exists in array of nodes
        maGeneration = g.nodes[maID].generation
        if (maGeneration == undefined) {
            maGeneration = getParentGeneration(maID)
        }
    }
    else {
        maGeneration = false;
    }
    if (paID >-1) { //Father exists in array of nodes
        paGeneration = g.nodes[paID].generation
        if (paGeneration == undefined) {
            paGeneration = getParentGeneration(paID) //continue searching up the tree
        }
    }
    else {
        paGeneration = false;
    }

    if (maGeneration && paGeneration)
        return (maGeneration + paGeneration) / 2 -1
    else if (maGeneration || paGeneration)
        return (maGeneration || paGeneration) - 1
    else
        return undefined
}

function xPOS(node){
    if (node['sex'] == 'F')
        if (node['spouse'] && collapseParents)
            return x(node.x) //+glyphSize/2
        else
            return x(node.x)
    else
            return x(node.x)-glyphSize
}

function yPOS(node){
    if (node['sex'] == 'F')
        if (node['spouse'] && collapseParents)
            return y(node.y) //- glyphSize/2
        else
            return y(node.y)
    else
        return y(node.y)-glyphSize
}

function elbow(d) {
    var xdiff = d.source.x - d.target.x;
    var ydiff = d.source.y - d.target.y;
    var nx = d.source.x - xdiff * connectorScale(ydiff) ;

    var linedata = [{
        x: d.source.x,
        y: d.source.y
    }, {
        x: nx,
        y: d.source.y
    },{
        x: nx,
        y: d.target.y
    },{
        x: d.target.x,
        y: d.target.y
    }]

    var fun = d3.line()
        .x(function (d) {
        return x(d.x);
    }).y(function (d) {
        return y(d.y);
    })

    if (curvedLines) {
        fun.curve(d3.curveBasis)
    }

    return fun(linedata);
}

function parentEdge(d) {

    var linedata = [{
        x: d.x1,
        y: d.y1
    }, {
        x: d.x2,
        y: d.y2
    }]

    var fun = d3.line()
        .x(function (d) {
            return x(d.x);
        }).y(function (d) {
            return y(d.y);
        })
    return fun(linedata);
}