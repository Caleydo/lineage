/*! lineage - v1.0.0-20190527-190114 - 2019
* https://phovea.caleydo.org
* Copyright (c) 2019 Carolina Nobre; Licensed BSD-3-Clause*/

webpackJsonp([0,9],{

/***/ 117:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_phovea_core_src_provenance__ = __webpack_require__(688);
/* harmony export (immutable) */ __webpack_exports__["transform"] = transform;
/* harmony export (immutable) */ __webpack_exports__["createTransform"] = createTransform;
/* harmony export (immutable) */ __webpack_exports__["changeVis"] = changeVis;
/* harmony export (immutable) */ __webpack_exports__["createChangeVis"] = createChangeVis;
/* harmony export (immutable) */ __webpack_exports__["setOption"] = setOption;
/* harmony export (immutable) */ __webpack_exports__["createSetOption"] = createSetOption;
/* harmony export (immutable) */ __webpack_exports__["attach"] = attach;
/**
 * Created by sam on 10.02.2015.
 */

var disabled = {};
function transform(inputs, parameter) {
    var v = inputs[0].value, transform = parameter.transform, bak = parameter.old || v.transform();
    disabled['transform-' + v.id] = true;
    v.transform(transform.scale, transform.rotate);
    delete disabled['transform-' + v.id];
    return {
        inverse: createTransform(inputs[0], bak, transform)
    };
}
function createTransform(v, t, old) {
    if (old === void 0) { old = null; }
    return {
        meta: __WEBPACK_IMPORTED_MODULE_0_phovea_core_src_provenance__["a" /* meta */]('transform ' + v.toString(), __WEBPACK_IMPORTED_MODULE_0_phovea_core_src_provenance__["b" /* cat */].visual),
        id: 'transform',
        f: transform,
        inputs: [v],
        parameter: {
            transform: t,
            old: old
        }
    };
}
function changeVis(inputs, parameter) {
    var v = inputs[0].value, to = parameter.to, from = parameter.from || v.act.id;
    disabled['switch-' + v.id] = true;
    return v.switchTo(to).then(function () {
        delete disabled['switch-' + v.id];
        return {
            inverse: createChangeVis(inputs[0], from, to)
        };
    });
}
function createChangeVis(v, to, from) {
    if (from === void 0) { from = null; }
    return {
        meta: __WEBPACK_IMPORTED_MODULE_0_phovea_core_src_provenance__["a" /* meta */]('switch vis ' + v.toString(), __WEBPACK_IMPORTED_MODULE_0_phovea_core_src_provenance__["b" /* cat */].visual),
        id: 'changeVis',
        f: changeVis,
        inputs: [v],
        parameter: {
            to: to,
            from: from
        }
    };
}
function setOption(inputs, parameter) {
    var v = inputs[0].value, name = parameter.name, value = parameter.value, bak = parameter.old || v.option(name);
    disabled['option-' + v.id] = true;
    v.option(name, value);
    delete disabled['option-' + v.id];
    return {
        inverse: createSetOption(inputs[0], name, bak, value)
    };
}
function createSetOption(v, name, value, old) {
    if (old === void 0) { old = null; }
    return {
        meta: __WEBPACK_IMPORTED_MODULE_0_phovea_core_src_provenance__["a" /* meta */]('set option "' + name + +'" of "' + v.toString() + ' to "' + value + '"', __WEBPACK_IMPORTED_MODULE_0_phovea_core_src_provenance__["b" /* cat */].visual),
        id: 'setOption',
        f: setOption,
        inputs: [v],
        parameter: {
            name: name,
            value: value,
            old: old
        }
    };
}
function attach(graph, v) {
    var m = v.value, id = m.id;
    if (typeof (m.switchTo) === 'function') {
        m.on('changed', function (event, newValue, old) {
            if (disabled['switch-' + id] !== true) {
                console.log('push switch');
                graph.push(createChangeVis(v, newValue.id, old ? old.id : null));
            }
        });
    }
    m.on('transform', function (event, newValue, old) {
        if (disabled['transform-' + id] !== true) {
            console.log('push transform');
            graph.push(createTransform(v, newValue, old));
        }
    });
    m.on('option', function (event, name, newValue, old) {
        if (disabled['option-' + id] !== true) {
            console.log('push option');
            graph.push(createSetOption(v, name, newValue, old));
        }
    });
}


/***/ }),

/***/ 230:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_phovea_core_src_idtype__ = __webpack_require__(622);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_phovea_core_src_event__ = __webpack_require__(226);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_phovea_core_src_provenance__ = __webpack_require__(688);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_phovea_core_src_index__ = __webpack_require__(224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_phovea_core_src_range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__compress__ = __webpack_require__(715);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_phovea_core_src__ = __webpack_require__(224);
/* harmony export (immutable) */ __webpack_exports__["select"] = select;
/* harmony export (immutable) */ __webpack_exports__["createSelection"] = createSelection;
/* harmony export (immutable) */ __webpack_exports__["compressSelection"] = compressSelection;
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SelectionRecorder", function() { return SelectionRecorder; });
/* harmony export (immutable) */ __webpack_exports__["create"] = create;
/**
 * Created by sam on 10.02.2015.
 */







var disabler = new __WEBPACK_IMPORTED_MODULE_1_phovea_core_src_event__["b" /* EventHandler */]();
function select(inputs, parameter, graph, within) {
    var idtype = __WEBPACK_IMPORTED_MODULE_0_phovea_core_src_idtype__["c" /* resolve */](parameter.idtype), range = __WEBPACK_IMPORTED_MODULE_4_phovea_core_src_range__["g" /* parse */](parameter.range), type = parameter.type;
    var bak = parameter.old ? __WEBPACK_IMPORTED_MODULE_4_phovea_core_src_range__["g" /* parse */](parameter.old) : idtype.selections(type);
    if (__WEBPACK_IMPORTED_MODULE_3_phovea_core_src_index__["b" /* hash */].has('debug')) {
        console.log('select', range.toString());
    }
    disabler.fire('disable-' + idtype.id);
    idtype.select(type, range);
    disabler.fire('enable-' + idtype.id);
    return createSelection(idtype, type, bak, range, parameter.animated).then(function (cmd) { return ({ inverse: cmd, consumed: parameter.animated ? within : 0 }); });
}
function capitalize(s) {
    return s.split(' ').map(function (d) { return d[0].toUpperCase() + d.slice(1); }).join(' ');
}
function meta(idtype, type, range) {
    var l = range.dim(0).length;
    var title = type === __WEBPACK_IMPORTED_MODULE_0_phovea_core_src_idtype__["b" /* defaultSelectionType */] ? '' : (capitalize(type) + ' ');
    var p;
    if (l === 0) {
        title += 'no ' + idtype.names;
        p = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6_phovea_core_src__["n" /* resolveImmediately */])(title);
    }
    else if (l === 1) {
        title += idtype.name + ' ';
        p = idtype.unmap(range).then(function (r) {
            title += r[0];
            return title;
        });
    }
    else if (l < 3) {
        title += idtype.names + ' (';
        p = idtype.unmap(range).then(function (r) {
            title += r.join(', ') + ')';
            return title;
        });
    }
    else {
        title += range.dim(0).length + " " + idtype.names;
        p = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6_phovea_core_src__["n" /* resolveImmediately */])(title);
    }
    return p.then(function (title) { return __WEBPACK_IMPORTED_MODULE_2_phovea_core_src_provenance__["a" /* meta */](title, __WEBPACK_IMPORTED_MODULE_2_phovea_core_src_provenance__["b" /* cat */].selection); });
}
/**
 * create a selection command
 * @param idtype
 * @param type
 * @param range
 * @param old optional the old selection for inversion
 * @returns {Cmd}
 */
function createSelection(idtype, type, range, old, animated) {
    if (old === void 0) { old = null; }
    if (animated === void 0) { animated = false; }
    return meta(idtype, type, range).then(function (meta) {
        return {
            meta: meta,
            id: 'select',
            f: select,
            parameter: {
                idtype: idtype.id,
                range: range.toString(),
                type: type,
                old: old.toString(),
                animated: animated
            }
        };
    });
}
function compressSelection(path) {
    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__compress__["a" /* lastOnly */])(path, 'select', function (p) { return p.parameter.idtype + '@' + p.parameter.type; });
}
/**
 * utility class to record all the selections within the provenance graph for a specific idtype
 */
var SelectionTypeRecorder = /** @class */ (function () {
    function SelectionTypeRecorder(idtype, graph, type, options) {
        if (options === void 0) { options = {}; }
        var _this = this;
        this.idtype = idtype;
        this.graph = graph;
        this.type = type;
        this.options = options;
        this.l = function (event, type, sel, added, removed, old) {
            createSelection(_this.idtype, type, sel, old, _this.options.animated).then(function (cmd) { return _this.graph.push(cmd); });
        };
        this._enable = this.enable.bind(this);
        this._disable = this.disable.bind(this);
        this.typeRecorders = [];
        if (this.type) {
            this.typeRecorders = this.type.split(',').map(function (ttype) {
                var t = function (event, sel, added, removed, old) {
                    return _this.l(event, ttype, sel, added, removed, old);
                };
                return t;
            });
        }
        this.enable();
        disabler.on('enable-' + this.idtype.id, this._enable);
        disabler.on('disable-' + this.idtype.id, this._disable);
    }
    SelectionTypeRecorder.prototype.disable = function () {
        var _this = this;
        if (this.type) {
            this.type.split(',').forEach(function (ttype, i) {
                _this.idtype.off('select-' + ttype, _this.typeRecorders[i]);
            });
        }
        else {
            this.idtype.off('select', this.l);
        }
    };
    SelectionTypeRecorder.prototype.enable = function () {
        var _this = this;
        if (this.type) {
            this.type.split(',').forEach(function (ttype, i) {
                _this.idtype.on('select-' + ttype, _this.typeRecorders[i]);
            });
        }
        else {
            this.idtype.on('select', this.l);
        }
    };
    SelectionTypeRecorder.prototype.destroy = function () {
        this.disable();
        disabler.off('enable-' + this.idtype.id, this._enable);
        disabler.off('disable-' + this.idtype.id, this._disable);
    };
    return SelectionTypeRecorder;
}());
/**
 * utility class to record all the selections within the provenance graph
 */
var SelectionRecorder = /** @class */ (function () {
    function SelectionRecorder(graph, type, options) {
        if (options === void 0) { options = {}; }
        var _this = this;
        this.graph = graph;
        this.type = type;
        this.options = options;
        this.handler = [];
        this.adder = function (event, idtype) {
            if (_this.options.filter(idtype)) {
                _this.handler.push(new SelectionTypeRecorder(idtype, _this.graph, _this.type, _this.options));
            }
        };
        this.options = __WEBPACK_IMPORTED_MODULE_3_phovea_core_src_index__["a" /* mixin */]({
            filter: __WEBPACK_IMPORTED_MODULE_3_phovea_core_src_index__["o" /* constantTrue */],
            animated: false
        }, this.options);
        __WEBPACK_IMPORTED_MODULE_1_phovea_core_src_event__["c" /* on */]('register.idtype', this.adder);
        __WEBPACK_IMPORTED_MODULE_0_phovea_core_src_idtype__["e" /* list */]().forEach(function (d) {
            _this.adder(null, d);
        });
    }
    SelectionRecorder.prototype.destroy = function () {
        __WEBPACK_IMPORTED_MODULE_1_phovea_core_src_event__["d" /* off */]('register.idtype', this.adder);
        this.handler.forEach(function (h) { return h.destroy(); });
        this.handler.length = 0;
    };
    return SelectionRecorder;
}());

function create(graph, type, options) {
    if (options === void 0) { options = {}; }
    return new SelectionRecorder(graph, type, options);
}


/***/ }),

/***/ 598:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__idtype__ = __webpack_require__(622);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__datatype__ = __webpack_require__(621);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__graph__ = __webpack_require__(632);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__GraphBase__ = __webpack_require__(650);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__RemoteStorageGraph__ = __webpack_require__(681);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__MemoryGraph__ = __webpack_require__(670);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__LocalStorageGraph__ = __webpack_require__(669);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__internal_promise__ = __webpack_require__(228);
/* harmony export (immutable) */ __webpack_exports__["create"] = create;

/**
 * Created by sam on 12.02.2015.
 */









var GraphProxy = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](GraphProxy, _super);
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
            return size[__WEBPACK_IMPORTED_MODULE_4__graph__["f" /* DIM_NODES */]] || 0;
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
            return size[__WEBPACK_IMPORTED_MODULE_4__graph__["g" /* DIM_EDGES */]] || 0;
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
        if (factory === void 0) { factory = __WEBPACK_IMPORTED_MODULE_5__GraphBase__["b" /* defaultGraphFactory */]; }
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
        else if (type === 'given' && this.desc.graph instanceof __WEBPACK_IMPORTED_MODULE_4__graph__["e" /* AGraph */]) {
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
            return [__WEBPACK_IMPORTED_MODULE_4__graph__["h" /* IDTYPE_NODES */], __WEBPACK_IMPORTED_MODULE_4__graph__["i" /* IDTYPE_EDGES */]].map(__WEBPACK_IMPORTED_MODULE_1__idtype__["c" /* resolve */]);
        },
        enumerable: true,
        configurable: true
    });
    return GraphProxy;
}(__WEBPACK_IMPORTED_MODULE_2__datatype__["a" /* ADataType */]));
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

/***/ 599:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1____ = __webpack_require__(224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__datatype__ = __webpack_require__(621);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__IAtom__ = __webpack_require__(694);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__idtype__ = __webpack_require__(622);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__AAtom__ = __webpack_require__(693);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__range__ = __webpack_require__(619);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Atom", function() { return Atom; });
/* harmony export (immutable) */ __webpack_exports__["create"] = create;
/* harmony export (immutable) */ __webpack_exports__["asAtom"] = asAtom;
/**
 * Created by Samuel Gratzl on 14.02.2017.
 */







var Atom = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](Atom, _super);
    function Atom(desc, loaded) {
        var _this = _super.call(this, desc) || this;
        _this.loaded = loaded;
        return _this;
    }
    Atom.prototype.id = function () {
        return Promise.resolve(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__range__["c" /* list */])(this.loaded.id));
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
        value: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__datatype__["d" /* guessValueTypeDesc */])([value])
    }, options);
    var rowAssigner = options.rowassigner || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__idtype__["f" /* createLocalAssigner */])();
    var atom = {
        name: name,
        value: value,
        id: rowAssigner([name]).first
    };
    return new Atom(desc, atom);
}


/***/ }),

/***/ 602:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0____ = __webpack_require__(224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__idtype__ = __webpack_require__(622);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__idtype_IDType__ = __webpack_require__(630);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__event__ = __webpack_require__(226);
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
    var toSync = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__idtype__["e" /* list */])().filter(function (idType) { return (idType instanceof __WEBPACK_IMPORTED_MODULE_2__idtype_IDType__["a" /* default */] && options.filter(idType)); });
    toSync.forEach(function (idType) { return syncIDType(store, idType, options); });
    // watch new ones
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__event__["c" /* on */])('register.idtype', function (event, idType) {
        if (options.filter(idType)) {
            syncIDType(store, idType, options);
        }
    });
    return null;
}


/***/ }),

/***/ 619:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Range1D__ = __webpack_require__(627);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__CompositeRange1D__ = __webpack_require__(638);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Range1DGroup__ = __webpack_require__(640);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__Range__ = __webpack_require__(639);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__parser__ = __webpack_require__(675);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "l", function() { return __WEBPACK_IMPORTED_MODULE_3__Range__["c"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_3__Range__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return __WEBPACK_IMPORTED_MODULE_3__Range__["b"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return __WEBPACK_IMPORTED_MODULE_0__Range1D__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "k", function() { return __WEBPACK_IMPORTED_MODULE_1__CompositeRange1D__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return __WEBPACK_IMPORTED_MODULE_2__Range1DGroup__["a"]; });
/* harmony export (immutable) */ __webpack_exports__["g"] = parse;
/* harmony export (immutable) */ __webpack_exports__["i"] = range;
/* harmony export (immutable) */ __webpack_exports__["c"] = list;
/* harmony export (immutable) */ __webpack_exports__["h"] = join;
/* harmony export (immutable) */ __webpack_exports__["j"] = asUngrouped;
/* harmony export (immutable) */ __webpack_exports__["f"] = composite;
/* unused harmony export is */
/* unused harmony export cell */
/**
 * Created by Samuel Gratzl on 27.12.2016.
 */









/**
 * Interprets the parameter options and returns an appropriate range
 *
 * If it is null, returns a new range with all elements.
 * If the RangeLike is a range, then the range is returned unchanged.
 * If it is an array, the numbers in the array are treated as indices for a range.
 * If it is a string, the range is parsed according to the grammar defined in parser.ts
 *
 * @param arange something like a range
 * @returns {Range}
 */
function parse(arange) {
    if (arange === void 0) { arange = null; }
    if (arange === null) {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__Range__["a" /* all */])();
    }
    if (arange instanceof __WEBPACK_IMPORTED_MODULE_3__Range__["c" /* default */]) {
        return arange;
    }
    if (Array.isArray(arange)) {
        if (Array.isArray(arange[0])) {
            return list.apply(void 0, arange);
        }
        return list(arange);
    }
    //join given array as string combined with ,
    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__parser__["a" /* default */])(Array.from(arguments).map(String).join(','));
}
/**
 * Creates a new range that includes all elements in the data structure
 * @returns {any}
 */
function range() {
    if (arguments.length === 0) {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__Range__["a" /* all */])();
    }
    var r = new __WEBPACK_IMPORTED_MODULE_3__Range__["c" /* default */]();
    if (Array.isArray(arguments[0])) { //array mode
        Array.from(arguments).forEach(function (arr, i) {
            if (arr.length === 0) {
                return;
            }
            r.dim(i).setSlice(arr[0], arr[1], arr[2]);
        });
    }
    else if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
        // slice object mode
        Array.from(arguments).forEach(function (slice, i) {
            r.dim(i).setSlice(slice.from, slice.to, slice.step);
        });
    }
    else if (typeof arguments[0] === 'number') { //single slice mode
        r.dim(0).setSlice(arguments[0], arguments[1], arguments[2]);
    }
    return r;
}
function list() {
    if (arguments.length === 0) {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__Range__["a" /* all */])();
    }
    if (Array.isArray(arguments[0]) && arguments[0][0] instanceof __WEBPACK_IMPORTED_MODULE_0__Range1D__["a" /* default */]) {
        return new __WEBPACK_IMPORTED_MODULE_3__Range__["c" /* default */](arguments[0]);
    }
    else if (Array.isArray(arguments[0])) { //array mode
        var r_1 = new __WEBPACK_IMPORTED_MODULE_3__Range__["c" /* default */]();
        Array.from(arguments).forEach(function (arr, i) {
            if (arr instanceof __WEBPACK_IMPORTED_MODULE_0__Range1D__["a" /* default */]) {
                r_1.dims[i] = arr;
            }
            else {
                r_1.dim(i).setList(arr);
            }
        });
        return r_1;
    }
    else if (typeof arguments[0] === 'number') { //single slice mode
        var r = new __WEBPACK_IMPORTED_MODULE_3__Range__["c" /* default */]();
        r.dim(0).setList(Array.from(arguments));
        return r;
    }
    else if (arguments[0] instanceof __WEBPACK_IMPORTED_MODULE_0__Range1D__["a" /* default */]) {
        return new __WEBPACK_IMPORTED_MODULE_3__Range__["c" /* default */](Array.from(arguments));
    }
    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__Range__["b" /* none */])();
}
function join() {
    if (arguments.length === 0) {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__Range__["a" /* all */])();
    }
    var ranges = arguments[0];
    if (!Array.isArray(ranges)) { //array mode
        ranges = Array.from(arguments);
    }
    return new __WEBPACK_IMPORTED_MODULE_3__Range__["c" /* default */](ranges.map(function (r) { return r.dim(0); }));
}
/**
 * TODO document
 * @param range
 * @return {Range1DGroup}
 */
function asUngrouped(range) {
    return new __WEBPACK_IMPORTED_MODULE_2__Range1DGroup__["a" /* default */]('unnamed', 'gray', range);
}
/**
 * TODO document
 * @param name
 * @param groups
 * @return {CompositeRange1D}
 */
function composite(name, groups) {
    return new __WEBPACK_IMPORTED_MODULE_1__CompositeRange1D__["a" /* default */](name, groups);
}
/**
 * Tests if the given object is a range
 */
function is(obj) {
    return obj instanceof __WEBPACK_IMPORTED_MODULE_3__Range__["c" /* default */];
}
/**
 * TODO document
 * @param dimIndices
 * @return {any}
 */
function cell() {
    var dimIndices = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        dimIndices[_i] = arguments[_i];
    }
    return new __WEBPACK_IMPORTED_MODULE_3__Range__["c" /* default */](dimIndices.map(__WEBPACK_IMPORTED_MODULE_0__Range1D__["a" /* default */].single));
}


/***/ }),

/***/ 621:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index__ = __webpack_require__(224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__idtype__ = __webpack_require__(622);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__math__ = __webpack_require__(633);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__security__ = __webpack_require__(648);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return VALUE_TYPE_CATEGORICAL; });
/* unused harmony export VALUE_TYPE_STRING */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return VALUE_TYPE_REAL; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return VALUE_TYPE_INT; });
/* harmony export (immutable) */ __webpack_exports__["b"] = isDataType;
/* unused harmony export assignData */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ADataType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return DummyDataType; });
/* harmony export (immutable) */ __webpack_exports__["k"] = transpose;
/* harmony export (immutable) */ __webpack_exports__["j"] = mask;
/* harmony export (immutable) */ __webpack_exports__["i"] = categorical2partitioning;
/* unused harmony export defineDataType */
/* harmony export (immutable) */ __webpack_exports__["d"] = guessValueTypeDesc;
/* harmony export (immutable) */ __webpack_exports__["e"] = createDefaultDataDesc;
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 *
 * This file defines interfaces for various data types and their metadata.
 */






var VALUE_TYPE_CATEGORICAL = 'categorical';
var VALUE_TYPE_STRING = 'string';
var VALUE_TYPE_REAL = 'real';
var VALUE_TYPE_INT = 'int';
/**
 * since there is no instanceOf for interfaces
 * @param v
 * @return {any}
 */
function isDataType(v) {
    if (v === null || v === undefined) {
        return false;
    }
    if (v instanceof ADataType) {
        return true;
    }
    //sounds good
    return (typeof (v.idView) === 'function' && typeof (v.persist) === 'function' && typeof (v.restore) === 'function' && v instanceof __WEBPACK_IMPORTED_MODULE_2__idtype__["d" /* SelectAble */] && ('desc' in v) && ('dim' in v));
}
/**
 * utility to assign a dataset to an html element, similar to d3
 * @param node
 * @param data
 */
function assignData(node, data) {
    node.__data__ = data;
}
/**
 * dummy data type just holding the description
 */
var ADataType = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](ADataType, _super);
    function ADataType(desc) {
        var _this = _super.call(this) || this;
        _this.desc = desc;
        return _this;
    }
    Object.defineProperty(ADataType.prototype, "dim", {
        get: function () {
            return [];
        },
        enumerable: true,
        configurable: true
    });
    ADataType.prototype.ids = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__range__["a" /* all */])(); }
        return Promise.resolve(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__range__["d" /* none */])());
    };
    ADataType.prototype.idView = function (idRange) {
        return Promise.resolve(this);
    };
    Object.defineProperty(ADataType.prototype, "idtypes", {
        get: function () {
            return [];
        },
        enumerable: true,
        configurable: true
    });
    ADataType.prototype.persist = function () {
        return this.desc.id;
    };
    ADataType.prototype.restore = function (persisted) {
        return this;
    };
    ADataType.prototype.toString = function () {
        return this.persist();
    };
    return ADataType;
}(__WEBPACK_IMPORTED_MODULE_2__idtype__["d" /* SelectAble */]));

var DummyDataType = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](DummyDataType, _super);
    function DummyDataType(desc) {
        return _super.call(this, desc) || this;
    }
    return DummyDataType;
}(ADataType));

/**
 * transpose the given matrix
 * @param m
 * @returns {*}
 */
function transpose(m) {
    if (m.length === 0 || m[0].length === 0) {
        return [];
    }
    var r = m[0].map(function (i) { return [i]; });
    for (var i = 1; i < m.length; ++i) {
        m[i].forEach(function (v, i) { return r[i].push(v); });
    }
    return r;
}
function maskImpl(arr, missing) {
    if (Array.isArray(arr)) {
        var vs = arr;
        if (vs.indexOf(missing) >= 0) {
            return vs.map(function (v) { return v === missing ? NaN : v; });
        }
    }
    return arr === missing ? NaN : arr;
}
function mask(arr, desc) {
    if (desc.type === VALUE_TYPE_INT && 'missing' in desc) {
        return maskImpl(arr, desc.missing);
    }
    if (desc.type === VALUE_TYPE_INT || desc.type === VALUE_TYPE_REAL) {
        // replace null values with Number.NaN
        return maskImpl(arr, null);
    }
    return arr;
}
/**
 * converts the given categorical data to a grouped range
 * @param data
 * @param categories
 * @param options
 * @return {CompositeRange1D}
 */
function categorical2partitioning(data, categories, options) {
    if (options === void 0) { options = {}; }
    var m = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["a" /* mixin */])({
        skipEmptyCategories: true,
        colors: ['gray'],
        labels: null,
        name: 'Partitioning'
    }, options);
    var groups = categories.map(function (d, i) {
        return {
            name: m.labels ? m.labels[i] : d.toString(),
            color: m.colors[Math.min(i, m.colors.length - 1)],
            indices: []
        };
    });
    data.forEach(function (d, j) {
        var i = categories.indexOf(d);
        if (i >= 0) {
            groups[i].indices.push(j);
        }
    });
    if (m.skipEmptyCategories) {
        groups = groups.filter(function (g) { return g.indices.length > 0; });
    }
    var granges = groups.map(function (g) {
        return new __WEBPACK_IMPORTED_MODULE_4__range__["e" /* Range1DGroup */](g.name, g.color, __WEBPACK_IMPORTED_MODULE_4__range__["b" /* Range1D */].from(g.indices));
    });
    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__range__["f" /* composite */])(m.name, granges);
}
/**
 * utility function to create a datatype, designed for JavaScript usage
 * @param name
 * @param functions the functions to add
 * @return {function(IDataDescription): undefined}
 */
function defineDataType(name, functions) {
    function DataType(desc) {
        ADataType.call(this, desc);
        if (typeof (this.init) === 'function') {
            this.init.apply(this, Array.from(arguments));
        }
    }
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["d" /* extendClass */])(DataType, ADataType);
    DataType.prototype.toString = function () { return name; };
    DataType.prototype = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["a" /* mixin */])(DataType.prototype, functions);
    return DataType;
}
function isNumeric(obj) {
    return (obj - parseFloat(obj) + 1) >= 0;
}
/**
 * guesses the type of the given value array returning its description
 * @param arr
 * @return {any}
 */
function guessValueTypeDesc(arr) {
    if (arr.length === 0) {
        return { type: 'string' }; //doesn't matter
    }
    var test = arr[0];
    if (typeof test === 'number' || isNumeric(test)) {
        return { type: VALUE_TYPE_REAL, range: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__math__["a" /* extent */])(arr.map(parseFloat)) };
    }
    var values = new Set(arr);
    if (values.size < arr.length * 0.2 || values.size < 8) {
        //guess as categorical
        return { type: 'categorical', categories: Array.from(values.values()) };
    }
    return { type: 'string' };
}
/**
 * creates a default data description
 * @return {{type: string, id: string, name: string, fqname: string, description: string, creator: string, ts: number}}
 */
function createDefaultDataDesc(namespace) {
    if (namespace === void 0) { namespace = 'localData'; }
    var id = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["e" /* uniqueString */])(namespace);
    return {
        type: 'default',
        id: id,
        name: id,
        fqname: id,
        description: '',
        creator: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__security__["a" /* currentUserNameOrAnonymous */])(),
        ts: Date.now()
    };
}


/***/ }),

/***/ 622:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__manager__ = __webpack_require__(652);
/* unused harmony reexport clearSelection */
/* unused harmony reexport EVENT_REGISTER_IDTYPE */
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return __WEBPACK_IMPORTED_MODULE_0__manager__["b"]; });
/* unused harmony reexport listAll */
/* unused harmony reexport persist */
/* unused harmony reexport register */
/* unused harmony reexport restore */
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return __WEBPACK_IMPORTED_MODULE_0__manager__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return __WEBPACK_IMPORTED_MODULE_0__manager__["c"]; });
/* unused harmony reexport isInternalIDType */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ASelectAble__ = __webpack_require__(651);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return __WEBPACK_IMPORTED_MODULE_1__ASelectAble__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__IIDType__ = __webpack_require__(625);
/* unused harmony reexport asSelectOperation */
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return __WEBPACK_IMPORTED_MODULE_2__IIDType__["a"]; });
/* unused harmony reexport hoverSelectionType */
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_2__IIDType__["b"]; });
/* unused harmony reexport toSelectOperation */
/* unused harmony reexport integrateSelection */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__IDType__ = __webpack_require__(630);
/* unused harmony reexport IDType */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__AProductSelectAble__ = __webpack_require__(663);
/* unused harmony reexport AProductSelectAble */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ProductIDType__ = __webpack_require__(636);
/* unused harmony reexport ProductIDType */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__ObjectManager__ = __webpack_require__(672);
/* unused harmony reexport ObjectManager */
/* unused harmony reexport isId */
/* unused harmony reexport toId */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__LocalIDAssigner__ = __webpack_require__(671);
/* unused harmony reexport LocalIDAssigner */
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return __WEBPACK_IMPORTED_MODULE_7__LocalIDAssigner__["a"]; });
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */










/***/ }),

/***/ 625:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__range__ = __webpack_require__(619);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return defaultSelectionType; });
/* unused harmony export hoverSelectionType */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return SelectOperation; });
/* unused harmony export toSelectOperation */
/* harmony export (immutable) */ __webpack_exports__["c"] = asSelectOperation;
/* harmony export (immutable) */ __webpack_exports__["d"] = fillWithNone;
/* unused harmony export integrateSelection */
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

var defaultSelectionType = 'selected';
var hoverSelectionType = 'hovered';
var SelectOperation;
(function (SelectOperation) {
    SelectOperation[SelectOperation["SET"] = 0] = "SET";
    SelectOperation[SelectOperation["ADD"] = 1] = "ADD";
    SelectOperation[SelectOperation["REMOVE"] = 2] = "REMOVE";
})(SelectOperation || (SelectOperation = {}));
function toSelectOperation(event) {
    var ctryKeyDown, shiftDown, altDown, metaDown;
    if (typeof event === 'boolean') {
        ctryKeyDown = event;
        altDown = arguments[1] || false;
        shiftDown = arguments[2] || false;
        metaDown = arguments[3] || false;
    }
    else {
        ctryKeyDown = event.ctrlKey || false;
        altDown = event.altKey || false;
        shiftDown = event.shiftKey || false;
        metaDown = event.metaKey || false;
    }
    if (ctryKeyDown || shiftDown) {
        return SelectOperation.ADD;
    }
    else if (altDown || metaDown) {
        return SelectOperation.REMOVE;
    }
    return SelectOperation.SET;
}
function asSelectOperation(v) {
    if (!v) {
        return SelectOperation.SET;
    }
    if (typeof v === 'string') {
        switch (v.toLowerCase()) {
            case 'add':
                return SelectOperation.ADD;
            case 'remove':
                return SelectOperation.REMOVE;
            default:
                return SelectOperation.SET;
        }
    }
    return +v;
}
function fillWithNone(r, ndim) {
    while (r.ndim < ndim) {
        r.dims[r.ndim] = __WEBPACK_IMPORTED_MODULE_0__range__["b" /* Range1D */].none();
    }
    return r;
}
function integrateSelection(current, additional, operation) {
    if (operation === void 0) { operation = SelectOperation.SET; }
    var next = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__range__["g" /* parse */])(additional);
    switch (operation) {
        case SelectOperation.ADD:
            return current.union(next);
        case SelectOperation.REMOVE:
            return current.without(next);
        default:
            return next;
    }
}


