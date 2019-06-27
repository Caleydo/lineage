/*! lineage - v1.0.0-20190527-190114 - 2019
* https://phovea.caleydo.org
* Copyright (c) 2019 Carolina Nobre; Licensed BSD-3-Clause*/

webpackJsonp([1,9],{

/***/ 600:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__datatype__ = __webpack_require__(621);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__index__ = __webpack_require__(224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__idtype__ = __webpack_require__(622);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__IMatrix__ = __webpack_require__(696);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__AMatrix__ = __webpack_require__(682);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__internal_TransposedMatrix__ = __webpack_require__(700);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__loader__ = __webpack_require__(701);
/* harmony export (immutable) */ __webpack_exports__["create"] = create;
/* harmony export (immutable) */ __webpack_exports__["asMatrix"] = asMatrix;
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */









/**
 * Base matrix implementation holding the data
 */
var Matrix = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](Matrix, _super);
    function Matrix(desc, loader) {
        var _this = _super.call(this, null) || this;
        _this.desc = desc;
        _this.loader = loader;
        _this.root = _this;
        _this.valuetype = desc.value;
        _this.rowtype = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__idtype__["c" /* resolve */])(desc.rowtype);
        _this.coltype = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__idtype__["c" /* resolve */])(desc.coltype);
        _this._producttype = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__idtype__["g" /* resolveProduct */])(_this.rowtype, _this.coltype);
        _this.t = new __WEBPACK_IMPORTED_MODULE_7__internal_TransposedMatrix__["a" /* default */](_this);
        return _this;
    }
    Object.defineProperty(Matrix.prototype, "producttype", {
        get: function () {
            return this._producttype;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Matrix.prototype, "idtypes", {
        get: function () {
            return [this.rowtype, this.coltype];
        },
        enumerable: true,
        configurable: true
    });
    /**
     * access at a specific position
     * @param i
     * @param j
     * @returns {*}
     */
    Matrix.prototype.at = function (i, j) {
        return this.loader.at(this.desc, i, j);
    };
    Matrix.prototype.data = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.loader.data(this.desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range));
    };
    Matrix.prototype.ids = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.loader.ids(this.desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range));
    };
    /**
     * return the column ids of the matrix
     * @returns {*}
     */
    Matrix.prototype.cols = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.loader.cols(this.desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range));
    };
    Matrix.prototype.colIds = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.loader.colIds(this.desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range));
    };
    /**
     * return the row ids of the matrix
     * @returns {*}
     */
    Matrix.prototype.rows = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.loader.rows(this.desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range));
    };
    Matrix.prototype.rowIds = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.loader.rowIds(this.desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range));
    };
    Matrix.prototype.hist = function (bins, range, containedIds) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        if (containedIds === void 0) { containedIds = 0; }
        if (this.loader.numericalHist && (this.valuetype.type === __WEBPACK_IMPORTED_MODULE_2__datatype__["h" /* VALUE_TYPE_REAL */] || this.valuetype.type === __WEBPACK_IMPORTED_MODULE_2__datatype__["g" /* VALUE_TYPE_INT */])) { // use loader for hist
            return this.loader.numericalHist(this.desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range), bins);
        }
        // compute
        return _super.prototype.hist.call(this, bins, range, containedIds);
    };
    Matrix.prototype.stats = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        if (this.loader.numericalStats && (this.valuetype.type === __WEBPACK_IMPORTED_MODULE_2__datatype__["h" /* VALUE_TYPE_REAL */] || this.valuetype.type === __WEBPACK_IMPORTED_MODULE_2__datatype__["g" /* VALUE_TYPE_INT */])) { // use loader for hist
            return this.loader.numericalStats(this.desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range));
        }
        // compute
        return _super.prototype.stats.call(this, range);
    };
    Matrix.prototype.statsAdvanced = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        if (this.loader.numericalStats && (this.valuetype.type === __WEBPACK_IMPORTED_MODULE_2__datatype__["h" /* VALUE_TYPE_REAL */] || this.valuetype.type === __WEBPACK_IMPORTED_MODULE_2__datatype__["g" /* VALUE_TYPE_INT */])) { // use loader for hist
            return this.loader.numericalStats(this.desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range));
        }
        // compute
        return _super.prototype.statsAdvanced.call(this, range);
    };
    Matrix.prototype.size = function () {
        return this.desc.size;
    };
    Matrix.prototype.persist = function () {
        return this.desc.id;
    };
    Matrix.prototype.heatmapUrl = function (range, options) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        if (options === void 0) { options = {}; }
        if (this.loader.heatmapUrl) {
            return this.loader.heatmapUrl(this.desc, range, options);
        }
        return null;
    };
    return Matrix;
}(__WEBPACK_IMPORTED_MODULE_6__AMatrix__["a" /* default */]));
/* harmony default export */ __webpack_exports__["default"] = Matrix;
/**
 * module entry point for creating a datatype
 * @param desc
 * @param loader
 * @returns {IMatrix}
 */
function create(desc, loader) {
    if (typeof loader === 'function') {
        return new Matrix(desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_8__loader__["a" /* adapterOne2Two */])(loader));
    }
    return new Matrix(desc, loader ? loader : __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_8__loader__["b" /* viaAPI2Loader */])());
}
/**
 * parses a given dataset and convert is to a matrix
 * @param data the data array
 * @param rowsIdsOrOptions see options or the row ids of this matrix
 * @param colIds the optional column ids
 * @param options options for defining the dataset description
 * @returns {IMatrix}
 */
function asMatrix(data, rowsIdsOrOptions, colIds, options) {
    if (options === void 0) { options = {}; }
    // first column if not defined, excluding 0,0
    var rows = Array.isArray(rowsIdsOrOptions) ? rowsIdsOrOptions : data.map(function (r) { return r[0]; }).slice(1);
    // first row if not defined, excluding 0,0
    var cols = colIds ? colIds : data[0].slice(1);
    if (typeof rowsIdsOrOptions === 'object') {
        options = rowsIdsOrOptions;
    }
    options = options || {};
    var realData = Array.isArray(rowsIdsOrOptions) ? data : data.slice(1).map(function (r) { return r.slice(1); });
    var valueType = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__datatype__["d" /* guessValueTypeDesc */])([].concat.apply([], realData));
    if (valueType.type === __WEBPACK_IMPORTED_MODULE_2__datatype__["h" /* VALUE_TYPE_REAL */]) {
        realData = realData.map(function (row) { return row.map(parseFloat); });
    }
    else if (valueType.type === __WEBPACK_IMPORTED_MODULE_2__datatype__["h" /* VALUE_TYPE_REAL */]) {
        realData = realData.map(function (row) { return row.map(parseInt); });
    }
    var desc = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__index__["a" /* mixin */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__IMatrix__["a" /* createDefaultMatrixDesc */])(), {
        size: [rows.length, cols.length],
        value: valueType
    }, options);
    var rowAssigner = options.rowassigner || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__idtype__["f" /* createLocalAssigner */])();
    var colAssigner = options.rowassigner || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__idtype__["f" /* createLocalAssigner */])();
    var loader = {
        rowIds: function (desc, range) { return Promise.resolve(rowAssigner(range.filter(rows))); },
        colIds: function (desc, range) { return Promise.resolve(colAssigner(range.filter(cols))); },
        ids: function (desc, range) {
            var rc = rowAssigner(range.dim(0).filter(rows));
            var cc = colAssigner(range.dim(1).filter(cols));
            return Promise.resolve(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* join */])(rc, cc));
        },
        at: function (desc, i, j) { return Promise.resolve(realData[i][j]); },
        rows: function (desc, range) { return Promise.resolve(range.filter(rows)); },
        cols: function (desc, range) { return Promise.resolve(range.filter(cols)); },
        data: function (desc, range) { return Promise.resolve(range.filter(realData)); }
    };
    return new Matrix(desc, loader);
}


/***/ }),

/***/ 601:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index__ = __webpack_require__(224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__idtype__ = __webpack_require__(622);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__datatype__ = __webpack_require__(621);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__data__ = __webpack_require__(662);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__math__ = __webpack_require__(633);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__IStratification__ = __webpack_require__(703);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__StratificationGroup__ = __webpack_require__(689);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__loader__ = __webpack_require__(705);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__StratificationVector__ = __webpack_require__(704);
/* harmony export (immutable) */ __webpack_exports__["create"] = create;
/* harmony export (immutable) */ __webpack_exports__["wrap"] = wrap;
/* harmony export (immutable) */ __webpack_exports__["asStratification"] = asStratification;
/* harmony export (immutable) */ __webpack_exports__["wrapCategoricalVector"] = wrapCategoricalVector;
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */











/**
 * root matrix implementation holding the data
 * @internal
 */
var Stratification = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](Stratification, _super);
    function Stratification(desc, loader) {
        var _this = _super.call(this, desc) || this;
        _this.loader = loader;
        return _this;
    }
    Object.defineProperty(Stratification.prototype, "idtype", {
        get: function () {
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__idtype__["c" /* resolve */])(this.desc.idtype);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stratification.prototype, "groups", {
        get: function () {
            return this.desc.groups;
        },
        enumerable: true,
        configurable: true
    });
    Stratification.prototype.group = function (group) {
        return new __WEBPACK_IMPORTED_MODULE_8__StratificationGroup__["a" /* default */](this, group, this.groups[group]);
    };
    Stratification.prototype.hist = function (bins, range) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var _a;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = __WEBPACK_IMPORTED_MODULE_6__math__["b" /* rangeHist */];
                        return [4 /*yield*/, this.range()];
                    case 1: 
                    //TODO
                    return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                }
            });
        });
    };
    Stratification.prototype.vector = function () {
        return this.asVector();
    };
    Stratification.prototype.asVector = function () {
        var _this = this;
        if (!this._v) {
            this._v = this.loader(this.desc).then(function (data) { return new __WEBPACK_IMPORTED_MODULE_10__StratificationVector__["a" /* default */](_this, data.range); });
        }
        return this._v;
    };
    Stratification.prototype.origin = function () {
        if ('origin' in this.desc) {
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__data__["f" /* getFirstByFQName */])(this.desc.origin);
        }
        return Promise.reject('no origin specified');
    };
    Stratification.prototype.range = function () {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loader(this.desc)];
                    case 1: return [2 /*return*/, (_a.sent()).range];
                }
            });
        });
    };
    Stratification.prototype.idRange = function () {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var data, ids, range;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loader(this.desc)];
                    case 1:
                        data = _a.sent();
                        ids = data.rowIds.dim(0);
                        range = data.range;
                        return [2 /*return*/, ids.preMultiply(range, this.dim[0])];
                }
            });
        });
    };
    Stratification.prototype.names = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var _a, _b;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["g" /* parse */])(range)).filter;
                        return [4 /*yield*/, this.loader(this.desc)];
                    case 1: return [2 /*return*/, _b.apply(_a, [(_c.sent()).rows, this.dim])];
                }
            });
        });
    };
    Stratification.prototype.ids = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loader(this.desc)];
                    case 1: return [2 /*return*/, (_a.sent()).rowIds.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["g" /* parse */])(range), this.dim)];
                }
            });
        });
    };
    Object.defineProperty(Stratification.prototype, "idtypes", {
        get: function () {
            return [this.idtype];
        },
        enumerable: true,
        configurable: true
    });
    Stratification.prototype.size = function () {
        return this.desc.size;
    };
    Object.defineProperty(Stratification.prototype, "length", {
        get: function () {
            return this.dim[0];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stratification.prototype, "ngroups", {
        get: function () {
            return this.desc.ngroups;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stratification.prototype, "dim", {
        get: function () {
            return [this.size()];
        },
        enumerable: true,
        configurable: true
    });
    Stratification.prototype.persist = function () {
        return this.desc.id;
    };
    return Stratification;
}(__WEBPACK_IMPORTED_MODULE_4__datatype__["a" /* ADataType */]));
/* harmony default export */ __webpack_exports__["default"] = Stratification;
/**
 * module entry point for creating a datatype
 * @param desc
 * @returns {IVector}
 */
function create(desc) {
    return new Stratification(desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_9__loader__["a" /* viaAPILoader */])());
}
function wrap(desc, rows, rowIds, range) {
    return new Stratification(desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_9__loader__["b" /* viaDataLoader */])(rows, rowIds, range));
}
function asStratification(rows, range, options) {
    if (options === void 0) { options = {}; }
    var desc = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["a" /* mixin */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_7__IStratification__["a" /* createDefaultStratificationDesc */])(), {
        size: 0,
        groups: range.groups.map(function (r) { return ({ name: r.name, color: r.color, size: r.length }); }),
        ngroups: range.groups.length
    }, options);
    var rowAssigner = options.rowassigner || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__idtype__["f" /* createLocalAssigner */])();
    return new Stratification(desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_9__loader__["b" /* viaDataLoader */])(rows, rowAssigner(rows), range));
}
function wrapCategoricalVector(v) {
    if (v.valuetype.type !== __WEBPACK_IMPORTED_MODULE_4__datatype__["f" /* VALUE_TYPE_CATEGORICAL */]) {
        throw new Error('invalid vector value type: ' + v.valuetype.type);
    }
    var toGroup = function (g) {
        if (typeof g === 'string') {
            return { name: g, color: 'gray', size: NaN };
        }
        var cat = g;
        return { name: cat.name, color: cat.color || 'gray', size: NaN };
    };
    var cats = v.desc.value.categories.map(toGroup);
    var desc = {
        id: v.desc.id + '-s',
        type: 'stratification',
        name: v.desc.name + '-s',
        fqname: v.desc.fqname + '-s',
        description: v.desc.description,
        idtype: v.idtype.id,
        ngroups: cats.length,
        groups: cats,
        size: v.length,
        creator: v.desc.creator,
        ts: v.desc.ts
    };
    function loader() {
        return Promise.all([v.groups(), v.ids(), v.names()]).then(function (args) {
            var range = args[0];
            range.groups.forEach(function (g, i) { return cats[i].size = g.length; });
            return {
                range: args[0],
                rowIds: args[1],
                rows: args[2]
            };
        });
    }
    return new Stratification(desc, loader);
}


