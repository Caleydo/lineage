/**
 * Created by cnobre on 12/10/16.
 */
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

//Vertical Layout
//            linedata = [{
//                x: d.target.x,
//                y: d.target.y
//            }, {
//                x: d.target.x,
//                y: ny
//            },{
//                x: d.source.x,
//                y: ny
//            },{
//                x: d.source.x,
//                y: d.source.y
//            }]

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

    var fun = d3.line().x(function (d) {
        return x(d.x);
    }).y(function (d) {
        return y(d.y);
    })
    return fun(linedata);
}
