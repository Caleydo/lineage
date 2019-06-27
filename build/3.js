/*! lineage - v1.0.0-20190527-190114 - 2019
* https://phovea.caleydo.org
* Copyright (c) 2019 Carolina Nobre; Licensed BSD-3-Clause*/

webpackJsonp([3,9],{

/***/ 612:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1____ = __webpack_require__(34);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__datatype__ = __webpack_require__(623);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__IAtom__ = __webpack_require__(738);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__idtype__ = __webpack_require__(624);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__AAtom__ = __webpack_require__(737);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__range__ = __webpack_require__(620);
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
        value: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__datatype__["a" /* guessValueTypeDesc */])([value])
    }, options);
    var rowAssigner = options.rowassigner || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__idtype__["c" /* createLocalAssigner */])();
    var atom = {
        name: name,
        value: value,
        id: rowAssigner([name]).first
    };
    return new Atom(desc, atom);
}


/***/ }),

/***/ 613:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__idtype__ = __webpack_require__(624);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__datatype__ = __webpack_require__(623);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__range__ = __webpack_require__(620);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__graph__ = __webpack_require__(667);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__GraphBase__ = __webpack_require__(666);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__RemoteStorageGraph__ = __webpack_require__(742);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__MemoryGraph__ = __webpack_require__(741);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__LocalStorageGraph__ = __webpack_require__(740);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__internal_promise__ = __webpack_require__(229);
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
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__range__["e" /* all */])(); }
        if (this.cache) {
            return Promise.resolve(this.cache.then(function (i) { return i.ids(range); })); // TODO avoid <any> type cast
        }
        return Promise.resolve(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__range__["a" /* none */])());
    };
    Object.defineProperty(GraphProxy.prototype, "idtypes", {
        get: function () {
            return [__WEBPACK_IMPORTED_MODULE_4__graph__["d" /* IDTYPE_NODES */], __WEBPACK_IMPORTED_MODULE_4__graph__["e" /* IDTYPE_EDGES */]].map(__WEBPACK_IMPORTED_MODULE_1__idtype__["e" /* resolve */]);
        },
        enumerable: true,
        configurable: true
    });
    return GraphProxy;
}(__WEBPACK_IMPORTED_MODULE_2__datatype__["c" /* ADataType */]));
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

/***/ 616:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0____ = __webpack_require__(34);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__idtype__ = __webpack_require__(624);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__idtype_IDType__ = __webpack_require__(631);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__event__ = __webpack_require__(35);
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
        selectionTypes: [__WEBPACK_IMPORTED_MODULE_1__idtype__["a" /* defaultSelectionType */]] // by default just selections
    }, options);
    // store existing
    var toSync = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__idtype__["b" /* list */])().filter(function (idType) { return (idType instanceof __WEBPACK_IMPORTED_MODULE_2__idtype_IDType__["a" /* default */] && options.filter(idType)); });
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

