/*! lineage - v1.0.0-20190601-171541 - 2019
* https://phovea.caleydo.org
* Copyright (c) 2019 Carolina Nobre; Licensed BSD-3-Clause*/

webpackJsonp([4,9],{

/***/ 605:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1____ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__datatype__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__IAtom__ = __webpack_require__(717);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__idtype__ = __webpack_require__(225);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__AAtom__ = __webpack_require__(716);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__range__ = __webpack_require__(13);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Atom", function() { return Atom; });
/* harmony export (immutable) */ __webpack_exports__["create"] = create;
/* harmony export (immutable) */ __webpack_exports__["asAtom"] = asAtom;
/**
 * Created by Samuel Gratzl on 14.02.2017.
 */







var Atom = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](Atom, _super);
    function Atom(desc, loaded) {
        var _this = _super.call(this, desc) || this;
        _this.loaded = loaded;
        return _this;
    }
    Atom.prototype.id = function () {
        return Promise.resolve(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__range__["b" /* list */])(this.loaded.id));
    };
    Atom.prototype.name = function () {
        return Promise.resolve(this.loaded.name);
    };
    Atom.prototype.data = function () {
        return Promise.resolve(this.loaded.value);
    };
    return Atom;
}(__WEBPACK_IMPORTED_MODULE_5__AAtom__["a" /* default */]));

var noValue = {
    id: -1,
    name: '',
    value: null
};
function create(desc) {
    if (typeof (desc.data) !== undefined) {
        return new Atom(desc, desc.data);
    }
    return new Atom(desc, noValue);
}
function asAtom(name, value, options) {
    if (options === void 0) { options = {}; }
    var desc = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1____["a" /* mixin */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__IAtom__["a" /* createDefaultAtomDesc */])(), {
        value: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__datatype__["f" /* guessValueTypeDesc */])([value])
    }, options);
    var rowAssigner = options.rowassigner || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__idtype__["d" /* createLocalAssigner */])();
    var atom = {
        name: name,
        value: value,
        id: rowAssigner([name]).first
    };
    return new Atom(desc, atom);
}


/***/ }),

/***/ 606:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__idtype__ = __webpack_require__(225);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__datatype__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__range__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__graph__ = __webpack_require__(665);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__GraphBase__ = __webpack_require__(664);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__RemoteStorageGraph__ = __webpack_require__(720);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__MemoryGraph__ = __webpack_require__(719);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__LocalStorageGraph__ = __webpack_require__(718);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__internal_promise__ = __webpack_require__(115);
/* harmony export (immutable) */ __webpack_exports__["create"] = create;

/**
 * Created by sam on 12.02.2015.
 */









var GraphProxy = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](GraphProxy, _super);
    function GraphProxy(desc) {
        var _this = _super.call(this, desc) || this;
        _this.cache = null;
        _this.loaded = null;
        return _this;
    }
    Object.defineProperty(GraphProxy.prototype, "nnodes", {
        get: function () {
            if (this.loaded) {
                return this.loaded.nnodes;
            }
            var size = this.desc.size;
            return size[__WEBPACK_IMPORTED_MODULE_4__graph__["a" /* DIM_NODES */]] || 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GraphProxy.prototype, "nedges", {
        get: function () {
            if (this.loaded) {
                return this.loaded.nedges;
            }
            var size = this.desc.size;
            return size[__WEBPACK_IMPORTED_MODULE_4__graph__["b" /* DIM_EDGES */]] || 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GraphProxy.prototype, "dim", {
        get: function () {
            return [this.nnodes, this.nedges];
        },
        enumerable: true,
        configurable: true
    });
    GraphProxy.prototype.impl = function (factory) {
        var _this = this;
        if (factory === void 0) { factory = __WEBPACK_IMPORTED_MODULE_5__GraphBase__["a" /* defaultGraphFactory */]; }
        if (this.cache) {
            return this.cache;
        }
        var type = this.desc.storage || 'remote';
        if (type === 'memory') {
            //memory only
            this.loaded = new __WEBPACK_IMPORTED_MODULE_7__MemoryGraph__["a" /* default */](this.desc, [], [], factory);
            this.cache = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_9__internal_promise__["a" /* resolveImmediately */])(this.loaded);
        }
        else if (type === 'local') {
            this.loaded = __WEBPACK_IMPORTED_MODULE_8__LocalStorageGraph__["a" /* default */].load(this.desc, factory, localStorage);
            this.cache = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_9__internal_promise__["a" /* resolveImmediately */])(this.loaded);
        }
        else if (type === 'session') {
            this.loaded = __WEBPACK_IMPORTED_MODULE_8__LocalStorageGraph__["a" /* default */].load(this.desc, factory, sessionStorage);
            this.cache = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_9__internal_promise__["a" /* resolveImmediately */])(this.loaded);
        }
        else if (type === 'given' && this.desc.graph instanceof __WEBPACK_IMPORTED_MODULE_4__graph__["c" /* AGraph */]) {
            this.loaded = this.desc.graph;
            this.cache = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_9__internal_promise__["a" /* resolveImmediately */])(this.loaded);
        }
        else {
            this.cache = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_9__internal_promise__["a" /* resolveImmediately */])(__WEBPACK_IMPORTED_MODULE_6__RemoteStorageGraph__["a" /* default */].load(this.desc, factory)).then(function (graph) { return _this.loaded = graph; });
        }
        return this.cache;
    };
    GraphProxy.prototype.ids = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__range__["a" /* all */])(); }
        if (this.cache) {
            return Promise.resolve(this.cache.then(function (i) { return i.ids(range); })); // TODO avoid <any> type cast
        }
        return Promise.resolve(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__range__["d" /* none */])());
    };
    Object.defineProperty(GraphProxy.prototype, "idtypes", {
        get: function () {
            return [__WEBPACK_IMPORTED_MODULE_4__graph__["d" /* IDTYPE_NODES */], __WEBPACK_IMPORTED_MODULE_4__graph__["e" /* IDTYPE_EDGES */]].map(__WEBPACK_IMPORTED_MODULE_1__idtype__["e" /* resolve */]);
        },
        enumerable: true,
        configurable: true
    });
    return GraphProxy;
}(__WEBPACK_IMPORTED_MODULE_2__datatype__["h" /* ADataType */]));
/* harmony default export */ __webpack_exports__["default"] = GraphProxy;
/**
 * module entry point for creating a datatype
 * @param desc
 * @returns {IMatrix}
 */