/***/ }),

/***/ 603:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index__ = __webpack_require__(224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__idtype__ = __webpack_require__(622);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__datatype__ = __webpack_require__(621);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ITable__ = __webpack_require__(707);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__ATable__ = __webpack_require__(706);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__internal_TableVector__ = __webpack_require__(709);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__loader__ = __webpack_require__(710);
/* harmony export (immutable) */ __webpack_exports__["create"] = create;
/* harmony export (immutable) */ __webpack_exports__["wrapObjects"] = wrapObjects;
/* harmony export (immutable) */ __webpack_exports__["asTableFromArray"] = asTableFromArray;
/* harmony export (immutable) */ __webpack_exports__["asTable"] = asTable;
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */









/**
 * root matrix implementation holding the data
 * @internal
 */
var Table = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](Table, _super);
    function Table(desc, loader) {
        var _this = _super.call(this, null) || this;
        _this.desc = desc;
        _this.loader = loader;
        // set default column
        desc.columns.forEach(function (col) { return col.column = col.column || col.name; });
        _this.root = _this;
        _this.vectors = desc.columns.map(function (cdesc, i) { return new __WEBPACK_IMPORTED_MODULE_7__internal_TableVector__["a" /* default */](_this, i, cdesc); });
        return _this;
    }
    Object.defineProperty(Table.prototype, "idtype", {
        get: function () {
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__idtype__["c" /* resolve */])(this.desc.idtype || this.desc.rowtype);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "idtypes", {
        get: function () {
            return [this.idtype];
        },
        enumerable: true,
        configurable: true
    });
    Table.prototype.col = function (i) {
        return this.vectors[i]; // TODO prevent `<any>` by using `<TableVector<any, IValueTypeDesc>>` leads to TS compile errors
    };
    Table.prototype.cols = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["g" /* parse */])(range).filter(this.vectors, [this.ncol]);
    };
    Table.prototype.at = function (row, col) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.colData(this.col(col).column, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["c" /* list */])(row))];
                    case 1: return [2 /*return*/, (_a.sent())[0]];
                }
            });
        });
    };
    Table.prototype.queryView = function (name, args) {
        return new Table(this.desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_8__loader__["a" /* adapterOne2Two */])(this.loader.view(this.desc, name, args)));
    };
    Table.prototype.data = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return this.loader.data(this.desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["g" /* parse */])(range));
    };
    Table.prototype.colData = function (column, range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return this.dataOfColumn(column, range);
    };
    Table.prototype.dataOfColumn = function (column, range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return this.loader.col(this.desc, column, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["g" /* parse */])(range));
    };
    Table.prototype.objects = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return this.loader.objs(this.desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["g" /* parse */])(range));
    };
    Table.prototype.rows = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return this.loader.rows(this.desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["g" /* parse */])(range));
    };
    Table.prototype.rowIds = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return this.loader.rowIds(this.desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["g" /* parse */])(range));
    };
    Table.prototype.ids = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return this.rowIds(range);
    };
    Table.prototype.size = function () {
        return this.desc.size;
    };
    Table.prototype.persist = function () {
        return this.desc.id;
    };
    Table.prototype.restore = function (persisted) {
        if (persisted && typeof persisted.col === 'number') {
            return this.col(persisted.col);
        }
        return _super.prototype.restore.call(this, persisted);
    };
    return Table;
}(__WEBPACK_IMPORTED_MODULE_6__ATable__["a" /* default */]));
/* harmony default export */ __webpack_exports__["default"] = Table;
/**
 * module entry point for creating a datatype
 * @param desc
 * @param loader
 * @returns {ITable}
 */
function create(desc, loader) {
    if (loader) {
        return new Table(desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_8__loader__["a" /* adapterOne2Two */])(loader));
    }
    return new Table(desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_8__loader__["b" /* viaAPI2Loader */])());
}
function wrapObjects(desc, data, nameProperty) {
    return new Table(desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_8__loader__["a" /* adapterOne2Two */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_8__loader__["c" /* viaDataLoader */])(data, nameProperty)));
}
function toObjects(data, cols) {
    return data.map(function (row) {
        var r = {};
        cols.forEach(function (col, i) { return r[col] = row[i]; });
        return r;
    });
}
function toList(objs, cols) {
    return objs.map(function (obj) { return cols.map(function (c) { return obj[c]; }); });
}
function asTableImpl(columns, rows, objs, data, options) {
    if (options === void 0) { options = {}; }
    var desc = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["a" /* mixin */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__ITable__["a" /* createDefaultTableDesc */])(), {
        columns: columns,
        size: [rows.length, columns.length]
    }, options);
    var rowAssigner = options.rowassigner || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__idtype__["f" /* createLocalAssigner */])();
    var loader = function () {
        var r = {
            rowIds: rowAssigner(rows),
            rows: rows,
            objs: objs,
            data: data
        };
        return Promise.resolve(r);
    };
    return new Table(desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_8__loader__["a" /* adapterOne2Two */])(loader));
}
function asTableFromArray(data, options) {
    if (options === void 0) { options = {}; }
    var rows = data.map(function (r) { return r[0]; });
    var cols = data[0].slice(1);
    var tableData = data.slice(1).map(function (r) { return r.slice(1); });
    var columns = cols.map(function (col, i) {
        return {
            name: col,
            column: col,
            value: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__datatype__["d" /* guessValueTypeDesc */])(tableData.map(function (row) { return row[i]; }))
        };
    });
    var realData = tableData.map(function (row) { return columns.map(function (col, i) { return (col.value.type === __WEBPACK_IMPORTED_MODULE_4__datatype__["h" /* VALUE_TYPE_REAL */] || col.value.type === __WEBPACK_IMPORTED_MODULE_4__datatype__["g" /* VALUE_TYPE_INT */]) ? parseFloat(row[i]) : row[i]; }); });
    var objs = toObjects(realData, cols);
    return asTableImpl(columns, rows, objs, realData, options);
}
/**
 * Creates a new table from an array of arrays of data and an optional options data structure.
 * TODO: explain the relationship of this function and the "magic" JSON file.
 * @param data
 * @param options TODO - explain what these options are
 * @returns {Table}
 */
function asTable(data, options) {
    if (options === void 0) { options = {}; }
    var keyProperty = options.keyProperty || '_id';
    var rows = data.map(function (r, i) { return String(r[keyProperty] || i); });
    var cols = Object.keys(data[0]);
    var objs = data;
    var realData = toList(objs, cols);
    var columns = cols.map(function (col, i) {
        return {
            name: col,
            column: col,
            value: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__datatype__["d" /* guessValueTypeDesc */])(realData.map(function (row) { return row[i]; }))
        };
    });
    return asTableImpl(columns, rows, objs, realData, options);
}


/***/ }),

/***/ 604:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index__ = __webpack_require__(224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__idtype__ = __webpack_require__(622);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__datatype__ = __webpack_require__(621);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__IVector__ = __webpack_require__(711);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__AVector__ = __webpack_require__(641);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__loader__ = __webpack_require__(714);
/* harmony export (immutable) */ __webpack_exports__["create"] = create;
/* harmony export (immutable) */ __webpack_exports__["wrap"] = wrap;
/* harmony export (immutable) */ __webpack_exports__["asVector"] = asVector;
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */









/**
 * Base vector implementation holding the data.
 * @internal
 */
var Vector = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](Vector, _super);
    function Vector(desc, loader) {
        var _this = _super.call(this, null) || this;
        _this.desc = desc;
        _this.loader = loader;
        _this.root = _this;
        return _this;
    }
    Object.defineProperty(Vector.prototype, "valuetype", {
        get: function () {
            return this.desc.value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vector.prototype, "idtype", {
        get: function () {
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__idtype__["c" /* resolve */])(this.desc.idtype);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * loads all the underlying data in json format
     * TODO: load just needed data and not everything given by the requested range
     * @returns {*}
     */
    Vector.prototype.load = function () {
        return this.loader(this.desc);
    };
    /**
     * access at a specific position
     * @param i
     * @returns {*}
     */
    Vector.prototype.at = function (i) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.load()];
                    case 1: return [2 /*return*/, (_a.sent()).data[i]];
                }
            });
        });
    };
    Vector.prototype.data = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var data, d;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.load()];
                    case 1:
                        data = _a.sent();
                        d = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["g" /* parse */])(range).filter(data.data, this.dim);
                        if ((this.valuetype.type === __WEBPACK_IMPORTED_MODULE_4__datatype__["h" /* VALUE_TYPE_REAL */] || this.valuetype.type === __WEBPACK_IMPORTED_MODULE_4__datatype__["g" /* VALUE_TYPE_INT */])) {
                            return [2 /*return*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__datatype__["j" /* mask */])(d, this.valuetype)];
                        }
                        return [2 /*return*/, d];
                }
            });
        });
    };
    Vector.prototype.names = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var data;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.load()];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["g" /* parse */])(range).filter(data.rows, this.dim)];
                }
            });
        });
    };
    Vector.prototype.ids = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var data;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.load()];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.rowIds.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["g" /* parse */])(range), this.dim)];
                }
            });
        });
    };
    Object.defineProperty(Vector.prototype, "idtypes", {
        get: function () {
            return [this.idtype];
        },
        enumerable: true,
        configurable: true
    });
    Vector.prototype.size = function () {
        return this.desc.size;
    };
    Vector.prototype.sort = function (compareFn, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var d, indices;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1:
                        d = _a.sent();
                        indices = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["p" /* argSort */])(d, compareFn, thisArg);
                        return [2 /*return*/, this.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["c" /* list */])(indices))];
                }
            });
        });
    };
    Vector.prototype.filter = function (callbackfn, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var d, indices;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1:
                        d = _a.sent();
                        indices = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["q" /* argFilter */])(d, callbackfn, thisArg);
                        return [2 /*return*/, this.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["c" /* list */])(indices))];
                }
            });
        });
    };
    Vector.prototype.persist = function () {
        return this.desc.id;
    };
    return Vector;
}(__WEBPACK_IMPORTED_MODULE_6__AVector__["a" /* default */]));
/* harmony default export */ __webpack_exports__["default"] = Vector;
/**
 * module entry point for creating a datatype
 * @internal
 * @param desc
 * @returns {IVector}
 */
function create(desc) {
    if (typeof (desc.loader) === 'function') {
        return new Vector(desc, desc.loader);
    }
    return new Vector(desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_7__loader__["a" /* viaAPILoader */])());
}
function wrap(desc, rows, rowIds, data) {
    return new Vector(desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_7__loader__["b" /* viaDataLoader */])(rows, rowIds, data));
}
function asVector(rows, data, options) {
    if (options === void 0) { options = {}; }
    var desc = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["a" /* mixin */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__IVector__["a" /* createDefaultVectorDesc */])(), {
        size: data.length,
        value: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__datatype__["d" /* guessValueTypeDesc */])(data)
    }, options);
    var rowAssigner = options.rowassigner || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__idtype__["f" /* createLocalAssigner */])();
    return new Vector(desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_7__loader__["b" /* viaDataLoader */])(rows, rowAssigner(rows), data));
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

