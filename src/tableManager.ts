import { ITable } from 'phovea_core/src/table';
import { list as listData, getFirstByName, get as getById } from 'phovea_core/src/data';
import { VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT, VALUE_TYPE_REAL, VALUE_TYPE_STRING } from 'phovea_core/src/datatype';
import * as range from 'phovea_core/src/range';
import * as events from 'phovea_core/src/event';
import { max, min, mean } from 'd3-array';
import { IStatistics } from 'phovea_core/src/math';
import { transition } from 'd3-transition';
import { easeLinear } from 'd3-ease';
import { __awaiter } from 'tslib';
import { isUndefined } from 'util';

import { select } from 'd3-selection';

import * as arrayVec from './ArrayVector';

import {
  json
} from 'd3-request';


interface IFamilyInfo {
  id: number;
  range: number[];
  size: number;
  affected: number;
  percentage:number;
  starCols:object[];
}

//Interface for the 'affected' state. Contains variable chosen to determine the 'affected' people and the threshold/value for 'affected' === true. Drives tree layout.
interface IAffectedState {
  name: string;
  type: string;
  data: any[];
  personIDs: Number[];
  isAffected(b: string | Number): boolean;
  attributeInfo: IPrimaryAttribute;
}

interface IPrimaryAttribute {
  primary: boolean; //true for primary; false for secondary;
  name: string; //attribute Name
  type: string; //Binary or MultiCategory *Should not be strings or idtypes.*
  data: any[];
  range: any[];
  personIDs: Number[];
}

/**
 * Interface for the primary Categorical and Quantitative Attributes
 */
interface IPrimaryCatAttribute extends IPrimaryAttribute {
  categories: string[]; //Array of categories
  color: string[]; // array of colors (1 to n).
}

//Interface for the primary or secondary Categorical Attributes.
interface IPrimaryQuantAttribute extends IPrimaryAttribute {
  range: Number[]; //max and min of the data. used to set the yscale in the attribute bar;
  color: string; // single color.  value is encoded by the height of the attribute bar.
  stats: IStatistics;
}


/**
 * Interfaces describing objects that describe a selected attribute and the associated ranges
 */
interface ISelectedCatAttribute {
  name: string;//Attribute Name
  values: string[]; //Array of categories selected (strings) that define a positive affected state
  type: string; //Attribute Type. May be redundant if the interface is only for categorical data.
  range: range.Range[]; //Array of ranges representing people who match any of the categories in the value field.
}

interface ISelectedQuantAttribute {
  name: string;//Attribute Name
  values: number[]; //Array of tuples (start and end values) that define a positive affected state
  type: string; //Attribute Type. Within quantitative data this could be ints, floats, etc..
  range: range.Range[]; //Array of ranges representing people who match the interval defined in the value field.
}

//Create new type that encompasses both types of selectedAttributes
export type selectedAttribute = ISelectedCatAttribute | ISelectedQuantAttribute;

//Create new type that encompasses both types of primary attributes
//export type attribute = IPrimaryCatAttribute | IPrimaryQuantAttribute;

const indexOfKindredIDColumn = 1;

export const VIEW_CHANGED_EVENT = 'view_changed_event';
export const TABLE_VIS_ROWS_CHANGED_EVENT = 'table_vis_rows_changed_event';
export const PRIMARY_SELECTED = 'primary_secondary_attribute_event';
export const POI_SELECTED = 'affected_attribute_event';
export const FAMILY_INFO_UPDATED = 'family_stats_updated';
export const COL_ORDER_CHANGED_EVENT = 'col_ordering_changed';
export const FAMILY_SELECTED_EVENT = 'family_selected_event';
export const UPDATE_TABLE_EVENT = 'update_table';
export const ADJ_MATRIX_CHANGED = 'adjacency_matrix_changed';
export const GRAPH_ADJ_MATRIX_CHANGED = 'graph_adj_matrix_changed';
export const ATTR_COL_ADDED = 'attr_col_added';
export const AGGREGATE_CHILDREN = 'aggregate_children';
export const PATHWAY_SELECTED = 'pathway_selected';
export const TREE_PRESERVING_SORTING = 'tree_preserving_sorting';

import {
  DB_CHANGED_EVENT
} from './headers';


