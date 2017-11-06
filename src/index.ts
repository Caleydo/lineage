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
  select
} from 'd3-selection';
// import './open-iconic-bootstrap.scss'
import {create as createApp} from './app';
import {create as createHeader, AppHeaderLink} from 'phovea_ui/src/header';
import {APP_NAME} from './language';

import LoginMenu from 'phovea_security_flask/src/LoginMenu';
import {currentUser, isLoggedIn} from 'phovea_core/src/security';

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
  select('#app').append('div').attr('id','loading').append('h1').style('margin','5px').html('Loading ...');

  select('#app').append('div').attr('class','busy');

  if (select('#graphDiv').empty()) {
    appInstance.init();
  }
});

menu.on(LoginMenu.EVENT_LOGGED_OUT, () => {
  console.assert(!isLoggedIn());
  select('#data_selection').html('');
  select('#graph').html('');
  select('#table').html('');

  select('#app').append('div').attr('id','loading').append('h1').style('margin','5px').html('You have logged out...');

});


// createHeader(
//   <HTMLElement>document.querySelector('#caleydoHeader'),
//   { appLink: new AppHeaderLink(APP_NAME) }
// );

const parent = document.querySelector('#app');
appInstance = createApp(parent);
