import * as events from 'phovea_core/src/event';
import { select, selectAll } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { max } from 'd3-array';
import { event } from 'd3-selection';
import * as _ from 'underscore';
import { FAMILY_INFO_UPDATED } from './tableManager';
/**
 * Creates the family selector view
 */
var FamilySelector = /** @class */ (function () {
    function FamilySelector(parent) {
        this.peopleScale = scaleLinear(); //yscale for # of people
        this.casesScale = scaleLinear(); //yscale for cases
        this.selectedFamilyIds = []; //array of selected families
        this.headerInfo = [
            { header: ' ', dataAttr: undefined },
            { header: 'ID', dataAttr: 'id' },
            { header: '#People', dataAttr: 'size' },
            { header: '#POI', dataAttr: 'percentage' }
        ];
        this.lazyLoad = _.debounce(this.loadFamily, 300, true);
        this.$node = select(parent);
    }
    /**
     * Initialize the view and return a promise
     * that is resolved as soon the view is completely initialized.
     * @returns {Promise<FamilySelector>}
     */
    FamilySelector.prototype.init = function (tableManager) {
        var _this = this;
        this.tableManager = tableManager;
        this.build();
        // this.updateTable();
        events.on(FAMILY_INFO_UPDATED, function (evt, tableManagerObject) {
            _this.updateTable();
        });
        // return the promise directly as long there is no dynamical data to update
        return Promise.resolve(this);
    };
    /**
     * Build the basic DOM elements and binds the change function
     */
    FamilySelector.prototype.build = function () {
        select('#collapseTableButton').on('click', function () {
            var text = select('#collapseTableButton').html();
            if (text === 'Expand') {
                select('#collapseTableButton').html('Collapse');
                select('#col1').attr('id', 'col1-expanded');
            }
            else {
                select('#collapseTableButton').html('Expand');
                select('#col1-expanded').attr('id', 'col1');
            }
        });
        var table = select('#familySelector')
            .append('div')
            .attr('id', 'tableHead')
            .append('table')
            .attr('class', 'table');
        table.append('thead').append('tr');
        table.append('tbody').style('background', 'rgb(155, 173, 185)');
        var tbody = select('#familySelector')
            .append('div')
            .attr('id', 'tableBody')
            .append('table')
            .attr('class', 'table');
        // tbody.append('thead').append('tr');
        tbody.append('tbody');
    };
    /**
     * Build the table and populate with list of families.
     */
    FamilySelector.prototype.updateTable = function () {
        var _this = this;
        var self = this;
        // this.familyInfo = this.tableManager.familyInfo;
        var data = this.tableManager;
        var attrCols = this.tableManager.familyInfo[0].starCols.map(function (attr) {
            return { header: attr.attribute, dataAttr: attr.attribute };
        });
        var tableHeaders = this.headerInfo.concat(attrCols);
        var maxValue = max(data.familyInfo, function (d) {
            return +d.size;
        });
        this.peopleScale.range([0, 100]).domain([0, maxValue]);
        maxValue = max(data.familyInfo, function (d) {
            return +d.affected;
        });
        this.casesScale.range([0, 50]).domain([0, maxValue]);
        //Upate Header
        var headers = this.$node
            .select('#tableHead')
            .select('tr')
            .selectAll('th')
            .data(tableHeaders);
        var headerEnter = headers.enter().append('th');
        headers.exit().remove();
        headers = headerEnter.merge(headers);
        headers
            .style('width', function (d, i) {
            var width = i < 2 ? 10 : 90 / (tableHeaders.length - 2);
            return width + '%';
        })
            .on('click', function (d) {
            var isAscending = select(this).classed('des');
            if (isAscending) {
                self.rows.sort(function (a, b) {
                    if (b[d.dataAttr] > a[d.dataAttr]) {
                        return -1;
                    }
                    else {
                        return 1;
                    }
                });
                selectAll('th').classed('des', false);
                selectAll('th').classed('aes', false);
                select(this).attr('class', 'aes');
            }
            else {
                self.rows.sort(function (a, b) {
                    if (b[d.dataAttr] < a[d.dataAttr]) {
                        return -1;
                    }
                    else {
                        return 1;
                    }
                });
                selectAll('th').classed('des', false);
                selectAll('th').classed('aes', false);
                select(this).attr('class', 'des');
            }
        });
        headers
            .text(function (column) {
            return column.header;
        })
            .style('text-align', 'center');
        var rowData = this.tableManager.familyInfo.map(function (d) {
            var baseObject = {
                id: d.id,
                size: d.size,
                // 'selected': false,
                affected: d.affected,
                percentage: Math.round(d.percentage * 1000) / 10,
                starCols: d.starCols
            };
            d.starCols.map(function (attr) {
                baseObject[attr.attribute] = attr.percentage;
            });
            return baseObject;
        });
        this.populateTableRows('#tableBody', rowData, tableHeaders.length - 2);
        var selectedRows = rowData.filter(function (row) {
            return _this.selectedFamilyIds.indexOf(row.id) > -1;
        });
        this.populateTableRows('#tableHead', selectedRows, tableHeaders.length - 2);
        select('#tableBody')
            .select('tbody')
            .selectAll('tr')
            .classed('selected', function (d) {
            return _this.selectedFamilyIds.indexOf(d.id) > -1;
        });
        selectAll('.addRemoveIcon').on('click', function (d) {
            event.stopPropagation();
            _this.selectRow(d, rowData, tableHeaders.length - 2);
        });
        if (selectAll('.selected').size() === 0) {
            console.log('emptyFamily!');
            this.selectRow({ id: data.familyInfo[0].id }, rowData, tableHeaders.length - 2, false);
        }
    };
    FamilySelector.prototype.selectRow = function (familyID, rowData, numCols, update) {
        var _this = this;
        if (update === void 0) { update = true; }
        console.log(familyID);
        var thisIcon = select('#tableBody')
            .select('tbody')
            .selectAll('.addRemoveIcon')
            .filter(function (row) {
            return row.id === familyID.id;
        });
        var toRemove = thisIcon.html() === '\uf056';
        thisIcon.html(toRemove ? '\uf055' : '\uf056');
        if (!toRemove) {
            this.selectedFamilyIds.push(familyID.id);
        }
        else {
            this.selectedFamilyIds.splice(this.selectedFamilyIds.indexOf(familyID.id), 1);
        }
        select('#tableBody')
            .select('tbody')
            .selectAll('tr')
            .filter(function (row) {
            return row.id === familyID.id;
        })
            .classed('selected', !toRemove);
        var selectedRows = rowData.filter(function (row) {
            return _this.selectedFamilyIds.indexOf(row.id) > -1;
        });
        this.populateTableRows('#tableHead', selectedRows, numCols);
        if (update) {
            this.loadFamily();
        }
    };
    FamilySelector.prototype.populateTableRows = function (tableSelector, rowData, numCols) {
        var _this = this;
        // create a row for each object in the data
        var rows = select(tableSelector)
            .select('tbody')
            .selectAll('tr')
            .data(rowData);
        var rowsEnter = rows.enter().append('tr');
        rows.exit().remove();
        rows = rowsEnter.merge(rows);
        rows.on('click', function (d) {
            //set all icons to +
            select('#tableBody')
                .select('tbody')
                .selectAll('.addRemoveIcon')
                .html('\uf055');
            //Set this icon to -
            select('#tableBody')
                .select('tbody')
                .selectAll('.addRemoveIcon')
                .filter(function (row) {
                return row.id === d.id;
            })
                .html('\uf056');
            _this.selectedFamilyIds = [];
            _this.selectedFamilyIds.push(d.id);
            select('#tableBody')
                .select('tbody')
                .selectAll('tr')
                .classed('selected', false);
            select('#tableBody')
                .select('tbody')
                .selectAll('tr')
                .filter(function (row) {
                return row.id === d.id;
            })
                .classed('selected', true);
            var selectedRows = rowData.filter(function (row) {
                return _this.selectedFamilyIds.indexOf(row.id) > -1;
            });
            _this.populateTableRows('#tableHead', selectedRows, numCols);
            _this.loadFamily();
        });
        if (tableSelector === '#tableBody') {
            this.rows = rows;
        }
        //
        // create a cell in each row for each column
        var cells = rows.selectAll('td').data(function (d) {
            var baseValues = [
                { id: d.id, value: undefined, type: 'button' },
                { id: d.id, value: d.id, type: 'id' },
                { id: d.id, value: d.size, type: 'size' },
                {
                    id: d.id,
                    value: { affected: d.affected, percentage: d.percentage },
                    type: 'affected'
                }
            ];
            d.starCols.map(function (attr) {
                var newValue = {
                    id: d.id,
                    value: {
                        affected: attr.count,
                        percentage: Math.round(attr.percentage * 1000) / 10
                    },
                    type: 'affected'
                };
                baseValues.push(newValue);
            });
            return baseValues;
        });
        var cellsEnter = cells.enter().append('td');
        cells.exit().remove();
        cells = cellsEnter.merge(cells);
        cells
            .style('width', function (d, i) {
            var width = i < 2 ? 10 : 90 / numCols;
            return width + '%';
        })
            .style('text-align', 'center');
        // selectAll('td').each(function (cell: any) {
        //   if (cell.type === 'size') {
        //     if (select(this).selectAll('svg').size() === 0) {
        //       const svg = select(this).append('svg');
        //       svg.append('rect').classed('total', true);
        //       svg.append('rect').classed('poi', true);
        //     }
        //     if (select(this).select('svg').selectAll('text').size() === 0) {
        //       select(this).select('svg').append('text');
        //     }
        //     select(this).select('svg')
        //       .data([cell.value])
        //       .attr('width', () => {
        //         return 110; //self.peopleScale.range()[1] + 70;
        //       })
        //       .attr('height', 12);
        //     select(this).select('svg').select('.total')
        //       .data([cell.value])
        //       .attr('width', (d: any) => {
        //         return self.peopleScale(d);
        //       })
        //       .attr('height', 10);
        //     select(this).select('svg').select('.poi')
        //       .data([cell.value])
        //       .attr('width', (d: any) => {
        //         return self.peopleScale(d);
        //       })
        //       .attr('height', 10);
        //     select(this)
        //       .select('text')
        //       .data([cell.value])
        //       .attr('dy', 10)
        //       .attr('dx', (d: any) => {
        //         return self.peopleScale(d) + 4;
        //       })
        //       .text((d: any) => {
        //         return d + ' (' + Math.floor(d / 5) + ')';
        //       })
        //       .attr('fill', (d, i) => {
        //         return (i > 3 && d > 15) ? 'red' : 'gray';
        //       });
        //   } else if (cell.type === 'affected') {
        //     if (select(this).selectAll('svg').size() === 0) {
        //       const svg = select(this).append('svg');
        //       svg.append('rect').classed('poi', true);
        //     }
        //     if (select(this).select('svg').selectAll('text').size() === 0) {
        //       select(this).select('svg').append('text');
        //     }
        //     select(this).select('svg')
        //       .data([cell.value])
        //       .attr('width', () => {return self.casesScale.range()[1] + 100;})
        //       .attr('height', 12);
        //     select(this).select('svg').select('.poi')
        //       .data([cell.value])
        //       .attr('width', (d: any) => {
        //         return self.casesScale(d.affected);
        //       })
        //       .attr('height', 10);
        //     select(this)
        //       .select('text')
        //       .data([cell.value])
        //       .attr('dy', 10)
        //       .attr('dx', (d: any) => {
        //         return self.casesScale(d.affected) + 4;
        //       })
        //       .text((d: any) => {
        //         return d.affected + ' (' + Math.round(d.percentage*1000)/10 + '%)';
        //       })
        //       .attr('fill', (d, i) => {
        //         return (i > 3 && d > 15) ? 'red' : 'gray';
        //       });
        //   }
        // });
        cells
            .filter(function (c) {
            return c.type === 'affected';
        })
            // cells
            .html(function (d) {
            return d.value.affected.toString() + ' (' + d.value.percentage + '%)';
        })
            .style('text-align', 'center');
        cells
            .filter(function (c) {
            return c.type === 'id' || c.type === 'size';
        })
            // cells
            .html(function (d) {
            return d.value.toString();
        })
            .style('text-align', 'center');
        cells
            .filter(function (c) {
            return c.type === 'button';
        })
            .html(function (d) {
            return tableSelector === '#tableHead'
                ? '\uf056'
                : _this.selectedFamilyIds.indexOf(d.id) > -1
                    ? '\uf056'
                    : '\uf055';
        })
            .style('text-align', 'center')
            .attr('class', 'addRemoveIcon');
    };
    FamilySelector.prototype.loadFamily = function () {
        console.log('calling loadFamily');
        this.tableManager.selectFamily(this.selectedFamilyIds);
    };
    return FamilySelector;
}());
/**
 * Factory method to create a new instance of the attributePanel
 * @param parent
 * @param options
 * @returns {attributePanel}
 */
export function create(parent) {
    return new FamilySelector(parent);
}
//# sourceMappingURL=familySelector.js.map