import {ITable, asTable} from 'phovea_core/src/table';
import {IAnyVector} from 'phovea_core/src/vector';
import {list as listData, getFirstByName, get as getById} from 'phovea_core/src/data';
import * as csvUrl from 'file-loader!../data/number_one_artists.csv';
import {tsv} from 'd3-request';
import {ICategoricalVector, INumericalVector} from 'phovea_core/src/vector/IVector';
import {VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT} from 'phovea_core/src/datatype';


export default class DataExplorations {


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

    console.log('=============================');
    console.log('RETRIEVING DATA');
    console.log('=============================');


    // this is true in the server case, when we don't want to pass a dataset into this.
    if (table == null) {
      // listData() returns a list of all datasets loaded by the server
      // notice the await keyword - you'll see an explanation below
      const allDatasets = await listData();
      console.log('All loaded datasets:');
      console.log(allDatasets);

      // we could use those dataset to filter them based on their description and pick the one(s) we're interested in

      // here we pick the first dataset and cast it to ITable - by default the datasets are returned as IDataType
      table = <ITable> allDatasets[0];

      // retrieving a dataset by name
      table = <ITable> await getFirstByName('Artists');
      console.log('Artists dataset retrieved by name:');
      console.log(table);


    } else {
      console.log('The Table as passed via parameter:');
      console.log(table);
    }

    console.log('=============================');
    console.log('ACCESSING METADATA');
    console.log('=============================');

    // Accessing the description of the dataset:
    console.log('Table description:');
    console.log(table.desc);
    // Printing the name
    console.log('Table Name: ' + table.desc.name);


    console.log('=============================');
    console.log('ACCESSING COLUMNS/VECTORS');
    console.log('=============================');

    // Here we retrieve the first vector from the table.
    const vector = table.col(0);
    console.log('The first vector:');
    console.log(vector);
    console.log('Length:' + vector.length);
    console.log('IDType:' + vector.idtype);

    // TODO: retrieve a vector by name

    // Access the data of a vector by name:
    console.log('Accessing a the data of a column by name:');
    console.log(await table.colData('artist'));


    console.log('=============================');
    console.log('ACCESSING RAW DATA');
    console.log('=============================');


    // whenever you access raw data, the data structures return promises, not the data directly.
    // what you do is, you call a then function which takes a callback as a parameter.
    // This handles the 'good' case and passes the data in.
    // You should also handle the 'bad' case in a catch function:
    const firstPromise = vector.at(0).then(
      function (d) {
        console.log('The data:');
        console.log(d);
        return d;
      })
      .catch(function (error) {
        console.log('Error: ' + error);
      });

    // Here is exactly the same code using the arrow notation, for the second element in the vector.
    const secondPromise = vector.at(1).then((d) => d)
      .catch((err) => console.log('Error: ' + err));

    Promise.all([firstPromise, secondPromise]).then((values) => {
      console.log('First Element: ' + values[0]);
      console.log('Second Element: ' + values[1]);
      // all the return values of the promises
      console.log(values);
    }).catch((err) => console.log(err));


    // a new feature is the await keyword, which makes all of this a lot easier to read:
    const thirdElement = await vector.at(2);
    const fourthElement = await vector.at(3);

    console.log('Third Element: ' + thirdElement);
    console.log('Fourth Element: ' + fourthElement);

    // Here we directly access the first element in the first vector:
    const firstValueOfFirstVector = await table.at(0, 0);
    console.log('Accessing the Table for the first element: ' + firstValueOfFirstVector);

    console.log('=============================');
    console.log('SLICING, SELECTIVE ACCESS');
    console.log('=============================');

    // We retrieve the columns with index 0 and one by using a range operator that we pass as a string.
    console.log('First two columns using ranges:');
    console.log(table.cols('0:2'));

    console.log('Get the columns based on a list of indices:');
    console.log(table.cols([1, 4, 7]));