/***/ }),

/***/ 627:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__internal_RangeElem__ = __webpack_require__(654);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__iterator__ = __webpack_require__(637);
/**
 * Created by Samuel Gratzl on 27.12.2016.
 */


function sortNumeric(a, b) {
    return a - b;
}
var Range1D = /** @class */ (function () {
    function Range1D(arg) {
        if (arg instanceof Range1D) {
            this.arr = arg.arr;
        }
        else if (Array.isArray(arg)) {
            this.arr = arg;
        }
        else {
            this.arr = [];
        }
    }
    Object.defineProperty(Range1D.prototype, "length", {
        get: function () {
            return this.size();
        },
        enumerable: true,
        configurable: true
    });
    Range1D.all = function () {
        return new Range1D([__WEBPACK_IMPORTED_MODULE_0__internal_RangeElem__["a" /* default */].all()]);
    };
    Range1D.single = function (item) {
        return new Range1D([__WEBPACK_IMPORTED_MODULE_0__internal_RangeElem__["a" /* default */].single(item)]);
    };
    Range1D.none = function () {
        return new Range1D();
    };
    Range1D.from = function (indices) {
        return new Range1D(Range1D.compress(indices));
    };
    Range1D.compress = function (indices) {
        if (indices.length === 0) {
            return [];
        }
        else if (indices.length === 1) {
            return [__WEBPACK_IMPORTED_MODULE_0__internal_RangeElem__["a" /* default */].single(indices[0])];
        }
        //return indices.map(RangeElem.single);
        var r = [], deltas = indices.slice(1).map(function (e, i) { return e - indices[i]; });
        var start = 0, act = 1, i = 0;
        while (act < indices.length) {
            while (deltas[start] === deltas[act - 1] && act < indices.length) { //while the same delta
                act++;
            }
            if (act === start + 1) { //just a single item used
                r.push(__WEBPACK_IMPORTED_MODULE_0__internal_RangeElem__["a" /* default */].single(indices[start]));
            }
            else {
                //+1 since end is excluded
                //fix while just +1 is allowed and -1 is not allowed
                if (deltas[start] === 1) {
                    r.push(__WEBPACK_IMPORTED_MODULE_0__internal_RangeElem__["a" /* default */].range(indices[start], indices[act - 1] + deltas[start], deltas[start]));
                }
                else {
                    for (i = start; i < act; i++) {
                        r.push(__WEBPACK_IMPORTED_MODULE_0__internal_RangeElem__["a" /* default */].single(indices[i]));
                    }
                }
            }
            start = act;
            act += 1;
        }
        while (start < indices.length) { //corner case by adding act+1, it might happen that the last one isnt considered
            r.push(__WEBPACK_IMPORTED_MODULE_0__internal_RangeElem__["a" /* default */].single(indices[start++]));
        }
        return r;
    };
    Object.defineProperty(Range1D.prototype, "isAll", {
        get: function () {
            return this.arr.length === 1 && this.at(0).isAll;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Range1D.prototype, "isNone", {
        get: function () {
            return this.arr.length === 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Range1D.prototype, "isUnbound", {
        get: function () {
            return this.arr.some(function (d) { return d.isUnbound; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Range1D.prototype, "isList", {
        get: function () {
            return this.arr.every(function (d) { return d.isSingle; });
        },
        enumerable: true,
        configurable: true
    });
    Range1D.prototype.push = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        var _a;
        function p(item) {
            if (typeof item === 'string') {
                return __WEBPACK_IMPORTED_MODULE_0__internal_RangeElem__["a" /* default */].parse(item.toString());
            }
            else if (typeof item === 'number') {
                return __WEBPACK_IMPORTED_MODULE_0__internal_RangeElem__["a" /* default */].single(item);
            }
            else if (Array.isArray(item)) {
                return new __WEBPACK_IMPORTED_MODULE_0__internal_RangeElem__["a" /* default */](item[0], item[1], item[2]);
            }
            return item;
        }
        return (_a = this.arr).push.apply(_a, items.map(p));
    };
    Range1D.prototype.pushSlice = function (from, to, step) {
        if (to === void 0) { to = -1; }
        if (step === void 0) { step = 1; }
        this.arr.push(new __WEBPACK_IMPORTED_MODULE_0__internal_RangeElem__["a" /* default */](from, to, step));
    };
    Range1D.prototype.pushList = function (indices) {
        var _a;
        (_a = this.arr).push.apply(_a, Range1D.compress(indices));
    };
    Range1D.prototype.setSlice = function (from, to, step) {
        if (to === void 0) { to = -1; }
        if (step === void 0) { step = 1; }
        this.arr.length = 0;
        this.pushSlice(from, to, step);
    };
    Range1D.prototype.setList = function (indices) {
        this.arr.length = 0;
        this.pushList(indices);
    };
    Range1D.prototype.at = function (index) {
        if (index < 0) {
            index += this.length;
        }
        if (index < 0 || index >= this.arr.length) {
            return __WEBPACK_IMPORTED_MODULE_0__internal_RangeElem__["a" /* default */].none();
        }
        return this.arr[index];
    };
    Range1D.prototype.size = function (size) {
        var t = this.arr.map(function (d) { return d.size(size); });
        return t.reduce(function (a, b) { return a + b; }, 0);
    };
    Object.defineProperty(Range1D.prototype, "isIdentityRange", {
        /**
         * whether this range is the identity, i.e. the first natural numbers starting with 0
         * @return {boolean}
         */
        get: function () {
            return this.arr.length === 1 && this.arr[0].from === 0 && this.arr[0].step === 1;
        },
        enumerable: true,
        configurable: true
    });
    Range1D.prototype.repeat = function (ntimes) {
        if (ntimes === void 0) { ntimes = 1; }
        if (ntimes === 1) {
            return this;
        }
        var r = this.arr.slice();
        //push n times
        for (var i = 1; i < ntimes; ++i) {
            r.push.apply(r, this.arr);
        }
        return new Range1D(r);
    };
    /**
     * combines this range with another and returns a new one
     * this = (1,3,5,7), sub = (1,2) -> (1,2)(1,3,5,7) = (3,5)
     * @returns {Range1D}
     */
    Range1D.prototype.preMultiply = function (sub, size) {
        if (this.isAll) {
            return sub.clone();
        }
        if (sub.isAll) {
            return this.clone();
        }
        if (sub.isNone || this.isNone) {
            return Range1D.none();
        }
        if (this.isIdentityRange) { //identity lookup
            return sub.clone();
        }
        //TODO optimize
        var l = this.iter(size).asList();
        var mapImpl = function (sub) {
            var s = sub.iter(l.length);
            var r = [];
            s.forEach(function (i) {
                if (i >= 0 && i < l.length) { //check for out of range
                    r.push(l[i]);
                }
            });
            return sub.fromLike(r);
        };
        if (typeof sub.fromLikeComposite === 'function') {
            var csub = sub;
            return csub.fromLikeComposite(csub.groups.map(mapImpl));
        }
        else {
            return mapImpl(sub);
        }
    };
    /**
     * logical union between two ranges
     * @param other
     * @returns {Range1D}
     */
    Range1D.prototype.union = function (other, size) {
        if (this.isAll || other.isNone) {
            return this.clone();
        }
        if (other.isAll || this.isNone) {
            return other.clone();
        }
        var r = this.iter(size).asList();
        var it2 = other.iter(size);
        it2.forEach(function (i) {
            if (r.indexOf(i) < 0) {
                r.push(i);
            }
        });
        return other.fromLike(r.sort(sortNumeric));
    };
    /**
     * logical intersection between two ranges
     * @param other
     * @param size
     * @returns {Range1D}
     */
    Range1D.prototype.intersect = function (other, size) {
        if (this.isNone || other.isNone) {
            return Range1D.none();
        }
        if (this.isAll) {
            return other.clone();
        }
        if (other.isAll) {
            return this.clone();
        }
        var it1 = this.iter(size).asList();
        var it2 = other.iter(size);
        var r = [];
        it2.forEach(function (i) {
            if (it1.indexOf(i) >= 0) {
                r.push(i);
            }
        });
        return other.fromLike(r.sort(sortNumeric));
    };
    Range1D.prototype.toSet = function (size) {
        return this.removeDuplicates(size);
    };
    /**
     * logical difference between two ranges
     * @param without
     * @param size
     * @returns {Range1D}
     */
    Range1D.prototype.without = function (without, size) {
        if (this.isNone || without.isNone) {
            return this.clone();
        }
        if (without.isAll) {
            return Range1D.none();
        }
        var it1 = this.iter(size);
        var it2 = without.iter(size).asList();
        var r = [];
        it1.forEach(function (i) {
            if (it2.indexOf(i) < 0) {
                r.push(i);
            }
        });
        return Range1D.from(r.sort(sortNumeric));
    };
    /**
     * clones this range
     * @returns {Range1D}
     */
    Range1D.prototype.clone = function () {
        return new Range1D(this.arr.map(function (d) { return d.clone(); }));
    };
    /**
     * inverts the given index to the original range
     * @param index
     * @param size the underlying size for negative indices
     * @returns {number}
     */
    Range1D.prototype.invert = function (index, size) {
        if (this.isAll) {
            return index;
        }
        if (this.isNone) {
            return -1; //not mapped
        }
        // find the range element that contain the index-th element
        var s = this.arr[0].size(size);
        var act = 0, total = s;
        var nElems = this.arr.length - 1;
        while (total < index && act < nElems) {
            act++;
            s = this.arr[act].size(size);
            total += s;
        }
        if (act >= this.arr.length) {
            return -1; //not mapped
        }
        return this.arr[act].invert(index - total + s, size);
    };
    /**
     * returns the index(ices) of the given elements
     * @return {*}
     */
    Range1D.prototype.indexOf = function () {
        if (arguments[0] instanceof Range) {
            return this.indexRangeOf(arguments[0], arguments[1]);
        }
        var arr;
        var base = this.iter().asList();
        if (arguments.length === 1) {
            if (typeof arguments[0] === 'number') {
                return base.indexOf(arguments[0]);
            }
            arr = arguments[0];
        }
        else {
            arr = Array.from(arguments);
        }
        if (arr.length === 0) {
            return [];
        }
        return arr.map(function (index, i) { return base.indexOf(index); });
    };
    /**
     * returns the range representing the indices of the given range within the current data
     * @param r
     * @param size
     * @return {Range1D}
     */
    Range1D.prototype.indexRangeOf = function (r, size) {
        if (r.isNone || this.isNone) {
            return r.fromLike([]);
        }
        if (r.isAll) { //index of all is still all
            return Range1D.all();
        }
        //
        var mapImpl;
        if (this.isIdentityRange) {
            var end_1 = this.arr[0].to;
            mapImpl = function (d, result) {
                if (d >= 0 && d < end_1) {
                    result.push(d);
                }
            };
        }
        else {
            var arr_1 = this.iter().asList();
            mapImpl = function (d, result) {
                var i = arr_1.indexOf(d);
                if (i >= 0) {
                    result.push(i);
                }
            };
        }
        if (typeof r.fromLikeComposite === 'function') {
            var csub = r;
            return csub.fromLikeComposite(csub.groups.map(function (g) {
                var result = [];
                g.forEach(function (d) { return mapImpl(d, result); });
                return g.fromLike(result);
            }));
        }
        else {
            var result_1 = [];
            r.forEach(function (d) { return mapImpl(d, result_1); });
            return r.fromLike(result_1);
        }
    };
    /**
     * filters the given data according to this range
     * @param data
     * @param size the total size for resolving negative indices
     * @returns {*}
     */
    Range1D.prototype.filter = function (data, size, transform) {
        if (transform === void 0) { transform = function (d) { return d; }; }
        if (this.isAll) {
            return data.map(transform);
        }
        var it = this.iter(size);
        //optimization
        if (it.byOne && it instanceof __WEBPACK_IMPORTED_MODULE_1__iterator__["c" /* Iterator */]) {
            return data.slice(it.from, it.to).map(transform);
            //} else if (it.byMinusOne) {
            //  var d = data.slice();
            //  d.reverse();
            //  return d;
        }
        else {
            var r = [];
            while (it.hasNext()) {
                r.push(transform(data[it.next()]));
            }
            return r;
        }
    };
    /**
     * creates an iterator of this range
     * @param size the underlying size for negative indices
     */
    Range1D.prototype.iter = function (size) {
        if (this.isList) {
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__iterator__["d" /* forList */])(this.arr.map(function (d) { return d.from; }));
        }
        var its = this.arr.map(function (d) { return d.iter(size); });
        return __WEBPACK_IMPORTED_MODULE_1__iterator__["e" /* concat */].apply(null, its);
    };
    Object.defineProperty(Range1D.prototype, "__iterator__", {
        get: function () {
            return this.iter();
        },
        enumerable: true,
        configurable: true
    });
    Range1D.prototype.asList = function (size) {
        return this.iter(size).asList();
    };
    Object.defineProperty(Range1D.prototype, "first", {
        get: function () {
            if (this.isNone) {
                return null;
            }
            return this.arr[0].from;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Range1D.prototype, "last", {
        get: function () {
            if (this.isNone) {
                return null;
            }
            return this.arr[this.arr.length - 1].from;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * for each element
     * @param callbackfn
     * @param thisArg
     */
    Range1D.prototype.forEach = function (callbackfn, thisArg) {
        return this.iter().forEach(callbackfn, thisArg);
    };
    Range1D.prototype.contains = function (value, size) {
        return this.arr.some(function (elem) { return elem.contains(value, size); });
    };
    /**
     * sort
     * @param cmp
     * @return {Range1D}
     */
    Range1D.prototype.sort = function (cmp) {
        if (cmp === void 0) { cmp = sortNumeric; }
        var arr = this.iter().asList();
        var r = arr.sort(cmp);
        return this.fromLike(r);
    };
    Range1D.prototype.removeDuplicates = function (size) {
        var arr = this.iter().asList();
        arr = arr.sort(sortNumeric);
        arr = arr.filter(function (di, i) { return di !== arr[i - 1]; }); //same value as before, remove
        return Range1D.from(arr);
    };
    /**
     * reverts the order of this range
     */
    Range1D.prototype.reverse = function () {
        var a = this.arr.map(function (r) { return r.reverse(); });
        a.reverse();
        return new Range1D(a);
    };
    Range1D.prototype.toString = function () {
        if (this.isAll) {
            return '';
        }
        if (this.length === 1) {
            return this.arr[0].toString();
        }
        return '(' + this.arr.join(',') + ')';
    };
    Range1D.prototype.eq = function (other) {
        if (this === other || (this.isAll && other.isAll) || (this.isNone && other.isNone)) {
            return true;
        }
        //TODO more performant comparison
        return this.toString() === other.toString();
    };
    Range1D.prototype.fromLike = function (indices) {
        return Range1D.from(indices);
    };
    return Range1D;
}());
/* harmony default export */ __webpack_exports__["a"] = Range1D;


/***/ }),

/***/ 629:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1____ = __webpack_require__(224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__event__ = __webpack_require__(226);
/* unused harmony export GLOBAL_EVENT_AJAX_PRE_SEND */
/* unused harmony export GLOBAL_EVENT_AJAX_POST_SEND */
/* unused harmony export send */
/* unused harmony export getJSON */
/* unused harmony export getData */
/* harmony export (immutable) */ __webpack_exports__["d"] = api2absURL;
/* unused harmony export encodeParams */
/* unused harmony export setDefaultOfflineGenerator */
/* harmony export (immutable) */ __webpack_exports__["b"] = sendAPI;
/* harmony export (immutable) */ __webpack_exports__["a"] = getAPIJSON;
/* harmony export (immutable) */ __webpack_exports__["c"] = getAPIData;
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
// to resolve the window extensions
/// <reference types="whatwg-fetch" />

/**
 * Created by Samuel Gratzl on 04.08.2014.
 */


var GLOBAL_EVENT_AJAX_PRE_SEND = 'ajaxPreSend';
var GLOBAL_EVENT_AJAX_POST_SEND = 'ajaxPostSend';
var AjaxError = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](AjaxError, _super);
    function AjaxError(response, message) {
        var _this = _super.call(this, message ? message : response.statusText) || this;
        _this.response = response;
        // Set the prototype explicitly. needed for Typescript 2.1
        Object.setPrototypeOf(_this, AjaxError.prototype);
        return _this;
    }
    return AjaxError;
}(Error));
function checkStatus(response) {
    if (response.ok) {
        return response;
    }
    else {
        throw new AjaxError(response);
    }
}
function parseType(expectedDataType, response) {
    switch (expectedDataType.trim().toLowerCase()) {
        case 'json':
        case 'application/json':
            return response.json();
        case 'text':
        case 'text/plain':
            return response.text();
        case 'blob':
            return response.blob();
        case 'arraybuffer':
            return response.arrayBuffer();
        default:
            throw new AjaxError(response, "unknown expected data type: \"" + expectedDataType + "\"");
    }
}
/**
 * sends an XML http request to the server
 * @param url url
 * @param data arguments
 * @param method the http method
 * @param expectedDataType expected data type to return, in case of JSON it will be parsed using JSON.parse
 * @param requestBody body mime type, default auto derive
 * @returns {Promise<any>}
 */
function send(url, data, method, expectedDataType, requestBody) {
    if (data === void 0) { data = {}; }
    if (method === void 0) { method = 'GET'; }
    if (expectedDataType === void 0) { expectedDataType = 'json'; }
    if (requestBody === void 0) { requestBody = 'formdata'; }
    return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
        var options, mimetype, r, _a, output;
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_b) {
            switch (_b.label) {
                case 0:
                    // for compatibility
                    method = method.toUpperCase();
                    // need to encode the body in the url in case of GET and HEAD
                    if (method === 'GET' || method === 'HEAD') {
                        data = encodeParams(data); //encode in url
                        if (data) {
                            url += (/\?/.test(url) ? '&' : '?') + data;
                            data = null;
                        }
                    }
                    options = {
                        credentials: 'same-origin',
                        method: method,
                        headers: {
                            'Accept': 'application/json'
                        },
                    };
                    if (data) {
                        mimetype = '';
                        switch (requestBody.trim().toLowerCase()) {
                            case 'json':
                            case 'application/json':
                                mimetype = 'application/json';
                                options.body = typeof data === 'string' ? data : JSON.stringify(data);
                                break;
                            case 'text':
                            case 'text/plain':
                                mimetype = 'text/plain';
                                options.body = String(data);
                                break;
                            case 'blob':
                            case 'arraybuffer':
                                mimetype = 'application/octet-stream';
                                options.body = data;
                                break;
                            default:
                                if (data instanceof FormData) {
                                    options.body = data;
                                }
                                else {
                                    mimetype = 'application/x-www-form-urlencoded';
                                    options.body = encodeParams(data);
                                }
                        }
                        if (mimetype) {
                            options.headers['Content-Type'] = mimetype;
                        }
                    }
                    // there are no typings for fetch so far
                    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__event__["a" /* fire */])(GLOBAL_EVENT_AJAX_PRE_SEND, url, options);
                    _a = checkStatus;
                    return [4 /*yield*/, self.fetch(url, options)];
                case 1:
                    r = _a.apply(void 0, [_b.sent()]);
                    output = parseType(expectedDataType, r);
                    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__event__["a" /* fire */])(GLOBAL_EVENT_AJAX_POST_SEND, url, options, r, output);
                    return [2 /*return*/, output];
            }
        });
    });
}
/**
 * to get some ajax json file
 * @param url
 * @param data
 * @returns {any}
 */
function getJSON(url, data) {
    if (data === void 0) { data = {}; }
    return send(url, data);
}
/**
 * get some generic data via ajax
 * @param url
 * @param data
 * @param expectedDataType
 * @returns {any}
 */
function getData(url, data, expectedDataType) {
    if (data === void 0) { data = {}; }
    if (expectedDataType === void 0) { expectedDataType = 'json'; }
    return send(url, data, 'GET', expectedDataType);
}
/**
 * converts the given api url to an absolute with optional get parameters
 * @param url
 * @param data
 * @returns {string}
 */
function api2absURL(url, data) {
    if (data === void 0) { data = null; }
    url = "" + __WEBPACK_IMPORTED_MODULE_1____["g" /* server_url */] + url + __WEBPACK_IMPORTED_MODULE_1____["h" /* server_json_suffix */];
    data = encodeParams(data);
    if (data) {
        url += (/\?/.test(url) ? '&' : '?') + data;
    }
    return url;
}
/**
 * convert a given object to url data similar to JQuery
 * @param data
 * @returns {any}
 */
function encodeParams(data) {
    if (data === void 0) { data = null; }
    if (data === null) {
        return null;
    }
    if (typeof data === 'string') {
        return encodeURIComponent(data);
    }
    var keys = Object.keys(data);
    if (keys.length === 0) {
        return null;
    }
    var s = [];
    function add(prefix, key, value) {
        if (Array.isArray(value)) {
            value.forEach(function (v, i) {
                if (typeof v === 'object') {
                    add(prefix, key + "[" + i + "]", v);
                }
                else {
                    //primitive values uses the same key
                    add(prefix, key + "[]", v);
                }
            });
        }
        else if (value == null) {
            // skip
        }
        else if (typeof value === 'object') {
            Object.keys(value).forEach(function (v) {
                add(prefix, key + "[" + v + "]", value[v]);
            });
        }
        else {
            s.push(encodeURIComponent(prefix + key) + '=' + encodeURIComponent(value));
        }
    }
    keys.forEach(function (key) {
        add('', key, data[key]);
    });
    // Return the resulting serialization
    return s.join('&').replace(/%20/g, '+');
}
var defaultGenerator = function () { return Promise.reject('offline'); };
function setDefaultOfflineGenerator(generator) {
    defaultGenerator = generator || (function () { return Promise.reject('offline'); });
}
/**
 * handler in case phovea is set to be in offline mode
 * @param generator
 * @param data
 * @param url
 * @returns {Promise<OfflineGenerator>}
 */
function offline(generator, url, data) {
    return Promise.resolve(typeof generator === 'function' ? generator(data, url) : generator);
}
/**
 * api version of send
 * @param url api relative url
 * @param data arguments
 * @param method http method
 * @param expectedDataType expected data type to return, in case of JSON it will be parsed using JSON.parse
 * @param offlineGenerator in case phovea is set to be offline
 * @returns {Promise<any>}
 */
function sendAPI(url, data, method, expectedDataType, offlineGenerator) {
    if (data === void 0) { data = {}; }
    if (method === void 0) { method = 'GET'; }
    if (expectedDataType === void 0) { expectedDataType = 'json'; }
    if (offlineGenerator === void 0) { offlineGenerator = defaultGenerator; }
    if (__WEBPACK_IMPORTED_MODULE_1____["i" /* offline */]) {
        return offline(offlineGenerator, url, data);
    }
    return send(api2absURL(url), data, method, expectedDataType);
}
/**
 * api version of getJSON
 * @param url api relative url
 * @param data arguments
 * @param offlineGenerator in case of offline flag is set what should be returned
 * @returns {Promise<any>}
 */
function getAPIJSON(url, data, offlineGenerator) {
    if (data === void 0) { data = {}; }
    if (offlineGenerator === void 0) { offlineGenerator = defaultGenerator; }
    if (__WEBPACK_IMPORTED_MODULE_1____["i" /* offline */]) {
        return offline(offlineGenerator, url, data);
    }
    return getJSON(api2absURL(url), data);
}
/**
 * api version of getData
 * @param url api relative url
 * @param data arguments
 * @param expectedDataType expected data type to return, in case of JSON it will be parsed using JSON.parse
 * @param offlineGenerator in case of offline flag is set what should be returned
 * @returns {Promise<any>}
 */
function getAPIData(url, data, expectedDataType, offlineGenerator) {
    if (data === void 0) { data = {}; }
    if (expectedDataType === void 0) { expectedDataType = 'json'; }
    if (offlineGenerator === void 0) { offlineGenerator = function () { return defaultGenerator; }; }
    if (__WEBPACK_IMPORTED_MODULE_1____["i" /* offline */]) {
        return offline(offlineGenerator, url, data);
    }
    return getData(api2absURL(url), data, expectedDataType);
}


/***/ }),

/***/ 630:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ajax__ = __webpack_require__(629);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__event__ = __webpack_require__(226);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__IIDType__ = __webpack_require__(625);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__manager__ = __webpack_require__(652);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__internal_promise__ = __webpack_require__(228);
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */







/**
 * An IDType is a semantic aggregation of an entity type, like Patient and Gene.
 *
 * An entity is tracked by a unique identifier (integer) within the system,
 * which is mapped to a common, external identifier or name (string) as well.
 */
var IDType = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](IDType, _super);
    /**
     * @param id the system identifier of this IDType
     * @param name the name of this IDType for external presentation
     * @param names the plural form of above name
     * @param internal whether this is an internal type or not
     */
    function IDType(id, name, names, internal) {
        if (internal === void 0) { internal = false; }
        var _this = _super.call(this) || this;
        _this.id = id;
        _this.name = name;
        _this.names = names;
        _this.internal = internal;
        /**
         * the current selections
         */
        _this.sel = new Map();
        // TODO: is this cache ever emptied, or do we assume a reasonable upper bound on the entities in IDType?
        _this.name2idCache = new Map();
        _this.id2nameCache = new Map();
        _this.canBeMappedTo = null;
        return _this;
    }
    IDType.prototype.persist = function () {
        var s = {};
        this.sel.forEach(function (v, k) { return s[k] = v.toString(); });
        return {
            sel: s,
            name: this.name,
            names: this.names
        };
    };
    IDType.prototype.restore = function (persisted) {
        var _this = this;
        this.name = persisted.name;
        this.names = persisted.names;
        Object.keys(persisted.sel).forEach(function (type) { return _this.sel.set(type, persisted.sel[type]); });
        return this;
    };
    IDType.prototype.toString = function () {
        return this.name;
    };
    IDType.prototype.selectionTypes = function () {
        return Array.from(this.sel.keys());
    };
    /**
     * return the current selections of the given type
     * @param type optional the selection type
     * @returns {Range}
     */
    IDType.prototype.selections = function (type) {
        if (type === void 0) { type = __WEBPACK_IMPORTED_MODULE_4__IIDType__["a" /* defaultSelectionType */]; }
        if (this.sel.has(type)) {
            return this.sel.get(type);
        }
        var v = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__range__["d" /* none */])();
        this.sel.set(type, v);
        return v;
    };
    IDType.prototype.select = function () {
        var a = Array.from(arguments);
        var type = (typeof a[0] === 'string') ? a.shift() : __WEBPACK_IMPORTED_MODULE_4__IIDType__["a" /* defaultSelectionType */], range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__range__["g" /* parse */])(a[0]), op = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__IIDType__["c" /* asSelectOperation */])(a[1]);
        return this.selectImpl(range, op, type);
    };
    IDType.prototype.selectImpl = function (range, op, type) {
        if (op === void 0) { op = __WEBPACK_IMPORTED_MODULE_4__IIDType__["b" /* SelectOperation */].SET; }
        if (type === void 0) { type = __WEBPACK_IMPORTED_MODULE_4__IIDType__["a" /* defaultSelectionType */]; }
        var b = this.selections(type);
        var newValue = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__range__["d" /* none */])();
        switch (op) {
            case __WEBPACK_IMPORTED_MODULE_4__IIDType__["b" /* SelectOperation */].SET:
                newValue = range;
                break;
            case __WEBPACK_IMPORTED_MODULE_4__IIDType__["b" /* SelectOperation */].ADD:
                newValue = b.union(range);
                break;
            case __WEBPACK_IMPORTED_MODULE_4__IIDType__["b" /* SelectOperation */].REMOVE:
                newValue = b.without(range);
                break;
        }
        if (b.eq(newValue)) {
            return b;
        }
        this.sel.set(type, newValue);
        var added = op !== __WEBPACK_IMPORTED_MODULE_4__IIDType__["b" /* SelectOperation */].REMOVE ? range : __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__range__["d" /* none */])();
        var removed = (op === __WEBPACK_IMPORTED_MODULE_4__IIDType__["b" /* SelectOperation */].ADD ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__range__["d" /* none */])() : (op === __WEBPACK_IMPORTED_MODULE_4__IIDType__["b" /* SelectOperation */].SET ? b : range));
        this.fire(IDType.EVENT_SELECT, type, newValue, added, removed, b);
        this.fire(IDType.EVENT_SELECT + "-" + type, newValue, added, removed, b);
        return b;
    };
    IDType.prototype.clear = function (type) {
        if (type === void 0) { type = __WEBPACK_IMPORTED_MODULE_4__IIDType__["a" /* defaultSelectionType */]; }
        return this.selectImpl(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__range__["d" /* none */])(), __WEBPACK_IMPORTED_MODULE_4__IIDType__["b" /* SelectOperation */].SET, type);
    };
    /**
     * Cache identifier <-> name mapping in bulk.
     * @param ids the entity identifiers to cache
     * @param names the matching entity names to cache
     */
    IDType.prototype.fillMapCache = function (ids, names) {
        var _this = this;
        ids.forEach(function (id, i) {
            var name = String(names[i]);
            _this.name2idCache.set(name, id);
            _this.id2nameCache.set(id, name);
        });
    };
    /**
     * returns the list of idtypes that this type can be mapped to
     * @returns {Promise<IDType[]>}
     */
    IDType.prototype.getCanBeMappedTo = function () {
        if (this.canBeMappedTo === null) {
            this.canBeMappedTo = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__ajax__["a" /* getAPIJSON */])("/idtype/" + this.id + "/").then(function (list) { return list.map(__WEBPACK_IMPORTED_MODULE_5__manager__["a" /* resolve */]); });
        }
        return this.canBeMappedTo;
    };
    IDType.prototype.mapToFirstName = function (ids, toIDType) {
        var target = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__manager__["a" /* resolve */])(toIDType);
        var r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__range__["g" /* parse */])(ids);
        return chooseRequestMethod("/idtype/" + this.id + "/" + target.id, { ids: r.toString(), mode: 'first' });
    };
    IDType.prototype.mapNameToFirstName = function (names, toIDtype) {
        var target = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__manager__["a" /* resolve */])(toIDtype);
        return chooseRequestMethod("/idtype/" + this.id + "/" + target.id, { q: names, mode: 'first' });
    };
    IDType.prototype.mapToName = function (ids, toIDType) {
        var target = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__manager__["a" /* resolve */])(toIDType);
        var r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__range__["g" /* parse */])(ids);
        return chooseRequestMethod("/idtype/" + this.id + "/" + target.id, { ids: r.toString() });
    };
    IDType.prototype.mapNameToName = function (names, toIDtype) {
        var target = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__manager__["a" /* resolve */])(toIDtype);
        return chooseRequestMethod("/idtype/" + this.id + "/" + target.id, { q: names });
    };
    IDType.prototype.mapToFirstID = function (ids, toIDType) {
        var target = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__manager__["a" /* resolve */])(toIDType);
        var r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__range__["g" /* parse */])(ids);
        return chooseRequestMethod("/idtype/" + this.id + "/" + target.id + "/map", { ids: r.toString(), mode: 'first' });
    };
    IDType.prototype.mapToID = function (ids, toIDType) {
        var target = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__manager__["a" /* resolve */])(toIDType);
        var r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__range__["g" /* parse */])(ids);
        return chooseRequestMethod("/idtype/" + this.id + "/" + target.id + "/map", { ids: r.toString() });
    };
    IDType.prototype.mapNameToFirstID = function (names, toIDType) {
        var target = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__manager__["a" /* resolve */])(toIDType);
        return chooseRequestMethod("/idtype/" + this.id + "/" + target.id + "/map", { q: names, mode: 'first' });
    };
    IDType.prototype.mapNameToID = function (names, toIDType) {
        var target = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__manager__["a" /* resolve */])(toIDType);
        return chooseRequestMethod("/idtype/" + this.id + "/" + target.id + "/map", { q: names });
    };
    /**
     * Request the system identifiers for the given entity names.
     * @param names the entity names to resolve
     * @returns a promise of system identifiers that match the input names
     */
    IDType.prototype.map = function (names) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var toResolve, ids;
            var _this = this;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        names = names.map(function (s) { return String(s); }); // ensure strings
                        toResolve = names.filter(function (name) { return !_this.name2idCache.has(name); });
                        if (toResolve.length === 0) {
                            return [2 /*return*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__internal_promise__["a" /* resolveImmediately */])(names.map(function (name) { return _this.name2idCache.get(name); }))];
                        }
                        return [4 /*yield*/, chooseRequestMethod("/idtype/" + this.id + "/map", { ids: toResolve })];
                    case 1:
                        ids = _a.sent();
                        toResolve.forEach(function (name, i) {
                            _this.name2idCache.set(name, ids[i]);
                            _this.id2nameCache.set(ids[i], name);
                        });
                        return [2 /*return*/, names.map(function (name) { return _this.name2idCache.get(name); })];
                }
            });
        });
    };
    /**
     * Request the names for the given entity system identifiers.
     * @param ids the entity names to resolve
     * @returns a promise of system identifiers that match the input names
     */
    IDType.prototype.unmap = function (ids) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var r, toResolve, result_1, result, out;
            var _this = this;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__range__["g" /* parse */])(ids);
                        toResolve = [];
                        r.dim(0).forEach(function (name) { return !(_this.id2nameCache.has(name)) ? toResolve.push(name) : null; });
                        if (toResolve.length === 0) {
                            result_1 = [];
                            r.dim(0).forEach(function (name) { return result_1.push(_this.id2nameCache.get(name)); });
                            return [2 /*return*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__internal_promise__["a" /* resolveImmediately */])(result_1)];
                        }
                        return [4 /*yield*/, chooseRequestMethod("/idtype/" + this.id + "/unmap", { ids: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__range__["c" /* list */])(toResolve).toString() })];
                    case 1:
                        result = _a.sent();
                        toResolve.forEach(function (id, i) {
                            var r = String(result[i]);
                            _this.id2nameCache.set(id, r);
                            _this.name2idCache.set(r, id);
                        });
                        out = [];
                        r.dim(0).forEach(function (name) { return out.push(_this.id2nameCache.get(name)); });
                        return [2 /*return*/, out];
                }
            });
        });
    };
    /**
     * search for all matching ids for a given pattern
     * @param pattern
     * @param limit maximal number of results
     * @return {Promise<void>}
     */
    IDType.prototype.search = function (pattern, limit) {
        if (limit === void 0) { limit = 10; }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var result;
            var _this = this;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__ajax__["a" /* getAPIJSON */])("/idtype/" + this.id + "/search", { q: pattern, limit: limit })];
                    case 1:
                        result = _a.sent();
                        // cache results
                        result.forEach(function (pair) {
                            var r = String(pair.name);
                            _this.id2nameCache.set(pair.id, r);
                            _this.name2idCache.set(r, pair.id);
                        });
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * search for all matching ids for a given pattern
     * @param pattern
     * @param limit maximal number of results
     * @return {Promise<void>}
     */
    IDType.prototype.searchMapping = function (pattern, toIDType, limit) {
        if (limit === void 0) { limit = 10; }
        var target = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__manager__["a" /* resolve */])(toIDType);
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__ajax__["a" /* getAPIJSON */])("/idtype/" + this.id + "/" + target.id + "/search", { q: pattern, limit: limit });
    };
    IDType.EVENT_SELECT = 'select';
    return IDType;
}(__WEBPACK_IMPORTED_MODULE_2__event__["b" /* EventHandler */]));
/* harmony default export */ __webpack_exports__["a"] = IDType;
/**
 * chooses whether a GET or POST request based on the expected url length
 * @param url
 * @param data
 * @returns {Promise<any>}
 */
