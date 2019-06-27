/*! lineage - v1.0.0-20190527-190114 - 2019
* https://phovea.caleydo.org
* Copyright (c) 2019 Carolina Nobre; Licensed BSD-3-Clause*/

webpackJsonp([7,9],{

/***/ 610:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__range__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__idtype__ = __webpack_require__(225);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__datatype__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ITable__ = __webpack_require__(731);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__ATable__ = __webpack_require__(730);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__internal_TableVector__ = __webpack_require__(733);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__loader__ = __webpack_require__(734);
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](Table, _super);
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
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__idtype__["e" /* resolve */])(this.desc.idtype || this.desc.rowtype);
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
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["h" /* parse */])(range).filter(this.vectors, [this.ncol]);
    };
    Table.prototype.at = function (row, col) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.colData(this.col(col).column, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["b" /* list */])(row))];
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
        return this.loader.data(this.desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["h" /* parse */])(range));
    };
    Table.prototype.colData = function (column, range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return this.dataOfColumn(column, range);
    };
    Table.prototype.dataOfColumn = function (column, range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return this.loader.col(this.desc, column, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["h" /* parse */])(range));
    };
    Table.prototype.objects = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return this.loader.objs(this.desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["h" /* parse */])(range));
    };
    Table.prototype.rows = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return this.loader.rows(this.desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["h" /* parse */])(range));
    };
    Table.prototype.rowIds = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return this.loader.rowIds(this.desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["h" /* parse */])(range));
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
    var rowAssigner = options.rowassigner || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__idtype__["d" /* createLocalAssigner */])();
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
            value: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__datatype__["f" /* guessValueTypeDesc */])(tableData.map(function (row) { return row[i]; }))
        };
    });
    var realData = tableData.map(function (row) { return columns.map(function (col, i) { return (col.value.type === __WEBPACK_IMPORTED_MODULE_4__datatype__["c" /* VALUE_TYPE_REAL */] || col.value.type === __WEBPACK_IMPORTED_MODULE_4__datatype__["b" /* VALUE_TYPE_INT */]) ? parseFloat(row[i]) : row[i]; }); });
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
            value: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__datatype__["f" /* guessValueTypeDesc */])(realData.map(function (row) { return row[i]; }))
        };
    });
    return asTableImpl(columns, rows, objs, realData, options);
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

/***/ 730:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__idtype__ = __webpack_require__(225);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__internal_MultiTableVector__ = __webpack_require__(732);
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](ATable, _super);
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
        return new TableView(this.root, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range));
    };
    ATable.prototype.idView = function (idRange) {
        if (idRange === void 0) { idRange = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var _a;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.view;
                        return [4 /*yield*/, this.ids()];
                    case 1: return [2 /*return*/, _a.apply(this, [(_b.sent()).indexOf(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(idRange))])];
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
            return this.reduce(eval(persisted.f), this, persisted.valuetype, persisted.idtype ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__idtype__["e" /* resolve */])(persisted.idtype) : undefined);
            /* tslint:enable:no-eval */
        }
        else if (persisted && persisted.range) { //some view onto it
            return this.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(persisted.range));
        }
        else {
            return this;
        }
    };
    return ATable;
}(__WEBPACK_IMPORTED_MODULE_2__idtype__["a" /* SelectAble */]));

/* harmony default export */ __webpack_exports__["a"] = ATable;
// circular dependency thus not extractable
/**
 * @internal
 */
var TableView = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](TableView, _super);
    function TableView(root, range) {
        var _this = _super.call(this, root) || this;
        _this.range = range;
        _this.range = range;
        _this.vectors = _this.root.cols(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["b" /* list */])(range.dim(1))).map(function (v) { return v.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["b" /* list */])(range.dim(0))); });
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
            r = r.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(persisted.range));
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
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range).filter(this.vectors, [this.ncol]);
    };
    TableView.prototype.data = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.root.data(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range), this.root.dim));
    };
    TableView.prototype.colData = function (column, range) {
        return this.dataOfColumn(column, range);
    };
    TableView.prototype.dataOfColumn = function (column, range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        // since we directly accessing the column by name there is no need for the column part of the range
        var rowRange = this.range.dim(0).preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range).dim(0), this.root.dim[0]);
        return this.root.dataOfColumn(column, new __WEBPACK_IMPORTED_MODULE_1__range__["l" /* Range */]([rowRange]));
    };
    TableView.prototype.objects = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.root.objects(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range), this.root.dim));
    };
    TableView.prototype.rows = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.root.rows(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range), this.root.dim));
    };
    TableView.prototype.rowIds = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.root.rowIds(this.range.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range), this.root.dim));
    };
    TableView.prototype.ids = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        return this.rowIds(range);
    };
    TableView.prototype.view = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["a" /* all */])(); }
        var r = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(range);
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

