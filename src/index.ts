/**
 * Created by Caleydo Team on 31.08.2016.
 */

import 'file-loader?name=index.html!extract-loader!html-loader!./index.html';
import 'file-loader?name=404.html-loader!./404.html';
import 'file-loader?name=robots.txt!./robots.txt';
import 'phovea_ui/src/_bootstrap';
import './style.scss';
import {create as createApp} from './app';
import {create as createHeader, AppHeaderLink} from 'phovea_ui/src/header';
import {APP_NAME} from './language';
import {
  select,
  selectAll,
  selection,
  mouse,
  event
} from 'd3-selection';
const header = createHeader(
  <HTMLElement>document.querySelector('#caleydoHeader'),
  {appLink: new AppHeaderLink(APP_NAME)}
);

console.log(header.aboutDialog);

const dialogContent = header.aboutDialog.getElementsByTagName('div')[0];
dialogContent.innerHTML = `
<div>
    <h2 style="font-size: 1.3em">Lineage: Visualizing Multivariate Clinical Data in Genealogy Graphs</h2>
             <p>
                Lineage is developed by Carolina Nobre and Alexander Lex at the <a href="http://vdl.sci.utah.edu">Visualization
                Design Lab</a>, University of Utah, with contributions form <a href="http://gehlenborglab.org">Nils
                Gehlenborg</a>, Harvard Medical School, and Hilary Coon, Department of Psychiatry, University of Utah.
            </p>
            <p><b>Details on the associated publication and acknowledgements of other contributors are availabe on the <a href="http://vdl.sci.utah.edu/publications/2017_preprint_lineage/">VDL website</a>.</b></p>
            <p>A video that provides an overview of Lineage is available on <a href="https://www.youtube.com/watch?v=35oa5IvgtS0">YouTube</a>.</p>   
            <p>The dataset provided is an anonymized subset of ten families from a suicide study based on the <a href="https://healthcare.utah.edu/huntsmancancerinstitute/research/updb/">Utah Population Database.</a></p>
</div>
`;

const parent = document.querySelector('#app');
createApp(parent).init();
