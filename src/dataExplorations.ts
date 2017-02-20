import IDType from 'phovea_core/src/idtype/IDType';
import {ICategoricalVector, INumericalVector} from 'phovea_core/src/vector';
import {
  VALUE_TYPE_STRING, VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT, VALUE_TYPE_REAL,
  IDataType
} from 'phovea_core/src/datatype';
import {EventHandler} from 'phovea_core/src/event';
import {INumericalMatrix} from 'phovea_core/src/matrix';
import {IAnyVector} from 'phovea_core/src/vector';
import {list as listData, convertTableToVectors} from 'phovea_core/src/data';



export default class dataExplorations {

  constructor()
  {

  }

  destroy()
  {

  }

  public async listData()
  {
    console.log("Trying to list data")
    console.log(await listData());
  }

}

/**
 * Method to create a new graphData instance

 * @returns {graphData}
 */
export function create() {
  return new dataExplorations();
}
