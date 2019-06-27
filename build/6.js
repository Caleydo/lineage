/*! lineage - v1.0.0-20190527-190114 - 2019
* https://phovea.caleydo.org
* Copyright (c) 2019 Carolina Nobre; Licensed BSD-3-Clause*/

webpackJsonp([6,9],{

/***/ 607:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__datatype__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__index__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__idtype__ = __webpack_require__(225);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__IMatrix__ = __webpack_require__(721);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__AMatrix__ = __webpack_require__(690);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__internal_TransposedMatrix__ = __webpack_require__(725);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__loader__ = __webpack_require__(726);
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](Matrix, _super);
    function Matrix(desc, loader) {
        var _this = _super.call(this, null) || this;
        _this.desc = desc;
        _this.loader = loader;
        _this.root = _this;
        _this.valuetype = desc.value;
        _this.rowtype = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__idtype__["e" /* resolve */])(desc.rowtype);
        _this.coltype = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__idtype__["e" /* resolve */])(desc.coltype);
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
        return this.loader.data(this.desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range));
    };
    Matrix.prototype.ids = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.loader.ids(this.desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range));
    };
    /**
     * return the column ids of the matrix
     * @returns {*}
     */
    Matrix.prototype.cols = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.loader.cols(this.desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range));
    };
    Matrix.prototype.colIds = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.loader.colIds(this.desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range));
    };
    /**
     * return the row ids of the matrix
     * @returns {*}
     */
    Matrix.prototype.rows = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.loader.rows(this.desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range));
    };
    Matrix.prototype.rowIds = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.loader.rowIds(this.desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range));
    };
    Matrix.prototype.hist = function (bins, range, containedIds) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        if (containedIds === void 0) { containedIds = 0; }
        if (this.loader.numericalHist && (this.valuetype.type === __WEBPACK_IMPORTED_MODULE_2__datatype__["c" /* VALUE_TYPE_REAL */] || this.valuetype.type === __WEBPACK_IMPORTED_MODULE_2__datatype__["b" /* VALUE_TYPE_INT */])) { // use loader for hist
            return this.loader.numericalHist(this.desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range), bins);
        }
        // compute
        return _super.prototype.hist.call(this, bins, range, containedIds);
    };
    Matrix.prototype.stats = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        if (this.loader.numericalStats && (this.valuetype.type === __WEBPACK_IMPORTED_MODULE_2__datatype__["c" /* VALUE_TYPE_REAL */] || this.valuetype.type === __WEBPACK_IMPORTED_MODULE_2__datatype__["b" /* VALUE_TYPE_INT */])) { // use loader for hist
            return this.loader.numericalStats(this.desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range));
        }
        // compute
        return _super.prototype.stats.call(this, range);
    };
    Matrix.prototype.statsAdvanced = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        if (this.loader.numericalStats && (this.valuetype.type === __WEBPACK_IMPORTED_MODULE_2__datatype__["c" /* VALUE_TYPE_REAL */] || this.valuetype.type === __WEBPACK_IMPORTED_MODULE_2__datatype__["b" /* VALUE_TYPE_INT */])) { // use loader for hist
            return this.loader.numericalStats(this.desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range));
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
    var valueType = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__datatype__["f" /* guessValueTypeDesc */])([].concat.apply([], realData));
    if (valueType.type === __WEBPACK_IMPORTED_MODULE_2__datatype__["c" /* VALUE_TYPE_REAL */]) {
        realData = realData.map(function (row) { return row.map(parseFloat); });
    }
    else if (valueType.type === __WEBPACK_IMPORTED_MODULE_2__datatype__["c" /* VALUE_TYPE_REAL */]) {
        realData = realData.map(function (row) { return row.map(parseInt); });
    }
    var desc = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__index__["a" /* mixin */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__IMatrix__["a" /* createDefaultMatrixDesc */])(), {
        size: [rows.length, cols.length],
        value: valueType
    }, options);
    var rowAssigner = options.rowassigner || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__idtype__["d" /* createLocalAssigner */])();
    var colAssigner = options.rowassigner || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__idtype__["d" /* createLocalAssigner */])();
    var loader = {
        rowIds: function (desc, range) { return Promise.resolve(rowAssigner(range.filter(rows))); },
        colIds: function (desc, range) { return Promise.resolve(colAssigner(range.filter(cols))); },
        ids: function (desc, range) {
            var rc = rowAssigner(range.dim(0).filter(rows));
            var cc = colAssigner(range.dim(1).filter(cols));
            return Promise.resolve(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["c" /* join */])(rc, cc));
        },
        at: function (desc, i, j) { return Promise.resolve(realData[i][j]); },
        rows: function (desc, range) { return Promise.resolve(range.filter(rows)); },
        cols: function (desc, range) { return Promise.resolve(range.filter(cols)); },
        data: function (desc, range) { return Promise.resolve(range.filter(realData)); }
    };
    return new Matrix(desc, loader);
}