function chooseRequestMethod(url, data) {
    if (data === void 0) { data = {}; }
    var dataLengthGuess = JSON.stringify(data);
    var lengthGuess = url.length + dataLengthGuess.length;
    var method = lengthGuess < 2000 ? 'GET' : 'POST';
    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__ajax__["b" /* sendAPI */])(url, data, method);
}


/***/ }),

/***/ 632:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__idtype__ = __webpack_require__(622);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__index__ = __webpack_require__(224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__event__ = __webpack_require__(226);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return DIM_NODES; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return IDTYPE_NODES; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return DIM_EDGES; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "i", function() { return IDTYPE_EDGES; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return AttributeContainer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return GraphNode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return GraphEdge; });
/* harmony export (immutable) */ __webpack_exports__["b"] = isType;
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return AGraph; });

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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](AttributeContainer, _super);
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
}(__WEBPACK_IMPORTED_MODULE_4__event__["b" /* EventHandler */]));

/**
 * a simple graph none
 */
var GraphNode = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](GraphNode, _super);
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](GraphEdge, _super);
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](AGraph, _super);
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
        var ids = (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["c" /* list */])(this.nodes.map(function (n) { return n.id; }), this.edges.map(function (n) { return n.id; })));
        return Promise.resolve(ids.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["g" /* parse */])(range)));
    };
    AGraph.prototype.idView = function (idRange) {
        if (idRange === void 0) { idRange = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        throw Error('not implemented');
    };
    AGraph.prototype.selectNode = function (node, op) {
        if (op === void 0) { op = __WEBPACK_IMPORTED_MODULE_1__idtype__["a" /* SelectOperation */].SET; }
        this.select(DIM_NODES, [this.nodes.indexOf(node)], op);
    };
    AGraph.prototype.selectedNodes = function () {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var r, nodes;
            var _this = this;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
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
        if (op === void 0) { op = __WEBPACK_IMPORTED_MODULE_1__idtype__["a" /* SelectOperation */].SET; }
        this.select(DIM_EDGES, [this.edges.indexOf(edge)], op);
    };
    AGraph.prototype.selectedEdges = function () {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var r, edges;
            var _this = this;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
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
            return [IDTYPE_NODES, IDTYPE_EDGES].map(__WEBPACK_IMPORTED_MODULE_1__idtype__["c" /* resolve */]);
        },
        enumerable: true,
        configurable: true
    });
    return AGraph;
}(__WEBPACK_IMPORTED_MODULE_1__idtype__["d" /* SelectAble */]));



/***/ }),

/***/ 633:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(619);
/* harmony export (immutable) */ __webpack_exports__["c"] = computeStats;
/* harmony export (immutable) */ __webpack_exports__["d"] = computeAdvancedStats;
/* harmony export (immutable) */ __webpack_exports__["f"] = hist;
/* harmony export (immutable) */ __webpack_exports__["e"] = categoricalHist;
/* harmony export (immutable) */ __webpack_exports__["b"] = rangeHist;
/* harmony export (immutable) */ __webpack_exports__["g"] = wrapHist;
/* harmony export (immutable) */ __webpack_exports__["a"] = extent;
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 29.08.2014.
 */