/***/ 620:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Range1D__ = __webpack_require__(628);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__CompositeRange1D__ = __webpack_require__(644);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Range1DGroup__ = __webpack_require__(646);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__Range__ = __webpack_require__(645);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__parser__ = __webpack_require__(680);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "l", function() { return __WEBPACK_IMPORTED_MODULE_3__Range__["c"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return __WEBPACK_IMPORTED_MODULE_3__Range__["b"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_3__Range__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return __WEBPACK_IMPORTED_MODULE_0__Range1D__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "k", function() { return __WEBPACK_IMPORTED_MODULE_1__CompositeRange1D__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return __WEBPACK_IMPORTED_MODULE_2__Range1DGroup__["a"]; });
/* harmony export (immutable) */ __webpack_exports__["b"] = parse;
/* harmony export (immutable) */ __webpack_exports__["i"] = range;
/* harmony export (immutable) */ __webpack_exports__["c"] = list;
/* harmony export (immutable) */ __webpack_exports__["f"] = join;
/* harmony export (immutable) */ __webpack_exports__["j"] = asUngrouped;
/* harmony export (immutable) */ __webpack_exports__["h"] = composite;
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
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__Range__["b" /* all */])();
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
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__Range__["b" /* all */])();
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
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__Range__["b" /* all */])();
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
    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__Range__["a" /* none */])();
}
function join() {
    if (arguments.length === 0) {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__Range__["b" /* all */])();
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

/***/ 623:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index__ = __webpack_require__(34);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__idtype__ = __webpack_require__(624);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__math__ = __webpack_require__(635);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__range__ = __webpack_require__(620);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__security__ = __webpack_require__(116);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return VALUE_TYPE_CATEGORICAL; });
/* unused harmony export VALUE_TYPE_STRING */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return VALUE_TYPE_REAL; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return VALUE_TYPE_INT; });
/* unused harmony export isDataType */
/* unused harmony export assignData */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return ADataType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return DummyDataType; });
/* harmony export (immutable) */ __webpack_exports__["j"] = transpose;
/* harmony export (immutable) */ __webpack_exports__["i"] = mask;
/* harmony export (immutable) */ __webpack_exports__["h"] = categorical2partitioning;
/* unused harmony export defineDataType */
/* harmony export (immutable) */ __webpack_exports__["a"] = guessValueTypeDesc;
/* harmony export (immutable) */ __webpack_exports__["b"] = createDefaultDataDesc;
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](ADataType, _super);
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
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__range__["e" /* all */])(); }
        return Promise.resolve(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__range__["a" /* none */])());
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](DummyDataType, _super);
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
        return new __WEBPACK_IMPORTED_MODULE_4__range__["g" /* Range1DGroup */](g.name, g.color, __WEBPACK_IMPORTED_MODULE_4__range__["d" /* Range1D */].from(g.indices));
    });
    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__range__["h" /* composite */])(m.name, granges);
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
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["g" /* extendClass */])(DataType, ADataType);
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
        creator: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__security__["g" /* currentUserNameOrAnonymous */])(),
        ts: Date.now()
    };
}


/***/ }),

/***/ 624:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__manager__ = __webpack_require__(659);
/* unused harmony reexport clearSelection */
/* unused harmony reexport EVENT_REGISTER_IDTYPE */
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return __WEBPACK_IMPORTED_MODULE_0__manager__["b"]; });
/* unused harmony reexport listAll */
/* unused harmony reexport persist */
/* unused harmony reexport register */
/* unused harmony reexport restore */
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return __WEBPACK_IMPORTED_MODULE_0__manager__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return __WEBPACK_IMPORTED_MODULE_0__manager__["c"]; });
/* unused harmony reexport isInternalIDType */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ASelectAble__ = __webpack_require__(658);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return __WEBPACK_IMPORTED_MODULE_1__ASelectAble__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__IIDType__ = __webpack_require__(626);
/* unused harmony reexport asSelectOperation */
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_2__IIDType__["a"]; });
/* unused harmony reexport hoverSelectionType */
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return __WEBPACK_IMPORTED_MODULE_2__IIDType__["c"]; });
/* unused harmony reexport toSelectOperation */
/* unused harmony reexport integrateSelection */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__IDType__ = __webpack_require__(631);
/* unused harmony reexport IDType */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__AProductSelectAble__ = __webpack_require__(668);
/* unused harmony reexport AProductSelectAble */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ProductIDType__ = __webpack_require__(642);
/* unused harmony reexport ProductIDType */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__ObjectManager__ = __webpack_require__(678);
/* unused harmony reexport ObjectManager */
/* unused harmony reexport isId */
/* unused harmony reexport toId */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__LocalIDAssigner__ = __webpack_require__(677);
/* unused harmony reexport LocalIDAssigner */
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return __WEBPACK_IMPORTED_MODULE_7__LocalIDAssigner__["a"]; });
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */










/***/ }),

/***/ 626:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__range__ = __webpack_require__(620);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return defaultSelectionType; });
/* unused harmony export hoverSelectionType */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return SelectOperation; });
/* unused harmony export toSelectOperation */
/* harmony export (immutable) */ __webpack_exports__["b"] = asSelectOperation;
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
        r.dims[r.ndim] = __WEBPACK_IMPORTED_MODULE_0__range__["d" /* Range1D */].none();
    }
    return r;
}
function integrateSelection(current, additional, operation) {
    if (operation === void 0) { operation = SelectOperation.SET; }
    var next = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__range__["b" /* parse */])(additional);
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

/***/ 628:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__internal_RangeElem__ = __webpack_require__(660);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__iterator__ = __webpack_require__(643);
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
        if (it.byOne && it instanceof __WEBPACK_IMPORTED_MODULE_1__iterator__["a" /* Iterator */]) {
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
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__iterator__["b" /* forList */])(this.arr.map(function (d) { return d.from; }));
        }
        var its = this.arr.map(function (d) { return d.iter(size); });
        return __WEBPACK_IMPORTED_MODULE_1__iterator__["c" /* concat */].apply(null, its);
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

/***/ 631:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ajax__ = __webpack_require__(114);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__event__ = __webpack_require__(35);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__range__ = __webpack_require__(620);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__IIDType__ = __webpack_require__(626);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__manager__ = __webpack_require__(659);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__internal_promise__ = __webpack_require__(229);
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](IDType, _super);
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
        var v = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__range__["a" /* none */])();
        this.sel.set(type, v);
        return v;
    };
    IDType.prototype.select = function () {
        var a = Array.from(arguments);
        var type = (typeof a[0] === 'string') ? a.shift() : __WEBPACK_IMPORTED_MODULE_4__IIDType__["a" /* defaultSelectionType */], range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__range__["b" /* parse */])(a[0]), op = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__IIDType__["b" /* asSelectOperation */])(a[1]);
        return this.selectImpl(range, op, type);
    };
    IDType.prototype.selectImpl = function (range, op, type) {
        if (op === void 0) { op = __WEBPACK_IMPORTED_MODULE_4__IIDType__["c" /* SelectOperation */].SET; }
        if (type === void 0) { type = __WEBPACK_IMPORTED_MODULE_4__IIDType__["a" /* defaultSelectionType */]; }
        var b = this.selections(type);
        var newValue = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__range__["a" /* none */])();
        switch (op) {
            case __WEBPACK_IMPORTED_MODULE_4__IIDType__["c" /* SelectOperation */].SET:
                newValue = range;
                break;
            case __WEBPACK_IMPORTED_MODULE_4__IIDType__["c" /* SelectOperation */].ADD:
                newValue = b.union(range);
                break;
            case __WEBPACK_IMPORTED_MODULE_4__IIDType__["c" /* SelectOperation */].REMOVE:
                newValue = b.without(range);
                break;
        }
        if (b.eq(newValue)) {
            return b;
        }
        this.sel.set(type, newValue);
        var added = op !== __WEBPACK_IMPORTED_MODULE_4__IIDType__["c" /* SelectOperation */].REMOVE ? range : __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__range__["a" /* none */])();
        var removed = (op === __WEBPACK_IMPORTED_MODULE_4__IIDType__["c" /* SelectOperation */].ADD ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__range__["a" /* none */])() : (op === __WEBPACK_IMPORTED_MODULE_4__IIDType__["c" /* SelectOperation */].SET ? b : range));
        this.fire(IDType.EVENT_SELECT, type, newValue, added, removed, b);
        this.fire(IDType.EVENT_SELECT + "-" + type, newValue, added, removed, b);
        return b;
    };
    IDType.prototype.clear = function (type) {
        if (type === void 0) { type = __WEBPACK_IMPORTED_MODULE_4__IIDType__["a" /* defaultSelectionType */]; }
        return this.selectImpl(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__range__["a" /* none */])(), __WEBPACK_IMPORTED_MODULE_4__IIDType__["c" /* SelectOperation */].SET, type);
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
            this.canBeMappedTo = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__ajax__["c" /* getAPIJSON */])("/idtype/" + this.id + "/").then(function (list) { return list.map(__WEBPACK_IMPORTED_MODULE_5__manager__["a" /* resolve */]); });
        }
        return this.canBeMappedTo;
    };
    IDType.prototype.mapToFirstName = function (ids, toIDType) {
        var target = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__manager__["a" /* resolve */])(toIDType);
        var r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__range__["b" /* parse */])(ids);
        return chooseRequestMethod("/idtype/" + this.id + "/" + target.id, { ids: r.toString(), mode: 'first' });
    };
    IDType.prototype.mapNameToFirstName = function (names, toIDtype) {
        var target = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__manager__["a" /* resolve */])(toIDtype);
        return chooseRequestMethod("/idtype/" + this.id + "/" + target.id, { q: names, mode: 'first' });
    };
    IDType.prototype.mapToName = function (ids, toIDType) {
        var target = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__manager__["a" /* resolve */])(toIDType);
        var r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__range__["b" /* parse */])(ids);
        return chooseRequestMethod("/idtype/" + this.id + "/" + target.id, { ids: r.toString() });
    };
    IDType.prototype.mapNameToName = function (names, toIDtype) {
        var target = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__manager__["a" /* resolve */])(toIDtype);
        return chooseRequestMethod("/idtype/" + this.id + "/" + target.id, { q: names });
    };
    IDType.prototype.mapToFirstID = function (ids, toIDType) {
        var target = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__manager__["a" /* resolve */])(toIDType);
        var r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__range__["b" /* parse */])(ids);
        return chooseRequestMethod("/idtype/" + this.id + "/" + target.id + "/map", { ids: r.toString(), mode: 'first' });
    };
    IDType.prototype.mapToID = function (ids, toIDType) {
        var target = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__manager__["a" /* resolve */])(toIDType);
        var r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__range__["b" /* parse */])(ids);
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var toResolve, ids;
            var _this = this;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var r, toResolve, result_1, result, out;
            var _this = this;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__range__["b" /* parse */])(ids);
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var result;
            var _this = this;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__ajax__["c" /* getAPIJSON */])("/idtype/" + this.id + "/search", { q: pattern, limit: limit })];
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
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__ajax__["c" /* getAPIJSON */])("/idtype/" + this.id + "/" + target.id + "/search", { q: pattern, limit: limit });
    };
    IDType.EVENT_SELECT = 'select';
    return IDType;
}(__WEBPACK_IMPORTED_MODULE_2__event__["a" /* EventHandler */]));
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
    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__ajax__["d" /* sendAPI */])(url, data, method);
}