/***/ }),

/***/ 634:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__index__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__idtype__ = __webpack_require__(225);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__datatype__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__math__ = __webpack_require__(227);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__internal_StratificationVector__ = __webpack_require__(657);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__internal_ProjectedAtom__ = __webpack_require__(656);
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](AVector, _super);
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
        return new VectorView(this.root, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range));
    };
    AVector.prototype.idView = function (idRange) {
        if (idRange === void 0) { idRange = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var ids;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ids()];
                    case 1:
                        ids = _a.sent();
                        return [2 /*return*/, this.view(ids.indexOf(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(idRange)))];
                }
            });
        });
    };
    AVector.prototype.stats = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var _a;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.root.valuetype.type !== __WEBPACK_IMPORTED_MODULE_4__datatype__["b" /* VALUE_TYPE_INT */] && this.root.valuetype.type !== __WEBPACK_IMPORTED_MODULE_4__datatype__["c" /* VALUE_TYPE_REAL */]) {
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var _a;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.root.valuetype.type !== __WEBPACK_IMPORTED_MODULE_4__datatype__["b" /* VALUE_TYPE_INT */] && this.root.valuetype.type !== __WEBPACK_IMPORTED_MODULE_4__datatype__["c" /* VALUE_TYPE_REAL */]) {
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var v, vc, d, options, vcc;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        v = this.root.valuetype;
                        if (!(v.type === __WEBPACK_IMPORTED_MODULE_4__datatype__["a" /* VALUE_TYPE_CATEGORICAL */])) return [3 /*break*/, 2];
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
                    case 2: return [2 /*return*/, Promise.resolve(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* composite */])(this.root.desc.id, [__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["j" /* asUngrouped */])(this.indices.dim(0))]))];
                }
            });
        });
    };
    AVector.prototype.stratification = function () {
        return this.asStratification();
    };
    AVector.prototype.asStratification = function () {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var _a, _b;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_c) {
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var v, d, vc, vn;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        v = this.root.valuetype;
                        return [4 /*yield*/, this.data(range)];
                    case 1:
                        d = _a.sent();
                        switch (v.type) {
                            case __WEBPACK_IMPORTED_MODULE_4__datatype__["a" /* VALUE_TYPE_CATEGORICAL */]:
                                vc = v;
                                return [2 /*return*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__math__["e" /* categoricalHist */])(d, this.indices.dim(0), d.length, vc.categories.map(function (d) { return typeof d === 'string' ? d : d.name; }), vc.categories.map(function (d) { return typeof d === 'string' ? d : d.label || d.name; }), vc.categories.map(function (d) { return typeof d === 'string' ? 'gray' : d.color || 'gray'; }))];
                            case __WEBPACK_IMPORTED_MODULE_4__datatype__["c" /* VALUE_TYPE_REAL */]:
                            case __WEBPACK_IMPORTED_MODULE_4__datatype__["b" /* VALUE_TYPE_INT */]:
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1: return [2 /*return*/, (_a.sent()).every(callbackfn, thisArg)];
                }
            });
        });
    };
    AVector.prototype.some = function (callbackfn, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1: return [2 /*return*/, (_a.sent()).some(callbackfn, thisArg)];
                }
            });
        });
    };
    AVector.prototype.forEach = function (callbackfn, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            function helper() {
                return callbackfn.apply(thisArg, Array.from(arguments));
            }
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1: return [2 /*return*/, (_a.sent()).reduce(helper, initialValue)];
                }
            });
        });
    };
    AVector.prototype.reduceRight = function (callbackfn, initialValue, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            function helper() {
                return callbackfn.apply(thisArg, Array.from(arguments));
            }
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
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
            return this.reduceAtom(eval(persisted.f), this, persisted.valuetype, persisted.idtype ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__idtype__["e" /* resolve */])(persisted.idtype) : undefined);
            /* tslint:enable:no-eval */
        }
        else if (persisted && persisted.range) { //some view onto it
            r = r.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(persisted.range));
        }
        return r;
    };
    return AVector;
}(__WEBPACK_IMPORTED_MODULE_3__idtype__["a" /* SelectAble */]));

