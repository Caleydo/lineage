
import { VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT, VALUE_TYPE_REAL, VALUE_TYPE_STRING} from 'phovea_core/src/datatype';

import { VALUE_TYPE_ADJMATRIX} from './attributeTable';

/**
 * Creates an arrayVector
 */
class ArrayDesc {

    public name;

    public value;

    public arrayVec = true;



    constructor(type=VALUE_TYPE_ADJMATRIX) {
      
      if (type === VALUE_TYPE_CATEGORICAL || type === VALUE_TYPE_ADJMATRIX) {
        this.value= {
          categories:[
            {
              'color':'red',
              'name':'False'
            },
            {
              'color':'red',
              'name':'True'
            }
          ],
          type
        };
      } else  {
        this.value= {
          type
        };
    };
  };

    /**
     * Initialize the view and return a promise
     * that is resolved as soon the view is completely initialized.
     * @returns {Promise<arrayVector>}
     */
    // init() {

    // }
}

/**
 * Factory method to create a new instance of the attributePanel
 * @param parent
 * @param options
 * @returns {arrayDesc}
 */
export function create(type) {
    return new ArrayDesc(type);
}