/***/ 641:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__index__ = __webpack_require__(224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__idtype__ = __webpack_require__(622);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__datatype__ = __webpack_require__(621);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__math__ = __webpack_require__(633);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__internal_StratificationVector__ = __webpack_require__(713);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__internal_ProjectedAtom__ = __webpack_require__(712);
/* unused harmony export AVector */
/* unused harmony export VectorView */
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */








/**
 * base class for different Vector implementations, views, transposed,...
 * @internal
 */
var AVector = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](AVector, _super);
    function AVector(root) {
        var _this = _super.call(this) || this;
        _this.root = root;
        return _this;
    }
    Object.defineProperty(AVector.prototype, "dim", {
        get: function () {
            return [this.length];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AVector.prototype, "length", {
        get: function () {
            return this.size();
        },
        enumerable: true,
        configurable: true
    });
    AVector.prototype.view = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return new VectorView(this.root, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range));
    };
    AVector.prototype.idView = function (idRange) {
        if (idRange === void 0) { idRange = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var ids;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ids()];
                    case 1:
                        ids = _a.sent();
                        return [2 /*return*/, this.view(ids.indexOf(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(idRange)))];
                }
            });
        });
    };
    AVector.prototype.stats = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var _a;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.root.valuetype.type !== __WEBPACK_IMPORTED_MODULE_4__datatype__["g" /* VALUE_TYPE_INT */] && this.root.valuetype.type !== __WEBPACK_IMPORTED_MODULE_4__datatype__["h" /* VALUE_TYPE_REAL */]) {
                            return [2 /*return*/, Promise.reject('invalid value type: ' + this.root.valuetype.type)];
                        }
                        _a = __WEBPACK_IMPORTED_MODULE_5__math__["c" /* computeStats */];
                        return [4 /*yield*/, this.data(range)];
                    case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                }
            });
        });
    };
    AVector.prototype.statsAdvanced = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var _a;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.root.valuetype.type !== __WEBPACK_IMPORTED_MODULE_4__datatype__["g" /* VALUE_TYPE_INT */] && this.root.valuetype.type !== __WEBPACK_IMPORTED_MODULE_4__datatype__["h" /* VALUE_TYPE_REAL */]) {
                            return [2 /*return*/, Promise.reject('invalid value type: ' + this.root.valuetype.type)];
                        }
                        _a = __WEBPACK_IMPORTED_MODULE_5__math__["d" /* computeAdvancedStats */];
                        return [4 /*yield*/, this.data(range)];
                    case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                }
            });
        });
    };
    Object.defineProperty(AVector.prototype, "indices", {
        get: function () {
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["i" /* range */])(0, this.length);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * return the range of this vector as a grouped range, depending on the type this might be a single group or multiple ones
     */
    AVector.prototype.groups = function () {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var v, vc, d, options, vcc;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        v = this.root.valuetype;
                        if (!(v.type === __WEBPACK_IMPORTED_MODULE_4__datatype__["f" /* VALUE_TYPE_CATEGORICAL */])) return [3 /*break*/, 2];
                        vc = v;
                        return [4 /*yield*/, this.data()];
                    case 1:
                        d = _a.sent();
                        options = {
                            name: this.root.desc.id
                        };
                        if (typeof vc.categories[0] !== 'string') {
                            vcc = vc.categories;
                            if (vcc[0].color) {
                                options.colors = vcc.map(function (d) { return d.color; });
                            }
                            if (vcc[0].label) {
                                options.labels = vcc.map(function (d) { return d.label; });
                            }
                        }
                        return [2 /*return*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__datatype__["i" /* categorical2partitioning */])(d, vc.categories.map(function (d) { return typeof d === 'string' ? d : d.name; }), options)];
                    case 2: return [2 /*return*/, Promise.resolve(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["f" /* composite */])(this.root.desc.id, [__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["j" /* asUngrouped */])(this.indices.dim(0))]))];
                }
            });
        });
    };
    AVector.prototype.stratification = function () {
        return this.asStratification();
    };
    AVector.prototype.asStratification = function () {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var _a, _b;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = __WEBPACK_IMPORTED_MODULE_6__internal_StratificationVector__["a" /* default */].bind;
                        _b = [void 0, this.root];
                        return [4 /*yield*/, this.groups()];
                    case 1: return [2 /*return*/, new (_a.apply(__WEBPACK_IMPORTED_MODULE_6__internal_StratificationVector__["a" /* default */], _b.concat([_c.sent()])))()];
                }
            });
        });
    };
    AVector.prototype.hist = function (bins, range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var v, d, vc, vn;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        v = this.root.valuetype;
                        return [4 /*yield*/, this.data(range)];
                    case 1:
                        d = _a.sent();
                        switch (v.type) {
                            case __WEBPACK_IMPORTED_MODULE_4__datatype__["f" /* VALUE_TYPE_CATEGORICAL */]:
                                vc = v;
                                return [2 /*return*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__math__["e" /* categoricalHist */])(d, this.indices.dim(0), d.length, vc.categories.map(function (d) { return typeof d === 'string' ? d : d.name; }), vc.categories.map(function (d) { return typeof d === 'string' ? d : d.label || d.name; }), vc.categories.map(function (d) { return typeof d === 'string' ? 'gray' : d.color || 'gray'; }))];
                            case __WEBPACK_IMPORTED_MODULE_4__datatype__["h" /* VALUE_TYPE_REAL */]:
                            case __WEBPACK_IMPORTED_MODULE_4__datatype__["g" /* VALUE_TYPE_INT */]:
                                vn = v;
                                return [2 /*return*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__math__["f" /* hist */])(d, this.indices.dim(0), d.length, bins ? bins : Math.round(Math.sqrt(this.length)), vn.range)];
                            default:
                                return [2 /*return*/, null]; //cant create hist for unique objects or other ones
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AVector.prototype.every = function (callbackfn, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1: return [2 /*return*/, (_a.sent()).every(callbackfn, thisArg)];
                }
            });
        });
    };
    AVector.prototype.some = function (callbackfn, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1: return [2 /*return*/, (_a.sent()).some(callbackfn, thisArg)];
                }
            });
        });
    };
    AVector.prototype.forEach = function (callbackfn, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1:
                        (_a.sent()).forEach(callbackfn, thisArg);
                        return [2 /*return*/];
                }
            });
        });
    };
    AVector.prototype.reduce = function (callbackfn, initialValue, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            function helper() {
                return callbackfn.apply(thisArg, Array.from(arguments));
            }
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1: return [2 /*return*/, (_a.sent()).reduce(helper, initialValue)];
                }
            });
        });
    };
    AVector.prototype.reduceRight = function (callbackfn, initialValue, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            function helper() {
                return callbackfn.apply(thisArg, Array.from(arguments));
            }
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1: return [2 /*return*/, (_a.sent()).reduceRight(helper, initialValue)];
                }
            });
        });
    };
    AVector.prototype.reduceAtom = function (f, thisArgument, valuetype, idtype) {
        var r = this;
        return new __WEBPACK_IMPORTED_MODULE_7__internal_ProjectedAtom__["a" /* default */](r, f, thisArgument, valuetype, idtype);
    };
    AVector.prototype.restore = function (persisted) {
        var r = this;
        if (persisted && persisted.f) {
            /* tslint:disable:no-eval */
            return this.reduceAtom(eval(persisted.f), this, persisted.valuetype, persisted.idtype ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__idtype__["c" /* resolve */])(persisted.idtype) : undefined);
            /* tslint:enable:no-eval */
        }
        else if (persisted && persisted.range) { //some view onto it
            r = r.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(persisted.range));
        }
        return r;
    };
    return AVector;
}(__WEBPACK_IMPORTED_MODULE_3__idtype__["d" /* SelectAble */]));

/* harmony default export */ __webpack_exports__["a"] = AVector;
/**
 * view on the vector restricted by a range
 * @internal
 */
var VectorView = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](VectorView, _super);
    /**
     * @param root underlying matrix
     * @param range range selection
     */
    function VectorView(root, range) {
        var _this = _super.call(this, root) || this;
        _this.range = range;
        return _this;
    }
    Object.defineProperty(VectorView.prototype, "desc", {
        get: function () {
            return this.root.desc;
        },
        enumerable: true,
        configurable: true
    });
    VectorView.prototype.persist = function () {
        return {
            root: this.root.persist(),
            range: this.range.toString()
        };
    };
    VectorView.prototype.size = function () {
        return this.range.size(this.root.dim)[0];
    };
    VectorView.prototype.at = function (i) {
        var inverted = this.range.invert([i], this.root.dim);
        return this.root.at(inverted[0]);
    };
    VectorView.prototype.data = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.root.data(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range), this.root.dim));
    };
    VectorView.prototype.names = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.root.names(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range), this.root.dim));
    };
    VectorView.prototype.ids = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.root.ids(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range), this.root.dim));
    };
    VectorView.prototype.view = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        var r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range);
        if (r.isAll) {
            return this;
        }
        return new VectorView(this.root, this.range.preMultiply(r, this.dim));
    };
    Object.defineProperty(VectorView.prototype, "valuetype", {
        get: function () {
            return this.root.valuetype;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VectorView.prototype, "idtype", {
        get: function () {
            return this.root.idtype;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VectorView.prototype, "idtypes", {
        get: function () {
            return [this.idtype];
        },
        enumerable: true,
        configurable: true
    });
    /*get indices() {
     return this.range;
     }*/
    VectorView.prototype.sort = function (compareFn, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var d, indices;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1:
                        d = _a.sent();
                        indices = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__index__["p" /* argSort */])(d, compareFn, thisArg);
                        return [2 /*return*/, this.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["c" /* list */])(indices))];
                }
            });
        });
    };
    VectorView.prototype.filter = function (callbackfn, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var d, indices;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1:
                        d = _a.sent();
                        indices = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__index__["q" /* argFilter */])(d, callbackfn, thisArg);
                        return [2 /*return*/, this.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["c" /* list */])(indices))];
                }
            });
        });
    };
    return VectorView;
}(AVector));



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

/***/ 682:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__idtype__ = __webpack_require__(622);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__idtype_AProductSelectAble__ = __webpack_require__(663);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__datatype__ = __webpack_require__(621);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__math__ = __webpack_require__(633);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__internal_SliceColVector__ = __webpack_require__(698);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__internal_ProjectedVector__ = __webpack_require__(697);
/* unused harmony export AMatrix */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return MatrixView; });
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */








function flatten(arr, indices, select) {
    if (select === void 0) { select = 0; }
    var r = [];
    var dim = [arr.length, arr[0].length];
    if (select === 0) {
        r = r.concat.apply(r, arr);
    }
    else {
        var _loop_1 = function (i) {
            arr.forEach(function (ai) {
                r.push(ai[i]);
            });
        };
        //stupid slicing
        for (var i = 0; i < dim[1]; ++i) {
            _loop_1(i);
        }
    }
    return {
        data: r,
        indices: indices.dim(select).repeat(dim[1 - select])
    };
}
/**
 * base class for different Matrix implementations, views, transposed,...
 */
var AMatrix = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](AMatrix, _super);
    function AMatrix(root) {
        var _this = _super.call(this) || this;
        _this.root = root;
        return _this;
    }
    Object.defineProperty(AMatrix.prototype, "dim", {
        get: function () {
            return this.size();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AMatrix.prototype, "length", {
        get: function () {
            return this.nrow * this.ncol;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AMatrix.prototype, "nrow", {
        get: function () {
            return this.dim[0];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AMatrix.prototype, "ncol", {
        get: function () {
            return this.dim[1];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AMatrix.prototype, "indices", {
        get: function () {
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["i" /* range */])([0, this.nrow], [0, this.ncol]);
        },
        enumerable: true,
        configurable: true
    });
    AMatrix.prototype.view = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        var r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range);
        if (r.isAll) {
            return this.root;
        }
        return new MatrixView(this.root, r);
    };
    AMatrix.prototype.slice = function (col) {
        return new __WEBPACK_IMPORTED_MODULE_6__internal_SliceColVector__["a" /* default */](this.root, col);
    };
    AMatrix.prototype.stats = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var v, _a, _b, _c;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_d) {
                switch (_d.label) {
                    case 0:
                        v = this.root.valuetype;
                        if (!(v.type === __WEBPACK_IMPORTED_MODULE_4__datatype__["g" /* VALUE_TYPE_INT */] || v.type === __WEBPACK_IMPORTED_MODULE_4__datatype__["h" /* VALUE_TYPE_REAL */])) return [3 /*break*/, 2];
                        _b = (_a = __WEBPACK_IMPORTED_MODULE_5__math__["c" /* computeStats */]).apply;
                        _c = [void 0];
                        return [4 /*yield*/, this.data(range)];
                    case 1: return [2 /*return*/, _b.apply(_a, _c.concat([_d.sent()]))];
                    case 2: return [2 /*return*/, Promise.reject('invalid value type: ' + v.type)];
                }
            });
        });
    };
    AMatrix.prototype.statsAdvanced = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var v, _a, _b, _c, _d;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_e) {
                switch (_e.label) {
                    case 0:
                        v = this.root.valuetype;
                        if (!(v.type === __WEBPACK_IMPORTED_MODULE_4__datatype__["g" /* VALUE_TYPE_INT */] || v.type === __WEBPACK_IMPORTED_MODULE_4__datatype__["h" /* VALUE_TYPE_REAL */])) return [3 /*break*/, 2];
                        _a = __WEBPACK_IMPORTED_MODULE_5__math__["d" /* computeAdvancedStats */];
                        _c = (_b = [].concat).apply;
                        _d = [[]];
                        return [4 /*yield*/, this.data(range)];
                    case 1: return [2 /*return*/, _a.apply(void 0, [_c.apply(_b, _d.concat([_e.sent()]))])];
                    case 2: return [2 /*return*/, Promise.reject('invalid value type: ' + v.type)];
                }
            });
        });
    };
    AMatrix.prototype.hist = function (bins, range, containedIds) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        if (containedIds === void 0) { containedIds = 0; }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var v, d, flat, vc, vn;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        v = this.root.valuetype;
                        return [4 /*yield*/, this.data(range)];
                    case 1:
                        d = _a.sent();
                        flat = flatten(d, this.indices, containedIds);
                        switch (v.type) {
                            case __WEBPACK_IMPORTED_MODULE_4__datatype__["f" /* VALUE_TYPE_CATEGORICAL */]:
                                vc = v;
                                return [2 /*return*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__math__["e" /* categoricalHist */])(flat.data, flat.indices, flat.data.length, vc.categories.map(function (d) { return typeof d === 'string' ? d : d.name; }), vc.categories.map(function (d) { return typeof d === 'string' ? d : d.label || d.name; }), vc.categories.map(function (d) { return typeof d === 'string' ? 'gray' : d.color || 'gray'; }))];
                            case __WEBPACK_IMPORTED_MODULE_4__datatype__["g" /* VALUE_TYPE_INT */]:
                            case __WEBPACK_IMPORTED_MODULE_4__datatype__["h" /* VALUE_TYPE_REAL */]:
                                vn = v;
                                return [2 /*return*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__math__["f" /* hist */])(flat.data, flat.indices, flat.data.length, bins ? bins : Math.round(Math.sqrt(this.length)), vn.range)];
                            default:
                                return [2 /*return*/, Promise.reject('invalid value type: ' + v.type)]; //cant create hist for unique objects or other ones
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AMatrix.prototype.idView = function (idRange) {
        if (idRange === void 0) { idRange = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var r, ids;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(idRange);
                        if (r.isAll) {
                            return [2 /*return*/, Promise.resolve(this.root)];
                        }
                        return [4 /*yield*/, this.ids()];
                    case 1:
                        ids = _a.sent();
                        return [2 /*return*/, this.view(ids.indexOf(r))];
                }
            });
        });
    };
    AMatrix.prototype.reduce = function (f, thisArgument, valuetype, idtype) {
        return new __WEBPACK_IMPORTED_MODULE_7__internal_ProjectedVector__["a" /* default */](this.root, f, thisArgument, valuetype, idtype);
    };
    AMatrix.prototype.restore = function (persisted) {
        if (persisted && persisted.f) {
            /* tslint:disable:no-eval */
            return this.reduce(eval(persisted.f), this, persisted.valuetype, persisted.idtype ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__idtype__["c" /* resolve */])(persisted.idtype) : undefined);
            /* tslint:enable:no-eval */
        }
        else if (persisted && persisted.range) { //some view onto it
            return this.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(persisted.range));
        }
        else if (persisted && persisted.transposed) {
            return this.t;
        }
        else if (persisted && persisted.col) {
            return this.slice(+persisted.col);
        }
        else if (persisted && persisted.row) {
            return this.t.slice(+persisted.row);
        }
        else {
            return this;
        }
    };
    return AMatrix;
}(__WEBPACK_IMPORTED_MODULE_3__idtype_AProductSelectAble__["a" /* default */]));