/* harmony default export */ __webpack_exports__["a"] = AVector;
/**
 * view on the vector restricted by a range
 * @internal
 */
var VectorView = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](VectorView, _super);
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
        return this.root.data(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range), this.root.dim));
    };
    VectorView.prototype.names = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.root.names(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range), this.root.dim));
    };
    VectorView.prototype.ids = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.root.ids(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range), this.root.dim));
    };
    VectorView.prototype.view = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        var r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range);
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var d, indices;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1:
                        d = _a.sent();
                        indices = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__index__["l" /* argSort */])(d, compareFn, thisArg);
                        return [2 /*return*/, this.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["b" /* list */])(indices))];
                }
            });
        });
    };
    VectorView.prototype.filter = function (callbackfn, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var d, indices;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1:
                        d = _a.sent();
                        indices = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__index__["m" /* argFilter */])(d, callbackfn, thisArg);
                        return [2 /*return*/, this.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["b" /* list */])(indices))];
                }
            });
        });
    };
    return VectorView;
}(AVector));



/***/ }),

/***/ 649:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__idtype__ = __webpack_require__(225);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__math__ = __webpack_require__(227);
/**
 * Created by sam on 26.12.2016.
 */




/**
 * root matrix implementation holding the data
 * @internal
 */
var StratificationGroup = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](StratificationGroup, _super);
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var _a;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_b) {
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
        return Promise.all([this.root.asVector(), this.rangeGroup()]).then(function (arr) { return arr[0].view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["b" /* list */])(arr[1])); });
    };
    StratificationGroup.prototype.origin = function () {
        return this.root.origin();
    };
    StratificationGroup.prototype.range = function () {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var g;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var r, g;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var r;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var g, r;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.rangeGroup()];
                    case 1:
                        g = _a.sent();
                        r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["b" /* list */])(g).preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range));
                        return [2 /*return*/, this.root.names(r)];
                }
            });
        });
    };
    StratificationGroup.prototype.ids = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var g, r;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.rangeGroup()];
                    case 1:
                        g = _a.sent();
                        r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["b" /* list */])(g).preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range));
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
}(__WEBPACK_IMPORTED_MODULE_2__idtype__["a" /* SelectAble */]));
/* harmony default export */ __webpack_exports__["a"] = StratificationGroup;


/***/ }),

/***/ 656:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__idtype__ = __webpack_require__(225);
/**
 * Created by Samuel Gratzl on 14.02.2017.
 */



var ProjectedAtom = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](ProjectedAtom, _super);
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var d;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.load()];
                    case 1:
                        d = _a.sent();
                        return [2 /*return*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["b" /* list */])(d.id)];
                }
            });
        });
    };
    ProjectedAtom.prototype.name = function () {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var d;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var d;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
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
        range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range);
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
}(__WEBPACK_IMPORTED_MODULE_2__idtype__["a" /* SelectAble */]));
/* harmony default export */ __webpack_exports__["a"] = ProjectedAtom;


/***/ }),

/***/ 657:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__datatype__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__math__ = __webpack_require__(227);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__stratification_StratificationGroup__ = __webpack_require__(649);
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](StratificationVector, _super);
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var _a;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_b) {
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var ids;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
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
}(__WEBPACK_IMPORTED_MODULE_2__datatype__["h" /* ADataType */]));
/* harmony default export */ __webpack_exports__["a"] = StratificationVector;


