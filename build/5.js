/*! lineage - v1.0.0-20190527-190114 - 2019
* https://phovea.caleydo.org
* Copyright (c) 2019 Carolina Nobre; Licensed BSD-3-Clause*/

webpackJsonp([5,9],{

/***/ 608:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__range__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__idtype__ = __webpack_require__(225);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__datatype__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__data__ = __webpack_require__(118);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__math__ = __webpack_require__(227);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__IStratification__ = __webpack_require__(727);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__StratificationGroup__ = __webpack_require__(649);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__loader__ = __webpack_require__(729);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__StratificationVector__ = __webpack_require__(728);
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](Stratification, _super);
    function Stratification(desc, loader) {
        var _this = _super.call(this, desc) || this;
        _this.loader = loader;
        return _this;
    }
    Object.defineProperty(Stratification.prototype, "idtype", {
        get: function () {
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__idtype__["e" /* resolve */])(this.desc.idtype);
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var _a;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_b) {
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
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__data__["b" /* getFirstByFQName */])(this.desc.origin);
        }
        return Promise.reject('no origin specified');
    };
    Stratification.prototype.range = function () {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loader(this.desc)];
                    case 1: return [2 /*return*/, (_a.sent()).range];
                }
            });
        });
    };
    Stratification.prototype.idRange = function () {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var data, ids, range;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var _a, _b;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["h" /* parse */])(range)).filter;
                        return [4 /*yield*/, this.loader(this.desc)];
                    case 1: return [2 /*return*/, _b.apply(_a, [(_c.sent()).rows, this.dim])];
                }
            });
        });
    };
    Stratification.prototype.ids = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loader(this.desc)];
                    case 1: return [2 /*return*/, (_a.sent()).rowIds.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["h" /* parse */])(range), this.dim)];
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
}(__WEBPACK_IMPORTED_MODULE_4__datatype__["h" /* ADataType */]));
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
    var rowAssigner = options.rowassigner || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__idtype__["d" /* createLocalAssigner */])();
    return new Stratification(desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_9__loader__["b" /* viaDataLoader */])(rows, rowAssigner(rows), range));
}
function wrapCategoricalVector(v) {
    if (v.valuetype.type !== __WEBPACK_IMPORTED_MODULE_4__datatype__["a" /* VALUE_TYPE_CATEGORICAL */]) {
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

/***/ 611:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__range__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__idtype__ = __webpack_require__(225);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__datatype__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__IVector__ = __webpack_require__(735);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__AVector__ = __webpack_require__(634);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__loader__ = __webpack_require__(736);
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __extends */](Vector, _super);
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
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__idtype__["e" /* resolve */])(this.desc.idtype);
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
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.load()];
                    case 1: return [2 /*return*/, (_a.sent()).data[i]];
                }
            });
        });
    };
    Vector.prototype.data = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var data, d;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.load()];
                    case 1:
                        data = _a.sent();
                        d = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["h" /* parse */])(range).filter(data.data, this.dim);
                        if ((this.valuetype.type === __WEBPACK_IMPORTED_MODULE_4__datatype__["c" /* VALUE_TYPE_REAL */] || this.valuetype.type === __WEBPACK_IMPORTED_MODULE_4__datatype__["b" /* VALUE_TYPE_INT */])) {
                            return [2 /*return*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__datatype__["j" /* mask */])(d, this.valuetype)];
                        }
                        return [2 /*return*/, d];
                }
            });
        });
    };
    Vector.prototype.names = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var data;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.load()];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["h" /* parse */])(range).filter(data.rows, this.dim)];
                }
            });
        });
    };
    Vector.prototype.ids = function (range) {
        if (range === void 0) { range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["a" /* all */])(); }
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __awaiter */](this, void 0, void 0, function () {
            var data;
            return __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __generator */](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.load()];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.rowIds.preMultiply(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["h" /* parse */])(range), this.dim)];
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
    Vector.prototype.filter = function (callbackfn, thisArg) {
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
        value: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__datatype__["f" /* guessValueTypeDesc */])(data)
    }, options);
    var rowAssigner = options.rowassigner || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__idtype__["d" /* createLocalAssigner */])();
    return new Vector(desc, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_7__loader__["b" /* viaDataLoader */])(rows, rowAssigner(rows), data));
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

/***/ 727:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__index__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__datatype__ = __webpack_require__(19);
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
    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__index__["a" /* mixin */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__datatype__["g" /* createDefaultDataDesc */])(), {
        type: 'stratification',
        idtype: '_rows',
        size: 0,
        groups: [],
        ngroups: 0
    });
}


/***/ }),

/***/ 728:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__range__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__datatype__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__vector_AVector__ = __webpack_require__(634);
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
    function StratificationVector(strat, range) {
        var _this = _super.call(this, null) || this;
        _this.strat = strat;
        _this.range = range;
        _this._cache = null;
        _this.root = _this;
        _this.valuetype = {
            type: __WEBPACK_IMPORTED_MODULE_3__datatype__["a" /* VALUE_TYPE_CATEGORICAL */],
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
            r = r.view(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["h" /* parse */])(persisted.range));
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
        return Promise.resolve(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__range__["h" /* parse */])(range).filter(data, this.dim));
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
    StratificationVector.prototype.filter = function (callbackfn, thisArg) {
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
    return StratificationVector;
}(__WEBPACK_IMPORTED_MODULE_4__vector_AVector__["a" /* default */]));
/* harmony default export */ __webpack_exports__["a"] = StratificationVector;


/***/ }),

/***/ 729:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ajax__ = __webpack_require__(50);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__idtype__ = __webpack_require__(225);
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
    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["g" /* composite */])(name, groups.map(function (g) {
        return new __WEBPACK_IMPORTED_MODULE_1__range__["e" /* Range1DGroup */](g.name, g.color || 'gray', __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(g.range).dim(0));
    }));
}
function viaAPILoader() {
    var _data = undefined;
    return function (desc) {
        if (!_data) { //in the cache
            _data = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__ajax__["a" /* getAPIJSON */])('/dataset/' + desc.id).then(function (data) {
                var idType = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__idtype__["e" /* resolve */])(desc.idtype);
                var rowIds = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(data.rowIds);
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
                rowIds: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["b" /* list */])(rowIds),
                rows: rows,
                range: range
            });
        }
        return _data;
    };
}


/***/ }),

/***/ 735:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__index__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__datatype__ = __webpack_require__(19);
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
    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__index__["a" /* mixin */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__datatype__["g" /* createDefaultDataDesc */])(), {
        type: 'vector',
        idtype: '_rows',
        size: 0,
        value: {
            type: 'string'
        }
    });
}


/***/ }),

/***/ 736:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ajax__ = __webpack_require__(50);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__range__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__datatype__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__idtype__ = __webpack_require__(225);
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
            var range = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(data.rowIds);
            data.rowIds = range;
            data.data = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__datatype__["j" /* mask */])(data.data, desc.value);
            var idType = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__idtype__["e" /* resolve */])(desc.idtype);
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
            rowIds: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__range__["h" /* parse */])(rowIds),
            rows: rows,
            data: data
        };
        return Promise.resolve(_data);
    };
}


/***/ })

});