/***/ }),

/***/ 635:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(620);
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](AdvancedStatistics, _super);
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
        this._missingRange = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* none */])();
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
        return this._ranges ? this._ranges[bin] : __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* none */])();
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](Histogram, _super);
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](CatHistogram, _super);
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
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* none */])();
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

/***/ 642:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__event__ = __webpack_require__(35);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__range__ = __webpack_require__(620);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__IIDType__ = __webpack_require__(626);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__IDType__ = __webpack_require__(631);
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](ProductIDType, _super);
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
        Object.keys(persisted.sel).forEach(function (type) { return _this.sel.set(type, persisted.sel[type].map(__WEBPACK_IMPORTED_MODULE_2__range__["b" /* parse */])); });
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
                cells.push(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["c" /* list */])(_this.elems.map(function (e2) { return e === e2 ? wildcard.dim(0) : __WEBPACK_IMPORTED_MODULE_2__range__["d" /* Range1D */].all(); })));
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
        var type = (typeof a[0] === 'string') ? a.shift() : __WEBPACK_IMPORTED_MODULE_3__IIDType__["a" /* defaultSelectionType */], range = a[0].map(__WEBPACK_IMPORTED_MODULE_2__range__["b" /* parse */]), op = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__IIDType__["b" /* asSelectOperation */])(a[1]);
        return this.selectImpl(range, op, type);
    };
    ProductIDType.prototype.selectImpl = function (cells, op, type) {
        if (op === void 0) { op = __WEBPACK_IMPORTED_MODULE_3__IIDType__["c" /* SelectOperation */].SET; }
        if (type === void 0) { type = __WEBPACK_IMPORTED_MODULE_3__IIDType__["a" /* defaultSelectionType */]; }
        var rcells = cells.map(__WEBPACK_IMPORTED_MODULE_2__range__["b" /* parse */]);
        var b = this.selections(type);
        var newRange = [];
        switch (op) {
            case __WEBPACK_IMPORTED_MODULE_3__IIDType__["c" /* SelectOperation */].SET:
                newRange = rcells;
                break;
            case __WEBPACK_IMPORTED_MODULE_3__IIDType__["c" /* SelectOperation */].ADD:
                newRange = b.concat(rcells);
                break;
            case __WEBPACK_IMPORTED_MODULE_3__IIDType__["c" /* SelectOperation */].REMOVE:
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
        var added = op !== __WEBPACK_IMPORTED_MODULE_3__IIDType__["c" /* SelectOperation */].REMOVE ? rcells : [];
        var removed = (op === __WEBPACK_IMPORTED_MODULE_3__IIDType__["c" /* SelectOperation */].ADD ? [] : (op === __WEBPACK_IMPORTED_MODULE_3__IIDType__["c" /* SelectOperation */].SET ? b : rcells));
        this.fire(__WEBPACK_IMPORTED_MODULE_4__IDType__["a" /* default */].EVENT_SELECT, type, newRange, added, removed, b);
        this.fire(ProductIDType.EVENT_SELECT_PRODUCT, -1, type, newRange, added, removed, b);
        this.fire(__WEBPACK_IMPORTED_MODULE_4__IDType__["a" /* default */].EVENT_SELECT + "-" + type, newRange, added, removed, b);
        this.fire(ProductIDType.EVENT_SELECT_PRODUCT + "-" + type, -1, newRange, added, removed, b);
        return b;
    };
    ProductIDType.prototype.toPerDim = function (sel) {
        return this.elems.map(function (elem, i) {
            if (sel.length === 0) {
                return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* none */])();
            }
            var dimselections = sel.map(function (r) { return r.dim(i); });
            var selection = dimselections.reduce(function (p, a) { return p ? p.union(a) : a; }, null);
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["c" /* list */])(selection);
        });
    };
    ProductIDType.prototype.clear = function (type) {
        if (type === void 0) { type = __WEBPACK_IMPORTED_MODULE_3__IIDType__["a" /* defaultSelectionType */]; }
        return this.selectImpl([], __WEBPACK_IMPORTED_MODULE_3__IIDType__["c" /* SelectOperation */].SET, type);
    };
    ProductIDType.EVENT_SELECT_DIM = 'selectDim';
    ProductIDType.EVENT_SELECT_PRODUCT = 'selectProduct';
    return ProductIDType;
}(__WEBPACK_IMPORTED_MODULE_1__event__["a" /* EventHandler */]));
/* harmony default export */ __webpack_exports__["a"] = ProductIDType;


