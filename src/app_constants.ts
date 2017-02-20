/**
 * Created by Holger Stitz on 26.08.2016.
 */

export class AppConstants {

  /**
   * Static constant as identification for views
   * Note: the string value is referenced for multiple view definitions in the package.json,
   *       i.e. be careful when refactor the value
   */
  static VIEW = 'Lineage';


  /**
   * Event that is fired when a data set collection has been selected
   * @type {string}
   */
  static EVENT_DATA_COLLECTION_SELECTED = 'eventDataCollectionSelected';

  /**
   * Event that is fired when a data set has been selected
   * @type {string}
   */
  static EVENT_DATASET_SELECTED = 'eventDataSetSelected';
  static EVENT_DATASET_SELECTED_LEFT = 'eventDataSetSelectedLeft';
  static EVENT_DATASET_SELECTED_RIGHT = 'eventDataSetSelectedRight';

  static EVENT_OPEN_2D_HISTOGRAM = 'open2DHistogram';
  static EVENT_CLOSE_2D_HISTOGRAM = 'close2DHistogram';

  static EVENT_TOGGLE_TIMELINE = 'toggleTimeline';
  static EVENT_TOGGLE_GROUP = 'toggleGroup';

  static EVENT_SHOW_CHANGE = 'showChange';
  static EVENT_HIDE_CHANGE = 'hideChange';


  /**
   * Format the date output (see http://momentjs.com/docs/#/displaying/)
   * @type {string}
   */
  static DATE_FORMAT = 'YYYY-MM-DD';

  /**
   * Parse the following date formats from strings using moment.js (see http://momentjs.com/docs/#/parsing/)
   * @type {string[]}
   */
  static PARSE_DATE_FORMATS = ['YYYY_MM_DD', 'YYYY-MM-DD'];
}

export interface IChangeType {
  type: string;
  ratioName: string;
  isActive: boolean;
}

export class ChangeTypes {

  static NO_CHANGE: IChangeType = {
    type: 'nochange',
    ratioName: 'no_ratio',
    isActive: true
  };

  static ADDED: IChangeType = {
    type: 'added',
    ratioName: 'a_ratio',
    isActive: true
  };

  static REMOVED: IChangeType = {
    type: 'removed',
    ratioName: 'd_ratio',
    isActive: true
  };

  static CONTENT: IChangeType = {
    type: 'content',
    ratioName: 'c_ratio',
    isActive: true
  };

  static TYPE_ARRAY: IChangeType[] = [ChangeTypes.NO_CHANGE, ChangeTypes.ADDED, ChangeTypes.REMOVED, ChangeTypes.CONTENT];

}