function create(desc) {
    return new GraphProxy(desc);
}


/***/ }),

/***/ 609:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0____ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__idtype__ = __webpack_require__(225);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__idtype_IDType__ = __webpack_require__(36);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__event__ = __webpack_require__(7);
/* harmony export (immutable) */ __webpack_exports__["create"] = create;
/**
 * Created by Samuel Gratzl on 01.12.2016.
 */




var PREFIX = 'selection-idtype-';
function syncIDType(store, idType, options) {
    options.selectionTypes.forEach(function (type) {
        var key = "" + PREFIX + idType.id + "-" + type;
        var disable = false;
        idType.on('select-' + type, function (event, type, selection) {
            if (disable) {
                return;
            }
            // sync just the latest state
            store.setValue(key, selection.toString());
        });
        store.on(key, function (event, newValue) {
            disable = true; //don't track on changes
            idType.select(type, newValue);
            disable = false;
        });
    });
}
function create(store, options) {
    options = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0____["a" /* mixin */])({
        filter: function () { return true; },
        selectionTypes: [__WEBPACK_IMPORTED_MODULE_1__idtype__["b" /* defaultSelectionType */]] // by default just selections
    }, options);
    // store existing
    var toSync = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__idtype__["c" /* list */])().filter(function (idType) { return (idType instanceof __WEBPACK_IMPORTED_MODULE_2__idtype_IDType__["a" /* default */] && options.filter(idType)); });
    toSync.forEach(function (idType) { return syncIDType(store, idType, options); });
    // watch new ones
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__event__["a" /* on */])('register.idtype', function (event, idType) {
        if (options.filter(idType)) {
            syncIDType(store, idType, options);
        }
    });
    return null;
}


/***/ }),

/***/ 664:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__graph__ = __webpack_require__(665);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return defaultGraphFactory; });

/**
 * Created by sam on 12.02.2015.
 */
/**
 * Created by Samuel Gratzl on 22.10.2014.
 */

var defaultGraphFactory = {
    makeNode: function (p) { return ((new __WEBPACK_IMPORTED_MODULE_1__graph__["f" /* GraphNode */]()).restore(p)); },
    makeEdge: function (p, lookup) { return ((new __WEBPACK_IMPORTED_MODULE_1__graph__["g" /* GraphEdge */]()).restore(p, lookup)); }
};
var GraphBase = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](GraphBase, _super);
    function GraphBase(desc, nodes, edges) {
        if (nodes === void 0) { nodes = []; }
        if (edges === void 0) { edges = []; }
        var _this = _super.call(this) || this;
        _this.desc = desc;
        _this._nodes = nodes;
        _this._edges = edges;
        return _this;
    }
    Object.defineProperty(GraphBase.prototype, "nodes", {
        get: function () {
            return this._nodes;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GraphBase.prototype, "edges", {
        get: function () {
            return this._edges;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * migrate one graph to another cleaning this graph returning node references
     * @returns {{nodes: GraphNode[]; edges: GraphEdge[]}}
     */
    GraphBase.prototype.migrate = function () {
        return {
            nodes: this.nodes,
            edges: this.edges
        };
    };
    GraphBase.prototype.addNode = function (n) {
        this.nodes.push(n);
        this.fire('add_node', n);
        return this;
    };
    GraphBase.prototype.updateNode = function (n) {
        //since we store a reference we don't need to do anything
        this.fire('update_node', n);
        return this;
    };
    GraphBase.prototype.removeNode = function (n) {
        var i = this.nodes.indexOf(n);
        if (i < 0) {
            return null;
        }
        this.nodes.splice(i, 1);
        this.fire('remove_node', n);
        return this;
    };
    GraphBase.prototype.addEdge = function (edgeOrSource, type, t) {
        if (edgeOrSource instanceof __WEBPACK_IMPORTED_MODULE_1__graph__["g" /* GraphEdge */]) {
            var e = edgeOrSource;
            this.edges.push(e);
            this.fire('add_edge', e, e.type, e.source, e.target);
            return this;
        }
        return this.addEdge(new __WEBPACK_IMPORTED_MODULE_1__graph__["g" /* GraphEdge */](type, edgeOrSource, t));
    };
    GraphBase.prototype.updateEdge = function (e) {
        //since we store a reference we don't need to do anything
        this.fire('update_edge', e);
        return this;
    };
    GraphBase.prototype.removeEdge = function (e) {
        var i = this.edges.indexOf(e);
        if (i < 0) {
            return null;
        }
        e.takeDown();
        this.edges.splice(i, 1);
        this.fire('remove_edge', e);
        return this;
    };
    GraphBase.prototype.clear = function () {
        this.nodes.splice(0, this.nodes.length);
        this.edges.splice(0, this.edges.length);
        return Promise.resolve(this);
    };
    GraphBase.prototype.persist = function () {
        var r = {
            root: this.desc.id
        };
        r.nodes = this.nodes.map(function (s) { return s.persist(); });
        r.edges = this.edges.map(function (l) { return l.persist(); });
        return r;
    };
    GraphBase.prototype.restore = function (dump) {
        return this;
    };
    return GraphBase;
}(__WEBPACK_IMPORTED_MODULE_1__graph__["c" /* AGraph */]));
/* harmony default export */ __webpack_exports__["b"] = GraphBase;


/***/ }),

/***/ 665:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__idtype__ = __webpack_require__(225);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__range__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__index__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__event__ = __webpack_require__(7);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return DIM_NODES; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return IDTYPE_NODES; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return DIM_EDGES; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return IDTYPE_EDGES; });
/* unused harmony export AttributeContainer */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return GraphNode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return GraphEdge; });
/* unused harmony export isType */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return AGraph; });

