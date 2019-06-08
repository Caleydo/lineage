import {feature as topofeature} from 'topojson';
import { list as listData, getFirstByName, get as getById } from 'phovea_core/src/data';
import { ITable } from 'phovea_core/src/table';
import { scaleLinear, scaleOrdinal, schemeCategory10} from 'd3-scale';
import {interpolatePurples} from 'd3-scale-chromatic';
import { VALUE_TYPE_CATEGORICAL,
        VALUE_TYPE_INT,
        VALUE_TYPE_REAL,
        VALUE_TYPE_STRING } from 'phovea_core/src/datatype';

export default class MapManager{
  private maptopo;
  public tableManager;
  private demographic_table;
  public topojson_features;
  public selectedMapAttributeType;
  public selectedAttributeVector;
  public scaleFunction;

  constructor(){
    this.maptopo = require('../../lineage_server/data/utah.json')
  }
  public async init(tableManager){
      this.tableManager = tableManager;
      this.demographic_table = <ITable>await getById('demographic_data')
      this.topojson_features= topofeature(this.maptopo, this.maptopo.objects.cb_2015_utah_county_20m);

  }



  public async prepareData(currentSelectedMapAttribute){
       const self = this;
       const graphView = await this.tableManager.graphTable;
       const attributeView = await this.tableManager.tableTable;
       const allCols = graphView.cols().concat(attributeView.cols());
       const colOrder = ['longitude','latitude',currentSelectedMapAttribute, 'CountyCode']
       let orderedCols = []
       for (const colName of colOrder) {
         for (const vector of allCols) {
           if (vector.desc.name === colName) {
             orderedCols.push(vector);
           }
         }
       }
       self.selectedAttributeVector = orderedCols[2];
       let dotDataAccum  = []
   //collect all the data important
       let allPromises = [];
       orderedCols.forEach((vector, index) => {
         allPromises = allPromises.concat([
           vector.data(),
           vector.names()
         ]);
       });
       const finishedPromises = await Promise.all(allPromises);
       let dataValDict = {}
       if (self.selectedAttributeVector.desc.name === 'KindredID'){
         finishedPromises[5].forEach((value, index)=>{
            if (self.tableManager.familyIDArray.indexOf(finishedPromises[4][index])>=0){
                dataValDict[value] = finishedPromises[4][index]}
          })
       }
       else {
         finishedPromises[5].forEach((value, index)=>{

                dataValDict[value] = finishedPromises[4][index]
          })
       }



       finishedPromises[1].forEach((IDNumber, index)=>{
         const dataEntry:any = {}
         dataEntry.ID = IDNumber;
         dataEntry.longitude = finishedPromises[0][index]
         dataEntry.latitude = finishedPromises[2][index]
         dataEntry.dataVal = dataValDict[IDNumber]
         dataEntry.county_code = finishedPromises[6][index]
         dotDataAccum.push(dataEntry)
       })
        dotDataAccum = dotDataAccum.filter(d=>d.longitude && d.latitude)
        self.selectedMapAttributeType = self.selectedAttributeVector.valuetype.type;

        if (self.selectedMapAttributeType === VALUE_TYPE_CATEGORICAL){
          const allCategories = self.selectedAttributeVector.desc.value.categories.map(c=>c.name)
          self.scaleFunction = function(inputValue){return schemeCategory10[allCategories.indexOf(inputValue)]}

        }
        else if (self.selectedMapAttributeType === VALUE_TYPE_INT ||self.selectedMapAttributeType === VALUE_TYPE_REAL){
          let dataScale = scaleLinear().domain(self.selectedAttributeVector.desc.value.range).range([0.2,1])
          self.scaleFunction = function(inputValue){return interpolatePurples(dataScale(inputValue))}
        }
        else if (self.selectedAttributeVector.desc.name === "KindredID"){
          console.log(self.tableManager.familyIDArray)
          self.scaleFunction = function(inputValue){
            return schemeCategory10[self.tableManager.familyIDArray.indexOf(inputValue)+1]}
        }
        else if(self.selectedMapAttributeType === 'id' || self.selectedMapAttributeType === 'idtype'
                  || self.selectedMapAttributeType === VALUE_TYPE_STRING){
          self.scaleFunction = function(inputValue){return '#295981'}
        }

      return dotDataAccum
   }



 }



export function create(){

    return new MapManager();
}