var Statistics = /** @class */ (function () {
    function Statistics() {
        this.min = NaN;
        this.max = NaN;
        this.sum = 0;
        this.mean = 0;
        this._var = 0;
        this.n = 0;
        this.nans = 0;
        this.moment2 = NaN;
        this.moment3 = NaN;
        this.moment4 = NaN;
    }
    Object.defineProperty(Statistics.prototype, "var", {
        get: function () {
            return this.n > 1 ? this._var / (this.n - 1) : 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Statistics.prototype, "sd", {
        /** Returns the standard deviation */
        get: function () {
            return Math.sqrt(this.var);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Statistics.prototype, "kurtosis", {
        get: function () {
            if (this.n === 0) {
                return 0;
            }
            return (this.n * this.moment4) / (this.moment2 * this.moment2) - 3;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Statistics.prototype, "skewness", {
        get: function () {
            if (this.n === 0) {
                return 0;
            }
            return Math.sqrt(this.n) * this.moment3 / (Math.pow(this.moment2, 3. / 2.));
        },
        enumerable: true,
        configurable: true
    });
    Statistics.prototype.push = function (x) {
        if (typeof x !== 'number') {
            x = Number.NaN;
        }
        if (isNaN(x)) {
            this.nans++;
            return;
        }
        this.n++;
        this.sum += x;
        if (x < this.min || isNaN(this.min)) {
            this.min = x;
        }
        if (this.max < x || isNaN(this.max)) {
            this.max = x;
        }
        // http://www.johndcook.com/standard_deviation.html
        // See Knuth TAOCP vol 2, 3rd edition, page 232
        // http://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Higher-order_statistics
        if (this.n === 1) {
            this.mean = x;
            this._var = 0;
            this.moment2 = this.moment3 = this.moment4 = 0;
        }
        else {
            var meanMinus1 = this.mean;
            this.mean = meanMinus1 + (x - meanMinus1) / this.n;
            this._var = this._var + (x - meanMinus1) * (x - this.mean);
            var delta = x - meanMinus1;
            var deltaN = delta / this.n;
            var deltaNSquare = deltaN * deltaN;
            var term1 = delta * deltaN * (this.n - 1);
            this.moment4 += term1 * deltaNSquare * (this.n * this.n - 3 * this.n + 3) + 6 * deltaNSquare * this.moment2 - 4 * deltaN * this.moment3;
            this.moment3 += term1 * deltaN * (this.n - 2) - 3 * deltaN * this.moment2;
            this.moment2 += term1;
        }
    };
    return Statistics;
}());
var AdvancedStatistics = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](AdvancedStatistics, _super);
    function AdvancedStatistics(median, q1, q3) {
        var _this = _super.call(this) || this;
        _this.median = median;
        _this.q1 = q1;
        _this.q3 = q3;
        return _this;
    }
    return AdvancedStatistics;
}(Statistics));
function computeStats() {
    var arr = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        arr[_i] = arguments[_i];
    }
    var r = new Statistics();
    arr.forEach(function (a) { return a.forEach(r.push, r); });
    return r;
}
function quantile(arr, percentile) {
    var n = arr.length;
    if (n === 0) {
        return NaN;
    }
    if (n < 2 || percentile <= 0) {
        return arr[0];
    }
    if (percentile >= 1) {
        return arr[n - 1];
    }
    var target = percentile * (n - 1);
    var targetIndex = Math.floor(target);
    var a = arr[targetIndex], b = arr[targetIndex + 1];
    return a + (b - a) * (target - targetIndex);
}
function computeAdvancedStats(arr) {
    arr = arr.slice().sort(function (a, b) { return a - b; });
    var r = new AdvancedStatistics(quantile(arr, 0.5), quantile(arr, 0.25), quantile(arr, 0.75));
    arr.forEach(function (a) { return r.push(a); });
    return r;
}
function hist(arr, indices, size, bins, range) {
    var r = new Histogram(bins, range);
    r.pushAll(arr, indices, size);
    return r;
}
function categoricalHist(arr, indices, size, categories, labels, colors) {
    var r = new CatHistogram(categories, labels, colors);
    r.pushAll(arr, indices, size);
    return r;
}
function rangeHist(range) {
    return new RangeHistogram(range);
}
function wrapHist(hist, valueRange) {
    return new Histogram(hist.length, valueRange, hist);
}
var AHistogram = /** @class */ (function () {
    function AHistogram(bins, hist) {
        this._missing = 0;
        this._missingRange = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["d" /* none */])();
        this._bins = [];
        for (var i = 0; i < bins; ++i) {
            this._bins.push(hist && hist.length > i ? hist[i] : 0);
        }
    }
    Object.defineProperty(AHistogram.prototype, "largestFrequency", {
        get: function () {
            return Math.max(Math.max.apply(Math, this._bins), this._missing);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AHistogram.prototype, "largestBin", {
        get: function () {
            return Math.max.apply(Math, this._bins);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AHistogram.prototype, "count", {
        get: function () {
            return this.validCount + this._missing;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AHistogram.prototype, "validCount", {
        get: function () {
            return this._bins.reduce(function (p, s) { return p + s; }, 0);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AHistogram.prototype, "bins", {
        get: function () {
            return this._bins.length;
        },
        enumerable: true,
        configurable: true
    });
    AHistogram.prototype.binOf = function (value) {
        return -1;
    };
    AHistogram.prototype.frequency = function (bin) {
        return this._bins[bin];
    };
    AHistogram.prototype.range = function (bin) {
        return this._ranges ? this._ranges[bin] : __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["d" /* none */])();
    };
    Object.defineProperty(AHistogram.prototype, "missing", {
        get: function () {
            return this._missing;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AHistogram.prototype, "missingRange", {
        get: function () {
            return this._missingRange;
        },
        enumerable: true,
        configurable: true
    });
    AHistogram.prototype.pushAll = function (arr, indices, size) {
        var _this = this;
        var binindex = [], missingindex = [];
        for (var i = this.bins - 1; i >= 0; --i) {
            binindex.push([]);
        }
        if (indices) {
            var it_1 = indices.iter(size);
            arr.forEach(function (x) {
                var index = it_1.next();
                var bin = _this.binOf(x);
                if (bin < 0) {
                    _this._missing++;
                    missingindex.push(index);
                }
                else {
                    _this._bins[bin]++;
                    binindex[bin].push(index);
                }
            });
            //build range and remove duplicates
            this._ranges = binindex.map(function (d) { return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["c" /* list */])(d.sort().filter(function (di, i, a) { return di !== a[i - 1]; })); });
            this._missingRange = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["c" /* list */])(missingindex.sort().filter(function (di, i, a) { return di !== a[i - 1]; }));
        }
        else {
            arr.forEach(function (x) {
                var bin = _this.binOf(x);
                if (bin < 0) {
                    _this._missing++;
                }
                else {
                    _this._bins[bin]++;
                }
            });
            this._ranges = null;
            this._missingRange = null;
        }
    };
    AHistogram.prototype.forEach = function (callbackfn, thisArg) {
        return this._bins.forEach(callbackfn, thisArg);
    };
    return AHistogram;
}());
var Histogram = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](Histogram, _super);
    function Histogram(bins, valueRange, hist) {
        var _this = _super.call(this, bins, hist) || this;
        _this.valueRange = valueRange;
        return _this;
    }
    Histogram.prototype.binOf = function (value) {
        if (typeof value === 'number') {
            return this.binOfImpl(value);
        }
        return -1;
    };
    Histogram.prototype.binOfImpl = function (value) {
        if (isNaN(value)) {
            return -1;
        }
        var n = (value - this.valueRange[0]) / (this.valueRange[1] - this.valueRange[0]);
        var bin = Math.round(n * (this.bins - 1));
        if (bin < 0) {
            bin = 0;
        }
        if (bin >= this.bins) {
            bin = this.bins - 1;
        }
        return isNaN(bin) ? -1 : bin;
    };
    return Histogram;
}(AHistogram));
var CatHistogram = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](CatHistogram, _super);
    function CatHistogram(values, categories, colors) {
        var _this = _super.call(this, values.length) || this;
        _this.values = values;
        _this.categories = categories;
        _this.colors = colors;
        return _this;
    }
    CatHistogram.prototype.binOf = function (value) {
        return this.values.indexOf(value);
    };
    return CatHistogram;
}(AHistogram));
var RangeHistogram = /** @class */ (function () {
    function RangeHistogram(_range) {
        this._range = _range;
    }
    Object.defineProperty(RangeHistogram.prototype, "categories", {
        get: function () {
            return this._range.groups.map(function (g) { return g.name; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RangeHistogram.prototype, "colors", {
        get: function () {
            return this._range.groups.map(function (g) { return g.color; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RangeHistogram.prototype, "largestFrequency", {
        get: function () {
            return Math.max.apply(Math, this._range.groups.map(function (g) { return g.length; }));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RangeHistogram.prototype, "largestBin", {
        get: function () {
            return this.largestFrequency;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RangeHistogram.prototype, "count", {
        get: function () {
            return this._range.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RangeHistogram.prototype, "validCount", {
        get: function () {
            return this.count;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RangeHistogram.prototype, "bins", {
        get: function () {
            return this._range.groups.length;
        },
        enumerable: true,
        configurable: true
    });
    RangeHistogram.prototype.binOf = function (value) {
        return this._range.groups.findIndex(function (g) { return g.name === value; });
    };
    RangeHistogram.prototype.frequency = function (bin) {
        return this._range.groups[bin].length;
    };
    RangeHistogram.prototype.range = function (bin) {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["c" /* list */])(this._range.groups[bin]);
    };
    Object.defineProperty(RangeHistogram.prototype, "missing", {
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RangeHistogram.prototype, "missingRange", {
        get: function () {
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["d" /* none */])();
        },
        enumerable: true,
        configurable: true
    });
    RangeHistogram.prototype.forEach = function (callbackfn, thisArg) {
        return this._range.groups.forEach(function (g, i) { return callbackfn.call(thisArg, g.length, i); });
    };
    return RangeHistogram;
}());
/**
 * computes the extent [min, max] for the given array, in case of empty array [NaN, NaN] is returned
 * @param arr the array
 * @return {[number,number]} [min, max]
 */
function extent(arr) {
    var min = NaN, max = NaN;
    arr.forEach(function (v) {
        if (isNaN(v)) {
            return;
        }
        if (isNaN(min) || min > v) {
            min = v;
        }
        if (isNaN(max) || min < v) {
            max = v;
        }
    });
    return [min, max];
}


/***/ }),

/***/ 636:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__event__ = __webpack_require__(226);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__IIDType__ = __webpack_require__(625);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__IDType__ = __webpack_require__(630);
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */





//function indicesCompare(a: number[], b: number[]) {
//  //assert a.length = b.length
//  for(let i = 0; i < a.length; ++i) {
//    if (a[i] !== b[i]) {
//      return a[i] - b[i];
//    }
//  }
//  return 0;
//}
//
//function compressPairs(pairs: number[][]): Range[] {
//  return pairs.map((a) => rlist(...a));
//}
function overlaps(r, withRange, ndim) {
    if (withRange.ndim === 0) {
        return true; //catch all
    }
    var _loop_1 = function (i) {
        var ri = r.dim(i);
        var wi = withRange.dim(i);
        if (wi.isAll || ri.isAll) {
            return { value: true };
        }
        if (!ri.isUnbound && ri.asList().every(function (rii) { return !wi.contains(rii); })) {
            return { value: false };
        }
        //TODO
    };
    for (var i = 0; i < Math.min(r.ndim, ndim); ++i) {
        var state_1 = _loop_1(i);
        if (typeof state_1 === "object")
            return state_1.value;
    }
    return false;
}
function removeCells(b, without, ndim) {
    if (without.length === 0) {
        return b;
    }
    var r = [];
    b.forEach(function (bi) {
        if (without.some(function (w) { return w.eq(bi); })) {
            //skip
        }
        else if (without.some(function (w) { return overlaps(bi, w, ndim); })) {
            //TODO
        }
        else {
            r.push(bi);
        }
    });
    return r;
}
/**
 * a product idtype is a product of multiple underlying ones, e.g. patient x gene.
 */
var ProductIDType = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](ProductIDType, _super);
    function ProductIDType(elems, internal) {
        if (internal === void 0) { internal = false; }
        var _this = _super.call(this) || this;
        _this.elems = elems;
        _this.internal = internal;
        _this.sel = new Map();
        _this.isOn = false;
        _this.selectionListener = function (event, type, act, added, removed) {
            _this.fire(ProductIDType.EVENT_SELECT_DIM + "," + ProductIDType.EVENT_SELECT_PRODUCT, _this.elems.indexOf(event.currentTarget), type, act, added, removed);
            _this.fire(ProductIDType.EVENT_SELECT_DIM + "-" + type + "," + ProductIDType.EVENT_SELECT_PRODUCT + "-" + type, _this.elems.indexOf(event.currentTarget), act, added, removed);
        };
        return _this;
    }
    ProductIDType.prototype.on = function (events, listener) {
        if (!this.isOn) {
            this.enable();
            this.isOn = true;
        }
        return _super.prototype.on.call(this, events, listener);
    };
    Object.defineProperty(ProductIDType.prototype, "id", {
        get: function () {
            return this.elems.map(function (e) { return e.id; }).join('X');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProductIDType.prototype, "name", {
        get: function () {
            return this.elems.map(function (e) { return e.name; }).join(' x ');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProductIDType.prototype, "names", {
        get: function () {
            return this.elems.map(function (e) { return e.names; }).join(' x ');
        },
        enumerable: true,
        configurable: true
    });
    ProductIDType.prototype.enable = function () {
        var _this = this;
        this.elems.forEach(function (elem) { return elem.on(__WEBPACK_IMPORTED_MODULE_4__IDType__["a" /* default */].EVENT_SELECT, _this.selectionListener); });
    };
    ProductIDType.prototype.disable = function () {
        var _this = this;
        this.elems.forEach(function (elem) { return elem.off(__WEBPACK_IMPORTED_MODULE_4__IDType__["a" /* default */].EVENT_SELECT, _this.selectionListener); });
    };
    ProductIDType.prototype.persist = function () {
        var s = {};
        this.sel.forEach(function (v, type) { return s[type] = v.map(function (r) { return r.toString(); }); });
        return {
            sel: s
        };
    };
    ProductIDType.prototype.restore = function (persisted) {
        var _this = this;
        Object.keys(persisted.sel).forEach(function (type) { return _this.sel.set(type, persisted.sel[type].map(__WEBPACK_IMPORTED_MODULE_2__range__["g" /* parse */])); });
        return this;
    };
    ProductIDType.prototype.toString = function () {
        return this.name;
    };
    ProductIDType.prototype.selectionTypes = function () {
        return Array.from(this.sel.keys());
    };
    /**
     * return the current selections of the given type
     * @param type optional the selection type
     * @returns {Range[]}
     */
    ProductIDType.prototype.selections = function (type) {
        if (type === void 0) { type = __WEBPACK_IMPORTED_MODULE_3__IIDType__["a" /* defaultSelectionType */]; }
        if (this.sel.has(type)) {
            return this.sel.get(type).slice();
        }
        this.sel.set(type, []);
        return [];
    };
    ProductIDType.prototype.productSelections = function (type /*, wildcardLookup: (idtype: IDType) => Promise<number> */) {
        var _this = this;
        if (type === void 0) { type = __WEBPACK_IMPORTED_MODULE_3__IIDType__["a" /* defaultSelectionType */]; }
        var cells = this.selections(type);
        var usedCells = this.toPerDim(cells);
        this.elems.forEach(function (e, i) {
            var s = e.selections(type);
            //remove all already used rows / columns as part of the cells
            var wildcard = s.without(usedCells[i]);
            if (!wildcard.isNone) {
                //create wildcard cells, e.g., the remaining ones are row/column selections
                cells.push(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["c" /* list */])(_this.elems.map(function (e2) { return e === e2 ? wildcard.dim(0) : __WEBPACK_IMPORTED_MODULE_2__range__["b" /* Range1D */].all(); })));
            }
        });
        return cells;
        /* TODO no duplicates
         if (cells.every((c) => !c.isUnbound)) {
         //all cells are bound, just cells
         return Promise.resolve(cells);
         }
         //we need to resolve some wildcards
         return Promise.all(this.elems.map((elem, i) => {
         if (cells.some((c) => c.dim(i).isUnbound)) {
         return wildcardLookup(elem);
         } else {
         return Promise.resolve(0);
         }
         })).then((size: number[]) => {
         const fullCells : any = {};
         cells.forEach((cell) => {
         cell.product((indices: number[]) => {
         const id = indices.join('_');
         fullCells[id] = indices;
         });
         }, size);
         //fullCells contains all cells that we have to take care of
         const pairs = Object.keys(fullCells).map((k) => fullCells[k]).sort(indicesCompare);
         return compressPairs(pairs);
         });
         */
    };
    ProductIDType.prototype.select = function () {
        var a = Array.from(arguments);
        var type = (typeof a[0] === 'string') ? a.shift() : __WEBPACK_IMPORTED_MODULE_3__IIDType__["a" /* defaultSelectionType */], range = a[0].map(__WEBPACK_IMPORTED_MODULE_2__range__["g" /* parse */]), op = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__IIDType__["c" /* asSelectOperation */])(a[1]);
        return this.selectImpl(range, op, type);
    };
    ProductIDType.prototype.selectImpl = function (cells, op, type) {
        if (op === void 0) { op = __WEBPACK_IMPORTED_MODULE_3__IIDType__["b" /* SelectOperation */].SET; }
        if (type === void 0) { type = __WEBPACK_IMPORTED_MODULE_3__IIDType__["a" /* defaultSelectionType */]; }
        var rcells = cells.map(__WEBPACK_IMPORTED_MODULE_2__range__["g" /* parse */]);
        var b = this.selections(type);
        var newRange = [];
        switch (op) {
            case __WEBPACK_IMPORTED_MODULE_3__IIDType__["b" /* SelectOperation */].SET:
                newRange = rcells;
                break;
            case __WEBPACK_IMPORTED_MODULE_3__IIDType__["b" /* SelectOperation */].ADD:
                newRange = b.concat(rcells);
                break;
            case __WEBPACK_IMPORTED_MODULE_3__IIDType__["b" /* SelectOperation */].REMOVE:
                newRange = removeCells(b, rcells, this.elems.length);
                break;
        }
        //if (b.eq(new_)) {
        //  return b;
        //}
        this.sel.set(type, newRange);
        //individual selection per dimension
        var perDimSelections = this.toPerDim(newRange);
        this.disable();
        this.elems.forEach(function (e, i) { return e.select(type, perDimSelections[i]); });
        this.enable();
        var added = op !== __WEBPACK_IMPORTED_MODULE_3__IIDType__["b" /* SelectOperation */].REMOVE ? rcells : [];
        var removed = (op === __WEBPACK_IMPORTED_MODULE_3__IIDType__["b" /* SelectOperation */].ADD ? [] : (op === __WEBPACK_IMPORTED_MODULE_3__IIDType__["b" /* SelectOperation */].SET ? b : rcells));
        this.fire(__WEBPACK_IMPORTED_MODULE_4__IDType__["a" /* default */].EVENT_SELECT, type, newRange, added, removed, b);
        this.fire(ProductIDType.EVENT_SELECT_PRODUCT, -1, type, newRange, added, removed, b);
        this.fire(__WEBPACK_IMPORTED_MODULE_4__IDType__["a" /* default */].EVENT_SELECT + "-" + type, newRange, added, removed, b);
        this.fire(ProductIDType.EVENT_SELECT_PRODUCT + "-" + type, -1, newRange, added, removed, b);
        return b;
    };
    ProductIDType.prototype.toPerDim = function (sel) {
        return this.elems.map(function (elem, i) {
            if (sel.length === 0) {
                return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["d" /* none */])();
            }
            var dimselections = sel.map(function (r) { return r.dim(i); });
            var selection = dimselections.reduce(function (p, a) { return p ? p.union(a) : a; }, null);
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["c" /* list */])(selection);
        });
    };
    ProductIDType.prototype.clear = function (type) {
        if (type === void 0) { type = __WEBPACK_IMPORTED_MODULE_3__IIDType__["a" /* defaultSelectionType */]; }
        return this.selectImpl([], __WEBPACK_IMPORTED_MODULE_3__IIDType__["b" /* SelectOperation */].SET, type);
    };
    ProductIDType.EVENT_SELECT_DIM = 'selectDim';
    ProductIDType.EVENT_SELECT_PRODUCT = 'selectProduct';
    return ProductIDType;
}(__WEBPACK_IMPORTED_MODULE_1__event__["b" /* EventHandler */]));
/* harmony default export */ __webpack_exports__["a"] = ProductIDType;


/***/ }),

/***/ 637:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* unused harmony export AIterator */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return Iterator; });
/* unused harmony export ListIterator */
/* unused harmony export SingleIterator */
/* unused harmony export ConcatIterator */
/* unused harmony export EmptyIterator */
/* unused harmony export empty */
/* harmony export (immutable) */ __webpack_exports__["e"] = concat;
/* harmony export (immutable) */ __webpack_exports__["a"] = range;
/* harmony export (immutable) */ __webpack_exports__["b"] = single;
/* harmony export (immutable) */ __webpack_exports__["d"] = forList;
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

var AIterator = /** @class */ (function () {
    function AIterator() {
    }
    AIterator.prototype.hasNext = function () {
        return false;
    };
    AIterator.prototype.next = function () {
        return null;
    };
    AIterator.prototype.forEach = function (callbackfn, thisArg) {
        var i = 0;
        while (this.hasNext()) {
            callbackfn.call(thisArg, this.next(), i++);
        }
    };
    /**
     * Calls a defined callback function on each element of an array, and returns an array that contains the results.
     * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    AIterator.prototype.map = function (callbackfn, thisArg) {
        return new TransformIterator(this, callbackfn, thisArg);
    };
    /**
     * converts the remaining of this iterator to a list
     * @returns {Array}
     */
    AIterator.prototype.asList = function () {
        var r = [];
        while (this.hasNext()) {
            r.push(this.next());
        }
        return r;
    };
    Object.defineProperty(AIterator.prototype, "isIncreasing", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AIterator.prototype, "isDecreasing", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AIterator.prototype, "byOne", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AIterator.prototype, "byMinusOne", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    return AIterator;
}());

/**
 * iterator for a given range
 */
var Iterator = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](Iterator, _super);
    function Iterator(from, to, step) {
        var _this = _super.call(this) || this;
        _this.from = from;
        _this.to = to;
        _this.step = step;
        _this.act = _this.from;
        return _this;
    }
    /**
     * whether more items are available
     */
    Iterator.prototype.hasNext = function () {
        return this.act !== this.to && ((this.step > 0 && this.act < this.to) || (this.step < 0 && this.act > this.to));
    };
    /**
     * returns the next item
     */
    Iterator.prototype.next = function () {
        if (!this.hasNext()) {
            throw new RangeError('end of iterator');
        }
        var r = this.act;
        this.act += this.step;
        if (this.step < 0 && this.act < this.to) {
            this.act = this.to;
        }
        else if (this.step > 0 && this.act > this.to) {
            this.act = this.to;
        }
        return r;
    };
    Object.defineProperty(Iterator.prototype, "isIncreasing", {
        get: function () {
            return this.step > 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Iterator.prototype, "isDecreasing", {
        get: function () {
            return this.step < 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Iterator.prototype, "byOne", {
        get: function () {
            return this.step === 1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Iterator.prototype, "byMinusOne", {
        get: function () {
            return this.step === -1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Iterator.prototype, "size", {
        get: function () {
            if (this.byOne) {
                return Math.max(this.to - this.from, 0);
            }
            else if (this.byMinusOne) {
                return Math.max(this.from - this.to, 0);
            }
            var d = this.isIncreasing ? (this.to - this.from + 1) : (this.from - this.to + 1);
            var s = Math.abs(this.step);
            if (d <= 0) { //no range
                return 0;
            }
            return Math.floor(d / s);
        },
        enumerable: true,
        configurable: true
    });
    return Iterator;
}(AIterator));

var ListIterator = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](ListIterator, _super);
    function ListIterator(arr) {
        var _this = _super.call(this) || this;
        _this.arr = arr;
        _this.it = new Iterator(0, arr.length, 1);
        return _this;
    }
    /**
     * whether more items are available
     */
    ListIterator.prototype.hasNext = function () {
        return this.it.hasNext();
    };
    /**
     * returns the next item
     */
    ListIterator.prototype.next = function () {
        if (!this.hasNext()) {
            throw new RangeError('end of iterator');
        }
        return this.arr[this.it.next()];
    };
    ListIterator.prototype.asList = function () {
        return this.arr.slice();
    };
    return ListIterator;
}(AIterator));

var SingleIterator = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](SingleIterator, _super);
    function SingleIterator(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        _this.delivered = false;
        return _this;
    }
    SingleIterator.prototype.hasNext = function () {
        return !this.delivered;
    };
    SingleIterator.prototype.next = function () {
        if (!this.hasNext()) {
            throw new RangeError('end of iterator');
        }
        this.delivered = true;
        return this.value;
    };
    SingleIterator.prototype.asList = function () {
        return [this.value];
    };
    Object.defineProperty(SingleIterator.prototype, "isIncreasing", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SingleIterator.prototype, "isDecreasing", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SingleIterator.prototype, "byOne", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SingleIterator.prototype, "byMinusOne", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    return SingleIterator;
}(AIterator));

var ConcatIterator = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](ConcatIterator, _super);
    function ConcatIterator(its) {
        var _this = _super.call(this) || this;
        _this.its = its;
        _this.act = its.shift();
        return _this;
    }
    /**
     * whether more items are available
     */
    ConcatIterator.prototype.hasNext = function () {
        //based on http://grepcode.com/file/repo1.maven.org/maven2/com.google.guava/guava/r08/com/google/common/collect/Iterators.java#Iterators.concat%28java.util.Iterator%29
        var currentHasNext = false;
        while (!(currentHasNext = this.act.hasNext()) && this.its.length > 0) {
            this.act = this.its.shift();
        }
        return currentHasNext;
    };
    /**
     * returns the next item
     */
    ConcatIterator.prototype.next = function () {
        if (!this.hasNext()) {
            throw new RangeError('end of iterator');
        }
        return this.act.next();
    };
    /**
     * converts the remaining of this iterator to a list
     * @returns {Array}
     */
    ConcatIterator.prototype.asList = function () {
        var r = [];
        while (this.hasNext()) {
            r.push(this.next());
        }
        return r;
    };
    Object.defineProperty(ConcatIterator.prototype, "isIncreasing", {
        get: function () {
            return this.its.every(function (it) { return it.isIncreasing; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConcatIterator.prototype, "isDecreasing", {
        get: function () {
            return this.its.every(function (it) { return it.isDecreasing; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConcatIterator.prototype, "byOne", {
        get: function () {
            return this.its.every(function (it) { return it.byOne; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConcatIterator.prototype, "byMinusOne", {
        get: function () {
            return this.its.every(function (it) { return it.byMinusOne; });
        },
        enumerable: true,
        configurable: true
    });
    return ConcatIterator;
}(AIterator));

var EmptyIterator = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](EmptyIterator, _super);
    function EmptyIterator() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isIncreasing = false;
        _this.isDecreasing = false;
        _this.byOne = false;
        _this.byMinusOne = false;
        return _this;
    }
    /**
     * whether more items are available
     */
    EmptyIterator.prototype.hasNext = function () {
        return false;
    };
    /**
     * returns the next item
     */
    EmptyIterator.prototype.next = function () {
        throw new RangeError('end of iterator');
    };
    /**
     * converts the remaining of this iterator to a list
     * @returns {Array}
     */
    EmptyIterator.prototype.asList = function () {
        return [];
    };
    return EmptyIterator;
}(AIterator));

var TransformIterator = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](TransformIterator, _super);
    function TransformIterator(it, f, thisArg) {
        var _this = _super.call(this) || this;
        _this.it = it;
        _this.f = f;
        _this.thisArg = thisArg;
        return _this;
    }
    /**
     * whether more items are available
     */
    TransformIterator.prototype.hasNext = function () {
        return this.it.hasNext();
    };
    /**
     * returns the next item
     */
    TransformIterator.prototype.next = function () {
        if (!this.hasNext()) {
            throw new RangeError('end of iterator');
        }
        return this.f.call(this.thisArg, this.it.next());
    };
    Object.defineProperty(TransformIterator.prototype, "isIncreasing", {
        get: function () {
            return this.it.isIncreasing;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TransformIterator.prototype, "isDecreasing", {
        get: function () {
            return this.it.isDecreasing;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TransformIterator.prototype, "byOne", {
        get: function () {
            return this.it.byOne;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TransformIterator.prototype, "byMinusOne", {
        get: function () {
            return this.it.byMinusOne;
        },
        enumerable: true,
        configurable: true
    });
    return TransformIterator;
}(AIterator));
function empty() {
    return new EmptyIterator();
}
function concat() {
    var its = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        its[_i] = arguments[_i];
    }
    if (its.length === 0) {
        return empty();
    }
    else if (its.length === 1) {
        return its[0];
    }
    return new ConcatIterator(its);
}
/**
 * creates a new iterator for the given range
 * @param from
 * @param to
 * @param step
 * @returns {Iterator}
 */
function range(from, to, step) {
    return new Iterator(from, to, step);
}
function single(value) {
    return new SingleIterator(value);
}
/**
 * creates a new iterator for the given list
 * @param arr
 * @returns {ListIterator}
 */
function forList(arr) {
    return new ListIterator(arr);
}


/***/ }),

/***/ 638:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Range1D__ = __webpack_require__(627);
/**
 * Created by Samuel Gratzl on 27.12.2016.
 */


function toBase(groups) {
    if (groups.length === 1) {
        return groups[0];
    }
    var r = groups[0].iter().asList();
    groups.slice(1).forEach(function (g) {
        g.iter().forEach(function (i) {
            if (r.indexOf(i) < 0) {
                r.push(i);
            }
        });
    });
    return __WEBPACK_IMPORTED_MODULE_1__Range1D__["a" /* default */].from(r);
}
var CompositeRange1D = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](CompositeRange1D, _super);
    function CompositeRange1D(name, groups, base) {
        var _this = _super.call(this, base ? base : toBase(groups)) || this;
        _this.name = name;
        _this.groups = groups;
        return _this;
    }
    CompositeRange1D.prototype.preMultiply = function (sub, size) {
        var r = this.groups.length > 1 ? _super.prototype.preMultiply.call(this, sub, size) : undefined;
        return new CompositeRange1D(this.name, this.groups.map(function (g) { return g.preMultiply(sub, size); }), r);
    };
    CompositeRange1D.prototype.union = function (other, size) {
        var r = this.groups.length > 1 ? _super.prototype.union.call(this, other, size) : undefined;
        return new CompositeRange1D(this.name, this.groups.map(function (g) { return g.union(other, size); }), r);
    };
    CompositeRange1D.prototype.intersect = function (other, size) {
        var r = this.groups.length > 1 ? _super.prototype.intersect.call(this, other, size) : undefined;
        return new CompositeRange1D(this.name, this.groups.map(function (g) { return g.intersect(other, size); }), r);
    };
    CompositeRange1D.prototype.without = function (without, size) {
        var r = this.groups.length > 1 ? _super.prototype.without.call(this, without, size) : undefined;
        return new CompositeRange1D(this.name, this.groups.map(function (g) { return g.without(without, size); }), r);
    };
    CompositeRange1D.prototype.clone = function () {
        var r = this.groups.length > 1 ? _super.prototype.clone.call(this) : undefined;
        return new CompositeRange1D(name, this.groups.map(function (g) { return g.clone(); }), r);
    };
    CompositeRange1D.prototype.sort = function (cmp) {
        var r = this.groups.length > 1 ? _super.prototype.sort.call(this, cmp) : undefined;
        return new CompositeRange1D(this.name, this.groups.map(function (g) { return g.sort(cmp); }), r);
    };
    CompositeRange1D.prototype.toSet = function (size) {
        var r = this.groups.length > 1 ? _super.prototype.toSet.call(this, size) : undefined;
        return new CompositeRange1D(this.name, this.groups.map(function (g) { return g.toSet(size); }), r);
    };
    CompositeRange1D.prototype.toString = function () {
        return '"' + this.name + '"{' + this.groups.join(',') + '}';
    };
    CompositeRange1D.prototype.fromLikeComposite = function (groups) {
        return new CompositeRange1D(this.name, groups);
    };
    return CompositeRange1D;
}(__WEBPACK_IMPORTED_MODULE_1__Range1D__["a" /* default */]));
/* harmony default export */ __webpack_exports__["a"] = CompositeRange1D;


/***/ }),

/***/ 639:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Range1D__ = __webpack_require__(627);
/* harmony export (immutable) */ __webpack_exports__["a"] = all;
/* harmony export (immutable) */ __webpack_exports__["b"] = none;
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

/**
 * multi dimensional version of a RangeDim
 */
var Range = /** @class */ (function () {
    function Range(dims) {
        if (dims === void 0) { dims = []; }
        this.dims = dims;
    }
    Object.defineProperty(Range.prototype, "isAll", {
        /**
         * checks if this range is all
         * @returns {boolean}
         */
        get: function () {
            return this.dims.every(function (dim) { return dim.isAll; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Range.prototype, "isNone", {
        get: function () {
            return this.dims.every(function (dim) { return dim.isNone; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Range.prototype, "isUnbound", {
        /**
         * checks whether there are any wildcards
         */
        get: function () {
            return this.dims.some(function (dim) { return dim.isUnbound; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Range.prototype, "first", {
        get: function () {
            return this.dim(0).first;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Range.prototype, "last", {
        get: function () {
            return this.dim(0).last;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Range.prototype, "ndim", {
        /**
         * number of defined dimensions
         * @returns {number}
         */
        get: function () {
            return this.dims.length;
        },
        enumerable: true,
        configurable: true
    });
    Range.prototype.eq = function (other) {
        if (this === other || (this.isAll && other.isAll) || (this.isNone && other.isNone)) {
            return true;
        }
        //TODO more performant comparison
        return this.toString() === other.toString();
    };
    /**
     * combines this range with another and returns a new one
     * this = (1,3,5,7), other = (1,2) -> (1,2)(1,3,5,7) = (3,5)
     * @param other
     * @returns {*}
     */
    Range.prototype.preMultiply = function (other, size) {
        if (this.isAll) {
            return other.clone();
        }
        if (other.isAll) {
            return this.clone();
        }
        var r = new Range();
        this.dims.forEach(function (d, i) {
            r.dims[i] = d.preMultiply(other.dim(i), size ? size[i] : undefined);
        });
        return r;
    };
    Range.prototype.union = function (other, size) {
        if (this.isAll || other.isNone) {
            return this.clone();
        }
        if (other.isAll || this.isNone) {
            return other.clone();
        }
        var r = new Range();
        this.dims.forEach(function (d, i) {
            r.dims[i] = d.union(other.dim(i), size ? size[i] : undefined);
        });
        return r;
    };
    /**
     * logical intersection between two ranges
     * @param other
     * @returns {RangeDim}
     */
    Range.prototype.intersect = function (other, size) {
        if (this.isNone || other.isNone) {
            return none();
        }
        if (this.isAll) {
            return other.clone();
        }
        if (other.isAll) {
            return this.clone();
        }
        var r = new Range();
        this.dims.forEach(function (d, i) {
            r.dims[i] = d.intersect(other.dim(i), size ? size[i] : undefined);
        });
        return r;
    };
    Range.prototype.without = function (without, size) {
        if (this.isNone || without.isNone) {
            return this.clone();
        }
        if (without.isAll) {
            return none();
        }
        var r = new Range();
        this.dims.forEach(function (d, i) {
            r.dims[i] = d.without(without.dim(i), size ? size[i] : undefined);
        });
        return r;
    };
    /**
     * clones this range
     * @returns {*}
     */
    Range.prototype.clone = function () {
        var r = new Range();
        this.dims.forEach(function (d, i) {
            r.dims[i] = d.clone();
        });
        return r;
    };
    /**
     * create a new range and reverse the dimensions
     */
    Range.prototype.swap = function () {
        return new Range(this.dims.map(function (d) { return d.clone(); }).reverse());
    };
    /**
     * filter the given multi dimensional data according to the current range
     * @param data
     * @param size the underlying size for negative indices
     * @returns {*}
     */
    Range.prototype.filter = function (data, size) {
        if (this.isAll) {
            return data;
        }
        var ndim = this.ndim;
        var that = this;
        //recursive variant for just filtering the needed rows
        var filterDim = function (i) {
            if (i >= ndim) { //out of range no filtering anymore
                return function (d) { return d; };
            }
            var d = that.dim(i);
            var next = filterDim(i + 1); //compute next transform
            var s = size ? size[i] : undefined;
            return function (elem) {
                return Array.isArray(elem) ? d.filter(elem, s, next) : elem;
            };
        };
        var f = filterDim(0);
        return f(data);
    };
    /**
     * return a specific dimension
     * @param dimension
     * @returns {r}
     */
    Range.prototype.dim = function (dimension) {
        var r = this.dims[dimension];
        if (r) {
            return r;
        }
        //not yet existing create one
        this.dims[dimension] = __WEBPACK_IMPORTED_MODULE_0__Range1D__["a" /* default */].all();
        return this.dims[dimension];
    };
    /**
     * transforms the given multi dimensional indices to their parent notation
     * @param indices
     * @param size the underlying size for negative indices
     */
    Range.prototype.invert = function (indices, size) {
        var _this = this;
        if (this.isAll) {
            return indices;
        }
        return indices.map(function (index, i) {
            return _this.dim(i).invert(index, size ? size[i] : undefined);
        });
    };
    Range.prototype.indexRangeOf = function (r, size) {
        if (r.isNone || this.isNone) {
            return none();
        }
        if (this.isNone || r.isAll) {
            return this.clone();
        }
        return new Range(this.dims.map(function (d, i) { return d.indexRangeOf(r.dim(i), size ? size[i] : undefined); }));
    };
    Range.prototype.indexOf = function () {
        var _this = this;
        if (arguments[0] instanceof Range) {
            return this.indexRangeOf(arguments[0], arguments[1]);
        }
        var arr;
        if (arguments.length === 1) {
            if (typeof arguments[0] === 'number') {
                return this.dim(0).indexOf(arguments[0]);
            }
            arr = arguments[0];
        }
        else {
            arr = Array.from(arguments);
        }
        if (arr.length === 0) {
            return [];
        }
        return arr.map(function (index, i) { return _this.dim(i).indexOf(index); });
    };
    /**
     * returns the range size
     * @param size the underlying size for negative indices
     * @returns {*}
     */
    Range.prototype.size = function (size) {
        if (this.isAll) {
            return size;
        }
        return this.dims.map(function (r, i) {
            return r.size(size ? size[i] : undefined);
        });
    };
    Range.prototype.split = function () {
        return this.dims.map(function (dim) {
            return new Range([dim]);
        });
    };
    /**
     * iterates over the product of this range, e.g. (0,1,2),(3) => (0,3),(1,3),(2,3)
     * @param callback
     * @param size
     */
    Range.prototype.product = function (callback, size) {
        var _this = this;
        var ndim = this.ndim;
        var iter = function (ids) {
            var act = ids.length;
            if (act < ndim) {
                var dim = _this.dims[act];
                dim.iter(size ? size[act] : null).forEach(function (id) {
                    ids.push(id);
                    iter(ids);
                    ids.pop();
                });
            }
            else {
                callback(ids.slice());
            }
        };
        iter([]);
    };
    /**
     * encoded the given range in a string
     */
    Range.prototype.toString = function () {
        return this.dims.map(function (d) {
            return d.toString();
        }).join(',');
    };
    return Range;
}());
/* harmony default export */ __webpack_exports__["c"] = Range;
/**
 * creates a new range including everything
 * @returns {Range}
 */
function all() {
    return new Range();
}
function none() {
    //ensure two dimensions
    return new Range([__WEBPACK_IMPORTED_MODULE_0__Range1D__["a" /* default */].none(), __WEBPACK_IMPORTED_MODULE_0__Range1D__["a" /* default */].none()]);
}


/***/ }),

/***/ 640:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Range1D__ = __webpack_require__(627);
/**
 * Created by Samuel Gratzl on 27.12.2016.
 */


var Range1DGroup = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](Range1DGroup, _super);
    function Range1DGroup(name, color, base) {
        var _this = _super.call(this, base) || this;
        _this.name = name;
        _this.color = color;
        return _this;
    }
    Range1DGroup.prototype.preMultiply = function (sub, size) {
        var r = _super.prototype.preMultiply.call(this, sub, size);
        return new Range1DGroup(this.name, this.color, r);
    };
    Range1DGroup.prototype.union = function (other, size) {
        var r = _super.prototype.union.call(this, other, size);
        return new Range1DGroup(this.name, this.color, r);
    };
    Range1DGroup.prototype.intersect = function (other, size) {
        var r = _super.prototype.intersect.call(this, other, size);
        return new Range1DGroup(this.name, this.color, r);
    };
    Range1DGroup.prototype.without = function (without, size) {
        var r = _super.prototype.without.call(this, without, size);
        return new Range1DGroup(this.name, this.color, r);
    };
    Range1DGroup.prototype.clone = function () {
        return new Range1DGroup(this.name, this.color, _super.prototype.clone.call(this));
    };
    Range1DGroup.prototype.toString = function () {
        return '"' + this.name + '""' + this.color + '"' + _super.prototype.toString.call(this);
    };
    Range1DGroup.prototype.toSet = function (size) {
        return new Range1DGroup(this.name, this.color, _super.prototype.toSet.call(this, size));
    };
    Range1DGroup.prototype.fromLike = function (indices) {
        return new Range1DGroup(this.name, this.color, _super.prototype.fromLike.call(this, indices));
    };
    return Range1DGroup;
}(__WEBPACK_IMPORTED_MODULE_1__Range1D__["a" /* default */]));
/* harmony default export */ __webpack_exports__["a"] = Range1DGroup;


/***/ }),

/***/ 648:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__session__ = __webpack_require__(676);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__event__ = __webpack_require__(226);
/* unused harmony export GLOBAL_EVENT_USER_LOGGED_IN */
/* unused harmony export GLOBAL_EVENT_USER_LOGGED_OUT */
/* unused harmony export ANONYMOUS_USER */
/* unused harmony export reset */
/* unused harmony export isLoggedIn */
/* unused harmony export login */
/* unused harmony export logout */
/* unused harmony export currentUser */
/* harmony export (immutable) */ __webpack_exports__["a"] = currentUserNameOrAnonymous;
/* unused harmony export EPermission */
/* unused harmony export EEntity */
/* unused harmony export ALL_READ_READ */
/* unused harmony export ALL_NONE_NONE */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return ALL_READ_NONE; });
/* unused harmony export DEFAULT_PERMISSION */
/* unused harmony export ALL_ALL_READ_READ */
/* unused harmony export ALL_ALL_NONE_NONE */
/* unused harmony export ALL_ALL_READ_NONE */
/* unused harmony export Permission */
/* unused harmony export encode */
/* unused harmony export decode */
/* unused harmony export canRead */
/* unused harmony export canWrite */
/* unused harmony export canExecute */
/* unused harmony export hasPermission */
/**
 * Created by sam on 27.02.2017.
 */


var GLOBAL_EVENT_USER_LOGGED_IN = 'USER_LOGGED_IN';
var GLOBAL_EVENT_USER_LOGGED_OUT = 'USER_LOGGED_OUT';
var ANONYMOUS_USER = { name: 'anonymous', roles: ['anonymous'] };
/**
 * resets the stored session data that will be automatically filled during login
 */
function reset() {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__session__["a" /* remove */])('logged_in');
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__session__["a" /* remove */])('username');
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__session__["a" /* remove */])('user');
}
/**
 * whether the user is logged in
 * @returns {boolean}
 */
function isLoggedIn() {
    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__session__["b" /* retrieve */])('logged_in') === true;
}
/**
 * stores the given user information
 * @param user
 */
function login(user) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__session__["c" /* store */])('logged_in', true);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__session__["c" /* store */])('username', user.name);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__session__["c" /* store */])('user', user);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__event__["a" /* fire */])(GLOBAL_EVENT_USER_LOGGED_IN, user);
}
/**
 * logs the current user out
 */
function logout() {
    var wasLoggedIn = isLoggedIn();
    reset();
    if (wasLoggedIn) {
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__event__["a" /* fire */])(GLOBAL_EVENT_USER_LOGGED_OUT);
    }
}
/**
 * returns the current user or null
 * @returns {any}
 */
function currentUser() {
    if (!isLoggedIn()) {
        return null;
    }
    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__session__["b" /* retrieve */])('user', ANONYMOUS_USER);
}
/**
 * returns the current user name else an anonymous user name
 */
function currentUserNameOrAnonymous() {
    var u = currentUser();
    return u ? u.name : ANONYMOUS_USER.name;
}
var EPermission;
(function (EPermission) {
    EPermission[EPermission["READ"] = 4] = "READ";
    EPermission[EPermission["WRITE"] = 2] = "WRITE";
    EPermission[EPermission["EXECUTE"] = 1] = "EXECUTE";
})(EPermission || (EPermission = {}));
var EEntity;
(function (EEntity) {
    EEntity[EEntity["USER"] = 0] = "USER";
    EEntity[EEntity["GROUP"] = 1] = "GROUP";
    EEntity[EEntity["OTHERS"] = 2] = "OTHERS";
    EEntity[EEntity["BUDDIES"] = 3] = "BUDDIES";
})(EEntity || (EEntity = {}));
function toNumber(p) {
    return (p.has(EPermission.READ) ? 4 : 0) + (p.has(EPermission.WRITE) ? 2 : 0) + (p.has(EPermission.EXECUTE) ? 1 : 0);
}
function toString(p) {
    return (p.has(EPermission.READ) ? 'r' : '-') + (p.has(EPermission.WRITE) ? 'w' : '-') + (p.has(EPermission.EXECUTE) ? 'x' : '-');
}
function fromNumber(p) {
    var r = new Set();
    if (p >= 4) {
        r.add(EPermission.READ);
        p -= 4;
    }
    if (p >= 2) {
        r.add(EPermission.WRITE);
        p -= 2;
    }
    if (p >= 1) {
        r.add(EPermission.EXECUTE);
    }
    return r;
}
/**
 * by default only the creator has all permissions
 * @type {number}
 */
var ALL_READ_READ = 744;
var ALL_NONE_NONE = 700;
var ALL_READ_NONE = 740;
var DEFAULT_PERMISSION = ALL_READ_READ;
/**
 * buddy variants: buddy, creator, group, others
 * buddies first for backward compatibility
 */
var ALL_ALL_READ_READ = 7744;
var ALL_ALL_NONE_NONE = 7700;
var ALL_ALL_READ_NONE = 7740;
var Permission = /** @class */ (function () {
    function Permission(user, group, others, buddies) {
        if (buddies === void 0) { buddies = new Set(); }
        this.user = user;
        this.group = group;
        this.others = others;
        this.buddies = buddies;
    }
    Permission.prototype.encode = function () {
        return encode(this.user, this.group, this.others);
    };
    Permission.prototype.toString = function () {
        var userEncoded = toString(this.user);
        var groupEncoded = toString(this.group);
        var othersEncoded = toString(this.others);
        return userEncoded + groupEncoded + othersEncoded;
    };
    Permission.prototype.getPermissions = function (entity) {
        switch (entity) {
            case EEntity.USER: return this.user;
            case EEntity.GROUP: return this.group;
            case EEntity.OTHERS: return this.others;
        }
    };
    Permission.prototype.hasPermission = function (entity, permission) {
        var permissions = this.getPermissions(entity);
        return permissions.has(permission);
    };
    return Permission;
}());

function encode(user, group, others, buddies) {
    if (buddies === void 0) { buddies = new Set(); }
    var userEncoded = toNumber(user);
    var groupEncoded = toNumber(group);
    var othersEncoded = toNumber(others);
    var buddiesEncoded = toNumber(buddies);
    return buddiesEncoded * 1000 + userEncoded * 100 + groupEncoded * 10 + othersEncoded;
}
function decode(permission) {
    if (permission === void 0) { permission = DEFAULT_PERMISSION; }
    if (typeof permission !== 'number') {
        permission = DEFAULT_PERMISSION;
    }
    var others = fromNumber(permission % 10);
    var group = fromNumber(Math.floor(permission / 10) % 10);
    var user = fromNumber(Math.floor(permission / 100) % 10);
    var buddies = fromNumber(Math.floor(permission / 1000) % 10);
    return new Permission(user, group, others, buddies);
}
function isEqual(a, b) {
    if (a === b) {
        return true;
    }
    if (a === null || b === null) {
        return false;
    }
    a = a.toLowerCase();
    b = b.toLowerCase();
    return a.localeCompare(b) === 0;
}
function includes(items, item) {
    if (!item) {
        return false;
    }
    return items.some(function (r) { return isEqual(item, r); });
}
function can(item, permission, user) {
    if (user === void 0) { user = currentUser(); }
    if (!user) {
        user = ANONYMOUS_USER;
    }
    var permissions = decode(item.permissions);
    // I'm the creator and have the right
    if (isEqual(user.name, item.creator) && permissions.user.has(permission)) {
        return true;
    }
    // check if I'm in the group and have the right
    if (item.group && includes(user.roles, item.group) && permissions.group.has(permission)) {
        return true;
    }
    // check if I'm a buddy having the right
    if (item.buddies && Array.isArray(item.buddies) && includes(item.buddies, user.name) && permissions.buddies.has(permission)) {
        return true;
    }
    // check others
    return permissions.others.has(permission);
}
/**
 * check whether the given user can read the given item
 * @param item the item to check
 * @param user the user by default the current user
 * @returns {boolean}
 */
function canRead(item, user) {
    if (user === void 0) { user = currentUser(); }
    return can(item, EPermission.READ, user);
}
/**
 * check whether the given user can write the given item
 * @param item the item to check
 * @param user the user by default the current user
 * @returns {boolean}
 */
function canWrite(item, user) {
    if (user === void 0) { user = currentUser(); }
    return can(item, EPermission.WRITE, user);
}
/**
 * check whether the given user can execute the given item
 * @param item the item to check
 * @param user the user by default the current user
 * @returns {boolean}
 */
function canExecute(item, user) {
    if (user === void 0) { user = currentUser(); }
    return can(item, EPermission.EXECUTE, user);
}
function hasPermission(item, entity, permission) {
    if (entity === void 0) { entity = EEntity.USER; }
    if (permission === void 0) { permission = EPermission.READ; }
    var permissions = decode(item.permissions);
    return permissions.hasPermission(entity, permission);
}


/***/ }),

/***/ 650:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__graph__ = __webpack_require__(632);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return defaultGraphFactory; });

/**
 * Created by sam on 12.02.2015.
 */
/**
 * Created by Samuel Gratzl on 22.10.2014.
 */

var defaultGraphFactory = {
    makeNode: function (p) { return ((new __WEBPACK_IMPORTED_MODULE_1__graph__["c" /* GraphNode */]()).restore(p)); },
    makeEdge: function (p, lookup) { return ((new __WEBPACK_IMPORTED_MODULE_1__graph__["a" /* GraphEdge */]()).restore(p, lookup)); }
};
var GraphBase = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](GraphBase, _super);
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
        if (edgeOrSource instanceof __WEBPACK_IMPORTED_MODULE_1__graph__["a" /* GraphEdge */]) {
            var e = edgeOrSource;
            this.edges.push(e);
            this.fire('add_edge', e, e.type, e.source, e.target);
            return this;
        }
        return this.addEdge(new __WEBPACK_IMPORTED_MODULE_1__graph__["a" /* GraphEdge */](type, edgeOrSource, t));
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
}(__WEBPACK_IMPORTED_MODULE_1__graph__["e" /* AGraph */]));
/* harmony default export */ __webpack_exports__["a"] = GraphBase;


/***/ }),

/***/ 651:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__event__ = __webpack_require__(226);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__IIDType__ = __webpack_require__(625);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__IDType__ = __webpack_require__(630);
/* unused harmony export ASelectAble */
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */





var ASelectAble = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](ASelectAble, _super);
    function ASelectAble() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.numSelectListeners = 0;
        _this.selectionListeners = [];
        _this.singleSelectionListener = function (event, type, act, added, removed) { return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](_this, void 0, void 0, function () {
            var ids;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ids()];
                    case 1:
                        ids = _a.sent();
                        //filter to the right ids and convert to indices format
                        //given all ids convert the selected ids to the indices in the data type
                        act = ids.indexOf(act);
                        added = ids.indexOf(added);
                        removed = ids.indexOf(removed);
                        if (act.isNone && added.isNone && removed.isNone) {
                            return [2 /*return*/];
                        }
                        //ensure the right number of dimensions
                        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__IIDType__["d" /* fillWithNone */])(act, ids.ndim);
                        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__IIDType__["d" /* fillWithNone */])(added, ids.ndim);
                        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__IIDType__["d" /* fillWithNone */])(removed, ids.ndim);
                        this.fire(ASelectAble.EVENT_SELECT, type, act, added, removed);
                        this.fire(ASelectAble.EVENT_SELECT + "-" + type, act, added, removed);
                        return [2 /*return*/];
                }
            });
        }); };
        _this.selectionCache = [];
        _this.accumulateEvents = -1;
        return _this;
    }
    ASelectAble.prototype.fromIdRange = function (idRange) {
        if (idRange === void 0) { idRange = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ids()];
                    case 1: return [2 /*return*/, (_a.sent()).indexOf(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["g" /* parse */])(idRange))];
                }
            });
        });
    };
    Object.defineProperty(ASelectAble.prototype, "idtypes", {
        get: function () {
            return [];
        },
        enumerable: true,
        configurable: true
    });
    ASelectAble.prototype.selectionListener = function (idtype, index, total) {
        var _this = this;
        return function (event, type, act, added, removed) {
            _this.selectionCache[index] = { act: act, added: added, removed: removed };
            if (_this.accumulateEvents < 0 || (++_this.accumulateEvents) === total) {
                _this.fillAndSend(type, index);
            }
        };
    };
    ASelectAble.prototype.fillAndSend = function (type, trigger) {
        var _this = this;
        var ids = this.idtypes;
        var full = ids.map(function (id, i) {
            var entry = _this.selectionCache[i];
            if (entry) {
                return entry;
            }
            return {
                act: id.selections(type),
                added: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["d" /* none */])(),
                removed: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["d" /* none */])()
            };
        });
        var act = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["h" /* join */])(full.map(function (entry) { return entry.act; }));
        var added = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["h" /* join */])(full.map(function (entry) { return entry.added; }));
        var removed = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["h" /* join */])(full.map(function (entry) { return entry.removed; }));
        this.selectionCache = [];
        this.accumulateEvents = -1; //reset
        this.singleSelectionListener(null, type, act, added, removed);
    };
    ASelectAble.prototype.on = function (events, handler) {
        var _this = this;
        if (typeof events === 'string' && (events === ASelectAble.EVENT_SELECT || events.slice(0, 'select-'.length) === 'select-')) {
            this.numSelectListeners++;
            if (this.numSelectListeners === 1) {
                var idt_1 = this.idtypes;
                if (idt_1.length === 1) {
                    this.selectionListeners.push(this.singleSelectionListener);
                    idt_1[0].on(ASelectAble.EVENT_SELECT, this.singleSelectionListener);
                }
                else {
                    idt_1.forEach(function (idtype, i) {
                        var s = _this.selectionListener(idtype, i, idt_1.length);
                        _this.selectionListeners.push(s);
                        idtype.on(ASelectAble.EVENT_SELECT, s);
                    });
                }
            }
        }
        return _super.prototype.on.call(this, events, handler);
    };
    ASelectAble.prototype.off = function (events, handler) {
        var _this = this;
        if (typeof events === 'string' && (events === ASelectAble.EVENT_SELECT || events.slice(0, 'select-'.length) === 'select-')) {
            this.numSelectListeners--;
            if (this.numSelectListeners === 0) {
                this.idtypes.forEach(function (idtype, i) { return idtype.off(ASelectAble.EVENT_SELECT, _this.selectionListeners[i]); });
                this.selectionListeners = [];
            }
        }
        return _super.prototype.off.call(this, events, handler);
    };
    ASelectAble.prototype.selections = function (type) {
        if (type === void 0) { type = __WEBPACK_IMPORTED_MODULE_3__IIDType__["a" /* defaultSelectionType */]; }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var ids, r;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ids()];
                    case 1:
                        ids = _a.sent();
                        r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["h" /* join */])(this.idtypes.map(function (idtype) { return idtype.selections(type); }));
                        return [2 /*return*/, ids.indexRangeOf(r)];
                }
            });
        });
    };
    ASelectAble.prototype.select = function () {
        var a = Array.from(arguments);
        var dim = (typeof a[0] === 'number') ? +a.shift() : -1, type = (typeof a[0] === 'string') ? a.shift() : __WEBPACK_IMPORTED_MODULE_3__IIDType__["a" /* defaultSelectionType */], range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["g" /* parse */])(a[0]), op = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__IIDType__["c" /* asSelectOperation */])(a[1]);
        return this.selectImpl(range, op, type, dim);
    };
    ASelectAble.prototype.selectImpl = function (range, op, type, dim) {
        if (op === void 0) { op = __WEBPACK_IMPORTED_MODULE_3__IIDType__["b" /* SelectOperation */].SET; }
        if (type === void 0) { type = __WEBPACK_IMPORTED_MODULE_3__IIDType__["a" /* defaultSelectionType */]; }
        if (dim === void 0) { dim = -1; }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var types, ids, r;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        types = this.idtypes;
                        return [4 /*yield*/, this.ids()];
                    case 1:
                        ids = _a.sent();
                        if (dim === -1) {
                            range = ids.preMultiply(range);
                            this.accumulateEvents = 0;
                            r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["h" /* join */])(range.split().map(function (r, i) { return types[i].select(type, r, op); }));
                            if (this.accumulateEvents > 0) { //one event has not been fires, so do it manually
                                this.fillAndSend(type, -1);
                            }
                            while (r.ndim < types.length) {
                                r.dim(r.ndim); //create intermediate ones
                            }
                            return [2 /*return*/, ids.indexRangeOf(r)];
                        }
                        else {
                            //just a single dimension
                            ids = ids.split()[dim];
                            range = ids.preMultiply(range);
                            types[dim].select(type, range, op);
                            return [2 /*return*/, ids.indexRangeOf(range)];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    ASelectAble.prototype.clear = function () {
        var a = Array.from(arguments);
        var dim = (typeof a[0] === 'number') ? +a.shift() : -1;
        var type = (typeof a[0] === 'string') ? a[0] : __WEBPACK_IMPORTED_MODULE_3__IIDType__["a" /* defaultSelectionType */];
        return this.selectImpl(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["d" /* none */])(), __WEBPACK_IMPORTED_MODULE_3__IIDType__["b" /* SelectOperation */].SET, type, dim);
    };
    ASelectAble.EVENT_SELECT = __WEBPACK_IMPORTED_MODULE_4__IDType__["a" /* default */].EVENT_SELECT;
    return ASelectAble;
}(__WEBPACK_IMPORTED_MODULE_1__event__["b" /* EventHandler */]));