/**
 * Created by sam on 12.02.2015.
 */
/**
 * Created by Samuel Gratzl on 22.10.2014.
 */




var DIM_NODES = 0;
var IDTYPE_NODES = '_nodes';
var DIM_EDGES = 1;
var IDTYPE_EDGES = '_edges';
var AttributeContainer = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](AttributeContainer, _super);
    function AttributeContainer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.attrMap = new Map();
        return _this;
    }
    AttributeContainer.prototype.persist = function () {
        if (this.attrMap.size > 0) {
            var attrs_1 = {};
            this.attrMap.forEach(function (v, k) { return attrs_1[k] = v; });
            return { attrs: attrs_1 };
        }
        return {};
    };
    AttributeContainer.prototype.setAttr = function (attr, value) {
        var bak = this.attrMap.get(attr);
        if (bak === value && !Array.isArray(bak)) {
            return;
        }
        this.attrMap.set(attr, value);
        this.fire('attr-' + attr, value, bak);
        this.fire('setAttr', attr, value, bak);
    };
    AttributeContainer.prototype.hasAttr = function (attr) {
        return this.attrMap.has(attr);
    };
    AttributeContainer.prototype.getAttr = function (attr, defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        if (this.attrMap.has(attr)) {
            return this.attrMap.get(attr);
        }
        return defaultValue;
    };
    Object.defineProperty(AttributeContainer.prototype, "attrs", {
        get: function () {
            return Array.from(this.attrMap.keys());
        },
        enumerable: true,
        configurable: true
    });
    AttributeContainer.prototype.restore = function (persisted) {
        var _this = this;
        if (persisted.attrs) {
            Object.keys(persisted.attrs).forEach(function (k) { return _this.attrMap.set(k, persisted.attrs[k]); });
        }
        return this;
    };
    return AttributeContainer;
}(__WEBPACK_IMPORTED_MODULE_4__event__["c" /* EventHandler */]));

/**
 * a simple graph none
 */
var GraphNode = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](GraphNode, _super);
    function GraphNode(type, id) {
        if (type === void 0) { type = 'node'; }
        if (id === void 0) { id = NaN; }
        var _this = _super.call(this) || this;
        _this.type = type;
        _this.outgoing = [];
        _this.incoming = [];
        _this._id = NaN;
        _this._id = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__index__["j" /* flagId */])('graph_node', id);
        return _this;
    }
    Object.defineProperty(GraphNode.prototype, "id", {
        get: function () {
            if (isNaN(this._id)) {
                this._id = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__index__["k" /* uniqueId */])('graph_node');
            }
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    GraphNode.prototype.persist = function () {
        var r = _super.prototype.persist.call(this);
        r.type = this.type;
        r.id = this.id;
        return r;
    };
    GraphNode.prototype.restore = function (persisted) {
        _super.prototype.restore.call(this, persisted);
        this.type = persisted.type;
        this._id = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__index__["j" /* flagId */])('graph_node', persisted.id);
        return this;
    };
    return GraphNode;
}(AttributeContainer));

