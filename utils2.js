/**
 * Created by cnobre on 12/10/16.
 */

function assignOrder(node){
    var maID = uniqueID.indexOf(node['ma']);
    var paID = uniqueID.indexOf(node['pa']);
    var spouseID = uniqueID.indexOf(node['spouse']);

    if (!node.y) {
        node.y = d3.max(g.nodes,function(d){return d.y})+1;
    }
    //Put spouse to the left of the current node (at least in a first pass)
    if (node.spouse && !g.nodes[spouseID].y) {
        g.nodes[spouseID].y = node.y;

        if (!collapseParents){
            //Push all nodes one to the right
            g.nodes.forEach(function (d) {
                if (d.y > node.y) d.y = d.y + 1
            })
            node.y = node.y + 1;
        }
    }
    else if (node.spouse && g.nodes[spouseID].y && collapseParents){
        node.y = g.nodes[spouseID].y;
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

function assignGeneration(node,ind){
    if (node.generation == undefined) {
        node.generation = getParentGeneration(ind);
        if (node.generation == undefined)
            node.generation = 1;
        setParentGeneration(ind, node.generation)
    }
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
        return x(node.x)
    else
        return x(node.x)-glyphSize
}

function yPOS(node){
    if (node['sex'] == 'F')
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
        .curve(d3.curveBasis)
        .x(function (d) {
        return x(d.x);
    }).y(function (d) {
        return y(d.y);
    })
    return fun(linedata);
}

function parentEdge(d) {

    var linedata = [{
        x: d.x,
        y: d.y1
    }, {
        x: d.x,
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