/* harmony default export */ __webpack_exports__["a"] = ASelectAble;


/***/ }),

/***/ 652:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ajax__ = __webpack_require__(629);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__event__ = __webpack_require__(226);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__IIDType__ = __webpack_require__(625);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__IDType__ = __webpack_require__(630);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ProductIDType__ = __webpack_require__(636);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__plugin__ = __webpack_require__(70);
/* unused harmony export EVENT_REGISTER_IDTYPE */
/* harmony export (immutable) */ __webpack_exports__["a"] = resolve;
/* harmony export (immutable) */ __webpack_exports__["c"] = resolveProduct;
/* harmony export (immutable) */ __webpack_exports__["b"] = list;
/* unused harmony export listAll */
/* unused harmony export register */
/* unused harmony export persist */
/* unused harmony export restore */
/* unused harmony export clearSelection */
/* unused harmony export isInternalIDType */
/**
 * Created by sam on 26.12.2016.
 */







var cache = new Map();
var filledUp = false;
var EVENT_REGISTER_IDTYPE = 'register.idtype';
function fillUpData(entries) {
    entries.forEach(function (row) {
        var entry = cache.get(row.id);
        var newOne = false;
        if (entry) {
            if (entry instanceof __WEBPACK_IMPORTED_MODULE_4__IDType__["a" /* default */]) {
                entry.name = row.name;
                entry.names = row.names;
            }
        }
        else {
            entry = new __WEBPACK_IMPORTED_MODULE_4__IDType__["a" /* default */](row.id, row.name, row.names);
            newOne = true;
        }
        cache.set(row.id, entry);
        if (newOne) {
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__event__["a" /* fire */])(EVENT_REGISTER_IDTYPE, entry);
        }
    });
}
function toPlural(name) {
    if (name[name.length - 1] === 'y') {
        return name.slice(0, name.length - 1) + 'ies';
    }
    return name + 's';
}
function resolve(id) {
    if (id instanceof __WEBPACK_IMPORTED_MODULE_4__IDType__["a" /* default */]) {
        return id;
    }
    else {
        var sid = id;
        return register(sid, new __WEBPACK_IMPORTED_MODULE_4__IDType__["a" /* default */](sid, sid, toPlural(sid)));
    }
}
function resolveProduct() {
    var idtypes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        idtypes[_i] = arguments[_i];
    }
    var p = new __WEBPACK_IMPORTED_MODULE_5__ProductIDType__["a" /* default */](idtypes);
    return register(p.id, p);
}
/**
 * list currently resolved idtypes
 * @returns {Array<IDType|ProductIDType>}
 */
function list() {
    return Array.from(cache.values());
}
/**
 * Get a list of all IIDTypes available on both the server and the client.
 * @returns {any}
 */
function listAll() {
    return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
        var c;
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (filledUp) {
                        return [2 /*return*/, Promise.resolve(list())];
                    }
                    return [4 /*yield*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__ajax__["a" /* getAPIJSON */])('/idtype/', {}, [])];
                case 1:
                    c = _a.sent();
                    filledUp = true;
                    fillUpData(c);
                    return [2 /*return*/, list()];
            }
        });
    });
}
function register(id, idtype) {
    if (cache.has(id)) {
        return cache.get(id);
    }
    cache.set(id, idtype);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__event__["a" /* fire */])('register.idtype', idtype);
    return idtype;
}
function persist() {
    var r = {};
    cache.forEach(function (v, id) {
        r[id] = v.persist();
    });
    return r;
}
function restore(persisted) {
    Object.keys(persisted).forEach(function (id) {
        resolve(id).restore(persisted[id]);
    });
}
function clearSelection(type) {
    if (type === void 0) { type = __WEBPACK_IMPORTED_MODULE_3__IIDType__["a" /* defaultSelectionType */]; }
    cache.forEach(function (v) { return v.clear(type); });
}
/**
 * whether the given idtype is an internal one or not, i.e. the internal flag is set or it starts with an underscore
 * @param idtype
 * @return {boolean}
 */
function isInternalIDType(idtype) {
    return idtype.internal || idtype.id.startsWith('_');
}
{
    var EXTENSION_POINT_IDTYPE = 'idType';
    //register known idtypes via registry
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__plugin__["b" /* list */])(EXTENSION_POINT_IDTYPE).forEach(function (plugin) {
        var id = plugin.id;
        var name = plugin.name;
        var names = plugin.names || toPlural(name);
        var internal = Boolean(plugin.internal);
        register(id, new __WEBPACK_IMPORTED_MODULE_4__IDType__["a" /* default */](id, name, names, internal));
    });
}


/***/ }),

/***/ 653:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index__ = __webpack_require__(224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__idtype__ = __webpack_require__(622);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__datatype__ = __webpack_require__(621);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__plugin__ = __webpack_require__(70);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__ObjectNode__ = __webpack_require__(673);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__StateNode__ = __webpack_require__(687);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__ActionNode__ = __webpack_require__(683);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__SlideNode__ = __webpack_require__(686);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__graph_graph__ = __webpack_require__(632);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__internal_promise__ = __webpack_require__(228);
/* unused harmony export compress */
/* harmony export (immutable) */ __webpack_exports__["b"] = provenanceGraphFactory;
/* unused harmony export ProvenanceGraphDim */
/* unused harmony export toSlidePath */

/**
 * Created by sam on 12.02.2015.
 */











function removeNoops(path) {
    return path.filter(function (a) { return a.f_id !== 'noop'; });
}
function compositeCompressor(cs) {
    return function (path) {
        path = removeNoops(path);
        var before;
        do {
            before = path.length;
            cs.forEach(function (c) { return path = c(path); });
        } while (before > path.length);
        return path;
    };
}
function createCompressor(path) {
    return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
        var toload, _a;
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_b) {
            switch (_b.label) {
                case 0:
                    toload = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__plugin__["b" /* list */])('actionCompressor').filter(function (plugin) {
                        return path.some(function (action) { return action.f_id.match(plugin.matches) != null; });
                    });
                    _a = compositeCompressor;
                    return [4 /*yield*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__plugin__["c" /* load */])(toload)];
                case 1: return [2 /*return*/, _a.apply(void 0, [(_b.sent()).map(function (l) { return l.factory; })])];
            }
        });
    });
}
/**
 * returns a compressed version of the paths where just the last selection operation remains
 * @param path
 */
function compress(path) {
    return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
        var compressor, before;
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (path.length <= 1) {
                        return [2 /*return*/, path]; //can't compress single one
                    }
                    return [4 /*yield*/, createCompressor(path)];
                case 1:
                    compressor = _a.sent();
                    do {
                        before = path.length;
                        path = compressor(path);
                    } while (before > path.length);
                    //console.log('after', path.map((path) => path.toString()));
                    return [2 /*return*/, path];
            }
        });
    });
}
/**
 * find common element in the list of two elements returning the indices of the first same item
 * @param a
 * @param b
 * @returns {any}
 */
function findCommon(a, b) {
    var c = 0;
    while (c < a.length && c < b.length && a[c] === b[c]) { //go to next till a difference
        c++;
    }
    if (c === 0) { //not even the root common
        return null;
    }
    return {
        i: c - 1,
        j: c - 1
    };
}
function asFunction(i) {
    if (typeof (i) !== 'function') { //make a function
        return function () { return i; };
    }
    return i;
}
function noop(inputs, parameter) {
    return {
        inverse: createNoop()
    };
}
function createNoop() {
    return {
        meta: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_8__ActionNode__["a" /* meta */])('noop', __WEBPACK_IMPORTED_MODULE_6__ObjectNode__["a" /* cat */].custom),
        id: 'noop',
        f: noop,
        inputs: [],
        parameter: {}
    };
}
function createLazyCmdFunctionFactory() {
    var facts = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__plugin__["b" /* list */])('actionFactory');
    var singles = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__plugin__["b" /* list */])('actionFunction');
    function resolveFun(id) {
        if (id === 'noop') {
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_11__internal_promise__["a" /* resolveImmediately */])(noop);
        }
        var single = singles.find(function (f) { return f.id === id; });
        if (single) {
            return single.load().then(function (f) { return f.factory; });
        }
        var factory = facts.find(function (f) { return id.match(f.creates) != null; });
        if (factory) {
            return factory.load().then(function (f) { return f.factory(id); });
        }
        return Promise.reject('no factory found for ' + id);
    }
    var lazyFunction = function (id) {
        var _resolved = null;
        return function (inputs, parameters) {
            var that = this, args = Array.from(arguments);
            if (_resolved == null) {
                _resolved = resolveFun(id);
            }
            return _resolved.then(function (f) { return f.apply(that, args); });
        };
    };
    return function (id) { return lazyFunction(id); };
}
function provenanceGraphFactory() {
    var factory = createLazyCmdFunctionFactory();
    var types = {
        action: __WEBPACK_IMPORTED_MODULE_8__ActionNode__["b" /* default */],
        state: __WEBPACK_IMPORTED_MODULE_7__StateNode__["a" /* default */],
        object: __WEBPACK_IMPORTED_MODULE_6__ObjectNode__["b" /* default */],
        story: __WEBPACK_IMPORTED_MODULE_9__SlideNode__["a" /* default */]
    };
    return {
        makeNode: function (n) { return types[n.type].restore(n, factory); },
        makeEdge: function (n, lookup) { return ((new __WEBPACK_IMPORTED_MODULE_10__graph_graph__["a" /* GraphEdge */]()).restore(n, lookup)); }
    };
}
var ProvenanceGraphDim;
(function (ProvenanceGraphDim) {
    ProvenanceGraphDim[ProvenanceGraphDim["Action"] = 0] = "Action";
    ProvenanceGraphDim[ProvenanceGraphDim["Object"] = 1] = "Object";
    ProvenanceGraphDim[ProvenanceGraphDim["State"] = 2] = "State";
    ProvenanceGraphDim[ProvenanceGraphDim["Slide"] = 3] = "Slide";
})(ProvenanceGraphDim || (ProvenanceGraphDim = {}));
function toSlidePath(s) {
    var r = [];
    while (s) {
        if (r.indexOf(s) >= 0) {
            return r;
        }
        r.push(s);
        s = s.next;
    }
    return r;
}
function findMetaObject(find) {
    return function (obj) { return find === obj || ((obj.value === null || obj.value === find.value) && (find.hash === obj.hash)); };
}
var ProvenanceGraph = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](ProvenanceGraph, _super);
    function ProvenanceGraph(desc, backend) {
        var _this = _super.call(this, desc) || this;
        _this.backend = backend;
        _this._actions = [];
        _this._objects = [];
        _this._states = [];
        _this._slides = [];
        _this.act = null;
        _this.lastAction = null;
        //currently executing promise
        _this.currentlyRunning = false;
        _this.executeCurrentActionWithin = -1;
        _this.nextQueue = [];
        _this.propagate.apply(_this, [_this.backend].concat(ProvenanceGraph.PROPAGATED_EVENTS));
        if (_this.backend.nnodes === 0) {
            _this.act = new __WEBPACK_IMPORTED_MODULE_7__StateNode__["a" /* default */]('Start');
            _this._states.push(_this.act);
            _this.backend.addNode(_this.act);
        }
        else {
            var act = desc.act;
            _this._actions = _this.backend.nodes.filter(function (n) { return (n instanceof __WEBPACK_IMPORTED_MODULE_8__ActionNode__["b" /* default */]); });
            _this._objects = _this.backend.nodes.filter(function (n) { return (n instanceof __WEBPACK_IMPORTED_MODULE_6__ObjectNode__["b" /* default */]); });
            _this._states = _this.backend.nodes.filter(function (n) { return (n instanceof __WEBPACK_IMPORTED_MODULE_7__StateNode__["a" /* default */]); });
            _this._slides = _this.backend.nodes.filter(function (n) { return (n instanceof __WEBPACK_IMPORTED_MODULE_9__SlideNode__["a" /* default */]); });
            _this.act = (act >= 0 ? _this.getStateById(act) : _this._states[0]);
        }
        return _this;
    }
    ProvenanceGraph.prototype.migrateBackend = function (backend) {
        //asserts that the old backend and the new one have the same nodes inside of them
        this.stopPropagation.apply(this, [this.backend].concat(ProvenanceGraph.PROPAGATED_EVENTS));
        this.backend = backend;
        this.propagate.apply(this, [this.backend].concat(ProvenanceGraph.PROPAGATED_EVENTS));
        //hack to update the description object
        this.desc = backend.desc;
    };
    Object.defineProperty(ProvenanceGraph.prototype, "isEmpty", {
        get: function () {
            return this._states.length <= 1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProvenanceGraph.prototype, "dim", {
        get: function () {
            return [this._actions.length, this._objects.length, this._states.length, this._slides.length];
        },
        enumerable: true,
        configurable: true
    });
    ProvenanceGraph.prototype.ids = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__range__["a" /* all */])(); }
        var toID = function (a) { return a.id; };
        var actions = __WEBPACK_IMPORTED_MODULE_3__range__["b" /* Range1D */].from(this._actions.map(toID));
        var objects = __WEBPACK_IMPORTED_MODULE_3__range__["b" /* Range1D */].from(this._objects.map(toID));
        var states = __WEBPACK_IMPORTED_MODULE_3__range__["b" /* Range1D */].from(this._states.map(toID));
        var stories = __WEBPACK_IMPORTED_MODULE_3__range__["b" /* Range1D */].from(this._slides.map(toID));
        return Promise.resolve(range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__range__["c" /* list */])(actions, objects, states, stories)));
    };
    ProvenanceGraph.prototype.selectState = function (state, op, type, extras) {
        if (op === void 0) { op = __WEBPACK_IMPORTED_MODULE_2__idtype__["a" /* SelectOperation */].SET; }
        if (type === void 0) { type = __WEBPACK_IMPORTED_MODULE_2__idtype__["b" /* defaultSelectionType */]; }
        if (extras === void 0) { extras = {}; }
        this.fire('select_state,select_state_' + type, state, type, op, extras);
        this.select(ProvenanceGraphDim.State, type, state ? [this._states.indexOf(state)] : [], op);
    };
    ProvenanceGraph.prototype.selectSlide = function (state, op, type, extras) {
        if (op === void 0) { op = __WEBPACK_IMPORTED_MODULE_2__idtype__["a" /* SelectOperation */].SET; }
        if (type === void 0) { type = __WEBPACK_IMPORTED_MODULE_2__idtype__["b" /* defaultSelectionType */]; }
        if (extras === void 0) { extras = {}; }
        this.fire('select_slide,select_slide_' + type, state, type, op, extras);
        this.select(ProvenanceGraphDim.Slide, type, state ? [this._slides.indexOf(state)] : [], op);
    };
    ProvenanceGraph.prototype.selectAction = function (action, op, type) {
        if (op === void 0) { op = __WEBPACK_IMPORTED_MODULE_2__idtype__["a" /* SelectOperation */].SET; }
        if (type === void 0) { type = __WEBPACK_IMPORTED_MODULE_2__idtype__["b" /* defaultSelectionType */]; }
        this.fire('select_action,select_action_' + type, action, type, op);
        this.select(ProvenanceGraphDim.Action, type, action ? [this._actions.indexOf(action)] : [], op);
    };
    ProvenanceGraph.prototype.selectedStates = function (type) {
        if (type === void 0) { type = __WEBPACK_IMPORTED_MODULE_2__idtype__["b" /* defaultSelectionType */]; }
        var sel = this.idtypes[ProvenanceGraphDim.State].selections(type);
        if (sel.isNone) {
            return [];
        }
        var lookup = new Map();
        this._states.forEach(function (s) { return lookup.set(s.id, s); });
        var nodes = [];
        sel.dim(0).forEach(function (id) {
            var n = lookup.get(id);
            if (n) {
                nodes.push(n);
            }
        });
        return nodes;
    };
    ProvenanceGraph.prototype.selectedSlides = function (type) {
        if (type === void 0) { type = __WEBPACK_IMPORTED_MODULE_2__idtype__["b" /* defaultSelectionType */]; }
        var sel = this.idtypes[ProvenanceGraphDim.Slide].selections(type);
        if (sel.isNone) {
            return [];
        }
        var lookup = new Map();
        this._slides.forEach(function (s) { return lookup.set(s.id, s); });
        var nodes = [];
        sel.dim(0).forEach(function (id) {
            var n = lookup.get(id);
            if (n) {
                nodes.push(n);
            }
        });
        return nodes;
    };
    Object.defineProperty(ProvenanceGraph.prototype, "idtypes", {
        get: function () {
            return ['_provenance_actions', '_provenance_objects', '_provenance_states', '_provenance_stories'].map(__WEBPACK_IMPORTED_MODULE_2__idtype__["c" /* resolve */]);
        },
        enumerable: true,
        configurable: true
    });
    ProvenanceGraph.prototype.clear = function () {
        var r = this.backend.clear();
        this._states = [];
        this._actions = [];
        this._objects = [];
        this._slides = [];
        this.act = null;
        this.lastAction = null;
        this.act = new __WEBPACK_IMPORTED_MODULE_7__StateNode__["a" /* default */]('start');
        this._states.push(this.act);
        this.backend.addNode(this.act);
        this.fire('clear');
        return Promise.resolve(r);
    };
    Object.defineProperty(ProvenanceGraph.prototype, "states", {
        get: function () {
            return this._states;
        },
        enumerable: true,
        configurable: true
    });
    ProvenanceGraph.prototype.getStateById = function (id) {
        return this._states.find(function (s) { return s.id === id; });
    };
    Object.defineProperty(ProvenanceGraph.prototype, "actions", {
        get: function () {
            return this._actions;
        },
        enumerable: true,
        configurable: true
    });
    ProvenanceGraph.prototype.getActionById = function (id) {
        return this._actions.find(function (s) { return s.id === id; });
    };
    Object.defineProperty(ProvenanceGraph.prototype, "objects", {
        get: function () {
            return this._objects;
        },
        enumerable: true,
        configurable: true
    });
    ProvenanceGraph.prototype.getObjectById = function (id) {
        return this._objects.find(function (s) { return s.id === id; });
    };
    Object.defineProperty(ProvenanceGraph.prototype, "stories", {
        get: function () {
            return this._slides;
        },
        enumerable: true,
        configurable: true
    });
    ProvenanceGraph.prototype.getSlideById = function (id) {
        return this._slides.find(function (s) { return s.id === id; });
    };
    ProvenanceGraph.prototype.getSlideChains = function () {
        return this.stories.filter(function (n) { return n.isStart; });
    };
    ProvenanceGraph.prototype.getSlides = function () {
        return this.getSlideChains().map(toSlidePath);
    };
    Object.defineProperty(ProvenanceGraph.prototype, "edges", {
        get: function () {
            return this.backend.edges;
        },
        enumerable: true,
        configurable: true
    });
    ProvenanceGraph.prototype.addEdge = function (s, type, t, attrs) {
        if (attrs === void 0) { attrs = {}; }
        var l = new __WEBPACK_IMPORTED_MODULE_10__graph_graph__["a" /* GraphEdge */](type, s, t);
        Object.keys(attrs).forEach(function (attr) { return l.setAttr(attr, attrs[attr]); });
        this.backend.addEdge(l);
        return l;
    };
    ProvenanceGraph.prototype.createAction = function (meta, functionId, f, inputs, parameter) {
        if (inputs === void 0) { inputs = []; }
        if (parameter === void 0) { parameter = {}; }
        var r = new __WEBPACK_IMPORTED_MODULE_8__ActionNode__["b" /* default */](meta, functionId, f, parameter);
        return this.initAction(r, inputs);
    };
    ProvenanceGraph.prototype.initAction = function (r, inputs) {
        var _this = this;
        if (inputs === void 0) { inputs = []; }
        var inobjects = inputs.map(function (i) { return ProvenanceGraph.findInArray(_this._objects, i); });
        this._actions.push(r);
        this.backend.addNode(r);
        this.fire('add_action', r);
        inobjects.forEach(function (obj, i) {
            _this.addEdge(r, 'requires', obj, { index: i });
        });
        return r;
    };
    ProvenanceGraph.prototype.createInverse = function (action, inverter) {
        var _this = this;
        var creates = action.creates, removes = action.removes;
        var i = inverter.call(action, action.requires, creates, removes);
        var inverted = this.createAction(i.meta, i.id, i.f, i.inputs, i.parameter);
        inverted.onceExecuted = true;
        this.addEdge(inverted, 'inverses', action);
        //the inverted action should create the removed ones and removes the crated ones
        removes.forEach(function (c, i) {
            _this.addEdge(inverted, 'creates', c, { index: i });
        });
        creates.forEach(function (c) {
            _this.addEdge(inverted, 'removes', c);
        });
        //create the loop in the states
        this.addEdge(action.resultsIn, 'next', inverted);
        this.addEdge(inverted, 'resultsIn', action.previous);
        return inverted;
    };
    ProvenanceGraph.prototype.push = function (arg, functionId, f, inputs, parameter) {
        var _this = this;
        if (functionId === void 0) { functionId = ''; }
        if (f === void 0) { f = null; }
        if (inputs === void 0) { inputs = []; }
        if (parameter === void 0) { parameter = {}; }
        return this.inOrder(function () {
            if (arg instanceof __WEBPACK_IMPORTED_MODULE_8__ActionNode__["c" /* ActionMetaData */]) {
                return _this.run(_this.createAction(arg, functionId, f, inputs, parameter), null);
            }
            else {
                var a = arg;
                return _this.run(_this.createAction(a.meta, a.id, a.f, a.inputs || [], a.parameter || {}), null);
            }
        });
    };
    ProvenanceGraph.prototype.pushWithResult = function (action, result) {
        var _this = this;
        return this.inOrder(function () {
            var a = _this.createAction(action.meta, action.id, action.f, action.inputs || [], action.parameter || {});
            return _this.run(a, result);
        });
    };
    ProvenanceGraph.prototype.findObject = function (value) {
        var r = this._objects.find(function (obj) { return obj.value === value; });
        if (r) {
            return r;
        }
        return null;
    };
    ProvenanceGraph.prototype.addObject = function (value, name, category, hash) {
        if (name === void 0) { name = value ? value.toString() : 'Null'; }
        if (category === void 0) { category = __WEBPACK_IMPORTED_MODULE_6__ObjectNode__["a" /* cat */].data; }
        if (hash === void 0) { hash = name + '_' + category; }
        return this.addObjectImpl(value, name, category, hash, true);
    };
    ProvenanceGraph.prototype.addJustObject = function (value, name, category, hash) {
        if (name === void 0) { name = value ? value.toString() : 'Null'; }
        if (category === void 0) { category = __WEBPACK_IMPORTED_MODULE_6__ObjectNode__["a" /* cat */].data; }
        if (hash === void 0) { hash = name + '_' + category; }
        return this.addObjectImpl(value, name, category, hash, false);
    };
    ProvenanceGraph.prototype.addObjectImpl = function (value, name, category, hash, createEdge) {
        if (name === void 0) { name = value ? value.toString() : 'Null'; }
        if (category === void 0) { category = __WEBPACK_IMPORTED_MODULE_6__ObjectNode__["a" /* cat */].data; }
        if (hash === void 0) { hash = name + '_' + category; }
        if (createEdge === void 0) { createEdge = false; }
        var r = new __WEBPACK_IMPORTED_MODULE_6__ObjectNode__["b" /* default */](value, name, category, hash);
        this._objects.push(r);
        this.backend.addNode(r);
        if (createEdge) {
            this.addEdge(this.act, 'consistsOf', r);
        }
        this.fire('add_object', r);
        return r;
    };
    ProvenanceGraph.prototype.resolve = function (arr) {
        var _this = this;
        return arr.map(function (r) {
            if (r instanceof __WEBPACK_IMPORTED_MODULE_6__ObjectNode__["b" /* default */]) {
                return r;
            }
            if (r._resolvesTo instanceof __WEBPACK_IMPORTED_MODULE_6__ObjectNode__["b" /* default */]) {
                return r._resolvesTo;
            }
            //else create a new instance
            var result = _this.addJustObject(r.value, r.name, r.category, r.hash);
            r._resolvesTo = result;
            return result;
        });
    };
    ProvenanceGraph.findInArray = function (arr, r) {
        if (r instanceof __WEBPACK_IMPORTED_MODULE_6__ObjectNode__["b" /* default */]) {
            return r;
        }
        if (r._resolvesTo instanceof __WEBPACK_IMPORTED_MODULE_6__ObjectNode__["b" /* default */]) {
            return r._resolvesTo;
        }
        //else create a new instance
        var result = arr.find(findMetaObject(r));
        r._resolvesTo = result;
        return result;
    };
    ProvenanceGraph.prototype.findOrAddObject = function (i, name, type) {
        return this.findOrAddObjectImpl(i, name, type, true);
    };
    ProvenanceGraph.prototype.findOrAddJustObject = function (i, name, type) {
        return this.findOrAddObjectImpl(i, name, type, false);
    };
    ProvenanceGraph.prototype.findOrAddObjectImpl = function (i, name, type, createEdge) {
        if (createEdge === void 0) { createEdge = false; }
        var r;
        var j = i;
        if (i instanceof __WEBPACK_IMPORTED_MODULE_6__ObjectNode__["b" /* default */]) {
            return i;
        }
        if (j._resolvesTo instanceof __WEBPACK_IMPORTED_MODULE_6__ObjectNode__["b" /* default */]) {
            return j._resolvesTo;
        }
        if (j.hasOwnProperty('value') && j.hasOwnProperty('name')) { //sounds like an proxy
            j.category = j.category || __WEBPACK_IMPORTED_MODULE_6__ObjectNode__["a" /* cat */].data;
            r = this._objects.find(findMetaObject(j));
            if (r) {
                if (r.value === null) { //restore instance
                    r.value = j.value;
                }
                //cache result
                j._resolvesTo = r;
                return r;
            }
            return this.addObjectImpl(j.value, j.name, j.category, j.hash, createEdge);
        }
        else { //raw value
            r = this._objects.find(function (obj) { return (obj.value === null || obj.value === i) && (name === null || obj.name === name) && (type === null || type === obj.category); });
            if (r) {
                if (r.value === null) { //restore instance
                    r.value = i;
                }
                return r;
            }
            return this.addObjectImpl(i, name, type, name + '_' + type, createEdge);
        }
    };
    ProvenanceGraph.prototype.inOrder = function (f) {
        var _this = this;
        if (this.currentlyRunning) {
            var helper_1;
            var r = new Promise(function (resolve) {
                helper_1 = resolve.bind(_this);
            });
            this.nextQueue.push(helper_1);
            return r.then(f);
        }
        else {
            return f();
        }
    };
    ProvenanceGraph.prototype.executedAction = function (action, newState, result) {
        var _this = this;
        var current = this.act;
        var next = action.resultsIn;
        result = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["a" /* mixin */])({ created: [], removed: [], inverse: null, consumed: 0 }, result);
        this.fire('executed', action, result);
        var firstTime = !action.onceExecuted;
        action.onceExecuted = true;
        var created;
        var removed;
        if (firstTime) {
            //create an link outputs
            //
            created = this.resolve(result.created);
            created.forEach(function (c, i) {
                _this.addEdge(action, 'creates', c, { index: i });
            });
            // a removed one should be part of the inputs
            var requires_1 = action.requires;
            removed = result.removed.map(function (r) { return ProvenanceGraph.findInArray(requires_1, r); });
            removed.forEach(function (c) {
                c.value = null; //free reference
                _this.addEdge(action, 'removes', c);
            });
            //update new state
            if (newState) {
                var objs_1 = current.consistsOf;
                objs_1.push.apply(objs_1, created);
                removed.forEach(function (r) {
                    var i = objs_1.indexOf(r);
                    objs_1.splice(i, 1);
                });
                objs_1.forEach(function (obj) { return _this.addEdge(next, 'consistsOf', obj); });
            }
            this.fire('executed_first', action, next);
        }
        else {
            created = action.creates;
            //update creates reference values
            created.forEach(function (c, i) {
                c.value = result.created[i].value;
            });
            removed = action.removes;
            removed.forEach(function (c) { return c.value = null; });
        }
        result.inverse = asFunction(result.inverse);
        action.updateInverse(this, result.inverse);
        this.switchToImpl(action, next);
        return {
            action: action,
            state: next,
            created: created,
            removed: removed,
            consumed: result.consumed
        };
    };
    ProvenanceGraph.prototype.run = function (action, result, withinMilliseconds) {
        var _this = this;
        if (withinMilliseconds === void 0) { withinMilliseconds = -1; }
        var next = action.resultsIn, newState = false;
        if (!next) { //create a new state
            newState = true;
            this.addEdge(this.act, 'next', action);
            next = this.makeState(action.meta.name);
            this.addEdge(action, 'resultsIn', next);
        }
        this.fire('execute', action);
        if (__WEBPACK_IMPORTED_MODULE_1__index__["b" /* hash */].has('debug')) {
            console.log('execute ' + action.meta + ' ' + action.f_id);
        }
        this.currentlyRunning = true;
        if (typeof (withinMilliseconds) === 'function') {
            withinMilliseconds = withinMilliseconds();
        }
        this.executeCurrentActionWithin = withinMilliseconds;
        var runningAction = (result ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_11__internal_promise__["a" /* resolveImmediately */])(result) : action.execute(this, this.executeCurrentActionWithin)).then(this.executedAction.bind(this, action, newState));
        runningAction.then(function (result) {
            var q = _this.nextQueue.shift();
            if (q) {
                q();
            }
            else {
                _this.currentlyRunning = false;
            }
        });
        return runningAction;
    };
    ProvenanceGraph.prototype.switchToImpl = function (action, state) {
        var bak = this.act;
        this.act = state;
        this.fire('switch_state', state, bak);
        bak = this.lastAction;
        this.lastAction = action;
        this.fire('switch_action', action, bak);
    };
    /**
     * execute a bunch of already executed actions
     * @param actions
     */
    ProvenanceGraph.prototype.runChain = function (actions, withinMilliseconds) {
        if (withinMilliseconds === void 0) { withinMilliseconds = -1; }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            function guessTime(index) {
                var left = torun.length - index;
                return function () { return remaining < 0 ? -1 : remaining / left; }; //uniformly distribute
            }
            function updateTime(consumed) {
                remaining -= consumed;
            }
            var last, torun, remaining, results, i, action, result;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (actions.length === 0) {
                            if (withinMilliseconds > 0) {
                                return [2 /*return*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["c" /* resolveIn */])(withinMilliseconds).then(function () { return []; })];
                            }
                            return [2 /*return*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_11__internal_promise__["a" /* resolveImmediately */])([])];
                        }
                        last = actions[actions.length - 1];
                        return [4 /*yield*/, compress(actions)];
                    case 1:
                        torun = _a.sent();
                        remaining = withinMilliseconds;
                        this.fire('run_chain', torun);
                        results = [];
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < torun.length)) return [3 /*break*/, 5];
                        action = torun[i];
                        return [4 /*yield*/, this.run(action, null, withinMilliseconds < 0 ? -1 : guessTime(i))];
                    case 3:
                        result = _a.sent();
                        results.push(result);
                        updateTime(result.consumed);
                        _a.label = 4;
                    case 4:
                        ++i;
                        return [3 /*break*/, 2];
                    case 5:
                        if (this.act !== last.resultsIn) {
                            this.switchToImpl(last, last.resultsIn);
                        }
                        this.fire('ran_chain', this.act, torun);
                        return [2 /*return*/, results];
                }
            });
        });
    };
    ProvenanceGraph.prototype.undo = function () {
        var _this = this;
        if (!this.lastAction) {
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_11__internal_promise__["a" /* resolveImmediately */])(null);
        }
        //create and store the inverse
        if (this.lastAction.inverses != null) {
            //undo and undoing should still go one up
            return this.jumpTo(this.act.previousState);
        }
        else {
            return this.inOrder(function () { return _this.run(_this.lastAction.getOrCreateInverse(_this), null); });
        }
    };
    ProvenanceGraph.prototype.jumpTo = function (state, withinMilliseconds) {
        var _this = this;
        if (withinMilliseconds === void 0) { withinMilliseconds = -1; }
        return this.inOrder(function () {
            var actions = [];
            var act = _this.act;
            if (act === state) { //jump to myself
                return withinMilliseconds >= 0 ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["c" /* resolveIn */])(withinMilliseconds).then(function () { return []; }) : __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_11__internal_promise__["a" /* resolveImmediately */])([]);
            }
            //lets look at the simple past
            var actPath = act.path, targetPath = state.path;
            var common = findCommon(actPath, targetPath);
            if (common) {
                var toRevert = actPath.slice(common.i + 1).reverse(), toForward = targetPath.slice(common.j + 1);
                actions = actions.concat(toRevert.map(function (r) { return r.resultsFrom[0].getOrCreateInverse(_this); }));
                actions = actions.concat(toForward.map(function (r) { return r.resultsFrom[0]; }));
            }
            //no in the direct branches maybe in different loop instances?
            //TODO
            return _this.runChain(actions, withinMilliseconds);
        });
    };
    /**
     *
     * @param action the action to fork and attach to target
     * @param target the state to attach the given action and all of the rest
     * @param objectReplacements mappings of object replacements
     * @returns {boolean}
     */
    ProvenanceGraph.prototype.fork = function (action, target, objectReplacements) {
        var _this = this;
        if (objectReplacements === void 0) { objectReplacements = []; }
        //sanity check if target is a child of target ... bad
        //collect all states
        var all = [];
        var queue = [action.resultsIn];
        while (queue.length > 0) {
            var next = queue.shift();
            if (all.indexOf(next) >= 0) {
                continue;
            }
            all.push(next);
            queue.push.apply(queue, next.nextStates);
        }
        if (all.indexOf(target) >= 0) {
            return false; //target is a child of state
        }
        var targetObjects = target.consistsOf;
        var sourceObjects = action.previous.consistsOf;
        //function isSame(a: any[], b : any[]) {
        //  return a.length === b.length && a.every((ai, i) => ai === b[i]);
        //}
        //if (isSame(targetObjects, sourceObjects)) {
        //no state change ~ similar state, just create a link
        //we can copy the action and point to the same target
        //  const clone = this.initAction(action.clone(), action.requires);
        //  this.addEdge(target, 'next', clone);
        //  this.addEdge(clone, 'resultsIn', action.resultsIn);
        //} else {
        var removedObjects = sourceObjects.filter(function (o) { return targetObjects.indexOf(o) < 0; });
        var replacements = {};
        objectReplacements.forEach(function (d) { return replacements[_this.findOrAddObject(d.from).id] = d.to; });
        //need to copy all the states and actions
        this.copyBranch(action, target, removedObjects, replacements);
        //}
        this.fire('forked_branch', action, target);
        return true;
    };
    ProvenanceGraph.prototype.copyAction = function (action, appendTo, objectReplacements) {
        var clone = this.initAction(action.clone(), action.requires.map(function (a) { return objectReplacements[String(a.id)] || a; }));
        this.addEdge(appendTo, 'next', clone);
        var s = this.makeState(action.resultsIn.name, action.resultsIn.description);
        this.addEdge(clone, 'resultsIn', s);
        return s;
    };
    ProvenanceGraph.prototype.copyBranch = function (action, target, removedObject, objectReplacements) {
        var queue = [{ a: action, b: target }];
        var _loop_1 = function () {
            var next = queue.shift();
            var b = next.b;
            var a = next.a;
            var someRemovedObjectRequired = a.requires.some(function (ai) { return removedObject.indexOf(ai) >= 0 && !(String(ai.id) in objectReplacements); });
            if (!someRemovedObjectRequired) {
                //copy it and create a new pair to execute
                b = this_1.copyAction(a, next.b, objectReplacements);
            }
            queue.push.apply(queue, a.resultsIn.next.map(function (aa) { return ({ a: aa, b: b }); }));
        };
        var this_1 = this;
        while (queue.length > 0) {
            _loop_1();
        }
    };
    ProvenanceGraph.prototype.makeState = function (name, description) {
        if (description === void 0) { description = ''; }
        var s = new __WEBPACK_IMPORTED_MODULE_7__StateNode__["a" /* default */](name, description);
        this._states.push(s);
        this.backend.addNode(s);
        this.fire('add_state', s);
        return s;
    };
    ProvenanceGraph.prototype.persist = function () {
        var r = this.backend.persist();
        r.act = this.act ? this.act.id : null;
        r.lastAction = this.lastAction ? this.lastAction.id : null;
        return r;
    };
    /*
     restore(persisted: any) {
     const lookup = {},
     lookupFun = (id) => lookup[id];
     const types = {
     action: ActionNode,
     state: StateNode,
     object: ObjectNode
     };
     this.clear();
     persisted.nodes.forEach((p) => {
     var n = types[p.type].restore(p, factory);
     lookup[n.id] = n;
     if (n instanceof ActionNode) {
     this._actions.push(n);
     } else if (n instanceof StateNode) {
     this._states.push(n);
     } else if (n instanceof ObjectNode) {
     this._objects.push(n);
     }
     this.backend.addNode(n);
     });
     if (persisted.act) {
     this.act = lookup[persisted.id];
     }
     if (persisted.lastAction) {
     this.lastAction = lookup[persisted.lastAction];
     }
  
     persisted.edges.forEach((p) => {
     var n = (new graph.GraphEdge()).restore(p, lookupFun);
     this.backend.addEdge(n);
     });
     return this;
     }*/
    ProvenanceGraph.prototype.wrapAsSlide = function (state) {
        var node = new __WEBPACK_IMPORTED_MODULE_9__SlideNode__["a" /* default */]();
        node.name = state.name;
        this.addEdge(node, 'jumpTo', state);
        this._slides.push(node);
        this.backend.addNode(node);
        this.fire('add_slide', node);
        return node;
    };
    ProvenanceGraph.prototype.cloneSingleSlideNode = function (state) {
        var clone = state.state != null ? this.wrapAsSlide(state.state) : this.makeTextSlide();
        state.attrs.forEach(function (attr) {
            if (attr !== 'annotations') {
                clone.setAttr(attr, state.getAttr(attr, null));
            }
        });
        clone.setAttr('annotations', state.annotations.map(function (a) { return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["a" /* mixin */])({}, a); }));
        return clone;
    };
    /**
     * creates a new slide of the given StateNode by jumping to them
     * @param states
     */
    ProvenanceGraph.prototype.extractSlide = function (states, addStartEnd) {
        var _this = this;
        if (addStartEnd === void 0) { addStartEnd = true; }
        var addSlide = function (node) {
            _this._slides.push(node);
            _this.backend.addNode(node);
            _this.fire('add_slide', node);
            return node;
        };
        var slide = addStartEnd ? addSlide(__WEBPACK_IMPORTED_MODULE_9__SlideNode__["a" /* default */].makeText('Unnamed Story')) : null, prev = slide;
        states.forEach(function (s, i) {
            var node = addSlide(new __WEBPACK_IMPORTED_MODULE_9__SlideNode__["a" /* default */]());
            node.name = s.name;
            _this.addEdge(node, 'jumpTo', s);
            if (prev) {
                _this.addEdge(prev, 'next', node);
            }
            else {
                slide = node;
            }
            prev = node;
        });
        if (addStartEnd) {
            var last = __WEBPACK_IMPORTED_MODULE_9__SlideNode__["a" /* default */].makeText('Thanks');
            addSlide(last);
            this.addEdge(prev, 'next', last);
        }
        this.fire('extract_slide', slide);
        this.selectSlide(slide);
        return slide;
    };
    ProvenanceGraph.prototype.startNewSlide = function (title, states) {
        if (states === void 0) { states = []; }
        var s = this.makeTextSlide(title);
        if (states.length > 0) {
            var s2 = this.extractSlide(states, false);
            this.addEdge(s, 'next', s2);
        }
        this.fire('start_slide', s);
        return s;
    };
    ProvenanceGraph.prototype.makeTextSlide = function (title) {
        var s = __WEBPACK_IMPORTED_MODULE_9__SlideNode__["a" /* default */].makeText(title);
        this._slides.push(s);
        this.backend.addNode(s);
        this.fire('add_slide', s);
        return s;
    };
    ProvenanceGraph.prototype.insertIntoSlide = function (toInsert, slide, beforeIt) {
        if (beforeIt === void 0) { beforeIt = false; }
        this.moveSlide(toInsert, slide, beforeIt);
    };
    ProvenanceGraph.prototype.appendToSlide = function (slide, elem) {
        var s = toSlidePath(slide);
        return this.moveSlide(elem, s[s.length - 1], false);
    };
    ProvenanceGraph.prototype.moveSlide = function (node, to, beforeIt) {
        var _this = this;
        if (beforeIt === void 0) { beforeIt = false; }
        if ((beforeIt && node.next === to) || (!beforeIt && node.previous === to)) {
            return; //already matches
        }
        //1. extract the node
        //create other links
        var prev = node.previous;
        if (prev) {
            node.nexts.forEach(function (n) {
                _this.addEdge(prev, 'next', n);
            });
        }
        //remove links
        this.edges.filter(function (e) { return (e.source === node || e.target === node) && e.type === 'next'; }).forEach(function (e) {
            _this.backend.removeEdge(e);
        });
        //insert into the new place
        if (beforeIt) {
            var tprev = to.previous;
            if (tprev) {
                this.edges.filter(function (e) { return (e.target === to) && e.type === 'next'; }).forEach(function (e) {
                    _this.backend.removeEdge(e);
                });
                this.addEdge(tprev, 'next', node);
                this.addEdge(node, 'next', to);
            }
            this.addEdge(node, 'next', to);
        }
        else {
            var tnexts = to.nexts;
            if (tnexts.length > 0) {
                this.edges.filter(function (e) { return (e.source === to) && e.type === 'next'; }).forEach(function (e) {
                    _this.backend.removeEdge(e);
                });
                tnexts.forEach(function (next) {
                    _this.addEdge(node, 'next', next);
                });
            }
            this.addEdge(to, 'next', node);
        }
        this.fire('move_slide', node, to, beforeIt);
    };
    ProvenanceGraph.prototype.removeSlideNode = function (node) {
        var _this = this;
        var prev = node.previous;
        if (prev) {
            node.nexts.forEach(function (n) {
                _this.addEdge(prev, 'next', n);
            });
        }
        this.edges.filter(function (e) { return e.source === node || e.target === node; }).forEach(function (e) {
            _this.backend.removeEdge(e);
        });
        this._slides.splice(this._slides.indexOf(node), 1);
        this.backend.removeNode(node);
        this.fire('remove_slide', node);
    };
    ProvenanceGraph.prototype.removeFullSlide = function (node) {
        //go to the beginning
        while (node.previous) {
            node = node.previous;
        }
        var bak = node;
        while (node) {
            var next = node.next;
            this.removeSlideNode(node);
            node = next;
        }
        this.fire('destroy_slide', bak);
    };
    ProvenanceGraph.prototype.setSlideJumpToTarget = function (node, state) {
        var old = node.outgoing.filter(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_10__graph_graph__["b" /* isType */])('jumpTo'))[0];
        if (old) {
            this.backend.removeEdge(old);
        }
        if (state) {
            this.addEdge(node, 'jumpTo', state);
        }
        this.fire('set_jump_target', node, old ? old.target : null, state);
    };
    ProvenanceGraph.PROPAGATED_EVENTS = ['sync', 'add_edge', 'add_node', 'sync_node', 'sync_edge', 'sync_start'];
    return ProvenanceGraph;
}(__WEBPACK_IMPORTED_MODULE_4__datatype__["a" /* ADataType */]));
/* harmony default export */ __webpack_exports__["a"] = ProvenanceGraph;