var GraphEdge = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](GraphEdge, _super);
    function GraphEdge(type, source, target, id) {
        if (type === void 0) { type = 'edge'; }
        if (source === void 0) { source = null; }
        if (target === void 0) { target = null; }
        if (id === void 0) { id = NaN; }
        var _this = _super.call(this) || this;
        _this.type = type;
        _this.source = source;
        _this.target = target;
        _this._id = NaN;
        _this._id = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__index__["j" /* flagId */])('graph_edge', id);
        if (source && target) {
            _this.init();
        }
        return _this;
    }
    Object.defineProperty(GraphEdge.prototype, "id", {
        get: function () {
            if (isNaN(this._id)) {
                this._id = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__index__["k" /* uniqueId */])('graph_edge');
            }
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    GraphEdge.prototype.init = function () {
        this.source.outgoing.push(this);
        this.target.incoming.push(this);
    };
    GraphEdge.prototype.takeDown = function () {
        if (this.source) {
            this.source.outgoing.splice(this.source.outgoing.indexOf(this), 1);
        }
        if (this.target) {
            this.target.incoming.splice(this.target.incoming.indexOf(this), 1);
        }
    };
    GraphEdge.prototype.toString = function () {
        return this.source + " " + this.type + " " + this.target;
    };
    GraphEdge.prototype.persist = function () {
        var r = _super.prototype.persist.call(this);
        r.type = this.type;
        r.id = this.id;
        r.source = this.source.id;
        r.target = this.target.id;
        return r;
    };
    GraphEdge.prototype.restore = function (p, nodes) {
        _super.prototype.restore.call(this, p);
        this.type = p.type;
        this._id = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__index__["j" /* flagId */])('graph_edge', p.id);
        this.source = nodes(p.source);
        this.target = nodes(p.target);
        this.init();
        return this;
    };
    return GraphEdge;
}(AttributeContainer));

function isType(type) {
    return function (edge) { return type instanceof RegExp ? type.test(edge.type) : edge.type === type; };
}
var AGraph = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](AGraph, _super);
    function AGraph() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(AGraph.prototype, "nnodes", {
        get: function () {
            return this.nodes.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AGraph.prototype, "nedges", {
        get: function () {
            return this.edges.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AGraph.prototype, "dim", {
        get: function () {
            return [this.nodes.length, this.edges.length];
        },
        enumerable: true,
        configurable: true
    });
    AGraph.prototype.ids = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        var ids = (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["b" /* list */])(this.nodes.map(function (n) { return n.id; }), this.edges.map(function (n) { return n.id; })));
        return Promise.resolve(ids.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["h" /* parse */])(range)));
    };
    AGraph.prototype.idView = function (idRange) {
        if (idRange === void 0) { idRange = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        throw Error('not implemented');
    };
    AGraph.prototype.selectNode = function (node, op) {
        if (op === void 0) { op = __WEBPACK_IMPORTED_MODULE_1__idtype__["f" /* SelectOperation */].SET; }
        this.select(DIM_NODES, [this.nodes.indexOf(node)], op);
    };
    AGraph.prototype.selectedNodes = function () {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var r, nodes;
            var _this = this;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.selections()];
                    case 1:
                        r = _a.sent();
                        nodes = [];
                        r.dim(DIM_NODES).forEach(function (index) { return nodes.push(_this.nodes[index]); });
                        return [2 /*return*/, nodes];
                }
            });
        });
    };
    AGraph.prototype.selectEdge = function (edge, op) {
        if (op === void 0) { op = __WEBPACK_IMPORTED_MODULE_1__idtype__["f" /* SelectOperation */].SET; }
        this.select(DIM_EDGES, [this.edges.indexOf(edge)], op);
    };
    AGraph.prototype.selectedEdges = function () {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var r, edges;
            var _this = this;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.selections()];
                    case 1:
                        r = _a.sent();
                        edges = [];
                        r.dim(DIM_EDGES).forEach(function (index) { return edges.push(_this.edges[index]); });
                        return [2 /*return*/, edges];
                }
            });
        });
    };
    Object.defineProperty(AGraph.prototype, "idtypes", {
        get: function () {
            return [IDTYPE_NODES, IDTYPE_EDGES].map(__WEBPACK_IMPORTED_MODULE_1__idtype__["e" /* resolve */]);
        },
        enumerable: true,
        configurable: true
    });
    return AGraph;
}(__WEBPACK_IMPORTED_MODULE_1__idtype__["a" /* SelectAble */]));



/***/ }),

/***/ 716:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__idtype__ = __webpack_require__(225);
/* unused harmony export AAtom */
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */



/**
 * base class for different Atom implementations
 * @internal
 */
var AAtom = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](AAtom, _super);
    function AAtom(desc) {
        var _this = _super.call(this) || this;
        _this.desc = desc;
        return _this;
    }
    Object.defineProperty(AAtom.prototype, "dim", {
        get: function () {
            return [1];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AAtom.prototype, "valuetype", {
        get: function () {
            return this.desc.value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AAtom.prototype, "idtype", {
        get: function () {
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__idtype__["e" /* resolve */])(this.desc.idtype);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AAtom.prototype, "idtypes", {
        get: function () {
            return [this.idtype];
        },
        enumerable: true,
        configurable: true
    });
    AAtom.prototype.ids = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range);
        if (range.isNone) {
            return Promise.resolve(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["d" /* none */])());
        }
        return this.id();
    };
    AAtom.prototype.idView = function (idRange) {
        return Promise.resolve(this);
    };
    AAtom.prototype.persist = function () {
        return this.desc.id;
    };
    AAtom.prototype.restore = function (persisted) {
        return this;
    };
    return AAtom;
}(__WEBPACK_IMPORTED_MODULE_2__idtype__["a" /* SelectAble */]));

/* harmony default export */ __webpack_exports__["a"] = AAtom;