// export const PRIMARY_COLOR = '#335b8e';
// export const PRIMARY_COLOR_2 = '#b5b867';
//
// export const SECONDARY_COLOR = '#9f295d';
// export const SECONDARY_COLOR_2 = '#e7a396';
//
// export const PRIMARY_CATEGORICAL_COLORS = ['#b5b867', '#ffea59', '#b7dbdb', '#335b8e', '#6ca18f'];
// export const SECONDARY_CATEGORICAL_COLORS = ['#e7a396', '#9f295d', '#d9a34b', '#ecd1ca', '#430e00']; //
//

export const POI_COLOR = '#285880';
export const POI_COLOR_2 = '#49aaf3';

export const PRIMARY_COLOR = '#598e7c';
export const PRIMARY_COLOR_2 = '#b5b867';
export const PRIMARY_COLOR_3 = '#9f0e72';
export const PRIMARY_COLOR_4 = '#e7a396';
export const PRIMARY_COLOR_5 = '#882c00';
export const PRIMARY_COLOR_6 = '#B7DBDB';
// export const PRIMARY_COLOR_7 = '#337CAF';


export const PRIMARY_CATEGORICAL_COLORS = [PRIMARY_COLOR, PRIMARY_COLOR_2, PRIMARY_COLOR_3, PRIMARY_COLOR_4, PRIMARY_COLOR_5, PRIMARY_COLOR_6];



/**
 * This class manages the data structure for the graph, the table visualization and the attribute selection panel.
 */
export default class TableManager {

  /** The master table that contains the graph and some attribute information */
  table: ITable;

  /** The table that contains attribute information */
  attributeTable: ITable;

  public adjMatrixCols=[]; //array of cols to add to the table view for the Adj Matrix;

  /** The table view (of attributeTable) used in the table visualization */
  public tableTable: ITable; // table view
  /** The columns currently displayed in the table */
  private activeTableColumns: range.Range = range.all(); //default value;
  /** The rows currently shown in the table, a subset of the activeGraphRows */
  private _activeTableRows: range.Range = range.all(); //default value;

  /** The table view (of table) used for the graph */
  public graphTable: ITable; // table view
  /** All rows that are used in the graph - corresponds to a family */
  private _activeGraphRows: range.Range = range.all();
  /** The columns currently displayed in the graph  */
  private activeGraphColumns: range.Range = range.all(); //default value
  /** Array of Selected Attributes in the Panel */
  private _selectedAttributes: selectedAttribute[];

  // private defaultCols: String[] =
  //   ['KindredID','PersonID', 'Asthma', 'Bipolar', 'sex', 'deceased', 'suicide', 'gen', 'Age', 'FirstBMI', 'AgeFirstBMI', 'race', 'cause_death', 'weapon']; //set of default cols to read in, minimizes load time for large files;

  public defaultCols: String[];

  // //default cols for Autism data
  // private defaultCols: String[] =
  // ['KindredID', 'RelativeID', 'sex', 'affected', 'labid'];

  public colOrder;
  //Array of attributes that are 'starred' in the table;
  private starCols=[];

  /** Basic information about all the loaded families */
  public readonly familyInfo: IFamilyInfo[] = [];

  // TODO what is this? Should this be in this class?
  public yValues;

  /** Holds the information for the 'affectedState' including variable and threshold */
  public affectedState: IAffectedState;

  public dataSets = ['Dataset 1','Dataset 2', 'Dataset 3'];

  //Keeps track of selected primary/secondary variable
  private primaryAttribute: IPrimaryAttribute;

  public t = transition('t').duration(600).ease(easeLinear);

  //Method that adds cols from the Family Selector;
  public addStar(attributeName:string,trueValue:string) {
    this.updateFamilySelector(attributeName,trueValue,true);
  }

  //Method that removes cols from the Family Selector;
  public removeStar(attributeName:string) {
    this.updateFamilySelector(attributeName,undefined,false);
  }