/***/ }),

/***/ 654:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__index__ = __webpack_require__(655);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__iterator__ = __webpack_require__(637);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__SingleRangeElem__ = __webpack_require__(674);
/**
 * Created by Samuel Gratzl on 27.12.2016.
 */



var RangeElem = /** @class */ (function () {
    function RangeElem(from, to, step) {
        if (to === void 0) { to = -1; }
        if (step === void 0) { step = 1; }
        this.from = from;
        this.to = to;
        this.step = step;
        if (step === 0) {
            throw new Error('invalid step size: ' + step);
        }
    }
    Object.defineProperty(RangeElem.prototype, "isAll", {
        get: function () {
            return this.from === 0 && this.to === -1 && this.step === 1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RangeElem.prototype, "isSingle", {
        get: function () {
            return (this.from + this.step) === this.to;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RangeElem.prototype, "isUnbound", {
        get: function () {
            return this.from < 0 || this.to < 0;
        },
        enumerable: true,
        configurable: true
    });
    RangeElem.all = function () {
        return new RangeElem(0, -1, 1);
    };
    RangeElem.none = function () {
        return new RangeElem(0, 0, 1);
    };
    RangeElem.single = function (val) {
        return new __WEBPACK_IMPORTED_MODULE_2__SingleRangeElem__["a" /* default */](val);
    };
    RangeElem.range = function (from, to, step) {
        if (to === void 0) { to = -1; }
        if (step === void 0) { step = 1; }
        if ((from + step) === to) {
            return RangeElem.single(from);
        }
        return new RangeElem(from, to, step);
    };
    RangeElem.prototype.size = function (size) {
        var t = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__index__["a" /* fix */])(this.to, size), f = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__index__["a" /* fix */])(this.from, size);
        if (this.step === 1) {
            return Math.max(t - f, 0);
        }
        else if (this.step === -1) {
            if (this.to === -1) {
                return Math.max(f - -1, 0);
            }
            return Math.max(f - t, 0);
        }
        var d = this.step > 0 ? (t - f + 1) : (f - t + 1);
        var s = Math.abs(this.step);
        if (d <= 0) { //no range
            return 0;
        }
        return Math.floor(d / s);
    };
    RangeElem.prototype.clone = function () {
        return new RangeElem(this.from, this.to, this.step);
    };
    RangeElem.prototype.reverse = function () {
        if (this.step > 0) {
            var t = this.from - 1;
            var f = this.to - 1;
            return new RangeElem(f, t, -this.step);
        }
        else { //step <0
            var t = this.from - 1;
            var f = this.to - 1;
            return new RangeElem(f, t, -this.step);
        }
    };
    RangeElem.prototype.invert = function (index, size) {
        if (this.isAll) {
            return index;
        }
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__index__["a" /* fix */])(this.from, size) + index * this.step;
    };
    /**
     * creates an iterator of this range
     * @param size the underlying size for negative indices
     */
    RangeElem.prototype.iter = function (size) {
        if (this.step < 0 && this.to === -1) {
            // keep negative to have 0 included
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__iterator__["a" /* range */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__index__["a" /* fix */])(this.from, size), -1, this.step);
        }
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__iterator__["a" /* range */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__index__["a" /* fix */])(this.from, size), __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__index__["a" /* fix */])(this.to, size), this.step);
    };
    Object.defineProperty(RangeElem.prototype, "__iterator__", {
        get: function () {
            return this.iter();
        },
        enumerable: true,
        configurable: true
    });
    RangeElem.prototype.contains = function (value, size) {
        if (this.isAll) {
            return true;
        }
        var f = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__index__["a" /* fix */])(this.from, size);
        var t = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__index__["a" /* fix */])(this.to, size);
        if (this.step === -1) {
            if (this.to === -1) {
                return (value <= f && value >= 0);
            }
            return (value <= f) && (value > t);
        }
        else if (this.step === +1) { //+1
            return (value >= f) && (value < t);
        }
        else {
            return this.iter(size).asList().indexOf(value) >= 0;
        }
    };
    RangeElem.prototype.toString = function () {
        if (this.isAll) {
            return '';
        }
        if (this.isSingle) {
            return this.from.toString();
        }
        var r = this.from + ':' + this.to;
        if (this.step !== 1) {
            r += ':' + this.step;
        }
        return r;
    };
    RangeElem.parse = function (code) {
        if (code.length === 0) {
            return RangeElem.all();
        }
        var parseElem = function (v, defaultValue) {
            if (defaultValue === void 0) { defaultValue = NaN; }
            v = v.trim();
            if (v === '' && !isNaN(defaultValue)) {
                return defaultValue;
            }
            var n = parseInt(v, 10);
            if (isNaN(n)) {
                throw Error("parse error: \"" + v + "\" is not a valid integer");
            }
            return n;
        };
        var parts = code.split(':');
        switch (parts.length) {
            case 1:
                return RangeElem.single(parseElem(parts[0]));
            case 2:
                return new RangeElem(parseElem(parts[0], 0), parseElem(parts[1], -1));
            case 3:
                return new RangeElem(parseElem(parts[0], 0), parseElem(parts[1], -1), parseElem(parts[2], 1));
            default:
                throw new Error("parse error: \"" + code + "\" is not a valid range specifier");
        }
    };
    return RangeElem;
}());
/* harmony default export */ __webpack_exports__["a"] = RangeElem;


/***/ }),

/***/ 655:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = fix;
/**
 * Created by Samuel Gratzl on 27.12.2016.
 */
function fix(v, size) {
    return v < 0 ? (size + 1 + v) : v;
}


/***/ }),

/***/ 662:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index__ = __webpack_require__(224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ajax__ = __webpack_require__(629);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__plugin__ = __webpack_require__(70);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__datatype__ = __webpack_require__(621);
/* unused harmony reexport random_id */
/* unused harmony reexport fixId */
/* unused harmony export clearCache */
/* harmony export (immutable) */ __webpack_exports__["b"] = list;
/* unused harmony export convertToTree */
/* unused harmony export tree */
/* unused harmony export getFirst */
/* unused harmony export getFirstByName */
/* harmony export (immutable) */ __webpack_exports__["f"] = getFirstByFQName;
/* harmony export (immutable) */ __webpack_exports__["a"] = get;
/* unused harmony export create */
/* harmony export (immutable) */ __webpack_exports__["d"] = upload;
/* unused harmony export update */
/* harmony export (immutable) */ __webpack_exports__["e"] = modify;
/* harmony export (immutable) */ __webpack_exports__["c"] = remove;

/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 *
 * This module provides access functions for dataset stored on a server, including functions to list all datasets,
 * to retrieve datasets by names, id types, ids, etc.
 *
 * See IDataDescriptionMetaData in datatype.ts for various legal parameters
 */





//export {convertTableToVectors, convertToTable, listAsTable} from './internal/data_utils';
//find all datatype plugins
var available = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__plugin__["b" /* list */])('datatype');
var cacheById = new Map();
var cacheByName = new Map();
var cacheByFQName = new Map();
function clearCache(dataset) {
    if (dataset) {
        var desc = dataset.desc || dataset;
        cacheById.delete(desc.id);
        cacheByName.delete(desc.name);
        cacheByFQName.delete(desc.fqname);
    }
    else {
        cacheById.clear();
        cacheByName.clear();
        cacheByFQName.clear();
    }
}
function getCachedEntries() {
    return Promise.all(Array.from(cacheById.values()));
}
function cached(desc, result) {
    cacheById.set(desc.id, result);
    cacheByFQName.set(desc.fqname, result);
    cacheByName.set(desc.name, result);
    return result;
}
/**
 * create an object out of a description
 * @param desc
 * @returns {*}
 */
function transformEntry(desc) {
    return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
        var plugin;
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
            if (desc === undefined) {
                return [2 /*return*/, null];
            }
            desc.id = desc.id || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["l" /* fixId */])(desc.name + __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["m" /* randomId */])(5));
            desc.fqname = desc.fqname || desc.name;
            desc.description = desc.description || '';
            desc.creator = desc.creator || 'Anonymous';
            desc.ts = desc.ts || 0;
            if (cacheById.has(desc.id)) {
                return [2 /*return*/, cacheById.get(desc.id)];
            }
            plugin = available.filter(function (p) { return p.id === desc.type; });
            //no type there create a dummy one
            if (plugin.length === 0) {
                return [2 /*return*/, cached(desc, Promise.resolve(new __WEBPACK_IMPORTED_MODULE_4__datatype__["c" /* DummyDataType */](desc)))];
            }
            //take the first matching one
            return [2 /*return*/, cached(desc, plugin[0].load().then(function (d) { return d.factory(desc); }))];
        });
    });
}
/**
 * returns a promise for getting a map of all available data
 * @param filter optional filter either a function or a server side interpretable filter object
 * @returns {Promise<IDataType[]>}
 */
function list(filter) {
    return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
        var f, q, r;
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
            f = (typeof filter === 'function') ? filter : null;
            q = (typeof filter !== 'undefined' && typeof filter !== 'function') ? filter : {};
            if (__WEBPACK_IMPORTED_MODULE_1__index__["i" /* offline */]) {
                r = getCachedEntries();
            }
            else {
                //load descriptions and create data out of them
                r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__ajax__["a" /* getAPIJSON */])('/dataset/', q).then(function (r) { return Promise.all(r.map(transformEntry)); });
            }
            if (f !== null) {
                r = r.then(function (d) { return d.filter(f); });
            }
            return [2 /*return*/, r];
        });
    });
}
/**
 * converts a given list of datasets to a tree
 * @param list
 * @returns {{children: Array, name: string, data: null}}
 */
function convertToTree(list) {
    //create a tree out of the list by the fqname
    var root = { children: [], name: '/', data: null };
    list.forEach(function (entry) {
        var path = entry.desc.fqname.split('/');
        var act = root;
        path.forEach(function (node) {
            var next = act.children.find(function (d) { return d.name === node; });
            if (!next) {
                next = { children: [], name: node, data: null };
                act.children.push(next);
            }
            act = next;
        });
        act.data = entry;
    });
    return root;
}
/**
 * returns a tree of all available datasets
 */
function tree(filter) {
    return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
        var _a;
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = convertToTree;
                    return [4 /*yield*/, list(filter)];
                case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
            }
        });
    });
}
/**
 * Returns the first dataset matching the given query
 * @param query
 * @returns {any}
 */
function getFirst(query) {
    return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
        var q, result;
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (typeof query === 'string' || query instanceof RegExp) {
                        return [2 /*return*/, getFirstByName(query)];
                    }
                    q = query;
                    q.limit = 1;
                    return [4 /*yield*/, list(q)];
                case 1:
                    result = _a.sent();
                    if (result.length === 0) {
                        return [2 /*return*/, Promise.reject({ error: 'nothing found, matching', args: q })];
                    }
                    return [2 /*return*/, Promise.resolve(result[0])];
            }
        });
    });
}
/*function escapeRegExp(string){
 return string.replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');
 }*/
function getFirstByName(name) {
    return getFirstWithCache(name, cacheByName, 'name');
}
function getFirstByFQName(name) {
    return getFirstWithCache(name, cacheByFQName, 'fqname');
}
function getFirstWithCache(name, cache, attr) {
    var _a;
    var r = typeof name === 'string' ? new RegExp(name) : name;
    for (var _i = 0, _b = Array.from(cache.entries()); _i < _b.length; _i++) {
        var _c = _b[_i], k = _c[0], v = _c[1];
        if (r.test(k)) {
            return v;
        }
    }
    return getFirst((_a = {},
        _a[attr] = typeof name === 'string' ? name : name.source,
        _a));
}
/**
 * Returns a promise for getting dataset based on a specific ID.
 * @param id the ID, as defined in IDataDescriptionData#id
 * @returns {Promise<any>}
 */
function getById(id) {
    return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
        var _a;
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (cacheById.has(id)) {
                        return [2 /*return*/, cacheById.get(id)];
                    }
                    _a = transformEntry;
                    return [4 /*yield*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__ajax__["a" /* getAPIJSON */])("/dataset/" + id + "/desc")];
                case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
            }
        });
    });
}
/**
 * Returns a promise for getting a specific dataset
 * @param a persisted id or persisted object containing the id
 * @returns {Promise<IDataType>}
 */
function get(persisted) {
    return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
        var parent_1;
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (typeof persisted === 'string') {
                        return [2 /*return*/, getById(persisted)];
                    }
                    if (!persisted.root) return [3 /*break*/, 2];
                    return [4 /*yield*/, get(persisted.root)];
                case 1:
                    parent_1 = _a.sent();
                    return [2 /*return*/, parent_1 ? parent_1.restore(persisted) : null];
                case 2: 
                //can't restore non root and non data id
                return [2 /*return*/, Promise.reject('cannot restore non root and non data id')];
            }
        });
    });
}
/**
 * creates a new dataset for the given description
 * @param desc
 * @returns {Promise<IDataType>}
 */
function create(desc) {
    return transformEntry(desc);
}
function prepareData(desc, file) {
    var data = new FormData();
    data.append('desc', JSON.stringify(desc));
    if (file) {
        data.append('file', file);
    }
    return data;
}
/**
 * uploads a given dataset description with optional file attachment ot the server
 * @param data
 * @param file
 * @returns {Promise<*>}
 */
function upload(data, file) {
    return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
        var _a;
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_b) {
            switch (_b.label) {
                case 0:
                    data = prepareData(data, file);
                    _a = transformEntry;
                    return [4 /*yield*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__ajax__["b" /* sendAPI */])('/dataset/', data, 'POST')];
                case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
            }
        });
    });
}
/**
 * updates an existing dataset with a new description and optional file
 * @returns {Promise<*>} returns the update dataset
 */
function update(entry, data, file) {
    return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
        var desc;
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = prepareData(data, file);
                    return [4 /*yield*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__ajax__["b" /* sendAPI */])("/dataset/" + entry.desc.id, data, 'PUT')];
                case 1:
                    desc = _a.sent();
                    // clear existing cache
                    clearCache(entry);
                    //update with current one
                    return [2 /*return*/, transformEntry(desc)];
            }
        });
    });
}
/**
 * modifies an existing dataset with a new description and optional file, the difference to update is that this should be used for partial changes
 * @returns {Promise<*>} returns the update dataset
 */
function modify(entry, data, file) {
    return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
        var desc;
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = prepareData(data, file);
                    return [4 /*yield*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__ajax__["b" /* sendAPI */])("/dataset/" + entry.desc.id, data, 'POST')];
                case 1:
                    desc = _a.sent();
                    clearCache(entry);
                    return [2 /*return*/, transformEntry(desc)];
            }
        });
    });
}
/**
 * removes a given dataset
 * @param entry
 * @returns {Promise<boolean>}
 */
function remove(entry) {
    return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
        var desc;
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
            switch (_a.label) {
                case 0:
                    desc = entry.desc || entry;
                    return [4 /*yield*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__ajax__["b" /* sendAPI */])("/dataset/" + desc.id, {}, 'DELETE')];
                case 1:
                    _a.sent();
                    clearCache(desc);
                    return [2 /*return*/, true];
            }
        });
    });
}


/***/ }),

/***/ 663:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__IIDType__ = __webpack_require__(625);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ASelectAble__ = __webpack_require__(651);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ProductIDType__ = __webpack_require__(636);
/* unused harmony export AProductSelectAble */
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */





