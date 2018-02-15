/**
 * Creates an arrayVector
 */

import * as desc from './ArrayDesc';


class ArrayVector {

    public desc;

    public dataValues=[];
    public idValues=[];

    public data;
    public names;
    public ids;
    public stats;
    public hist;

    constructor(type) {

      this.desc = desc.create(type);
      this.data =  async ()=> {return this.dataValues;};
      this.names = async ()=> {return this.idValues;};
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
export function create(type) {
    return new ArrayVector(type);
}