  constructor() {

    events.on(DB_CHANGED_EVENT, ()=> {
            //clear selected attributes;
            this.colOrder = [];
            this.adjMatrixCols=[];
            this.yValues= {};
            events.fire(TABLE_VIS_ROWS_CHANGED_EVENT);
    });

    events.on(ADJ_MATRIX_CHANGED, (evt,info)=> {

      //append  col from adj matrix;

      if (info.remove) {
        this.colOrder.splice(this.colOrder.indexOf(info.name), 1);

        const adjMatrixCol = this.adjMatrixCols.find((a:any )=> {return a.desc.name === info.name; });
        this.adjMatrixCols.splice(this.adjMatrixCols.indexOf(adjMatrixCol),1);

        events.fire(COL_ORDER_CHANGED_EVENT);
      } else {


        //Add fake vector here:
        const arrayVector = arrayVec.create(info.type);

        arrayVector.desc.name = info.name;


        const id = encodeURIComponent(info.uuid);

       const url = 'api/data_api/edges/' + info.db + '/' + id;

       const postContent = JSON.stringify({ 'treeNodes': info.nodes});

       console.log('edge url is ', url);
              json(url)
              .header('Content-Type', 'application/json')
              .post(postContent, (error, edges: any) => {
                if (error) {
                  throw error;
                }
                arrayVector.dataValues = edges.nodes.map((e)=> {return e;});
                arrayVector.idValues = edges.nodes.map((e)=> {return e.uuid;});

                //if it's not already in there:
                if (this.adjMatrixCols.filter((a:any )=> {return a.desc.name === arrayVector.desc.name; }).length<1) {
                  this.adjMatrixCols =this.adjMatrixCols.concat(arrayVector); //store array of vectors
                }

                //if it's not already in there:
                if (this.colOrder.filter((a:any )=> {return a === arrayVector.desc.name; }).length<1) {
                  this.colOrder = this.colOrder.concat([arrayVector.desc.name]); // store array of names
                }

                events.fire(TABLE_VIS_ROWS_CHANGED_EVENT);

              });

      }

    });
  }

  /**
   * Loads the graph data and the attribute data from the server and stores it in the public table variable
   * Parses out the familySpecific information to populate the Family Selector
   * @param: id of the dataset
   */
  public async loadData(descendDataSetID: string, attributeDataSetID: string) {

    if (descendDataSetID === 'AllFamiliesDescend' || descendDataSetID ===  'TenFamiliesDescendAnon') {
      // this.defaultCols = ['KindredID', 'RelativeID', 'sex', 'deceased', 'suicide', 'Age','LabID','alcohol','Nr.Diag_alcohol','psychosis','Nr.Diag_psychosis','anxiety-non-trauma','Nr.Diag_anxiety-non-trauma', 'depression','cause_death']; //set of default cols to read in, minimizes load time for large files;
      this.defaultCols = ['KindredID', 'RelativeID', 'sex', 'deceased', 'suicide', 'Age','LabID','bipolar spectrum illness','anxiety-non-trauma','alcohol','PD','psychosis','depression','cause_death']; //set of default cols to read in, minimizes load time for large files;

    } else {
      this.defaultCols = [];
    };

    this.colOrder = this.defaultCols;

    //retrieving the desired dataset by name
    const attributeTable = <ITable>await getById(attributeDataSetID);

    try {
      await attributeTable.col(0).data().then();
    } catch (err) {
      return undefined;
  }

    // console.log('error is ',error)
    // if (error) {
    //   return undefined;
    // }
    // console.log('AttributeTable is ',attributeTable);

    if (!attributeTable) {
      return;
    };

    this.attributeTable = attributeTable;

    //retrieving the desired dataset by name
    this.table = <ITable>await getById(descendDataSetID);

    // await this.parseFamilyInfo(); //this needs to come first because the setAffectedState sets default values based on the data for a selected family.

    await this.refreshActiveGraphView();
    await this.refreshActiveTableView();
    return Promise.resolve(this);
  }


  /**
   *
   * This function get the requested attribute for the person requested if the attribute is a POI, primary, or secondary.
   * Returns undefined if there is no value.
   *
   * @param attribute - attribute to search for
   * @param personID - person for which to search for attribute
   */
  public getAttribute(attribute, personID) {

    let selectedAttribute;

    if (attribute === this.affectedState.name) {
      selectedAttribute = this.affectedState;
    } else if (this.primaryAttribute && attribute === this.primaryAttribute.name) {
      selectedAttribute = this.primaryAttribute;
    } else { //Attribute is neither primary nor secondary nor POI;
      console.log('neither POI nor primary');
      return undefined;
    }

    const ids = selectedAttribute.personIDs;

    if (ids.indexOf(personID) > -1) {
      const index = ids.indexOf(personID);
      const value = selectedAttribute.data[index];
      return value;
    } else {
      return undefined;
    }
  }