var AProductSelectAble = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](AProductSelectAble, _super);
    function AProductSelectAble() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.numProductSelectListeners = 0;
        _this.productSelectionListener = function (event, index, type) {
            var cells = _this.producttype.productSelections(type);
            if (cells.length === 0) {
                _this.fire(__WEBPACK_IMPORTED_MODULE_4__ProductIDType__["a" /* default */].EVENT_SELECT_PRODUCT, type, []);
                _this.fire(__WEBPACK_IMPORTED_MODULE_4__ProductIDType__["a" /* default */].EVENT_SELECT_PRODUCT + "-" + type, []);
                return;
            }
            _this.ids().then(function (ids) {
                var act = cells.map(function (c) { return ids.indexOf(c); }).filter(function (c) { return !c.isNone; });
                if (act.length === 0) {
                    return;
                }
                //ensure the right number of dimensions
                act.forEach(function (a) { return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__IIDType__["d" /* fillWithNone */])(a, ids.ndim); });
                _this.fire(__WEBPACK_IMPORTED_MODULE_4__ProductIDType__["a" /* default */].EVENT_SELECT_PRODUCT, type, act);
                _this.fire(__WEBPACK_IMPORTED_MODULE_4__ProductIDType__["a" /* default */].EVENT_SELECT_PRODUCT + "-" + type, act);
            });
        };
        return _this;
    }
    AProductSelectAble.prototype.on = function (events, handler) {
        if (typeof events === 'string' && (events === 'select' || events === 'selectProduct' || events.slice(0, 'select-'.length) === 'select-')) {
            this.numProductSelectListeners++;
            if (this.numProductSelectListeners === 1) {
                this.producttype.on('selectProduct', this.productSelectionListener);
            }
        }
        return _super.prototype.on.call(this, events, handler);
    };
    AProductSelectAble.prototype.off = function (events, handler) {
        if (typeof events === 'string' && (events === 'select' || events === 'selectProduct' || events.slice(0, 'select-'.length) === 'select-')) {
            this.numProductSelectListeners--;
            if (this.numProductSelectListeners === 0) {
                this.producttype.off('selectProduct', this.productSelectionListener);
            }
        }
        return _super.prototype.off.call(this, events, handler);
    };
    AProductSelectAble.prototype.productSelections = function (type) {
        var _this = this;
        if (type === void 0) { type = __WEBPACK_IMPORTED_MODULE_2__IIDType__["a" /* defaultSelectionType */]; }
        return this.ids().then(function (ids) {
            var cells = _this.producttype.productSelections(type);
            var act = cells.map(function (c) { return ids.indexRangeOf(c); }).filter(function (c) { return !c.isNone; });
            //ensure the right number of dimensions
            act.forEach(function (a) { return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__IIDType__["d" /* fillWithNone */])(a, ids.ndim); });
            return act;
        });
    };
    AProductSelectAble.prototype.selectProduct = function () {
        var a = Array.from(arguments);
        var type = (typeof a[0] === 'string') ? a.shift() : __WEBPACK_IMPORTED_MODULE_2__IIDType__["a" /* defaultSelectionType */], range = a[0].map(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */]), op = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__IIDType__["c" /* asSelectOperation */])(a[1]);
        return this.selectProductImpl(range, op, type);
    };
    AProductSelectAble.prototype.selectProductImpl = function (cells, op, type) {
        var _this = this;
        if (op === void 0) { op = __WEBPACK_IMPORTED_MODULE_2__IIDType__["b" /* SelectOperation */].SET; }
        if (type === void 0) { type = __WEBPACK_IMPORTED_MODULE_2__IIDType__["a" /* defaultSelectionType */]; }
        return this.ids().then(function (ids) {
            cells = cells.map(function (c) { return ids.preMultiply(c); });
            return _this.producttype.select(type, cells, op);
        });
    };
    AProductSelectAble.prototype.clear = function () {
        var a = Array.from(arguments);
        if (typeof a[0] === 'number') {
            a.shift();
        }
        var type = (typeof a[0] === 'string') ? a[0] : __WEBPACK_IMPORTED_MODULE_2__IIDType__["a" /* defaultSelectionType */];
        return this.selectProductImpl([], __WEBPACK_IMPORTED_MODULE_2__IIDType__["b" /* SelectOperation */].SET, type || __WEBPACK_IMPORTED_MODULE_2__IIDType__["a" /* defaultSelectionType */]);
    };
    return AProductSelectAble;
}(__WEBPACK_IMPORTED_MODULE_3__ASelectAble__["a" /* default */]));

/* harmony default export */ __webpack_exports__["a"] = AProductSelectAble;


/***/ }),

/***/ 669:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__GraphBase__ = __webpack_require__(650);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__graph__ = __webpack_require__(632);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__internal_promise__ = __webpack_require__(228);




var LocalStorageGraph = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](LocalStorageGraph, _super);
    function LocalStorageGraph(desc, nodes, edges, storage) {
        if (nodes === void 0) { nodes = []; }
        if (edges === void 0) { edges = []; }
        if (storage === void 0) { storage = sessionStorage; }
        var _this = _super.call(this, desc, nodes, edges) || this;
        _this.storage = storage;
        _this.updateHandler = function (event) {
            var s = event.target;
            if (s instanceof __WEBPACK_IMPORTED_MODULE_2__graph__["c" /* GraphNode */]) {
                _this.updateNode(s);
            }
            if (s instanceof __WEBPACK_IMPORTED_MODULE_2__graph__["a" /* GraphEdge */]) {
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
        if (edgeOrSource instanceof __WEBPACK_IMPORTED_MODULE_2__graph__["a" /* GraphEdge */]) {
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
}(__WEBPACK_IMPORTED_MODULE_1__GraphBase__["a" /* default */]));
/* harmony default export */ __webpack_exports__["a"] = LocalStorageGraph;


/***/ }),

/***/ 670:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__GraphBase__ = __webpack_require__(650);


var MemoryGraph = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](MemoryGraph, _super);
    function MemoryGraph(desc, nodes, edges, factory) {
        if (nodes === void 0) { nodes = []; }
        if (edges === void 0) { edges = []; }
        if (factory === void 0) { factory = __WEBPACK_IMPORTED_MODULE_1__GraphBase__["b" /* defaultGraphFactory */]; }
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
}(__WEBPACK_IMPORTED_MODULE_1__GraphBase__["a" /* default */]));
/* harmony default export */ __webpack_exports__["a"] = MemoryGraph;


/***/ }),

/***/ 671:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__index__ = __webpack_require__(224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(619);
/* harmony export (immutable) */ __webpack_exports__["a"] = createLocalAssigner;
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */


var LocalIDAssigner = /** @class */ (function () {
    function LocalIDAssigner() {
        this.pool = new __WEBPACK_IMPORTED_MODULE_0__index__["f" /* IdPool */]();
        this.lookup = new Map();
    }
    LocalIDAssigner.prototype.unmapOne = function (id) {
        return this.unmap([id])[0];
    };
    LocalIDAssigner.prototype.unmap = function (ids) {
        var _this = this;
        var keys = Object.keys(this.lookup);
        return ids.map(function (id) {
            for (var k in keys) {
                if (_this.lookup.get(k) === id) {
                    return k;
                }
            }
            return null;
        });
    };
    LocalIDAssigner.prototype.mapOne = function (id) {
        if (this.lookup.has(id)) {
            return this.lookup.get(id);
        }
        this.lookup.set(id, this.pool.checkOut());
        return this.lookup.get(id);
    };
    LocalIDAssigner.prototype.map = function (ids) {
        var _this = this;
        var numbers = ids.map(function (d) { return _this.mapOne(d); });
        return __WEBPACK_IMPORTED_MODULE_1__range__["c" /* list */].apply(void 0, numbers);
    };
    return LocalIDAssigner;
}());
/* unused harmony default export */ var _unused_webpack_default_export = LocalIDAssigner;
function createLocalAssigner() {
    var r = new LocalIDAssigner();
    return r.map.bind(r);
}


/***/ }),

/***/ 672:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index__ = __webpack_require__(224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__IIDType__ = __webpack_require__(625);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__IDType__ = __webpack_require__(630);
/* unused harmony export toId */
/* unused harmony export isId */
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */




function toId(elem) {
    return elem.id;
}
function isId(id) {
    return function (elem) { return elem && elem.id === id; };
}
/**
 * IDType with an actual collection of entities.
 * Supports selections.
 */
var ObjectManager = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](ObjectManager, _super);
    function ObjectManager(id, name) {
        var _this = _super.call(this, id, name, name + 's', true) || this;
        _this.instances = [];
        _this.pool = new __WEBPACK_IMPORTED_MODULE_1__index__["f" /* IdPool */]();
        return _this;
    }
    ObjectManager.prototype.nextId = function (item) {
        var n = this.pool.checkOut();
        if (item) {
            item.id = n;
            this.instances[n] = item;
            this.fire('add', n, item);
        }
        return n;
    };
    ObjectManager.prototype.push = function () {
        var _this = this;
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        items.forEach(function (item) {
            _this.instances[item.id] = item;
            _this.fire('add', item.id, item);
        });
    };
    ObjectManager.prototype.byId = function (id) {
        return this.instances[id];
    };
    ObjectManager.prototype.forEach = function (callbackfn, thisArg) {
        var _this = this;
        this.instances.forEach(function (item, i) { return _this.pool.isCheckedOut(i) ? callbackfn.call(thisArg, item) : null; });
    };
    Object.defineProperty(ObjectManager.prototype, "entries", {
        get: function () {
            var _this = this;
            return this.instances.filter(function (item, i) { return _this.pool.isCheckedOut(i); });
        },
        enumerable: true,
        configurable: true
    });
    ObjectManager.prototype.remove = function (item) {
        var _this = this;
        var old = null;
        if (typeof item.id === 'number') {
            item = item.id;
        }
        if (typeof item === 'number') {
            old = this.instances[item];
            delete this.instances[item];
            this.fire('remove', item, old);
        }
        //clear from selections
        this.selectionTypes().forEach(function (type) {
            _this.select(type, [item], __WEBPACK_IMPORTED_MODULE_2__IIDType__["b" /* SelectOperation */].REMOVE);
        });
        this.pool.checkIn(item);
        return old;
    };
    ObjectManager.prototype.selectedObjects = function (type) {
        if (type === void 0) { type = __WEBPACK_IMPORTED_MODULE_2__IIDType__["a" /* defaultSelectionType */]; }
        var s = this.selections(type);
        return s.filter(this.instances);
    };
    return ObjectManager;
}(__WEBPACK_IMPORTED_MODULE_3__IDType__["a" /* default */]));
/* unused harmony default export */ var _unused_webpack_default_export = ObjectManager;


/***/ }),

/***/ 673:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__data__ = __webpack_require__(662);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__datatype__ = __webpack_require__(621);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__graph_graph__ = __webpack_require__(632);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__internal_promise__ = __webpack_require__(228);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return cat; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return op; });
/* unused harmony export ref */

/**
 * Created by sam on 12.02.2015.
 */




/**
 * list of categories for actions and objects
 */
var cat = {
    data: 'data',
    selection: 'selection',
    visual: 'visual',
    layout: 'layout',
    logic: 'logic',
    custom: 'custom',
    annotation: 'annotation'
};
/**
 * list of operations
 */
var op = {
    create: 'create',
    update: 'update',
    remove: 'remove'
};
/**
 * creates an object reference to the given object
 * @param v
 * @param name
 * @param category
 * @param hash
 * @returns {{v: T, name: string, category: string}}
 */
function ref(v, name, category, hash) {
    if (category === void 0) { category = cat.data; }
    if (hash === void 0) { hash = name + '_' + category; }
    return {
        v: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__internal_promise__["a" /* resolveImmediately */])(v),
        value: v,
        name: name,
        category: category,
        hash: hash
    };
}
/**
 * tries to persist an object value supporting datatypes and DOM elements having an id
 * @param v
 * @returns {any}
 */
function persistData(v) {
    if (v === undefined || v === null) {
        return null;
    }
    if (v instanceof Element) {
        var e = v, id = e.getAttribute('id');
        return { type: 'element', id: id };
    }
    if (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__datatype__["b" /* isDataType */])(v)) {
        var e = v;
        return { type: 'dataset', id: e.desc.id, persist: e.persist() };
    }
    if (typeof v === 'string' || typeof v === 'number') {
        return { type: 'primitive', v: v };
    }
    return null;
}
function restoreData(v) {
    if (!v) {
        return null;
    }
    switch (v.type) {
        case 'element':
            if (v.id) {
                return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__internal_promise__["a" /* resolveImmediately */])(document.getElementById(v.id));
            }
            return null;
        case 'dataset':
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__data__["a" /* get */])(v.persist);
        case 'primitive':
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__internal_promise__["a" /* resolveImmediately */])(v.v);
    }
    return null;
}
/**
 * a graph node of type object
 */
var ObjectNode = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](ObjectNode, _super);
    function ObjectNode(_v, name, category, hash, description) {
        if (category === void 0) { category = cat.data; }
        if (hash === void 0) { hash = name + '_' + category; }
        if (description === void 0) { description = ''; }
        var _this = _super.call(this, 'object') || this;
        _this._v = _v;
        _this._persisted = null;
        if (_v != null) { //if the value is given, auto generate a promise for it
            _this._promise = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__internal_promise__["a" /* resolveImmediately */])(_v);
        }
        _super.prototype.setAttr.call(_this, 'name', name);
        _super.prototype.setAttr.call(_this, 'category', category);
        _super.prototype.setAttr.call(_this, 'hash', hash);
        _super.prototype.setAttr.call(_this, 'description', description);
        return _this;
    }
    Object.defineProperty(ObjectNode.prototype, "value", {
        get: function () {
            this.checkPersisted();
            return this._v;
        },
        set: function (v) {
            this._v = v;
            this._promise = v == null ? null : __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__internal_promise__["a" /* resolveImmediately */])(v);
            this._persisted = null;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * checks whether the persisted value was already restored
     */
    ObjectNode.prototype.checkPersisted = function () {
        var _this = this;
        if (this._persisted != null) {
            this._promise = restoreData(this._persisted);
            if (this._promise) {
                this._promise.then(function (v) {
                    _this._v = v;
                });
            }
            this._persisted = null;
        }
    };
    Object.defineProperty(ObjectNode.prototype, "v", {
        get: function () {
            this.checkPersisted();
            return this._promise;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ObjectNode.prototype, "name", {
        get: function () {
            return _super.prototype.getAttr.call(this, 'name', '');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ObjectNode.prototype, "category", {
        get: function () {
            return _super.prototype.getAttr.call(this, 'category', '');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ObjectNode.prototype, "hash", {
        get: function () {
            return _super.prototype.getAttr.call(this, 'hash', '');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ObjectNode.prototype, "description", {
        get: function () {
            return _super.prototype.getAttr.call(this, 'description', '');
        },
        enumerable: true,
        configurable: true
    });
    ObjectNode.prototype.persist = function () {
        var r = _super.prototype.persist.call(this);
        if (!r.attrs) {
            r.attrs = {};
        }
        r.attrs.v = this._persisted ? this._persisted : persistData(this.value);
        return r;
    };
    ObjectNode.prototype.restore = function (p) {
        this._persisted = p.attrs.v;
        delete p.attrs.v;
        _super.prototype.restore.call(this, p);
        return this;
    };
    ObjectNode.restore = function (p) {
        var r = new ObjectNode(null, p.attrs.name, p.attrs.category, p.attrs.hash || p.attrs.name + '_' + p.attrs.category);
        return r.restore(p);
    };
    Object.defineProperty(ObjectNode.prototype, "createdBy", {
        get: function () {
            var r = this.incoming.filter(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__graph_graph__["b" /* isType */])('creates'))[0];
            return r ? r.source : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ObjectNode.prototype, "removedBy", {
        get: function () {
            var r = this.incoming.filter(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__graph_graph__["b" /* isType */])('removes'))[0];
            return r ? r.source : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ObjectNode.prototype, "requiredBy", {
        get: function () {
            return this.incoming.filter(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__graph_graph__["b" /* isType */])('requires')).map(function (e) { return e.source; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ObjectNode.prototype, "partOf", {
        get: function () {
            return this.incoming.filter(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__graph_graph__["b" /* isType */])('consistsOf')).map(function (e) { return e.source; });
        },
        enumerable: true,
        configurable: true
    });
    ObjectNode.prototype.toString = function () {
        return this.name;
    };
    return ObjectNode;
}(__WEBPACK_IMPORTED_MODULE_3__graph_graph__["c" /* GraphNode */]));
/* harmony default export */ __webpack_exports__["b"] = ObjectNode;


/***/ }),

/***/ 674:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__index__ = __webpack_require__(655);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__iterator__ = __webpack_require__(637);
/**
 * Created by Samuel Gratzl on 27.12.2016.
 */


var SingleRangeElem = /** @class */ (function () {
    function SingleRangeElem(from) {
        this.from = from;
    }
    Object.defineProperty(SingleRangeElem.prototype, "step", {
        get: function () {
            return 1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SingleRangeElem.prototype, "to", {
        get: function () {
            return this.from + 1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SingleRangeElem.prototype, "isAll", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SingleRangeElem.prototype, "isSingle", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SingleRangeElem.prototype, "isUnbound", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    SingleRangeElem.prototype.size = function (size) {
        return 1;
    };
    SingleRangeElem.prototype.clone = function () {
        return new SingleRangeElem(this.from);
    };
    SingleRangeElem.prototype.contains = function (value, size) {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__index__["a" /* fix */])(this.from, size) === value;
    };
    SingleRangeElem.prototype.reverse = function () {
        return this.clone();
    };
    SingleRangeElem.prototype.invert = function (index, size) {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__index__["a" /* fix */])(this.from, size) + index;
    };
    SingleRangeElem.prototype.iter = function (size) {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__iterator__["b" /* single */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__index__["a" /* fix */])(this.from, size));
    };
    Object.defineProperty(SingleRangeElem.prototype, "__iterator__", {
        get: function () {
            return this.iter();
        },
        enumerable: true,
        configurable: true
    });
    SingleRangeElem.prototype.toString = function () {
        return this.from.toString();
    };
    return SingleRangeElem;
}());
/* harmony default export */ __webpack_exports__["a"] = SingleRangeElem;


/***/ }),

/***/ 675:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Range__ = __webpack_require__(639);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Range1D__ = __webpack_require__(627);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Range1DGroup__ = __webpack_require__(640);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__internal_RangeElem__ = __webpack_require__(654);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__CompositeRange1D__ = __webpack_require__(638);
/* harmony export (immutable) */ __webpack_exports__["a"] = parseRange;
/**
 * Created by Samuel Gratzl on 27.12.2016.
 */





/**
 * parse the give code created toString
 * @param code
 * @returns {Range}
 */
function parseRange(code) {
    var dims = [];
    var act = 0, c, t;
    code = code.trim();
    while (act < code.length) {
        c = code.charAt(act);
        switch (c) {
            case '"':
                t = parseNamedRange1D(code, act);
                act = t.act + 1; //skip ,
                dims.push(t.dim);
                break;
            case ',':
                act++;
                dims.push(__WEBPACK_IMPORTED_MODULE_1__Range1D__["a" /* default */].all());
                break;
            default:
                if (c.match(/\s/)) {
                    act++;
                }
                else {
                    t = parseRange1D(code, act);
                    act = t.act + 1; //skip ,
                    dims.push(t.dim);
                }
                break;
        }
    }
    if (code.charAt(code.length - 1) === ',') { //last is an empty one
        dims.push(__WEBPACK_IMPORTED_MODULE_1__Range1D__["a" /* default */].all());
    }
    return new __WEBPACK_IMPORTED_MODULE_0__Range__["c" /* default */](dims);
}
function parseNamedRange1D(code, act) {
    act += 1; //skip "
    var end = code.indexOf('"', act);
    var name = code.slice(act, end);
    var r;
    act = end + 1;
    switch (code.charAt(act)) {
        case '"':
            end = code.indexOf('"', act + 1);
            r = parseRange1D(code, end + 1);
            return {
                dim: new __WEBPACK_IMPORTED_MODULE_2__Range1DGroup__["a" /* default */](name, code.slice(act + 1, end), r.dim),
                act: r.act
            };
        case '{':
            var groups = [];
            while (code.charAt(act) !== '}') {
                r = parseNamedRange1D(code, act + 1);
                groups.push(r.dim);
                act = r.act;
            }
            return {
                dim: new __WEBPACK_IMPORTED_MODULE_4__CompositeRange1D__["a" /* default */](name, groups),
                act: r.act + 1
            };
        default: //ERROR
            return {
                dim: __WEBPACK_IMPORTED_MODULE_1__Range1D__["a" /* default */].all(),
                act: act
            };
    }
}
function parseRange1D(code, act) {
    var next, r;
    switch (code.charAt(act)) {
        case ',':
        case '}':
            next = act;
            r = __WEBPACK_IMPORTED_MODULE_1__Range1D__["a" /* default */].all();
            break;
        case '(':
            r = new __WEBPACK_IMPORTED_MODULE_1__Range1D__["a" /* default */]();
            next = code.indexOf(')', act);
            if (next > act + 1) { //not ()
                r.push.apply(r, code.slice(act + 1, next).split(',').map(__WEBPACK_IMPORTED_MODULE_3__internal_RangeElem__["a" /* default */].parse));
            }
            next += 1; //skip )
            break;
        default:
            next = code.indexOf('}', act);
            var n2 = code.indexOf(',', act);
            if (next >= 0 && n2 >= 0) {
                next = Math.min(next, n2);
            }
            else if (next < 0) {
                next = n2;
            }
            if (next < 0) {
                next = code.length;
            }
            r = new __WEBPACK_IMPORTED_MODULE_1__Range1D__["a" /* default */]([__WEBPACK_IMPORTED_MODULE_3__internal_RangeElem__["a" /* default */].parse(code.slice(act, next))]);
            break;
    }
    return {
        act: next,
        dim: r
    };
}


/***/ }),

/***/ 676:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["c"] = store;
/* harmony export (immutable) */ __webpack_exports__["a"] = remove;
/* unused harmony export has */
/* harmony export (immutable) */ __webpack_exports__["b"] = retrieve;
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by sam on 10.02.2015.
 */
/**
 * Use the browser's sessionStorage
 * @type {Storage}
 */
var context = sessionStorage;
/**
 * Store any value for a given key and returns the previous stored value.
 * Returns `null` if no previous value was found.
 * @param key
 * @param value
 * @returns {any}
 */
function store(key, value) {
    var bak = context.getItem(key);
    context.setItem(key, JSON.stringify(value));
    return bak;
}
/**
 * Removes the key-value pair from the session
 * @param key
 */
function remove(key) {
    context.removeItem(key);
}
/**
 * Returns true if the key exists in the session. Otherwise returns false.
 * @param key
 * @returns {boolean}
 */
function has(key) {
    return (context.getItem(key) !== null);
}
/**
 * Returns the value for the given key if it exists in the session.
 * Otherwise returns the `default_` parameter, which is by default `null`.
 * @param key
 * @param defaultValue
 * @returns {T}
 */
function retrieve(key, defaultValue) {
    if (defaultValue === void 0) { defaultValue = null; }
    return has(key) ? JSON.parse(context.getItem(key)) : defaultValue;
}


/***/ }),

/***/ 681:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ajax__ = __webpack_require__(629);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__GraphBase__ = __webpack_require__(650);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__graph__ = __webpack_require__(632);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__internal_promise__ = __webpack_require__(228);

/**
 * Created by Samuel Gratzl on 22.10.2014.
 */




var RemoteStoreGraph = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](RemoteStoreGraph, _super);
    function RemoteStoreGraph(desc) {
        var _this = _super.call(this, desc) || this;
        _this.updateHandler = function (event) {
            var s = event.target;
            if (s instanceof __WEBPACK_IMPORTED_MODULE_3__graph__["c" /* GraphNode */]) {
                _this.updateNode(s);
            }
            if (s instanceof __WEBPACK_IMPORTED_MODULE_3__graph__["a" /* GraphEdge */]) {
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var r;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var e;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(edgeOrSource instanceof __WEBPACK_IMPORTED_MODULE_3__graph__["a" /* GraphEdge */])) return [3 /*break*/, 2];
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
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
}(__WEBPACK_IMPORTED_MODULE_2__GraphBase__["a" /* default */]));
/* harmony default export */ __webpack_exports__["a"] = RemoteStoreGraph;


/***/ }),

/***/ 683:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__graph_graph__ = __webpack_require__(632);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ObjectNode__ = __webpack_require__(673);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__security__ = __webpack_require__(648);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__internal_promise__ = __webpack_require__(228);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return ActionMetaData; });
/* harmony export (immutable) */ __webpack_exports__["a"] = meta;
/* unused harmony export action */
/**
 * Created by sam on 12.02.2015.
 */





/**
 * additional data about a performed action
 */
var ActionMetaData = /** @class */ (function () {
    function ActionMetaData(category, operation, name, timestamp, user) {
        if (timestamp === void 0) { timestamp = Date.now(); }
        if (user === void 0) { user = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__security__["a" /* currentUserNameOrAnonymous */])(); }
        this.category = category;
        this.operation = operation;
        this.name = name;
        this.timestamp = timestamp;
        this.user = user;
    }
    ActionMetaData.restore = function (p) {
        return new ActionMetaData(p.category, p.operation, p.name, p.timestamp, p.user);
    };
    ActionMetaData.prototype.eq = function (that) {
        return this.category === that.category && this.operation === that.operation && this.name === that.name;
    };
    /**
     * checks whether this metadata are the inverse of the given one in terms of category and operation
     * @param that
     * @returns {boolean}
     */
    ActionMetaData.prototype.inv = function (that) {
        if (this.category !== that.category) {
            return false;
        }
        if (this.operation === __WEBPACK_IMPORTED_MODULE_2__ObjectNode__["c" /* op */].update) {
            return that.operation === __WEBPACK_IMPORTED_MODULE_2__ObjectNode__["c" /* op */].update;
        }
        return this.operation === __WEBPACK_IMPORTED_MODULE_2__ObjectNode__["c" /* op */].create ? that.operation === __WEBPACK_IMPORTED_MODULE_2__ObjectNode__["c" /* op */].remove : that.operation === __WEBPACK_IMPORTED_MODULE_2__ObjectNode__["c" /* op */].create;
    };
    ActionMetaData.prototype.toString = function () {
        return this.category + ":" + this.operation + " " + this.name;
    };
    return ActionMetaData;
}());

function meta(name, category, operation, timestamp, user) {
    if (category === void 0) { category = __WEBPACK_IMPORTED_MODULE_2__ObjectNode__["a" /* cat */].data; }
    if (operation === void 0) { operation = __WEBPACK_IMPORTED_MODULE_2__ObjectNode__["c" /* op */].update; }
    if (timestamp === void 0) { timestamp = Date.now(); }
    if (user === void 0) { user = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__security__["a" /* currentUserNameOrAnonymous */])(); }
    return new ActionMetaData(category, operation, name, timestamp, user);
}
/**
 * creates an action given the data
 * @param meta
 * @param id
 * @param f
 * @param inputs
 * @param parameter
 * @returns {{meta: ActionMetaData, id: string, f: (function(IObjectRef<any>[], any, ProvenanceGraph): ICmdResult), inputs: IObjectRef<any>[], parameter: any}}
 */
function action(meta, id, f, inputs, parameter) {
    if (inputs === void 0) { inputs = []; }
    if (parameter === void 0) { parameter = {}; }
    return {
        meta: meta,
        id: id,
        f: f,
        inputs: inputs,
        parameter: parameter
    };
}
/**
 * comparator by index
 * @param a
 * @param b
 * @returns {number}
 */