/***/ }),

/***/ 690:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__idtype__ = __webpack_require__(225);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__idtype_AProductSelectAble__ = __webpack_require__(231);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__datatype__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__math__ = __webpack_require__(227);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__internal_SliceColVector__ = __webpack_require__(723);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__internal_ProjectedVector__ = __webpack_require__(722);
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](AMatrix, _super);
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
        var r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range);
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var v, _a, _b, _c;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_d) {
                switch (_d.label) {
                    case 0:
                        v = this.root.valuetype;
                        if (!(v.type === __WEBPACK_IMPORTED_MODULE_4__datatype__["b" /* VALUE_TYPE_INT */] || v.type === __WEBPACK_IMPORTED_MODULE_4__datatype__["c" /* VALUE_TYPE_REAL */])) return [3 /*break*/, 2];
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var v, _a, _b, _c, _d;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_e) {
                switch (_e.label) {
                    case 0:
                        v = this.root.valuetype;
                        if (!(v.type === __WEBPACK_IMPORTED_MODULE_4__datatype__["b" /* VALUE_TYPE_INT */] || v.type === __WEBPACK_IMPORTED_MODULE_4__datatype__["c" /* VALUE_TYPE_REAL */])) return [3 /*break*/, 2];
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var v, d, flat, vc, vn;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        v = this.root.valuetype;
                        return [4 /*yield*/, this.data(range)];
                    case 1:
                        d = _a.sent();
                        flat = flatten(d, this.indices, containedIds);
                        switch (v.type) {
                            case __WEBPACK_IMPORTED_MODULE_4__datatype__["a" /* VALUE_TYPE_CATEGORICAL */]:
                                vc = v;
                                return [2 /*return*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__math__["e" /* categoricalHist */])(flat.data, flat.indices, flat.data.length, vc.categories.map(function (d) { return typeof d === 'string' ? d : d.name; }), vc.categories.map(function (d) { return typeof d === 'string' ? d : d.label || d.name; }), vc.categories.map(function (d) { return typeof d === 'string' ? 'gray' : d.color || 'gray'; }))];
                            case __WEBPACK_IMPORTED_MODULE_4__datatype__["b" /* VALUE_TYPE_INT */]:
                            case __WEBPACK_IMPORTED_MODULE_4__datatype__["c" /* VALUE_TYPE_REAL */]:
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var r, ids;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(idRange);
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
            return this.reduce(eval(persisted.f), this, persisted.valuetype, persisted.idtype ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__idtype__["e" /* resolve */])(persisted.idtype) : undefined);
            /* tslint:enable:no-eval */
        }
        else if (persisted && persisted.range) { //some view onto it
            return this.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(persisted.range));
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](MatrixView, _super);
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
        return this.root.ids(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range), this.root.dim));
    };
    MatrixView.prototype.cols = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.root.cols(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range), this.root.dim));
    };
    MatrixView.prototype.colIds = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.root.colIds(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range), this.root.dim));
    };
    MatrixView.prototype.rows = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.root.rows(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range), this.root.dim));
    };
    MatrixView.prototype.rowIds = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.root.rowIds(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range), this.root.dim));
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
        return this.root.data(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range), this.root.dim));
    };
    MatrixView.prototype.hist = function (bins, range, containedIds) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        if (containedIds === void 0) { containedIds = 0; }
        return this.root.hist(bins, this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range), this.root.dim), containedIds);
    };
    MatrixView.prototype.stats = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.root.stats(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range), this.root.dim));
    };
    MatrixView.prototype.statsAdvanced = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.root.statsAdvanced(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range), this.root.dim));
    };
    MatrixView.prototype.heatmapUrl = function (range, options) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        if (options === void 0) { options = {}; }
        return this.root.heatmapUrl(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range), this.root.dim), options);
    };
    MatrixView.prototype.view = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        var r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range);
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

/***/ 721:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__datatype__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index__ = __webpack_require__(14);
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
    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["a" /* mixin */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__datatype__["g" /* createDefaultDataDesc */])(), {
        type: 'matrix',
        rowtype: '_rows',
        coltype: '_cols',
        size: [0, 0]
    });
}