/***/ 731:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__index__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__datatype__ = __webpack_require__(19);
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
    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__index__["a" /* mixin */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__datatype__["g" /* createDefaultDataDesc */])(), {
        type: 'table',
        idtype: '_rows',
        columns: [],
        size: [0, 0]
    });
}


/***/ }),

/***/ 732:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__range__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__vector_AVector__ = __webpack_require__(634);
/**
 * Created by Samuel Gratzl on 27.12.2016.
 */




/**
 * @internal
 */
var MultiTableVector = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](MultiTableVector, _super);
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
            id: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__index__["h" /* fixId */])(table.desc.id + '-p' + f.toString()),
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
            r = r.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["h" /* parse */])(persisted.range));
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var _a, _b, _c;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _b = (_a = this.f).call;
                        _c = [this.thisArgument];
                        return [4 /*yield*/, this.table.data(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["b" /* list */])(i))];
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.table.data(range)];
                    case 1: return [2 /*return*/, (_a.sent()).map(this.f, this.thisArgument)];
                }
            });
        });
    };
    MultiTableVector.prototype.sort = function (compareFn, thisArg) {
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
    MultiTableVector.prototype.filter = function (callbackfn, thisArg) {
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
    return MultiTableVector;
}(__WEBPACK_IMPORTED_MODULE_3__vector_AVector__["a" /* default */]));
/* harmony default export */ __webpack_exports__["a"] = MultiTableVector;


/***/ }),

/***/ 733:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__range__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__vector_AVector__ = __webpack_require__(634);
/**
 * Created by Samuel Gratzl on 27.12.2016.
 */




/**
 * root matrix implementation holding the data
 * @internal
 */
var TableVector = /** @class */ (function (_super) {
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](TableVector, _super);
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
            r = r.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["h" /* parse */])(persisted.range));
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
    TableVector.prototype.filter = function (callbackfn, thisArg) {
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
    return TableVector;
}(__WEBPACK_IMPORTED_MODULE_3__vector_AVector__["a" /* default */]));
/* harmony default export */ __webpack_exports__["a"] = TableVector;


/***/ }),

/***/ 734:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ajax__ = __webpack_require__(50);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__datatype__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__idtype__ = __webpack_require__(225);
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
                data.rowIds = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(data.rowIds);
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
    if (col.value && (col.value.type === __WEBPACK_IMPORTED_MODULE_2__datatype__["b" /* VALUE_TYPE_INT */] || col.value.type === __WEBPACK_IMPORTED_MODULE_2__datatype__["c" /* VALUE_TYPE_REAL */])) {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__datatype__["j" /* mask */])(arr, col.value);
    }
    return arr;
}
function maskObjects(arr, desc) {
    //mask data
    var maskAble = desc.columns.filter(function (col) { return col.value && (col.value.type === __WEBPACK_IMPORTED_MODULE_2__datatype__["b" /* VALUE_TYPE_INT */] || col.value.type === __WEBPACK_IMPORTED_MODULE_2__datatype__["c" /* VALUE_TYPE_REAL */]); });
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
                var idType = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__idtype__["e" /* resolve */])(desc.idtype);
                var rowIds = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(rowIdValues);
                idType.fillMapCache(rowIds.dim(0).asList(rowValues.length), rowValues);
            });
        }
    }
    var r = {
        rowIds: function (desc, range) {
            if (rowIds == null) {
                rowIds = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__ajax__["a" /* getAPIJSON */])("/dataset/table/" + desc.id + "/rowIds").then(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */]);
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


/***/ })

});