/* harmony default export */ __webpack_exports__["a"] = AMatrix;
// circular dependency thus not extractable
/**
 * view on the matrix restricted by a range
 * @param root underlying matrix
 * @param range range selection
 * @param t optional its transposed version
 * @constructor
 */
var MatrixView = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](MatrixView, _super);
    function MatrixView(root, range, t) {
        if (t === void 0) { t = null; }
        var _this = _super.call(this, root) || this;
        _this.range = range;
        _this.t = t;
        _this.range = range;
        //ensure that there are two dimensions
        range.dim(0);
        range.dim(1);
        if (!t) {
            _this.t = new MatrixView(root.t, range.swap(), _this);
        }
        return _this;
    }
    Object.defineProperty(MatrixView.prototype, "desc", {
        get: function () {
            return this.root.desc;
        },
        enumerable: true,
        configurable: true
    });
    MatrixView.prototype.persist = function () {
        return {
            root: this.root.persist(),
            range: this.range.toString()
        };
    };
    MatrixView.prototype.ids = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.root.ids(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range), this.root.dim));
    };
    MatrixView.prototype.cols = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.root.cols(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range), this.root.dim));
    };
    MatrixView.prototype.colIds = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.root.colIds(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range), this.root.dim));
    };
    MatrixView.prototype.rows = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.root.rows(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range), this.root.dim));
    };
    MatrixView.prototype.rowIds = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.root.rowIds(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range), this.root.dim));
    };
    MatrixView.prototype.size = function () {
        return this.range.size(this.root.dim);
    };
    MatrixView.prototype.at = function (i, j) {
        var inverted = this.range.invert([i, j], this.root.dim);
        return this.root.at(inverted[0], inverted[1]);
    };
    MatrixView.prototype.data = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.root.data(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range), this.root.dim));
    };
    MatrixView.prototype.hist = function (bins, range, containedIds) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        if (containedIds === void 0) { containedIds = 0; }
        return this.root.hist(bins, this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range), this.root.dim), containedIds);
    };
    MatrixView.prototype.stats = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.root.stats(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range), this.root.dim));
    };
    MatrixView.prototype.statsAdvanced = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.root.statsAdvanced(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range), this.root.dim));
    };
    MatrixView.prototype.heatmapUrl = function (range, options) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        if (options === void 0) { options = {}; }
        return this.root.heatmapUrl(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range), this.root.dim), options);
    };
    MatrixView.prototype.view = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        var r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range);
        if (r.isAll) {
            return this;
        }
        return new MatrixView(this.root, this.range.preMultiply(r, this.dim));
    };
    Object.defineProperty(MatrixView.prototype, "valuetype", {
        get: function () {
            return this.root.valuetype;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MatrixView.prototype, "rowtype", {
        get: function () {
            return this.root.rowtype;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MatrixView.prototype, "coltype", {
        get: function () {
            return this.root.coltype;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MatrixView.prototype, "producttype", {
        get: function () {
            return this.root.producttype;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MatrixView.prototype, "idtypes", {
        get: function () {
            return this.root.idtypes;
        },
        enumerable: true,
        configurable: true
    });
    return MatrixView;
}(AMatrix));



/***/ }),

/***/ 689:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__idtype__ = __webpack_require__(622);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__math__ = __webpack_require__(633);
/**
 * Created by sam on 26.12.2016.
 */




/**
 * root matrix implementation holding the data
 * @internal
 */
var StratificationGroup = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](StratificationGroup, _super);
    function StratificationGroup(root, groupIndex, groupDesc) {
        var _this = _super.call(this) || this;
        _this.root = root;
        _this.groupIndex = groupIndex;
        _this.groupDesc = groupDesc;
        return _this;
    }
    Object.defineProperty(StratificationGroup.prototype, "desc", {
        get: function () {
            return this.root.desc;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StratificationGroup.prototype, "groups", {
        get: function () {
            return [this.groupDesc];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StratificationGroup.prototype, "ngroups", {
        get: function () {
            return 1;
        },
        enumerable: true,
        configurable: true
    });
    StratificationGroup.prototype.group = function (groupIndex) {
        if (groupIndex === 0) {
            return this;
        }
        return null; //can't sub a single group
    };
    Object.defineProperty(StratificationGroup.prototype, "idtype", {
        get: function () {
            return this.root.idtype;
        },
        enumerable: true,
        configurable: true
    });
    StratificationGroup.prototype.hist = function (bins, range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var _a;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = __WEBPACK_IMPORTED_MODULE_3__math__["b" /* rangeHist */];
                        return [4 /*yield*/, this.range()];
                    case 1: 
                    //FIXME
                    return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                }
            });
        });
    };
    StratificationGroup.prototype.vector = function () {
        return this.asVector();
    };
    StratificationGroup.prototype.asVector = function () {
        return Promise.all([this.root.asVector(), this.rangeGroup()]).then(function (arr) { return arr[0].view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["c" /* list */])(arr[1])); });
    };
    StratificationGroup.prototype.origin = function () {
        return this.root.origin();
    };
    StratificationGroup.prototype.range = function () {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var g;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.rangeGroup()];
                    case 1:
                        g = _a.sent();
                        return [2 /*return*/, new __WEBPACK_IMPORTED_MODULE_1__range__["k" /* CompositeRange1D */](g.name, [g])];
                }
            });
        });
    };
    StratificationGroup.prototype.idRange = function () {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var r, g;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.root.idRange()];
                    case 1:
                        r = _a.sent();
                        g = r.groups[this.groupIndex];
                        return [2 /*return*/, new __WEBPACK_IMPORTED_MODULE_1__range__["k" /* CompositeRange1D */](g.name, [g])];
                }
            });
        });
    };
    StratificationGroup.prototype.rangeGroup = function () {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var r;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.root.range()];
                    case 1:
                        r = _a.sent();
                        return [2 /*return*/, r.groups[this.groupIndex]];
                }
            });
        });
    };
    StratificationGroup.prototype.names = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var g, r;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.rangeGroup()];
                    case 1:
                        g = _a.sent();
                        r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["c" /* list */])(g).preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range));
                        return [2 /*return*/, this.root.names(r)];
                }
            });
        });
    };
    StratificationGroup.prototype.ids = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var g, r;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.rangeGroup()];
                    case 1:
                        g = _a.sent();
                        r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["c" /* list */])(g).preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range));
                        return [2 /*return*/, this.root.ids(r)];
                }
            });
        });
    };
    StratificationGroup.prototype.idView = function (idRange) {
        if (idRange === void 0) { idRange = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return Promise.reject('not implemented');
    };
    StratificationGroup.prototype.toString = function () {
        return this.persist();
    };
    Object.defineProperty(StratificationGroup.prototype, "idtypes", {
        get: function () {
            return [this.idtype];
        },
        enumerable: true,
        configurable: true
    });
    StratificationGroup.prototype.size = function () {
        return [this.length];
    };
    Object.defineProperty(StratificationGroup.prototype, "length", {
        get: function () {
            return this.groupDesc.size;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StratificationGroup.prototype, "dim", {
        get: function () {
            return this.size();
        },
        enumerable: true,
        configurable: true
    });
    StratificationGroup.prototype.persist = function () {
        return {
            root: this.root.persist(),
            group: this.groupIndex
        };
    };
    StratificationGroup.prototype.restore = function (persisted) {
        return this;
    };
    return StratificationGroup;
}(__WEBPACK_IMPORTED_MODULE_2__idtype__["d" /* SelectAble */]));
/* harmony default export */ __webpack_exports__["a"] = StratificationGroup;


/***/ }),

/***/ 696:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__datatype__ = __webpack_require__(621);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index__ = __webpack_require__(224);
/* unused harmony export IDTYPE_ROW */
/* unused harmony export IDTYPE_COLUMN */
/* unused harmony export IDTYPE_CELL */
/* unused harmony export DIM_ROW */
/* unused harmony export DIM_COL */
/* harmony export (immutable) */ __webpack_exports__["a"] = createDefaultMatrixDesc;
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */


var IDTYPE_ROW = 0;
var IDTYPE_COLUMN = 1;
var IDTYPE_CELL = 2;
var DIM_ROW = 0;
var DIM_COL = 1;
function createDefaultMatrixDesc() {
    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["a" /* mixin */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__datatype__["e" /* createDefaultDataDesc */])(), {
        type: 'matrix',
        rowtype: '_rows',
        coltype: '_cols',
        size: [0, 0]
    });
}


/***/ }),

/***/ 697:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index__ = __webpack_require__(224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__vector_AVector__ = __webpack_require__(641);
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */




/**
 * a simple projection of a matrix columns to a vector
 */
var ProjectedVector = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](ProjectedVector, _super);
    function ProjectedVector(m, f, thisArgument, valuetype, _idtype) {
        if (thisArgument === void 0) { thisArgument = m; }
        if (valuetype === void 0) { valuetype = m.valuetype; }
        if (_idtype === void 0) { _idtype = m.rowtype; }
        var _this = _super.call(this, null) || this;
        _this.m = m;
        _this.f = f;
        _this.thisArgument = thisArgument;
        _this.valuetype = valuetype;
        _this._idtype = _idtype;
        _this.desc = {
            name: m.desc.name + '-p',
            fqname: m.desc.fqname + '-p',
            type: 'vector',
            id: m.desc.id + '-p',
            size: _this.dim[0],
            idtype: m.rowtype,
            value: _this.valuetype,
            description: m.desc.description,
            creator: m.desc.creator,
            ts: m.desc.ts
        };
        _this.root = _this;
        return _this;
    }
    ProjectedVector.prototype.persist = function () {
        return {
            root: this.m.persist(),
            f: this.f.toString(),
            valuetype: this.valuetype === this.m.valuetype ? undefined : this.valuetype,
            idtype: this.idtype === this.m.rowtype ? undefined : this.idtype.name
        };
    };
    ProjectedVector.prototype.restore = function (persisted) {
        var r = this;
        if (persisted && persisted.range) { //some view onto it
            r = r.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["g" /* parse */])(persisted.range));
        }
        return r;
    };
    Object.defineProperty(ProjectedVector.prototype, "idtype", {
        get: function () {
            return this._idtype;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProjectedVector.prototype, "idtypes", {
        get: function () {
            return [this._idtype];
        },
        enumerable: true,
        configurable: true
    });
    ProjectedVector.prototype.size = function () {
        return this.m.nrow;
    };
    /**
     * return the associated ids of this vector
     */
    ProjectedVector.prototype.names = function (range) {
        return this.m.rows(range);
    };
    ProjectedVector.prototype.ids = function (range) {
        return this.m.rowIds(range);
    };
    /**
     * returns a promise for getting one cell
     * @param i
     */
    ProjectedVector.prototype.at = function (i) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var d;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.m.data(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["c" /* list */])(i))];
                    case 1:
                        d = _a.sent();
                        return [2 /*return*/, this.f.call(this.thisArgument, d[0])];
                }
            });
        });
    };
    /**
     * returns a promise for getting the data as two dimensional array
     * @param range
     */
    ProjectedVector.prototype.data = function (range) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.m.data(range)];
                    case 1: return [2 /*return*/, (_a.sent()).map(this.f, this.thisArgument)];
                }
            });
        });
    };
    ProjectedVector.prototype.sort = function (compareFn, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var d, indices;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1:
                        d = _a.sent();
                        indices = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["p" /* argSort */])(d, compareFn, thisArg);
                        return [2 /*return*/, this.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["c" /* list */])(indices))];
                }
            });
        });
    };
    ProjectedVector.prototype.filter = function (callbackfn, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var d, indices;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1:
                        d = _a.sent();
                        indices = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["q" /* argFilter */])(d, callbackfn, thisArg);
                        return [2 /*return*/, this.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["c" /* list */])(indices))];
                }
            });
        });
    };
    return ProjectedVector;
}(__WEBPACK_IMPORTED_MODULE_3__vector_AVector__["a" /* default */]));
/* harmony default export */ __webpack_exports__["a"] = ProjectedVector;


