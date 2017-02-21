import IDType from 'phovea_core/src/idtype/IDType';
import {ICategoricalVector, INumericalVector} from 'phovea_core/src/vector';
import {
  VALUE_TYPE_STRING, VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT, VALUE_TYPE_REAL,
  IDataType
} from 'phovea_core/src/datatype';
import ITable from 'phovea_core/src/table/ITable';
import {EventHandler} from 'phovea_core/src/event';
import {INumericalMatrix} from 'phovea_core/src/matrix';
import {IAnyVector} from 'phovea_core/src/vector';
import {list as listData, convertTableToVectors} from 'phovea_core/src/data';
import {parseRemoteTable as parseRemoteTable} from 'phovea_d3/src/parser';
import * as csvUrl from 'file-loader!../data/number_one_artists.csv';
import * as dsv from 'd3-dsv';



export default class dataExplorations {

  constructor() {

  }

  destroy() {

  }

  public async listMyDatasets() {
    console.log("Trying to list data");
    let test = await listData();
    console.log("Dataset");

    // const t = listData().then((d)=> console.log(convertTableToVectors(d)))
    // console.log("converted")
    // console.log(t);

    let table : ITable = <ITable> test[1];
   // console.log(table);
   // table.at(0, 0).then((d) => console.log("data: " + d));
    let vector = table.col(0);
    console.log("Lenght:" + vector.length);
    console.log("IDType:" + vector.idtype);
    console.log("First Element" + vector.at(0).then(
      (d) => console.log(d),
      (err) => console.log("Error: " + err)));

  //   table.col(0).then((d) => console.log("column: " + d));
    // table.data().then((d)=>console.log("what" + d));

    //let table: ITable = test[0]


   // Promise.all([test[0].cols()]).then(function (table){
//    })
  }

}

/**
 * Method to create a new graphData instance

 * @returns {graphData}
 */
export function create() {
  console.log("Eu");

  // parseRemoteTable(csvUrl).then(function (table) {
  //   console.log("What?");
  //   Promise.all([table.data(), table.cols()]).then(function (promise) {
  //
  //     console.log("All table data: " + promise[0].toString());
  //     var firstColumnVector = promise[1][0];
  //
  //     firstColumnVector.data().then(function (vectorData) {
  //       console.log("Data of first Column: " + promise[0].toString());
  //     });
  //   });
  // });

  return new dataExplorations();
}
