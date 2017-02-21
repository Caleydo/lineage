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

    // listData() returns a list of all datasets loaded by the server
    let all_datasets = await listData();

    // TODO: access a dataset by name

    // here we pick the first dataset and cast it to ITable
    let table: ITable = <ITable> all_datasets[0];
    console.log("The Table: " + table);

    // Here we retrieve the first vector from the table.
    let vector = table.col(0);
    console.log("Length:" + vector.length);
    console.log("IDType:" + vector.idtype);

    // whenever you access raw data, the data structures return promises, not the data directly.
    // what you do is, you call a then function, which takes two callbacks as parameters.
    // The first one handles the "good" case and passes the data in.
    // The second one handles the "bad" case and handles the error:

    // FIXME: broken, error 500
    let first_element = vector.at(0).then(
      function (d) {
        console.log(d);
      },
      function (error) {
        console.log("Error: " + error);
      });

    console.log(first_element);

    // Here is exactly the same code using the arrow notation, for the second element in the vector.
    // FIXME: broken, error 500
    let second_element = vector.at(1).then(
      (d) => console.log(d),
      (err) => console.log("Error: " + err));

    console.log("Second Element" + second_element);

    // Here we directly access the first element in the first vector:
    // FIXME: broken, error 500
    table.at(0, 0).then((d) => console.log("data: " + d));

    // TODO: access a vector by name

    // TODO: slice a vector by range

    // TODO: get a summary statistic on views

  }
}

/**
 * Method to create a new graphData instance

 * @returns {graphData}
 */
export function create() {
  console.log("Eu");

  // Here we demonstrate how to parse a local table.
  // To do that, put your data file and your json data description in the top-level data directory.
  // Import the CSV's url using the import statement (see above)
  // import * as csvUrl from 'file-loader!../data/number_one_artists.csv';
  // The "file-loader! is a webpack feature to load the file TODO: more background?


  // We use the parseRemoteTable function that's part of the phovea_d3 package (also included above).
  // FIXME Broken
  parseRemoteTable(csvUrl).then(function (table) {
    console.log("What?");
    Promise.all([table.data(), table.cols()]).then(function (table) {

      // table here is an instance of ITable FIXME - no idea whether that's correct
            console.log("All table data: " + table[0].toString());
      // FIXME - this should work?
      let firstColumnVector = table[1][0];

      firstColumnVector.data().then(function (vectorData) {
        console.log("Data of first Column: " + table[0].toString());
      });
    });
  });

  return new dataExplorations();
}
