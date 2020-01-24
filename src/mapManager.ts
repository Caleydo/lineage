import { feature as topofeature } from 'topojson';
import {
  list as listData,
  getFirstByName,
  get as getById
} from 'phovea_core/src/data';
import { ITable } from 'phovea_core/src/table';
import { scaleLinear, scaleOrdinal, schemeCategory10 } from 'd3-scale';
import { interpolatePurples } from 'd3-scale-chromatic';
import {
  VALUE_TYPE_CATEGORICAL,
  VALUE_TYPE_INT,
  VALUE_TYPE_REAL,
  VALUE_TYPE_STRING
} from 'phovea_core/src/datatype';

export default class MapManager {
  private maptopo;
  public tableManager;
  private demographicTable;
  public topojsonFeatures;
  public selectedMapAttributeType;
  public selectedAttributeVector;
  public scaleFunction;

  constructor() {
    this.maptopo = require('../../lineage_server/data/utah.json');
  }
  public async init(tableManager) {
    this.tableManager = tableManager;
    this.demographicTable = <ITable>await getById('demographic_data');
    this.topojsonFeatures = topofeature(
      this.maptopo,
      // this.maptopo.objects.cb_2015_utah_county_20m
            this.maptopo.objects.census_suic
    );
  }

  public async prepareData(currentSelectedMapAttribute) {
    const self = this;
    const graphView = await this.tableManager.graphTable;
    const attributeView = await this.tableManager.tableTable;
    const allCols = graphView.cols().concat(attributeView.cols());
    // console.log('alll cols', [...allCols.map((d)=>d.desc.name)])
    const colOrder = [
      'longitude',
      'latitude',
      currentSelectedMapAttribute,
      'STATENUM',
      'GEOID10',
      'TRACTCE10',
      'KindredID'
    ];
    const orderedCols = [];
    for (const colName of colOrder) {
      for (const vector of allCols) {
        if (vector.desc.name === colName) {
          // console.log('colname in vector', colName)
          orderedCols.push(vector);
        }
      }
    }
    self.selectedAttributeVector = orderedCols[2];
    let dotDataAccum = [];
    //collect all the data important
    let allPromises = [];
    orderedCols.forEach((vector, index) => {
      allPromises = allPromises.concat([vector.data(), vector.names()]);
    });
    const finishedPromises = await Promise.all(allPromises);
    const dataValDict = {};
    if (self.selectedAttributeVector.desc.name === 'KindredID') {
      finishedPromises[5].forEach((value, index) => {
        if (
          self.tableManager.familyIDArray.indexOf(finishedPromises[4][index]) >=
          0
        ) {
          dataValDict[value] = finishedPromises[4][index];
        }
      });
    } else {
      finishedPromises[5].forEach((value, index) => {
        dataValDict[value] = finishedPromises[4][index];
      });
    }
    // console.log('dataval', dataValDict);
    // console.log('finishedPromises', finishedPromises.length);
    // console.log('finished promises', finishedPromises[8])

    finishedPromises[1].forEach((idNumber, index) => {
      const dataEntry: any = {};
      dataEntry.ID = idNumber;
      dataEntry.longitude = finishedPromises[0][index];
      dataEntry.latitude = finishedPromises[2][index];
      dataEntry.dataVal = dataValDict[idNumber];
      dataEntry.statenum = finishedPromises[6][index];
      dataEntry.GEOID10 = finishedPromises[8][index];
      dataEntry.TRACTID10 = finishedPromises[10][index];
      dataEntry.KindredID = finishedPromises[12][index];
      // TODO - CHECK IF KINDREDID COMES THROUGH
      dotDataAccum.push(dataEntry);
    });
    // console.log('finished promises[1] id?', finishedPromises[1])
    //Only return rows with lat and lon
    dotDataAccum = dotDataAccum.filter((d) => d.longitude && d.latitude);
    self.selectedMapAttributeType = self.selectedAttributeVector.valuetype.type;
    //Generate the necessary scale functions for the data based on type
    //Categorical
    if (self.selectedMapAttributeType === VALUE_TYPE_CATEGORICAL) {
      const allCategories = self.selectedAttributeVector.desc.value.categories.map(
        (c) => c.name
      );
      self.scaleFunction = function(inputValue) {
        return schemeCategory10[allCategories.indexOf(inputValue)];
      };
    //  Int or Real:
    } else if (
      self.selectedMapAttributeType === VALUE_TYPE_INT ||
      self.selectedMapAttributeType === VALUE_TYPE_REAL
    ) {
      const dataScale = scaleLinear()
        .domain(self.selectedAttributeVector.desc.value.range)
        .range([0.2, 1]);
      self.scaleFunction = function(inputValue) {
        return interpolatePurples(dataScale(inputValue));
      };
    //  if selected attr is 'KindredID' - same as categorical
    } else if (self.selectedAttributeVector.desc.name === 'KindredID') {
      console.log(self.tableManager.familyIDArray);
      self.scaleFunction = function(inputValue) {
        return schemeCategory10[
          self.tableManager.familyIDArray.indexOf(inputValue) + 1
        ];
      };
    //  selected attr is id, idtype, or string : blue
    } else if (
      self.selectedMapAttributeType === 'id' ||
      self.selectedMapAttributeType === 'idtype' ||
      self.selectedMapAttributeType === VALUE_TYPE_STRING
    ) {
      self.scaleFunction = function(inputValue) {
        return '#295981';
      };
    }

    return dotDataAccum;
  }
  public mappedCase = class {
    private mapManager = this;
    private caseID;
    private geoID;
    private lat;
    private lon;
    private radius;
    private currentAttributeValue;
    private currentAttribute;
    private attributes;
    private layerCoords;
    constructor(geoID, dataval, currentAttribute) {
      this.geoID = geoID;
      this.currentAttributeValue = dataval;
      this.currentAttribute = currentAttribute;
    }
    private getCoords(geographies, latCol = 'INTPTLAT10', lonCol = 'INTPTLON10') {
      const self = this;
      const match = geographies.find((g)=>g.properties.GEOID10.toString() === self.geoID.toString());
      self.lat = match.properties[latCol];
      self.lon = match.properties[lonCol];
      console.log('match', match);
      // get geography that matches self.geoID and set lat lon and attributes
    }
};
}

export function create() {
  console.log('create called in map manager');
  return new MapManager();
}
