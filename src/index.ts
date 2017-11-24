/**
 * Created by Caleydo Team on 31.08.2016.
 */

import 'file-loader?name=index.html!extract-loader!html-loader!./index.html';
import 'file-loader?name=404.html-loader!./404.html';
import 'file-loader?name=robots.txt!./robots.txt';
import 'phovea_ui/src/_bootstrap';
import './style.scss';

// import 'file-loader?name=treeLegend.svg!./treeLegend.svg';
import * as icon from 'html-loader!./icon-database.html';

import {
  select,
  selectAll
} from 'd3-selection';
// import './open-iconic-bootstrap.scss'
import { create as createApp } from './app';
import { create as createHeader, AppHeaderLink } from 'phovea_ui/src/header';
import { APP_NAME } from './language';

import LoginMenu from 'phovea_security_flask/src/LoginMenu';
import { currentUser, isLoggedIn } from 'phovea_core/src/security';

let appInstance;
const header = createHeader(
  <HTMLElement>document.querySelector('#caleydoHeader'),
  { appLink: new AppHeaderLink(APP_NAME) }
);

const menu = new LoginMenu(header);
header.insertCustomRightMenu(menu.node);

menu.on(LoginMenu.EVENT_LOGGED_IN, () => {
  console.assert(isLoggedIn());
  console.log(currentUser());
  select('#loading').remove();
  select('#app').append('div').attr('id', 'loading').append('h1').style('margin', '5px').html('Loading ...');

  select('#app').append('div').attr('class', 'busy');

  if (select('#graphDiv').empty()) {
    appInstance.init();
  }
});

menu.on(LoginMenu.EVENT_LOGGED_OUT, () => {
  console.assert(!isLoggedIn());
  select('#data_selection').html('');
  select('#graph').html('');
  select('#table').html('');

  select('#app').append('div').attr('id', 'loading').append('h1').style('margin', '5px').html('You have logged out...');

});


//Add a Dataset Picker
const datasetPicker = select('.navbar-collapse')
.append('ul').attr('class', 'nav navbar-nav navbar-left').attr('id', 'datasetPicker');

const dropdownList = datasetPicker.append('li').attr('class', 'dropdown');
dropdownList
      .append('a')
      .attr('class', 'dropdown-toggle')
      .attr('data-toggle', 'dropdown')
      .attr('role', 'button')
      .html('Pick Dataset')
      .append('span')
      .attr('class', 'caret');

    const dataMenu = dropdownList.append('ul').attr('class', 'dropdown-menu');


    let menuItems = dataMenu.selectAll('.datasetMenuItem')
      .data([
        {'title':'Suicide Families (10)','file':''},
        {'title':'Suicide Families (550)','file':''},
        {'title':'Autism Families','file':''}]);

    menuItems = menuItems.enter()
      .append('li')
      .append('a')
      .attr('class', 'datasetMenuItem')
      .classed('active', false)
      .html((d:any) => { return d.title; })
      .merge(menuItems);

      menuItems.on('click',function(d){
        selectAll('.datasetMenuItem').classed('active',false);
        select(this).classed('active',true);});


// createHeader(
//   <HTMLElement>document.querySelector('#caleydoHeader'),
//   { appLink: new AppHeaderLink(APP_NAME) }
// );

const parent = document.querySelector('#app');
appInstance = createApp(parent);