/***/ }),

/***/ 722:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__range__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__vector_AVector__ = __webpack_require__(634);
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](ProjectedVector, _super);
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
            r = r.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["h" /* parse */])(persisted.range));
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var d;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.m.data(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["b" /* list */])(i))];
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.m.data(range)];
                    case 1: return [2 /*return*/, (_a.sent()).map(this.f, this.thisArgument)];
                }
            });
        });
    };
    ProjectedVector.prototype.sort = function (compareFn, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var d, indices;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1:
                        d = _a.sent();
                        indices = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["l" /* argSort */])(d, compareFn, thisArg);
                        return [2 /*return*/, this.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["b" /* list */])(indices))];
                }
            });
        });
    };
    ProjectedVector.prototype.filter = function (callbackfn, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var d, indices;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1:
                        d = _a.sent();
                        indices = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["m" /* argFilter */])(d, callbackfn, thisArg);
                        return [2 /*return*/, this.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["b" /* list */])(indices))];
                }
            });
        });
    };
    return ProjectedVector;
}(__WEBPACK_IMPORTED_MODULE_3__vector_AVector__["a" /* default */]));
/* harmony default export */ __webpack_exports__["a"] = ProjectedVector;


/***/ }),

/***/ 723:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__range__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__vector_AVector__ = __webpack_require__(634);
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](SliceColVector, _super);
    function SliceColVector(m, col) {
        var _this = _super.call(this, null) || this;
        _this.m = m;
        _this.col = col;
        _this.colRange = __WEBPACK_IMPORTED_MODULE_2__range__["f" /* Range1D */].from([_this.col]);
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
            r = r.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["h" /* parse */])(persisted.range));
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var rr, r, d;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        rr = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["h" /* parse */])(range);
                        r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["b" /* list */])(rr.dim(0), this.colRange);
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var d, indices;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1:
                        d = _a.sent();
                        indices = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["l" /* argSort */])(d, compareFn, thisArg);
                        return [2 /*return*/, this.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["b" /* list */])(indices))];
                }
            });
        });
    };
    SliceColVector.prototype.filter = function (callbackfn, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var d, indices;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1:
                        d = _a.sent();
                        indices = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["m" /* argFilter */])(d, callbackfn, thisArg);
                        return [2 /*return*/, this.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["b" /* list */])(indices))];
                }
            });
        });
    };
    return SliceColVector;
}(__WEBPACK_IMPORTED_MODULE_3__vector_AVector__["a" /* default */]));
/* harmony default export */ __webpack_exports__["a"] = SliceColVector;


/***/ }),

/***/ 724:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__range__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__vector_AVector__ = __webpack_require__(634);
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](SliceRowVector, _super);
    function SliceRowVector(m, row) {
        var _this = _super.call(this, null) || this;
        _this.m = m;
        _this.row = row;
        _this.rowRange = __WEBPACK_IMPORTED_MODULE_2__range__["f" /* Range1D */].from([_this.row]);
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
            r = r.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["h" /* parse */])(persisted.range));
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var rr, r, d;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        rr = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["h" /* parse */])(range);
                        r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["b" /* list */])(this.rowRange, rr.dim(0));
                        return [4 /*yield*/, this.m.data(r)];
                    case 1:
                        d = _a.sent();
                        return [2 /*return*/, d[0]];
                }
            });
        });
    };
    SliceRowVector.prototype.sort = function (compareFn, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var d, indices;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1:
                        d = _a.sent();
                        indices = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["l" /* argSort */])(d, compareFn, thisArg);
                        return [2 /*return*/, this.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["b" /* list */])(indices))];
                }
            });
        });
    };
    SliceRowVector.prototype.filter = function (callbackfn, thisArg) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var d, indices;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.data()];
                    case 1:
                        d = _a.sent();
                        indices = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["m" /* argFilter */])(d, callbackfn, thisArg);
                        return [2 /*return*/, this.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["b" /* list */])(indices))];
                }
            });
        });
    };
    return SliceRowVector;
}(__WEBPACK_IMPORTED_MODULE_3__vector_AVector__["a" /* default */]));
/* harmony default export */ __webpack_exports__["a"] = SliceRowVector;