/***/ }),

/***/ 717:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__index__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__datatype__ = __webpack_require__(19);
/* harmony export (immutable) */ __webpack_exports__["a"] = createDefaultAtomDesc;
/**
 * Created by Samuel Gratzl on 14.02.2017.
 */


function createDefaultAtomDesc() {
    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__index__["a" /* mixin */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__datatype__["g" /* createDefaultDataDesc */])(), {
        type: 'atom',
        idtype: '_rows',
        value: {
            type: 'string'
        }
    });
}


/***/ }),

/***/ 718:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__GraphBase__ = __webpack_require__(664);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__graph__ = __webpack_require__(665);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__internal_promise__ = __webpack_require__(115);




var LocalStorageGraph = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](LocalStorageGraph, _super);
    function LocalStorageGraph(desc, nodes, edges, storage) {
        if (nodes === void 0) { nodes = []; }
        if (edges === void 0) { edges = []; }
        if (storage === void 0) { storage = sessionStorage; }
        var _this = _super.call(this, desc, nodes, edges) || this;
        _this.storage = storage;
        _this.updateHandler = function (event) {
            var s = event.target;
            if (s instanceof __WEBPACK_IMPORTED_MODULE_2__graph__["f" /* GraphNode */]) {
                _this.updateNode(s);
            }
            if (s instanceof __WEBPACK_IMPORTED_MODULE_2__graph__["g" /* GraphEdge */]) {
                _this.updateEdge(s);
            }
        };
        var uid = _this.uid;
        if (nodes.length > 0 || edges.length > 0) {
            _this.storage.setItem(uid + ".nodes", JSON.stringify(nodes.map(function (d) { return d.id; })));
            nodes.forEach(function (n) {
                _this.storage.setItem(uid + '.node.' + n.id, JSON.stringify(n.persist()));
                n.on('setAttr', _this.updateHandler);
            });
            _this.storage.setItem(uid + ".edges", JSON.stringify(edges.map(function (d) { return d.id; })));
            edges.forEach(function (e) {
                _this.storage.setItem(uid + ".edge." + e.id, JSON.stringify(e.persist()));
                e.on('setAttr', _this.updateHandler);
            });
        }
        return _this;
    }
    LocalStorageGraph.migrate = function (graph, storage) {
        if (storage === void 0) { storage = sessionStorage; }
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__internal_promise__["a" /* resolveImmediately */])(graph.migrate()).then(function (_a) {
            var nodes = _a.nodes, edges = _a.edges;
            return new LocalStorageGraph(graph.desc, nodes, edges, storage);
        });
    };
    LocalStorageGraph.prototype.migrate = function () {
        var _this = this;
        this.nodes.forEach(function (n) { return n.off('setAttr', _this.updateHandler); });
        this.edges.forEach(function (n) { return n.off('setAttr', _this.updateHandler); });
        return _super.prototype.migrate.call(this);
    };
    LocalStorageGraph.load = function (desc, factory, storage, reset) {
        if (storage === void 0) { storage = sessionStorage; }
        if (reset === void 0) { reset = false; }
        var r = new LocalStorageGraph(desc, [], [], storage);
        if (!reset) {
            r.load(factory);
        }
        return r;
    };
    LocalStorageGraph.clone = function (graph, factory, storage) {
        if (storage === void 0) { storage = sessionStorage; }
        var r = new LocalStorageGraph(graph.desc, [], [], storage);
        r.restoreDump(graph.persist(), factory);
        return r;
    };
    Object.defineProperty(LocalStorageGraph.prototype, "uid", {
        get: function () {
            return "graph" + this.desc.id;
        },
        enumerable: true,
        configurable: true
    });
    LocalStorageGraph.prototype.load = function (factory) {
        var _this = this;
        var uid = this.uid;
        if (this.storage.getItem(uid + ".nodes") == null) {
            return;
        }
        var nodeIds = JSON.parse(this.storage.getItem(uid + ".nodes"));
        var lookup = new Map();
        nodeIds.forEach(function (id) {
            var n = JSON.parse(_this.storage.getItem(uid + ".node." + id));
            var nn = factory.makeNode(n);
            lookup.set(nn.id, nn);
            nn.on('setAttr', _this.updateHandler);
            _super.prototype.addNode.call(_this, nn);
        });
        var edgeIds = JSON.parse(this.storage.getItem(uid + ".edges"));
        edgeIds.forEach(function (id) {
            var n = JSON.parse(_this.storage.getItem(uid + ".edge." + id));
            var nn = factory.makeEdge(n, lookup.get.bind(lookup));
            nn.on('setAttr', _this.updateHandler);
            _super.prototype.addEdge.call(_this, nn);
        });
        this.fire('loaded');
    };
    LocalStorageGraph.delete = function (desc, storage) {
        if (storage === void 0) { storage = sessionStorage; }
        var uid = "graph" + desc.id;
        JSON.parse(storage.getItem(uid + ".nodes") || '[]').forEach(function (id) {
            storage.removeItem(uid + ".node." + id);
        });
        storage.removeItem(uid + ".nodes");
        JSON.parse(storage.getItem(uid + ".edges") || '[]').forEach(function (id) {
            storage.removeItem(uid + ".edge." + id);
        });
        storage.removeItem(uid + ".edges");
        return true;
    };
    LocalStorageGraph.update = function (desc, storage) {
        if (storage === void 0) { storage = sessionStorage; }
        var uid = "graph" + desc.id;
    };
    LocalStorageGraph.prototype.restoreDump = function (persisted, factory) {
        var _this = this;
        var lookup = new Map();
        persisted.nodes.forEach(function (p) {
            var n = factory.makeNode(p);
            lookup.set(n.id, n);
            _this.addNode(n);
        });
        persisted.edges.forEach(function (p) {
            var n = factory.makeEdge(p, lookup.get.bind(lookup));
            _this.addEdge(n);
        });
        return this;
    };
    LocalStorageGraph.prototype.addNode = function (n) {
        _super.prototype.addNode.call(this, n);
        var uid = this.uid;
        this.storage.setItem(uid + '.node.' + n.id, JSON.stringify(n.persist()));
        this.storage.setItem(uid + ".nodes", JSON.stringify(this.nodes.map(function (d) { return d.id; })));
        n.on('setAttr', this.updateHandler);
        return this;
    };
    LocalStorageGraph.prototype.updateNode = function (n) {
        _super.prototype.updateNode.call(this, n);
        var uid = this.uid;
        this.storage.setItem(uid + '.node.' + n.id, JSON.stringify(n.persist()));
        return this;
    };
    LocalStorageGraph.prototype.removeNode = function (n) {
        if (!_super.prototype.removeNode.call(this, n)) {
            return null;
        }
        var uid = this.uid;
        this.storage.setItem(uid + ".nodes", JSON.stringify(this.nodes.map(function (d) { return d.id; })));
        this.storage.removeItem(uid + ".node." + n.id);
        n.off('setAttr', this.updateHandler);
        return this;
    };
    LocalStorageGraph.prototype.addEdge = function (edgeOrSource, type, t) {
        if (edgeOrSource instanceof __WEBPACK_IMPORTED_MODULE_2__graph__["g" /* GraphEdge */]) {
            _super.prototype.addEdge.call(this, edgeOrSource);
            var e = edgeOrSource;
            var uid = this.uid;
            this.storage.setItem(uid + ".edges", JSON.stringify(this.edges.map(function (d) { return d.id; })));
            this.storage.setItem(uid + ".edge." + e.id, JSON.stringify(e.persist()));
            e.on('setAttr', this.updateHandler);
            return this;
        }
        return _super.prototype.addEdge.call(this, edgeOrSource, type, t);
    };
    LocalStorageGraph.prototype.removeEdge = function (e) {
        if (!_super.prototype.removeEdge.call(this, e)) {
            return null;
        }
        //need to shift all
        var uid = this.uid;
        this.storage.setItem(uid + ".edges", JSON.stringify(this.edges.map(function (d) { return d.id; })));
        this.storage.removeItem(uid + ".edge." + e.id);
        e.off('setAttr', this.updateHandler);
        return this;
    };
    LocalStorageGraph.prototype.updateEdge = function (e) {
        _super.prototype.updateEdge.call(this, e);
        var uid = this.uid;
        this.storage.setItem(uid + ".edge." + e.id, JSON.stringify(e.persist()));
        return this;
    };
    LocalStorageGraph.prototype.clear = function () {
        var _this = this;
        var nnodes = this.nnodes, nedges = this.nedges;
        if (nnodes === 0 && nedges === 0) {
            return Promise.resolve(this);
        }
        this.nodes.forEach(function (n) { return n.off('setAttr', _this.updateHandler); });
        this.edges.forEach(function (n) { return n.off('setAttr', _this.updateHandler); });
        _super.prototype.clear.call(this);
        var uid = this.uid;
        JSON.parse(this.storage.getItem(uid + '.nodes')).forEach(function (id) {
            _this.storage.removeItem(uid + ".node." + id);
        });
        this.storage.removeItem(uid + ".nodes");
        JSON.parse(this.storage.getItem(uid + '.edges')).forEach(function (id) {
            _this.storage.removeItem(uid + ".edge." + id);
        });
        this.storage.removeItem(uid + ".edges");
        return Promise.resolve(this);
    };
    LocalStorageGraph.prototype.persist = function () {
        var r = {
            root: this.desc.id
        };
        r.nodes = this.nodes.map(function (s) { return s.persist(); });
        r.edges = this.edges.map(function (l) { return l.persist(); });
        return r;
    };
    return LocalStorageGraph;
}(__WEBPACK_IMPORTED_MODULE_1__GraphBase__["b" /* default */]));
/* harmony default export */ __webpack_exports__["a"] = LocalStorageGraph;