/***/ }),

/***/ 698:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index__ = __webpack_require__(224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__vector_AVector__ = __webpack_require__(641);
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */




/**
 * a simple projection of a matrix columns to a vector
 */
var SliceColVector = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](SliceColVector, _super);
    function SliceColVector(m, col) {
        var _this = _super.call(this, null) || this;
        _this.m = m;
        _this.col = col;
        _this.colRange = __WEBPACK_IMPORTED_MODULE_2__range__["b" /* Range1D */].from([_this.col]);
        _this.desc = {
            name: m.desc.name + '-c' + col,
            fqname: m.desc.fqname + '-c' + col,
            id: m.desc.id + '-c' + col,
            type: 'vector',
            idtype: m.rowtype,
            size: m.nrow,
            value: m.valuetype,
            description: m.desc.description,
            creator: m.desc.creator,
            ts: m.desc.ts
        };
        _this.root = _this;
        return _this;
    }
    SliceColVector.prototype.persist = function () {
        return {
            root: this.m.persist(),
            col: this.col
        };
    };
    SliceColVector.prototype.restore = function (persisted) {
        var r = this;
        if (persisted && persisted.range) { //some view onto it
            r = r.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["g" /* parse */])(persisted.range));
        }
        return r;
    };
    Object.defineProperty(SliceColVector.prototype, "valuetype", {
        get: function () {
            return this.m.valuetype;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SliceColVector.prototype, "idtype", {
        get: function () {
            return this.m.rowtype;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SliceColVector.prototype, "idtypes", {
        get: function () {
            return [this.idtype];
        },
        enumerable: true,
        configurable: true
    });
    SliceColVector.prototype.size = function () {
        return this.m.nrow;
    };
    /**
     * return the associated ids of this vector
     */
    SliceColVector.prototype.names = function (range) {
        return this.m.rows(range);
    };
    SliceColVector.prototype.ids = function (range) {
        return this.m.rowIds(range);
    };
    /**
     * returns a promise for getting one cell
     * @param i
     */
    SliceColVector.prototype.at = function (i) {
        return this.m.at(i, this.col);
    };
    /**
     * returns a promise for getting the data as two dimensional array
     * @param range
     */
    SliceColVector.prototype.data = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var rr, r, d;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        rr = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["g" /* parse */])(range);
                        r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["c" /* list */])(rr.dim(0), this.colRange);
                        return [4 /*yield*/, this.m.data(r)];
                    case 1:
                        d = _a.sent();
                        if (d.length === 0) {
                            return [2 /*return*/, []];
                        }
                        if (Array.isArray(d[0])) {
                            return [2 /*return*/, d.map(function (di) { return di[0]; })];
                        }
                        return [2 /*return*/, d];
                }
            });
        });
    };
    SliceColVector.prototype.sort = function (compareFn, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var d, indices;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1:
                        d = _a.sent();
                        indices = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["p" /* argSort */])(d, compareFn, thisArg);
                        return [2 /*return*/, this.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["c" /* list */])(indices))];
                }
            });
        });
    };
    SliceColVector.prototype.filter = function (callbackfn, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var d, indices;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1:
                        d = _a.sent();
                        indices = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["q" /* argFilter */])(d, callbackfn, thisArg);
                        return [2 /*return*/, this.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["c" /* list */])(indices))];
                }
            });
        });
    };
    return SliceColVector;
}(__WEBPACK_IMPORTED_MODULE_3__vector_AVector__["a" /* default */]));
/* harmony default export */ __webpack_exports__["a"] = SliceColVector;


/***/ }),

/***/ 699:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index__ = __webpack_require__(224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__vector_AVector__ = __webpack_require__(641);
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */




/**
 * a simple projection of a matrix columns to a vector
 */
var SliceRowVector = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](SliceRowVector, _super);
    function SliceRowVector(m, row) {
        var _this = _super.call(this, null) || this;
        _this.m = m;
        _this.row = row;
        _this.rowRange = __WEBPACK_IMPORTED_MODULE_2__range__["b" /* Range1D */].from([_this.row]);
        _this.desc = {
            name: m.desc.name + '-r' + row,
            fqname: m.desc.fqname + '-r' + row,
            id: m.desc.id + '-r' + row,
            type: 'vector',
            idtype: m.coltype,
            size: m.ncol,
            value: m.valuetype,
            description: m.desc.description,
            creator: m.desc.creator,
            ts: m.desc.ts
        };
        _this.root = _this;
        return _this;
    }
    SliceRowVector.prototype.persist = function () {
        return {
            root: this.m.persist(),
            row: this.row
        };
    };
    SliceRowVector.prototype.restore = function (persisted) {
        var r = this;
        if (persisted && persisted.range) { //some view onto it
            r = r.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["g" /* parse */])(persisted.range));
        }
        return r;
    };
    Object.defineProperty(SliceRowVector.prototype, "valuetype", {
        get: function () {
            return this.m.valuetype;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SliceRowVector.prototype, "idtype", {
        get: function () {
            return this.m.coltype;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SliceRowVector.prototype, "idtypes", {
        get: function () {
            return [this.idtype];
        },
        enumerable: true,
        configurable: true
    });
    SliceRowVector.prototype.size = function () {
        return this.m.ncol;
    };
    /**
     * return the associated ids of this vector
     */
    SliceRowVector.prototype.names = function (range) {
        return this.m.cols(range);
    };
    SliceRowVector.prototype.ids = function (range) {
        return this.m.colIds(range);
    };
    /**
     * returns a promise for getting one cell
     * @param i
     */
    SliceRowVector.prototype.at = function (i) {
        return this.m.at(this.row, i);
    };
    /**
     * returns a promise for getting the data as two dimensional array
     * @param range
     */
    SliceRowVector.prototype.data = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var rr, r, d;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        rr = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["g" /* parse */])(range);
                        r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["c" /* list */])(this.rowRange, rr.dim(0));
                        return [4 /*yield*/, this.m.data(r)];
                    case 1:
                        d = _a.sent();
                        return [2 /*return*/, d[0]];
                }
            });
        });
    };
    SliceRowVector.prototype.sort = function (compareFn, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var d, indices;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1:
                        d = _a.sent();
                        indices = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["p" /* argSort */])(d, compareFn, thisArg);
                        return [2 /*return*/, this.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["c" /* list */])(indices))];
                }
            });
        });
    };
    SliceRowVector.prototype.filter = function (callbackfn, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var d, indices;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1:
                        d = _a.sent();
                        indices = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["q" /* argFilter */])(d, callbackfn, thisArg);
                        return [2 /*return*/, this.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["c" /* list */])(indices))];
                }
            });
        });
    };
    return SliceRowVector;
}(__WEBPACK_IMPORTED_MODULE_3__vector_AVector__["a" /* default */]));
/* harmony default export */ __webpack_exports__["a"] = SliceRowVector;


/***/ }),

/***/ 700:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__datatype__ = __webpack_require__(621);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__AMatrix__ = __webpack_require__(682);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__SliceRowVector__ = __webpack_require__(699);
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */





/**
 * view on the underlying matrix as transposed version
 * @param base
 * @constructor
 */
var TransposedMatrix = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](TransposedMatrix, _super);
    function TransposedMatrix(base) {
        var _this = _super.call(this, base) || this;
        _this.t = base;
        return _this;
    }
    Object.defineProperty(TransposedMatrix.prototype, "desc", {
        get: function () {
            return this.root.desc;
        },
        enumerable: true,
        configurable: true
    });
    TransposedMatrix.prototype.persist = function () {
        return {
            root: this.root.persist(),
            transposed: true
        };
    };
    Object.defineProperty(TransposedMatrix.prototype, "valuetype", {
        get: function () {
            return this.root.valuetype;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TransposedMatrix.prototype, "rowtype", {
        get: function () {
            return this.root.coltype;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TransposedMatrix.prototype, "coltype", {
        get: function () {
            return this.root.rowtype;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TransposedMatrix.prototype, "producttype", {
        get: function () {
            return this.root.producttype;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TransposedMatrix.prototype, "idtypes", {
        get: function () {
            return [this.rowtype, this.coltype];
        },
        enumerable: true,
        configurable: true
    });
    TransposedMatrix.prototype.ids = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var ids;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.t.ids(range ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range).swap() : undefined)];
                    case 1:
                        ids = _a.sent();
                        return [2 /*return*/, ids.swap()];
                }
            });
        });
    };
    TransposedMatrix.prototype.cols = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.t.rows(range ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range).swap() : undefined);
    };
    TransposedMatrix.prototype.colIds = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.t.rowIds(range ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range).swap() : undefined);
    };
    TransposedMatrix.prototype.rows = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.t.cols(range ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range).swap() : undefined);
    };
    TransposedMatrix.prototype.rowIds = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.t.colIds(range ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range).swap() : undefined);
    };
    TransposedMatrix.prototype.view = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        var r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range);
        if (r.isAll) {
            return this;
        }
        return new __WEBPACK_IMPORTED_MODULE_3__AMatrix__["b" /* MatrixView */](this.root, r.swap()).t;
    };
    TransposedMatrix.prototype.slice = function (col) {
        return new __WEBPACK_IMPORTED_MODULE_4__SliceRowVector__["a" /* default */](this.root, col);
    };
    TransposedMatrix.prototype.size = function () {
        var s = this.t.dim;
        return [s[1], s[0]]; //swap dimension
    };
    TransposedMatrix.prototype.at = function (i, j) {
        return this.t.at(j, i);
    };
    TransposedMatrix.prototype.data = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var _a;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = __WEBPACK_IMPORTED_MODULE_2__datatype__["k" /* transpose */];
                        return [4 /*yield*/, this.t.data(range ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range).swap() : undefined)];
                    case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                }
            });
        });
    };
    TransposedMatrix.prototype.hist = function (bins, range, containedIds) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        if (containedIds === void 0) { containedIds = 0; }
        return this.t.hist(bins, range ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range).swap() : undefined, 1 - containedIds);
    };
    TransposedMatrix.prototype.stats = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.t.stats(range ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range).swap() : undefined);
    };
    TransposedMatrix.prototype.statsAdvanced = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.t.statsAdvanced(range ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range).swap() : undefined);
    };
    TransposedMatrix.prototype.heatmapUrl = function (range, options) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        if (options === void 0) { options = {}; }
        options.transpose = options.transpose !== true;
        return this.t.heatmapUrl(range ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range).swap() : undefined, options);
    };
    return TransposedMatrix;
}(__WEBPACK_IMPORTED_MODULE_3__AMatrix__["a" /* default */]));
/* harmony default export */ __webpack_exports__["a"] = TransposedMatrix;


/***/ }),

/***/ 701:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ajax__ = __webpack_require__(629);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__datatype__ = __webpack_require__(621);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__math__ = __webpack_require__(633);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__idtype__ = __webpack_require__(622);
/* harmony export (immutable) */ __webpack_exports__["a"] = adapterOne2Two;
/* harmony export (immutable) */ __webpack_exports__["b"] = viaAPI2Loader;
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */





function adapterOne2Two(loader) {
    return {
        rowIds: function (desc, range) { return loader(desc).then(function (d) { return range.preMultiply(d.rowIds, desc.size); }); },
        rows: function (desc, range) { return loader(desc).then(function (d) { return range.dim(0).filter(d.rows, desc.size[0]); }); },
        colIds: function (desc, range) { return loader(desc).then(function (d) { return range.preMultiply(d.colIds, desc.size); }); },
        cols: function (desc, range) { return loader(desc).then(function (d) { return range.dim(1).filter(d.cols, desc.size[1]); }); },
        ids: function (desc, range) { return loader(desc).then(function (d) { return range.preMultiply(d.ids, desc.size); }); },
        at: function (desc, i, j) { return loader(desc).then(function (d) { return d.data[i][j]; }); },
        data: function (desc, range) { return loader(desc).then(function (d) { return range.filter(d.data, desc.size); }); }
    };
}
function maskIt(desc) {
    if (desc.value.type === __WEBPACK_IMPORTED_MODULE_2__datatype__["g" /* VALUE_TYPE_INT */] || desc.value.type === __WEBPACK_IMPORTED_MODULE_2__datatype__["h" /* VALUE_TYPE_REAL */]) {
        return function (v) { return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__datatype__["j" /* mask */])(v, desc.value); };
    }
    return function (v) { return v; };
}
function viaAPI2Loader() {
    var rowIds = null, rows = null, colIds = null, cols = null, data = null, hist = null, stats = null;
    function fillRowIds(desc) {
        if (rowIds !== null && rows !== null) {
            Promise.all([rowIds, rows]).then(function (_a) {
                var rowIdValues = _a[0], rowValues = _a[1];
                var idType = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__idtype__["c" /* resolve */])(desc.rowtype);
                var rowIds = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(rowIdValues);
                idType.fillMapCache(rowIds.dim(0).asList(rowValues.length), rowValues);
            });
        }
    }
    function fillColumnIds(desc) {
        if (colIds !== null && cols !== null) {
            Promise.all([colIds, cols]).then(function (_a) {
                var colIdValues = _a[0], colValues = _a[1];
                var idType = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__idtype__["c" /* resolve */])(desc.coltype);
                var colIds = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(colIdValues);
                idType.fillMapCache(colIds.dim(0).asList(colValues.length), colValues);
            });
        }
    }
    var r = {
        rowIds: function (desc, range) {
            if (rowIds == null) {
                rowIds = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__ajax__["a" /* getAPIJSON */])("/dataset/matrix/" + desc.id + "/rowIds").then(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */]);
                fillRowIds(desc);
            }
            return rowIds.then(function (d) { return d.preMultiply(range, desc.size); });
        },
        rows: function (desc, range) {
            if (rows == null) {
                rows = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__ajax__["a" /* getAPIJSON */])("/dataset/matrix/" + desc.id + "/rows");
                fillRowIds(desc);
            }
            return rows.then(function (d) { return range.dim(0).filter(d, desc.size[0]); });
        },
        colIds: function (desc, range) {
            if (colIds == null) {
                colIds = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__ajax__["a" /* getAPIJSON */])("/dataset/matrix/" + desc.id + "/colIds").then(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */]);
                fillColumnIds(desc);
            }
            return colIds.then(function (d) { return d.preMultiply(range, desc.size); });
        },
        cols: function (desc, range) {
            if (cols == null) {
                cols = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__ajax__["a" /* getAPIJSON */])("/dataset/matrix/" + desc.id + "/cols");
                fillColumnIds(desc);
            }
            return cols.then(function (d) { return range.dim(1).filter(d, desc.size[1]); });
        },
        ids: function (desc, range) {
            if (range.ndim === 1) {
                return r.rowIds(desc, range);
            }
            range.dim(0); //ensure two dim
            range.dim(1); //ensure two dim
            var split = range.split();
            return Promise.all([r.rowIds(desc, split[0] || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])()), r.colIds(desc, split[1] || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])())]).then(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* join */]);
        },
        numericalStats: function (desc, range) {
            if (range.isAll) {
                if (stats == null) {
                    stats = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__ajax__["a" /* getAPIJSON */])("/dataset/matrix/" + desc.id + "/stats");
                }
                return stats;
            }
            var args = {
                range: range.toString()
            };
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__ajax__["a" /* getAPIJSON */])("/dataset/matrix/" + desc.id + "/stats", args);
        },
        numericalHist: function (desc, range, bins) {
            if (bins === void 0) { bins = NaN; }
            var valueRange = desc.value.range;
            if (range.isAll) {
                if (hist == null) {
                    hist = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__ajax__["a" /* getAPIJSON */])("/dataset/matrix/" + desc.id + "/hist").then(function (hist) { return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__math__["g" /* wrapHist */])(hist, valueRange); });
                }
                return hist;
            }
            var args = {
                range: range.toString()
            };
            if (!isNaN(bins)) {
                args.bins = bins;
            }
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__ajax__["a" /* getAPIJSON */])("/dataset/matrix/" + desc.id + "/hist", args).then(function (hist) { return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__math__["g" /* wrapHist */])(hist, valueRange); });
        },
        at: function (desc, i, j) { return r.data(desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["c" /* list */])([i], [j])).then(function (data) { return maskIt(desc)(data[0][0]); }); },
        data: function (desc, range) {
            if (range.isAll) {
                if (data == null) {
                    data = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__ajax__["a" /* getAPIJSON */])("/dataset/matrix/" + desc.id + "/raw").then(maskIt(desc)); // TODO avoid <any> type cast
                }
                return data;
            }
            if (data != null) { //already loading all
                return data.then(function (d) { return range.filter(d, desc.size); });
            }
            var size = desc.size;
            if (size[0] * size[1] < 1000 || desc.loadAtOnce) { // small file load all
                data = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__ajax__["a" /* getAPIJSON */])("/dataset/matrix/" + desc.id + "/raw").then(maskIt(desc)); // TODO avoid <any> type cast
                return data.then(function (d) { return range.filter(d, desc.size); });
            }
            //server side slicing
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__ajax__["c" /* getAPIData */])("/dataset/matrix/" + desc.id + "/raw", { range: range.toString() }).then(maskIt(desc));
        },
        heatmapUrl: function (desc, range, options) {
            var args = {
                format: options.format || 'png',
                range: range.toString()
            };
            if (options.transpose === true) {
                args.format_transpose = true;
            }
            if (options.range) {
                args.format_min = options.range[0];
                args.format_max = options.range[1];
            }
            if (options.palette) {
                args.format_palette = options.palette.toString();
            }
            if (options.missing) {
                args.format_missing = options.missing;
            }
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__ajax__["d" /* api2absURL */])("/dataset/matrix/" + desc.id + "/data", args);
        }
    };
    return r;
}


/***/ }),

/***/ 703:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__index__ = __webpack_require__(224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__datatype__ = __webpack_require__(621);
/* unused harmony export guessColor */
/* harmony export (immutable) */ __webpack_exports__["a"] = createDefaultStratificationDesc;
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */


function guessColor(stratification, group) {
    switch (group.toLowerCase()) {
        case 'male':
            return 'blue';
        case 'female':
            return 'red';
        case 'deceased':
            return '#e41a1b';
        case 'living':
            return '#377eb8';
    }
    return 'gray';
}
function createDefaultStratificationDesc() {
    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__index__["a" /* mixin */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__datatype__["e" /* createDefaultDataDesc */])(), {
        type: 'stratification',
        idtype: '_rows',
        size: 0,
        groups: [],
        ngroups: 0
    });
}


/***/ }),

/***/ 704:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index__ = __webpack_require__(224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__datatype__ = __webpack_require__(621);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__vector_AVector__ = __webpack_require__(641);
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */





/**
 * root matrix implementation holding the data
 * @internal
 */
var StratificationVector = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](StratificationVector, _super);
    function StratificationVector(strat, range) {
        var _this = _super.call(this, null) || this;
        _this.strat = strat;
        _this.range = range;
        _this._cache = null;
        _this.root = _this;
        _this.valuetype = {
            type: __WEBPACK_IMPORTED_MODULE_3__datatype__["f" /* VALUE_TYPE_CATEGORICAL */],
            categories: range.groups.map(function (g) { return ({ name: g.name, label: g.name, color: g.color }); })
        };
        var d = strat.desc;
        _this.desc = {
            name: d.name,
            fqname: d.fqname,
            description: d.description,
            id: d.id + '-v',
            type: 'vector',
            size: d.size,
            idtype: d.idtype,
            value: _this.valuetype,
            creator: d.creator,
            ts: d.ts
        };
        return _this;
    }
    Object.defineProperty(StratificationVector.prototype, "idtype", {
        get: function () {
            return this.strat.idtype;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StratificationVector.prototype, "idtypes", {
        get: function () {
            return [this.idtype];
        },
        enumerable: true,
        configurable: true
    });
    StratificationVector.prototype.persist = function () {
        return {
            root: this.strat.persist()
        };
    };
    StratificationVector.prototype.restore = function (persisted) {
        var r = this;
        if (persisted && persisted.range) { //some view onto it
            r = r.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["g" /* parse */])(persisted.range));
        }
        return r;
    };
    StratificationVector.prototype.load = function () {
        if (!this._cache) {
            var r_1 = [];
            this.range.groups.forEach(function (g) {
                g.forEach(function () { return r_1.push(g.name); });
            });
            this._cache = r_1;
        }
        return this._cache;
    };
    /**
     * access at a specific position
     * @param i
     * @returns {*}
     */
    StratificationVector.prototype.at = function (i) {
        return Promise.resolve(this.load()[i]);
    };
    StratificationVector.prototype.data = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        var data = this.load();
        return Promise.resolve(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["g" /* parse */])(range).filter(data, this.dim));
    };
    StratificationVector.prototype.names = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return this.strat.names(range);
    };
    StratificationVector.prototype.ids = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return this.strat.ids(range);
    };
    StratificationVector.prototype.size = function () {
        return this.strat.size();
    };
    StratificationVector.prototype.sort = function (compareFn, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var d, indices;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1:
                        d = _a.sent();
                        indices = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["p" /* argSort */])(d, compareFn, thisArg);
                        return [2 /*return*/, this.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["c" /* list */])(indices))];
                }
            });
        });
    };
    StratificationVector.prototype.filter = function (callbackfn, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var d, indices;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1:
                        d = _a.sent();
                        indices = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["q" /* argFilter */])(d, callbackfn, thisArg);
                        return [2 /*return*/, this.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["c" /* list */])(indices))];
                }
            });
        });
    };
    return StratificationVector;
}(__WEBPACK_IMPORTED_MODULE_4__vector_AVector__["a" /* default */]));
/* harmony default export */ __webpack_exports__["a"] = StratificationVector;


/***/ }),

/***/ 705:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ajax__ = __webpack_require__(629);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__idtype__ = __webpack_require__(622);
/* harmony export (immutable) */ __webpack_exports__["a"] = viaAPILoader;
/* harmony export (immutable) */ __webpack_exports__["b"] = viaDataLoader;
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */



function createRangeFromGroups(name, groups) {
    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["f" /* composite */])(name, groups.map(function (g) {
        return new __WEBPACK_IMPORTED_MODULE_1__range__["e" /* Range1DGroup */](g.name, g.color || 'gray', __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(g.range).dim(0));
    }));
}
function viaAPILoader() {
    var _data = undefined;
    return function (desc) {
        if (!_data) { //in the cache
            _data = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__ajax__["a" /* getAPIJSON */])('/dataset/' + desc.id).then(function (data) {
                var idType = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__idtype__["c" /* resolve */])(desc.idtype);
                var rowIds = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(data.rowIds);
                idType.fillMapCache(rowIds.dim(0).asList(data.rows.length), data.rows);
                return {
                    rowIds: rowIds,
                    rows: data.rows,
                    range: createRangeFromGroups(desc.name, data.groups)
                };
            });
        }
        return _data;
    };
}
function viaDataLoader(rows, rowIds, range) {
    var _data = undefined;
    return function () {
        if (!_data) { //in the cache
            _data = Promise.resolve({
                rowIds: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["c" /* list */])(rowIds),
                rows: rows,
                range: range
            });
        }
        return _data;
    };
}


/***/ }),

/***/ 706:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__idtype__ = __webpack_require__(622);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__internal_MultiTableVector__ = __webpack_require__(708);
/* unused harmony export ATable */
/* unused harmony export TableView */
/**
 * Created by Samuel Gratzl on 27.12.2016.
 */




/**
 * base class for different Table implementations, views, transposed,...
 * @internal
 */
var ATable = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](ATable, _super);
    function ATable(root) {
        var _this = _super.call(this) || this;
        _this.root = root;
        return _this;
    }
    Object.defineProperty(ATable.prototype, "dim", {
        get: function () {
            return this.size();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ATable.prototype, "nrow", {
        get: function () {
            return this.dim[0];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ATable.prototype, "ncol", {
        get: function () {
            return this.dim[1];
        },
        enumerable: true,
        configurable: true
    });
    ATable.prototype.view = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return new TableView(this.root, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range));
    };
    ATable.prototype.idView = function (idRange) {
        if (idRange === void 0) { idRange = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var _a;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.view;
                        return [4 /*yield*/, this.ids()];
                    case 1: return [2 /*return*/, _a.apply(this, [(_b.sent()).indexOf(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(idRange))])];
                }
            });
        });
    };
    ATable.prototype.reduce = function (f, thisArgument, valuetype, idtype) {
        return new __WEBPACK_IMPORTED_MODULE_3__internal_MultiTableVector__["a" /* default */](this.root, f, thisArgument, valuetype, idtype);
    };
    ATable.prototype.restore = function (persisted) {
        if (persisted && persisted.f) {
            /* tslint:disable:no-eval */
            return this.reduce(eval(persisted.f), this, persisted.valuetype, persisted.idtype ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__idtype__["c" /* resolve */])(persisted.idtype) : undefined);
            /* tslint:enable:no-eval */
        }
        else if (persisted && persisted.range) { //some view onto it
            return this.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(persisted.range));
        }
        else {
            return this;
        }
    };
    return ATable;
}(__WEBPACK_IMPORTED_MODULE_2__idtype__["d" /* SelectAble */]));

