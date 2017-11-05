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
  // appInstance.init();
});

menu.on(LoginMenu.EVENT_LOGGED_OUT, () => {
  console.assert(!isLoggedIn());
});


// createHeader(
//   <HTMLElement>document.querySelector('#caleydoHeader'),
//   { appLink: new AppHeaderLink(APP_NAME) }
// );

const parent = document.querySelector('#app');
appInstance = createApp(parent);
