import { select } from 'd3-selection';
/**
 * Creates the attribute table view
 */
var AttributePanel = /** @class */ (function () {
    function AttributePanel(parent) {
        this.$node = select(parent);
    }
    /**
     * Initialize the view and return a promise
     * that is resolved as soon the view is completely initialized.
     * @returns {Promise<FilterBar>}
     */
    AttributePanel.prototype.init = function (tableManager, dataset) {
        if (dataset === 'suicide') {
            tableManager.setAffectedState('suicide');
        }
        else {
            tableManager.setAffectedState('affected');
        }
        // return the promise directly as long there is no dynamical data to update
        return Promise.resolve(this);
    };
    /**
     * Build the basic DOM elements and binds the change function
     */
    AttributePanel.prototype.build = function () {
        //Add Family Selector Nav Bar
        this.$node.append('nav').attr('class', 'navbar navbar-expand-lg navbar-light bg-light')
            .append('div').attr('id', 'tableNav');
        this.$node.select('#tableNav')
            .append('a').attr('class', 'navbar-brand')
            .html('Family Selector');
        var dropdownMenu = this.$node.select('.navbar')
            .append('ul').attr('class', 'nav navbar-nav');
        var list = dropdownMenu
            .append('li')
            .append('a')
            .attr('class', 'btn-link')
            .attr('role', 'button')
            .html('Expand')
            .attr('id', 'collapseTableButton');
        //Append div for Family Selector
        var familySelector = this.$node.append('div')
            .attr('id', 'familySelector');
    };
    return AttributePanel;
}());
/**
 * Factory method to create a new instance of the attributePanel
 * @param parent
 * @param options
 * @returns {AttributePanel}
 */
export function create(parent) {
    return new AttributePanel(parent);
}
//# sourceMappingURL=attributePanel.js.map