/***/ }),

/***/ 643:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(33);
/* unused harmony export AIterator */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Iterator; });
/* unused harmony export ListIterator */
/* unused harmony export SingleIterator */
/* unused harmony export ConcatIterator */
/* unused harmony export EmptyIterator */
/* unused harmony export empty */
/* harmony export (immutable) */ __webpack_exports__["c"] = concat;
/* harmony export (immutable) */ __webpack_exports__["d"] = range;
/* harmony export (immutable) */ __webpack_exports__["e"] = single;
/* harmony export (immutable) */ __webpack_exports__["b"] = forList;
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](Iterator, _super);
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](ListIterator, _super);
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](SingleIterator, _super);
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](ConcatIterator, _super);
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](EmptyIterator, _super);
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](TransformIterator, _super);
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

/***/ 644:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Range1D__ = __webpack_require__(628);
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](CompositeRange1D, _super);
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

/***/ 645:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Range1D__ = __webpack_require__(628);
/* harmony export (immutable) */ __webpack_exports__["b"] = all;
/* harmony export (immutable) */ __webpack_exports__["a"] = none;
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

/***/ 646:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Range1D__ = __webpack_require__(628);
/**
 * Created by Samuel Gratzl on 27.12.2016.
 */


var Range1DGroup = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](Range1DGroup, _super);
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