  /**
   *
   * This function get the requested attribute vector.
   *
   * @param attribute - attribute to search for
   * @param allFamilies - boolean set to true to return the attribute vector for all families. Defaults to false.
   */
  public async getAttributeVector(attributeName, allFamilies=false) {

    let allColumns;
    //Find Vector of that attribute in either table.
    if (this.graphTable && !allFamilies) { //familyView has been defined && allFamilies has not been requested)
      allColumns = this.graphTable.cols().concat(this.tableTable.cols());
    } else {
      allColumns = this.table.cols().concat(this.attributeTable.cols());
    }

    let attributeVector = undefined;
    allColumns.forEach((col) => {
      if (col.desc.name === attributeName) {
        attributeVector = col;
      }
    });

    return attributeVector;
  }


  public async setPrimaryAttribute(attributeName?) {

    if (!attributeName) {
      this.primaryAttribute = undefined;
      events.fire(PRIMARY_SELECTED, undefined);
      return;
    }
    let binaryColorChoice1, binaryColorChoice2, multipleColorChoice;

    binaryColorChoice1 = PRIMARY_COLOR;
    binaryColorChoice2 = PRIMARY_COLOR_2;
    multipleColorChoice = PRIMARY_CATEGORICAL_COLORS;

    let attributeVector;
    let categories;
    let color;

    //Find Vector of that attribute in either table.
    const allColumns = this.graphTable.cols().concat(this.tableTable.cols());

    allColumns.forEach((col) => {
      if (col.desc.name === attributeName) {
        attributeVector = col;
      }
    });

    //Store data and associated personIDs for graph rendering of attribute bars or change of POI
    const attributeDefinition: IPrimaryAttribute = {
      name: attributeName, primary: true, type: attributeVector.valuetype.type,
      'data': await attributeVector.data(), 'range': attributeVector.desc.value.range, 'personIDs': (await attributeVector.names())
    };

    const data = await attributeVector.data();
    if (attributeDefinition.type === VALUE_TYPE_CATEGORICAL) {
      const categoricalDefinition = <IPrimaryCatAttribute>attributeDefinition;
      categories = attributeVector.desc.value.categories.map((c) => { //get categories from index.json def
        return c.name;
      });

      if (categories.length === 2) {//binary categorical data
        color = [binaryColorChoice2, binaryColorChoice1];
      } else {
        color = multipleColorChoice.slice(0, categories.length); //extract one color per category;
      }
      categoricalDefinition.categories = categories;
      categoricalDefinition.color = color;
    } else if (attributeDefinition.type === VALUE_TYPE_INT || attributeDefinition.type === VALUE_TYPE_REAL) {
      const quantDefinition = <IPrimaryQuantAttribute>attributeDefinition;
      quantDefinition.stats = await attributeVector.stats();
      quantDefinition.color = binaryColorChoice1;
    }

    this.primaryAttribute = attributeDefinition;

    events.fire(PRIMARY_SELECTED, attributeDefinition);

    return attributeDefinition;

  }

  /**
   * This function updates the data and ids for the affected State (POI) and primary attribute when a different family is selected.
   *
   */
  public async updatePOI_Primary() {
    if (this.affectedState) {
      const attributeVector = await this.getAttributeVector(this.affectedState.name);
      const varType = attributeVector.valuetype.type;

      this.affectedState.data = await attributeVector.data();
      this.affectedState.personIDs = (await attributeVector.names());
    }

    if (this.primaryAttribute) {
      const attributeVector = await this.getAttributeVector(this.primaryAttribute.name);
      const varType = attributeVector.valuetype.type;

      this.primaryAttribute.data = await attributeVector.data();
      this.primaryAttribute.personIDs = (await attributeVector.names());
    }
  }


