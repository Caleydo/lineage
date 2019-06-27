import * as tslib_1 from "tslib";
import { get as getById } from 'phovea_core/src/data';
import { VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT, VALUE_TYPE_REAL, VALUE_TYPE_STRING } from 'phovea_core/src/datatype';
import * as range from 'phovea_core/src/range';
import * as events from 'phovea_core/src/event';
import { max, min, mean, quantile, ascending } from 'd3-array';
import { transition } from 'd3-transition';
import { easeLinear } from 'd3-ease';
import { isUndefined } from 'util';
//Create new type that encompasses both types of primary attributes
//export type attribute = IPrimaryCatAttribute | IPrimaryQuantAttribute;
var indexOfKindredIDColumn = 1;
export var VIEW_CHANGED_EVENT = 'view_changed_event';
export var TABLE_VIS_ROWS_CHANGED_EVENT = 'table_vis_rows_changed_event';
export var PRIMARY_SELECTED = 'primary_secondary_attribute_event';
export var POI_SELECTED = 'affected_attribute_event';
export var FAMILY_INFO_UPDATED = 'family_stats_updated';
export var COL_ORDER_CHANGED_EVENT = 'col_ordering_changed';
export var FAMILY_SELECTED_EVENT = 'family_selected_event';
export var UPDATE_TABLE_EVENT = 'update_table';
export var SET_ALL_AVERAGE_LIMIT_EVENT = 'all_average_limit_changed';
export var HIDE_FAMILY_TREE = 'hide_family_tree';
export var MAP_ATTRIBUTE_CHANGE_EVENT = 'map_attribute_changed';
export var SHOW_TOP_100_EVENT = 'show_top_100_expose';
export var SHOW_DETAIL_VIEW = 'show_detail view';
export var HIGHLIGHT_BY_ID = 'HIGHLIGHT_BY_ID';
export var CLEAR_TABLE_HIGHLIGHT = 'CLEAR_TABLE_HIGHLIGHT';
export var HIGHLIGHT_MAP_BY_ID = 'HIGHLIGHT_MAP_BY_ID';
export var CLEAR_MAP_HIGHLIGHT = 'CLEAR_MAP_HIGHLIGHT';
export var POI_COLOR = '#285880';
export var POI_COLOR_2 = '#49aaf3';
export var PRIMARY_COLOR = '#598e7c';
export var PRIMARY_COLOR_2 = '#b5b867';
export var PRIMARY_COLOR_3 = '#9f0e72';
export var PRIMARY_COLOR_4 = '#e7a396';
export var PRIMARY_COLOR_5 = '#882c00';
export var PRIMARY_COLOR_6 = '#B7DBDB';
// export const PRIMARY_COLOR_7 = '#337CAF';
export var PRIMARY_CATEGORICAL_COLORS = [
    PRIMARY_COLOR,
    PRIMARY_COLOR_2,
    PRIMARY_COLOR_3,
    PRIMARY_COLOR_4,
    PRIMARY_COLOR_5,
    PRIMARY_COLOR_6
];
/**
 * This class manages the data structure for the graph, the table visualization and the attribute selection panel.
 */