function byIndex(a, b) {
    var ai = +a.getAttr('index', 0);
    var bi = +b.getAttr('index', 0);
    return ai - bi;
}
var ActionNode = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](ActionNode, _super);
    function ActionNode(meta, functionId, f, parameter) {
        if (parameter === void 0) { parameter = {}; }
        var _this = _super.call(this, 'action') || this;
        _this.f = f;
        _super.prototype.setAttr.call(_this, 'meta', meta);
        _super.prototype.setAttr.call(_this, 'f_id', functionId);
        _super.prototype.setAttr.call(_this, 'parameter', parameter);
        return _this;
    }
    ActionNode.prototype.clone = function () {
        return new ActionNode(this.meta, this.f_id, this.f, this.parameter);
    };
    Object.defineProperty(ActionNode.prototype, "name", {
        get: function () {
            return this.meta.name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActionNode.prototype, "meta", {
        get: function () {
            return _super.prototype.getAttr.call(this, 'meta');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActionNode.prototype, "f_id", {
        get: function () {
            return _super.prototype.getAttr.call(this, 'f_id');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActionNode.prototype, "parameter", {
        get: function () {
            return _super.prototype.getAttr.call(this, 'parameter');
        },
        set: function (value) {
            _super.prototype.setAttr.call(this, 'parameter', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActionNode.prototype, "onceExecuted", {
        get: function () {
            return _super.prototype.getAttr.call(this, 'onceExecuted', false);
        },
        set: function (value) {
            if (this.onceExecuted !== value) {
                _super.prototype.setAttr.call(this, 'onceExecuted', value);
            }
        },
        enumerable: true,
        configurable: true
    });
    ActionNode.restore = function (r, factory) {
        var a = new ActionNode(ActionMetaData.restore(r.attrs.meta), r.attrs.f_id, factory(r.attrs.f_id), r.attrs.parameter);
        return a.restore(r);
    };
    ActionNode.prototype.toString = function () {
        return this.meta.name;
    };
    Object.defineProperty(ActionNode.prototype, "inversedBy", {
        get: function () {
            var r = this.incoming.filter(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__graph_graph__["b" /* isType */])('inverses'))[0];
            return r ? r.source : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActionNode.prototype, "inverses", {
        /**
         * inverses another action
         * @returns {ActionNode}
         */
        get: function () {
            var r = this.outgoing.filter(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__graph_graph__["b" /* isType */])('inverses'))[0];
            return r ? r.target : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActionNode.prototype, "isInverse", {
        get: function () {
            return this.outgoing.filter(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__graph_graph__["b" /* isType */])('inverses'))[0] != null;
        },
        enumerable: true,
        configurable: true
    });
    ActionNode.prototype.getOrCreateInverse = function (graph) {
        var i = this.inversedBy;
        if (i) {
            return i;
        }
        if (this.inverter) {
            return graph.createInverse(this, this.inverter);
        }
        this.inverter = null; //not needed anymore
        return null;
    };
    ActionNode.prototype.updateInverse = function (graph, inverter) {
        var i = this.inversedBy;
        if (i) { //update with the actual values / parameter only
            var c = inverter.call(this, this.requires, this.creates, this.removes);
            i.parameter = c.parameter;
            this.inverter = null;
        }
        else if (!this.isInverse) {
            //create inverse action immediatelly
            graph.createInverse(this, inverter);
            this.inverter = null;
        }
        else {
            this.inverter = inverter;
        }
    };
    ActionNode.prototype.execute = function (graph, withinMilliseconds) {
        var r = this.f.call(this, this.requires, this.parameter, graph, withinMilliseconds);
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__internal_promise__["a" /* resolveImmediately */])(r);
    };
    ActionNode.prototype.equals = function (that) {
        if (!(this.meta.category === that.meta.category && that.meta.operation === that.meta.operation)) {
            return false;
        }
        if (this.f_id !== that.f_id) {
            return false;
        }
        //TODO check parameters if they are the same
        return true;
    };
    Object.defineProperty(ActionNode.prototype, "uses", {
        get: function () {
            return this.outgoing.filter(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__graph_graph__["b" /* isType */])(/(creates|removes|requires)/)).map(function (e) { return e.target; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActionNode.prototype, "creates", {
        get: function () {
            return this.outgoing.filter(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__graph_graph__["b" /* isType */])('creates')).map(function (e) { return e.target; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActionNode.prototype, "removes", {
        get: function () {
            return this.outgoing.filter(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__graph_graph__["b" /* isType */])('removes')).sort(byIndex).map(function (e) { return e.target; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActionNode.prototype, "requires", {
        get: function () {
            return this.outgoing.filter(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__graph_graph__["b" /* isType */])('requires')).sort(byIndex).map(function (e) { return e.target; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActionNode.prototype, "resultsIn", {
        get: function () {
            var r = this.outgoing.filter(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__graph_graph__["b" /* isType */])('resultsIn'))[0];
            return r ? r.target : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActionNode.prototype, "previous", {
        get: function () {
            var r = this.incoming.filter(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__graph_graph__["b" /* isType */])('next'))[0];
            return r ? r.source : null;
        },
        enumerable: true,
        configurable: true
    });
    return ActionNode;
}(__WEBPACK_IMPORTED_MODULE_1__graph_graph__["c" /* GraphNode */]));
/* harmony default export */ __webpack_exports__["b"] = ActionNode;


/***/ }),

/***/ 684:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index__ = __webpack_require__(224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ProvenanceGraph__ = __webpack_require__(653);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__graph_LocalStorageGraph__ = __webpack_require__(669);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__security__ = __webpack_require__(648);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__graph_MemoryGraph__ = __webpack_require__(670);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__internal_promise__ = __webpack_require__(228);

/**
 * Created by sam on 12.02.2015.
 */






var LocalStorageProvenanceGraphManager = /** @class */ (function () {
    function LocalStorageProvenanceGraphManager(options) {
        if (options === void 0) { options = {}; }
        this.options = {
            storage: localStorage,
            prefix: 'clue',
            application: 'unknown'
        };
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["a" /* mixin */])(this.options, options);
    }
    LocalStorageProvenanceGraphManager.prototype.loadFromLocalStorage = function (suffix, defaultValue) {
        try {
            var item = this.options.storage.getItem(this.options.prefix + suffix);
            if (item === undefined || item === null) {
                return defaultValue;
            }
            return JSON.parse(item);
        }
        catch (e) {
            console.error(e);
            return defaultValue;
        }
    };
    LocalStorageProvenanceGraphManager.prototype.listSync = function () {
        var _this = this;
        var lists = this.loadFromLocalStorage('_provenance_graphs', []);
        return lists
            .map(function (id) { return _this.loadFromLocalStorage('_provenance_graph.' + id, {}); })
            // filter to right application
            .filter(function (d) { return d.attrs && d.attrs.of === _this.options.application; });
    };
    LocalStorageProvenanceGraphManager.prototype.list = function () {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__internal_promise__["a" /* resolveImmediately */])(this.listSync());
    };
    LocalStorageProvenanceGraphManager.prototype.getGraph = function (desc) {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__internal_promise__["a" /* resolveImmediately */])(__WEBPACK_IMPORTED_MODULE_3__graph_LocalStorageGraph__["a" /* default */].load(desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__ProvenanceGraph__["b" /* provenanceGraphFactory */])(), this.options.storage));
    };
    LocalStorageProvenanceGraphManager.prototype.get = function (desc) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var _a, _b;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = __WEBPACK_IMPORTED_MODULE_2__ProvenanceGraph__["a" /* default */].bind;
                        _b = [void 0, desc];
                        return [4 /*yield*/, this.getGraph(desc)];
                    case 1: return [2 /*return*/, new (_a.apply(__WEBPACK_IMPORTED_MODULE_2__ProvenanceGraph__["a" /* default */], _b.concat([_c.sent()])))()];
                }
            });
        });
    };
    LocalStorageProvenanceGraphManager.prototype.clone = function (graph, desc) {
        if (desc === void 0) { desc = {}; }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var description, pdesc, newGraph;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        description = "Cloned from " + graph.desc.name + " created by " + graph.desc.creator + "\n" + (graph.desc.description || '');
                        pdesc = this.createDesc(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["a" /* mixin */])({ name: graph.desc.name, description: description }, desc));
                        return [4 /*yield*/, this.getGraph(pdesc)];
                    case 1:
                        newGraph = _a.sent();
                        newGraph.restoreDump(graph.persist(), __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__ProvenanceGraph__["b" /* provenanceGraphFactory */])());
                        return [2 /*return*/, new __WEBPACK_IMPORTED_MODULE_2__ProvenanceGraph__["a" /* default */](pdesc, newGraph)];
                }
            });
        });
    };
    LocalStorageProvenanceGraphManager.prototype.import = function (json, desc) {
        if (desc === void 0) { desc = {}; }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var pdesc, newGraph;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pdesc = this.createDesc(desc);
                        return [4 /*yield*/, this.getGraph(pdesc)];
                    case 1:
                        newGraph = _a.sent();
                        newGraph.restoreDump(json, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__ProvenanceGraph__["b" /* provenanceGraphFactory */])());
                        return [2 /*return*/, new __WEBPACK_IMPORTED_MODULE_2__ProvenanceGraph__["a" /* default */](pdesc, newGraph)];
                }
            });
        });
    };
    LocalStorageProvenanceGraphManager.prototype.delete = function (desc) {
        var lists = JSON.parse(this.options.storage.getItem(this.options.prefix + '_provenance_graphs') || '[]');
        lists.splice(lists.indexOf(desc.id), 1);
        __WEBPACK_IMPORTED_MODULE_3__graph_LocalStorageGraph__["a" /* default */].delete(desc, this.options.storage);
        //just remove from the list
        this.options.storage.removeItem(this.options.prefix + '_provenance_graph.' + desc.id);
        this.options.storage.setItem(this.options.prefix + '_provenance_graphs', JSON.stringify(lists));
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__internal_promise__["a" /* resolveImmediately */])(true);
    };
    LocalStorageProvenanceGraphManager.prototype.edit = function (graph, desc) {
        if (desc === void 0) { desc = {}; }
        var base = graph instanceof __WEBPACK_IMPORTED_MODULE_2__ProvenanceGraph__["a" /* default */] ? graph.desc : graph;
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["a" /* mixin */])(base, desc);
        this.options.storage.setItem(this.options.prefix + '_provenance_graph.' + base.id, JSON.stringify(base));
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__internal_promise__["a" /* resolveImmediately */])(base);
    };
    LocalStorageProvenanceGraphManager.prototype.createDesc = function (overrides) {
        var _this = this;
        if (overrides === void 0) { overrides = {}; }
        var lists = JSON.parse(this.options.storage.getItem(this.options.prefix + '_provenance_graphs') || '[]');
        var uid = (lists.length > 0 ? String(1 + Math.max.apply(Math, lists.map(function (d) { return parseInt(d.slice(_this.options.prefix.length), 10); }))) : '0');
        var id = this.options.prefix + uid;
        var desc = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["a" /* mixin */])({
            type: 'provenance_graph',
            name: 'Temporary Session ' + uid,
            fqname: this.options.prefix + 'Temporary Session ' + uid,
            id: id,
            local: true,
            size: [0, 0],
            attrs: {
                graphtype: 'provenance_graph',
                of: this.options.application
            },
            creator: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__security__["a" /* currentUserNameOrAnonymous */])(),
            permissions: __WEBPACK_IMPORTED_MODULE_4__security__["b" /* ALL_READ_NONE */],
            ts: Date.now(),
            description: ''
        }, overrides);
        lists.push(id);
        this.options.storage.setItem(this.options.prefix + '_provenance_graphs', JSON.stringify(lists));
        this.options.storage.setItem(this.options.prefix + '_provenance_graph.' + id, JSON.stringify(desc));
        return desc;
    };
    LocalStorageProvenanceGraphManager.prototype.create = function (desc) {
        if (desc === void 0) { desc = {}; }
        var pdesc = this.createDesc(desc);
        return this.get(pdesc);
    };
    LocalStorageProvenanceGraphManager.prototype.createInMemoryDesc = function (base) {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["a" /* mixin */])({
            type: 'provenance_graph',
            name: 'In Memory Session',
            fqname: 'In Memory Session',
            id: 'memory',
            local: true,
            size: [0, 0],
            attrs: {
                graphtype: 'provenance_graph',
                of: this.options.application
            },
            creator: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__security__["a" /* currentUserNameOrAnonymous */])(),
            permissions: __WEBPACK_IMPORTED_MODULE_4__security__["b" /* ALL_READ_NONE */],
            ts: Date.now(),
            description: ''
        }, base ? base : {}, {
            id: 'memory',
            local: true
        });
    };
    LocalStorageProvenanceGraphManager.prototype.createInMemory = function () {
        var desc = this.createInMemoryDesc();
        return new __WEBPACK_IMPORTED_MODULE_2__ProvenanceGraph__["a" /* default */](desc, new __WEBPACK_IMPORTED_MODULE_5__graph_MemoryGraph__["a" /* default */](desc, [], [], __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__ProvenanceGraph__["b" /* provenanceGraphFactory */])()));
    };
    LocalStorageProvenanceGraphManager.prototype.cloneInMemory = function (graph) {
        var desc = this.createInMemoryDesc(graph.desc);
        var m = new __WEBPACK_IMPORTED_MODULE_5__graph_MemoryGraph__["a" /* default */](desc, [], [], __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__ProvenanceGraph__["b" /* provenanceGraphFactory */])());
        m.restore(graph.persist());
        return new __WEBPACK_IMPORTED_MODULE_2__ProvenanceGraph__["a" /* default */](desc, m);
    };
    return LocalStorageProvenanceGraphManager;
}());
/* harmony default export */ __webpack_exports__["a"] = LocalStorageProvenanceGraphManager;


/***/ }),

/***/ 685:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index__ = __webpack_require__(224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__data__ = __webpack_require__(662);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ProvenanceGraph__ = __webpack_require__(653);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__security__ = __webpack_require__(648);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__internal_promise__ = __webpack_require__(228);

/**
 * Created by sam on 12.02.2015.
 */





var RemoteStorageProvenanceGraphManager = /** @class */ (function () {
    function RemoteStorageProvenanceGraphManager(options) {
        if (options === void 0) { options = {}; }
        this.options = {
            application: 'unknown'
        };
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["a" /* mixin */])(this.options, options);
    }
    RemoteStorageProvenanceGraphManager.prototype.list = function () {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var _this = this;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__data__["b" /* list */])(function (d) { return d.desc.type === 'graph' && d.desc.attrs.graphtype === 'provenance_graph' && d.desc.attrs.of === _this.options.application; })];
                    case 1: return [2 /*return*/, (_a.sent()).map(function (di) { return di.desc; })];
                }
            });
        });
    };
    RemoteStorageProvenanceGraphManager.prototype.getGraph = function (desc) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__data__["a" /* get */])(desc.id)];
                    case 1: return [2 /*return*/, (_a.sent()).impl(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__ProvenanceGraph__["b" /* provenanceGraphFactory */])())];
                }
            });
        });
    };
    RemoteStorageProvenanceGraphManager.prototype.get = function (desc) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var _a, _b;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = __WEBPACK_IMPORTED_MODULE_3__ProvenanceGraph__["a" /* default */].bind;
                        _b = [void 0, desc];
                        return [4 /*yield*/, this.getGraph(desc)];
                    case 1: return [2 /*return*/, new (_a.apply(__WEBPACK_IMPORTED_MODULE_3__ProvenanceGraph__["a" /* default */], _b.concat([_c.sent()])))()];
                }
            });
        });
    };
    RemoteStorageProvenanceGraphManager.prototype.delete = function (desc) {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__data__["c" /* remove */])(desc);
    };
    RemoteStorageProvenanceGraphManager.prototype.clone = function (graph, desc) {
        if (desc === void 0) { desc = {}; }
        return this.import(graph.persist(), desc);
    };
    RemoteStorageProvenanceGraphManager.prototype.importImpl = function (json, desc) {
        if (desc === void 0) { desc = {}; }
        var pdesc = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["a" /* mixin */])({
            type: 'graph',
            attrs: {
                graphtype: 'provenance_graph',
                of: this.options.application
            },
            name: 'Persistent WS',
            creator: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__security__["a" /* currentUserNameOrAnonymous */])(),
            ts: Date.now(),
            description: '',
            nodes: json.nodes,
            edges: json.edges
        }, desc);
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__data__["d" /* upload */])(pdesc).then(function (base) {
            return base.impl(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__ProvenanceGraph__["b" /* provenanceGraphFactory */])());
        });
    };
    RemoteStorageProvenanceGraphManager.prototype.import = function (json, desc) {
        if (desc === void 0) { desc = {}; }
        return this.importImpl(json, desc).then(function (impl) {
            return new __WEBPACK_IMPORTED_MODULE_3__ProvenanceGraph__["a" /* default */](impl.desc, impl);
        });
    };
    RemoteStorageProvenanceGraphManager.prototype.migrate = function (graph, desc) {
        if (desc === void 0) { desc = {}; }
        return this.importImpl({ nodes: [], edges: [] }, desc).then(function (backend) {
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__internal_promise__["a" /* resolveImmediately */])(graph.backend.migrate())
                .then(function (_a) {
                var nodes = _a.nodes, edges = _a.edges;
                return backend.addAll(nodes, edges);
            }).then(function () {
                graph.migrateBackend(backend);
                return graph;
            });
        });
    };
    RemoteStorageProvenanceGraphManager.prototype.edit = function (graph, desc) {
        if (desc === void 0) { desc = {}; }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var base, graphProxy;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        base = graph instanceof __WEBPACK_IMPORTED_MODULE_3__ProvenanceGraph__["a" /* default */] ? graph.desc : graph;
                        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["a" /* mixin */])(base, desc);
                        return [4 /*yield*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__data__["a" /* get */])(base.id)];
                    case 1:
                        graphProxy = _a.sent();
                        return [4 /*yield*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__data__["e" /* modify */])(graphProxy, desc)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, base];
                }
            });
        });
    };
    RemoteStorageProvenanceGraphManager.prototype.create = function (desc) {
        if (desc === void 0) { desc = {}; }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var pdesc, impl;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pdesc = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["a" /* mixin */])({
                            id: undefined,
                            type: 'graph',
                            attrs: {
                                graphtype: 'provenance_graph',
                                of: this.options.application
                            },
                            name: "Persistent WS",
                            fqname: "provenance_graphs/Persistent WS",
                            creator: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__security__["a" /* currentUserNameOrAnonymous */])(),
                            size: [0, 0],
                            ts: Date.now(),
                            description: ''
                        }, desc);
                        return [4 /*yield*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__data__["d" /* upload */])(pdesc)];
                    case 1:
                        impl = (_a.sent()).impl(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__ProvenanceGraph__["b" /* provenanceGraphFactory */])());
                        return [2 /*return*/, impl.then(function (i) { return new __WEBPACK_IMPORTED_MODULE_3__ProvenanceGraph__["a" /* default */](i.desc, i); })];
                }
            });
        });
    };
    return RemoteStorageProvenanceGraphManager;
}());
/* harmony default export */ __webpack_exports__["a"] = RemoteStorageProvenanceGraphManager;


/***/ }),

/***/ 686:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__graph_graph__ = __webpack_require__(632);
/* unused harmony export DEFAULT_DURATION */
/* unused harmony export DEFAULT_TRANSITION */

/**
 * Created by sam on 12.02.2015.
 */

var DEFAULT_DURATION = 1500; //ms
var DEFAULT_TRANSITION = 0; //ms
var SlideNode = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](SlideNode, _super);
    function SlideNode() {
        return _super.call(this, 'story') || this;
    }
    Object.defineProperty(SlideNode.prototype, "name", {
        get: function () {
            return _super.prototype.getAttr.call(this, 'name', '');
        },
        set: function (value) {
            _super.prototype.setAttr.call(this, 'name', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SlideNode.prototype, "description", {
        get: function () {
            return _super.prototype.getAttr.call(this, 'description', '');
        },
        set: function (value) {
            _super.prototype.setAttr.call(this, 'description', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SlideNode.prototype, "isTextOnly", {
        get: function () {
            return !this.outgoing.some(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__graph_graph__["b" /* isType */])('jumpTo'));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SlideNode.prototype, "state", {
        get: function () {
            var edge = this.outgoing.filter(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__graph_graph__["b" /* isType */])('jumpTo'))[0];
            return edge ? edge.target : null;
        },
        enumerable: true,
        configurable: true
    });
    SlideNode.restore = function (dump) {
        return new SlideNode().restore(dump);
    };
    Object.defineProperty(SlideNode.prototype, "next", {
        get: function () {
            var n = this.outgoing.filter(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__graph_graph__["b" /* isType */])('next'))[0];
            return n ? n.target : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SlideNode.prototype, "nexts", {
        get: function () {
            return this.outgoing.filter(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__graph_graph__["b" /* isType */])('next')).map(function (n) { return n.target; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SlideNode.prototype, "previous", {
        get: function () {
            var n = this.incoming.filter(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__graph_graph__["b" /* isType */])('next'))[0];
            return n ? n.source : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SlideNode.prototype, "slideIndex", {
        get: function () {
            var p = this.previous;
            return 1 + (p ? p.slideIndex : 0);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SlideNode.prototype, "duration", {
        get: function () {
            return this.getAttr('duration', DEFAULT_DURATION);
        },
        set: function (value) {
            this.setAttr('duration', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SlideNode.prototype, "transition", {
        /**
         * the number of milliseconds for the transitions
         * @returns {number}
         */
        get: function () {
            return this.getAttr('transition', DEFAULT_TRANSITION);
        },
        set: function (value) {
            this.setAttr('transition', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SlideNode.prototype, "annotations", {
        get: function () {
            return this.getAttr('annotations', []);
        },
        enumerable: true,
        configurable: true
    });
    SlideNode.prototype.setAnnotation = function (index, ann) {
        var old = this.annotations;
        old[index] = ann;
        this.setAttr('annotations', old);
    };
    SlideNode.prototype.updateAnnotation = function (ann) {
        //since it is a reference just updated
        this.setAttr('annotations', this.annotations);
    };
    SlideNode.prototype.removeAnnotation = function (index) {
        var old = this.annotations;
        old.splice(index, 1);
        this.setAttr('annotations', old);
    };
    SlideNode.prototype.removeAnnotationElem = function (elem) {
        var old = this.annotations;
        old.splice(old.indexOf(elem), 1);
        this.setAttr('annotations', old);
    };
    SlideNode.prototype.pushAnnotation = function (ann) {
        var old = this.annotations;
        old.push(ann);
        this.setAttr('annotations', old);
        this.fire('push-annotations', ann, old);
    };
    Object.defineProperty(SlideNode.prototype, "isStart", {
        get: function () {
            return this.previous == null;
        },
        enumerable: true,
        configurable: true
    });
    SlideNode.makeText = function (title) {
        var s = new SlideNode();
        if (title) {
            s.pushAnnotation({
                type: 'text',
                pos: [25, 25],
                text: '# ${name}'
            });
            s.name = title;
        }
        return s;
    };
    return SlideNode;
}(__WEBPACK_IMPORTED_MODULE_1__graph_graph__["c" /* GraphNode */]));
/* harmony default export */ __webpack_exports__["a"] = SlideNode;


/***/ }),

/***/ 687:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__graph_graph__ = __webpack_require__(632);

/**
 * Created by sam on 12.02.2015.
 */

/**
 * a state node is one state in the visual exploration consisting of an action creating it and one or more following ones.
 * In addition, a state is characterized by the set of active object nodes
 */
var StateNode = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](StateNode, _super);
    function StateNode(name, description) {
        if (description === void 0) { description = ''; }
        var _this = _super.call(this, 'state') || this;
        _super.prototype.setAttr.call(_this, 'name', name);
        _super.prototype.setAttr.call(_this, 'description', description);
        return _this;
    }
    Object.defineProperty(StateNode.prototype, "name", {
        get: function () {
            return _super.prototype.getAttr.call(this, 'name');
        },
        set: function (value) {
            _super.prototype.setAttr.call(this, 'name', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateNode.prototype, "description", {
        get: function () {
            return _super.prototype.getAttr.call(this, 'description', '');
        },
        set: function (value) {
            _super.prototype.setAttr.call(this, 'description', value);
        },
        enumerable: true,
        configurable: true
    });
    StateNode.restore = function (p) {
        var r = new StateNode(p.attrs.name);
        return r.restore(p);
    };
    Object.defineProperty(StateNode.prototype, "consistsOf", {
        /**
         * this state consists of the following objects
         * @returns {ObjectNode<any>[]}
         */
        get: function () {
            return this.outgoing.filter(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__graph_graph__["b" /* isType */])('consistsOf')).map(function (e) { return e.target; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateNode.prototype, "resultsFrom", {
        /**
         * returns the actions leading to this state
         * @returns {ActionNode[]}
         */
        get: function () {
            return this.incoming.filter(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__graph_graph__["b" /* isType */])('resultsIn')).map(function (e) { return e.source; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateNode.prototype, "creator", {
        /**
         *
         * @returns {any}
         */
        get: function () {
            //results and not a inversed actions
            var from = this.incoming.filter(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__graph_graph__["b" /* isType */])('resultsIn')).map(function (e) { return e.source; }).filter(function (s) { return !s.isInverse; });
            if (from.length === 0) {
                return null;
            }
            return from[0];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateNode.prototype, "next", {
        get: function () {
            return this.outgoing.filter(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__graph_graph__["b" /* isType */])('next')).map(function (e) { return e.target; }).filter(function (s) { return !s.isInverse; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateNode.prototype, "previousState", {
        get: function () {
            var a = this.creator;
            if (a) {
                return a.previous;
            }
            return null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateNode.prototype, "previousStates", {
        get: function () {
            return this.resultsFrom.map(function (n) { return n.previous; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateNode.prototype, "nextStates", {
        get: function () {
            return this.next.map(function (n) { return n.resultsIn; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateNode.prototype, "nextState", {
        get: function () {
            var r = this.next[0];
            return r ? r.resultsIn : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateNode.prototype, "path", {
        get: function () {
            var p = this.previousState, r = [];
            r.unshift(this);
            if (p) {
                p.pathImpl(r);
            }
            return r;
        },
        enumerable: true,
        configurable: true
    });
    StateNode.prototype.pathImpl = function (r) {
        var p = this.previousState;
        r.unshift(this);
        if (p && r.indexOf(p) < 0) { //no loop
            //console.log(p.toString() + ' path '+ r.join(','));
            p.pathImpl(r);
        }
    };
    StateNode.prototype.toString = function () {
        return this.name;
    };
    return StateNode;
}(__WEBPACK_IMPORTED_MODULE_1__graph_graph__["c" /* GraphNode */]));
/* harmony default export */ __webpack_exports__["a"] = StateNode;


/***/ }),

/***/ 688:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__graph__ = __webpack_require__(695);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ProvenanceGraph__ = __webpack_require__(653);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ActionNode__ = __webpack_require__(683);
/* unused harmony reexport ActionNode */
/* unused harmony reexport action */
/* unused harmony reexport ActionMetaData */
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_2__ActionNode__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ObjectNode__ = __webpack_require__(673);
/* unused harmony reexport ObjectNode */
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return __WEBPACK_IMPORTED_MODULE_3__ObjectNode__["a"]; });
/* unused harmony reexport op */
/* unused harmony reexport ref */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__SlideNode__ = __webpack_require__(686);
/* unused harmony reexport SlideNode */
/* unused harmony reexport DEFAULT_DURATION */
/* unused harmony reexport DEFAULT_TRANSITION */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__StateNode__ = __webpack_require__(687);
/* unused harmony reexport StateNode */
/* unused harmony reexport ProvenanceGraph */
/* unused harmony reexport compress */
/* unused harmony reexport ProvenanceGraphDim */
/* unused harmony reexport provenanceGraphFactory */
/* unused harmony reexport toSlidePath */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__LocalStorageProvenanceGraphManager__ = __webpack_require__(684);
/* unused harmony reexport LocalStorageProvenanceGraphManager */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__RemoteStorageProvenanceGraphManager__ = __webpack_require__(685);
/* unused harmony reexport RemoteStorageProvenanceGraphManager */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__MixedStorageProvenanceGraphManager__ = __webpack_require__(702);
/* unused harmony reexport MixedStorageProvenanceGraphManager */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__graph_graph__ = __webpack_require__(632);
/* unused harmony reexport GraphEdge */
/* unused harmony export graphModule */
/* unused harmony export findLatestPath */
/* unused harmony export createDummy */
/**
 * Created by sam on 12.02.2015.
 */











var graphModule = __WEBPACK_IMPORTED_MODULE_0__graph__;
function findLatestPath(state) {
    var path = state.path.slice();
    //compute the first path to the end
    while ((state = state.nextState) != null && (path.indexOf(state) < 0)) {
        path.push(state);
    }
    return path;
}
function createDummy() {
    var desc = {
        type: 'provenance_graph',
        id: 'dummy',
        name: 'dummy',
        fqname: 'dummy',
        description: '',
        creator: 'Anonymous',
        ts: Date.now(),
        size: [0, 0],
        attrs: {
            graphtype: 'provenance_graph',
            of: 'dummy'
        }
    };
    return new __WEBPACK_IMPORTED_MODULE_1__ProvenanceGraph__["a" /* default */](desc, new __WEBPACK_IMPORTED_MODULE_0__graph__["MemoryGraph"](desc, [], [], __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__ProvenanceGraph__["b" /* provenanceGraphFactory */])()));
}


/***/ }),

/***/ 693:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__idtype__ = __webpack_require__(622);
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](AAtom, _super);
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
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__idtype__["c" /* resolve */])(this.desc.idtype);
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
        range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range);
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
}(__WEBPACK_IMPORTED_MODULE_2__idtype__["d" /* SelectAble */]));

/* harmony default export */ __webpack_exports__["a"] = AAtom;


/***/ }),

/***/ 694:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__index__ = __webpack_require__(224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__datatype__ = __webpack_require__(621);
/* harmony export (immutable) */ __webpack_exports__["a"] = createDefaultAtomDesc;
/**
 * Created by Samuel Gratzl on 14.02.2017.
 */


function createDefaultAtomDesc() {
    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__index__["a" /* mixin */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__datatype__["e" /* createDefaultDataDesc */])(), {
        type: 'atom',
        idtype: '_rows',
        value: {
            type: 'string'
        }
    });
}


/***/ }),

/***/ 695:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__graph__ = __webpack_require__(632);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "AttributeContainer", function() { return __WEBPACK_IMPORTED_MODULE_0__graph__["d"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "GraphNode", function() { return __WEBPACK_IMPORTED_MODULE_0__graph__["c"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "GraphEdge", function() { return __WEBPACK_IMPORTED_MODULE_0__graph__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "isType", function() { return __WEBPACK_IMPORTED_MODULE_0__graph__["b"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "AGraph", function() { return __WEBPACK_IMPORTED_MODULE_0__graph__["e"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__GraphProxy__ = __webpack_require__(598);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "GraphProxy", function() { return __WEBPACK_IMPORTED_MODULE_1__GraphProxy__["default"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "create", function() { return __WEBPACK_IMPORTED_MODULE_1__GraphProxy__["create"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__GraphBase__ = __webpack_require__(650);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "GraphBase", function() { return __WEBPACK_IMPORTED_MODULE_2__GraphBase__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__MemoryGraph__ = __webpack_require__(670);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "MemoryGraph", function() { return __WEBPACK_IMPORTED_MODULE_3__MemoryGraph__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__RemoteStorageGraph__ = __webpack_require__(681);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "RemoteStoreGraph", function() { return __WEBPACK_IMPORTED_MODULE_4__RemoteStorageGraph__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__LocalStorageGraph__ = __webpack_require__(669);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "LocalStorageGraph", function() { return __WEBPACK_IMPORTED_MODULE_5__LocalStorageGraph__["a"]; });
/**
 * Created by sam on 12.02.2015.
 */
/**
 * Created by Samuel Gratzl on 22.10.2014.
 */








/***/ }),

/***/ 702:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ProvenanceGraph__ = __webpack_require__(653);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__LocalStorageProvenanceGraphManager__ = __webpack_require__(684);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__RemoteStorageProvenanceGraphManager__ = __webpack_require__(685);

/**
 * Created by sam on 12.02.2015.
 */



var MixedStorageProvenanceGraphManager = /** @class */ (function () {
    function MixedStorageProvenanceGraphManager(options) {
        if (options === void 0) { options = {}; }
        this.remote = new __WEBPACK_IMPORTED_MODULE_3__RemoteStorageProvenanceGraphManager__["a" /* default */](options);
        this.local = new __WEBPACK_IMPORTED_MODULE_2__LocalStorageProvenanceGraphManager__["a" /* default */](options);
    }
    MixedStorageProvenanceGraphManager.prototype.listRemote = function () {
        return this.remote.list();
    };
    MixedStorageProvenanceGraphManager.prototype.listLocal = function () {
        return this.local.list();
    };
    MixedStorageProvenanceGraphManager.prototype.listLocalSync = function () {
        return this.local.listSync();
    };
    MixedStorageProvenanceGraphManager.prototype.list = function () {
        return Promise.all([this.listLocal(), this.listRemote()]).then(function (arr) { return arr[0].concat(arr[1]); });
    };
    MixedStorageProvenanceGraphManager.prototype.delete = function (desc) {
        if (desc.local) {
            return this.local.delete(desc);
        }
        else {
            return this.remote.delete(desc);
        }
    };
    MixedStorageProvenanceGraphManager.prototype.get = function (desc) {
        if (desc.local) {
            return this.local.get(desc);
        }
        else {
            return this.remote.get(desc);
        }
    };
    MixedStorageProvenanceGraphManager.prototype.getGraph = function (desc) {
        if (desc.local) {
            return this.local.getGraph(desc);
        }
        else {
            return this.remote.getGraph(desc);
        }
    };
    MixedStorageProvenanceGraphManager.prototype.edit = function (graph, desc) {
        var base = graph instanceof __WEBPACK_IMPORTED_MODULE_1__ProvenanceGraph__["a" /* default */] ? graph.desc : graph;
        if (base.local) {
            return this.local.edit(base, desc);
        }
        else {
            return this.remote.edit(base, desc);
        }
    };
    MixedStorageProvenanceGraphManager.prototype.cloneLocal = function (desc, extras) {
        if (extras === void 0) { extras = {}; }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var _a, _b;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = this.local).clone;
                        return [4 /*yield*/, this.getGraph(desc)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent(), extras])];
                }
            });
        });
    };
    MixedStorageProvenanceGraphManager.prototype.cloneRemote = function (desc, extras) {
        if (extras === void 0) { extras = {}; }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var _a, _b;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = this.remote).clone;
                        return [4 /*yield*/, this.getGraph(desc)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent(), extras])];
                }
            });
        });
    };
    MixedStorageProvenanceGraphManager.prototype.migrateRemote = function (graph, extras) {
        if (extras === void 0) { extras = {}; }
        return this.remote.migrate(graph, extras);
    };
    MixedStorageProvenanceGraphManager.prototype.importLocal = function (json, desc) {
        if (desc === void 0) { desc = {}; }
        return this.local.import(json, desc);
    };
    MixedStorageProvenanceGraphManager.prototype.importRemote = function (json, desc) {
        if (desc === void 0) { desc = {}; }
        return this.remote.import(json, desc);
    };
    MixedStorageProvenanceGraphManager.prototype.import = function (json, desc) {
        if (desc === void 0) { desc = {}; }
        return this.importLocal(json, desc);
    };
    MixedStorageProvenanceGraphManager.prototype.createLocal = function (desc) {
        if (desc === void 0) { desc = {}; }
        return this.local.create(desc);
    };
    MixedStorageProvenanceGraphManager.prototype.createRemote = function (desc) {
        if (desc === void 0) { desc = {}; }
        return this.remote.create(desc);
    };
    MixedStorageProvenanceGraphManager.prototype.create = function (desc) {
        if (desc === void 0) { desc = {}; }
        return this.createLocal(desc);
    };
    MixedStorageProvenanceGraphManager.prototype.createInMemory = function () {
        return this.local.createInMemory();
    };
    MixedStorageProvenanceGraphManager.prototype.cloneInMemory = function (desc) {
        var _this = this;
        return this.getGraph(desc).then(function (graph) { return _this.local.cloneInMemory(graph); });
    };
    return MixedStorageProvenanceGraphManager;
}());
/* unused harmony default export */ var _unused_webpack_default_export = MixedStorageProvenanceGraphManager;


/***/ }),

/***/ 715:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = lastOnly;
/* unused harmony export createRemove */
function lastOnly(path, functionId, toKey) {
    var lastOnes = new Map();
    path.forEach(function (p) {
        if (p.f_id === functionId) {
            lastOnes.set(toKey(p), p);
        }
    });
    return path.filter(function (p) {
        if (p.f_id !== functionId) {
            return true;
        }
        var key = toKey(p);
        //last one remains
        return lastOnes.get(key) === p;
    });
}
function createRemove(path, createFunctionId, removeFunctionId) {
    var r = [];
    outer: for (var _i = 0, path_1 = path; _i < path_1.length; _i++) {
        var act = path_1[_i];
        if (act.f_id === removeFunctionId) {
            var removed = act.removes[0];
            //removed view delete intermediate change and optional creation
            for (var j = r.length - 1; j >= 0; --j) { //back to forth for better removal
                var previous = r[j];
                var requires = previous.requires;
                var usesView = requires.indexOf(removed) >= 0;
                if (usesView) {
                    r.splice(j, 1);
                }
                else if (previous.f_id === createFunctionId && previous.creates[0] === removed) {
                    //found adding remove both
                    r.splice(j, 1);
                    continue outer;
                }
            }
        }
        r.push(act);
    }
    return r;
}


/***/ })

});