/***/ }),

/***/ 725:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__datatype__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__AMatrix__ = __webpack_require__(690);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__SliceRowVector__ = __webpack_require__(724);
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](TransposedMatrix, _super);
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var ids;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.t.ids(range ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range).swap() : undefined)];
                    case 1:
                        ids = _a.sent();
                        return [2 /*return*/, ids.swap()];
                }
            });
        });
    };
    TransposedMatrix.prototype.cols = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.t.rows(range ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range).swap() : undefined);
    };
    TransposedMatrix.prototype.colIds = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.t.rowIds(range ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range).swap() : undefined);
    };
    TransposedMatrix.prototype.rows = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.t.cols(range ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range).swap() : undefined);
    };
    TransposedMatrix.prototype.rowIds = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.t.colIds(range ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range).swap() : undefined);
    };
    TransposedMatrix.prototype.view = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        var r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range);
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var _a;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = __WEBPACK_IMPORTED_MODULE_2__datatype__["k" /* transpose */];
                        return [4 /*yield*/, this.t.data(range ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range).swap() : undefined)];
                    case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                }
            });
        });
    };
    TransposedMatrix.prototype.hist = function (bins, range, containedIds) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        if (containedIds === void 0) { containedIds = 0; }
        return this.t.hist(bins, range ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range).swap() : undefined, 1 - containedIds);
    };
    TransposedMatrix.prototype.stats = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.t.stats(range ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range).swap() : undefined);
    };
    TransposedMatrix.prototype.statsAdvanced = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.t.statsAdvanced(range ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range).swap() : undefined);
    };
    TransposedMatrix.prototype.heatmapUrl = function (range, options) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        if (options === void 0) { options = {}; }
        options.transpose = options.transpose !== true;
        return this.t.heatmapUrl(range ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range).swap() : undefined, options);
    };
    return TransposedMatrix;
}(__WEBPACK_IMPORTED_MODULE_3__AMatrix__["a" /* default */]));
/* harmony default export */ __webpack_exports__["a"] = TransposedMatrix;


/***/ }),

/***/ 726:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ajax__ = __webpack_require__(50);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__datatype__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__math__ = __webpack_require__(227);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__idtype__ = __webpack_require__(225);
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
    if (desc.value.type === __WEBPACK_IMPORTED_MODULE_2__datatype__["b" /* VALUE_TYPE_INT */] || desc.value.type === __WEBPACK_IMPORTED_MODULE_2__datatype__["c" /* VALUE_TYPE_REAL */]) {
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
                var idType = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__idtype__["e" /* resolve */])(desc.rowtype);
                var rowIds = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(rowIdValues);
                idType.fillMapCache(rowIds.dim(0).asList(rowValues.length), rowValues);
            });
        }
    }
    function fillColumnIds(desc) {
        if (colIds !== null && cols !== null) {
            Promise.all([colIds, cols]).then(function (_a) {
                var colIdValues = _a[0], colValues = _a[1];
                var idType = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__idtype__["e" /* resolve */])(desc.coltype);
                var colIds = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(colIdValues);
                idType.fillMapCache(colIds.dim(0).asList(colValues.length), colValues);
            });
        }
    }
    var r = {
        rowIds: function (desc, range) {
            if (rowIds == null) {
                rowIds = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__ajax__["a" /* getAPIJSON */])("/dataset/matrix/" + desc.id + "/rowIds").then(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */]);
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
                colIds = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__ajax__["a" /* getAPIJSON */])("/dataset/matrix/" + desc.id + "/colIds").then(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */]);
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
            return Promise.all([r.rowIds(desc, split[0] || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])()), r.colIds(desc, split[1] || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])())]).then(__WEBPACK_IMPORTED_MODULE_1__range__["c" /* join */]);
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
        at: function (desc, i, j) { return r.data(desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["b" /* list */])([i], [j])).then(function (data) { return maskIt(desc)(data[0][0]); }); },
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


/***/ })

});