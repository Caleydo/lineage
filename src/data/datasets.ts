/**
 * Created by Asmaa Aljuhani on 01.30.2017 .
 */

//import * as realData from './data_38';
import * as realDataDesc from './data_38_desc.json';

export interface IDataSetSpec {
  id: string;
  name: string;
  desc: any;
  url: string;
}
const data: IDataSetSpec[] = [
   {
    id: 'real_Data',
    name: 'Real Geneaology Sample Data',
    desc: realDataDesc,
    url: ""
  }
];

export default data;
