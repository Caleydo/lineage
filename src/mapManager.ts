import {feature as topofeature} from 'topojson';
import { list as listData, getFirstByName, get as getById } from 'phovea_core/src/data';
import { ITable } from 'phovea_core/src/table';

export default class MapManager{
  private maptopo;
  public tableManager;
  private demographic_table;
  public topojson_features;
  public selectedMapAttributeType;


  constructor(){
    this.maptopo = require('../../lineage_server/data/utah.json')
  }
  public async init(tableManager){
      this.tableManager = tableManager;
      this.demographic_table = <ITable>await getById('demographic_data')
      this.topojson_features= topofeature(this.maptopo, this.maptopo.objects.cb_2015_utah_county_20m);

  }



  public async prepareData(currentSelectedMapAttribute){
       let self = this;
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
       self.selectedMapAttributeType = orderedCols[2].valuetype.type;

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

       finishedPromises[1].forEach((IDNumber, index)=>{
         const dataEntry:any = {}
         dataEntry.ID = IDNumber;
         dataEntry.longitude = finishedPromises[0][index]
         dataEntry.latitude = finishedPromises[2][index]
         dataEntry.dataVal = finishedPromises[4][index]
         dataEntry.county_code = finishedPromises[6][index]
         dotDataAccum.push(dataEntry)
       })
        dotDataAccum = dotDataAccum.filter(d=>d.longitude && d.latitude)
      return dotDataAccum
   }



 }



export function create(){

    return new MapManager();
}