/***/ 658:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__event__ = __webpack_require__(35);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__range__ = __webpack_require__(620);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__IIDType__ = __webpack_require__(626);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__IDType__ = __webpack_require__(631);
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](ASelectAble, _super);
    function ASelectAble() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.numSelectListeners = 0;
        _this.selectionListeners = [];
        _this.singleSelectionListener = function (event, type, act, added, removed) { return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](_this, void 0, void 0, function () {
            var ids;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
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
        if (idRange === void 0) { idRange = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["e" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ids()];
                    case 1: return [2 /*return*/, (_a.sent()).indexOf(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["b" /* parse */])(idRange))];
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
                added: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* none */])(),
                removed: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* none */])()
            };
        });
        var act = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["f" /* join */])(full.map(function (entry) { return entry.act; }));
        var added = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["f" /* join */])(full.map(function (entry) { return entry.added; }));
        var removed = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["f" /* join */])(full.map(function (entry) { return entry.removed; }));
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var ids, r;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ids()];
                    case 1:
                        ids = _a.sent();
                        r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["f" /* join */])(this.idtypes.map(function (idtype) { return idtype.selections(type); }));
                        return [2 /*return*/, ids.indexRangeOf(r)];
                }
            });
        });
    };
    ASelectAble.prototype.select = function () {
        var a = Array.from(arguments);
        var dim = (typeof a[0] === 'number') ? +a.shift() : -1, type = (typeof a[0] === 'string') ? a.shift() : __WEBPACK_IMPORTED_MODULE_3__IIDType__["a" /* defaultSelectionType */], range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["b" /* parse */])(a[0]), op = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__IIDType__["b" /* asSelectOperation */])(a[1]);
        return this.selectImpl(range, op, type, dim);
    };
    ASelectAble.prototype.selectImpl = function (range, op, type, dim) {
        if (op === void 0) { op = __WEBPACK_IMPORTED_MODULE_3__IIDType__["c" /* SelectOperation */].SET; }
        if (type === void 0) { type = __WEBPACK_IMPORTED_MODULE_3__IIDType__["a" /* defaultSelectionType */]; }
        if (dim === void 0) { dim = -1; }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var types, ids, r;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        types = this.idtypes;
                        return [4 /*yield*/, this.ids()];
                    case 1:
                        ids = _a.sent();
                        if (dim === -1) {
                            range = ids.preMultiply(range);
                            this.accumulateEvents = 0;
                            r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["f" /* join */])(range.split().map(function (r, i) { return types[i].select(type, r, op); }));
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
        return this.selectImpl(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* none */])(), __WEBPACK_IMPORTED_MODULE_3__IIDType__["c" /* SelectOperation */].SET, type, dim);
    };
    ASelectAble.EVENT_SELECT = __WEBPACK_IMPORTED_MODULE_4__IDType__["a" /* default */].EVENT_SELECT;
    return ASelectAble;
}(__WEBPACK_IMPORTED_MODULE_1__event__["a" /* EventHandler */]));