var TableManager = /** @class */ (function () {
    function TableManager() {
        /** The columns currently displayed in the table */
        this.activeTableColumns = range.all(); //default value;
        /** The rows currently shown in the table, a subset of the activeGraphRows */
        this._activeTableRows = range.all(); //default value;
        /** All rows that are used in the graph - corresponds to a family */
        this._activeGraphRows = range.all();
        /** The columns currently displayed in the graph  */
        this.activeGraphColumns = range.all(); //default value
        /** Array of Selected Attributes in the Panel */
        this._activeAQrows = range.all();
        this.activeAQColumns = range.all();
        //Array of attributes that are 'starred' in the table;
        this.starCols = [];
        this.familyIDArray = [];
        this.familyInfo = [];
        this.dataSets = ['Dataset 1', 'Dataset 2', 'Dataset 3'];
        //The array indicates the columns that are temporal
        this.temporalData = [
            'ptotday',
            'pm25day',
            'meanO3day',
            'maxO3day',
            'meanNO2day',
            'maxNO2day',
            'cloudyday',
            'opaqueday',
            'Tcloudday',
            'AirTempday',
            'Pressureday',
            'RHday',
            'daylengthday',
            'daydiffday'
        ];
        this.temporalDataInterval = {};
        this.temporalDataMeans = {};
        this.temporalDataExtreme = {};
        this.t = transition('t')
            .duration(600)
            .ease(easeLinear);
        //TODO change this into => on calling it, make the active table into entire dataset, exclude any none
        // public findTop100(attributeName){
        //   const self = this;
        //   let colVectors = self.airqualityTable.cols().filter(col=>col.desc.name.includes( attributeName))
        //   console.log(colVectors)
        // }
    }
    //Method that adds cols from the Family Selector;
    TableManager.prototype.addStar = function (attributeName, trueValue) {
        this.updateFamilySelector(attributeName, trueValue, true);
    };
    //Method that removes cols from the Family Selector;
    TableManager.prototype.removeStar = function (attributeName) {
        this.updateFamilySelector(attributeName, undefined, false);
    };
    /**
     * Loads the graph data and the attribute data from the server and stores it in the public table variable
     * Parses out the familySpecific information to populate the Family Selector
     * @param: id of the dataset
     */
    TableManager.prototype.loadData = function (descendDataSetID, attributeDataSetID) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var self, attributeTable, err_1, _a, _b, promises, finishedPromises;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        self = this;
                        if (descendDataSetID === 'AllFamiliesDescend' ||
                            descendDataSetID === 'TenFamiliesDescend') {
                            // this.defaultCols = ['KindredID', 'RelativeID', 'sex', 'deceased', 'suicide', 'Age','LabID','alcohol','Nr.Diag_alcohol','psychosis','Nr.Diag_psychosis','anxiety-non-trauma','Nr.Diag_anxiety-non-trauma', 'depression','cause_death']; //set of default cols to read in, minimizes load time for large files;
                            //this.defaultCols = ['KindredID', 'RelativeID', 'sex', 'deceased', 'suicide', 'Age','bipolar spectrum illness','anxiety-non-trauma','alcohol','PD','psychosis','depression','cause_death','zip','longitude','latitude']; //set of default cols to read in, minimizes load time for large files;
                            this.defaultCols = [
                                'KindredID',
                                'maxNO2day',
                                'pm25day',
                                'AirTempday',
                                'meanNO2day',
                                'meanO3day',
                                'bdate',
                                'ddate'
                            ]; //set of default cols to read in, minimizes load time for large files;
                        }
                        else {
                            this.defaultCols = [
                                'KindredID',
                                'RelativeID',
                                'sex',
                                'affected',
                                'labid'
                            ];
                        }
                        this.colOrder = this.defaultCols;
                        return [4 /*yield*/, getById(attributeDataSetID)];
                    case 1:
                        attributeTable = _c.sent();
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, attributeTable
                                .col(0)
                                .data()
                                .then()];
                    case 3:
                        _c.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _c.sent();
                        return [2 /*return*/, undefined];
                    case 5:
                        if (!attributeTable) {
                            return [2 /*return*/];
                        }
                        this.attributeTable = attributeTable;
                        //retrieving the desired dataset by name
                        _a = this;
                        return [4 /*yield*/, getById(descendDataSetID)];
                    case 6:
                        //retrieving the desired dataset by name
                        _a.table = (_c.sent());
                        //TODO add the code for calculating averages
                        _b = this;
                        return [4 /*yield*/, getById('matched_aq_merged')];
                    case 7:
                        //TODO add the code for calculating averages
                        _b.airqualityTable = (_c.sent());
                        promises = [];
                        this.temporalData.forEach(function (aqName, index) {
                            for (var i = -14; i < 15; i++) {
                                promises.push(self.airqualityTable.colData(aqName + i.toString()));
                            }
                        });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 8:
                        finishedPromises = _c.sent();
                        this.temporalData.forEach(function (aqName, index) {
                            var dataArray = [];
                            var beforeArray = [];
                            var afterArray = [];
                            for (var i = 0; i < 29; i++) {
                                dataArray = dataArray.concat(finishedPromises[i + 29 * index]);
                                if (i < 14) {
                                    beforeArray = beforeArray.concat(finishedPromises[i + 29 * index]);
                                }
                                else if (i > 14) {
                                    afterArray = afterArray.concat(finishedPromises[i + 29 * index]);
                                }
                            }
                            dataArray = dataArray.filter(function (d) { return !isNaN(d); }).sort(ascending);
                            if (aqName === 'AirTempday') {
                                self.temporalDataInterval[aqName] = [min(dataArray), max(dataArray)];
                            }
                            else {
                                self.temporalDataInterval[aqName] = [0, quantile(dataArray, 0.9)];
                            }
                            self.temporalDataExtreme[aqName] = [min(dataArray), max(dataArray)];
                            self.temporalDataMeans[aqName] = [mean(beforeArray), mean(afterArray)];
                        });
                        //  console.log(this.airqualityTable)
                        return [4 /*yield*/, this.parseFamilyInfo()];
                    case 9:
                        //  console.log(this.airqualityTable)
                        _c.sent(); //this needs to come first because the setAffectedState sets default values based on the data for a selected family.
                        return [2 /*return*/, Promise.resolve(this)];
                }
            });
        });
    };
    /**
     *
     * This function get the requested attribute for the person requested if the attribute is a POI, primary, or secondary.
     * Returns undefined if there is no value.
     *
     * @param attribute - attribute to search for
     * @param personID - person for which to search for attribute
     */
    TableManager.prototype.getAttribute = function (attribute, personID) {
        var selectedAttribute;
        if (attribute === this.affectedState.name) {
            selectedAttribute = this.affectedState;
        }
        else if (this.primaryAttribute &&
            attribute === this.primaryAttribute.name) {
            selectedAttribute = this.primaryAttribute;
        }
        else {
            //Attribute is neither primary nor secondary nor POI;
            console.log('neither POI nor primary');
            return undefined;
        }
        var ids = selectedAttribute.personIDs;
        if (ids.indexOf(personID) > -1) {
            var index = ids.indexOf(personID);
            var value = selectedAttribute.data[index];
            return value;
        }
        else {
            return undefined;
        }
    };
    TableManager.prototype.setMapView = function (mapview) {
        this.mapView = mapview;
    };
    /**
     * This function get the requested attribute vector.
     *
     * @param attribute - attribute to search for
     * @param allFamilies - boolean set to true to return the attribute vector for all families. Defaults to false.
     */
    TableManager.prototype.getAttributeVector = function (attributeName, allFamilies) {
        if (allFamilies === void 0) { allFamilies = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var allColumns, attributeVector;
            return tslib_1.__generator(this, function (_a) {
                //Find Vector of that attribute in either table.
                if (this.graphTable && !allFamilies) {
                    //familyView has been defined && allFamilies has not been requested)
                    allColumns = this.graphTable
                        .cols()
                        .concat(this.tableTable.cols())
                        .concat(this.aqTable.cols());
                }
                else {
                    allColumns = this.table
                        .cols()
                        .concat(this.attributeTable.cols())
                        .concat(this.airqualityTable.cols());
                }
                attributeVector = undefined;
                allColumns.forEach(function (col) {
                    if (col.desc.name === attributeName) {
                        attributeVector = col;
                    }
                });
                return [2 /*return*/, attributeVector];
            });
        });
    };
    TableManager.prototype.setPrimaryAttribute = function (attributeName) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var binaryColorChoice1, binaryColorChoice2, multipleColorChoice, attributeVector, categories, color, allColumns, attributeDefinition, _a, data, categoricalDefinition, quantDefinition, _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!attributeName) {
                            this.primaryAttribute = undefined;
                            events.fire(PRIMARY_SELECTED, undefined);
                            return [2 /*return*/];
                        }
                        binaryColorChoice1 = PRIMARY_COLOR;
                        binaryColorChoice2 = PRIMARY_COLOR_2;
                        multipleColorChoice = PRIMARY_CATEGORICAL_COLORS;
                        allColumns = this.graphTable.cols().concat(this.tableTable.cols());
                        allColumns.forEach(function (col) {
                            if (col.desc.name === attributeName) {
                                attributeVector = col;
                            }
                        });
                        _a = {
                            name: attributeName,
                            primary: true,
                            type: attributeVector.valuetype.type
                        };
                        return [4 /*yield*/, attributeVector.data()];
                    case 1:
                        _a.data = _c.sent(),
                            _a.range = attributeVector.desc.value.range;
                        return [4 /*yield*/, attributeVector.names()];
                    case 2:
                        attributeDefinition = (_a.personIDs = _c.sent(),
                            _a);
                        return [4 /*yield*/, attributeVector.data()];
                    case 3:
                        data = _c.sent();
                        if (!(attributeDefinition.type === VALUE_TYPE_CATEGORICAL)) return [3 /*break*/, 4];
                        categoricalDefinition = attributeDefinition;
                        categories = attributeVector.desc.value.categories.map(function (c) {
                            //get categories from index.json def
                            return c.name;
                        });
                        if (categories.length === 2) {
                            //binary categorical data
                            color = [binaryColorChoice2, binaryColorChoice1];
                        }
                        else {
                            color = multipleColorChoice.slice(0, categories.length); //extract one color per category;
                        }
                        categoricalDefinition.categories = categories;
                        categoricalDefinition.color = color;
                        return [3 /*break*/, 6];
                    case 4:
                        if (!(attributeDefinition.type === VALUE_TYPE_INT ||
                            attributeDefinition.type === VALUE_TYPE_REAL)) return [3 /*break*/, 6];
                        quantDefinition = attributeDefinition;
                        _b = quantDefinition;
                        return [4 /*yield*/, attributeVector.stats()];
                    case 5:
                        _b.stats = _c.sent();
                        quantDefinition.color = binaryColorChoice1;
                        _c.label = 6;
                    case 6:
                        this.primaryAttribute = attributeDefinition;
                        events.fire(PRIMARY_SELECTED, attributeDefinition);
                        return [2 /*return*/, attributeDefinition];
                }
            });
        });
    };
    /**
     * This function updates the data and ids for the affected State (POI) and primary attribute when a different family is selected.
     *
     */
    TableManager.prototype.updatePOI_Primary = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var attributeVector, varType, _a, _b, attributeVector, varType, _c, _d;
            return tslib_1.__generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!this.affectedState) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.getAttributeVector(this.affectedState.name)];
                    case 1:
                        attributeVector = _e.sent();
                        varType = attributeVector.valuetype.type;
                        _a = this.affectedState;
                        return [4 /*yield*/, attributeVector.data()];
                    case 2:
                        _a.data = _e.sent();
                        _b = this.affectedState;
                        return [4 /*yield*/, attributeVector.names()];
                    case 3:
                        _b.personIDs = _e.sent();
                        _e.label = 4;
                    case 4:
                        if (!this.primaryAttribute) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.getAttributeVector(this.primaryAttribute.name)];
                    case 5:
                        attributeVector = _e.sent();
                        varType = attributeVector.valuetype.type;
                        _c = this.primaryAttribute;
                        return [4 /*yield*/, attributeVector.data()];
                    case 6:
                        _c.data = _e.sent();
                        _d = this.primaryAttribute;
                        return [4 /*yield*/, attributeVector.names()];
                    case 7:
                        _d.personIDs = _e.sent();
                        _e.label = 8;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * This function sets the affected State.
     *
     */
    TableManager.prototype.setAffectedState = function (varName, isAffectedCallbackFcn) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var attributeVector, varType, threshold, stats_1, categoriesVec, categories_1, category_1, data, personIDs, binaryColorChoice1, binaryColorChoice2, multipleColorChoice, categories, color, attributeDefinition, _a, categoricalDefinition, quantDefinition, _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.getAttributeVector(varName, true)];
                    case 1:
                        attributeVector = _c.sent();
                        varType = attributeVector.valuetype.type;
                        if (!(typeof isAffectedCallbackFcn === 'undefined')) return [3 /*break*/, 4];
                        if (!(varType === VALUE_TYPE_INT || varType === VALUE_TYPE_REAL)) return [3 /*break*/, 3];
                        return [4 /*yield*/, attributeVector.stats()];
                    case 2:
                        stats_1 = _c.sent();
                        isAffectedCallbackFcn = function (attr) {
                            return attr >= stats_1.mean;
                        }; //if threshold hasn't been defined, default to anything over the mean value
                        threshold = stats_1.mean;
                        if (threshold > attributeVector.desc.value.range[1]) {
                            threshold =
                                (attributeVector.desc.value.range[1] -
                                    attributeVector.desc.value.range[0]) /
                                    2 +
                                    attributeVector.desc.value.range[0];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        if (varType === VALUE_TYPE_CATEGORICAL) {
                            categoriesVec = attributeVector.valuetype.categories;
                            categories_1 = categoriesVec.map(function (c) {
                                return c.name;
                            });
                            if (categories_1.find(function (d) {
                                return d === 'Y';
                            })) {
                                category_1 = 'Y';
                            }
                            else if (categories_1.find(function (d) {
                                return d === 'TRUE' || d === 'True';
                            })) {
                                category_1 = 'TRUE';
                            }
                            else if (categories_1.find(function (d) {
                                return d === 'F';
                            })) {
                                category_1 = 'F';
                            }
                            else {
                                category_1 = categories_1[0];
                            }
                            isAffectedCallbackFcn = function (attr) {
                                return (!isUndefined(attr) && attr.toLowerCase() === category_1.toLowerCase()); //solve the True/TRUE problem once and for all.
                            };
                            threshold = category_1;
                        }
                        else if (varType === VALUE_TYPE_STRING) {
                            isAffectedCallbackFcn = function (attr) {
                                return attr !== undefined && attr.length > 0;
                            }; //string is non empty
                        }
                        _c.label = 4;
                    case 4: return [4 /*yield*/, attributeVector.data()];
                    case 5:
                        data = _c.sent();
                        return [4 /*yield*/, attributeVector.names()];
                    case 6:
                        personIDs = _c.sent();
                        binaryColorChoice1 = POI_COLOR;
                        binaryColorChoice2 = POI_COLOR;
                        multipleColorChoice = [
                            POI_COLOR,
                            POI_COLOR,
                            POI_COLOR,
                            POI_COLOR,
                            POI_COLOR,
                            POI_COLOR
                        ];
                        _a = {
                            name: varName,
                            primary: false,
                            type: varType,
                            data: data,
                            range: attributeVector.desc.value.range
                        };
                        return [4 /*yield*/, attributeVector.names()];
                    case 7:
                        attributeDefinition = (_a.personIDs = _c.sent(),
                            _a);
                        if (!(attributeDefinition.type === VALUE_TYPE_CATEGORICAL)) return [3 /*break*/, 8];
                        categoricalDefinition = attributeDefinition;
                        categories = attributeVector.desc.value.categories.map(function (c) {
                            return c.name;
                        });
                        if (categories.length === 2) {
                            //binary categorical data
                            color = [binaryColorChoice2, binaryColorChoice1];
                        }
                        else {
                            color = multipleColorChoice.slice(0, categories.length); //extract one color per category;
                        }
                        categoricalDefinition.categories = categories;
                        categoricalDefinition.color = color;
                        return [3 /*break*/, 10];
                    case 8:
                        if (!(attributeDefinition.type === VALUE_TYPE_INT ||
                            attributeDefinition.type === VALUE_TYPE_REAL)) return [3 /*break*/, 10];
                        quantDefinition = attributeDefinition;
                        _b = quantDefinition;
                        return [4 /*yield*/, attributeVector.stats()];
                    case 9:
                        _b.stats = _c.sent();
                        quantDefinition.color = binaryColorChoice1;
                        _c.label = 10;
                    case 10:
                        this.affectedState = {
                            name: varName,
                            type: varType,
                            isAffected: isAffectedCallbackFcn,
                            data: data,
                            personIDs: personIDs,
                            attributeInfo: attributeDefinition
                        };
                        //if Primary Attribute was previously set to this same attribute, clear primary
                        if (this.primaryAttribute &&
                            this.primaryAttribute.name === this.affectedState.name) {
                            this.primaryAttribute = undefined;
                            events.fire(PRIMARY_SELECTED, undefined);
                        }
                        //Update family selector
                        this.updateFamilyStats();
                        events.fire(POI_SELECTED, this.affectedState);
                        return [2 /*return*/, { threshold: threshold, type: varType }];
                }
            });
        });
    };
    /**
     * This function changes the range of rows to display on the selected family.
     * @param chosenFamilyID the numeric value of the familyID, uses the first family ID when none is specified
     */
    TableManager.prototype.selectFamily = function (chosenFamilyIDs) {
        if (chosenFamilyIDs === void 0) { chosenFamilyIDs = [this.familyInfo[0].id]; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var self, family, familyRange, familyMembersRange, familyMembers, attributeMembersRange, attributeMembers, aqMembersRange, aqMembers, attributeRows, aqattributeRows;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        //console.log(this.familyInfo)
                        console.log('selectingFamily', chosenFamilyIDs);
                        self.familyIDArray = chosenFamilyIDs;
                        family = this.familyInfo.find(function (family) {
                            return family.id === chosenFamilyIDs[0];
                        });
                        familyRange = range.list(family.range);
                        chosenFamilyIDs.forEach(function (id, i) {
                            var family = _this.familyInfo.find(function (family) {
                                return family.id === chosenFamilyIDs[i];
                            });
                            if (i > 0) {
                                familyRange = familyRange.union(range.list(family.range));
                            }
                        });
                        //  console.log(family.range)
                        this._activeGraphRows = familyRange;
                        return [4 /*yield*/, this.refreshActiveGraphView()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.graphTable.col(0).ids()];
                    case 2:
                        familyMembersRange = _a.sent();
                        familyMembers = familyMembersRange.dim(0).asList();
                        return [4 /*yield*/, this.attributeTable.col(0).ids()];
                    case 3:
                        attributeMembersRange = _a.sent();
                        attributeMembers = attributeMembersRange.dim(0).asList();
                        return [4 /*yield*/, this.airqualityTable.col(0).ids()];
                    case 4:
                        aqMembersRange = _a.sent();
                        aqMembers = aqMembersRange.dim(0).asList();
                        attributeRows = [];
                        //console.log(attributeMembers,attributeMembersRange)
                        attributeMembers.forEach(function (member, i) {
                            if (familyMembers.indexOf(member) > -1) {
                                attributeRows.push(i);
                            }
                        });
                        aqattributeRows = [];
                        aqMembers.forEach(function (member, i) {
                            if (familyMembers.indexOf(member) > -1) {
                                aqattributeRows.push(i);
                            }
                        });
                        this._activeTableRows = range.list(attributeRows);
                        this._activeAQrows = range.list(aqattributeRows);
                        return [4 /*yield*/, this.refreshActiveTableView()];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.refreshActiveAQView()];
                    case 6:
                        _a.sent();
                        this.updatePOI_Primary();
                        events.fire(FAMILY_SELECTED_EVENT);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * This function calculates the number of affected people based on the current POI selected in the panel.
     */
    TableManager.prototype.updateFamilyStats = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var attributeVector, kindredIDVector, familyIDs, peopleIDs, attributeData, attributePeople, uniqueFamilyIDs, affectedDict;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAttributeVector(this.affectedState.name, true)];
                    case 1:
                        attributeVector = _a.sent();
                        return [4 /*yield*/, this.getAttributeVector('KindredID', true)];
                    case 2:
                        kindredIDVector = _a.sent();
                        return [4 /*yield*/, kindredIDVector.data()];
                    case 3:
                        familyIDs = _a.sent();
                        return [4 /*yield*/, kindredIDVector.names()];
                    case 4:
                        peopleIDs = _a.sent();
                        return [4 /*yield*/, attributeVector.data()];
                    case 5:
                        attributeData = _a.sent();
                        return [4 /*yield*/, attributeVector.names()];
                    case 6:
                        attributePeople = _a.sent();
                        uniqueFamilyIDs = Array.from(new Set(familyIDs));
                        affectedDict = {};
                        //Initialize count of affected people to 0 for all families
                        uniqueFamilyIDs.map(function (familyID) {
                            affectedDict[familyID] = 0;
                        });
                        if (attributeData.length !== familyIDs.length) {
                            console.log('problem in paradise');
                        }
                        attributeData.map(function (dataPoint, ind) {
                            if (_this.affectedState.isAffected(dataPoint)) {
                                affectedDict[familyIDs[ind]] = affectedDict[familyIDs[ind]] + 1;
                            }
                        });
                        //set affected count in this.familyInfo;
                        uniqueFamilyIDs.map(function (familyID, index) {
                            _this.familyInfo[index].affected = affectedDict[familyID];
                            _this.familyInfo[index].percentage =
                                affectedDict[familyID] / _this.familyInfo[index].size;
                        });
                        events.fire(FAMILY_INFO_UPDATED, this);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * This function calculates the number of affected people based on the current POI selected in the panel.
     */
    TableManager.prototype.updateFamilySelector = function (attribute, trueValue, add) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var allAttributes, toRemove_1, poiVector, attributeVector, kindredIDVector, familyIDs, peopleIDs, poiData, poiIDs, attributeData, attributePeopleIDs, uniqueFamilyIDs, starCountDict;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        //Remove Star attribute
                        if (!add) {
                            allAttributes = this.familyInfo[0].starCols.map(function (attr) {
                                return attr.attribute;
                            });
                            toRemove_1 = allAttributes.indexOf(attribute);
                            this.familyInfo.map(function (family) {
                                family.starCols.splice(toRemove_1, 1);
                            });
                            events.fire(FAMILY_INFO_UPDATED, this);
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.getAttributeVector(this.affectedState.name, true)];
                    case 1:
                        poiVector = _a.sent();
                        return [4 /*yield*/, this.getAttributeVector(attribute, true)];
                    case 2:
                        attributeVector = _a.sent();
                        return [4 /*yield*/, this.getAttributeVector('KindredID', true)];
                    case 3:
                        kindredIDVector = _a.sent();
                        return [4 /*yield*/, kindredIDVector.data()];
                    case 4:
                        familyIDs = _a.sent();
                        return [4 /*yield*/, kindredIDVector.names()];
                    case 5:
                        peopleIDs = _a.sent();
                        return [4 /*yield*/, poiVector.data()];
                    case 6:
                        poiData = _a.sent();
                        return [4 /*yield*/, poiVector.names()];
                    case 7:
                        poiIDs = _a.sent();
                        return [4 /*yield*/, attributeVector.data()];
                    case 8:
                        attributeData = _a.sent();
                        return [4 /*yield*/, attributeVector.names()];
                    case 9:
                        attributePeopleIDs = _a.sent();
                        uniqueFamilyIDs = Array.from(new Set(familyIDs));
                        starCountDict = {};
                        //Initialize count of affected people to 0 for all families
                        uniqueFamilyIDs.map(function (familyID) {
                            starCountDict[familyID] = 0;
                        });
                        attributeData.map(function (dataPoint, ind) {
                            if (dataPoint === trueValue || (!trueValue && dataPoint)) {
                                //account for cases when having a value (like LabID) is considered a 1
                                var poiInd = attributeData.length === familyIDs.length
                                    ? ind
                                    : poiIDs.indexOf(attributePeopleIDs[ind]);
                                if (_this.affectedState.isAffected(poiData[poiInd])) {
                                    starCountDict[familyIDs[poiInd]] =
                                        starCountDict[familyIDs[poiInd]] + 1;
                                }
                            }
                        });
                        //set affected count in this.familyInfo;
                        uniqueFamilyIDs.map(function (familyID, index) {
                            //account for families with no affected people (happens when you change the POI).
                            var percentage = _this.familyInfo[index].affected > 0
                                ? starCountDict[familyID] / _this.familyInfo[index].affected
                                : 0;
                            _this.familyInfo[index].starCols.push({
                                attribute: attribute,
                                count: starCountDict[familyID],
                                percentage: percentage
                            });
                        });
                        events.fire(FAMILY_INFO_UPDATED, this);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * This function is called after loadData.
     * This function populates needed variables for attribute table and attribute panel
     * IMPORTANT: This is never called?
     */
    TableManager.prototype.parseAttributeData = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var columns, colIndexAccum;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.attributeTable.cols()];
                    case 1:
                        columns = _a.sent();
                        colIndexAccum = [];
                        //populate active attribute array
                        columns.forEach(function (col, i) {
                            var type = col.desc.value.type;
                            if (type !== 'idtype') {
                                colIndexAccum.push(i); //push the index so we can get the right view
                            }
                        });
                        this._activeTableRows = range.all();
                        this.activeTableColumns = range.list(colIndexAccum);
                        //  console.log(this.activeTableColumns)
                        return [4 /*yield*/, this.refreshActiveTableView()];
                    case 2:
                        //  console.log(this.activeTableColumns)
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * This function is called after loadData.
     * This function populates needed variables for family selector
     *
     */
    TableManager.prototype.parseFamilyInfo = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var familyIDs, uniqueFamilyIDs, _loop_1, this_1, _i, uniqueFamilyIDs_1, id, columns, colIndexAccum;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.table.col(indexOfKindredIDColumn).data()];
                    case 1:
                        familyIDs = (_a.sent());
                        uniqueFamilyIDs = Array.from(new Set(familyIDs));
                        _loop_1 = function (id) {
                            //Array to store the ranges for the selected family
                            var familyRange = [];
                            var affected = 0;
                            var percentage = 0;
                            familyIDs.forEach(function (d, i) {
                                if (d === id) {
                                    familyRange.push(i);
                                }
                            });
                            this_1.familyInfo.push({
                                id: id,
                                range: familyRange,
                                size: familyRange.length,
                                affected: affected,
                                percentage: percentage,
                                starCols: []
                            });
                        };
                        this_1 = this;
                        for (_i = 0, uniqueFamilyIDs_1 = uniqueFamilyIDs; _i < uniqueFamilyIDs_1.length; _i++) {
                            id = uniqueFamilyIDs_1[_i];
                            _loop_1(id);
                        }
                        return [4 /*yield*/, this.table.cols()];
                    case 2:
                        columns = _a.sent();
                        colIndexAccum = [];
                        //populate active attribute array
                        columns.forEach(function (col, i) {
                            var type = col.desc.value.type;
                            // if (type !== 'idtype') {
                            colIndexAccum.push(i); //push the index so we can get the right view
                            // }
                        });
                        this.activeGraphColumns = range.list(colIndexAccum);
                        return [4 /*yield*/, this.refreshActiveGraphView()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.selectFamily()];
                    case 4:
                        _a.sent(); //call to selectFamily is now made from the familySelector object
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Uses the active rows and cols to create new table and graph tables and fires a {VIEW_CHANGED_EVENT} event when done.
     * @return {Promise<void>}
     */
    TableManager.prototype.refreshActiveViews = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.refreshActiveTableView()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.refreshActiveGraphView()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Uses the active rows and cols to create new table view.
     * @return {Promise<void>}
     */
    TableManager.prototype.refreshActiveTableView = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var tableRange, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        tableRange = range.join(this._activeTableRows, this.activeTableColumns);
                        _a = this;
                        return [4 /*yield*/, this.attributeTable.view(tableRange)];
                    case 1:
                        _a.tableTable = _b.sent(); //view on attribute table
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Uses the active rows and cols to create new graph view.
     * @return {Promise<void>}
     */
    TableManager.prototype.refreshActiveGraphView = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var graphRange, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        graphRange = range.join(this._activeGraphRows, this.activeGraphColumns);
                        _a = this;
                        return [4 /*yield*/, this.table.view(graphRange)];
                    case 1:
                        _a.graphTable = _b.sent(); //view on graph table
                        return [2 /*return*/];
                }
            });
        });
    };
    TableManager.prototype.refreshActiveAQView = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var aqRange, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        aqRange = range.join(this._activeAQrows, this.activeAQColumns);
                        _a = this;
                        return [4 /*yield*/, this.airqualityTable.view(aqRange)];
                    case 1:
                        _a.aqTable = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TableManager.prototype.setActiveRowsWithoutEvent = function (newRows) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var allIDs, newRange, allMembers, familyMembers, aqMembers, familyRows, aqattributeRows;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.attributeTable.col(0).names()];
                    case 1:
                        allIDs = _a.sent();
                        newRange = [];
                        allIDs.forEach(function (id, i) {
                            if (newRows.indexOf(id.toString()) > -1) {
                                newRange.push(i);
                            }
                        });
                        this._activeTableRows = range.list(newRange);
                        return [4 /*yield*/, this.refreshActiveTableView()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.tableTable.col(0).names()];
                    case 3:
                        allMembers = _a.sent();
                        return [4 /*yield*/, this.table.col(0).names()];
                    case 4:
                        familyMembers = _a.sent();
                        return [4 /*yield*/, this.airqualityTable.col(0).names()];
                    case 5:
                        aqMembers = _a.sent();
                        familyRows = [];
                        familyMembers.forEach(function (member, i) {
                            if (allMembers.indexOf(member) > -1) {
                                familyRows.push(i);
                            }
                        });
                        aqattributeRows = [];
                        aqMembers.forEach(function (member, i) {
                            if (allMembers.indexOf(member) > -1) {
                                aqattributeRows.push(i);
                            }
                        });
                        //    console.log(aqattributeRows);
                        this._activeGraphRows = range.list(familyRows);
                        this._activeAQrows = range.list(aqattributeRows);
                        return [4 /*yield*/, this.refreshActiveGraphView()];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.refreshActiveAQView()];
                    case 7:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(TableManager.prototype, "activeTableRows", {
        /**
         * Updates the active rows for the table visualization, creates a new table view and fires a {TABLE_VIS_ROWS_CHANGED} event.
         * @param newRows
         */
        set: function (newRows) {
            this._activeTableRows = newRows;
            this.tableTable = this.table.view(range.join(this._activeTableRows, this.activeTableColumns));
            console.log('firing TABLE VIS ROWS from activeTableRows');
            events.fire(TABLE_VIS_ROWS_CHANGED_EVENT);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TableManager.prototype, "activeGraphRows", {
        /**
         * Updates the active rows for the table visualization, creates a new table view and fires a {TABLE_VIS_ROWS_CHANGED} event.
         * @param newRows
         */
        set: function (newRows) {
            var _this = this;
            this.table
                .col(0)
                .ids()
                .then(function (allIDsRange) {
                var allIDs = allIDsRange.dim(0).asList();
                var newRange = [];
                allIDs.forEach(function (id, i) {
                    if (newRows.indexOf(id.toString()) > -1) {
                        newRange.push(i);
                    }
                });
                _this._activeGraphRows = range.list(newRange);
                _this.refreshActiveGraphView().then(function () {
                    events.fire(TABLE_VIS_ROWS_CHANGED_EVENT);
                });
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TableManager.prototype, "selectedAttributes", {
        /**
         * Updates the array of selectedAttributes in the panel.
         * @param newRows
         */
        set: function (attributes) {
            this._selectedAttributes = attributes;
        },
        enumerable: true,
        configurable: true
    });
    TableManager.prototype.getDemographicColumns = function () {
        return this.table.cols();
    };
    TableManager.prototype.getAttrColumns = function () {
        return this.attributeTable.cols();
    };
    TableManager.prototype.getAQRange = function (columnName) {
        return this.temporalDataInterval[columnName];
    };
    TableManager.prototype.getAQExtreme = function (columnName) {
        return this.temporalDataExtreme[columnName];
    };
    TableManager.prototype.getAirQualityColumnsNames = function (aqTable) {
        var _this = this;
        var colNames = aqTable.cols().map(function (col) {
            var isReturnable = true;
            for (var item in _this.temporalData) {
                if (col.desc.name.includes(item)) {
                    isReturnable = false;
                    break;
                }
            }
            if (isReturnable) {
                return col.desc.name;
            }
        });
        colNames = colNames.filter(function (e) { return e != null; });
        return colNames.concat(this.temporalData);
    };
    TableManager.prototype.getEntireAirQualityColumns = function (attributeName) {
        return this.airqualityTable
            .cols()
            .filter(function (col) { return col.desc.name.includes(attributeName); });
    };
    return TableManager;
}());
export default TableManager;
/**
 * Method to create a new TableManager instance
 * @returns {TableManager}
 */
export function create() {
    return new TableManager();
}
//# sourceMappingURL=tableManager.js.map