  /**
   *
   * This function sets the affected State.
   *
   */
  public async setAffectedState(varName, isAffectedCallbackFcn?) {


    const attributeVector = await this.getAttributeVector(varName, true);
    const varType = attributeVector.valuetype.type;


    let threshold;

    if (typeof isAffectedCallbackFcn === 'undefined') {

      if (varType === VALUE_TYPE_INT || varType === VALUE_TYPE_REAL) {
        const stats = await attributeVector.stats();
        isAffectedCallbackFcn = (attr: Number) => {
          return attr >= stats.mean;
        }; //if threshold hasn't been defined, default to anything over the mean value
        threshold = stats.mean;
        if (threshold > attributeVector.desc.value.range[1]) {
          threshold = (attributeVector.desc.value.range[1] - attributeVector.desc.value.range[0]) / 2 + attributeVector.desc.value.range[0];
        }
      } else if (varType === VALUE_TYPE_CATEGORICAL) {
        const categoriesVec = attributeVector.valuetype.categories;
        const categories = categoriesVec.map((c) => {
          return c.name;
        });
        let category;

        if (categories.find((d) => {
          return d === 'Y';
        })) {
          category = 'Y';
        } else if (categories.find((d) => {
          return (d === 'TRUE' || d === 'True');
        })) {
          category = 'TRUE';
        } else if (categories.find((d) => {
          return d === 'F';
        })) {
          category = 'F';
        } else {
          category = categories[0];
        }

        isAffectedCallbackFcn = (attr: string) => {
          return !isUndefined(attr) && attr.toLowerCase() === category.toLowerCase(); //solve the True/TRUE problem once and for all.
        };
        threshold = category;
      } else if (varType === VALUE_TYPE_STRING) {
        isAffectedCallbackFcn = (attr: string) => {
          return attr !== undefined && attr.length > 0;
        }; //string is non empty
      }

    }

    const data = await attributeVector.data();
    const personIDs = (await attributeVector.names());

    let binaryColorChoice1, binaryColorChoice2, multipleColorChoice;

    binaryColorChoice1 = POI_COLOR;
    binaryColorChoice2 = POI_COLOR;
    multipleColorChoice = [POI_COLOR, POI_COLOR, POI_COLOR, POI_COLOR, POI_COLOR, POI_COLOR];

    let categories;
    let color;

    //Store data and associated personIDs for graph rendering of attribute bars
    const attributeDefinition: IPrimaryAttribute = {
      name: varName, primary: false, type: varType,
      'data': data, 'range': attributeVector.desc.value.range, 'personIDs': (await attributeVector.names())
    };


    if (attributeDefinition.type === VALUE_TYPE_CATEGORICAL) {
      const categoricalDefinition = <IPrimaryCatAttribute>attributeDefinition;
      categories = attributeVector.desc.value.categories.map((c) => {
        return c.name;
      });

      if (categories.length === 2) {//binary categorical data
        color = [binaryColorChoice2, binaryColorChoice1];
      } else {
        color = multipleColorChoice.slice(0, categories.length); //extract one color per category;
      }
      categoricalDefinition.categories = categories;
      categoricalDefinition.color = color;

    } else if (attributeDefinition.type === VALUE_TYPE_INT || attributeDefinition.type === VALUE_TYPE_REAL) {
      const quantDefinition = <IPrimaryQuantAttribute>attributeDefinition;
      quantDefinition.stats = await attributeVector.stats();
      quantDefinition.color = binaryColorChoice1;
    }

    this.affectedState = ({
      name: varName,
      type: varType,
      'isAffected': isAffectedCallbackFcn,
      'data': data,
      'personIDs': personIDs,
      'attributeInfo': attributeDefinition
    });

    //if Primary Attribute was previously set to this same attribute, clear primary
    if (this.primaryAttribute && this.primaryAttribute.name === this.affectedState.name) {
      this.primaryAttribute = undefined;
      events.fire(PRIMARY_SELECTED, undefined);
    }

    //Update family selector
    this.updateFamilyStats();
    events.fire(POI_SELECTED, this.affectedState);

    return { threshold, 'type': varType };
  }


  /**
   * This function changes the range of rows to display on the selected family.
   * @param chosenFamilyID the numeric value of the familyID, uses the first family ID when none is specified
   */
  public async selectFamily(chosenFamilyIDs: number[] = [this.familyInfo[0].id]) {
    console.log('selectingFamily',chosenFamilyIDs);

    const family = this.familyInfo.find((family) => { return family.id === chosenFamilyIDs[0]; });
    let familyRange = range.list(family.range); //familyRange.concat(family.range);

    chosenFamilyIDs.forEach((id, i) => {
      const family = this.familyInfo.find((family) => {
        return family.id === chosenFamilyIDs[i];
      });
      if (i > 0) {
        familyRange = familyRange.union(range.list(family.range));
      }
    });

    this._activeGraphRows = familyRange;

    await this.refreshActiveGraphView();

    //Update the activeAttributeRows. This ensure that vector.stats() returns the correct values in the table.

    const familyMembersRange = await this.graphTable.col(0).ids();
    const familyMembers = familyMembersRange.dim(0).asList();
    const attributeMembersRange = await this.attributeTable.col(0).ids();
    const attributeMembers = attributeMembersRange.dim(0).asList();

    const attributeRows = [];

    attributeMembers.forEach((member, i) => {
      if (familyMembers.indexOf(member) > -1) {
        attributeRows.push(i);
      }
    });

    this._activeTableRows = range.list(attributeRows);

    await this.refreshActiveTableView();

    this.updatePOI_Primary();
      events.fire(FAMILY_SELECTED_EVENT);

  }