    console.log('A slice of the data of column 1 from index 7 to (not including) 12 as an array:');
    // this array can be directly used to map to d3
    console.log(await table.col(1).data('7:12'));


    console.log('=============================');
    console.log('CATEGORICAL VECTORS & STATS');
    console.log('=============================');


    console.log('The data type of the fourth column (categories):');
    console.log(table.col(3).desc.value.type);

    if (table.col(3).desc.value.type === VALUE_TYPE_CATEGORICAL) {
      const catVector = <ICategoricalVector> table.col(3);
      console.log('The categories of the fourth column:');
      // these also contain colors that can be easily used in d3.
      console.log(catVector.desc.value.categories);
      console.log('The histogram: BROKEN');
      console.log(await catVector.hist());
    }


    console.log('=============================');
    console.log('NUMERICAL VECTORS & STATS');
    console.log('=============================');

    if (table.col(5).desc.value.type === VALUE_TYPE_INT) {
      const numVector = <INumericalVector> table.col(5);
      console.log('3rd value from the 5th vector:' + await numVector.at(3));
      console.log('Stats on a vector:');
      console.log(await numVector.stats());
    }

    console.log('=============================');
    console.log('VIEWS');
    console.log('=============================');

    // A view represents a subset of a table. Subsets can be defined via rows and/or columns.
    // So, in a 10x100 table, I can pick columns 2, 4 and rows, 2-5 and 70-90.
    // It behaves exactly like a regular table.

    console.log('New view on a table that only contains the first two columns:');
    let slicedTable = table.view('(0:-1),(0:2)');
    console.log(slicedTable);

    console.log('New view on a table that only contains the first two columns and the first five rows:');
    slicedTable = table.view('(0,1,2,3,4),(0:2)');
    console.log(slicedTable);


  }

  public async demoGenealogyData() {
    const table = <ITable> await getById('big-decent-clipped-38');
    console.log('Genealogy Data');
    console.log(table);
    //   console.log(table.colData('RelativeID'));
  }


  public async loadLocalData() {
    function tsvAsync(url) {
      return new Promise<any[]>((resolve, reject) => {
        tsv(url, (error, data) => {
          if (error) {
            reject(error);
          }
          resolve(data);
        });
      });
    }
    const data = await tsvAsync(csvUrl);
    const table = asTable(data);
    this.demoDatasets(table);
    return table;
  }

//   public async loadLocalData() {
//     // Here we demonstrate how to parse a local table.
//     // To do that, put your data file and your json data description in the top-level data directory.
//     // Import the CSV's url using the import statement (see above)
//     // import * as csvUrl from 'file-loader!../data/number_one_artists.csv';
//     // The 'file-loader! is a webpack feature to load the file TODO: more background?
//
//     const loading = new Promise((resolve, reject) => {
//       tsv(csvUrl, (error, data) => {
//         if (error) {
//           reject(error);
//         }
//         resolve(data);
//       });
//     });
//     loading
//       .then(asTable)
//       .then((table: ITable) => {
//
//         Promise.all([table.data(), table.cols()]).then(function (args) {
//           console.log(table);
//           // FIXME: this table seems to be initialized but not have any data as payload?
//           table.at(0, 0).then((value) => {
//             console.log('Accessing the Table for the first element: ' + value);
//           }).catch((err) => console.log(err));
//           this.demoDatasets(table);
//         });
//       });
//     // .then((args: any[]) => {
//     //   const data: any[] = args[0];
//     //   console.log('All table data: ' + data.toString());
//     //   const cols: IAnyVector[] = args[1];
//     //   const firstColumnVector = cols[0];
//     //   firstColumnVector.data().then((vectorData) => {
//     //     console.log('Data of first Column: ' + vectorData.toString());
//     //   });
//     // });
//   }
//
// }
}

/**
 * Method to create a new graphData instance
 * @returns {graphData}
 */
export function create() {

  return new DataExplorations();
}
