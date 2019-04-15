import {feature as topofeature} from 'topojson';
import { list as listData, getFirstByName, get as getById } from 'phovea_core/src/data';
import { ITable } from 'phovea_core/src/table';

export default class MapManager{
  private maptopo;
  public tableManager;
  private demographic_table;
  public topojson_features;


  constructor(){
    this.maptopo = require('../../lineage_server/data/utah.json')
  }
  public async init(tableManager){
      this.tableManager = tableManager;
      this.demographic_table = <ITable>await getById('demographic_data')
      this.topojson_features= topofeature(this.maptopo, this.maptopo.objects.cb_2015_utah_county_20m);

  }



  prepareData(currentSelectedMapAttribute){
       let that = this;
       console.log(this.tableManager)
       // let longitudeArray = longitudeData.data;
       // let latitudeData = this.attributeTable.getColData()[this.attributeTable.getTableManager().colOrder.indexOf("latitude")];
       // let latitudeArray = latitudeData.data;
       // let bdateData = this.attributeTable.getColData()[this.attributeTable.getTableManager().colOrder.indexOf('bdate')].data;
       // let ddateData =  this.attributeTable.getColData()[this.attributeTable.getTableManager().colOrder.indexOf('ddate')].data;
       //
       // let countyCodeData = this.attributeTable.getColData()[this.attributeTable.getTableManager().colOrder.indexOf('CountyCode')].data;
       // let idData = longitudeData.ids;
       // let tempData = this.attributeTable.getColData()[this.attributeTable.getTableManager().colOrder.indexOf(this.selectedValue)].data;
       // let actualAttrData = []
       //
       // //The zipData is the data to draw. It is a 2D array, an element is [long,lat,personID]
       // let geoData = longitudeArray.map((longitude,index) =>{
       //   if (longitude.length===1){
       //     if (longitude!==0 && !isNaN(longitude[0])){
       //
       //       let geoLoc=[longitude[0],latitudeArray[index][0]];
       //
       //       if(that.selectedValue==='Age'){
       //           actualAttrData.push(tempData[index][0]);
       //           return {geoLocation:geoLoc,x:that.projection(geoLoc)[0], y:that.projection(geoLoc)[1],
       //             id:idData[index][0],value:tempData[index][0],countyCode:countyCodeData[index][0],bdate:bdateData[index][0],ddate:ddateData[index][0]}
       //       }
       //       else{
       //         if (tempData[index][0]!==undefined){
       //           let dataValue;
       //           if(that.selectedValue==='cause_death'){
       //             let tempVal = tempData[index][0].toUpperCase()
       //             if (tempVal.includes('SHOT')){
       //               dataValue='GUNSHOT';
       //             }
       //             else if (tempVal.includes('POISON')){
       //               dataValue = 'POISONING'
       //             }
       //             else{
       //               dataValue = tempVal
       //             }
       //           }
       //           else{
       //             dataValue = tempData[index][0].toUpperCase()
       //           }
       //           actualAttrData.push(dataValue);
       //         return {geoLocation:geoLoc,x:that.projection(geoLoc)[0], y:that.projection(geoLoc)[1],id:idData[index][0],
       //             value:dataValue,countyCode:countyCodeData[index][0],bdate:bdateData[index][0],ddate:ddateData[index][0]}
       //         }
       //       }
       //     }
       //   }
       // })
       // return [geoData,actualAttrData]
   }


}

export function create(){

    return new MapManager();
}
