/**
 * Created by Asmaa Aljuhani on 01.30.2017 .
 */

import * as dataGenealogy from 'file-loader!./SuicideMasterList.csv';
import * as descGenealogy from './data_structure.json';
import * as sampleDataGenealogy from 'file-loader!./sampleData.csv';
import * as sampleDescGenealogy from './sample_data_structure.json';

export interface IDataSetSpec {
  id: string;
  name: string;
  desc: any;
  url: string;
}
const data: IDataSetSpec[] = [
  {
    id: 'attribute_panel_Data',
    name: 'Geneaology  Data',
    desc: descGenealogy,
    url: dataGenealogy
  },
  {
    id: 'sample_Data',
    name: 'Geneaology Sample Data',
    desc: sampleDescGenealogy,
    url: sampleDataGenealogy
  }
];

export default data;