/* harmony default export */ __webpack_exports__["a"] = ASelectAble;


/***/ }),

/***/ 659:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ajax__ = __webpack_require__(114);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__event__ = __webpack_require__(35);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__IIDType__ = __webpack_require__(626);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__IDType__ = __webpack_require__(631);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ProductIDType__ = __webpack_require__(642);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__plugin__ = __webpack_require__(71);
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
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__event__["b" /* fire */])(EVENT_REGISTER_IDTYPE, entry);
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
    return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
        var c;
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (filledUp) {
                        return [2 /*return*/, Promise.resolve(list())];
                    }
                    return [4 /*yield*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__ajax__["c" /* getAPIJSON */])('/idtype/', {}, [])];
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
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__event__["b" /* fire */])('register.idtype', idtype);
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
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__plugin__["a" /* list */])(EXTENSION_POINT_IDTYPE).forEach(function (plugin) {
        var id = plugin.id;
        var name = plugin.name;
        var names = plugin.names || toPlural(name);
        var internal = Boolean(plugin.internal);
        register(id, new __WEBPACK_IMPORTED_MODULE_4__IDType__["a" /* default */](id, name, names, internal));
    });
}


/***/ }),

/***/ 660:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__index__ = __webpack_require__(661);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__iterator__ = __webpack_require__(643);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__SingleRangeElem__ = __webpack_require__(679);
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
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__iterator__["d" /* range */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__index__["a" /* fix */])(this.from, size), -1, this.step);
        }
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__iterator__["d" /* range */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__index__["a" /* fix */])(this.from, size), __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__index__["a" /* fix */])(this.to, size), this.step);
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

/***/ 661:
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

/***/ 666:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__graph__ = __webpack_require__(667);
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

/***/ 667:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__idtype__ = __webpack_require__(624);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__range__ = __webpack_require__(620);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__index__ = __webpack_require__(34);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__event__ = __webpack_require__(35);
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
}(__WEBPACK_IMPORTED_MODULE_4__event__["a" /* EventHandler */]));

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
        _this._id = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__index__["h" /* flagId */])('graph_node', id);
        return _this;
    }
    Object.defineProperty(GraphNode.prototype, "id", {
        get: function () {
            if (isNaN(this._id)) {
                this._id = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__index__["i" /* uniqueId */])('graph_node');
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
        this._id = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__index__["h" /* flagId */])('graph_node', persisted.id);
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
        _this._id = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__index__["h" /* flagId */])('graph_edge', id);
        if (source && target) {
            _this.init();
        }
        return _this;
    }
    Object.defineProperty(GraphEdge.prototype, "id", {
        get: function () {
            if (isNaN(this._id)) {
                this._id = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__index__["i" /* uniqueId */])('graph_edge');
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
        this._id = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__index__["h" /* flagId */])('graph_edge', p.id);
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
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["e" /* all */])(); }
        var ids = (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["c" /* list */])(this.nodes.map(function (n) { return n.id; }), this.edges.map(function (n) { return n.id; })));
        return Promise.resolve(ids.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["b" /* parse */])(range)));
    };
    AGraph.prototype.idView = function (idRange) {
        if (idRange === void 0) { idRange = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["e" /* all */])(); }
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
}(__WEBPACK_IMPORTED_MODULE_1__idtype__["d" /* SelectAble */]));



/***/ }),

