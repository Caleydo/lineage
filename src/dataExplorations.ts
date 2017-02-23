import {ITable, asTable} from 'phovea_core/src/table';
import {IAnyVector} from 'phovea_core/src/vector';
import {list as listData, getFirstByName} from 'phovea_core/src/data';
import * as csvUrl from 'file-loader!../data/number_one_artists.csv';
import {tsv} from 'd3-request';
import {ICategoricalVector} from '../../phovea_core/src/vector/IVector';
import {VALUE_TYPE_CATEGORICAL} from '../../phovea_core/src/datatype';


export default class dataExplorations {

  constructor() {

  }

  destroy() {

  }

  offline: boolean = false;
  table: ITable;


  /**
   *
   * This function demonstrates the use of a heterogeneous table.
   *
   * The relevant Phovea Classes:
   *
   * Accessing datasets using various functions:
   * https://github.com/phovea/phovea_core/blob/develop/src/data.ts

   * The phovea table interface:
   * https://github.com/phovea/phovea_core/blob/develop/src/table.ts
   *
   * The phovea vector:
   * https://github.com/phovea/phovea_core/blob/develop/src/vector/IVector.ts
   *
   */

  public async demoDatasets(table: ITable) {
    console.log("Trying to list data");


    // this is true in the server case, when we don't want to pass a dataset into this.
    if (table == null) {
      // listData() returns a list of all datasets loaded by the server
      // notice the await keyword - you'll see an explanation below
      let all_datasets = await listData();
      console.log("All loaded datasets:");
      console.log(all_datasets);

      // we could use those dataset to filter them based on their description and pick the one(s) we're interested in

      // here we pick the first dataset and cast it to ITable - by default the datasets are returned as IDataType
      table = <ITable> all_datasets[0];

      // retrieving a dataset by name
      table = <ITable> await getFirstByName("Artists")
      console.log("Artists dataset retrieved by name:")
      console.log(table);


    }
    else {
      console.log("The Table as passed via parameter:");
      console.log(table);
    }
    // Accessing the description of the dataset:
    console.log("Table description:")
    console.log(table.desc);
    // Printing the name
    console.log("Table Name: " + table.desc.name);

    // Here we retrieve the first vector from the table.
    let vector = table.col(0);
    console.log("Length:" + vector.length);
    console.log("IDType:" + vector.idtype);

    // whenever you access raw data, the data structures return promises, not the data directly.
    // what you do is, you call a then function which takes a callback as a parameter.
    // This handles the "good" case and passes the data in.
    // You should also handle the "bad" case in a catch function:
    const first_promise = vector.at(0).then(
      function (d) {
        console.log("The data:")
        console.log(d);
        return d;
      })
      .catch(function (error) {
        console.log("Error: " + error);
      });

    // Here is exactly the same code using the arrow notation, for the second element in the vector.
    const second_promise = vector.at(1).then((d) => d)
      .catch((err) => console.log("Error: " + err));

    Promise.all([first_promise, second_promise]).then(values => {
      console.log("First Element: " + values[0]);
      console.log("Second Element: " + values[1]);
      // all the return values of the promises
      console.log(values);
    }).catch((err) => console.log(err));


    // a new feature is the await keyword, which makes all of this a lot easier to read:
    const thirdElement = await vector.at(2);
    const fourthElement = await vector.at(3);

    console.log('Third Element: ' + thirdElement);
    console.log('Fourth Element: ' + fourthElement);

    // Here we directly access the first element in the first vector:
    const first_value_of_first_vector = await table.at(0, 0);
    console.log('Accessing the Table for the first element: ' + first_value_of_first_vector);


    // We retrieve the columns with index 0 and one by using a range operator that we pass as a string.
    console.log("First two columns using ranges:");
    console.log(table.cols("0:2"));

    console.log("Get the columns based on a list of indices:");
    console.log(table.cols([1, 4, 7]));

    console.log("A slice of the data of column 1 from index 7 to (not including) 12 as an array:");
    // this array can be directly used to map to d3
    console.log(await table.col(1).data("7:12"));

    console.log("The data type of the fourth column (categories):")
    console.log(table.col(3).desc.value.type);

    if (table.col(3).desc.value.type == VALUE_TYPE_CATEGORICAL) {
      let catVector = <ICategoricalVector> table.col(3);
      console.log("The categories of the fourth column:")
      // these also contain colors that can be easily used in d3.
      console.log(catVector.desc.value.categories);
      // FIXME this doesn't contain bins?
      console.log(await catVector.hist());
    }

    // TODO: access a vector by name

    // TODO: slice a vector by range

    // TODO: get a summary statistic on views

  }

  public async loadLocalData() {
    // Here we demonstrate how to parse a local table.
    // To do that, put your data file and your json data description in the top-level data directory.
    // Import the CSV's url using the import statement (see above)
    // import * as csvUrl from 'file-loader!../data/number_one_artists.csv';
    // The "file-loader! is a webpack feature to load the file TODO: more background?

    const loading = new Promise((resolve, reject) => {
      tsv(csvUrl, (error, data) => {
        if (error) {
          reject(error);
        }
        resolve(data);
      });
    });
    loading
      .then(asTable)
      .then((table: ITable) => {

        Promise.all([table.data(), table.cols()]).then(function (args) {
          console.log(table);
          // FIXME: this table seems to be initialized but not have any data as payload?
          table.at(0, 0).then(value => {
            console.log('Accessing the Table for the first element: ' + value);
          }).catch(err => console.log(err));
          this.demoDatasets(table);
        });
      })
    // .then((args: any[]) => {
    //   const data: any[] = args[0];
    //   console.log('All table data: ' + data.toString());
    //   const cols: IAnyVector[] = args[1];
    //   const firstColumnVector = cols[0];
    //   firstColumnVector.data().then((vectorData) => {
    //     console.log('Data of first Column: ' + vectorData.toString());
    //   });
    // });
  }

}


/**
 * Method to create a new graphData instance

 * @returns {graphData}
 */
export function create() {

  return new dataExplorations();
}