  /**
   * This function calculates the number of affected people based on the current POI selected in the panel.
   */
  public async updateFamilyStats() {

    const attributeVector = await this.getAttributeVector(this.affectedState.name, true); //get Attribute Vector for all families
    const kindredIDVector = await this.getAttributeVector('KindredID', true); //get FamilyID vector for all families

    const familyIDs: number[] = <number[]>await kindredIDVector.data();
    const peopleIDs: string[] = await kindredIDVector.names();

    const attributeData = await attributeVector.data();
    const attributePeople = await attributeVector.names();

    const uniqueFamilyIDs = Array.from(new Set(familyIDs));

    const affectedDict = {};

    //Initialize count of affected people to 0 for all families
    uniqueFamilyIDs.map((familyID)=> {
      affectedDict[familyID]=0;
    });

    if (attributeData.length !== familyIDs.length) {
      console.log('problem in paradise');
    }

    attributeData.map((dataPoint,ind)=> {
      if (this.affectedState.isAffected(dataPoint)) {
        affectedDict[familyIDs[ind]] = affectedDict[familyIDs[ind]]+1;
      } ;
    });

    //set affected count in this.familyInfo;
    uniqueFamilyIDs.map((familyID,index)=> {
      this.familyInfo[index].affected=affectedDict[familyID];
      this.familyInfo[index].percentage=affectedDict[familyID]/this.familyInfo[index].size;
    });

    events.fire(FAMILY_INFO_UPDATED, this);
  }

  /**
   * This function calculates the number of affected people based on the current POI selected in the panel.
   */
  public async updateFamilySelector(attribute:string,trueValue:string,add:boolean) {

        //Remove Star attribute
        if (!add) {
          const allAttributes = this.familyInfo[0].starCols.map((attr:any)=> {return attr.attribute;});
          const toRemove = allAttributes.indexOf(attribute);
          this.familyInfo.map((family)=> {
            family.starCols.splice(toRemove,1);
          });
          events.fire(FAMILY_INFO_UPDATED, this);
          return;
        }
        const poiVector = await this.getAttributeVector(this.affectedState.name, true); //get POI Vector for all families
        const attributeVector = await this.getAttributeVector(attribute, true); //get Attribute Vector for all families
        const kindredIDVector = await this.getAttributeVector('KindredID', true); //get FamilyID vector for all families

        const familyIDs: number[] = <number[]>await kindredIDVector.data();
        const peopleIDs: string[] = await kindredIDVector.names();

        const poiData = await poiVector.data();
        const poiIDs = await poiVector.names();
        const attributeData = await attributeVector.data();
        const attributePeopleIDs = await attributeVector.names();

        const uniqueFamilyIDs = Array.from(new Set(familyIDs));

        const starCountDict = {};

        //Initialize count of affected people to 0 for all families
        uniqueFamilyIDs.map((familyID)=> {
          starCountDict[familyID]=0;
        });

        attributeData.map((dataPoint,ind)=> {
          if (dataPoint === trueValue || (!trueValue && dataPoint)) { //account for cases when having a value (like LabID) is considered a 1
             const poiInd = (attributeData.length === familyIDs.length ? ind : poiIDs.indexOf(attributePeopleIDs[ind]));
             if (this.affectedState.isAffected(poiData[poiInd])) {
            starCountDict[familyIDs[poiInd]] = starCountDict[familyIDs[poiInd]]+1;
          } ;
        };
        });

        //set affected count in this.familyInfo;
        uniqueFamilyIDs.map((familyID,index)=> {
          //account for families with no affected people (happens when you change the POI).
          const percentage = this.familyInfo[index].affected > 0 ? starCountDict[familyID]/this.familyInfo[index].affected : 0;
          this.familyInfo[index].starCols.push({attribute,count:starCountDict[familyID],percentage});
        });

       events.fire(FAMILY_INFO_UPDATED, this);
      }


