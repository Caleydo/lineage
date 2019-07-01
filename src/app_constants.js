/**
 * Created by Holger Stitz on 26.08.2016.
 */
var AppConstants = /** @class */ (function () {
    function AppConstants() {
    }
    /**
     * Static constant as identification for views
     * Note: the string value is referenced for multiple view definitions in the package.json,
     *       i.e. be careful when refactor the value
     */
    AppConstants.VIEW = 'Lineage';
    /**
     * Event that is fired when a data set collection has been selected
     * @type {string}
     */
    AppConstants.EVENT_DATA_COLLECTION_SELECTED = 'eventDataCollectionSelected';
    /**
     * Event that is fired when a data set has been selected
     * @type {string}
     */
    AppConstants.EVENT_DATASET_SELECTED = 'eventDataSetSelected';
    AppConstants.EVENT_DATASET_SELECTED_LEFT = 'eventDataSetSelectedLeft';
    AppConstants.EVENT_DATASET_SELECTED_RIGHT = 'eventDataSetSelectedRight';
    AppConstants.EVENT_OPEN_2D_HISTOGRAM = 'open2DHistogram';
    AppConstants.EVENT_CLOSE_2D_HISTOGRAM = 'close2DHistogram';
    AppConstants.EVENT_TOGGLE_TIMELINE = 'toggleTimeline';
    AppConstants.EVENT_TOGGLE_GROUP = 'toggleGroup';
    AppConstants.EVENT_SHOW_CHANGE = 'showChange';
    AppConstants.EVENT_HIDE_CHANGE = 'hideChange';
    /**
     * Format the date output (see http://momentjs.com/docs/#/displaying/)
     * @type {string}
     */
    AppConstants.DATE_FORMAT = 'YYYY-MM-DD';
    /**
     * Parse the following date formats from strings using moment.js (see http://momentjs.com/docs/#/parsing/)
     * @type {string[]}
     */
    AppConstants.PARSE_DATE_FORMATS = ['YYYY_MM_DD', 'YYYY-MM-DD'];
    return AppConstants;
}());
export { AppConstants };
var ChangeTypes = /** @class */ (function () {
    function ChangeTypes() {
    }
    ChangeTypes.NO_CHANGE = {
        type: 'nochange',
        ratioName: 'no_ratio',
        isActive: true
    };
    ChangeTypes.ADDED = {
        type: 'added',
        ratioName: 'a_ratio',
        isActive: true
    };
    ChangeTypes.REMOVED = {
        type: 'removed',
        ratioName: 'd_ratio',
        isActive: true
    };
    ChangeTypes.CONTENT = {
        type: 'content',
        ratioName: 'c_ratio',
        isActive: true
    };
    ChangeTypes.TYPE_ARRAY = [ChangeTypes.NO_CHANGE, ChangeTypes.ADDED, ChangeTypes.REMOVED, ChangeTypes.CONTENT];
    return ChangeTypes;
}());
export { ChangeTypes };
//# sourceMappingURL=app_constants.js.map