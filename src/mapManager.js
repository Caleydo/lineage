import * as tslib_1 from "tslib";
import { feature as topofeature } from 'topojson';
import { get as getById } from 'phovea_core/src/data';
import { scaleLinear, schemeCategory10 } from 'd3-scale';
import { interpolatePurples } from 'd3-scale-chromatic';
import { VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT, VALUE_TYPE_REAL, VALUE_TYPE_STRING } from 'phovea_core/src/datatype';
var MapManager = /** @class */ (function () {
    function MapManager() {
        this.maptopo = require('../../lineage_server/data/utah.json');
    }
    MapManager.prototype.init = function (tableManager) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.tableManager = tableManager;
                        _a = this;
                        return [4 /*yield*/, getById('demographic_data')];
                    case 1:
                        _a.demographicTable = (_b.sent());
                        this.topojsonFeatures = topofeature(this.maptopo, this.maptopo.objects.cb_2015_utah_county_20m);
                        return [2 /*return*/];
                }
            });
        });
    };
    MapManager.prototype.prepareData = function (currentSelectedMapAttribute) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var self, graphView, attributeView, allCols, colOrder, orderedCols, _i, colOrder_1, colName, _a, allCols_1, vector, dotDataAccum, allPromises, finishedPromises, dataValDict, allCategories_1, dataScale_1;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        self = this;
                        return [4 /*yield*/, this.tableManager.graphTable];
                    case 1:
                        graphView = _b.sent();
                        return [4 /*yield*/, this.tableManager.tableTable];
                    case 2:
                        attributeView = _b.sent();
                        allCols = graphView.cols().concat(attributeView.cols());
                        colOrder = [
                            'longitude',
                            'latitude',
                            currentSelectedMapAttribute,
                            'CountyCode'
                        ];
                        orderedCols = [];
                        for (_i = 0, colOrder_1 = colOrder; _i < colOrder_1.length; _i++) {
                            colName = colOrder_1[_i];
                            for (_a = 0, allCols_1 = allCols; _a < allCols_1.length; _a++) {
                                vector = allCols_1[_a];
                                if (vector.desc.name === colName) {
                                    orderedCols.push(vector);
                                }
                            }
                        }
                        self.selectedAttributeVector = orderedCols[2];
                        dotDataAccum = [];
                        allPromises = [];
                        orderedCols.forEach(function (vector, index) {
                            allPromises = allPromises.concat([vector.data(), vector.names()]);
                        });
                        return [4 /*yield*/, Promise.all(allPromises)];
                    case 3:
                        finishedPromises = _b.sent();
                        dataValDict = {};
                        if (self.selectedAttributeVector.desc.name === 'KindredID') {
                            finishedPromises[5].forEach(function (value, index) {
                                if (self.tableManager.familyIDArray.indexOf(finishedPromises[4][index]) >=
                                    0) {
                                    dataValDict[value] = finishedPromises[4][index];
                                }
                            });
                        }
                        else {
                            finishedPromises[5].forEach(function (value, index) {
                                dataValDict[value] = finishedPromises[4][index];
                            });
                        }
                        finishedPromises[1].forEach(function (idNumber, index) {
                            var dataEntry = {};
                            dataEntry.ID = idNumber;
                            dataEntry.longitude = finishedPromises[0][index];
                            dataEntry.latitude = finishedPromises[2][index];
                            dataEntry.dataVal = dataValDict[idNumber];
                            dataEntry.county_code = finishedPromises[6][index];
                            dotDataAccum.push(dataEntry);
                        });
                        dotDataAccum = dotDataAccum.filter(function (d) { return d.longitude && d.latitude; });
                        self.selectedMapAttributeType = self.selectedAttributeVector.valuetype.type;
                        if (self.selectedMapAttributeType === VALUE_TYPE_CATEGORICAL) {
                            allCategories_1 = self.selectedAttributeVector.desc.value.categories.map(function (c) { return c.name; });
                            self.scaleFunction = function (inputValue) {
                                return schemeCategory10[allCategories_1.indexOf(inputValue)];
                            };
                        }
                        else if (self.selectedMapAttributeType === VALUE_TYPE_INT ||
                            self.selectedMapAttributeType === VALUE_TYPE_REAL) {
                            dataScale_1 = scaleLinear()
                                .domain(self.selectedAttributeVector.desc.value.range)
                                .range([0.2, 1]);
                            self.scaleFunction = function (inputValue) {
                                return interpolatePurples(dataScale_1(inputValue));
                            };
                        }
                        else if (self.selectedAttributeVector.desc.name === 'KindredID') {
                            console.log(self.tableManager.familyIDArray);
                            self.scaleFunction = function (inputValue) {
                                return schemeCategory10[self.tableManager.familyIDArray.indexOf(inputValue) + 1];
                            };
                        }
                        else if (self.selectedMapAttributeType === 'id' ||
                            self.selectedMapAttributeType === 'idtype' ||
                            self.selectedMapAttributeType === VALUE_TYPE_STRING) {
                            self.scaleFunction = function (inputValue) {
                                return '#295981';
                            };
                        }
                        return [2 /*return*/, dotDataAccum];
                }
            });
        });
    };
    return MapManager;
}());
export default MapManager;
export function create() {
    return new MapManager();
}
//# sourceMappingURL=mapManager.js.map