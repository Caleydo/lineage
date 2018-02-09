/**
 * Creates an arrayVector
 */

import * as desc from './ArrayDesc';


class ArrayVector {

    public desc = desc.create();

    public dataValues=[];
    public nameValues=[];

    public data;
    public names;
    public ids;
    public stats;
    public hist;

    constructor() {

      this.data =  async ()=> {return this.dataValues;};
      this.names = async ()=> {return this.nameValues;};
      this.ids = async ()=>  {return [];};
      this.stats= async ()=> {return Promise.reject;};
      this.hist = async (d)=> {return Promise.reject;};

    };
}

/**
 * Factory method to create a new instance of the attributePanel
 * @param parent
 * @param options
 * @returns {arrayVector}
 */
export function create() {
    return new ArrayVector();
}
