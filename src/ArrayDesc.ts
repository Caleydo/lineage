/**
 * Creates an arrayVector
 */
class ArrayDesc {

    public name;

    public value;



    constructor() {

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
        type:'adjMatrix'
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
export function create() {
    return new ArrayDesc();
}