/***/ }),

/***/ 719:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__GraphBase__ = __webpack_require__(664);


var MemoryGraph = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](MemoryGraph, _super);
    function MemoryGraph(desc, nodes, edges, factory) {
        if (nodes === void 0) { nodes = []; }
        if (edges === void 0) { edges = []; }
        if (factory === void 0) { factory = __WEBPACK_IMPORTED_MODULE_1__GraphBase__["a" /* defaultGraphFactory */]; }
        var _this = _super.call(this, desc, nodes, edges) || this;
        _this.factory = factory;
        return _this;
    }
    MemoryGraph.prototype.restore = function (persisted) {
        var _this = this;
        var lookup = new Map();
        persisted.nodes.forEach(function (p) {
            var n = _this.factory.makeNode(p);
            lookup.set(n.id, n);
            _this.addNode(n);
        });
        persisted.edges.forEach(function (p) {
            var n = _this.factory.makeEdge(p, lookup.get.bind(lookup));
            _this.addEdge(n);
        });
        return this;
    };
    return MemoryGraph;
}(__WEBPACK_IMPORTED_MODULE_1__GraphBase__["b" /* default */]));
/* harmony default export */ __webpack_exports__["a"] = MemoryGraph;


/***/ }),

/***/ 720:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ajax__ = __webpack_require__(50);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__GraphBase__ = __webpack_require__(664);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__graph__ = __webpack_require__(665);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__internal_promise__ = __webpack_require__(115);