/* harmony default export */ __webpack_exports__["a"] = ATable;
// circular dependency thus not extractable
/**
 * @internal
 */
var TableView = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](TableView, _super);
    function TableView(root, range) {
        var _this = _super.call(this, root) || this;
        _this.range = range;
        _this.range = range;
        _this.vectors = _this.root.cols(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["c" /* list */])(range.dim(1))).map(function (v) { return v.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["c" /* list */])(range.dim(0))); });
        return _this;
    }
    Object.defineProperty(TableView.prototype, "desc", {
        get: function () {
            return this.root.desc;
        },
        enumerable: true,
        configurable: true
    });
    TableView.prototype.persist = function () {
        return {
            root: this.root.persist(),
            range: this.range.toString()
        };
    };
    TableView.prototype.restore = function (persisted) {
        var r = this;
        if (persisted && persisted.range) { //some view onto it
            r = r.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(persisted.range));
        }
        return r;
    };
    TableView.prototype.size = function () {
        return this.range.size(this.root.dim);
    };
    TableView.prototype.at = function (row, col) {
        var inverted = this.range.invert([row, col], this.root.dim);
        return this.root.at(inverted[0], inverted[1]);
    };
    TableView.prototype.col = function (i) {
        return this.vectors[i]; // TODO prevent `<any>` by using `<IVector<any, IValueTypeDesc>>` leads to TS compile errors
    };
    TableView.prototype.cols = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range).filter(this.vectors, [this.ncol]);
    };
    TableView.prototype.data = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.root.data(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range), this.root.dim));
    };
    TableView.prototype.colData = function (column, range) {
        return this.dataOfColumn(column, range);
    };
    TableView.prototype.dataOfColumn = function (column, range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        // since we directly accessing the column by name there is no need for the column part of the range
        var rowRange = this.range.dim(0).preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range).dim(0), this.root.dim[0]);
        return this.root.dataOfColumn(column, new __WEBPACK_IMPORTED_MODULE_1__range__["l" /* Range */]([rowRange]));
    };
    TableView.prototype.objects = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.root.objects(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range), this.root.dim));
    };
    TableView.prototype.rows = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.root.rows(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range), this.root.dim));
    };
    TableView.prototype.rowIds = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.root.rowIds(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range), this.root.dim));
    };
    TableView.prototype.ids = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.rowIds(range);
    };
    TableView.prototype.view = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        var r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range);
        if (r.isAll) {
            return this;
        }
        return new TableView(this.root, this.range.preMultiply(r, this.dim));
    };
    Object.defineProperty(TableView.prototype, "idtype", {
        get: function () {
            return this.root.idtype;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TableView.prototype, "idtypes", {
        get: function () {
            return [this.idtype];
        },
        enumerable: true,
        configurable: true
    });
    TableView.prototype.queryView = function (name, args) {
        throw new Error('not implemented');
    };
    return TableView;
}(ATable));



/***/ }),

/***/ 707:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__index__ = __webpack_require__(224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__datatype__ = __webpack_require__(621);
/* harmony export (immutable) */ __webpack_exports__["a"] = createDefaultTableDesc;
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */


function createDefaultTableDesc() {
    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__index__["a" /* mixin */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__datatype__["e" /* createDefaultDataDesc */])(), {
        type: 'table',
        idtype: '_rows',
        columns: [],
        size: [0, 0]
    });
}


/***/ }),

/***/ 708:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index__ = __webpack_require__(224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__vector_AVector__ = __webpack_require__(641);
/**
 * Created by Samuel Gratzl on 27.12.2016.
 */




/**
 * @internal
 */
var MultiTableVector = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](MultiTableVector, _super);
    function MultiTableVector(table, f, thisArgument, valuetype, _idtype) {
        if (thisArgument === void 0) { thisArgument = table; }
        if (valuetype === void 0) { valuetype = null; }
        if (_idtype === void 0) { _idtype = table.idtype; }
        var _this = _super.call(this, null) || this;
        _this.table = table;
        _this.f = f;
        _this.thisArgument = thisArgument;
        _this.valuetype = valuetype;
        _this._idtype = _idtype;
        _this.desc = {
            name: table.desc.name + '-p',
            fqname: table.desc.fqname + '-p',
            description: f.toString(),
            type: 'vector',
            id: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["l" /* fixId */])(table.desc.id + '-p' + f.toString()),
            idtype: table.desc.idtype,
            size: table.nrow,
            value: valuetype,
            creator: table.desc.creator,
            ts: Date.now()
        };
        _this.root = _this;
        return _this;
    }
    Object.defineProperty(MultiTableVector.prototype, "idtype", {
        get: function () {
            return this._idtype;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MultiTableVector.prototype, "idtypes", {
        get: function () {
            return [this.idtype];
        },
        enumerable: true,
        configurable: true
    });
    MultiTableVector.prototype.persist = function () {
        return {
            root: this.table.persist(),
            f: this.f.toString(),
            valuetype: this.valuetype ? this.valuetype : undefined,
            idtype: this.idtype === this.table.idtype ? undefined : this.idtype.name
        };
    };
    MultiTableVector.prototype.restore = function (persisted) {
        var r = this;
        if (persisted && persisted.range) { //some view onto it
            r = r.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["g" /* parse */])(persisted.range));
        }
        return r;
    };
    MultiTableVector.prototype.size = function () {
        return this.table.nrow;
    };
    /**
     * return the associated ids of this vector
     */
    MultiTableVector.prototype.names = function (range) {
        return this.table.rows(range);
    };
    MultiTableVector.prototype.ids = function (range) {
        return this.table.rowIds(range);
    };
    /**
     * returns a promise for getting one cell
     * @param i
     */
    MultiTableVector.prototype.at = function (i) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var _a, _b, _c;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _b = (_a = this.f).call;
                        _c = [this.thisArgument];
                        return [4 /*yield*/, this.table.data(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["c" /* list */])(i))];
                    case 1: return [2 /*return*/, _b.apply(_a, _c.concat([(_d.sent())[0]]))];
                }
            });
        });
    };
    /**
     * returns a promise for getting the data as two dimensional array
     * @param range
     */
    MultiTableVector.prototype.data = function (range) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.table.data(range)];
                    case 1: return [2 /*return*/, (_a.sent()).map(this.f, this.thisArgument)];
                }
            });
        });
    };
    MultiTableVector.prototype.sort = function (compareFn, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var d, indices;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1:
                        d = _a.sent();
                        indices = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["p" /* argSort */])(d, compareFn, thisArg);
                        return [2 /*return*/, this.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["c" /* list */])(indices))];
                }
            });
        });
    };
    MultiTableVector.prototype.filter = function (callbackfn, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var d, indices;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1:
                        d = _a.sent();
                        indices = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["q" /* argFilter */])(d, callbackfn, thisArg);
                        return [2 /*return*/, this.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["c" /* list */])(indices))];
                }
            });
        });
    };
    return MultiTableVector;
}(__WEBPACK_IMPORTED_MODULE_3__vector_AVector__["a" /* default */]));
/* harmony default export */ __webpack_exports__["a"] = MultiTableVector;


/***/ }),

/***/ 709:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index__ = __webpack_require__(224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__vector_AVector__ = __webpack_require__(641);
/**
 * Created by Samuel Gratzl on 27.12.2016.
 */




/**
 * root matrix implementation holding the data
 * @internal
 */
var TableVector = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](TableVector, _super);
    function TableVector(table, index, desc) {
        var _this = _super.call(this, null) || this;
        _this.table = table;
        _this.index = index;
        _this.column = desc.column;
        _this.root = _this;
        _this.desc = {
            type: 'vector',
            id: table.desc.id + '_' + desc.name,
            name: desc.name,
            description: desc.description || '',
            fqname: table.desc.fqname + '/' + desc.name,
            idtype: table.idtype.id,
            size: table.nrow,
            value: desc.value,
            creator: table.desc.creator,
            ts: table.desc.ts
        };
        return _this;
    }
    Object.defineProperty(TableVector.prototype, "valuetype", {
        get: function () {
            return this.desc.value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TableVector.prototype, "idtype", {
        get: function () {
            return this.table.idtype;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TableVector.prototype, "idtypes", {
        get: function () {
            return [this.idtype];
        },
        enumerable: true,
        configurable: true
    });
    TableVector.prototype.persist = function () {
        return {
            root: this.table.persist(),
            col: this.index
        };
    };
    TableVector.prototype.restore = function (persisted) {
        var r = this;
        if (persisted && persisted.range) { //some view onto it
            r = r.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["g" /* parse */])(persisted.range));
        }
        return r;
    };
    /**
     * access at a specific position
     * @param i
     * @returns {*}
     */
    TableVector.prototype.at = function (i) {
        return this.table.at(i, this.index);
    };
    TableVector.prototype.data = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return this.table.colData(this.column, range);
    };
    TableVector.prototype.names = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return this.table.rows(range);
    };
    TableVector.prototype.ids = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return this.table.rowIds(range);
    };
    TableVector.prototype.size = function () {
        return this.table.nrow;
    };
    TableVector.prototype.sort = function (compareFn, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var d, indices;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1:
                        d = _a.sent();
                        indices = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["p" /* argSort */])(d, compareFn, thisArg);
                        return [2 /*return*/, this.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["c" /* list */])(indices))];
                }
            });
        });
    };
    TableVector.prototype.filter = function (callbackfn, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var d, indices;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1:
                        d = _a.sent();
                        indices = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["q" /* argFilter */])(d, callbackfn, thisArg);
                        return [2 /*return*/, this.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["c" /* list */])(indices))];
                }
            });
        });
    };
    return TableVector;
}(__WEBPACK_IMPORTED_MODULE_3__vector_AVector__["a" /* default */]));
/* harmony default export */ __webpack_exports__["a"] = TableVector;


/***/ }),

/***/ 710:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ajax__ = __webpack_require__(629);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__datatype__ = __webpack_require__(621);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__idtype__ = __webpack_require__(622);
/* harmony export (immutable) */ __webpack_exports__["a"] = adapterOne2Two;
/* unused harmony export viaAPIViewLoader */
/* harmony export (immutable) */ __webpack_exports__["b"] = viaAPI2Loader;
/* harmony export (immutable) */ __webpack_exports__["c"] = viaDataLoader;
/**
 * Created by Samuel Gratzl on 27.12.2016.
 */




function filterObjects(objs, range, desc) {
    if (range.isAll) {
        return objs;
    }
    objs = range.dim(0).filter(objs, desc.size[0]);
    if (range.ndim > 1 && !range.dim(1).isAll) {
        // filter the columns by index
        var toKeep = range.dim(1).filter(desc.columns, desc.columns.length);
        var toKeepNames_1 = toKeep.map(function (col) { return col.column || col.name; });
        return objs.map(function (obj) {
            var r = {};
            toKeepNames_1.forEach(function (key) { return r[key] = obj[key]; });
            return r;
        });
    }
    return objs;
}
/**
 * @internal
 */
function adapterOne2Two(loader) {
    return {
        rowIds: function (desc, range) { return loader(desc).then(function (d) { return range.preMultiply(d.rowIds, desc.size); }); },
        rows: function (desc, range) { return loader(desc).then(function (d) { return range.dim(0).filter(d.rows, desc.size[0]); }); },
        col: function (desc, column, range) { return loader(desc).then(function (d) { return range.filter(d.objs.map(function (d) { return d[column]; }), desc.size); }); },
        objs: function (desc, range) { return loader(desc).then(function (d) { return filterObjects(d.objs, range, desc); }); },
        data: function (desc, range) { return loader(desc).then(function (d) { return range.filter(toFlat(d.objs, desc.columns), desc.size); }); },
        view: function (desc, name, args) {
            throw new Error('not implemented');
        }
    };
}
/**
 * @internal
 */
function viaAPIViewLoader(name, args) {
    var _loader = undefined;
    return function (desc) {
        if (!_loader) { //in the cache
            _loader = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__ajax__["a" /* getAPIJSON */])("/dataset/table/" + desc.id + "/view/" + name, args).then(function (data) {
                data.rowIds = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(data.rowIds);
                data.objs = maskObjects(data.data, desc);
                //mask the data
                return data;
            });
        }
        return _loader;
    };
}
function maskCol(arr, col) {
    //mask data
    if (col.value && (col.value.type === __WEBPACK_IMPORTED_MODULE_2__datatype__["g" /* VALUE_TYPE_INT */] || col.value.type === __WEBPACK_IMPORTED_MODULE_2__datatype__["h" /* VALUE_TYPE_REAL */])) {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__datatype__["j" /* mask */])(arr, col.value);
    }
    return arr;
}
function maskObjects(arr, desc) {
    //mask data
    var maskAble = desc.columns.filter(function (col) { return col.value && (col.value.type === __WEBPACK_IMPORTED_MODULE_2__datatype__["g" /* VALUE_TYPE_INT */] || col.value.type === __WEBPACK_IMPORTED_MODULE_2__datatype__["h" /* VALUE_TYPE_REAL */]); });
    if (maskAble.length > 0) {
        arr.forEach(function (row) {
            maskAble.forEach(function (col) { return row[col.name] = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__datatype__["j" /* mask */])(row[col.name], col.value); });
        });
    }
    return arr;
}
/**
 * @internal
 */