/***/ 668:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(620);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__IIDType__ = __webpack_require__(626);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ASelectAble__ = __webpack_require__(658);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ProductIDType__ = __webpack_require__(642);
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](AProductSelectAble, _super);
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
        var type = (typeof a[0] === 'string') ? a.shift() : __WEBPACK_IMPORTED_MODULE_2__IIDType__["a" /* defaultSelectionType */], range = a[0].map(__WEBPACK_IMPORTED_MODULE_1__range__["b" /* parse */]), op = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__IIDType__["b" /* asSelectOperation */])(a[1]);
        return this.selectProductImpl(range, op, type);
    };
    AProductSelectAble.prototype.selectProductImpl = function (cells, op, type) {
        var _this = this;
        if (op === void 0) { op = __WEBPACK_IMPORTED_MODULE_2__IIDType__["c" /* SelectOperation */].SET; }
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
        return this.selectProductImpl([], __WEBPACK_IMPORTED_MODULE_2__IIDType__["c" /* SelectOperation */].SET, type || __WEBPACK_IMPORTED_MODULE_2__IIDType__["a" /* defaultSelectionType */]);
    };
    return AProductSelectAble;
}(__WEBPACK_IMPORTED_MODULE_3__ASelectAble__["a" /* default */]));

/* harmony default export */ __webpack_exports__["a"] = AProductSelectAble;


/***/ }),

/***/ 677:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__index__ = __webpack_require__(34);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(620);
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

/***/ 678:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index__ = __webpack_require__(34);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__IIDType__ = __webpack_require__(626);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__IDType__ = __webpack_require__(631);
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](ObjectManager, _super);
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
            _this.select(type, [item], __WEBPACK_IMPORTED_MODULE_2__IIDType__["c" /* SelectOperation */].REMOVE);
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

/***/ 679:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__index__ = __webpack_require__(661);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__iterator__ = __webpack_require__(643);
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
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__iterator__["e" /* single */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__index__["a" /* fix */])(this.from, size));
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

/***/ 680:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Range__ = __webpack_require__(645);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Range1D__ = __webpack_require__(628);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Range1DGroup__ = __webpack_require__(646);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__internal_RangeElem__ = __webpack_require__(660);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__CompositeRange1D__ = __webpack_require__(644);
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

/***/ 737:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(620);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__idtype__ = __webpack_require__(624);
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
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["e" /* all */])(); }
        range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["b" /* parse */])(range);
        if (range.isNone) {
            return Promise.resolve(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* none */])());
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

/***/ 738:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__index__ = __webpack_require__(34);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__datatype__ = __webpack_require__(623);
/* harmony export (immutable) */ __webpack_exports__["a"] = createDefaultAtomDesc;
/**
 * Created by Samuel Gratzl on 14.02.2017.
 */


function createDefaultAtomDesc() {
    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__index__["a" /* mixin */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__datatype__["b" /* createDefaultDataDesc */])(), {
        type: 'atom',
        idtype: '_rows',
        value: {
            type: 'string'
        }
    });
}


/***/ }),

/***/ 740:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__GraphBase__ = __webpack_require__(666);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__graph__ = __webpack_require__(667);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__internal_promise__ = __webpack_require__(229);




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

/***/ 741:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__GraphBase__ = __webpack_require__(666);


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

/***/ 742:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ajax__ = __webpack_require__(114);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__GraphBase__ = __webpack_require__(666);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__graph__ = __webpack_require__(667);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__internal_promise__ = __webpack_require__(229);

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
                        return [4 /*yield*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__ajax__["d" /* sendAPI */])("/dataset/graph/" + this.desc.id + "/data")];
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
                    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__ajax__["d" /* sendAPI */])("/dataset/graph/" + _this.desc.id + "/" + type, data, 'POST');
                case 'update':
                    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__ajax__["d" /* sendAPI */])("/dataset/graph/" + _this.desc.id + "/" + type + "/" + elem.id, data, 'PUT');
                case 'remove':
                    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__ajax__["d" /* sendAPI */])("/dataset/graph/" + _this.desc.id + "/" + type + "/" + elem.id, {}, 'DELETE');
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
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__ajax__["d" /* sendAPI */])("/dataset/" + this.desc.id, { desc: param }, 'POST').then(function () {
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
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__ajax__["d" /* sendAPI */])("/dataset/graph/" + _this.desc.id + "/node", {}, 'DELETE');
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