/**
 * Created by Samuel Gratzl on 22.10.2014.
 */




var RemoteStoreGraph = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](RemoteStoreGraph, _super);
    function RemoteStoreGraph(desc) {
        var _this = _super.call(this, desc) || this;
        _this.updateHandler = function (event) {
            var s = event.target;
            if (s instanceof __WEBPACK_IMPORTED_MODULE_3__graph__["f" /* GraphNode */]) {
                _this.updateNode(s);
            }
            if (s instanceof __WEBPACK_IMPORTED_MODULE_3__graph__["g" /* GraphEdge */]) {
                _this.updateEdge(s);
            }
        };
        _this.waitForSynced = 0;
        _this.queue = [];
        _this.flushTimeout = -1;
        _this.batchSize = desc.attrs.batchSize || RemoteStoreGraph.DEFAULT_BATCH_SIZE;
        return _this;
    }
    RemoteStoreGraph.prototype.migrate = function () {
        var _this = this;
        this.nodes.forEach(function (n) { return n.off('setAttr', _this.updateHandler); });
        this.edges.forEach(function (n) { return n.off('setAttr', _this.updateHandler); });
        //TODO delete old
        return _super.prototype.migrate.call(this);
    };
    RemoteStoreGraph.load = function (desc, factory) {
        var r = new RemoteStoreGraph(desc);
        return r.load(factory);
    };
    RemoteStoreGraph.prototype.load = function (factory) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var r;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.fire('sync_load_start,sync_start', ++this.waitForSynced);
                        return [4 /*yield*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__ajax__["b" /* sendAPI */])("/dataset/graph/" + this.desc.id + "/data")];
                    case 1:
                        r = _a.sent();
                        this.loadImpl(r.nodes, r.edges, factory);
                        this.fire('sync_load,sync', --this.waitForSynced);
                        return [2 /*return*/, this];
                }
            });
        });
    };
    RemoteStoreGraph.prototype.loadImpl = function (nodes, edges, factory) {
        var _this = this;
        var lookup = new Map(), lookupFun = lookup.get.bind(lookup);
        nodes.forEach(function (n) {
            var nn = factory.makeNode(n);
            lookup.set(nn.id, nn);
            nn.on('setAttr', _this.updateHandler);
            _super.prototype.addNode.call(_this, nn);
        });
        edges.forEach(function (n) {
            var nn = factory.makeEdge(n, lookupFun);
            nn.on('setAttr', _this.updateHandler);
            _super.prototype.addEdge.call(_this, nn);
        });
        this.fire('loaded');
    };
    Object.defineProperty(RemoteStoreGraph.prototype, "activeSyncOperations", {
        get: function () {
            return this.waitForSynced;
        },
        enumerable: true,
        configurable: true
    });
    RemoteStoreGraph.prototype.send = function (type, op, elem) {
        if (this.batchSize <= 1) {
            return this.sendNow(type, op, elem);
        }
        else {
            var item = { type: type, op: op, id: elem.id, desc: elem.persist() };
            return this.enqueue(item);
        }
    };
    RemoteStoreGraph.prototype.enqueue = function (item) {
        var _this = this;
        if (this.flushTimeout >= 0) {
            clearTimeout(this.flushTimeout);
            this.flushTimeout = -1;
        }
        this.queue.push(item);
        if (this.queue.length >= this.batchSize * 2) { //really full
            return this.sendQueued();
        }
        var wait = this.queue.length >= this.batchSize ? RemoteStoreGraph.DEFAULT_WAIT_TIME_BEFORE_FULL_FLUSH : RemoteStoreGraph.DEFAULT_WAIT_TIME_BEFORE_EARLY_FLUSH;
        //send it at most timeout ms if there is no update in between
        this.flushTimeout = setTimeout(function () {
            _this.sendQueued();
        }, wait);
    };
    RemoteStoreGraph.prototype.sendNow = function (type, op, elem) {
        var _this = this;
        this.fire("sync_start_" + type + ",sync_start", ++this.waitForSynced, op + "_{type}", elem);
        var data = {
            desc: JSON.stringify(elem.persist())
        };
        var create = function () {
            switch (op) {
                case 'add':
                    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__ajax__["b" /* sendAPI */])("/dataset/graph/" + _this.desc.id + "/" + type, data, 'POST');
                case 'update':
                    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__ajax__["b" /* sendAPI */])("/dataset/graph/" + _this.desc.id + "/" + type + "/" + elem.id, data, 'PUT');
                case 'remove':
                    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__ajax__["b" /* sendAPI */])("/dataset/graph/" + _this.desc.id + "/" + type + "/" + elem.id, {}, 'DELETE');
            }
        };
        return create().then(function () {
            _this.fire("sync_" + type + ",sync", --_this.waitForSynced, elem);
        });
    };
    RemoteStoreGraph.prototype.sendQueued = function () {
        var _this = this;
        if (this.queue.length === 0) {
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__internal_promise__["a" /* resolveImmediately */])(null);
        }
        var param = JSON.stringify({ operation: 'batch', items: this.queue.slice() });
        // clear
        this.queue.splice(0, this.queue.length);
        this.fire("sync_start", ++this.waitForSynced, 'batch');
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__ajax__["b" /* sendAPI */])("/dataset/" + this.desc.id, { desc: param }, 'POST').then(function () {
            _this.fire("sync", --_this.waitForSynced, 'batch');
            return _this;
        });
    };
    RemoteStoreGraph.prototype.flush = function () {
        if (this.batchSize <= 1 || this.queue.length === 0) {
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__internal_promise__["a" /* resolveImmediately */])('nothing queued');
        }
        return this.sendQueued();
    };
    RemoteStoreGraph.prototype.addAll = function (nodes, edges) {
        var _this = this;
        //add all and and to queue
        nodes.forEach(function (n) {
            _super.prototype.addNode.call(_this, n);
            n.on('setAttr', _this.updateHandler);
            _this.queue.push({ type: 'node', op: 'add', id: n.id, desc: n.persist() });
        });
        edges.forEach(function (e) {
            _super.prototype.addEdge.call(_this, e);
            e.on('setAttr', _this.updateHandler);
            _this.queue.push({ type: 'edge', op: 'add', id: e.id, desc: e.persist() });
        });
        return this.sendQueued();
    };
    RemoteStoreGraph.prototype.addNode = function (n) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _super.prototype.addNode.call(this, n);
                        n.on('setAttr', this.updateHandler);
                        return [4 /*yield*/, this.send('node', 'add', n)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this];
                }
            });
        });
    };
    RemoteStoreGraph.prototype.updateNode = function (n) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _super.prototype.updateNode.call(this, n);
                        return [4 /*yield*/, this.send('node', 'update', n)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this];
                }
            });
        });
    };
    RemoteStoreGraph.prototype.removeNode = function (n) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!_super.prototype.removeNode.call(this, n)) {
                            return [2 /*return*/, Promise.reject('invalid node')];
                        }
                        n.off('setAttr', this.updateHandler);
                        return [4 /*yield*/, this.send('node', 'remove', n)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this];
                }
            });
        });
    };
    RemoteStoreGraph.prototype.addEdge = function (edgeOrSource, type, t) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var e;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(edgeOrSource instanceof __WEBPACK_IMPORTED_MODULE_3__graph__["g" /* GraphEdge */])) return [3 /*break*/, 2];
                        _super.prototype.addEdge.call(this, edgeOrSource);
                        e = edgeOrSource;
                        e.on('setAttr', this.updateHandler);
                        return [4 /*yield*/, this.send('edge', 'add', e)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this];
                    case 2: return [2 /*return*/, _super.prototype.addEdge.call(this, edgeOrSource, type, t)];
                }
            });
        });
    };
    RemoteStoreGraph.prototype.removeEdge = function (e) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!_super.prototype.removeEdge.call(this, e)) {
                            return [2 /*return*/, Promise.reject('invalid edge')];
                        }
                        e.off('setAttr', this.updateHandler);
                        return [4 /*yield*/, this.send('edge', 'remove', e)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this];
                }
            });
        });
    };
    RemoteStoreGraph.prototype.updateEdge = function (e) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _super.prototype.updateEdge.call(this, e);
                        return [4 /*yield*/, this.send('edge', 'update', e)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this];
                }
            });
        });
    };
    RemoteStoreGraph.prototype.clear = function () {
        var _this = this;
        if (this.nnodes === 0 && this.nedges === 0) {
            return Promise.resolve(this);
        }
        this.nodes.forEach(function (n) { return n.off('setAttr', _this.updateHandler); });
        this.edges.forEach(function (n) { return n.off('setAttr', _this.updateHandler); });
        _super.prototype.clear.call(this);
        this.flush().then(function () {
            _this.fire('sync_start', ++_this.waitForSynced, 'clear');
            //clear all nodes
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__ajax__["b" /* sendAPI */])("/dataset/graph/" + _this.desc.id + "/node", {}, 'DELETE');
        }).then(function () {
            _this.fire('sync');
            return _this;
        });
    };
    RemoteStoreGraph.DEFAULT_BATCH_SIZE = 10;
    RemoteStoreGraph.DEFAULT_WAIT_TIME_BEFORE_EARLY_FLUSH = 1000; //ms
    RemoteStoreGraph.DEFAULT_WAIT_TIME_BEFORE_FULL_FLUSH = 100; //ms
    return RemoteStoreGraph;
}(__WEBPACK_IMPORTED_MODULE_2__GraphBase__["b" /* default */]));
/* harmony default export */ __webpack_exports__["a"] = RemoteStoreGraph;


/***/ })

});