function viaAPI2Loader() {
    var cols = {};
    var rowIds = null, rows = null, objs = null, data = null;
    function fillIds(desc) {
        if (rowIds !== null && rows !== null) {
            Promise.all([rowIds, rows]).then(function (_a) {
                var rowIdValues = _a[0], rowValues = _a[1];
                var idType = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__idtype__["c" /* resolve */])(desc.idtype);
                var rowIds = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(rowIdValues);
                idType.fillMapCache(rowIds.dim(0).asList(rowValues.length), rowValues);
            });
        }
    }
    var r = {
        rowIds: function (desc, range) {
            if (rowIds == null) {
                rowIds = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__ajax__["a" /* getAPIJSON */])("/dataset/table/" + desc.id + "/rowIds").then(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */]);
                fillIds(desc);
            }
            return rowIds.then(function (d) { return d.preMultiply(range, desc.size); });
        },
        rows: function (desc, range) {
            if (rows == null) {
                rows = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__ajax__["a" /* getAPIJSON */])("/dataset/table/" + desc.id + "/rows");
                fillIds(desc);
            }
            return rows.then(function (d) { return range.dim(0).filter(d, desc.size[0]); });
        },
        objs: function (desc, range) {
            if (objs == null && (range.isAll || desc.loadAtOnce)) {
                objs = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__ajax__["a" /* getAPIJSON */])("/dataset/table/" + desc.id + "/raw").then(function (data) { return maskObjects(data, desc); });
            }
            if (range.isAll) {
                return objs;
            }
            if (objs != null) { //already loading all
                return objs.then(function (d) { return range.filter(d, desc.size); });
            }
            //server side slicing
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__ajax__["c" /* getAPIData */])("/dataset/table/" + desc.id + "/raw", { range: range.toString() }).then(function (data) { return maskObjects(data, desc); });
        },
        data: function (desc, range) {
            if (data == null && (range.isAll || desc.loadAtOnce)) {
                data = r.objs(desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])()).then(function (objs) { return toFlat(objs, desc.columns); });
            }
            if (range.isAll) {
                return data;
            }
            if (data != null) { //already loading all
                return data.then(function (d) { return range.filter(d, desc.size); });
            }
            //server side slicing
            return r.objs(desc, range).then(function (objs) { return toFlat(objs, desc.columns); });
        },
        col: function (desc, column, range) {
            var colDesc = desc.columns.find(function (c) { return c.column === column || c.name === column; });
            if (cols[column] == null && (range.isAll || desc.loadAtOnce)) {
                if (objs === null) {
                    if (desc.loadAtOnce) {
                        objs = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__ajax__["a" /* getAPIJSON */])("/dataset/table/" + desc.id + "/raw").then(function (data) { return maskObjects(data, desc); });
                        cols[column] = objs.then(function (objs) { return objs.map(function (row) { return row[column]; }); });
                    }
                    else {
                        cols[column] = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__ajax__["a" /* getAPIJSON */])("/dataset/table/" + desc.id + "/col/" + column).then(function (data) { return maskCol(data, colDesc); });
                    }
                }
                else {
                    cols[column] = objs.then(function (objs) { return objs.map(function (row) { return row[column]; }); });
                }
            }
            if (range.isAll) {
                return cols[column];
            }
            if (cols[column] != null) { //already loading all
                return cols[column].then(function (d) { return filterObjects(d, range, desc); });
            }
            //server side slicing
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__ajax__["c" /* getAPIData */])("/dataset/table/" + desc.id + "/col/" + column, { range: range.toString() }).then(function (data) { return maskCol(data, colDesc); });
        },
        view: function (desc, name, args) { return viaAPIViewLoader(name, args); }
    };
    return r;
}
function toFlat(data, vecs) {
    return data.map(function (row) { return vecs.map(function (col) { return row[col.column]; }); });
}
/**
 * @internal
 */
function viaDataLoader(data, nameProperty) {
    var _data = undefined;
    return function (desc) {
        if (_data) { //in the cache
            return Promise.resolve(_data);
        }
        var name = typeof (nameProperty) === 'function' ? nameProperty : function (d) { return d[nameProperty.toString()]; };
        function toGetter(col) {
            if (col.getter) {
                return col.getter;
            }
            return function (d) { return d[col.column]; };
        }
        var getters = desc.columns.map(toGetter);
        var objs = data.map(function (row) {
            var r = { _: row };
            desc.columns.forEach(function (col, i) {
                r[col.column] = getters[i](row);
            });
            return r;
        });
        var rows = data.map(name);
        _data = {
            rowIds: desc.rowassigner ? desc.rowassigner.map(rows) : __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["i" /* range */])(0, data.length),
            rows: rows,
            objs: objs,
            data: getters.map(function (getter) { return data.map(getter); })
        };
        return Promise.resolve(_data);
    };
}


/***/ }),

/***/ 711:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__index__ = __webpack_require__(224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__datatype__ = __webpack_require__(621);
/* harmony export (immutable) */ __webpack_exports__["a"] = createDefaultVectorDesc;
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */


function createDefaultVectorDesc() {
    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__index__["a" /* mixin */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__datatype__["e" /* createDefaultDataDesc */])(), {
        type: 'vector',
        idtype: '_rows',
        size: 0,
        value: {
            type: 'string'
        }
    });
}


/***/ }),

/***/ 712:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__idtype__ = __webpack_require__(622);
/**
 * Created by Samuel Gratzl on 14.02.2017.
 */



var ProjectedAtom = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](ProjectedAtom, _super);
    function ProjectedAtom(v, f, thisArgument, valuetype, _idtype) {
        if (thisArgument === void 0) { thisArgument = v; }
        if (valuetype === void 0) { valuetype = v.valuetype; }
        if (_idtype === void 0) { _idtype = v.idtype; }
        var _this = _super.call(this) || this;
        _this.v = v;
        _this.f = f;
        _this.thisArgument = thisArgument;
        _this.valuetype = valuetype;
        _this._idtype = _idtype;
        _this.cache = null;
        _this.desc = {
            name: v.desc.name + '-p',
            fqname: v.desc.fqname + '-p',
            type: 'atom',
            id: v.desc.id + '-p',
            idtype: v.idtype,
            value: _this.valuetype,
            description: v.desc.description,
            creator: v.desc.creator,
            ts: v.desc.ts
        };
        return _this;
    }
    ProjectedAtom.prototype.load = function () {
        var _this = this;
        if (this.cache === null) {
            this.cache = Promise.all([this.v.data(), this.v.ids(), this.v.names()]).then(function (arr) {
                return _this.f.apply(_this.thisArgument, arr);
            });
        }
        return this.cache;
    };
    ProjectedAtom.prototype.id = function () {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var d;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.load()];
                    case 1:
                        d = _a.sent();
                        return [2 /*return*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["c" /* list */])(d.id)];
                }
            });
        });
    };
    ProjectedAtom.prototype.name = function () {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var d;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.load()];
                    case 1:
                        d = _a.sent();
                        return [2 /*return*/, d.name];
                }
            });
        });
    };
    ProjectedAtom.prototype.data = function () {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var d;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.load()];
                    case 1:
                        d = _a.sent();
                        return [2 /*return*/, d.value];
                }
            });
        });
    };
    Object.defineProperty(ProjectedAtom.prototype, "dim", {
        get: function () {
            return [1];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProjectedAtom.prototype, "idtype", {
        get: function () {
            return this._idtype;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProjectedAtom.prototype, "idtypes", {
        get: function () {
            return [this._idtype];
        },
        enumerable: true,
        configurable: true
    });
    ProjectedAtom.prototype.ids = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(range);
        if (range.isNone) {
            return Promise.resolve(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["d" /* none */])());
        }
        return this.id();
    };
    ProjectedAtom.prototype.idView = function (idRange) {
        return Promise.resolve(this);
    };
    ProjectedAtom.prototype.persist = function () {
        return {
            root: this.v.persist(),
            f: this.f.toString(),
            valuetype: this.valuetype === this.v.valuetype ? undefined : this.valuetype,
            idtype: this.idtype === this.v.idtype ? undefined : this.idtype.name
        };
    };
    ProjectedAtom.prototype.restore = function (persisted) {
        return this;
    };
    return ProjectedAtom;
}(__WEBPACK_IMPORTED_MODULE_2__idtype__["d" /* SelectAble */]));
/* harmony default export */ __webpack_exports__["a"] = ProjectedAtom;


/***/ }),

/***/ 713:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__datatype__ = __webpack_require__(621);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__math__ = __webpack_require__(633);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__stratification_StratificationGroup__ = __webpack_require__(689);
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */





/**
 * root matrix implementation holding the data
 * @internal
 */
var StratificationVector = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __extends */](StratificationVector, _super);
    function StratificationVector(v, r) {
        var _this = _super.call(this, {
            id: v.desc.id + '-s',
            name: v.desc.name,
            description: v.desc.description,
            creator: v.desc.creator,
            ts: v.desc.ts,
            fqname: v.desc.fqname,
            type: 'stratification',
            idtype: v.idtype.id,
            size: v.length,
            ngroups: r.groups.length,
            groups: r.groups.map(function (ri) { return ({ name: ri.name, color: ri.color, size: ri.length }); })
        }) || this;
        _this.v = v;
        _this.r = r;
        return _this;
    }
    Object.defineProperty(StratificationVector.prototype, "idtype", {
        get: function () {
            return this.v.idtype;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StratificationVector.prototype, "groups", {
        get: function () {
            return this.desc.groups;
        },
        enumerable: true,
        configurable: true
    });
    StratificationVector.prototype.group = function (group) {
        return new __WEBPACK_IMPORTED_MODULE_4__stratification_StratificationGroup__["a" /* default */](this, group, this.groups[group]);
    };
    StratificationVector.prototype.hist = function (bins, range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var _a;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = __WEBPACK_IMPORTED_MODULE_3__math__["b" /* rangeHist */];
                        return [4 /*yield*/, this.range()];
                    case 1: 
                    // FIXME unused parameter
                    return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                }
            });
        });
    };
    StratificationVector.prototype.vector = function () {
        return this.asVector();
    };
    StratificationVector.prototype.asVector = function () {
        return Promise.resolve(this.v);
    };
    StratificationVector.prototype.origin = function () {
        return this.asVector();
    };
    StratificationVector.prototype.range = function () {
        return Promise.resolve(this.r);
    };
    StratificationVector.prototype.idRange = function () {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function () {
            var ids;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ids()];
                    case 1:
                        ids = _a.sent();
                        return [2 /*return*/, ids.dim(0).preMultiply(this.r, this.dim[0])];
                }
            });
        });
    };
    StratificationVector.prototype.names = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.v.names(range);
    };
    StratificationVector.prototype.ids = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.v.ids(range);
    };
    Object.defineProperty(StratificationVector.prototype, "idtypes", {
        get: function () {
            return [this.idtype];
        },
        enumerable: true,
        configurable: true
    });
    StratificationVector.prototype.size = function () {
        return this.desc.size;
    };
    Object.defineProperty(StratificationVector.prototype, "length", {
        get: function () {
            return this.size();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StratificationVector.prototype, "ngroups", {
        get: function () {
            return this.groups.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StratificationVector.prototype, "dim", {
        get: function () {
            return [this.size()];
        },
        enumerable: true,
        configurable: true
    });
    StratificationVector.prototype.persist = function () {
        return {
            root: this.v.persist(),
            asstrat: true
        };
    };
    return StratificationVector;
}(__WEBPACK_IMPORTED_MODULE_2__datatype__["a" /* ADataType */]));
/* harmony default export */ __webpack_exports__["a"] = StratificationVector;


/***/ }),

/***/ 714:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ajax__ = __webpack_require__(629);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(619);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__datatype__ = __webpack_require__(621);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__idtype__ = __webpack_require__(622);
/* harmony export (immutable) */ __webpack_exports__["a"] = viaAPILoader;
/* harmony export (immutable) */ __webpack_exports__["b"] = viaDataLoader;
/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */




/**
 * @internal
 */
function viaAPILoader() {
    var _loader = undefined;
    return function (desc) {
        if (_loader) { //in the cache
            return _loader;
        }
        return _loader = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__ajax__["a" /* getAPIJSON */])('/dataset/' + desc.id).then(function (data) {
            var range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(data.rowIds);
            data.rowIds = range;
            data.data = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__datatype__["j" /* mask */])(data.data, desc.value);
            var idType = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__idtype__["c" /* resolve */])(desc.idtype);
            idType.fillMapCache(range.dim(0).asList(data.rows.length), data.rows);
            return data;
        });
    };
}
/**
 * @internal
 */
function viaDataLoader(rows, rowIds, data) {
    var _data = undefined;
    return function () {
        if (_data) { //in the cache
            return Promise.resolve(_data);
        }
        _data = {
            rowIds: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* parse */])(rowIds),
            rows: rows,
            data: data
        };
        return Promise.resolve(_data);
    };
}


/***/ })

});