  /**
   * This function is called after loadData.
   * This function populates needed variables for attribute table and attribute panel
   *
   */
  public async parseAttributeData() {
    const columns = await this.attributeTable.cols();

    const colIndexAccum = [];

    //populate active attribute array
    columns.forEach((col, i) => {
      const type = col.desc.value.type;

      if (type !== 'idtype') {
        colIndexAccum.push(i);//push the index so we can get the right view
      }
    });

    this._activeTableRows = range.all();
    this.activeTableColumns = range.list(colIndexAccum);

    await this.refreshActiveTableView();

  }

  /**
   * This function is called after loadData.
   * This function populates needed variables for family selector
   *
   */
  public async parseFamilyInfo() {

    const familyIDs: number[] = <number[]>await this.table.col(indexOfKindredIDColumn).data(); //Assumes kindredID is the first col. Not ideal.
    // const affectedColData = await this.table.colData(this.affectedState.name);

    const uniqueFamilyIDs = Array.from(new Set(familyIDs));

    for (const id of uniqueFamilyIDs) {
      //Array to store the ranges for the selected family
      const familyRange = [];
      const affected = 0;
      const percentage = 0;

      familyIDs.forEach((d, i) => {
        if (d === id) {
          familyRange.push(i);
        }
      });

      this.familyInfo.push({ id, range: familyRange, size: familyRange.length, affected, percentage,starCols:[]});
    }

    // //Set active graph Cols
    const columns = await this.table.cols();

    const colIndexAccum = [];

    //populate active attribute array
    columns.forEach((col, i) => {
      const type = col.desc.value.type;

      // if (type !== 'idtype') {
      colIndexAccum.push(i);//push the index so we can get the right view
      // }
    });

    this.activeGraphColumns = range.list(colIndexAccum);

    await this.refreshActiveGraphView();

    await this.selectFamily(); //call to selectFamily is now made from the familySelector object
  }

  /**
   * Uses the active rows and cols to create new table and graph tables and fires a {VIEW_CHANGED_EVENT} event when done.
   * @return {Promise<void>}
   */
  public async refreshActiveViews() {
    await this.refreshActiveTableView();
    await this.refreshActiveGraphView();
  }

  /**
   * Uses the active rows and cols to create new table view.
   * @return {Promise<void>}
   */
  public async refreshActiveTableView() {
    const tableRange = range.join(this._activeTableRows, this.activeTableColumns);
    this.tableTable = await this.attributeTable.view(tableRange); //view on attribute table
  }

  /**
   * Uses the active rows and cols to create new graph view.
   * @return {Promise<void>}
   */
  public async refreshActiveGraphView() {
    const graphRange = range.join(this._activeGraphRows, this.activeGraphColumns);
    this.graphTable = await this.table.view(graphRange); //view on graph table
  }


  /**
   * Updates the active rows for the table visualization, creates a new table view and fires a {TABLE_VIS_ROWS_CHANGED} event.
   * @param newRows
   */
  set activeTableRows(newRows: range.Range) {
    this._activeTableRows = newRows;
    this.tableTable = this.table.view(range.join(this._activeTableRows, this.activeTableColumns));
    console.log('firing TABLE VIS ROWS from activeTableRows');
    events.fire(TABLE_VIS_ROWS_CHANGED_EVENT);
  }

  /**
   * Updates the active rows for the table visualization, creates a new table view and fires a {TABLE_VIS_ROWS_CHANGED} event.
   * @param newRows
   */
  set activeGraphRows(newRows: string[]) {

    this.table.col(0).ids().then((allIDsRange) => {

      const allIDs = allIDsRange.dim(0).asList();

      const newRange = [];
      allIDs.forEach((id, i) => {
        if (newRows.indexOf(id.toString()) > -1) {
          newRange.push(i);
        }
      });

      this._activeGraphRows = range.list(newRange);
      this.refreshActiveGraphView().then(() => {
        events.fire(TABLE_VIS_ROWS_CHANGED_EVENT);
      });

    });

  }


  /**
   * Updates the array of selectedAttributes in the panel.
   * @param newRows
   */
  set selectedAttributes(attributes: selectedAttribute[]) {
    this._selectedAttributes = attributes;
  }

  public getDemographicColumns() {
    return this.table.cols();
  }

  public getAttrColumns() {
    return this.attributeTable.cols();
  }
}

/**
 * Method to create a new TableManager instance
 * @returns {TableManager}
 */
export function create() {
  return new TableManager();
}
